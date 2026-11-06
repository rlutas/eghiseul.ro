import { describe, it, expect } from 'vitest';
import {
  BLACK_FRIDAY_CODE,
  blackFridayRate,
  couponAmount,
  isBlackFridayActive,
  isExpiredBlackFridayCampaign,
} from '@/lib/coupons/black-friday';
import { couponDiscount, type CouponRow } from '@/lib/orders/server-pricing';

const row: CouponRow = { code: BLACK_FRIDAY_CODE, discount_type: 'percentage', discount_value: 10 };

describe('Black Friday coupon', () => {
  it('gives 20% on cazier and birth certificate, 10% on constatator, nothing on rovinieta', () => {
    expect(blackFridayRate('cazier-judiciar')).toBe(20);
    expect(blackFridayRate('certificat-nastere')).toBe(20);
    expect(blackFridayRate('certificat-constatator')).toBe(10);
    expect(blackFridayRate('rovinieta')).toBe(0);
    expect(blackFridayRate(null)).toBe(0);
  });

  it('discounts the base price only, never options or delivery', () => {
    // 198 base + 178.5 translation + 25 delivery
    const amount = couponAmount(row, 401.5, { serviceSlug: 'cazier-judiciar', basePrice: 198 });
    expect(amount).toBe(39.6);
  });

  it('follows the base price of the chosen variant', () => {
    expect(couponAmount(row, 119.99, { serviceSlug: 'certificat-constatator', basePrice: 119.99 })).toBe(12);
  });

  it('gives nothing on a service outside the campaign', () => {
    expect(couponAmount(row, 100, { serviceSlug: 'rovinieta', basePrice: 100 })).toBe(0);
  });

  it('matches the code in any case', () => {
    expect(couponAmount({ ...row, code: 'blackfriday' }, 198, { serviceSlug: 'cazier-auto', basePrice: 198 })).toBe(39.6);
  });

  it('leaves other coupons on the full subtotal', () => {
    const other: CouponRow = { code: 'FIDEL-ABC', discount_type: 'percentage', discount_value: 10 };
    expect(couponAmount(other, 400, { serviceSlug: 'cazier-judiciar', basePrice: 198 })).toBe(40);
    expect(couponAmount({ ...other, discount_type: 'fixed', discount_value: 500 }, 400, { basePrice: 198 })).toBe(400);
  });

  it('stops at Monday 16.11.2026 23:59:59 Romanian time', () => {
    expect(isBlackFridayActive(new Date('2026-11-16T21:59:59Z'))).toBe(true);
    expect(isBlackFridayActive(new Date('2026-11-16T22:00:00Z'))).toBe(false);
  });

  it('stops campaigns that name the code after the end date only', () => {
    const after = new Date('2026-11-16T22:00:00Z');
    expect(isExpiredBlackFridayCampaign('ai codul BLACKFRIDAY', after)).toBe(true);
    expect(isExpiredBlackFridayCampaign('ai codul BLACKFRIDAY', new Date('2026-11-16T07:40:00Z'))).toBe(false);
    expect(isExpiredBlackFridayCampaign('fara reducere', after)).toBe(false);
  });

  it('is refused by the server after valid_until', () => {
    const expiring: CouponRow = { ...row, valid_until: '2026-11-16T21:59:59Z' };
    const order = { serviceSlug: 'cazier-judiciar', basePrice: 198 };
    expect(couponDiscount(expiring, 198, null, new Date('2026-11-16T21:00:00Z'), order)).toBe(39.6);
    expect(couponDiscount(expiring, 198, null, new Date('2026-11-16T22:00:00Z'), order)).toBe(0);
  });
});
