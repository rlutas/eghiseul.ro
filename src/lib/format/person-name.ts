/**
 * Numele persoanelor fizice — o singură sursă de adevăr pentru CUM se scrie.
 *
 * Două reguli, ambele cerute de Raul pe 2026-07-28 după împuternicirea din
 * comanda `E-260728-YFHH2`, care ieșea „ADRIAN<MIHAIL PEROUPOPA":
 *
 * 1. **Curățare MRZ.** Zona citibilă automat de pe pașapoarte/CI folosește `<`
 *    ca separator și umplutură (`ADRIAN<MIHAIL`, `PEROUPOPA<<ADRIAN<MIHAIL`).
 *    OCR-ul întoarce uneori caracterul ca atare, iar el ajunge în documente
 *    oficiale. Aici îl transformăm în spațiu, oriunde apare.
 * 2. **Ordinea românească:** întâi numele de familie, apoi prenumele —
 *    „PEROUPOPA Adrian Mihail", nu invers. Se aplică la documente, în admin și
 *    în exporturi, ca aceeași persoană să arate la fel peste tot.
 */

/**
 * Curăță un fragment de nume: separatorii MRZ devin spații, spațiile multiple
 * se colapsează, se taie punctuația rămasă la capete. Nu schimbă niciodată
 * literele — diacriticele și scrierea cu majuscule rămân cum au venit.
 */
export function cleanNamePart(raw?: string | null): string {
  if (!raw) return '';
  return String(raw)
    .replace(/[<>«»‹›]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.\-]+|[\s,.\-]+$/g, '')
    .trim();
}

/**
 * Numele complet în ordinea românească: familie întâi.
 *
 * Acceptă și forma deja compusă (`fallbackFull`) pentru cazurile în care avem
 * doar un câmp `name` — acolo curățăm, dar NU reordonăm, fiindcă nu putem ști
 * unde se termină numele de familie.
 */
export function formatPersonName(
  lastName?: string | null,
  firstName?: string | null,
  fallbackFull?: string | null
): string {
  const last = cleanNamePart(lastName);
  const first = cleanNamePart(firstName);
  if (last || first) return [last, first].filter(Boolean).join(' ');
  return cleanNamePart(fallbackFull);
}

/**
 * Variantă pentru obiectele `{ firstName, lastName, name }` care circulă prin
 * `customer_data` (personal / contact / billing), în ordinea de preferință dată.
 */
export function formatPersonNameFrom(
  ...sources: Array<
    { firstName?: string | null; lastName?: string | null; name?: string | null } | null | undefined
  >
): string {
  for (const src of sources) {
    if (!src) continue;
    const composed = formatPersonName(src.lastName, src.firstName, src.name);
    if (composed) return composed;
  }
  return '';
}
