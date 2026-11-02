/**
 * Who belongs to „Recuperare telefonică", so „Abandonuri" does not show them.
 *
 * Team request 12.10.2026: „ce intră la recuperare telefonică să dispară de la
 * abandonuri, deoarece așa am sunat pe aceiași clienți". Since 02.11.2026 the
 * unpaid list hides, by default, every unpaid order of a client (same email,
 * or same last 9 phone digits) who is:
 *  - `queue`     — waiting in „De sunat" (in the phone recovery queue and not
 *                  called yet: someone else calls them from there);
 *  - `no_answer` — ticked „Nu a răspuns" in the last CLAIM_DAYS days (they are
 *                  retried from the queue).
 * A client already called (`called`, last CLAIM_DAYS days, from either list)
 * stays VISIBLE with the „Sunat" badge (owner decision 02.11.2026: a row that
 * vanished on reload right after logging a call confused the team, and the
 * badge already stops a second call). `called` beats the other two reasons.
 * A toggle shows the hidden ones again (marked), and the list says how many
 * are hidden. The same rule runs on cazierjudiciaronline.com
 * (src/lib/recovery-claims.ts).
 *
 * Pure functions only; the loader is in recovery-claims-loader.ts.
 */

import { hasProgressBeyondContact, identifiableName } from '@/lib/orders/abandoned-progress';
import { isSuspiciousEmail, isUndeliverable } from '@/lib/email/deliverability';
import {
  findPaymentAfter,
  normalizeEmail,
  phoneKey,
  type PaidOrderRef,
} from '@/lib/orders/phone-recovery-wins';

/** Calls and no-answers older than this no longer keep a client out of Abandonuri. */
export const CLAIM_DAYS = 60;

/**
 * Unpaid orders are matched against the claims over this window (by
 * created_at). Older unpaid orders of a claimed client stay visible: reading
 * the contact out of every old draft's customer_data costs ~1 s cold, and
 * nobody calls about a 3-month-old draft from the top of the list.
 */
export const MATCH_WINDOW_DAYS = 90;

export type ClaimReason = 'queue' | 'called' | 'no_answer';

/** When one client matches several reasons, the strongest is shown. */
const REASON_RANK: Record<ClaimReason, number> = { called: 3, no_answer: 2, queue: 1 };

export const CLAIM_LABELS: Record<ClaimReason, string> = {
  queue: 'În Recuperare telefonică',
  called: 'Sunat (Recuperare telefonică)',
  no_answer: 'Nu a răspuns (Recuperare telefonică)',
};

export interface ClaimSource {
  email: string | null | undefined;
  phone: string | null | undefined;
  reason: ClaimReason;
}

/** Claims indexed by `e:<email>` and `p:<last 9 digits>`, strongest reason kept. */
export function buildClaimIndex(sources: ClaimSource[]): Map<string, ClaimReason> {
  const idx = new Map<string, ClaimReason>();
  for (const s of sources) {
    const email = normalizeEmail(s.email);
    const phone = phoneKey(s.phone);
    for (const key of [email && `e:${email}`, phone && `p:${phone}`]) {
      if (!key) continue;
      const prev = idx.get(key);
      if (!prev || REASON_RANK[s.reason] > REASON_RANK[prev]) idx.set(key, s.reason);
    }
  }
  return idx;
}

/** The client's claim (by email or phone, strongest reason), or null. */
export function findClaim(
  index: Map<string, ClaimReason>,
  email: string | null | undefined,
  phone: string | null | undefined
): ClaimReason | null {
  const e = normalizeEmail(email);
  const p = phoneKey(phone);
  const byEmail = e ? index.get(`e:${e}`) ?? null : null;
  const byPhone = p ? index.get(`p:${p}`) ?? null : null;
  if (byEmail && byPhone) return REASON_RANK[byEmail] >= REASON_RANK[byPhone] ? byEmail : byPhone;
  return byEmail ?? byPhone;
}

/**
 * Does this claim keep the client out of Abandonuri by default? Only clients
 * still to be called from the queue, or retried there after a no-answer; a
 * client already called stays in the list, marked „Sunat".
 */
export function hidesFromAbandoned(reason: ClaimReason | null | undefined): boolean {
  return reason === 'queue' || reason === 'no_answer';
}

/**
 * Is this order a row of the phone recovery queue? Same rules as
 * GET /api/admin/orders/priority-calls (draft/abandoned of the last 30 days
 * are pre-filtered by the query): a draft must have data beyond the contact
 * step, the client must have a name, the email must look real, and the client
 * must not have paid since (on any order).
 */
export function isRecoveryQueueCandidate(
  order: {
    status: string | null;
    customer_data: unknown;
    created_at: string;
    phone_contacted_at?: string | null;
  },
  paidIndex: Map<string, PaidOrderRef[]>
): boolean {
  if (order.status === 'draft' && !hasProgressBeyondContact(order.customer_data)) return false;
  if (!identifiableName(order.customer_data)) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const email = normalizeEmail((order.customer_data as any)?.contact?.email);
  if (email && (isUndeliverable(email) || isSuspiciousEmail(email))) return false;
  const paidLater = findPaymentAfter(
    paidIndex,
    email,
    order.phone_contacted_at ?? order.created_at,
    order.phone_contacted_at ? undefined : 0
  );
  return !paidLater;
}

/**
 * The page of visible ids: `orderedIds` is the list in display order (a
 * prefix long enough to hold offset + limit visible rows), `hidden` the ids
 * kept out of the list.
 */
export function pickVisibleIds(
  orderedIds: string[],
  hidden: Set<string>,
  offset: number,
  limit: number
): string[] {
  const visible = orderedIds.filter((id) => !hidden.has(id));
  return visible.slice(offset, offset + limit);
}
