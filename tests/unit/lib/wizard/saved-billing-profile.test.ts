import { describe, it, expect } from 'vitest';
import { savedPfBillingPrefill } from '@/lib/wizard/saved-billing-profile';

describe('savedPfBillingPrefill', () => {
  it('returns null when there is no profile', () => {
    expect(savedPfBillingPrefill(null)).toBeNull();
    expect(savedPfBillingPrefill(undefined)).toBeNull();
  });

  it('returns null for a profile that carries only a label', () => {
    expect(savedPfBillingPrefill({ label: 'Profil personal', isDefault: true })).toBeNull();
  });

  it('maps the fields BillingProfileForm actually saves', () => {
    expect(
      savedPfBillingPrefill({
        firstName: ' Ion ',
        lastName: 'Popescu',
        cnp: '1234567890123',
        address: 'Str. Mihai Viteazu nr. 10',
      }),
    ).toEqual({
      firstName: 'Ion',
      lastName: 'Popescu',
      cnp: '1234567890123',
      address: 'Str. Mihai Viteazu nr. 10',
      city: '',
      county: '',
      postalCode: '',
      country: 'Romania',
    });
  });

  it('strips non-digits from the CNP', () => {
    expect(savedPfBillingPrefill({ cnp: '1234 567-890123' })?.cnp).toBe('1234567890123');
  });

  it('canonicalises a domestic county so it matches the dropdown', () => {
    expect(savedPfBillingPrefill({ firstName: 'Ion', county: 'SM' })?.county).toBe('Satu Mare');
    expect(savedPfBillingPrefill({ firstName: 'Ion', county: 'Nicăieri' })?.county).toBe('');
  });

  it('keeps a foreign region as free text (Oblio accepts it)', () => {
    expect(
      savedPfBillingPrefill({ firstName: 'Ion', country: 'Germania', county: 'Bavaria' }),
    ).toMatchObject({ country: 'Germania', county: 'Bavaria' });
  });
});
