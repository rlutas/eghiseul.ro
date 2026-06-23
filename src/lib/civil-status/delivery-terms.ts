/**
 * Civil-status delivery terms by registration office (oficiul de stare civilă).
 *
 * Termenul de eliberare la naștere/căsătorie/celibat depinde de SPC-ul unde a
 * fost înregistrat actul (`registrationPlace`):
 *   • București + sectoare → lent (slow)
 *   • oficii rapide (listă editabilă din admin) → fast
 *   • restul → default
 *
 * Config-ul live e în `admin_settings.civil_status_term_tiers`; aici sunt
 * defaults-urile (fallback) + logica de rezolvare. Pure module — fără client.
 */

import { COUNTIES } from '@/lib/data/romania-counties';

export interface CivilTermTier {
  display: string;
  minDays: number;
  maxDays: number;
}

export interface CivilTermTiers {
  slow: CivilTermTier;
  fast: CivilTermTier & { counties: string[] };
  default: CivilTermTier;
}

export const DEFAULT_CIVIL_TERM_TIERS: CivilTermTiers = {
  slow: { display: '15-30 zile lucrătoare', minDays: 15, maxDays: 30 },
  fast: { display: '5-7 zile lucrătoare', minDays: 5, maxDays: 7, counties: ['Satu Mare'] },
  default: { display: '7-15 zile lucrătoare', minDays: 7, maxDays: 15 },
};

/**
 * Opțiunile pentru câmpul „unde a fost înregistrat actul" — toate județele,
 * cu București expandat pe sectoare (orice „București…" = tier slow).
 */
export const CIVIL_REGISTRATION_OPTIONS: string[] = COUNTIES.flatMap((c) =>
  c.name === 'București'
    ? Array.from({ length: 6 }, (_, i) => `București (Sectorul ${i + 1})`)
    : [c.name]
);

export type CivilTermResolution = CivilTermTier & {
  tier: 'slow' | 'fast' | 'default';
};

/**
 * Determină tier-ul de termen pentru un loc de înregistrare.
 * București (orice sector) → slow; județ în lista fast → fast; altfel default.
 */
export function resolveCivilTermTier(
  registrationPlace: string | undefined | null,
  tiers: CivilTermTiers = DEFAULT_CIVIL_TERM_TIERS
): CivilTermResolution {
  const value = (registrationPlace ?? '').trim();
  if (!value) {
    return { tier: 'default', ...tiers.default };
  }
  if (/^bucure[sș]ti/i.test(value)) {
    return { tier: 'slow', ...tiers.slow };
  }
  const lower = value.toLowerCase();
  const isFast = (tiers.fast.counties ?? []).some(
    (c) => lower === c.toLowerCase() || lower.startsWith(c.toLowerCase())
  );
  if (isFast) {
    const { display, minDays, maxDays } = tiers.fast;
    return { tier: 'fast', display, minDays, maxDays };
  }
  return { tier: 'default', ...tiers.default };
}
