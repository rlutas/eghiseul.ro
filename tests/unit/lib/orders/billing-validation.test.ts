/**
 * Tests for PF billing completeness — the data Oblio needs to issue an invoice
 * for an individual (persoană fizică). Romanian e-invoicing requires the client
 * address split into street + locality + county; an empty address makes Oblio
 * reject the invoice. The wizard must therefore require all three.
 */

import { describe, it, expect } from 'vitest';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';

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
