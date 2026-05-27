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

  // Anything past 'paid' means we've already started processing — that's
  // the bright line for the customer-facing window.
  if (status !== 'paid') {
    return {
      canCancel: false,
      code: 'not_paid',
      reason:
        'Comanda nu poate fi anulată — este deja în curs de procesare. Pentru asistență contactează-ne pe WhatsApp sau telefon.',
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
