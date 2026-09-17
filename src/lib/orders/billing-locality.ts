/**
 * Locality options for a Romanian billing address.
 *
 * București is the special case: ANAF refuses the e-Factura export when the
 * locality of a Bucharest client is not „Sector N" („Pentru ca judetul
 * clientului este Bucuresti, modifica campul Localitate de forma Sector 1,
 * Sector 2, etc." — invoice EGH-0048). The raw locality list holds
 * „Municipiul Bucuresti" + „Sectorul 1..6", so it is replaced by exactly the
 * six values SPV accepts.
 *
 * Shared by the wizard's billing step and the account's billing profile form,
 * so a profile saved in the account produces a locality the invoice can use.
 */

import { getLocalitiesForCounty } from '@/lib/data/romania-counties';
import { isBucharestCounty, BUCHAREST_SECTORS_BILLING } from '@/lib/oblio/address';

/** Localities to offer for `county`; empty when no county is selected. */
export function billingLocalityOptions(county?: string | null): string[] {
  if (isBucharestCounty(county)) return BUCHAREST_SECTORS_BILLING;
  return getLocalitiesForCounty(county);
}
