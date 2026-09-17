import { describe, it, expect } from 'vitest';
import {
  serviceRequirements,
  serviceReadiness,
  formatMissing,
  type AccountData,
} from '@/lib/account/service-readiness';

const EMPTY_ACCOUNT: AccountData = {
  hasPersonalData: false,
  hasIdentityDocuments: false,
  hasCompanyData: false,
  hasAddress: false,
  hasBilling: false,
};

const FULL_ACCOUNT: AccountData = {
  hasPersonalData: true,
  hasIdentityDocuments: true,
  hasCompanyData: true,
  hasAddress: true,
  hasBilling: true,
};

describe('serviceRequirements', () => {
  it('reads the flags off verification_config', () => {
    const r = serviceRequirements({
      personalKyc: { enabled: true },
      companyKyc: { enabled: false },
    });
    expect(r).toEqual({ needsIdentity: true, needsCompany: false });
  });

  it('treats a missing block as "step is off"', () => {
    expect(serviceRequirements({})).toEqual({ needsIdentity: false, needsCompany: false });
    expect(serviceRequirements(null)).toEqual({ needsIdentity: false, needsCompany: false });
    expect(serviceRequirements(undefined)).toEqual({ needsIdentity: false, needsCompany: false });
  });

  it('only accepts a literal true, not a truthy value', () => {
    // The column is free-form JSON edited per service; "false" as a string
    // must not read as enabled.
    expect(serviceRequirements({ personalKyc: { enabled: 'false' } }).needsIdentity).toBe(false);
  });
});

describe('serviceReadiness', () => {
  it('is ready when the account covers everything the service needs', () => {
    const r = serviceReadiness({ needsIdentity: true, needsCompany: true }, FULL_ACCOUNT);
    expect(r.ready).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('does not ask for an identity document when the service does not need one', () => {
    const r = serviceReadiness(
      { needsIdentity: false, needsCompany: false },
      { ...EMPTY_ACCOUNT, hasAddress: true, hasBilling: true }
    );
    expect(r.ready).toBe(true);
  });

  it('does not ask for company data on a personal service', () => {
    const r = serviceReadiness(
      { needsIdentity: true, needsCompany: false },
      { ...FULL_ACCOUNT, hasCompanyData: false }
    );
    expect(r.ready).toBe(true);
    expect(r.missing).not.toContain('datele firmei');
  });

  it('lists everything still missing', () => {
    const r = serviceReadiness({ needsIdentity: true, needsCompany: true }, EMPTY_ACCOUNT);
    expect(r.ready).toBe(false);
    expect(r.missing).toEqual([
      'datele tale personale',
      'actul de identitate',
      'datele firmei',
      'adresa de livrare',
      'datele de facturare',
    ]);
  });

  it('always asks for delivery and billing, whatever the service', () => {
    const r = serviceReadiness({ needsIdentity: false, needsCompany: false }, EMPTY_ACCOUNT);
    expect(r.missing).toEqual(['adresa de livrare', 'datele de facturare']);
  });
});

describe('formatMissing', () => {
  it('reads like a sentence', () => {
    expect(formatMissing([])).toBe('');
    expect(formatMissing(['actul de identitate'])).toBe('actul de identitate');
    expect(formatMissing(['actul de identitate', 'adresa de livrare'])).toBe(
      'actul de identitate și adresa de livrare'
    );
    expect(formatMissing(['a', 'b', 'c'])).toBe('a, b și c');
  });
});
