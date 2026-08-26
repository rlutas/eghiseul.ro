/**
 * SINGLE SOURCE OF TRUTH for the Mircea (topograf) settlement math.
 *
 * The deal is a 50/50 PROFIT split, not a per-order fee: revenue net of VAT,
 * minus the OCPI fees we paid, minus company taxes, halved. First computed by
 * hand on 26.08.2026 (docs/operations/decont-mircea-2026-08-26.md + the visual
 * artifact sent to Mircea); this module encodes that exact methodology so the
 * collaborator portal, the admin view and the next settlement all show the
 * same numbers — no more ad-hoc scripts drifting from the UI.
 *
 * lawyer_fee_ron is NOT part of this model (that field serves the avocat deal,
 * 15 RON/order). On the cadastral services it is legacy — see migration 149.
 *
 * Keep full precision through the chain and round ONLY for display: rounding
 * each step separately drifts by a ban vs. the reference settlement.
 */

import { SUPPLIER_ANCPI } from '@/lib/admin/supplier-costs';

/** TVA-ul din prețul încasat de la client (cota 2026). */
export const VAT_RATE = 0.21;

/**
 * Impozit pe profit + impozit pe dividende (cotele 2026, Legea 141/2025).
 * ⚠️ Deschis în decontul din 26.08: dacă firma e micro (1%/3% pe venit),
 * cotele astea se schimbă — modifică AICI și tot sistemul urmează.
 */
export const PROFIT_TAX_RATE = 0.16;
export const DIVIDEND_TAX_RATE = 0.16;

/** Împărțeala Raul / Mircea. */
export const PROFIT_SPLIT = 0.5;

/** Prima comandă plătită pe serviciile lui — începutul colaborării. */
export const SETTLEMENT_PERIOD_START = '2026-07-07T00:00:00.000Z';

/**
 * Ultimul decont închis. Următorul decont = comenzile plătite DUPĂ
 * cutoffPaidAt. Se actualizează la fiecare decont nou.
 */
export const LAST_SETTLEMENT = {
  settledOn: '2026-08-26',
  cutoffFriendlyOrderId: 'E-260826-F7GHD',
  cutoffPaidAt: '2026-08-26T07:45:00.000Z',
  sharePerSideRon: 4316.61,
  reference: 'docs/operations/decont-mircea-2026-08-26.md',
} as const;

export interface SettlementBreakdown {
  /** Încasat de la clienți, cu TVA. */
  collectedWithVat: number;
  /** Net fără TVA (÷ 1+VAT_RATE). */
  netOfVat: number;
  vat: number;
  /** Taxe OCPI/ANCPI plătite (order_supplier_costs, furnizor ANCPI). */
  ocpiCosts: number;
  grossProfit: number;
  profitTax: number;
  netProfit: number;
  dividendTax: number;
  /** Net de distribuit după toate taxele. */
  distributable: number;
  /** Partea fiecăruia (50%). */
  sharePerSide: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The settlement waterfall, exactly as in the 26.08 reference settlement.
 * Inputs are RON; every output field is rounded to 2 decimals for display,
 * but each step is derived from the UNROUNDED previous value.
 */
export function computeSettlementBreakdown(
  collectedWithVat: number,
  ocpiCosts: number
): SettlementBreakdown {
  const collected = Number(collectedWithVat) || 0;
  const ocpi = Number(ocpiCosts) || 0;

  const netOfVat = collected / (1 + VAT_RATE);
  const grossProfit = netOfVat - ocpi;
  const profitTax = grossProfit > 0 ? grossProfit * PROFIT_TAX_RATE : 0;
  const netProfit = grossProfit - profitTax;
  const dividendTax = netProfit > 0 ? netProfit * DIVIDEND_TAX_RATE : 0;
  const distributable = netProfit - dividendTax;

  return {
    collectedWithVat: round2(collected),
    netOfVat: round2(netOfVat),
    vat: round2(collected - netOfVat),
    ocpiCosts: round2(ocpi),
    grossProfit: round2(grossProfit),
    profitTax: round2(profitTax),
    netProfit: round2(netProfit),
    dividendTax: round2(dividendTax),
    distributable: round2(distributable),
    sharePerSide: round2(distributable * PROFIT_SPLIT),
  };
}

/**
 * Sum of the ANCPI institution fees for a set of cost rows (already filtered
 * to the relevant orders). Kept here so every caller counts the same rows:
 * supplier ANCPI, category taxa_institutie.
 */
export function sumAncpiCosts(
  rows: { supplier?: string | null; category?: string | null; amount_ron?: number | string | null }[] | null | undefined
): number {
  let sum = 0;
  for (const r of rows ?? []) {
    if (r.supplier !== SUPPLIER_ANCPI || r.category !== 'taxa_institutie') continue;
    sum += Number(r.amount_ron) || 0;
  }
  return round2(sum);
}
