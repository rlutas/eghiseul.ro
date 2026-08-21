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

/**
 * Taxa pentru un serviciu, sau null dacă nu plătim o taxă fixă la OCPI.
 *
 * Sursa principală e `services.processing_config.ancpi_cost_ron`, ca o
 * modificare de tarif să se facă din admin, nu printr-un deploy. Lista de mai
 * sus rămâne plasă de siguranță pentru configurările incomplete.
 */
export function taxaEliberare(
  slug: string | null | undefined,
  processingConfig?: { ancpi_cost_ron?: number | string | null } | null
): number | null {
  const dinConfig = Number(processingConfig?.ancpi_cost_ron);
  if (Number.isFinite(dinConfig) && dinConfig > 0) return dinConfig;
  if (!slug) return null;
  return TAXA_ELIBERARE_RON[slug] ?? null;
}
