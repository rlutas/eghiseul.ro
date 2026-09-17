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
  hasVehicle: false,
};

const FULL_ACCOUNT: AccountData = {
  hasPersonalData: true,
  hasIdentityDocuments: true,
  hasCompanyData: true,
  hasAddress: true,
  hasBilling: true,
  hasVehicle: true,
};

const NO_MODULES = {
  needsIdentity: false,
  needsCompany: false,
  needsProperty: false,
  needsCivilStatus: false,
  needsVehicle: false,
  needsConstatator: false,
  needsConventie: false,
  needsSignature: false,
};

describe('serviceRequirements', () => {
  it('reads every module off verification_config, not just two', () => {
    // The first version read personalKyc and companyKyc only, which is why it
    // claimed "we have everything" for most of the catalogue.
    const r = serviceRequirements({
      personalKyc: { enabled: true },
      companyKyc: { enabled: true },
      propertyVerification: { enabled: true },
      civilStatus: { enabled: true },
      vehicleVerification: { enabled: true },
      constatator: { enabled: true },
      conventie: { enabled: true },
      signature: { required: true },
    });
    expect(r).toEqual({
      needsIdentity: true,
      needsCompany: true,
      needsProperty: true,
      needsCivilStatus: true,
      needsVehicle: true,
      needsConstatator: true,
      needsConventie: true,
      needsSignature: true,
    });
  });

  it('treats a missing block as "step is off"', () => {
    expect(serviceRequirements({})).toEqual(NO_MODULES);
    expect(serviceRequirements(null)).toEqual(NO_MODULES);
    expect(serviceRequirements(undefined)).toEqual(NO_MODULES);
  });

  it('only accepts a literal true, not a truthy value', () => {
    expect(serviceRequirements({ personalKyc: { enabled: 'false' } }).needsIdentity).toBe(false);
    expect(serviceRequirements({ personalKyc: { enabled: 1 } }).needsIdentity).toBe(false);
  });

  it('reads `required` for signature, which is not an `enabled` flag', () => {
    expect(serviceRequirements({ signature: { enabled: true } }).needsSignature).toBe(false);
    expect(serviceRequirements({ signature: { required: true } }).needsSignature).toBe(true);
  });
});

describe('serviceReadiness', () => {
  it('is ready only when nothing further will be asked', () => {
    const r = serviceReadiness({ ...NO_MODULES, needsIdentity: true }, FULL_ACCOUNT);
    expect(r.ready).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('never claims ready for a property service, however full the account', () => {
    // The land registry number belongs to the request, not to the person — the
    // account cannot ever hold it. This is the case that used to lie, on 20 of
    // 31 active services.
    const r = serviceReadiness({ ...NO_MODULES, needsProperty: true }, FULL_ACCOUNT);
    expect(r.ready).toBe(false);
    expect(r.missing).toContain('datele imobilului (număr carte funciară sau cadastral)');
  });

  it('never claims ready for civil status, conventie or constatator', () => {
    for (const flag of ['needsCivilStatus', 'needsConventie', 'needsConstatator'] as const) {
      const r = serviceReadiness({ ...NO_MODULES, [flag]: true }, FULL_ACCOUNT);
      expect(r.ready, flag).toBe(false);
      expect(r.missing.length, flag).toBeGreaterThan(0);
    }
  });

  it('asks for the vehicle only when the service needs one', () => {
    const withVehicle = serviceReadiness({ ...NO_MODULES, needsVehicle: true }, {
      ...FULL_ACCOUNT,
      hasVehicle: false,
    });
    expect(withVehicle.missing).toContain('datele mașinii sau ale permisului');

    const without = serviceReadiness(NO_MODULES, { ...FULL_ACCOUNT, hasVehicle: false });
    expect(without.missing).not.toContain('datele mașinii sau ale permisului');
  });

  it('does not ask for an identity document when the service does not need one', () => {
    // 20 of 31 active services have no personalKyc — and we do not file an ID
    // with ONRC ourselves either.
    const r = serviceReadiness(NO_MODULES, { ...EMPTY_ACCOUNT, hasAddress: true, hasBilling: true });
    expect(r.ready).toBe(true);
    expect(r.missing).not.toContain('actul de identitate');
  });

  it('always asks for delivery and billing when the account lacks them', () => {
    const r = serviceReadiness(NO_MODULES, EMPTY_ACCOUNT);
    expect(r.missing).toEqual(['adresa de livrare', 'datele de facturare']);
  });

  it('lists what the account is missing before what it can never hold', () => {
    const r = serviceReadiness(
      { ...NO_MODULES, needsIdentity: true, needsProperty: true },
      EMPTY_ACCOUNT
    );
    expect(r.missing.indexOf('actul de identitate')).toBeLessThan(
      r.missing.indexOf('datele imobilului (număr carte funciară sau cadastral)')
    );
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
