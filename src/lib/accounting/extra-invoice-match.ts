/**
 * Pure matching helpers for payout reconciliation (Decontări).
 *
 * 1. `extraInvoiceForRow` — find the EXTRA-payment invoice for a payout
 *    transaction inside an order's `extra_billing[]`. The main order invoice
 *    lives on `orders.invoice_number`, but each extra payment (admin Modifică
 *    → link plată) gets its own fiscal invoice stored ONLY in extra_billing —
 *    the sync previously never read it, so extra-charge rows showed either
 *    "nefacturat" or the ORIGINAL order invoice.
 *
 *    Entry shapes differ per platform:
 *      eghiseul: { invoice, amount (RON),      paymentIntentId, ... }
 *      CJO:      { invoice, amount_bani (bani), sessionId, paymentIntentId?, ... }
 *    Match by paymentIntentId when present (exact), else by exact amount —
 *    but ONLY when a single entry matches (ambiguous amounts stay unmatched
 *    rather than guessing).
 *
 * 2. `parseOblioProformaDesc` — detect Stripe Checkout Sessions created by
 *    OBLIO's own card-payment link on a proforma ("Plata cu card-ul pentru
 *    Proforma EGIP 0319"). Those sessions carry only Oblio's internal
 *    numeric orderId, so the sync can't tie them to any app order — but the
 *    proforma series+number lets us look the resulting invoice up in Oblio.
 */

export interface ExtraInvoiceRef {
  seriesName?: string | null;
  number?: string | number | null;
  link?: string | null;
}

export interface ExtraBillingEntry {
  invoice?: ExtraInvoiceRef | null;
  /** eghiseul: RON */
  amount?: number | string | null;
  /** CJO: bani */
  amount_bani?: number | string | null;
  paymentIntentId?: string | null;
  sessionId?: string | null;
}

export interface ExtraMatchInput {
  payment_intent_id: string | null;
  gross_bani: number;
}

export interface ExtraInvoiceMatch {
  invoiceNumber: string;
  invoiceUrl: string | null;
}

function entryAmountBani(e: ExtraBillingEntry): number | null {
  if (e.amount_bani != null && Number.isFinite(Number(e.amount_bani))) {
    return Math.round(Number(e.amount_bani));
  }
  if (e.amount != null && Number.isFinite(Number(e.amount))) {
    return Math.round(Number(e.amount) * 100);
  }
  return null;
}

function toMatch(e: ExtraBillingEntry): ExtraInvoiceMatch | null {
  const inv = e.invoice;
  if (!inv || !inv.number) return null;
  const series = (inv.seriesName ?? '').toString().trim();
  const number = inv.number.toString().trim();
  return {
    invoiceNumber: series ? `${series}-${number}` : number,
    invoiceUrl: inv.link ?? null,
  };
}

/**
 * Find the extra-payment invoice for a payout row among an order's
 * extra_billing entries. PaymentIntent match wins; amount match is used only
 * when it is unambiguous (exactly one candidate).
 */
export function extraInvoiceForRow(
  entries: ExtraBillingEntry[] | null | undefined,
  row: ExtraMatchInput
): ExtraInvoiceMatch | null {
  if (!entries?.length) return null;
  const withInvoice = entries.filter((e) => e.invoice && e.invoice.number);
  if (!withInvoice.length) return null;

  if (row.payment_intent_id) {
    const byPi = withInvoice.find((e) => e.paymentIntentId === row.payment_intent_id);
    if (byPi) return toMatch(byPi);
  }

  const byAmount = withInvoice.filter((e) => entryAmountBani(e) === row.gross_bani);
  if (byAmount.length === 1) return toMatch(byAmount[0]);

  return null;
}

/**
 * An extra payment that WAS collected but whose fiscal invoice was never
 * issued (Oblio failed at payment time; only the proforma exists). Without
 * this the payout sync fell back to the ORDER's main invoice — E-260817-J2BXD:
 * the 200 lei extra of 03.09 showed up as EGH-0439, the invoice of the
 * 1.546 lei paid on 17.08, so the accountant saw the same invoice collected
 * twice (14.10.2026). Matched by PaymentIntent only: amount guessing would
 * risk hiding a real invoice.
 */
export function unbilledExtraForRow(
  entries: (ExtraBillingEntry & { proforma?: ExtraInvoiceRef | null })[] | null | undefined,
  row: ExtraMatchInput
): { proformaNumber: string | null } | null {
  if (!entries?.length || !row.payment_intent_id) return null;
  const hit = entries.find((e) => e.paymentIntentId === row.payment_intent_id && !(e.invoice && e.invoice.number));
  if (!hit) return null;
  const pf = hit.proforma;
  const proformaNumber =
    pf && pf.number ? `${(pf.seriesName ?? '').toString().trim()}-${pf.number.toString().trim()}`.replace(/^-/, '') : null;
  return { proformaNumber };
}

export interface OblioProformaRef {
  series: string;
  number: string;
}

/**
 * Parse an Oblio card-payment line-item description:
 *   "Plata cu card-ul pentru Proforma EGIP 0319" → { series: 'EGIP', number: '0319' }
 * Tolerant to diacritics/casing; returns null for anything that doesn't
 * explicitly reference a proforma.
 */
export function parseOblioProformaDesc(desc: string | null | undefined): OblioProformaRef | null {
  if (!desc) return null;
  const m = desc.match(/proforma\s+([A-Z][A-Z0-9]{0,11})[\s-]+(\d{1,10})\b/i);
  if (!m) return null;
  return { series: m[1].toUpperCase(), number: m[2] };
}

