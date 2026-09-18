/**
 * „Is this the same place?" — for every path that saves an address into the
 * account (a typed one, the one read off the ID, the one from a paid order).
 *
 * Street + number + locality (plus county/country when both sides have one),
 * compared without diacritics, case, punctuation, hyphens or the
 * „str./nr./bl./ap." words people add or drop. Two paths saving
 * „Strada Salcâmilor, nr. 2" and „Salcâmilor 2" used to produce two rows, both
 * labelled „Adresă din act" (seen 18.09.2026).
 */

type Unknowns = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export function addressToken(value: unknown): string {
  return str(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,;\-–]/g, ' ')
    .replace(/\b(str|strada|nr|numarul|bl|bloc|ap|apartament|sc|scara|et|etaj)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sameAddress(a: object | null | undefined, b: object | null | undefined): boolean {
  if (!a || !b) return false;
  const x = a as Unknowns;
  const y = b as Unknowns;
  // County and country only when both sides carry one: the OCR address often
  // has no county, and „Salcâmilor 2, Odoreu" is still the same place.
  const cx = addressToken(x.county), cy = addressToken(y.county);
  if (cx && cy && cx !== cy) return false;
  const kx = addressToken(x.country), ky = addressToken(y.country);
  if (kx && ky && kx !== ky) return false;
  if (
    addressToken(x.street) !== addressToken(y.street) ||
    addressToken(x.number) !== addressToken(y.number) ||
    addressToken(x.city) !== addressToken(y.city)
  ) {
    return false;
  }
  // Same building, different flat: two places. Compared when BOTH sides name
  // the part — a bare OCR address (no apartment read) still matches the row
  // the customer saved with one, instead of becoming a second row.
  for (const part of ['building', 'staircase', 'floor', 'apartment'] as const) {
    const px = addressToken(x[part]), py = addressToken(y[part]);
    if (px && py && px !== py) return false;
  }
  return true;
}

/**
 * For two addresses that are the same place: the details the candidate has
 * and the saved row lacks (flat, block, floor, postal code, county, country),
 * or `null` when there is nothing to add. Deduplication kept the OLD row and
 * dropped „ap. 12" typed later (REV3-ADDRESS-001); the caller merges these in.
 */
export function missingAddressDetails(existing: object, candidate: object): Record<string, string> | null {
  const x = existing as Unknowns;
  const y = candidate as Unknowns;
  const out: Record<string, string> = {};
  for (const part of ['building', 'staircase', 'floor', 'apartment', 'postalCode', 'county', 'country'] as const) {
    if (!str(x[part]) && str(y[part])) out[part] = str(y[part]);
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** The first saved row that is the same place, or `null`. */
export function findSameAddress<T extends { data: object }>(rows: T[], candidate: object): T | null {
  return rows.find((row) => sameAddress(row.data, candidate)) ?? null;
}
