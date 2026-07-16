/**
 * Tests for PF billing completeness — the data Oblio needs to issue an invoice
 * for an individual (persoană fizică). Romanian e-invoicing requires the client
 * address split into street + locality + county; an empty address makes Oblio
 * reject the invoice. The wizard must therefore require all three.
 */

import { describe, it, expect } from 'vitest';
import { isPfBillingComplete, isForeignBillingCountry } from '@/lib/orders/billing-validation';

const complete = {
  firstName: 'Iulia',
  lastName: 'Moraras',
  cnp: '2820307134160',
  address: 'Str. Mihai Viteazu nr. 10',
  city: 'Constanța',
  county: 'Constanța',
};

describe('isPfBillingComplete', () => {
  it('returns true when name, CNP and full address are present', () => {
    expect(isPfBillingComplete(complete)).toBe(true);
  });

  it('returns false when the street/address line is missing (passport case)', () => {
    expect(isPfBillingComplete({ ...complete, address: '' })).toBe(false);
    expect(isPfBillingComplete({ ...complete, address: '   ' })).toBe(false);
  });

  it('returns false when locality is missing', () => {
    expect(isPfBillingComplete({ ...complete, city: '' })).toBe(false);
  });

  it('returns false when county is missing', () => {
    expect(isPfBillingComplete({ ...complete, county: undefined })).toBe(false);
  });

  it('returns false when CNP or name missing', () => {
    expect(isPfBillingComplete({ ...complete, cnp: '' })).toBe(false);
    expect(isPfBillingComplete({ ...complete, firstName: '' })).toBe(false);
    expect(isPfBillingComplete({ ...complete, lastName: '' })).toBe(false);
  });

  it('returns false for null/empty input', () => {
    expect(isPfBillingComplete(null)).toBe(false);
    expect(isPfBillingComplete(undefined)).toBe(false);
    expect(isPfBillingComplete({})).toBe(false);
  });
});

describe('isForeignBillingCountry', () => {
  it('treats empty/Romania variants as domestic', () => {
    expect(isForeignBillingCountry(undefined)).toBe(false);
    expect(isForeignBillingCountry(null)).toBe(false);
    expect(isForeignBillingCountry('')).toBe(false);
    expect(isForeignBillingCountry('   ')).toBe(false);
    expect(isForeignBillingCountry('Romania')).toBe(false);
    expect(isForeignBillingCountry('România')).toBe(false);
    expect(isForeignBillingCountry('ROMÂNIA')).toBe(false);
    expect(isForeignBillingCountry('ro')).toBe(false);
    expect(isForeignBillingCountry('RO')).toBe(false);
  });

  it('treats any other country as foreign', () => {
    expect(isForeignBillingCountry('Germania')).toBe(true);
    expect(isForeignBillingCountry('Italia')).toBe(true);
    expect(isForeignBillingCountry('Elveția')).toBe(true);
    expect(isForeignBillingCountry('United Kingdom')).toBe(true);
  });
});

describe('isPfBillingComplete — foreign billing country', () => {
  const foreign = {
    firstName: 'Miklos',
    lastName: 'Nyeste',
    address: 'Anger 5',
    city: 'Töpen',
    country: 'Germania',
  };

  it('is complete without CNP and without county when country is foreign', () => {
    expect(isPfBillingComplete(foreign)).toBe(true);
  });

  it('accepts an optional region in county', () => {
    expect(isPfBillingComplete({ ...foreign, county: 'Bavaria' })).toBe(true);
  });

  it('still requires name, address and city', () => {
    expect(isPfBillingComplete({ ...foreign, address: '' })).toBe(false);
    expect(isPfBillingComplete({ ...foreign, city: '' })).toBe(false);
    expect(isPfBillingComplete({ ...foreign, firstName: '' })).toBe(false);
  });

  it('keeps domestic rules for Romania variants (CNP + county required)', () => {
    for (const country of ['Romania', 'România', 'RO', '', undefined]) {
      expect(
        isPfBillingComplete({ ...complete, country, cnp: '' }),
      ).toBe(false);
      expect(
        isPfBillingComplete({ ...complete, country, county: '' }),
      ).toBe(false);
      expect(isPfBillingComplete({ ...complete, country })).toBe(true);
    }
  });
});