/** Minimal shape of an Oblio document (proforma or invoice) from the docs list API. */
export interface OblioDocLite {
  seriesName?: string | null;
  number?: string | null;
  issueDate?: string | null;
  total?: string | number | null;
  canceled?: string | number | null;
  link?: string | null;
  client?: { name?: string | null; email?: string | null } | null;
}

const normEmail = (s: unknown) => String(s ?? '').trim().toLowerCase();
const normName = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * Pick the fiscal invoice Oblio issued when a PROFORMA was paid by card.
 *
 * Match on the proforma's own client (email, else name) + exact total, among
 * non-canceled invoices issued on/after the proforma date. The Stripe payer
 * (billing_details) is NOT a reliable key: the card holder is often someone
 * else (a relative, an accountant) — EGIP 0315 was paid from
 * abuhouf01@gmail.com while the proforma + invoice EGI2024-24180 carry
 * yosef.sa99@gmail.com, so the payer-email match left the row "nefacturat"
 * for 3 months (payouts po_1Tlel5…, po_1Tjpss…; 2026-09-14).
 *
 * Returns null on 0 or >1 candidates — ambiguity is left to the operator.
 */
export function pickInvoiceForProforma(
  proforma: OblioDocLite,
  invoices: OblioDocLite[],
): OblioDocLite | null {
  const total = Number(proforma.total);
  if (!Number.isFinite(total)) return null;
  const email = normEmail(proforma.client?.email);
  const name = normName(proforma.client?.name);
  const from = proforma.issueDate ?? '';

  const candidates = invoices.filter((inv) => {
    if (String(inv.canceled ?? '0') === '1') return false;
    if (Number(inv.total) !== total) return false;
    if (from && inv.issueDate && inv.issueDate < from) return false;
    const invEmail = normEmail(inv.client?.email);
    const invName = normName(inv.client?.name);
    if (email && invEmail) return invEmail === email;
    return !!name && invName === name;
  });
  return candidates.length === 1 ? candidates[0] : null;
}

const ronText = (bani: number) =>
  (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Note for the payout rows of an order cancelled (70% refunded) before its
 * first invoice was issued. The only fiscal document is the 30% cancel-fee
 * invoice, linked to both the charge and the refund row. Without the amounts
 * spelled out, the accountant read "EGH-0692 collected 198 lei" on the
 * charge row, while EGH-0692 is 59,40 lei (18.09.2026 payout, asked
 * 16.10.2026).
 */
export function cancelFeeOnlyNote(opts: {
  type: string;
  invoiceNumber: string;
  totalBani: number;
  refundedBani: number;
}): string {
  const kept = Math.max(0, opts.totalBani - opts.refundedBani);
  if (opts.type === 'refund' || opts.type === 'payment_refund') {
    return (
      `rambursare ${ronText(opts.refundedBani)} lei (70%), fără storno: nu a existat factură inițială; ` +
      `${opts.invoiceNumber} = ${ronText(kept)} lei, taxa de anulare 30% rămasă din ${ronText(opts.totalBani)} lei`
    );
  }
  return (
    `${opts.invoiceNumber} = ${ronText(kept)} lei (taxa de anulare 30%), NU ${ronText(opts.totalBani)} lei: ` +
    `din ${ronText(opts.totalBani)} lei încasați s-au rambursat ${ronText(opts.refundedBani)} lei; fără factură inițială`
  );
}

/**
 * Note for the refund row of a partial cancellation that WAS invoiced: the
 * original invoice is stornoed in full and a new invoice covers what we
 * kept, so the storno (−198) never equals the refund (−138,60). Spelled out
 * so the accountant doesn't read a mismatch (audit 16.10.2026: EGH-0683,
 * EGH-0474, EGH-0377, EGH-0245).
 */
export function stornoWithFeeNote(opts: {
  stornoNumber: string;
  feeNumber: string | null;
  totalBani: number;
  refundedBani: number;
}): string {
  const kept = Math.max(0, opts.totalBani - opts.refundedBani);
  return (
    `rambursat ${ronText(opts.refundedBani)} lei = storno ${opts.stornoNumber} (−${ronText(opts.totalBani)} lei, factura inițială anulată integral)` +
    (opts.feeNumber ? ` + factura ${opts.feeNumber} (${ronText(kept)} lei păstrați)` : '')
  );
}

/** A collected extra payment that still has no fiscal invoice (admin warnings). */
export interface UnbilledExtra {
  amount: number | null;
  paidAt: string | null;
  proformaNumber: string | null;
}

/**
 * Extra payments that were PAID (paidAt set) but have no invoice yet. The
 * webhook issues the invoice from the proforma right after payment; when Oblio
 * fails, the hourly cron retries. This list feeds the red warnings on the
 * order page and the admin dashboard so a failure can't stay silent for weeks
 * (E-260817-J2BXD: 03.09 → found by the accountant on 14.10.2026).
 */
export function listUnbilledExtras(
  entries: (ExtraBillingEntry & { paidAt?: string | null; proforma?: ExtraInvoiceRef | null })[] | null | undefined
): UnbilledExtra[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((e) => !!e.paidAt && !(e.invoice && e.invoice.number))
    .map((e) => ({
      amount: e.amount != null ? Number(e.amount) : e.amount_bani != null ? Number(e.amount_bani) / 100 : null,
      paidAt: e.paidAt ?? null,
      proformaNumber:
        e.proforma && e.proforma.number
          ? `${(e.proforma.seriesName ?? '').toString().trim()}-${e.proforma.number.toString().trim()}`.replace(/^-/, '')
          : null,
    }));
}
