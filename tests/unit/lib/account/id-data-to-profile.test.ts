import { describe, it, expect } from 'vitest';
import {
  billingProfileFromIdData,
  hasUsableAddress,
  streetLineFromIdData,
} from '@/lib/account/id-data-to-profile';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';

/**
 * A CI front, as the OCR returns it.
 */
const scannedCi = {
  firstName: 'Ion',
  lastName: 'Popescu',
  cnp: '1960910123456',
  address: {
    street: 'Str. Memorandumului',
    number: '12',
    building: 'A2',
    apartment: '5',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    postalCode: '400114',
  },
};

describe('billingProfileFromIdData', () => {
  it('produces a profile the next order can actually use', () => {
    const profile = billingProfileFromIdData(scannedCi);
    // The old mapping folded the locality and the county into the address
    // string, which is the one shape `isPfBillingComplete` rejects: the profile
    // showed as saved in the account and the next order asked for everything
    // again.
    expect(isPfBillingComplete(profile)).toBe(true);
    expect(profile).toMatchObject({
      firstName: 'Ion',
      lastName: 'Popescu',
      cnp: '1960910123456',
      address: 'Str. Memorandumului, Nr. 12, Bl. A2, Ap. 5',
      city: 'Cluj-Napoca',
      county: 'Cluj',
      postalCode: '400114',
    });
  });

  it('returns null when the document does not carry enough', () => {
    // The back of a new CI carries the address and no name at all.
    expect(billingProfileFromIdData({ address: scannedCi.address })).toBeNull();
    // A passport read with no address is not a billing profile either.
    expect(billingProfileFromIdData({ firstName: 'Ion', lastName: 'Popescu' })).toBeNull();
    expect(billingProfileFromIdData(null)).toBeNull();
    expect(billingProfileFromIdData({})).toBeNull();
  });

  it('accepts a document with no CNP — a passport has none', () => {
    const profile = billingProfileFromIdData({ ...scannedCi, cnp: undefined });
    expect(profile).not.toBeNull();
    expect(profile?.cnp).toBe('');
  });

  it('canonicalises the county so it matches the dropdown', () => {
    expect(billingProfileFromIdData({ ...scannedCi, address: { ...scannedCi.address, county: 'CJ' } })?.county)
      .toBe('Cluj');
    expect(billingProfileFromIdData({ ...scannedCi, address: { ...scannedCi.address, county: 'Timis' } })?.county)
      .toBe('Timiș');
  });

  it('keeps the label out of the data the invoice reads', () => {
    expect(billingProfileFromIdData(scannedCi, 'Profil personal')?.label).toBe('Profil personal');
  });
});

describe('streetLineFromIdData', () => {
  it('builds only the street line — locality and county are separate fields', () => {
    expect(streetLineFromIdData(scannedCi.address)).toBe('Str. Memorandumului, Nr. 12, Bl. A2, Ap. 5');
    expect(streetLineFromIdData({ street: 'Bd. Unirii', number: '3' })).toBe('Bd. Unirii, Nr. 3');
    expect(streetLineFromIdData(undefined)).toBe('');
  });

  it('never leaks the locality into the street line', () => {
    expect(streetLineFromIdData(scannedCi.address)).not.toContain('Cluj');
  });
});

describe('hasUsableAddress', () => {
  it('needs a street and a locality to be worth saving', () => {
    expect(hasUsableAddress(scannedCi.address)).toBe(true);
    expect(hasUsableAddress({ street: 'Str. Fără Oraș' })).toBe(false);
    expect(hasUsableAddress({ city: 'Cluj-Napoca' })).toBe(false);
    expect(hasUsableAddress(null)).toBe(false);
  });
});
