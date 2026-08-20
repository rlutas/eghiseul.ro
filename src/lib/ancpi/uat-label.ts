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

  // Bucharest sectors already carry the county in their name ("București
  // Sectorul 3"). A plain substring test would be wrong — Cluj-Napoca contains
  // "Cluj" but is still correctly written "Cluj-Napoca, jud. Cluj".
  const l = fold(locality);
  const j = fold(judet);
  if (l === j) return locality;
  if (j === 'BUCURESTI' && l.startsWith('BUCURESTI')) return locality;

  return `${locality}, jud. ${judet}`;
}
