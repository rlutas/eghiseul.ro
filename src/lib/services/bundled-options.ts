/**
 * Bundled Options Helper
 *
 * Fetches service options for a service referenced as a cross-service add-on
 * (e.g. certificat-integritate-comportamentala -> addon_cazier_judiciar ->
 * returns the per-document options of "cazier-judiciar" that make sense in
 * a bundled context: apostila_haga, traducere, legalizare, apostila_notari).
 *
 * Per-order options like urgenta / copii_suplimentare / verificare_expert
 * are intentionally excluded — they belong on the primary service, not the
 * bundled one.
 */

import type { ServiceOption } from '@/types/services';

// Option codes we allow as bundled sub-options.
export const BUNDLED_OPTION_CODES = [
  'apostila_haga',
  'traducere',
  'legalizare',
  'apostila_notari',
] as const;

export type BundledOptionCode = (typeof BUNDLED_OPTION_CODES)[number];

/**
 * Fetch the subset of options on the bundled service that may be offered
 * as sub-options under a cross-service add-on.
 */
export async function fetchBundledOptions(slug: string): Promise<ServiceOption[]> {
  try {
    const response = await fetch(`/api/services/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn(
        `[bundled-options] GET /api/services/${slug} returned ${response.status}`
      );
      return [];
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { service?: { options?: Array<Partial<ServiceOption> & { code: string }> } };
    };

    const rawOptions = payload?.data?.service?.options ?? [];

    // Filter to just the bundled-friendly codes and coerce to ServiceOption.
    const filtered = rawOptions.filter(
      (opt): opt is ServiceOption & { code: BundledOptionCode } =>
        typeof opt?.code === 'string' &&
        (BUNDLED_OPTION_CODES as readonly string[]).includes(opt.code) &&
        typeof opt.id === 'string' &&
        typeof opt.price === 'number'
    );

    return filtered;
  } catch (err) {
    console.warn('[bundled-options] fetch failed:', err);
    return [];
  }
}
