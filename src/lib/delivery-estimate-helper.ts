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
  OPTION_DELIVERY_IMPACT,
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
  /** Cross-service bundling marker — when set, the option shares the
   *  parent's processing slot, so the dedupe-by-code logic in mapOptions
   *  keeps the timeline honest. */
  bundled_for?: { parent_option_id?: string } | null;
  bundledFor?: { parentOptionId?: string } | null;
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
  /**
   * Min/max override for the core processing step — wins over `serviceDays`.
   * Civil-status services (naștere/căsătorie/celibat/extras multilingv) pass
   * the term tier resolved from the registration office here, because their
   * flat `estimated_days` doesn't reflect the promised 5-7/7-15/15-30 range.
   */
  serviceDaysRange?: { minDays: number; maxDays: number } | null;
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

  // Bundled add-ons share the parent's processing slot — dedupe by code
  // so each document step (traducere/legalizare/apostila*) counts once.
  const seenCodes = new Set<string>();

  return options
    .filter((opt) => !isUrgentOption(opt))
    .filter((opt) => {
      // Drop duplicates by code; OPTION_DELIVERY_IMPACT keys are unique so
      // we can use the code as the dedupe key. Options without a code fall
      // through (legacy rows with explicit impact still render).
      const code = (opt.code ?? '').toString().toLowerCase();
      if (code && OPTION_DELIVERY_IMPACT[code]) {
        if (seenCodes.has(code)) return false;
        seenCodes.add(code);
      }
      return true;
    })
    .map((opt) => {
      const explicitImpact = opt.delivery_days_impact ?? opt.deliveryDaysImpact;
      // Code-based lookup (centralized table in delivery-calculator) — fills
      // in traducere/legalizare/apostila_haga/apostila_notari when the order
      // row doesn't persist `delivery_days_impact`. Without this the
      // submission-time estimate was way too short ("2 zile" for an order
      // that actually takes 5-7).
      const code = (opt.code ?? '').toString().toLowerCase();
      const codeImpact = OPTION_DELIVERY_IMPACT[code];
      const inferredImpact =
        explicitImpact ??
        (isCetateanStrainOption(opt) ? CETATEAN_STRAIN_EXTRA_DAYS : undefined);
      const inferredRange = !explicitImpact && codeImpact
        ? { minDays: codeImpact.minDays, maxDays: codeImpact.maxDays }
        : null;
      return {
        name: opt.option_name ?? opt.optionName ?? opt.code ?? 'Opțiune',
        ...(inferredRange ?? { deliveryDaysImpact: inferredImpact }),
      };
    })
    // Keep entries with either a numeric impact OR an explicit min/max
    // range — both shapes are valid `DeliveryEstimateParams.options`.
    .filter((o) => {
      const oo = o as {
        deliveryDaysImpact?: number;
        minDays?: number;
        maxDays?: number;
      };
      return (
        (typeof oo.deliveryDaysImpact === 'number' && oo.deliveryDaysImpact !== 0) ||
        (typeof oo.minDays === 'number' && oo.minDays > 0) ||
        (typeof oo.maxDays === 'number' && oo.maxDays > 0)
      );
    });
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
  // When urgenta is picked, use the "urgent" urgency mode (1-2 zile RANGE)
  // instead of the service's flat urgentDays — this matches what the wizard
  // sidebar shows the customer via `estimateFromSelectedOptions`. Without
  // this alignment, the DB-persisted date (used by status page) was 1 day
  // ahead of what the customer was promised at checkout.
  const urgentSelected = hasUrgentSelection(input.selectedOptions);
  const baseDays = urgentSelected ? undefined : resolveBaseDays(input);
  const courier = normalizeCourierCode(input.deliveryMethod);
  const orderDate = typeof input.placedAt === 'string' ? new Date(input.placedAt) : input.placedAt;

  // Civil-status tier range wins over the flat serviceDays (those services
  // have no urgent path, so urgentSelected is never true for them).
  const baseRange =
    !urgentSelected && input.serviceDaysRange && input.serviceDaysRange.maxDays > 0
      ? input.serviceDaysRange
      : undefined;

  const estimate = calculateEstimatedCompletion({
    baseDays: baseRange ? undefined : baseDays,
    baseRange,
    urgency: urgentSelected ? 'urgent' : 'standard',
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
