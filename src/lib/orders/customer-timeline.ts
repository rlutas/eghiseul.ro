/**
 * The order's history as the customer may see it — one place for the rules
 * that the public status page already applied and the account page did not.
 *
 * Raw `order_history` has two problems for a customer: rows they must never
 * see (team notes, abandoned-cart machinery, admin actions), and duplicates —
 * every status change is written by the database trigger AND by the route
 * that made it, 100 ms apart, so „AWAITING_PAYMENT" showed twice, raw
 * (feedback 18.09.2026, #15).
 */

import { CUSTOMER_STATUS } from '@/lib/orders/customer-status';

/** Team-only events: never on a customer timeline. */
export const INTERNAL_EVENTS = new Set([
  'note_added',
  'admin_action',
  'reupload_requested',
  'kyc_photo_resubmitted',
  'abandoned',
  'recovery_email_sent',
  'resume_link_generated',
  'document_viewed_by_client',
  'extra_invoice_issued',
  'standby_started',
]);

/** Pre-payment cart states: not part of the order's story. */
export const HIDDEN_STATUSES = new Set(['abandoned', 'draft']);

/** Events that are a stage of their own, worded for the customer. */
const EVENT_LABELS: Record<string, string> = {
  order_created: 'Comandă plasată',
  draft_created: 'Comandă plasată',
  order_submitted: 'Comandă trimisă',
  document_generated: 'Documente pregătite',
  documents_generated: 'Documente pregătite',
  payment_proof_submitted: 'Dovadă de plată primită — o verificăm',
  payment_confirmed: 'Plată confirmată',
  payment_received: 'Plată confirmată',
  payment_verified: 'Plată confirmată',
  extra_payment_sent: 'Plată suplimentară solicitată',
  extra_payment_paid: 'Plată suplimentară confirmată',
  shipped: 'Expediat',
};

export interface RawHistoryRow {
  id: string;
  event_type: string;
  new_value?: { status?: string; payment_status?: string } | string | null;
  notes?: string | null;
  created_at: string;
}

export interface TimelineEntry {
  id: string;
  /** The stage key: a customer status, or an event name for event-only rows. */
  status: string;
  event: string;
  label: string;
  note: string | null;
  createdAt: string;
}

/** The label for a stage: the customer status wording first, then events. */
export function timelineLabel(stage: string): string {
  return CUSTOMER_STATUS[stage]?.label ?? EVENT_LABELS[stage] ?? 'Actualizare';
}

function parseNewValue(v: RawHistoryRow['new_value']): { status?: string } | null {
  if (!v) return null;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return v;
}

/** Which stage a raw row belongs to, or null when it is not for the customer. */
export function stageOf(row: RawHistoryRow): string | null {
  const event = row.event_type;
  if (INTERNAL_EVENTS.has(event)) return null;
  // Events that mean something on their own keep their name, whatever status
  // they also carry — the proof row must not collapse into „awaiting_payment".
  if (EVENT_LABELS[event] && event !== 'shipped') return event;
  const status = parseNewValue(row.new_value)?.status ?? null;
  const stage = status === 'paid' ? 'payment_confirmed' : status;
  if (!stage) return null;
  if (HIDDEN_STATUSES.has(stage)) return null;
  return stage;
}

/**
 * Raw rows → the customer's timeline: hidden rows dropped, one entry per
 * stage (the first), labels in the customer's words, notes only when they
 * were written for the customer.
 */
export function customerTimeline(rows: RawHistoryRow[]): TimelineEntry[] {
  const seen = new Set<string>();
  const out: TimelineEntry[] = [];
  for (const row of rows) {
    const stage = stageOf(row);
    if (!stage || seen.has(stage)) continue;
    seen.add(stage);
    out.push({
      id: row.id,
      status: stage,
      event: row.event_type,
      label: timelineLabel(stage),
      // Notes from the team's own actions carry operational detail; keep only
      // the customer-facing ones (bank transfer / proof / shipping wording).
      note: row.event_type === 'status_changed' ? null : (row.notes ?? null),
      createdAt: row.created_at,
    });
  }
  return out;
}
