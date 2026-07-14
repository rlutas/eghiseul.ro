/**
 * ANCPI county (județ) nomenclator — id values as returned by ePay's
 * `EpayJsonInterceptor reqType=shoppingCartCompleteInformation` (judeteNom),
 * captured during the 2026-06-15 recon. Used to resolve a wizard county display
 * name (e.g. "Botoșani", "Caraș-Severin") to the ANCPI judetId the worker needs.
 *
 * UAT ids are NOT here (one nomenclator per county, large) — the worker resolves
 * uatId from the locality name at runtime via `nomenclatorUAT`.
 */

/** Normalize a county name for matching: strip diacritics, uppercase, alnum-only. */
export function normalizeJudet(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diacritics
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ''); // spaces, hyphens, etc.
}

/** Normalized ANCPI county name -> judetId. */
const JUDET_ID: Record<string, number> = {
  ALBA: 10, ARAD: 29, ARGES: 38, BACAU: 47, BIHOR: 56, BISTRITANASAUD: 65,
  BOTOSANI: 74, BRAILA: 92, BRASOV: 83, BUCURESTI: 403, BUZAU: 109, CALARASI: 519,
  CARASSEVERIN: 118, CLUJ: 127, CONSTANTA: 136, COVASNA: 145, DAMBOVITA: 154,
  DOLJ: 163, GALATI: 172, GIURGIU: 528, GORJ: 181, HARGHITA: 190, HUNEDOARA: 207,
  IALOMITA: 216, IASI: 225, ILFOV: 234, MARAMURES: 243, MEHEDINTI: 252, MURES: 261,
  NEAMT: 270, OLT: 289, PRAHOVA: 298, SALAJ: 314, SATUMARE: 305, SIBIU: 323,
  SUCEAVA: 332, TELEORMAN: 341, TIMIS: 350, TULCEA: 369, VALCEA: 387, VASLUI: 378,
  VRANCEA: 396,
};

/** Resolve a wizard county display name to the ANCPI judetId (or null). */
export function resolveJudetId(displayName: string | undefined | null): number | null {
  if (!displayName) return null;
  return JUDET_ID[normalizeJudet(displayName)] ?? null;
}

/** County display names exactly as shown in the wizard (PropertyDataStep) —
 *  every entry resolves via resolveJudetId. Shared source for admin forms so
 *  operators pick from the same list as customers (no free-text typos). */
export const COUNTY_NAMES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea',
  'Vrancea',
] as const;
