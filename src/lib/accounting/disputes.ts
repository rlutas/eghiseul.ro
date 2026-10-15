/**
 * Bank disputes (chargebacks) in Decontări.
 *
 * Stripe books a dispute as a balance transaction with no source charge
 * attached: "Chargeback withdrawal for ch_…" (amount withdrawn + 100 lei
 * dispute fee), later "Chargeback reversal" if we win, plus separate
 * "Card Dispute … Fee" lines. The sync left them as platform "necunoscut"
 * with no client or invoice, and the accountant had to ask what the −179,99
 * lei in the 08.09.2026 payout was (dispute du_1UC9voHGb8JBHhclAT55CWaV on
 * invoice EGI2024-24278, asked on 15.10.2026).
 *
 * `refreshDisputeRows` rewrites those rows with the client, the original
 * invoice and the CURRENT dispute status. It runs on every sync over all
 * stored rows (not only the sync window): a dispute is decided months after
 * its payout, and the row must say "câștigată" / "pierdută" when it is.
 */

import type Stripe from 'stripe';

const CHARGE_REF_RE = /\b((?:ch|py)_[A-Za-z0-9]+)\b/;

/** Charge (or py_ payment) id from "Chargeback withdrawal for ch_…". */
export function disputedChargeId(description: string | null | undefined): string | null {
  const m = (description ?? '').match(CHARGE_REF_RE);
  return m ? m[1] : null;
}

/** A balance transaction that belongs to a dispute. */
export function isDisputeRow(row: {
  type: string;
  description: string | null;
  raw?: unknown;
}): boolean {
  const category = (row.raw as { reporting_category?: string } | null)?.reporting_category ?? '';
  if (category === 'dispute' || category === 'dispute_reversal') return true;
  const d = row.description ?? '';
  return /chargeback|dispută bancară/i.test(d) || (row.type === 'stripe_fee' && /dispute/i.test(d));
}

const STATUS_RO: Record<string, string> = {
  needs_response: 'deschisă, fără răspuns de la noi',
  warning_needs_response: 'deschisă, fără răspuns de la noi',
  under_review: 'contestată de noi, așteptăm decizia băncii',
  warning_under_review: 'contestată de noi, așteptăm decizia băncii',
  won: 'câștigată, banii revin',
  lost: 'pierdută, se emite storno pe factura inițială',
  warning_closed: 'închisă',
};

const REASON_RO: Record<string, string> = {
  product_unacceptable: 'produs neconform',
  product_not_received: 'produs neprimit',
  fraudulent: 'plată nerecunoscută',
  duplicate: 'plată dublă',
  subscription_canceled: 'abonament anulat',
  credit_not_processed: 'rambursare neprocesată',
  general: 'motiv general',
  unrecognized: 'plată nerecunoscută',
};

export function disputeStatusRo(status: string | null | undefined): string {
  return (status && STATUS_RO[status]) || status || 'stare necunoscută';
}

export function disputeReasonRo(reason: string | null | undefined): string {
  return (reason && REASON_RO[reason]) || reason || 'motiv necunoscut';
}

const ron = (bani: number) =>
  (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface DisputeRowInput {
  type: string;
  gross_bani: number;
  fee_bani: number;
  description: string | null;
}

export interface DisputeInfo {
  status: string | null;
  reason: string | null;
  evidenceDueBy: string | null;
}

export interface OriginalCharge {
  invoice_number: string | null;
  client_name: string | null;
  available_on: string | null;
}

/** The text the accountant reads on the payout row. */
export function describeDisputeRow(
  row: DisputeRowInput,
  dispute: DisputeInfo | null,
  original: OriginalCharge | null
): string {
  const parts: string[] = [];
  if (row.type === 'stripe_fee') {
    parts.push('Comision Stripe pentru dispută (cheltuială, nu se trece pe factura clientului)');
  } else if (row.gross_bani > 0) {
    parts.push(`Dispută bancară: bani returnați nouă ${ron(row.gross_bani)} lei`);
  } else {
    parts.push(
      `Dispută bancară: retras ${ron(-row.gross_bani)} lei` +
        (row.fee_bani ? ` + ${ron(row.fee_bani)} lei comision Stripe` : '')
    );
  }
  if (dispute) {
    parts.push(`stare: ${disputeStatusRo(dispute.status)}`);
    parts.push(`motiv: ${disputeReasonRo(dispute.reason)}`);
    if (dispute.evidenceDueBy && /needs_response/.test(dispute.status ?? '')) {
      parts.push(`termen răspuns ${dispute.evidenceDueBy}`);
    }
  }
  if (original?.invoice_number) parts.push(`factura inițială ${original.invoice_number}`);
  if (original?.available_on) parts.push(`plata din ${original.available_on}`);
  return parts.join(' · ');
}

interface StoredRow {
  id: string;
  type: string;
  gross_bani: number;
  fee_bani: number;
  description: string | null;
  charge_id: string | null;
  raw: unknown;
}

/**
 * Re-annotate every stored dispute row with client, original invoice and
 * live dispute status. Best-effort per row; errors are collected.
 */
export async function refreshDisputeRows(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  stripe: Stripe,
  errors: string[]
): Promise<number> {
  const { data, error } = await admin
    .from('stripe_payout_transactions')
    .select('id, type, gross_bani, fee_bani, description, charge_id, raw')
    .or("raw->>reporting_category.in.(dispute,dispute_reversal),description.ilike.%chargeback%,description.ilike.%dispută bancară%,and(type.eq.stripe_fee,description.ilike.%dispute%)")
    .limit(500);
  if (error) {
    errors.push(`dispute rows: ${error.message}`);
    return 0;
  }

  let updated = 0;
  for (const row of (data ?? []) as StoredRow[]) {
    if (!isDisputeRow(row)) continue;
    // Fee lines carry no charge reference: label them, nothing to look up.
    const chargeId = row.charge_id ?? disputedChargeId(row.description);
    let dispute: DisputeInfo | null = null;
    let original: (OriginalCharge & { client_email: string | null; order_number: string | null; platform: string | null; payment_intent_id: string | null }) | null = null;

    if (chargeId) {
      try {
        const list = await stripe.disputes.list({ charge: chargeId, limit: 1 });
        const d = list.data[0];
        if (d) {
          dispute = {
            status: d.status,
            reason: d.reason,
            evidenceDueBy: d.evidence_details?.due_by
              ? new Date(d.evidence_details.due_by * 1000).toISOString().slice(0, 10)
              : null,
          };
        }
      } catch (err) {
        errors.push(`dispute ${chargeId}: ${err instanceof Error ? err.message : String(err)}`);
      }
      const { data: orig } = await admin
        .from('stripe_payout_transactions')
        .select('invoice_number, client_name, client_email, order_number, platform, payment_intent_id, available_on')
        .eq('charge_id', chargeId)
        .in('type', ['charge', 'payment'])
        .limit(1)
        .maybeSingle();
      original = orig ?? null;
    }

    const description = describeDisputeRow(row, dispute, original);
    const patch: Record<string, unknown> = { description };
    if (chargeId) patch.charge_id = chargeId;
    if (original) {
      patch.client_name = original.client_name;
      patch.client_email = original.client_email;
      patch.order_number = original.order_number;
      patch.payment_intent_id = original.payment_intent_id;
      if (original.platform && original.platform !== 'necunoscut') patch.platform = original.platform;
    }
    const { error: upErr } = await admin.from('stripe_payout_transactions').update(patch).eq('id', row.id);
    if (upErr) errors.push(`dispute row ${row.id}: ${upErr.message}`);
    else updated++;
  }
  return updated;
}
