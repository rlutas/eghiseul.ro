// Pure helpers for the 30-minute self-cancel feature. Kept in their own
// module so we can unit-test the time-window + status guard math without
// having to spin up a Supabase client.

export const CANCEL_WINDOW_MS = 30 * 60 * 1000;
export const CANCEL_REFUND_PERCENT = 70;
export const CANCEL_RATE_MAX = 5;
export const CANCEL_RATE_WINDOW_MS = 15 * 60 * 1000;

export interface SelfCancelInput {
  status: string | null;
  paid_at: string | null; // ISO timestamp
  now?: number; // injectable for tests
}

export type SelfCancelDecision =
  | { canCancel: true }
  | { canCancel: false; code: 'not_paid' | 'no_paid_at' | 'window_expired' | 'already_cancelled'; reason: string };

// Statuses that block self-cancel outright, regardless of the 30-min window.
// Politica (paritate CJO, termeni secțiunea 8): în primele 30 de minute de la
// plată clientul poate anula INDIFERENT cât a avansat comanda intern — echipa
// poate porni procesarea în minutul 5, dar promisiunea de 30 de minute din
// termeni rămâne valabilă. Blochează doar stadiile ireversibile
// (expediat/finalizat) și cele deja anulate/neplătite.
export const SELF_CANCEL_BLOCKED_STATUSES = [
  'draft',
  'pending',
  'abandoned',
  'cancellation_requested',
  'cancelled',
  'refunded',
  'shipped',
  'completed',
] as const;

// Returns whether an order can still be cancelled by the customer. Pure —
// only inspects status, paid_at, and the current time.
export function evaluateSelfCancel(input: SelfCancelInput): SelfCancelDecision {
  const now = input.now ?? Date.now();
  const status = input.status;

  if (status === 'cancellation_requested' || status === 'cancelled' || status === 'refunded') {
    return {
      canCancel: false,
      code: 'already_cancelled',
      reason: 'Comanda este deja anulată sau rambursată.',
    };
  }

  if ((SELF_CANCEL_BLOCKED_STATUSES as readonly string[]).includes(status ?? '')) {
    return {
      canCancel: false,
      code: 'not_paid',
      reason:
        'Comanda nu mai poate fi anulată online (expediată, finalizată sau fără plată confirmată). Pentru asistență contactează-ne pe WhatsApp sau telefon.',
    };
  }

  if (!input.paid_at) {
    return {
      canCancel: false,
      code: 'no_paid_at',
      reason: 'Comanda nu are o plată confirmată.',
    };
  }

  const paidAt = Date.parse(input.paid_at);
  if (Number.isNaN(paidAt)) {
    return {
      canCancel: false,
      code: 'no_paid_at',
      reason: 'Data plății este invalidă.',
    };
  }

  if (now - paidAt > CANCEL_WINDOW_MS) {
    return {
      canCancel: false,
      code: 'window_expired',
      reason: 'Perioada de anulare de 30 de minute a expirat.',
    };
  }

  return { canCancel: true };
}

// Milliseconds remaining in the cancel window. Returns 0 when expired or
// when the order is not in a cancellable state. Used by the client-side
// countdown timer.
export function cancelWindowRemainingMs(paidAt: string | null, now: number = Date.now()): number {
  if (!paidAt) return 0;
  const t = Date.parse(paidAt);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, CANCEL_WINDOW_MS - (now - t));
}

// Formats remaining ms as MM:SS for the UI countdown.
export function formatCancelCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Refund amount in RON given the order total and the 70% refund policy.
// Rounded to 2 decimals to match Stripe's amount_in_minor_units expectations
// after we multiply by 100.
export function computeCancelRefundAmount(totalRon: number): number {
  return Math.round(totalRon * (CANCEL_REFUND_PERCENT / 100) * 100) / 100;
}
