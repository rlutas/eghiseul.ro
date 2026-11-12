/**
 * When does an unpaid `pending` order count as abandoned?
 *
 * The 30 minutes run from the moment the customer reached PAYMENT
 * (`submitted_at`), not from the moment the draft was created. Counting from
 * `created_at` abandoned a draft started in the morning and submitted in the
 * evening at the very next cron run — E-261111-EMRB4 (11.11.2026): marked
 * abandoned 6 minutes after «Plătește», with the customer still on the payment
 * page. Every order reopened as a draft and submitted again hit the same case.
 *
 * `created_at` stays as the fallback for rows without `submitted_at`.
 */

export interface AbandonCandidate {
  submitted_at?: string | null;
  created_at: string | null;
}

export function abandonClockStart(order: AbandonCandidate): number | null {
  const ms = Date.parse(order.submitted_at || order.created_at || '');
  return Number.isFinite(ms) ? ms : null;
}

/** True when the order has been waiting for payment longer than the threshold. */
export function isAbandonDue(order: AbandonCandidate, nowMs: number, afterMinutes: number): boolean {
  const start = abandonClockStart(order);
  // No usable timestamp: leave the order alone rather than abandon it blindly.
  if (start === null) return false;
  return nowMs - start > afterMinutes * 60 * 1000;
}
