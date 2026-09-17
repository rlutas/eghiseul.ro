import { describe, it, expect } from 'vitest';
import {
  isCompanyBilling,
  companyProfileFromOrder,
  personProfileFromOrder,
} from '@/lib/account/order-to-billing-profile';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';

/**
 * The shape of `customer_data.billing` on a real paid order (values replaced).
 * 439 paid orders carry this block; 313 of them have a locality and 314 a
 * county, which is what makes the block worth copying into the account.
 */
const realOrderBilling = {
  cnp: '1960910123456',
  city: 'Cluj-Napoca',
  type: 'persoana_fizica',
  county: 'Cluj',
  source: 'self',
  address: 'Str. Memorandumului nr. 12, ap. 5',
  country: 'Romania',
  isValid: true,
  lastName: 'Popescu',
  firstName: 'Ion',
  postalCode: '400114',
};

describe('personProfileFromOrder', () => {
  it('produces a profile that passes the same check the next order runs', () => {
    const profile = personProfileFromOrder(realOrderBilling, {});
    expect(profile).not.toBeNull();
    // This is the whole point: the old code stored one flattened address string
    // and no city/county, so every saved profile failed here.
    expect(isPfBillingComplete(profile)).toBe(true);
    expect(profile).toMatchObject({
      firstName: 'Ion',
      lastName: 'Popescu',
      city: 'Cluj-Napoca',
      county: 'Cluj',
      address: 'Str. Memorandumului nr. 12, ap. 5',
      postalCode: '400114',
    });
  });

  it('falls back to the scanned identity address when the order has no billing block', () => {
    const profile = personProfileFromOrder(null, {
      firstName: 'Ana',
      lastName: 'Ionescu',
      cnp: '2960910123456',
      address: {
        street: 'Bd. Unirii',
        number: '3',
        building: 'A2',
        apartment: '14',
        city: 'Sector 3',
        county: 'București',
        postalCode: '030167',
      },
    });
    expect(profile?.address).toBe('Bd. Unirii, Nr. 3, Bl. A2, Ap. 14');
    expect(profile?.city).toBe('Sector 3');
    expect(isPfBillingComplete(profile)).toBe(true);
  });

  it('returns null rather than saving a profile that cannot validate', () => {
    // 126 of the 439 paid orders have a billing block with no locality. A row
    // saved from one of those shows up in the account as a saved profile and
    // still makes the customer retype everything at the next checkout.
    expect(personProfileFromOrder({ firstName: 'Ion', lastName: 'Popescu', cnp: '1960910123456' }, {})).toBeNull();
    expect(personProfileFromOrder({ ...realOrderBilling, city: '' }, {})).toBeNull();
    expect(personProfileFromOrder({ ...realOrderBilling, county: '' }, {})).toBeNull();
    expect(personProfileFromOrder(null, {})).toBeNull();
  });

  it('saves a profile for a service that never asks for a CNP', () => {
    // Certificat constatator and extras CF do not collect one; the address is
    // still worth keeping.
    const profile = personProfileFromOrder({ ...realOrderBilling, cnp: '' }, {});
    expect(profile).not.toBeNull();
    expect(profile?.cnp).toBe('');
  });

  it('canonicalises the county so it matches an option of the account dropdown', () => {
    expect(personProfileFromOrder({ ...realOrderBilling, county: 'CJ' }, {})?.county).toBe('Cluj');
    expect(personProfileFromOrder({ ...realOrderBilling, county: 'Timis' }, {})?.county).toBe('Timiș');
  });

  it('prefers the billing block over the scanned address — the customer chose it', () => {
    const profile = personProfileFromOrder(realOrderBilling, {
      firstName: 'Altcineva',
      address: { street: 'Str. Veche', city: 'Arad', county: 'Arad' },
    });
    expect(profile?.city).toBe('Cluj-Napoca');
    expect(profile?.firstName).toBe('Ion');
  });

  it('uses the account name as a last resort', () => {
    const profile = personProfileFromOrder(
      { ...realOrderBilling, firstName: '', lastName: '' },
      {},
      { firstName: 'Maria', lastName: 'Georgescu' }
    );
    expect(profile?.firstName).toBe('Maria');
    expect(profile?.lastName).toBe('Georgescu');
  });
});

describe('isCompanyBilling', () => {
  it('recognises a company order by type or by CUI', () => {
    expect(isCompanyBilling({ type: 'persoana_juridica' })).toBe(true);
    expect(isCompanyBilling({ cui: 'RO12345678' })).toBe(true);
    expect(isCompanyBilling(realOrderBilling)).toBe(false);
    expect(isCompanyBilling(null)).toBe(false);
  });
});

describe('companyProfileFromOrder', () => {
  it('writes the registered office under the key the account form reads', () => {
    // The wizard calls it `address`, the account form `companyAddress`. Writing
    // only the wizard's key left the saved company profile with an empty office.
    const profile = companyProfileFromOrder({
      type: 'persoana_juridica',
      companyName: 'EDIGITALIZARE SRL',
      cui: 'RO40123456',
      address: 'Str. Fabricii nr. 1, Cluj-Napoca',
      registrationNumber: 'J12/345/2019',
    });
    expect(profile.companyAddress).toBe('Str. Fabricii nr. 1, Cluj-Napoca');
    expect(profile.regCom).toBe('J12/345/2019');
    expect(profile.label).toBe('EDIGITALIZARE SRL');
  });

  it('keeps an explicit companyAddress when the order already has one', () => {
    const profile = companyProfileFromOrder({
      cui: 'RO40123456',
      address: 'adresa de livrare',
      companyAddress: 'sediul social',
    });
    expect(profile.companyAddress).toBe('sediul social');
  });
});
