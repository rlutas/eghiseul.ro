/**
 * Order-level estimated-completion computation.
 *
 * Wraps `computeEstimatedCompletionISO` with the civil-status term-tier
 * resolution: naștere/căsătorie/celibat/extras multilingv promise a term that
 * depends on the registration office (`registrationPlace` → 5-7 / 7-15 /
 * 15-30 zile lucrătoare), while their `services.estimated_days` is a flat
 * number. Persisting off the flat number made the date on the status page /
 * generated documents / admin deadline alerts disagree with what the wizard
 * promised at checkout.
 *
 * Used by every place that stamps `orders.estimated_completion_date`:
 * Stripe webhook, manual confirm-payment, order submit, fulfil-paid.
 */

import {
  DEFAULT_CIVIL_TERM_TIERS,
  resolveCivilTermTier,
  type CivilTermTiers,
} from '@/lib/civil-status/delivery-terms';
import {
  computeEstimatedCompletionISO,
  type ComputeEstimateInput,
} from '@/lib/delivery-estimate-helper';
import { instantPlatformProvider } from '@/lib/services/platform-services';

/**
 * Extract the civil-status registration place from an order's customer_data.
 * The wizard persists it under `civil_status.registrationPlace` (snake_case
 * module key); tolerate the camelCase variant for older/draft rows.
 */
export function extractCivilRegistrationPlace(customerData: unknown): string | null {
  if (!customerData || typeof customerData !== 'object') return null;
  const cd = customerData as Record<string, unknown>;
  const civil = (cd.civil_status ?? cd.civilStatus) as Record<string, unknown> | undefined;
  if (!civil || typeof civil !== 'object') return null;
  const place = civil.registrationPlace;
  return typeof place === 'string' && place.trim() ? place : null;
}

/**
 * Minimal client shape — any Supabase client (typed or admin) satisfies it.
 * Loose on purpose: PostgrestBuilder is PromiseLike, not Promise, and its
 * generated row types would otherwise leak into every caller.
 */
interface SettingsClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
}

/** Load civil term tiers from admin_settings, falling back to defaults. */
export async function loadCivilTermTiers(client: SettingsClient): Promise<CivilTermTiers> {
  try {
    const { data, error } = await client
      .from('admin_settings')
      .select('value')
      .eq('key', 'civil_status_term_tiers')
      .maybeSingle();
    if (error || !data?.value) return DEFAULT_CIVIL_TERM_TIERS;
    return data.value as CivilTermTiers;
  } catch {
    return DEFAULT_CIVIL_TERM_TIERS;
  }
}

export interface OrderForEstimate {
  customer_data?: unknown;
  selected_options?: unknown;
  delivery_method?: unknown;
}

export interface ServiceForEstimate {
  slug?: string | null;
  estimated_days?: number | null;
  urgent_days?: number | null;
  urgent_available?: boolean | null;
}

/**
 * Compute the ISO timestamp for `orders.estimated_completion_date`.
 *
 * For civil-status orders (detected by the presence of
 * `customer_data.civil_status.registrationPlace`) the processing step uses the
 * tier range resolved from the registration office; everything else uses the
 * service's flat `estimated_days` exactly as before.
 */
export async function computeEstimatedCompletionISOForOrder(
  client: SettingsClient,
  order: OrderForEstimate,
  svc: ServiceForEstimate | null,
  placedAt: Date = new Date()
): Promise<string | null> {
  // Instant auto-issued services (extras CF / plan cadastral / constatator)
  // deliver in minutes, not business days — a calendar date is meaningless
  // and, during a platform outage, misleading ("expirat" noise in admin).
  // They get NO estimate; the UI shows "câteva minute" or the on-hold state.
  if (instantPlatformProvider(svc?.slug)) return null;

  let serviceDaysRange: { minDays: number; maxDays: number } | null = null;

  const registrationPlace = extractCivilRegistrationPlace(order.customer_data);
  if (registrationPlace) {
    const tiers = await loadCivilTermTiers(client);
    const tier = resolveCivilTermTier(registrationPlace, tiers);
    serviceDaysRange = { minDays: tier.minDays, maxDays: tier.maxDays };
  }

  return computeEstimatedCompletionISO({
    placedAt,
    serviceDays: svc?.estimated_days ?? null,
    urgentDays: svc?.urgent_days ?? null,
    urgentAvailable: svc?.urgent_available ?? null,
    serviceDaysRange,
    selectedOptions:
      (order.selected_options as ComputeEstimateInput['selectedOptions']) ?? null,
    deliveryMethod:
      (order.delivery_method as ComputeEstimateInput['deliveryMethod']) ?? null,
  });
}
