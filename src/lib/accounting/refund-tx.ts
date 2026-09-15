/**
 * Rambursările din payout-uri (Decontări): o tranzacție `refund` din Stripe
 * are ca sursă obiectul Refund, nu Charge, deci comanda nu se citea din
 * metadata charge-ului și rândul rămânea „necunoscut", fără factură. Aici e
 * partea pură: din Refund scoatem referința comenzii (metadata pusă de
 * process-cancellation / Modifică) + charge-ul de urmărit când lipsește.
 */

export interface RefundLike {
  id: string;
  charge?: string | { id: string } | null;
  payment_intent?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
}

export interface RefundReference {
  chargeId: string | null;
  paymentIntentId: string | null;
  /** Numărul comenzii din metadata refundului (E-… / CJO-…), dacă a fost pus. */
  orderNumber: string | null;
  /** Id-ul comenzii (uuid) din metadata, pentru refundurile vechi fără număr. */
  orderId: string | null;
  platformHint: 'cjo' | 'eghiseul' | null;
}

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  typeof v === 'string' ? v : v?.id ?? null;

export function resolveRefundReference(refund: RefundLike): RefundReference {
  const m = refund.metadata ?? {};
  const orderNumber = (m.order_number || m.order_ref || m.orderNumber || '').trim().toUpperCase() || null;
  const orderId = (m.order_id || m.orderId || '').trim() || null;
  const platformHint: RefundReference['platformHint'] =
    m.app_id === 'cjo' || (!!m.order_ref && !m.order_number) ? 'cjo' : m.order_number || m.orderId ? 'eghiseul' : null;
  return {
    chargeId: idOf(refund.charge),
    paymentIntentId: idOf(refund.payment_intent),
    orderNumber,
    orderId,
    platformHint,
  };
}

export const REFUND_TYPES = new Set(['refund', 'payment_refund']);
