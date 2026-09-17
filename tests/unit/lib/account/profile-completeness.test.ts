import { describe, it, expect } from 'vitest';
import {
  profileCompleteness,
  hasIdentityDocuments,
  type ProfileInput,
} from '@/lib/account/profile-completeness';

const EMPTY: ProfileInput = {};

const FULL: ProfileInput = {
  firstName: 'Ion',
  lastName: 'Popescu',
  cnp: '1900101410011',
  phone: '0722333444',
  birthDate: '1990-01-01',
  kycDocumentTypes: ['ci_front', 'selfie'],
  savedAddressCount: 1,
  billingProfileCount: 1,
};

describe('profileCompleteness', () => {
  it('reports nothing done for a fresh account', () => {
    const r = profileCompleteness(EMPTY);
    expect(r.doneCount).toBe(0);
    expect(r.percent).toBe(0);
    expect(r.isComplete).toBe(false);
    expect(r.nextStep?.id).toBe('contact');
  });

  it('reports everything done for a filled profile', () => {
    const r = profileCompleteness(FULL);
    expect(r.doneCount).toBe(r.totalCount);
    expect(r.percent).toBe(100);
    expect(r.isComplete).toBe(true);
    expect(r.nextStep).toBeNull();
  });

  it('points at the first missing step, in order', () => {
    const r = profileCompleteness({ ...FULL, savedAddressCount: 0, billingProfileCount: 0 });
    expect(r.nextStep?.id).toBe('address');
  });

  it('treats whitespace as not filled', () => {
    const r = profileCompleteness({ ...FULL, phone: '   ' });
    expect(r.steps.find((s) => s.id === 'contact')?.done).toBe(false);
  });

  it('needs first name, last name AND cnp for personal data', () => {
    const noCnp = profileCompleteness({ ...FULL, cnp: null });
    expect(noCnp.steps.find((s) => s.id === 'personal')?.done).toBe(false);

    const noLast = profileCompleteness({ ...FULL, lastName: '' });
    expect(noLast.steps.find((s) => s.id === 'personal')?.done).toBe(false);
  });

  it('every step points at a tab of the account', () => {
    for (const step of profileCompleteness(EMPTY).steps) {
      expect(step.href, step.id).toMatch(/^\/account\/\?tab=/);
    }
  });

  it('phrases the benefit for the customer, never as a restriction', () => {
    for (const step of profileCompleteness(EMPTY).steps) {
      expect(step.benefit, step.id).not.toMatch(/nu po[țt]i|obligatoriu|necesar pentru a comanda/i);
    }
  });

  it('percent is a whole number between 0 and 100', () => {
    for (const n of [0, 1, 2, 3, 4, 5]) {
      const r = profileCompleteness({
        phone: n > 0 ? '07' : null,
        firstName: n > 1 ? 'A' : null,
        lastName: n > 1 ? 'B' : null,
        cnp: n > 1 ? '1' : null,
        kycDocumentTypes: n > 2 ? ['ci_front', 'selfie'] : [],
        savedAddressCount: n > 3 ? 1 : 0,
        billingProfileCount: n > 4 ? 1 : 0,
      });
      expect(r.doneCount).toBe(n);
      expect(Number.isInteger(r.percent)).toBe(true);
      expect(r.percent).toBeGreaterThanOrEqual(0);
      expect(r.percent).toBeLessThanOrEqual(100);
    }
  });
});

describe('hasIdentityDocuments', () => {
  it('requires both a document and a selfie', () => {
    expect(hasIdentityDocuments(['ci_front'])).toBe(false);
    expect(hasIdentityDocuments(['selfie'])).toBe(false);
    expect(hasIdentityDocuments(['ci_front', 'selfie'])).toBe(true);
  });

  it('accepts every shape of identity document the wizard can produce', () => {
    // The scan route writes ci_front/ci_vechi, the manual route act_identitate,
    // foreign citizens passport/passport_opened. All of them are an ID.
    for (const front of ['ci_front', 'ci_nou_front', 'ci_vechi', 'act_identitate', 'passport', 'passport_opened']) {
      expect(hasIdentityDocuments([front, 'selfie']), front).toBe(true);
    }
  });

  it('does not count an address certificate as identity', () => {
    expect(hasIdentityDocuments(['certificat_domiciliu', 'selfie'])).toBe(false);
  });

  it('survives an empty or missing list', () => {
    expect(hasIdentityDocuments()).toBe(false);
    expect(hasIdentityDocuments([])).toBe(false);
  });
});
