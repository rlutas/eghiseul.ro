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
    // as soon as it shipped.
    const steps = profileCompleteness(EMPTY).steps;
    for (const id of ['contact', 'personal', 'address', 'billing']) {
      expect(steps.find((s) => s.id === id)?.href, id).toContain('edit=1');
    }
  });

  it('phrases the benefit for the customer, never as a restriction', () => {
    for (const step of profileCompleteness(EMPTY).steps) {
      expect(step.benefit, step.id).not.toMatch(/nu po[țt]i|obligatoriu|necesar pentru a comanda/i);
    }
  });

  it('percent is a whole number between 0 and 100', () => {
    for (const n of [0, 1, 2, 3, 4]) {
      const r = profileCompleteness({
        phone: n > 0 ? '07' : null,
        firstName: n > 1 ? 'A' : null,
        lastName: n > 1 ? 'B' : null,
        cnp: n > 1 ? '1' : null,
        savedAddressCount: n > 2 ? 1 : 0,
        billingProfileCount: n > 3 ? 1 : 0,
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

describe('the identity document is not a step of the account', () => {
  // Uploading it in the account meant a second ask right after the personal
  // data scan, and a document months old by the time an order needed it. The
  // order form asks for it, fresh, only for the services that need it.
  const base = {
    firstName: 'Ion',
    lastName: 'Popescu',
    cnp: '1960910123456',
    phone: '0721000000',
    savedAddressCount: 1,
    billingProfileCount: 1,
  };

  it('is never asked for, whatever the customer came for', () => {
    const result = profileCompleteness(base);
    expect(result.steps.map((s) => s.id)).toEqual(['contact', 'personal', 'address', 'billing']);
    expect(result.totalCount).toBe(4);
    expect(result.percent).toBe(100);
    expect(result.isComplete).toBe(true);
  });
});

describe('done rows say what is saved', () => {
  it('shows the value on a done row and the benefit on the rest', () => {
    const result = profileCompleteness({
      firstName: 'Ion',
      lastName: 'Popescu',
      cnp: '1960910123456',
      phone: '+40712345678',
      savedAddressCount: 1,
      addressSummary: 'Str. Memorandumului 12, Cluj-Napoca',
      billingProfileCount: 0,
    });
    const by = Object.fromEntries(result.steps.map((s) => [s.id, s]));
    expect(by.contact.summary).toBe('+40712345678');
    // Family name first, the Romanian way — never `${first} ${last}`.
    expect(by.personal.summary).toBe('Popescu Ion');
    expect(by.address.summary).toBe('Str. Memorandumului 12, Cluj-Napoca');
    expect(by.billing.done).toBe(false);
    expect(by.billing.summary).toBeNull();
  });

  it('has no summary for a row that is not done, even if a value leaks in', () => {
    const result = profileCompleteness({ phone: null, addressSummary: 'x', savedAddressCount: 0 });
    expect(result.steps.find((s) => s.id === 'address')?.summary).toBe('x');
    expect(result.steps.find((s) => s.id === 'address')?.done).toBe(false);
  });
});
