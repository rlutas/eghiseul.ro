/**
 * Instant, auto-issued services backed by an external state platform.
 *
 * These deliver in MINUTES via the Railway workers (not business days), so:
 *  - they never get an `estimated_completion_date` stamped at payment;
 *  - UI shows "câteva minute" while the platform is up;
 *  - during an open outage (`platform_outages`) the term goes ON HOLD —
 *    admin + client status show "în așteptare ANCPI/ONRC" instead of a date,
 *    and issuance resumes automatically when the platform recovers.
 *
 * Only ANCPI + ONRC are tracked (the two platforms we automate against);
 * every other service keeps its normal business-day estimate.
 */

export type PlatformProvider = 'ancpi' | 'onrc';

export const INSTANT_PLATFORM_SERVICES: Readonly<Record<string, PlatformProvider>> = Object.freeze({
  'extras-carte-funciara': 'ancpi',
  'extras-plan-cadastral': 'ancpi',
  'certificat-constatator': 'onrc',
});

export const PROVIDER_LABEL: Readonly<Record<PlatformProvider, string>> = Object.freeze({
  ancpi: 'ANCPI',
  onrc: 'ONRC',
});

/** Provider for an instant auto-issued service, or null for normal services. */
export function instantPlatformProvider(slug: string | null | undefined): PlatformProvider | null {
  if (!slug) return null;
  return INSTANT_PLATFORM_SERVICES[slug] ?? null;
}

/** Open outage windows per provider: ISO started_at, or null when operational. */
export type OpenOutages = Record<PlatformProvider, string | null>;

interface OutagesClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
}

/**
 * Read the currently-open outage window per provider from `platform_outages`
 * (the authoritative signal recorded by the workers' portal probes — same
 * source as the public /api/status badge). Fail-soft: on error report both
 * providers as operational rather than blocking the caller.
 */
export async function getOpenOutages(client: OutagesClient): Promise<OpenOutages> {
  const result: OpenOutages = { ancpi: null, onrc: null };
  try {
    const { data, error } = await client
      .from('platform_outages')
      .select('provider, started_at')
      .is('ended_at', null);
    if (error || !data) return result;
    for (const row of data as Array<{ provider: string; started_at: string }>) {
      if (row.provider === 'ancpi' || row.provider === 'onrc') {
        result[row.provider] = row.started_at;
      }
    }
    return result;
  } catch {
    return result;
  }
}
