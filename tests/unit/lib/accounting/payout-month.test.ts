import { describe, expect, it } from 'vitest';
import { isInMonth, loadPayoutsByAccountingDate, monthQueryWindow, payoutAccountingDate } from '@/lib/accounting/payout-month';

// The payout that started this: created Fri 30.10.2026, in the bank the same
// day, Stripe's arrival_date = Mon 02.11.
const late = { id: 'po_late', arrival_date: '2026-11-02', created_at_stripe: '2026-10-30T01:09:34+00:00' };

describe('payoutAccountingDate', () => {
  it('data din extrasul de bancă bate tot', () => {
    expect(payoutAccountingDate(late, '2026-10-30')).toBe('2026-10-30');
  });

  it('fără extras: ziua în care Stripe a creat payout-ul, ora României', () => {
    expect(payoutAccountingDate(late)).toBe('2026-10-30');
    // 31.10 la 23:30 UTC e deja 01.11 în România
    expect(payoutAccountingDate({ id: 'x', arrival_date: '2026-11-03', created_at_stripe: '2026-10-31T23:30:00Z' })).toBe('2026-11-01');
  });

  it('fără nimic altceva: estimarea Stripe', () => {
    expect(payoutAccountingDate({ id: 'x', arrival_date: '2026-11-02' })).toBe('2026-11-02');
    expect(payoutAccountingDate({ id: 'x', arrival_date: null })).toBeNull();
  });
});

describe('luna contabilă', () => {
  it('payout-ul de pe 30.10 e al lui octombrie, nu al lui noiembrie', () => {
    const d = payoutAccountingDate(late, '2026-10-30');
    expect(isInMonth(d, '2026-10')).toBe(true);
    expect(isInMonth(d, '2026-11')).toBe(false);
  });

  it('fereastra de interogare prinde estimările din luna vecină', () => {
    expect(monthQueryWindow('2026-10')).toEqual({ from: '2026-09-24', to: '2026-11-08' });
    expect(monthQueryWindow('2026-12')).toEqual({ from: '2026-11-24', to: '2027-01-08' });
  });
});

function fakeAdmin(payouts: unknown[], bank: unknown[]) {
  const chain = (rows: unknown[]) => {
    const c: Record<string, unknown> = {};
    for (const m of ['select', 'order', 'eq', 'gte', 'lt', 'limit', 'in']) c[m] = () => c;
    (c as { then: unknown }).then = (res: (v: unknown) => void) => res({ data: rows, error: null });
    return c;
  };
  return { from: (t: string) => chain(t === 'stripe_payouts' ? payouts : bank) };
}

describe('loadPayoutsByAccountingDate', () => {
  const inNov = { id: 'po_nov', arrival_date: '2026-11-03', created_at_stripe: '2026-11-02T01:00:00Z' };
  const admin = fakeAdmin([late, inNov], [{ matched_payout_id: 'po_late', tx_date: '2026-10-30' }]);

  it('octombrie îl conține pe cel sosit în bancă pe 30.10', async () => {
    const oct = await loadPayoutsByAccountingDate(admin, { month: '2026-10' });
    expect(oct.map((p) => p.id)).toEqual(['po_late']);
    expect(oct[0]).toMatchObject({ bank_date: '2026-10-30', accounting_date: '2026-10-30' });
  });

  it('noiembrie nu îl mai conține', async () => {
    const nov = await loadPayoutsByAccountingDate(admin, { month: '2026-11' });
    expect(nov.map((p) => p.id)).toEqual(['po_nov']);
    expect(nov[0].bank_date).toBeNull();
  });
});
