import { describe, it, expect } from 'vitest';
import {
  buildPaidIndex,
  findPaymentAfter,
  normalizeEmail,
  summarizeCalls,
  type PaidOrderRef,
} from '@/lib/orders/phone-recovery-wins';

const paid = (email: string, paidAt: string, totalRon: number, orderId: string): PaidOrderRef => ({
  email, paidAt, totalRon, ref: `E-${orderId}`, orderId,
});

describe('normalizeEmail', () => {
  it('trims and lowercases, empty → null', () => {
    expect(normalizeEmail('  Ana@Ex.RO ')).toBe('ana@ex.ro');
    expect(normalizeEmail('')).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });
});

describe('findPaymentAfter', () => {
  const idx = buildPaidIndex([
    paid('Ana@ex.ro', '2026-09-10T10:00:00Z', 198, 'old'),
    paid('ana@ex.ro', '2026-09-20T10:00:00Z', 998, 'new'),
    paid('bob@ex.ro', '2026-09-17T08:00:00Z', 698, 'bob'),
  ]);

  it('finds the first payment after the call, case-insensitive', () => {
    expect(findPaymentAfter(idx, 'ANA@ex.ro', '2026-09-18T09:00:00Z')?.orderId).toBe('new');
  });

  it('ignores payments older than call minus one day', () => {
    expect(findPaymentAfter(idx, 'ana@ex.ro', '2026-09-25T09:00:00Z')).toBeNull();
  });

  it('counts a payment made up to one day before the call was logged', () => {
    expect(findPaymentAfter(idx, 'bob@ex.ro', '2026-09-17T20:00:00Z')?.orderId).toBe('bob');
  });

  it('with zero grace (open queue), only payments after the order start count', () => {
    expect(findPaymentAfter(idx, 'bob@ex.ro', '2026-09-17T20:00:00Z', 0)).toBeNull();
    expect(findPaymentAfter(idx, 'bob@ex.ro', '2026-09-16T20:00:00Z', 0)?.orderId).toBe('bob');
  });

  it('no email → no match', () => {
    expect(findPaymentAfter(idx, null, '2026-09-18T09:00:00Z')).toBeNull();
  });
});

describe('summarizeCalls', () => {
  it('counts calls by window and recoveries once per paid order', () => {
    const now = new Date('2026-10-06T12:00:00Z').getTime();
    const idx = buildPaidIndex([paid('ana@ex.ro', '2026-10-03T10:00:00Z', 998, 'x')]);
    const stats = summarizeCalls(
      [
        { email: 'ana@ex.ro', phoneContactedAt: '2026-10-02T10:00:00Z' },
        { email: 'ana@ex.ro', phoneContactedAt: '2026-10-01T10:00:00Z' },
        { email: 'zed@ex.ro', phoneContactedAt: '2026-09-20T10:00:00Z' },
      ],
      idx,
      now
    );
    expect(stats).toEqual({ calls7: 2, calls30: 3, recovered: 1, recoveredLei: 998 });
  });
});
