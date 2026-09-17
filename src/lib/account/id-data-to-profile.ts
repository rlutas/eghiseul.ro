/**
 * What the account may build out of a scanned identity document.
 *
 * Faza 3 of `docs/dashboard-client/PLAN.md`, decision D8: the data read off the
 * document can also be used for invoicing — **at the customer's choice, off by
 * default**. Until today it happened silently on every scan, and it did two
 * things wrong at once:
 *
 * 1. it OVERWROTE an existing PF billing profile, including one the customer had
 *    typed by hand;
 * 2. it wrote the flat shape (name, CNP, one address string), which is exactly
 *    the shape `isPfBillingComplete` rejects — so a scan could turn a working
 *    billing profile into one the next order would refuse.
 *
 * The mapping here writes the structured fields Oblio needs (street line,
 * locality, county) and is shared by the server route and the client hook, so
 * both produce the same profile.
 */

import { canonicalCountyName } from '@/lib/data/romania-counties';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';
import type { BillingData } from '@/components/shared/BillingProfileForm';

/** The address block an OCR read can produce. Every field is optional. */
export interface IdAddress {
  street?: string;
  number?: string;
  building?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postalCode?: string;
}

export interface IdData {
  firstName?: string;
  lastName?: string;
  cnp?: string;
  address?: IdAddress | null;
}

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/**
 * „Str. Memorandumului nr. 12, bl. A2, ap. 5" — the street line only. The
 * locality and the county are separate fields on the invoice and must not be
 * folded into this string.
 */
export function streetLineFromIdData(address?: IdAddress | null): string {
  const a = address ?? {};
  return [
    str(a.street),
    str(a.number) && `Nr. ${str(a.number)}`,
    str(a.building) && `Bl. ${str(a.building)}`,
    str(a.staircase) && `Sc. ${str(a.staircase)}`,
    str(a.floor) && `Et. ${str(a.floor)}`,
    str(a.apartment) && `Ap. ${str(a.apartment)}`,
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * The billing profile a scanned document can produce, or `null` when the
 * document does not carry enough for one.
 *
 * `null` is the honest answer: a profile that cannot satisfy
 * `isPfBillingComplete` appears in the account as saved and still makes the
 * customer retype everything at checkout. The back of a new CI, for instance,
 * carries the address and no name at all.
 */
export function billingProfileFromIdData(
  data: IdData | null | undefined,
  label = 'Profil din act'
): BillingData | null {
  if (!data) return null;

  const profile: BillingData = {
    label,
    type: 'persoana_fizica',
    firstName: str(data.firstName),
    lastName: str(data.lastName),
    cnp: str(data.cnp),
    address: streetLineFromIdData(data.address),
    city: str(data.address?.city),
    county: canonicalCountyName(str(data.address?.county)) || '',
    postalCode: str(data.address?.postalCode),
  };

  // The CNP is on the document when it is there at all; a passport has none, and
  // its absence does not make the address unusable.
  return isPfBillingComplete(profile, { cnpOptional: true }) ? profile : null;
}

/** True when the document carries an address worth saving for deliveries. */
export function hasUsableAddress(address?: IdAddress | null): boolean {
  const a = address ?? {};
  return Boolean(str(a.street) && str(a.city));
}
