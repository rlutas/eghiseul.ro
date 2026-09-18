/**
 * The rules behind the „Date personale" step, kept out of the component.
 *
 * Pure functions: what a field must contain, how a date becomes the `YYYY-MM-DD`
 * a date input wants, and what the address off a scanned document looks like as
 * a saved delivery address.
 */

import { validateCNP } from '@/lib/validations/cnp';
import { streetLineFromIdData } from '@/lib/account/id-data-to-profile';
import type { AddressData } from '@/components/shared/AddressForm';
import type { ExtractedAddress } from '@/components/shared/IdScanner';

export type FieldId = 'lastName' | 'firstName' | 'cnp' | 'birthDate';

export const ORDER: FieldId[] = ['lastName', 'firstName', 'cnp', 'birthDate'];

/**
 * The `id` of a field in the page.
 *
 * Prefixed, because `ProfileTab` asks for the same four things under the bare
 * names: with its form open behind the dialog, `<label for="lastName">` inside
 * the dialog resolved to the input BEHIND it — the first one in document order
 * — and so did the focus on the first invalid field.
 */
export function fieldDomId(id: FieldId): string {
  return `checklist-${id}`;
}

/** Field names as they appear in „Am completat …", in the customer's words. */
export const LABELS: Record<FieldId, string> = {
  lastName: 'numele',
  firstName: 'prenumele',
  cnp: 'CNP-ul',
  birthDate: 'data nașterii',
};

export const CNP_HINT = 'Cele 13 cifre de pe actul de identitate.';

/**
 * `YYYY-MM-DD` in the browser's own timezone.
 *
 * NOT `toISOString()`: `validateCNP` returns a local midnight, and converting
 * that to UTC from Romania (+02/+03) lands on the previous day — a CNP of
 * 920702 filled in 1 July 1992. The same slip exists in ProfileTab.
 */
export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** „02.07.1992" as the OCR returns it → „1992-07-02" for a date input. */
export function isoFromRomanianDate(value?: string | null): string {
  const match = /^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/.exec((value ?? '').trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

/** The date of birth a CNP carries, or '' when the CNP is not a valid one. */
export function birthDateFromCnp(cnp: string): string {
  const result = validateCNP(cnp);
  return result.valid && result.data ? isoDate(result.data.birthDate) : '';
}

export function validateField(id: FieldId, values: Record<FieldId, string>): string | null {
  const value = values[id].trim();
  switch (id) {
    case 'lastName':
      return value ? null : 'Scrie numele de familie.';
    case 'firstName':
      return value ? null : 'Scrie prenumele.';
    case 'cnp': {
      if (!value) return 'Scrie CNP-ul.';
      const result = validateCNP(value);
      return result.valid ? null : result.errors[0];
    }
    case 'birthDate':
      return value ? null : 'Alege data nașterii.';
  }
}

/** One line naming the address on the document, for the customer to check. */
export function addressSummary(address: ExtractedAddress): string {
  return [streetLineFromIdData(address), address.city || address.sector, address.county]
    .filter(Boolean)
    .join(', ');
}

/**
 * The scanned address as a saved delivery address. Same mapping the KYC tab
 * uses: the street type belongs in the street line, and a Bucharest sector
 * stands in for the locality.
 */
export function addressFromScan(address: ExtractedAddress): AddressData {
  return {
    label: 'Adresă din act',
    country: 'RO',
    county: address.county || '',
    city: address.city || address.sector || '',
    street: [address.streetType, address.street].filter(Boolean).join(' ').trim(),
    number: address.number || '',
    building: address.building,
    staircase: address.staircase,
    floor: address.floor,
    apartment: address.apartment,
    postalCode: address.postalCode,
    isDefault: true,
  };
}
