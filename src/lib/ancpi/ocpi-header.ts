/**
 * The two header lines of the cerere: which OCPI and which BCPI it is addressed
 * to.
 *
 * OCPI is one per county, so it follows the property's county exactly — the
 * county comes from the wizard, picked out of ANCPI's own județ/UAT
 * nomenclator, so it cannot be a free-text typo.
 *
 * BCPI is NOT one per county: Cluj has Cluj-Napoca, Turda, Dej, Gherla and
 * Huedin, Ilfov has Buftea and Cornetu. ANCPI does not publish the UAT → BCPI
 * mapping in a form we can consume, so we address the county office and let the
 * collaborator correct the rare case where a secondary office is competent.
 * Bucharest is the exception we CAN be exact about: its BCPIs are the sectors,
 * and the sector is part of the UAT name the client picked.
 */

const OCPI_PREFIX = 'OFICIUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ ';
const BCPI_PREFIX = 'BIROUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ ';

/** The header text is set in capitals, like the rest of the form's headings. */
function caps(value: string): string {
  return value.trim().toUpperCase();
}

export function ocpiName(county: string | null | undefined): string {
  return caps(county ?? '');
}

export function bcpiName(county: string | null | undefined, uat: string | null | undefined): string {
  const judet = caps(county ?? '');
  if (!judet.startsWith('BUCURE')) return judet;

  // "București Sectorul 3" → "SECTORUL 3"
  const sector = /SECTOR(?:UL)?\s*([1-6])/.exec(caps(uat ?? ''));
  return sector ? `SECTORUL ${sector[1]}` : judet;
}

/** Full first header line, for callers that need the whole string. */
export function ocpiHeaderLine(county: string | null | undefined): string {
  return OCPI_PREFIX + ocpiName(county);
}

/** Full second header line. */
export function bcpiHeaderLine(county: string | null | undefined, uat: string | null | undefined): string {
  return BCPI_PREFIX + bcpiName(county, uat);
}
