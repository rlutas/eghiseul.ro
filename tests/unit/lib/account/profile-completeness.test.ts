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

  it('opens the form directly on the tabs that hide it behind a button', () => {
    // Landing on a read-only tab makes the checklist row look broken — reported
    // as soon as it shipped. KYC is exempt: that tab IS the uploader.
    const steps = profileCompleteness(EMPTY).steps;
    for (const id of ['contact', 'personal', 'address', 'billing']) {
      expect(steps.find((s) => s.id === id)?.href, id).toContain('edit=1');
    }
    expect(steps.find((s) => s.id === 'identity')?.href).not.toContain('edit=1');
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

describe('the identity step follows the onboarding answer', () => {
  const base = {
    firstName: 'Ion',
    lastName: 'Popescu',
    cnp: '1960910123456',
    phone: '0721000000',
    savedAddressCount: 1,
    billingProfileCount: 1,
  };

  it('stays while the question has not been answered', () => {
    // NULL means we know nothing about this person yet, which is not the same
    // as "answered, and no document needed".
    for (const interests of [undefined, null, []]) {
      const result = profileCompleteness({ ...base, serviceInterests: interests });
      expect(result.steps.map((s) => s.id)).toContain('identity');
      expect(result.isComplete).toBe(false);
    }
  });

  it('disappears for a customer who only wants property or company documents', () => {
    // 20 of the 31 active services never ask for an identity document, and we
    // do not hand one to ONRC either. Telling this customer their profile is
    // 80% complete because of a document nobody will ask for is a lie.
    const result = profileCompleteness({ ...base, serviceInterests: ['imobile', 'firma'] });
    expect(result.steps.map((s) => s.id)).not.toContain('identity');
    expect(result.totalCount).toBe(4);
    expect(result.percent).toBe(100);
    expect(result.isComplete).toBe(true);
  });

  it('stays for a customer who wants a cazier', () => {
    const result = profileCompleteness({ ...base, serviceInterests: ['imobile', 'caziere'] });
    expect(result.steps.map((s) => s.id)).toContain('identity');
    expect(result.isComplete).toBe(false);
  });

  it('never hides a document that is already on file', () => {
    // The request goes away; the document does not. It is real, it is shown as
    // done, and it keeps counting.
    const result = profileCompleteness({
      ...base,
      kycDocumentTypes: ['ci_front', 'selfie'],
      serviceInterests: ['imobile'],
    });
    const identity = result.steps.find((s) => s.id === 'identity');
    expect(identity?.done).toBe(true);
    expect(result.totalCount).toBe(5);
  });
});
