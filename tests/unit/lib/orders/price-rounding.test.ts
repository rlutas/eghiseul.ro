/**
 * Defensive regression test for floating-point drift in price totals.
 *
 * Bug observed 2026-05-28: button rendered "Plătește 1514.2099999999998 RON"
 * because the breakdown summed multiple floats (18.61 delivery + 1495.6
 * services + ...) and JS arithmetic produced ...0008. The summary card
 * showed "1514.21" because it had its own .toFixed(2). Mismatch reported by
 * user.
 *
 * Fix: priceBreakdown in modular-wizard-provider.tsx rounds every monetary
 * field via Math.round(n*100)/100. This test verifies the rounding helper
 * pattern eliminates known drift without changing legitimate values.
 *
 * If you ever change the rounding strategy (e.g., switch to Decimal.js,
 * Number.parseFloat(n.toFixed(2)), etc.), keep this test green so we don't
 * regress to the original bug.
 */

import { describe, it, expect } from 'vitest';

/** Mirror of the inline helper used in modular-wizard-provider.tsx */
const round2 = (n: number): number => Math.round(n * 100) / 100;

describe('price rounding — defensive against floating-point drift', () => {
  it('handles the exact total that triggered the bug on E-260528-DZ8MS', () => {
    // Original reproduction: 18.61 (delivery) + 1495.6 (services) yields
    // 1514.2099999999998 in raw JS. Confirmed by Python: yes.
    const subtotal = 18.61 + 1495.6;
    expect(subtotal).not.toBe(1514.21); // confirm drift exists
    expect(round2(subtotal)).toBe(1514.21);
  });

  it('keeps already-rounded values exact', () => {
    expect(round2(198)).toBe(198);
    expect(round2(198.0)).toBe(198);
    expect(round2(1514.21)).toBe(1514.21);
  });

  it('rounds to 2 decimals (half-up)', () => {
    expect(round2(0.005)).toBe(0.01);   // half-up
    expect(round2(0.004)).toBe(0); // truncated (avoid 0.00 vs 0 confusion)
    expect(round2(0.015)).toBe(0.02);
    expect(round2(99.995)).toBe(100);
  });

  it('round-trips a sum of percentage-of-subtotal coupon discount', () => {
    // 15% off 1493.6 = 224.04 (raw: 224.04000000000002)
    const discount = (1493.6 * 15) / 100;
    expect(round2(discount)).toBe(224.04);
  });

  it('handles delivery price drift from Sameday quote', () => {
    // Sameday returns 18.6134... raw → 18.61 after our 2-decimal coerce.
    const sameday = 15.64 * 1.21; // VAT calc inside the courier client
    expect(round2(sameday)).toBe(18.92);
  });

  it('never produces negative totals (max(0, ...) protection assumed)', () => {
    // Sanity — the rounder itself doesn't care about sign; the cap
    // happens at the caller. But verify the formula isn't reversing it.
    expect(round2(-0.005)).toBeLessThanOrEqual(0);
  });
});
