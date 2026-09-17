/**
 * Locality options offered for a billing county. Shared by the wizard's billing
 * step and the account's billing profile form — if the two disagreed, a profile
 * saved in the account would hold a locality the wizard's dropdown cannot show,
 * and the prefill would silently drop it.
 */

import { describe, it, expect } from 'vitest';
import { billingLocalityOptions } from '@/lib/orders/billing-locality';

describe('billingLocalityOptions', () => {
  it('returns nothing when no county is selected', () => {
    expect(billingLocalityOptions(undefined)).toEqual([]);
    expect(billingLocalityOptions(null)).toEqual([]);
    expect(billingLocalityOptions('')).toEqual([]);
  });

  it('offers exactly the six sectors for București (SPV refuses anything else)', () => {
    const expected = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'];
    expect(billingLocalityOptions('București')).toEqual(expected);
    expect(billingLocalityOptions('Bucuresti')).toEqual(expected);
    expect(billingLocalityOptions('B')).toEqual(expected);
  });

  it('never offers „Municipiul Bucuresti" as a billing locality', () => {
    expect(billingLocalityOptions('București')).not.toContain('Municipiul Bucuresti');
  });

  it('returns the real localities for an ordinary county', () => {
    const cluj = billingLocalityOptions('Cluj');
    expect(cluj.length).toBeGreaterThan(1);
    expect(cluj.some((l) => l.includes('Cluj-Napoca'))).toBe(true);
  });

  it('accepts a county code as well as a name', () => {
    expect(billingLocalityOptions('SM')).toEqual(billingLocalityOptions('Satu Mare'));
  });

  it('returns nothing for a county that does not exist', () => {
    expect(billingLocalityOptions('Nicăieri')).toEqual([]);
  });
});
