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

const round2 = (n: number) => Math.round(n * 100) / 100;

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

/**
 * Costul lunar de platformă alocat serviciilor imobiliare.
 *
 * **0 din decizia lui Raul (07.09.2026):** găzduirea și programele de
 * dezvoltare (~730 lei/lună real, pentru TOATE platformele) NU se repartizează
 * pe zona imobiliară — rămân cheltuială generală a firmei. Mecanismul de
 * alocare rămâne în cod; se schimbă doar valoarea de aici dacă se revine.
 */
export const PLATFORM_COST_PER_MONTH = 0;

/** Prima comandă plătită pe serviciile lui — începutul colaborării. */
export const SETTLEMENT_PERIOD_START = '2026-07-07T00:00:00.000Z';

/**
 * Cât s-a distribuit deja fiecărei părți, cumulat de la începutul colaborării.
 *
 * **Decontul se calculează CUMULAT, nu pe felii de perioadă** (regula stabilită
 * după regularizarea din 07.09.2026): partea cuvenită se recalculează pe toată
 * perioada, iar din ea se scade ce s-a distribuit deja. Așa, un cost care intră
 * târziu — taxa OCPI a unei comenzi lucrate abia luna viitoare — se corectează
 * singur la decontul următor, fără provizioane și fără riscul de a-l scăpa sau
 * de a-l număra de două ori.
 *
 * Se adaugă o intrare la fiecare distribuire.
 */
export const DISTRIBUTIONS = [
  {
    on: '2026-08-26',
    perSideRon: 4316.61,
    /** Colaboratorul a primit partea minus comisionul, pe care îl facturează. */
    collaboratorCashRon: 3791.61,
    collaboratorCommissionRon: 525,
    /**
     * What his commission invoice for this distribution actually paid out:
     * Mirandsof SM 153, 635,25 = 525 + VAT, paid 07.09.2026. The rule since
     * then is 15 lei WITH VAT included, so 110,25 of it counts as an advance.
     */
    collaboratorInvoicedRon: 635.25,
    reference: 'docs/operations/decont-mircea-2026-08-26.md',
  },
] as const;

/** Total primit de colaborator până acum: transferuri + facturi de comision plătite. */
export const COLLABORATOR_RECEIVED = round2(
  DISTRIBUTIONS.reduce((sum, d) => sum + d.collaboratorCashRon + d.collaboratorInvoicedRon, 0)
);
/** Cât a facturat deja ca și comision (TVA inclus). */
export const COLLABORATOR_INVOICED = round2(
  DISTRIBUTIONS.reduce((sum, d) => sum + d.collaboratorInvoicedRon, 0)
);

/** Total distribuit fiecărei părți până acum. */
export const DISTRIBUTED_PER_SIDE = round2(
  DISTRIBUTIONS.reduce((sum, d) => sum + d.perSideRon, 0)
);

/**
 * Ultimul decont închis — păstrat pentru referință istorică. Cutoff-ul NU mai e
 * folosit la calcul: decontul e cumulativ (vezi `DISTRIBUTIONS`).
 */
export const LAST_SETTLEMENT = {
  settledOn: '2026-08-26',
  cutoffFriendlyOrderId: 'E-260826-F7GHD',
  cutoffPaidAt: '2026-08-26T07:45:00.000Z',
  sharePerSideRon: 4316.61,
  reference: 'docs/operations/decont-mircea-2026-08-26.md',
} as const;

/** Costurile care se scad din venitul net, în afara taxelor OCPI. */
export interface SettlementExtraCosts {
  /**
   * Taxe OCPI estimate pentru comenzile încasate dar încă nelucrate.
   * INFORMATIV — nu se scade din profit (decizia lui Raul, 07.09.2026); e
   * avertismentul că profitul perioadei va scădea când intră taxele.
   */
  pendingOcpi?: number;
  /** Comisioanele procesatorului de plăți (Stripe), reale, per comandă. */
  stripeFees?: number;
  /**
   * Comisionul colaboratorului (15 lei/comandă unde e setat). NU e cost
   * înainte de împărțeală: se calculează DUPĂ ce se știe partea lui și se
   * scade din ea, pentru că îl încasează prin factură către EDIGITALIZARE
   * (regula Raul, 07.09.2026 — aceeași convenție ca la avocată).
   */
  commission?: number;
  /** Cota de găzduire/infrastructură pentru perioadă. */
  platformCost?: number;
  /**
   * Cheltuieli de perioadă pe serviciile lucrate împreună — în primul rând
   * bugetul de reclamă (Google Ads, Meta). Nu se pot lega de o comandă anume,
   * dar sunt cost real: se scad înainte de împărțeală
   * (`collaborator_period_costs`).
   */
  otherCosts?: number;
}

