import { describe, it, expect } from 'vitest';
import { savedPfBillingPrefill } from '@/lib/wizard/saved-billing-profile';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';

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

/**
 * The point of a saved profile: the customer must not retype it at checkout.
 * Until Faza 0 the account form collected only name/CNP/street, so the prefill
 * could never satisfy the billing step and every order asked again.
 */
describe('a profile saved by BillingProfileForm reaches checkout complete', () => {
  // Exactly the keys BillingProfileForm now writes into billing_data for a PF.
  const savedByTheAccountForm = {
    label: 'Personal',
    type: 'persoana_fizica',
    firstName: 'Ion',
    lastName: 'Popescu',
    cnp: '1234567890123',
    address: 'Str. Mihai Viteazu nr. 10, bl. A2, ap. 5',
    city: 'Constanța',
    county: 'Constanța',
    postalCode: '900001',
  };

  it('satisfies the wizard billing step without further input', () => {
    const prefill = savedPfBillingPrefill(savedByTheAccountForm);
    expect(prefill).not.toBeNull();
    expect(isPfBillingComplete(prefill)).toBe(true);
  });

  it('still falls short when localitate/județ are missing (rows saved before the fix)', () => {
    const legacy = { ...savedByTheAccountForm, city: '', county: '' };
    expect(isPfBillingComplete(savedPfBillingPrefill(legacy))).toBe(false);
  });

  it('carries a București sector through as the locality SPV requires', () => {
    const prefill = savedPfBillingPrefill({
      ...savedByTheAccountForm,
      county: 'București',
      city: 'Sector 5',
    });
    expect(prefill).toMatchObject({ county: 'București', city: 'Sector 5' });
    expect(isPfBillingComplete(prefill)).toBe(true);
  });
});
