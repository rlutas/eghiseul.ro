/**
 * Saved delivery addresses → wizard delivery form.
 *
 * The customer manages addresses in the account area ("Adrese" tab, stored in
 * `user_saved_data` with `data_type = 'address'` and served flattened by
 * GET /api/user/addresses). Until now nothing read them back, so the tab was
 * write-only: a returning customer retyped the same street on every order.
 *
 * These helpers are pure so the mapping (which address can be offered, what it
 * looks like in the picker, which form fields it fills) is unit-testable and
 * the component stays a thin shell.
 */

import { canonicalCountyName } from '@/lib/data/romania-counties';

/** One row of GET /api/user/addresses (AddressData flattened over the row). */
export interface SavedDeliveryAddress {
  id: string;
  label?: string | null;
  country?: string | null;
  county?: string | null;
  city?: string | null;
  street?: string | null;
  number?: string | null;
  building?: string | null;
  staircase?: string | null;
  floor?: string | null;
  apartment?: string | null;
  postalCode?: string | null;
  isDefault?: boolean;
}

/** Exactly the fields of the domestic delivery address form. */
export interface DeliveryAddressFormValues {
  street: string;
  number: string;
  building: string;
  staircase: string;
  floor: string;
  apartment: string;
  city: string;
  county: string;
  postalCode: string;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * True for an address that can be shipped by Fan Courier / Sameday, i.e. a
 * Romanian one. An empty country counts as Romania: the account form defaults
 * to it and older rows were saved without the field.
 */
export function isRomanianSavedAddress(address: SavedDeliveryAddress): boolean {
  const country = text(address.country)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return !country || country === 'romania' || country === 'ro';
}

/**
 * Addresses worth offering in the picker: Romanian, and complete enough that
 * picking one is an improvement over an empty form (street + locality + a
 * county we can map onto the dropdown). Order is preserved — the API already
 * returns the default address first.
 */
export function usableSavedAddresses(
  addresses: SavedDeliveryAddress[],
): SavedDeliveryAddress[] {
  return addresses.filter(
    (address) =>
      isRomanianSavedAddress(address) &&
      !!text(address.street) &&
      !!text(address.city) &&
      !!canonicalCountyName(address.county),
  );
}

/**
 * Map a saved address onto the delivery form. The county is canonicalised
 * so it matches an option of the county dropdown even
 * when it was stored as a code ("SM") or with different diacritics.
 */
export function toDeliveryAddressFormValues(
  address: SavedDeliveryAddress,
): DeliveryAddressFormValues {
  return {
    street: text(address.street),
    number: text(address.number),
    building: text(address.building),
    staircase: text(address.staircase),
    floor: text(address.floor),
    apartment: text(address.apartment),
    city: text(address.city),
    county: canonicalCountyName(address.county) ?? '',
    // 6 digits or nothing — a half-typed code would fail the form's regex and
    // show an error on a field the customer never touched.
    postalCode: /^\d{6}$/.test(text(address.postalCode)) ? text(address.postalCode) : '',
  };
}

/** One-line description for the picker's option text. */
export function describeSavedAddress(address: SavedDeliveryAddress): string {
  const street = [text(address.street), text(address.number)].filter(Boolean).join(' ');
  const place = [street, text(address.city), text(address.county)]
    .filter(Boolean)
    .join(', ');
  const label = text(address.label);
  return label ? `${label} — ${place}` : place;
}
