/**
 * Couriers we can query for tracking events. The others (`posta_intl`,
 * `dhl_intl`, `dhl`, `posta`) have an AWB and a link set by the team, but no API
 * behind `getCourierProvider`, so asking for them only throws and logs an error.
 */
const LIVE_TRACKING_PROVIDERS: ReadonlySet<string> = new Set(['fancourier', 'sameday']);

export function hasLiveTracking(providerCode: string | null | undefined): boolean {
  return !!providerCode && LIVE_TRACKING_PROVIDERS.has(providerCode);
}
