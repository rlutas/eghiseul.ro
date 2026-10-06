/**
 * Monthly settlement statement for the topograf collaborator.
 *
 * The money math stays cumulative (see `DISTRIBUTIONS` in ./settlement): what
 * is owed for month M = everybody's share from the start up to the end of M,
 * minus what was paid for the earlier months. This module presents that as a
 * plain monthly statement people can read:
 *
 *   1. what month M earned (its own orders and costs only);
 *   2. the payment for M = M's share + a correction for the earlier months
 *      (fees or costs that came in after those were paid);
 *   3. what was actually paid for M, and what is left.
 *
 * Months are calendar months in Romanian time (Europe/Bucharest).
 */
import {
  computeSettlementBreakdown,
  pendingOcpiSummary,
  DISTRIBUTIONS,
  type SettlementBreakdown,
} from '@/lib/collaborator/settlement';

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface StatementOrder {
  paidAt: string | null;
  total: number;
  ocpiCost: number;
  stripeFee: number;
  commission: number;
  serviceSlug: string;
  status: string;
  isTest: boolean;
}

export interface StatementCost {
  amount: number;
  /** YYYY-MM-DD, the month the cost belongs to. */
  periodStart: string;
}

export interface StatementPayment {
  on: string;
  perSideRon: number;
  collaboratorCashRon: number;
  collaboratorInvoicedRon: number;
}

export interface MonthlyStatement {
  /** YYYY-MM */
  month: string;
  /** The month is not over yet. */
  inProgress: boolean;
  /** This month's orders and costs only. */
  result: SettlementBreakdown;
  orderCount: number;
  /** Orders this month that carry his 15 lei commission. */
  commissionOrderCount: number;
  /** OCPI fees not yet recorded on this month's orders (informative). */
  pending: { total: number; count: number; unknownCount: number };
  /** Payment for this month, null when the month was paid together with a later one. */
  payment: {
    shareThisMonth: number;
    /** Late fees/costs on earlier months (negative = they were overpaid). */
    correctionPrevious: number;
    /** Owed to each side for this month. */
    dueEach: number;
    /** Collaborator got this much more than Raul at earlier payouts (invoice VAT). */
    collaboratorExtraPrior: number;
    collaboratorDue: number;
    commissionToInvoice: number;
    /** Commission earned on this month's orders (VAT included). */
    commissionThisMonth: number;
    /** commissionToInvoice − commissionThisMonth: earlier invoices over (−) or under (+) the rule. */
    commissionCorrectionPrior: number;
    transferToCollaborator: number;
    paid: StatementPayment[];
    remainingEach: number;
    remainingCollaborator: number;
  } | null;
  /** When `payment` is null: the month whose payout covered this one. */
  settledWithMonth: string | null;
}

/** YYYY-MM of a timestamp, in Romanian time. */
export function bucharestMonth(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date(iso));
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  return `${y}-${m}`;
}

/** The month before the current one (YYYY-MM), in Romanian time. */
export function previousMonth(now = new Date()): string {
  const [y, m] = bucharestMonth(now.toISOString()).split('-').map(Number);
  const d = new Date(Date.UTC(y!, m! - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function breakdownFor(orders: StatementOrder[], costs: StatementCost[]) {
  const billable = orders.filter((o) => !o.isTest);
  const sum = (f: (o: StatementOrder) => number) => billable.reduce((s, o) => s + f(o), 0);
  const pending = pendingOcpiSummary(
    billable.map((o) => ({ serviceSlug: o.serviceSlug, status: o.status, ocpiCost: o.ocpiCost }))
  );
  const result = computeSettlementBreakdown(sum((o) => o.total), sum((o) => o.ocpiCost), {
    stripeFees: sum((o) => o.stripeFee),
    commission: sum((o) => o.commission),
    otherCosts: costs.reduce((s, c) => s + (Number(c.amount) || 0), 0),
    pendingOcpi: pending.total,
  });
  return { result, pending, count: billable.length, commissionCount: billable.filter((o) => o.commission > 0).length };
}

export function buildMonthlyStatement(
  allOrders: StatementOrder[],
  allCosts: StatementCost[],
  month: string,
  now = new Date()
): MonthlyStatement {
  const orderMonth = (o: StatementOrder) => (o.paidAt ? bucharestMonth(o.paidAt) : '');
  const costMonth = (c: StatementCost) => c.periodStart.slice(0, 7);

  const own = breakdownFor(
    allOrders.filter((o) => orderMonth(o) === month),
    allCosts.filter((c) => costMonth(c) === month)
  );
  const cumulative = breakdownFor(
    allOrders.filter((o) => orderMonth(o) && orderMonth(o) <= month),
    allCosts.filter((c) => costMonth(c) <= month)
  ).result;

  const forMonth = (d: { forMonth: string }) => d.forMonth;
  const prior = DISTRIBUTIONS.filter((d) => forMonth(d) < month);
  const paid = DISTRIBUTIONS.filter((d) => forMonth(d) === month);
  const later = DISTRIBUTIONS.filter((d) => forMonth(d) > month);

  const base: Omit<MonthlyStatement, 'payment' | 'settledWithMonth'> = {
    month,
    inProgress: month >= bucharestMonth(now.toISOString()),
    result: own.result,
    orderCount: own.count,
    commissionOrderCount: own.commissionCount,
    pending: own.pending,
  };

  // An earlier month that was paid together with a later one (July → 26.08).
  if (paid.length === 0 && later.length > 0) {
    return { ...base, payment: null, settledWithMonth: forMonth(later[0]!) };
  }

  const priorEach = prior.reduce((s, d) => s + d.perSideRon, 0);
  const priorCollaborator = prior.reduce((s, d) => s + d.collaboratorCashRon + d.collaboratorInvoicedRon, 0);
  const priorInvoiced = prior.reduce((s, d) => s + d.collaboratorInvoicedRon, 0);

  let dueEach = cumulative.sharePerSide - priorEach;
  // Rounding between the monthly and cumulative waterfalls can leave a ban.
  if (Math.abs(dueEach - own.result.sharePerSide) < 0.05) dueEach = own.result.sharePerSide;
  const collaboratorExtraPrior = priorCollaborator - priorEach;
  const collaboratorDue = dueEach - collaboratorExtraPrior;
  const commissionToInvoice = Math.min(
    Math.max(0, cumulative.commission - priorInvoiced),
    Math.max(0, collaboratorDue)
  );
  const paidEach = paid.reduce((s, d) => s + d.perSideRon, 0);
  const paidCollaborator = paid.reduce((s, d) => s + d.collaboratorCashRon + d.collaboratorInvoicedRon, 0);

  return {
    ...base,
    settledWithMonth: null,
    payment: {
      shareThisMonth: own.result.sharePerSide,
      correctionPrevious: round2(dueEach - own.result.sharePerSide),
      dueEach: round2(dueEach),
      collaboratorExtraPrior: round2(collaboratorExtraPrior),
      collaboratorDue: round2(collaboratorDue),
      commissionToInvoice: round2(commissionToInvoice),
      commissionThisMonth: own.result.commission,
      commissionCorrectionPrior: round2(commissionToInvoice - own.result.commission),
      transferToCollaborator: round2(collaboratorDue - commissionToInvoice),
      paid: paid.map((d) => ({
        on: d.on,
        perSideRon: d.perSideRon,
        collaboratorCashRon: d.collaboratorCashRon,
        collaboratorInvoicedRon: d.collaboratorInvoicedRon,
      })),
      remainingEach: round2(dueEach - paidEach),
      remainingCollaborator: round2(collaboratorDue - paidCollaborator),
    },
  };
}
