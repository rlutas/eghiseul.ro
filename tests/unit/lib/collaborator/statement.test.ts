import { describe, it, expect } from 'vitest';
import { buildMonthlyStatement, bucharestMonth, previousMonth } from '@/lib/collaborator/statement';
import { DISTRIBUTIONS } from '@/lib/collaborator/settlement';

const order = (paidAt: string, total: number, ocpiCost = 20) => ({
  paidAt, total, ocpiCost, stripeFee: 0, commission: 0,
  serviceSlug: 'extras-carte-funciara', status: 'completed', isTest: false,
});

describe('bucharestMonth / previousMonth', () => {
  it('uses Romanian time at the month boundary', () => {
    // 30.09 22:30 UTC = 01.10 01:30 in Bucharest
    expect(bucharestMonth('2026-09-30T22:30:00Z')).toBe('2026-10');
    expect(bucharestMonth('2026-09-30T20:00:00Z')).toBe('2026-09');
  });
  it('returns the month before', () => {
    expect(previousMonth(new Date('2026-10-06T08:00:00Z'))).toBe('2026-09');
    expect(previousMonth(new Date('2026-01-15T08:00:00Z'))).toBe('2025-12');
  });
});

describe('buildMonthlyStatement', () => {
  it('marks July as settled together with August', () => {
    const s = buildMonthlyStatement([order('2026-07-10T10:00:00Z', 121)], [], '2026-07');
    expect(s.payment).toBeNull();
    expect(s.settledWithMonth).toBe('2026-08');
  });

  it('owes the month share plus the correction for earlier months', () => {
    const orders = [order('2026-08-10T10:00:00Z', 12100), order('2026-09-10T10:00:00Z', 1210)];
    const s = buildMonthlyStatement(orders, [{ amount: 100, periodStart: '2026-09-01' }], '2026-09');
    const p = s.payment!;
    const aug = DISTRIBUTIONS.find((d) => d.forMonth === '2026-08')!;
    // due = cumulative share - what was paid for August
    expect(p.dueEach).toBeCloseTo(p.shareThisMonth + p.correctionPrevious, 2);
    expect(p.collaboratorExtraPrior).toBeCloseTo(
      aug.collaboratorCashRon + aug.collaboratorInvoicedRon - aug.perSideRon, 2
    );
    expect(p.collaboratorDue).toBeCloseTo(p.dueEach - p.collaboratorExtraPrior, 2);
    expect(p.commissionToInvoice + p.transferToCollaborator).toBeCloseTo(p.collaboratorDue, 2);
    expect(s.result.otherCosts).toBe(100);
  });
});
