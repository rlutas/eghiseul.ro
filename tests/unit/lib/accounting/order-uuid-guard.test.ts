import { describe, it, expect } from 'vitest';
import { isOrderUuid } from '@/lib/accounting/payout-sync';

/**
 * Regression for the 400s seen on the 05:30 payout-sync cron (2026-09-17):
 * `id=in.(125455150)` — a numeric Oblio proforma id reached a PostgREST filter
 * on `orders.id`, which is a uuid. PostgREST rejected the whole query, so every
 * extra-charge row in that batch stayed unmatched in Decontări.
 */
describe('isOrderUuid', () => {
  it('accepts a real order uuid', () => {
    expect(isOrderUuid('d4204645-3c30-47c2-91d8-e191fb237696')).toBe(true);
  });

  it('accepts uppercase', () => {
    expect(isOrderUuid('D4204645-3C30-47C2-91D8-E191FB237696')).toBe(true);
  });

  it('rejects the numeric Oblio proforma id that caused the 400', () => {
    expect(isOrderUuid('125455150')).toBe(false);
  });

  it('rejects a friendly order code', () => {
    expect(isOrderUuid('E-260917-FVRH5')).toBe(false);
  });

  it('rejects null, undefined and empty', () => {
    expect(isOrderUuid(null)).toBe(false);
    expect(isOrderUuid(undefined)).toBe(false);
    expect(isOrderUuid('')).toBe(false);
  });

  it('rejects a uuid with extra characters, which PostgREST would also reject', () => {
    expect(isOrderUuid('d4204645-3c30-47c2-91d8-e191fb237696x')).toBe(false);
    expect(isOrderUuid(' d4204645-3c30-47c2-91d8-e191fb237696')).toBe(false);
  });
});
