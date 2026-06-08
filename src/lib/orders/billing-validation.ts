/**
 * Billing completeness checks for invoice issuance.
 *
 * Oblio (Romanian e-invoicing) needs the individual client's address broken
 * into street + locality + county. An empty address causes Oblio to reject the
 * invoice, so the wizard's billing step must require all three for a persoană
 * fizică (both "bill to me" and "another person").
 */

import type { BillingState } from '@/types/verification-modules';

/**
 * True when a persoană-fizică billing block has everything Oblio needs:
 * full name, CNP, and a complete address (street line + locality + county).
 */
export function isPfBillingComplete(
  billing: Partial<BillingState> | null | undefined,
): boolean {
  if (!billing) return false;
  return Boolean(
    billing.firstName?.trim() &&
      billing.lastName?.trim() &&
      billing.cnp?.trim() &&
      billing.address?.trim() && // street line (stradă, nr, bloc, ap)
      billing.city?.trim() && // localitate
      billing.county?.trim(), // județ
  );
}
