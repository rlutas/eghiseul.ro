/**
 * Pure-function validation helper for the foreign-citizen branch of the
 * personal-KYC step. Mirrors the inline `isFormValid` logic in
 * `PersonalDataStep.tsx` so it can be unit-tested without rendering React.
 *
 * Rules (added 2026-04-29):
 *  - CNP optional for foreign citizens (Romanian → required, valid).
 *  - Foreign citizens must provide birth city + birth country (collected
 *    at step 1).
 *  - Domicile address is split:
 *      - hasRomanianAddress === true  → Romanian street + city + county required
 *      - hasRomanianAddress === false → foreignAddress text required
 */

import { validateCNP } from './cnp';

export interface ForeignKycValidationInput {
  citizenship?: 'romanian' | 'european' | 'foreign';
  cnp?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  foreignData?: {
    birthCity?: string;
    birthCountry?: string;
    hasRomanianAddress?: boolean;
    foreignAddress?: string;
  };
  address?: {
    street?: string;
    city?: string;
    county?: string;
  };
}

/** Returns null when valid, or a string code for the first failed rule. */
export function validateForeignKyc(
  input: ForeignKycValidationInput
): string | null {
  const isForeign =
    !!input.citizenship && input.citizenship !== 'romanian';

  // CNP — required for Romanian, optional for foreign (but if filled, must be valid).
  if (!isForeign) {
    if (!input.cnp || !validateCNP(input.cnp).valid) return 'cnp_invalid';
  } else if (input.cnp && input.cnp.length > 0) {
    if (!validateCNP(input.cnp).valid) return 'cnp_invalid';
  }

  if (!input.firstName?.trim()) return 'first_name_required';
  if (!input.lastName?.trim()) return 'last_name_required';
  if (!input.birthDate) return 'birth_date_required';

  if (isForeign) {
    if (!input.foreignData?.birthCity?.trim()) return 'birth_city_required';
    if (!input.foreignData?.birthCountry) return 'birth_country_required';

    const hasRomanianAddress = input.foreignData?.hasRomanianAddress ?? true;
    if (hasRomanianAddress) {
      if (!input.address?.street?.trim()) return 'street_required';
      if (!input.address?.city?.trim()) return 'city_required';
      if (!input.address?.county?.trim()) return 'county_required';
    } else {
      if (!input.foreignData?.foreignAddress?.trim()) {
        return 'foreign_address_required';
      }
    }
  }

  return null;
}
