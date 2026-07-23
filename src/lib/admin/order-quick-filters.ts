/**
 * Quick + workflow-stage filters for the admin /admin/orders list — parity with
 * cazierjudiciaronline.com's admin so the ops team gets the same triage chips.
 *
 * Shared by /api/admin/orders/list and /api/admin/orders/counts so the badge
 * counts can never drift from the visible rows.
 *
 * Two chip groups:
 *  - QUICK  ("Filtre rapide"): overdue / deadline_soon / with_coupon — cross-status
 *    operational alerts (deadline anchored on `estimated_completion_date`).
 *  - STAGE  ("Stadiu"): where an order is in the post-paid pipeline. Adapted to
 *    eghiseul's multi-service status model (NOT the sister's cazier-only stages).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query = any;

/** Statuses considered "still in flight" — excluded from overdue/deadline alerts. */
const TERMINAL_OR_INACTIVE = [
  'completed',
  'refunded',
  'cancelled',
  'abandoned',
  'cancellation_requested',
  'standby',
  'draft',
  'pending',
] as const;

export type QuickFilter = 'overdue' | 'deadline_soon' | 'with_coupon' | 'extra_pending';

export function isQuickFilter(v: string | null | undefined): v is QuickFilter {
  return v === 'overdue' || v === 'deadline_soon' || v === 'with_coupon' || v === 'extra_pending';
}

/**
 * eghiseul post-paid pipeline stages (parity with the sister's "Stadiu" chips).
 * Each maps to a single order status so the queues are mutually exclusive.
 */
export const STAGE_FILTERS = {
  documents_generated: 'documents_generated',
  submitted: 'submitted_to_institution',
  received: 'document_received',
  la_tradus: 'la_tradus',
  la_legalizat: 'la_legalizat',
  la_apostila_notari: 'la_apostila_notari',
  apostila_haga: 'eliberat_apostila_haga',
  ready: 'document_ready',
} as const;

export type StageFilter = keyof typeof STAGE_FILTERS;

export const STAGE_LABELS: Record<StageFilter, string> = {
  documents_generated: 'Documente generate',
  submitted: 'Depus la instituție',
  received: 'Document primit',
  la_tradus: 'La traducere',
  la_legalizat: 'La legalizare',
  la_apostila_notari: 'Apostilă Notari',
  apostila_haga: 'Apostilă Haga',
  ready: 'Gata de livrare',
};

export function isStageFilter(v: string | null | undefined): v is StageFilter {
  return v != null && v in STAGE_FILTERS;
}

/** Apply the active quick/stage filter to a Supabase query builder (chainable). */
export function applyQuickOrStage(query: Query, quick: string | null | undefined): Query {
  const notInActive = `(${TERMINAL_OR_INACTIVE.map((s) => `"${s}"`).join(',')})`;

  if (quick === 'overdue') {
    // Past its estimated completion date and still in flight.
    return query
      .lt('estimated_completion_date', new Date().toISOString())
      .not('status', 'in', notInActive);
  }
  if (quick === 'deadline_soon') {
    // Due within the next 48h (and not already overdue) + still in flight.
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return query
      .gte('estimated_completion_date', now.toISOString())
      .lte('estimated_completion_date', in48h.toISOString())
      .not('status', 'in', notInActive);
  }
  if (quick === 'with_coupon') {
    return query.not('coupon_code', 'is', null);
  }
  if (quick === 'extra_pending') {
    // Extra payment requested (Modifică) but not yet paid — the Stripe link
    // dies after 24h, so these need the team's eye (contact client /
    // regenerate). Cleared automatically when the webhook settles the payment.
    return query
      .not('pending_extra_payment_url', 'is', null)
      .gt('pending_extra_payment_amount', 0)
      .not('status', 'in', `("cancelled","refunded","abandoned")`);
  }
  if (isStageFilter(quick)) {
    return query.eq('status', STAGE_FILTERS[quick]);
  }
  return query;
}
