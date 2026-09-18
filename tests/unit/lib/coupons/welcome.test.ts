import { describe, it, expect } from 'vitest';
import { welcomeCouponIsUsable, WELCOME_DISCOUNT_PERCENT, WELCOME_VALIDITY_DAYS } from '@/lib/coupons/welcome';

const now = new Date('2026-09-18T10:00:00Z');
const base = {
  code: 'BUNVENIT-ABCDEFGH',
  discount_value: 10,
  valid_until: '2026-10-18T10:00:00Z',
  is_active: true,
  max_uses: 1,
  times_used: 0,
};

describe('welcomeCouponIsUsable', () => {
  it('is usable while active, unused and in date', () => {
    expect(welcomeCouponIsUsable(base, now)).toBe(true);
  });

  it('is not shown once used, expired, or switched off', () => {
    expect(welcomeCouponIsUsable({ ...base, times_used: 1 }, now)).toBe(false);
    expect(welcomeCouponIsUsable({ ...base, valid_until: '2026-09-17T10:00:00Z' }, now)).toBe(false);
    expect(welcomeCouponIsUsable({ ...base, is_active: false }, now)).toBe(false);
    expect(welcomeCouponIsUsable(null, now)).toBe(false);
  });

  it('keeps the offer as decided: 10% for 30 days', () => {
    expect(WELCOME_DISCOUNT_PERCENT).toBe(10);
    expect(WELCOME_VALIDITY_DAYS).toBe(30);
  });
});
