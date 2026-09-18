import { describe, it, expect } from 'vitest';
import {
  savedAddressFromDelivery,
  sameAddress,
  sameBillingProfile,
} from '@/lib/account/sync-paid-order';

describe('savedAddressFromDelivery', () => {
  it('turns the delivery block of an order into a saved address', () => {
    expect(
      savedAddressFromDelivery({
        county: 'Cluj',
        city: 'Cluj-Napoca',
        street: 'Str. Memorandumului',
        number: '12',
        apartment: '5',
        postalCode: '400114',
        // What the courier needs and the address book does not.
        recipientName: 'Ion Popescu',
        recipientPhone: '+40712345678',
      })
    ).toEqual({
      country: 'RO',
      county: 'Cluj',
      city: 'Cluj-Napoca',
      street: 'Str. Memorandumului',
      number: '12',
      building: undefined,
      staircase: undefined,
      floor: undefined,
      apartment: '5',
      postalCode: '400114',
    });
  });

  it('saves nothing for a locker or an empty form', () => {
    expect(savedAddressFromDelivery(null)).toBeNull();
    expect(savedAddressFromDelivery({})).toBeNull();
    expect(savedAddressFromDelivery({ city: 'Cluj-Napoca' })).toBeNull();
    expect(savedAddressFromDelivery({ street: 'Str. X', number: '1' })).toBeNull();
  });
});

describe('sameAddress', () => {
  it('matches the same place however it was spelled', () => {
    const saved = { street: 'Str. Memorandumului', number: '12', city: 'Cluj-Napoca' };
    expect(sameAddress(saved, { street: 'strada memorandumului', number: 'nr. 12', city: 'CLUJ-NAPOCA' })).toBe(true);
    expect(sameAddress(saved, { street: 'Str. Memorandumului', number: '12', city: 'Cluj Napoca' })).toBe(false);
  });

  it('does not match a different number or street', () => {
    const saved = { street: 'Str. Memorandumului', number: '12', city: 'Cluj-Napoca' };
    expect(sameAddress(saved, { street: 'Str. Memorandumului', number: '14', city: 'Cluj-Napoca' })).toBe(false);
    expect(sameAddress(saved, { street: 'Str. Eroilor', number: '12', city: 'Cluj-Napoca' })).toBe(false);
    expect(sameAddress(null, saved)).toBe(false);
  });
});

describe('sameBillingProfile', () => {
  const pf = {
    label: 'Popescu Ion',
    type: 'persoana_fizica' as const,
    firstName: 'Ion',
    lastName: 'Popescu',
    cnp: '1920702351236',
    address: 'Str. X 1',
    city: 'Cluj-Napoca',
    county: 'Cluj',
  };
  const pj = {
    label: 'SC Test SRL',
    type: 'persoana_juridica' as const,
    companyName: 'SC Test SRL',
    cui: 'RO49278701',
    companyAddress: 'Str. Y 2',
  };

  it('is the same person when the CNP matches, and the same company when the CUI matches', () => {
    expect(sameBillingProfile({ type: 'persoana_fizica', cnp: '1920702351236' }, pf)).toBe(true);
    expect(sameBillingProfile({ type: 'persoana_fizica', cnp: '1920702351237' }, pf)).toBe(false);
    // „RO" prefix or not, it is the same company.
    expect(sameBillingProfile({ type: 'persoana_juridica', cui: '49278701' }, pj)).toBe(true);
    expect(sameBillingProfile({ type: 'persoana_juridica', cui: '12345678' }, pj)).toBe(false);
  });

  it('never matches across types or without an identifier', () => {
    expect(sameBillingProfile({ type: 'persoana_juridica', cui: '1920702351236' }, pf)).toBe(false);
    expect(sameBillingProfile({ type: 'persoana_fizica', cnp: '' }, { ...pf, cnp: '' })).toBe(false);
    expect(sameBillingProfile(null, pf)).toBe(false);
  });
});
