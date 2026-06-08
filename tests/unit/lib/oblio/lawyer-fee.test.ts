/**
 * Tests for the "Onorariu Avocat" (lawyer fee) split on invoices.
 *
 * For certain services (cazier judiciar/fiscal, certificate naștere/căsătorie/
 * integritate/celibat) the invoice must show a separate "Onorariu Avocat" line
 * worth a fixed amount (15 RON), taken OUT of the main service line so the
 * total stays the same. The amount is configured per service in the DB
 * (services.lawyer_fee_ron); services without it keep a single line.
 */

import { describe, it, expect } from 'vitest';
import { computeLawyerFee } from '@/lib/oblio/invoice';

describe('computeLawyerFee', () => {
  it('splits 15 RON out of the service price', () => {
    expect(computeLawyerFee(198, 15)).toEqual({ servicePrice: 183, lawyerFee: 15 });
  });

  it('no split when the service has no lawyer fee configured', () => {
    expect(computeLawyerFee(198, 0)).toEqual({ servicePrice: 198, lawyerFee: 0 });
    expect(computeLawyerFee(198, undefined)).toEqual({ servicePrice: 198, lawyerFee: 0 });
    expect(computeLawyerFee(198, null)).toEqual({ servicePrice: 198, lawyerFee: 0 });
  });

  it('no split when the base price is too small to carve out the fee', () => {
    expect(computeLawyerFee(15, 15)).toEqual({ servicePrice: 15, lawyerFee: 0 });
    expect(computeLawyerFee(10, 15)).toEqual({ servicePrice: 10, lawyerFee: 0 });
  });

  it('keeps cents exact (no IEEE-754 drift)', () => {
    expect(computeLawyerFee(199.99, 15)).toEqual({ servicePrice: 184.99, lawyerFee: 15 });
    expect(computeLawyerFee(278, 15)).toEqual({ servicePrice: 263, lawyerFee: 15 });
  });

  it('service + lawyer fee always re-sum to the original base price', () => {
    for (const base of [49.9, 198, 250, 278, 1514.21]) {
      const { servicePrice, lawyerFee } = computeLawyerFee(base, 15);
      expect(Math.round((servicePrice + lawyerFee) * 100) / 100).toBe(
        Math.round(base * 100) / 100,
      );
    }
  });
});