export interface SettlementBreakdown {
  /** Încasat de la clienți, cu TVA. */
  collectedWithVat: number;
  /** Net fără TVA (÷ 1+VAT_RATE). */
  netOfVat: number;
  vat: number;
  /** Taxe OCPI/ANCPI plătite (order_supplier_costs, furnizor ANCPI). */
  ocpiCosts: number;
  /** Comisioanele Stripe pe comenzile perioadei. */
  stripeFees: number;
  /** Comisionul colaboratorului — se scade din partea LUI, nu din profit. */
  commission: number;
  /** Cota de găzduire/infrastructură. */
  platformCost: number;
  /** Cheltuieli de perioadă (reclamă, abonamente). */
  otherCosts: number;
  /** Taxe OCPI estimate pe comenzile nelucrate — informativ, NU scăzute. */
  pendingOcpi: number;
  /** Suma tuturor costurilor scăzute din net. */
  totalCosts: number;
  grossProfit: number;
  profitTax: number;
  netProfit: number;
  dividendTax: number;
  /** Net de distribuit după toate taxele. */
  distributable: number;
  /** Partea fiecăruia (50%), înainte de comision. */
  sharePerSide: number;
  /** Partea colaboratorului după scăderea comisionului pe care îl facturează. */
  collaboratorShare: number;
  /** Cât s-a distribuit deja fiecărei părți (cumulat). */
  alreadyDistributed: number;
  /** Pozitiv = mai are de primit; negativ = s-a distribuit în plus. */
  toSettle: number;
  /** Partea fiecăruia dacă se plătesc și taxele estimate care urmează. */
  projectedSharePerSide: number;
  /** Colaboratorul: total primit (transferuri + facturi de comision plătite). */
  collaboratorReceived: number;
  /** Colaboratorul: cât mai are de primit în total (parte − primit). */
  collaboratorToReceive: number;
  /** Din care: comision încă de facturat (TVA inclus). */
  commissionToInvoice: number;
  /** Din care: transfer în cont. */
  collaboratorCashToReceive: number;
}

/**
 * The settlement waterfall, exactly as in the 26.08 reference settlement.
 * Inputs are RON; every output field is rounded to 2 decimals for display,
 * but each step is derived from the UNROUNDED previous value.
 */
