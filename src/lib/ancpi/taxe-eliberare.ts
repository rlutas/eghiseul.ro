/**
 * Taxa oficială ANCPI pe care o plătim la OCPI pentru eliberarea documentului,
 * per serviciu. Se precompletează în formularul de depunere al colaboratorului
 * ca să nu o tasteze de o sută de ori — rămâne editabilă, fiindcă urgența sau
 * un imobil în plus schimbă suma.
 *
 * Sursă: Ordin ANCPI 16/2019 (lista completă în `tarife-oficiale.ts`):
 *   2.7.6  Extras de carte funciară pentru informare — 20 lei / imobil
 *   2.7.7  Extras din planul cadastral               — 15 lei / imobil
 */
export const TAXA_ELIBERARE_RON: Record<string, number> = {
  'extras-carte-funciara': 20,
  'extras-plan-cadastral': 15,
};

/** Taxa pentru un serviciu, sau null dacă nu plătim o taxă fixă la OCPI. */
export function taxaEliberare(slug: string | null | undefined): number | null {
  if (!slug) return null;
  return TAXA_ELIBERARE_RON[slug] ?? null;
}
