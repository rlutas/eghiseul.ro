/**
 * Delivery Estimate Helper
 *
 * Thin adapter that maps an order row + its service row into
 * `DeliveryEstimateParams` for `calculateEstimatedCompletion`. Keeps the
 * integration points (Stripe webhook, manual confirm, submit, document
 * generator) DRY and free of ad-hoc selected-options parsing.
 *
 * Storage contract: callers persist the returned ISO string into
 * `orders.estimated_completion_date` (TIMESTAMPTZ). Display formatting is the
 * UI's concern — do not format here.
 */

import {
  calculateEstimatedCompletion,
  type DeliveryEstimate,
  type DeliveryEstimateParams,
} from '@/lib/delivery-calculator';

// ─── Input shapes (tolerant of legacy JSONB variants) ─────────────────────────

export interface SelectedOptionLike {
  option_id?: string;
  option_name?: string;
  optionName?: string;
  code?: string;
  quantity?: number;
  // Optional per-option impact, pre-resolved by the caller (e.g. joined from
  // service_options.config.delivery_days_reduction). When absent, we infer
  // only urgency from the option name.
  delivery_days_impact?: number;
  deliveryDaysImpact?: number;
}

/**
 * Shape of the delivery_method column / JSONB.
 *
 * Historical note: `delivery_method` is declared `string | null` in
 * `types/supabase.ts`, but in practice the app stores a JSON object with
 * `type`, `name`, `estimated_days`, etc. We accept both shapes and
 * normalise.
 */
export type DeliveryMethodLike =
  | string
  | null
  | undefined
  | {
      type?: string | null;
      name?: string | null;
      code?: string | null;
      provider?: string | null;
    };

export interface ComputeEstimateInput {
  /** When the order was placed/paid (used as the processing-start anchor). */
  placedAt: Date | string;
  /** Base service processing days (from `services.estimated_days`). */
  serviceDays?: number | null;
  /** Urgent-only override days (from `services.urgent_days`). Applied when an urgent option is selected. */
  urgentDays?: number | null;
  /** Whether the service exposes an urgent path. */
  urgentAvailable?: boolean | null;
  /** Selected service options from the order (any legacy JSONB shape). */
  selectedOptions?: SelectedOptionLike[] | null;
  /** Delivery method row — string code or JSON object. */
  deliveryMethod?: DeliveryMethodLike;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeOptionName(opt: SelectedOptionLike): string {
  return (opt.option_name ?? opt.optionName ?? opt.code ?? '').toString().toLowerCase();
}

function isUrgentOption(opt: SelectedOptionLike): boolean {
  const name = normalizeOptionName(opt);
  const code = (opt.code ?? '').toString().toLowerCase();
  return name.includes('urgent') || name.includes('urgenta') || code === 'urgenta' || code === 'urgent';
}

function hasUrgentSelection(options?: SelectedOptionLike[] | null): boolean {
  if (!options || options.length === 0) return false;
  return options.some(isUrgentOption);
}

/**
 * Foreign-citizen surcharge option. When selected, adds +7 business days
 * (pessimistic upper bound — matches cazierjudiciaronline.com 7-15 day
 * spread) to the processing window, on top of the base service days.
 *
 * Identified by:
 *   - code === 'cetatean_strain' (preferred, from DB)
 *   - OR option name containing 'cetățean străin' / 'cetatean strain'
 *     (fallback for legacy rows without a persisted code field)
 */
const CETATEAN_STRAIN_EXTRA_DAYS = 7;

function isCetateanStrainOption(opt: SelectedOptionLike): boolean {
  const code = (opt.code ?? '').toString().toLowerCase();
  if (code === 'cetatean_strain') return true;
  const name = normalizeOptionName(opt);
  // Tolerant to diacritics (ă -> a) and spacing variations.
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.includes('cetatean strain');
}

function normalizeCourierCode(dm: DeliveryMethodLike): string | null {
  if (!dm) return null;
  if (typeof dm === 'string') return dm;
  return dm.code ?? dm.provider ?? dm.type ?? dm.name ?? null;
}

/**
 * Resolve the core processing days for the order:
 *  - Urgent selected + urgent_available + urgent_days → urgent_days
 *  - else estimated_days (may be null; caller handles)
 */
function resolveBaseDays(input: ComputeEstimateInput): number | undefined {
  const urgentSelected = hasUrgentSelection(input.selectedOptions);
  if (urgentSelected && input.urgentAvailable && typeof input.urgentDays === 'number' && input.urgentDays > 0) {
    return input.urgentDays;
  }
  if (typeof input.serviceDays === 'number' && input.serviceDays > 0) {
    return input.serviceDays;
  }
  return undefined;
}

/**
 * Map selected options to `DeliveryEstimateParams.options`, excluding the
 * urgent option itself (urgency is already reflected in `baseDays`).
 *
 * Known code-based mappings that don't require `delivery_days_impact` to
 * be persisted on the order row:
 *   - `cetatean_strain` → +7 business days (IGI foreign-citizen checks)
 */
function mapOptions(options?: SelectedOptionLike[] | null): DeliveryEstimateParams['options'] {
  if (!options || options.length === 0) return [];
  return options
    .filter((opt) => !isUrgentOption(opt))
    .map((opt) => {
      const explicitImpact = opt.delivery_days_impact ?? opt.deliveryDaysImpact;
      // Fallback to code-based impact when the order row doesn't carry an
      // explicit impact number (the wizard doesn't persist this today).
      const inferredImpact =
        explicitImpact ??
        (isCetateanStrainOption(opt) ? CETATEAN_STRAIN_EXTRA_DAYS : undefined);
      return {
        name: opt.option_name ?? opt.optionName ?? opt.code ?? 'Opțiune',
        deliveryDaysImpact: inferredImpact,
      };
    })
    .filter((o) => typeof o.deliveryDaysImpact === 'number' && o.deliveryDaysImpact !== 0);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute a delivery estimate for an order + service bundle.
 *
 * Returns the full `DeliveryEstimate` (min/max + breakdown) AND a convenience
 * `estimatedCompletionISO` string suitable for writing into
 * `orders.estimated_completion_date` (TIMESTAMPTZ). We use the MAX date
 * (pessimistic) so the UI promise is safe.
 */
export function computeOrderEstimate(input: ComputeEstimateInput): {
  estimate: DeliveryEstimate;
  estimatedCompletionISO: string | null;
} {
  const baseDays = resolveBaseDays(input);
  const courier = normalizeCourierCode(input.deliveryMethod);
  const orderDate = typeof input.placedAt === 'string' ? new Date(input.placedAt) : input.placedAt;

  const estimate = calculateEstimatedCompletion({
    baseDays,
    options: mapOptions(input.selectedOptions),
    courier,
    orderDate,
  });

  // Pessimistic: use maxDate at end-of-day Romania-local as the persisted
  // timestamp. We stamp 18:00 Europe/Bucharest (16:00 UTC in winter, 15:00 UTC
  // in summer — we use a fixed UTC hour of 16:00 which maps to 18:00 or 19:00
  // RO depending on DST, close enough for a "by end of day" promise).
  let estimatedCompletionISO: string | null = null;
  if (estimate.maxDate) {
    estimatedCompletionISO = new Date(`${estimate.maxDate}T16:00:00Z`).toISOString();
  }

  return { estimate, estimatedCompletionISO };
}

/**
 * Convenience: compute and return just the ISO timestamp for DB storage.
 * Returns `null` if no usable baseDays are available (can't promise a date).
 */
export function computeEstimatedCompletionISO(input: ComputeEstimateInput): string | null {
  return computeOrderEstimate(input).estimatedCompletionISO;
}