export function computeSettlementBreakdown(
  collectedWithVat: number,
  ocpiCosts: number,
  extra: SettlementExtraCosts = {}
): SettlementBreakdown {
  const collected = Number(collectedWithVat) || 0;
  const ocpi = Number(ocpiCosts) || 0;
  const stripeFees = Number(extra.stripeFees) || 0;
  const commission = Number(extra.commission) || 0;
  const platformCost = Number(extra.platformCost) || 0;
  const pendingOcpi = Number(extra.pendingOcpi) || 0;
  const otherCosts = Number(extra.otherCosts) || 0;
  // Costurile care se scad efectiv: taxele plătite la instituție și comisionul
  // procesatorului de plăți. Comisionul colaboratorului se scade din partea
  // LUI, la final; taxele estimate pe comenzile nelucrate rămân informative.
  const totalCosts = ocpi + stripeFees + platformCost + otherCosts;

  const netOfVat = collected / (1 + VAT_RATE);
  const grossProfit = netOfVat - totalCosts;
  const profitTax = grossProfit > 0 ? grossProfit * PROFIT_TAX_RATE : 0;
  const netProfit = grossProfit - profitTax;
  const dividendTax = netProfit > 0 ? netProfit * DIVIDEND_TAX_RATE : 0;
  const distributable = netProfit - dividendTax;

  // Same waterfall with the taxes still to pay (informative, not deducted).
  const projectedGross = grossProfit - pendingOcpi;
  const projectedNet = projectedGross > 0 ? projectedGross * (1 - PROFIT_TAX_RATE) : projectedGross;
  const projectedDistributable = projectedNet > 0 ? projectedNet * (1 - DIVIDEND_TAX_RATE) : projectedNet;

  // His share is paid as commission invoices (15 lei/order, VAT included)
  // plus a transfer for the rest.
  const collaboratorToReceive = distributable * PROFIT_SPLIT - COLLABORATOR_RECEIVED;
  const commissionToInvoice = Math.max(0, commission - COLLABORATOR_INVOICED);

  return {
    collectedWithVat: round2(collected),
    netOfVat: round2(netOfVat),
    vat: round2(collected - netOfVat),
    ocpiCosts: round2(ocpi),
    stripeFees: round2(stripeFees),
    commission: round2(commission),
    platformCost: round2(platformCost),
    otherCosts: round2(otherCosts),
    pendingOcpi: round2(pendingOcpi),
    totalCosts: round2(totalCosts),
    grossProfit: round2(grossProfit),
    profitTax: round2(profitTax),
    netProfit: round2(netProfit),
    dividendTax: round2(dividendTax),
    distributable: round2(distributable),
    sharePerSide: round2(distributable * PROFIT_SPLIT),
    collaboratorShare: round2(distributable * PROFIT_SPLIT - commission),
    alreadyDistributed: DISTRIBUTED_PER_SIDE,
    toSettle: round2(distributable * PROFIT_SPLIT - DISTRIBUTED_PER_SIDE),
    projectedSharePerSide: round2(projectedDistributable * PROFIT_SPLIT),
    collaboratorReceived: COLLABORATOR_RECEIVED,
    collaboratorToReceive: round2(collaboratorToReceive),
    commissionToInvoice: round2(commissionToInvoice),
    collaboratorCashToReceive: round2(collaboratorToReceive - commissionToInvoice),
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

/**
 * Cota de găzduire pentru un interval — proporțional cu numărul de zile,
 * la `PLATFORM_COST_PER_MONTH` pe lună (30,44 zile în medie).
 */
export function platformCostForRange(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  const days = (end - start) / 86_400_000;
  return round2((days / 30.44) * PLATFORM_COST_PER_MONTH);
}

/** Serviciile de identificare: taxa OCPI depinde de cât de departe merge cererea. */
export const IDENTIFICATION_SLUGS = new Set(['identificare-imobil', 'identificare-imobile-proprietar']);
/**
 * Regula lui Raul (06.10.2026), din momentul în care prețul identificării a
 * crescut cu 100 lei: dacă imobilul se identifică intern și Mircea scoate
 * direct extrasul CF, taxa e 20 lei; dacă trebuie depusă cerere la OCPI,
 * taxa e 100 lei.
 */
export const IDENTIFICATION_OCPI = { extrasCf: 20, cerere: 100 } as const;
/** Statusuri în care cererea de identificare e deja depusă la OCPI. */
const IDENTIFICATION_FILED = new Set(['identification_pending_ocpi', 'on_hold_institution']);
const NO_TAX_DUE = new Set(['refunded', 'cancelled']);

/**
 * Taxa OCPI estimată pentru o comandă care încă n-are taxa înregistrată.
 * Orice comandă plătită ajunge să plătească taxă la OCPI (instituția nu
 * eliberează gratuit), inclusiv cele finalizate la care taxa n-a fost trecută.
 * `null` = nu există o bază de estimare (serviciu fără nicio taxă înregistrată).
 */
export function estimateOrderOcpi(
  order: { serviceSlug: string; status: string; ocpiCost: number },
  avgBySlug: Map<string, number>
): number | null {
  if (order.ocpiCost > 0 || NO_TAX_DUE.has(order.status)) return 0;
  if (IDENTIFICATION_SLUGS.has(order.serviceSlug)) {
    return IDENTIFICATION_FILED.has(order.status) ? IDENTIFICATION_OCPI.cerere : IDENTIFICATION_OCPI.extrasCf;
  }
  return avgBySlug.get(order.serviceSlug) ?? null;
}

/** Taxa medie deja plătită, per serviciu (doar rândurile cu taxă > 0). */
export function averageOcpiBySlug(
  orders: { serviceSlug: string; ocpiCost: number }[]
): Map<string, number> {
  const acc = new Map<string, { sum: number; n: number }>();
  for (const o of orders) {
    if (!(o.ocpiCost > 0)) continue;
    const a = acc.get(o.serviceSlug) ?? { sum: 0, n: 0 };
    a.sum += o.ocpiCost;
    a.n += 1;
    acc.set(o.serviceSlug, a);
  }
  return new Map([...acc].map(([k, a]) => [k, a.sum / a.n]));
}

/**
 * Taxele OCPI care ABIA URMEAZĂ să fie plătite: toate comenzile încasate fără
 * taxă înregistrată. Informativ — nu se scad din profit (decontul e cumulativ,
 * taxa intră când e plătită), dar se arată ca să se știe că urmează.
 */
export function estimatePendingOcpi(
  orders: { serviceSlug: string; status: string; ocpiCost: number }[]
): number {
  return pendingOcpiSummary(orders).total;
}

export function pendingOcpiSummary(
  orders: { serviceSlug: string; status: string; ocpiCost: number }[]
): { total: number; count: number; unknownCount: number } {
  const avg = averageOcpiBySlug(orders);
  let total = 0;
  let count = 0;
  let unknownCount = 0;
  for (const o of orders) {
    if (o.ocpiCost > 0 || NO_TAX_DUE.has(o.status)) continue;
    count += 1;
    const est = estimateOrderOcpi(o, avg);
    if (est === null) unknownCount += 1;
    else total += est;
  }
  return { total: round2(total), count, unknownCount };
}
