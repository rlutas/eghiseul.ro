import { describe, it, expect } from 'vitest';
import { missingAddressDetails, sameAddress } from '@/lib/account/same-address';

describe('missingAddressDetails', () => {
  const saved = { street: 'Salcâmilor', number: '2', city: 'Odoreu', county: 'Satu Mare' };

  it('returns the details the candidate adds to the same place', () => {
    const typed = { ...saved, apartment: '12', postalCode: '447220' };
    expect(sameAddress(saved, typed)).toBe(true);
    expect(missingAddressDetails(saved, typed)).toEqual({ apartment: '12', postalCode: '447220' });
  });

  it('never overwrites what the saved row already has', () => {
    const richer = { ...saved, apartment: '7' };
    expect(missingAddressDetails(richer, { ...saved, apartment: '7', floor: '2' })).toEqual({ floor: '2' });
    expect(missingAddressDetails(richer, { ...saved })).toBeNull();
  });
});
