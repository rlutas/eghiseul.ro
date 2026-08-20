/**
 * How the property's locality is written on the cerere.
 *
 * Anexa nr. 6 has NO county field for the imobil — only
 * "comuna/orașul/municipiul …". The county appears once, in the OCPI/BCPI
 * header, and our collaborator files everything at Satu Mare regardless of
 * where the property is. So a cerere for Otopeni or Stâlpu would reach the
 * counter without ever naming Ilfov or Buzău, and UAT names repeat across
 * counties (there are several Drăgănești, several Ștefănești).
 *
 * The county therefore goes inline with the locality: "Otopeni, jud. Ilfov".
 */

/** Strip diacritics + uppercase, for comparing names only. */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ŞŚşś]/g, 'S')
    .replace(/[ŢŤţť]/g, 'T')
    .toUpperCase();
}

export function uatWithCounty(uat: string | null | undefined, county: string | null | undefined): string {
  const locality = (uat ?? '').trim();
  const judet = (county ?? '').trim();

  if (!locality) return judet ? `jud. ${judet}` : '';
  if (!judet) return locality;

  // Only Bucharest sectors are exempt — their name already contains it
  // ("București Sectorul 3").
  //
  // Everything else gets the county, even when it looks redundant ("Iași, jud.
  // Iași"): the nomenclator has a Satu Mare in Harghita AND in Suceava, and a
  // Călărași in Botoșani, Cluj and Dolj. Dropping the county on the one that
  // matches its own county would make the county seat the ambiguous case —
  // worst of all on a cerere filed at BCPI Satu Mare, whose header already says
  // Satu Mare. A substring test would be wrong too: Cluj-Napoca contains
  // "Cluj" but is still written "Cluj-Napoca, jud. Cluj".
  const l = fold(locality);
  const j = fold(judet);
  if (j === 'BUCURESTI' && l.startsWith('BUCURESTI')) return locality;

  return `${locality}, jud. ${judet}`;
}
