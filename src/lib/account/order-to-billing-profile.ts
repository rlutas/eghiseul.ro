/**
 * The billing profile an account inherits from the order that created it.
 *
 * Faza 1: after paying, the customer sets a password and everything the order
 * already knows moves into the account. Billing is the part that used to be
 * silently useless — `register-from-order` stored the name, the CNP and one
 * flattened address string, while `isPfBillingComplete` needs street, locality
 * and county as separate fields. All 23 PF profiles in production were saved
 * that way and none of them could ever prefill a later order.
 *
 * The order's own billing block is the best source: it passed the checkout
 * validation, so it carries the three fields. The scanned identity address is
 * the fallback for orders where billing was not collected separately.
 */

import { canonicalCountyName } from '@/lib/data/romania-counties';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';
import type { BillingData } from '@/components/shared/BillingProfileForm';

type Unknowns = Record<string, unknown> | null | undefined;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** True when the order was invoiced to a company. */
export function isCompanyBilling(billing: Unknowns): boolean {
  if (!billing) return false;
  return billing.type === 'persoana_juridica' || Boolean(str(billing.cui));
}

/**
 * The PJ profile for an order billed to a company.
 *
 * The account form reads the company address from `companyAddress`; the
 * wizard's billing block calls the same thing `address`. Writing only the
 * wizard's key is why a saved company profile showed an empty registered
 * office.
 */
export function companyProfileFromOrder(billing: Unknowns): BillingData {
  const b = billing || {};
  const name = str(b.companyName);
  return {
    label: name || 'Firma mea',
    type: 'persoana_juridica',
    companyName: name,
    cui: str(b.cui),
    regCom: str(b.regCom) || str(b.registrationNumber),
    companyAddress: str(b.companyAddress) || str(b.address),
    bankName: str(b.bankName),
    bankIban: str(b.bankIban) || str(b.iban),
  };
}

/**
 * The PF profile for an order billed to a person, or `null` when the order
 * holds no address complete enough to be worth saving.
 *
 * A profile that cannot validate is worse than none: it appears in the account
 * as saved and still forces the customer to retype everything at the next
 * checkout. The CNP is optional here — it is missing from orders for services
 * that never ask for one, and its absence does not make the address unusable.
 */
export function personProfileFromOrder(
  billing: Unknowns,
  personal: Unknowns,
  fallbackName?: { firstName?: string; lastName?: string }
): BillingData | null {
  const b = billing || {};
  const p = personal || {};
  const addr = (p.address || {}) as Record<string, unknown>;

  const streetLine =
    str(b.address) ||
    [
      str(addr.street),
      str(addr.number) && `Nr. ${str(addr.number)}`,
      str(addr.building) && `Bl. ${str(addr.building)}`,
      str(addr.apartment) && `Ap. ${str(addr.apartment)}`,
    ]
      .filter(Boolean)
      .join(', ');

  const profile: BillingData = {
    label: 'Profil implicit',
    type: 'persoana_fizica',
    firstName: str(b.firstName) || str(p.firstName) || str(fallbackName?.firstName),
    lastName: str(b.lastName) || str(p.lastName) || str(fallbackName?.lastName),
    cnp: str(b.cnp) || str(p.cnp),
    address: streetLine,
    city: str(b.city) || str(addr.city),
    county: canonicalCountyName(str(b.county) || str(addr.county)) || '',
    postalCode: str(b.postalCode) || str(addr.postalCode),
  };

  return isPfBillingComplete(profile, { cnpOptional: true }) ? profile : null;
}
