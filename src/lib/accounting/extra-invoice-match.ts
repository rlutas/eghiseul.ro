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
