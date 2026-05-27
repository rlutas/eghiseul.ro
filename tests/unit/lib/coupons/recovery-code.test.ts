import { describe, expect, it } from 'vitest';
import {
  generateRecoveryCouponCode,
  isRecoveryCouponCode,
  RECOVERY_ALPHABET,
} from '@/lib/coupons/recovery-code';

// Recovery coupon codes go to customers via email — they get typed on a
// phone keyboard. The alphabet must avoid look-alike glyphs (0/O, 1/I/L)
// so the cron doesn't generate codes that confuse customers and erode the
// recovery rate. Length + prefix are part of the public contract sister
// projects share, so changes here ripple across reporting.

describe('generateRecoveryCouponCode', () => {
  it('produces a 17-character code (RECOVERY- + 8 body)', () => {
    const code = generateRecoveryCouponCode();
    expect(code.length).toBe('RECOVERY-'.length + 8);
    expect(code).toMatch(/^RECOVERY-[A-Z2-9]{8}$/);
  });

  it('starts with the RECOVERY- prefix', () => {
    const code = generateRecoveryCouponCode();
    expect(code.startsWith('RECOVERY-')).toBe(true);
  });

  it('only uses characters from the curated alphabet', () => {
    // Pin the alphabet so a future change forces a deliberate review.
    expect(RECOVERY_ALPHABET).toBe('ABCDEFGHJKMNPQRSTUVWXYZ23456789');
    // Run many times — any character outside the alphabet is a regression.
    for (let i = 0; i < 200; i++) {
      const code = generateRecoveryCouponCode();
      const body = code.slice('RECOVERY-'.length);
      for (const ch of body) {
        expect(RECOVERY_ALPHABET).toContain(ch);
      }
    }
  });

  it('never produces look-alike characters (0/O, 1/I/L) in the body', () => {
    const FORBIDDEN = ['0', 'O', '1', 'I', 'L'];
    for (let i = 0; i < 500; i++) {
      const body = generateRecoveryCouponCode().slice('RECOVERY-'.length);
      for (const ch of FORBIDDEN) {
        expect(body).not.toContain(ch);
      }
    }
  });

  it('is deterministic when given an injected RNG (testability hook)', () => {
    // The signature accepts a custom RNG so tests can pin the output.
    // `() => 0` always picks the first alphabet character (A).
    expect(generateRecoveryCouponCode(() => 0)).toBe('RECOVERY-AAAAAAAA');
    // `() => 0.9999` picks the last (9).
    expect(generateRecoveryCouponCode(() => 0.9999)).toBe('RECOVERY-99999999');
  });

  it('produces distinct codes across runs with Math.random', () => {
    // Loose anti-collision check — 1000 codes should give very high
    // distinct count. Birthday-bound: 1000 codes from a ~10^12 space.
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generateRecoveryCouponCode());
    expect(seen.size).toBeGreaterThan(995);
  });
});

describe('isRecoveryCouponCode', () => {
  it('accepts a freshly generated code', () => {
    for (let i = 0; i < 50; i++) {
      expect(isRecoveryCouponCode(generateRecoveryCouponCode())).toBe(true);
    }
  });

  it('rejects admin-issued codes that share the prefix accidentally', () => {
    // Admin can pick whatever code they want — we shouldn't claim those.
    expect(isRecoveryCouponCode('RECOVERY-blacklist')).toBe(false); // lowercase
    expect(isRecoveryCouponCode('RECOVERY-AB23')).toBe(false);       // too short
    expect(isRecoveryCouponCode('RECOVERY-AB23CDEFG')).toBe(false);  // too long
    expect(isRecoveryCouponCode('RECOVERY-0BCDEFGH')).toBe(false);   // contains 0
    expect(isRecoveryCouponCode('RECOVERY-1BCDEFGH')).toBe(false);   // contains 1
  });

  it('rejects codes without the prefix', () => {
    expect(isRecoveryCouponCode('CAZIER10')).toBe(false);
    expect(isRecoveryCouponCode('')).toBe(false);
    expect(isRecoveryCouponCode('recovery-AB23CDEF')).toBe(false); // lowercase prefix
  });
});
