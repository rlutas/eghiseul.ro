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
 * Taxe FIXE plătite online la livrarea DIRECTĂ (fără depunere OCPI) — singurele
 * care se înregistrează AUTOMAT la upload-ul PDF-ului de către colaborator.
 *
 * NU folosi `ancpi_cost_ron` din processing_config aici: acela e tariful
 * INFORMATIV al depunerii la ghișeu (ex. identificare după adresă, cod 2.7.8 =
 * 100 lei), nu ce plătim când colaboratorul rezolvă online pe loc. Incident
 * 28.08 (E-260812-QFDXD + altele): identificare-imobil primea automat cost 100
 * deși taxa reală era 20 (extrasul CF al imobilului identificat) — echipa a
 * corectat manual fiecare comandă, iar Mircea a fost suspectat pe nedrept.
 */
export const TAXA_LIVRARE_DIRECTA_RON: Record<string, number> = {
  'extras-carte-funciara': 20,
  'extras-cf-colectiv': 20,
  'extras-plan-cadastral': 15,
  // Identificarea livrată direct = un extras CF (20 lei) pentru imobilul
  // identificat, nu certificatul 2.7.8 de 100 lei de la ghișeu.
  'identificare-imobil': 20,
};

/** Taxa de înregistrat automat la livrarea directă, sau null → nimic automat
 *  (serviciul rămâne pe introducere manuală în admin / formularul de depunere). */
export function taxaLivrareDirecta(slug: string | null | undefined): number | null {
  if (!slug) return null;
  return TAXA_LIVRARE_DIRECTA_RON[slug] ?? null;
}

/**
 * Taxa pentru un serviciu, sau null dacă nu plătim o taxă fixă la OCPI.
 * Precompletare EDITABILĂ în formularele colaboratorului — nu pentru
 * înregistrare automată (vezi taxaLivrareDirecta).
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
