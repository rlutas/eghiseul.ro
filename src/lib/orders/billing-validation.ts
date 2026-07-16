/**
 * Billing completeness checks for invoice issuance.
 *
 * Oblio (Romanian e-invoicing) needs the individual client's address broken
 * into street + locality + county. An empty address causes Oblio to reject the
 * invoice, so the wizard's billing step must require all three for a persoană
 * fizică (both "bill to me" and "another person").
 *
 * Foreign billing addresses (billing.country outside Romania) relax the
 * Romania-only requirements: county becomes optional (Oblio accepts free text
 * or '-') and CNP becomes optional (Oblio doesn't require it; e-Factura/SPV
 * auto-fills 13 zeros for foreign individuals).
 */

import type { BillingState } from '@/types/verification-modules';

/**
 * True when the billing country is set to something other than Romania.
 * Empty/undefined counts as domestic (the wizard defaults to Romania).
 */
export function isForeignBillingCountry(country?: string | null): boolean {
  const normalized = (country || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // strip diacritics: 'România' → 'romania'
  if (!normalized) return false;
  return normalized !== 'romania' && normalized !== 'ro';
}

/**
 * True when a persoană-fizică billing block has everything Oblio needs.
 * Domestic: full name, CNP (unless cnpOptional), street + locality + county.
 * Foreign country: full name, street + locality + country; CNP and county
 * optional.
 */
export function isPfBillingComplete(
  billing: Partial<BillingState> | null | undefined,
  opts?: { cnpOptional?: boolean },
): boolean {
  if (!billing) return false;
  const isForeign = isForeignBillingCountry(billing.country);
  return Boolean(
    billing.firstName?.trim() &&
      billing.lastName?.trim() &&
      (opts?.cnpOptional || isForeign || billing.cnp?.trim()) &&
      billing.address?.trim() && // street line (stradă, nr, bloc, ap)
      billing.city?.trim() && // localitate
      (isForeign ? billing.country?.trim() : billing.county?.trim()),
  );
}
