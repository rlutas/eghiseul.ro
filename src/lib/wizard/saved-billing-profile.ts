/**
 * Saved billing profiles → wizard billing step.
 *
 * The account area ("Facturare" tab) saves profiles of both types, but the
 * wizard only ever read back the `persoana_juridica` one; the PF branch built
 * itself from the scanned ID and ignored the saved profile entirely. For the
 * services with no ID scan (imobiliare) that meant a saved profile did nothing
 * at all.
 *
 * A saved PF profile carries the fields of BillingProfileForm (name, CNP and a
 * single free-text address line). County/locality/postal code are read when
 * present but are usually empty — the customer completes them, because Oblio
 * needs the locality and county separately.
 */

import { canonicalCountyName } from '@/lib/data/romania-counties';
import { isForeignBillingCountry } from '@/lib/orders/billing-validation';

export interface SavedPfBillingPrefill {
  firstName: string;
  lastName: string;
  cnp: string;
  /** Street line: "Str. X nr. 10, bl. A2, ap. 5". */
  address: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Map a saved `persoana_fizica` billing profile onto the wizard's PF fields.
 * Returns null when the profile holds nothing usable, so the caller can fall
 * back to an empty form instead of writing a row of empty strings.
 */
export function savedPfBillingPrefill(
  billingData: Record<string, unknown> | null | undefined,
): SavedPfBillingPrefill | null {
  if (!billingData) return null;

  const country = text(billingData.country) || 'Romania';
  const rawCounty = text(billingData.county);
  const prefill: SavedPfBillingPrefill = {
    firstName: text(billingData.firstName),
    lastName: text(billingData.lastName),
    cnp: text(billingData.cnp).replace(/\D/g, ''),
    address: text(billingData.address),
    city: text(billingData.city),
    // Domestic county must match an option of the county dropdown; a foreign
    // region is free text (Oblio accepts it as-is).
    county: isForeignBillingCountry(country)
      ? rawCounty
      : canonicalCountyName(rawCounty) ?? '',
    postalCode: text(billingData.postalCode),
    country,
  };

  const hasAnything =
    prefill.firstName || prefill.lastName || prefill.cnp || prefill.address;
  return hasAnything ? prefill : null;
}
