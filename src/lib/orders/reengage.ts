/**
 * Re-engagement (plan B10, approved by Raul on 13.10.2026): ONE email, no
 * coupon, to eghiseul clients whose order stayed unpaid 7–60 days ago. The
 * recovery sequence (`/api/cron/recovery-emails`) covers only the first 7
 * days; this is the eghiseul twin of CJO's B9 („Mai aveți nevoie?", CJO
 * `58368ae5`).
 *
 * Pure rules, so they are testable. One email per address, ever; the newest
 * unpaid order of an address is the one we write about. Test stop, same rule
 * as B9: after REENGAGE_TOTAL_CAP sends the cron stops by itself; measure
 * paid orders from utm_campaign=reengage-order before raising anything.
 */

export const REENGAGE_ENABLED = true;

const DAY_MS = 24 * 60 * 60 * 1000;
export const REENGAGE_MIN_AGE_MS = 7 * DAY_MS;
export const REENGAGE_MAX_AGE_MS = 60 * DAY_MS;
/** A call, a manual email or a recovery email inside this window: we spoke to them recently. */
export const REENGAGE_RECENT_CONTACT_MS = 7 * DAY_MS;
/** A paid order this long before the unpaid one still counts as "has it". */
export const REENGAGE_PAID_LOOKBACK_MS = 60 * DAY_MS;
export const REENGAGE_MAX_PER_RUN = 15;
export const REENGAGE_DAILY_CAP = 90;
export const REENGAGE_TOTAL_CAP = 500;
/** `order_history.changed_by` of the send log; also how the cron counts its sends. */
export const REENGAGE_ACTOR = 'system-reengage';

export const UNPAID_STATUSES = ['draft', 'pending', 'abandoned'] as const;

export interface ReengageOrder {
  id: string;
  email: string | null;
  status: string;
  platform: string | null;
  isTest: boolean;
  createdAt: string;
  paidAt: string | null;
  /** Draft got past the contact step (`hasProgressBeyondContact`). Ignored for other statuses. */
  hasProgress: boolean;
}

export interface ReengageContext {
  now: Date;
  /** Lower-cased addresses with contacts.marketing_status unsubscribed/suppressed. */
  suppressed: Set<string>;
  /** Lower-cased addresses that already got this email (any order). */
  alreadyReengaged: Set<string>;
  /** Lower-cased address → created_at of its newest order (any status). */
  newestOrderByEmail: Map<string, string>;
  /** Lower-cased address → paid_at of each paid order. */
  paidByEmail: Map<string, string[]>;
  /** Lower-cased address → newest call / manual email / recovery email on any of its orders. */
  lastContactByEmail: Map<string, string>;
}

const PLAUSIBLE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
/** Typos seen in the data (gmail.con, yahoo.con): they bounce and hurt the domain. */
const TYPO_DOMAIN = /\.(con|cim|comm|om)$|@(gmail|yahoo|hotmail)\.co$|@g?mial\.|@gmai\.|@yaho\./i;

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

/** Why an order is NOT eligible, or null when it is. */
export function reengageReason(o: ReengageOrder, ctx: ReengageContext): string | null {
  const email = normalizeEmail(o.email);
  if (!email || !PLAUSIBLE_EMAIL.test(email)) return 'no valid email';
  if (TYPO_DOMAIN.test(email)) return 'typo domain';
  if (o.isTest) return 'test order';
  // documentero has its own brand and its own plan; B10 is eghiseul only.
  if ((o.platform ?? 'eghiseul') !== 'eghiseul') return 'not eghiseul';
  if (o.paidAt) return 'paid';
  if (!(UNPAID_STATUSES as readonly string[]).includes(o.status)) return 'not unpaid';
  // A draft that stopped at the contact step: we know nothing but the address.
  if (o.status === 'draft' && !o.hasProgress) return 'contact-only draft';
  const t = ctx.now.getTime();
  const created = Date.parse(o.createdAt);
  if (t - created < REENGAGE_MIN_AGE_MS) return 'too fresh';
  if (t - created > REENGAGE_MAX_AGE_MS) return 'too old';
  if (ctx.suppressed.has(email)) return 'suppressed';
  if (ctx.alreadyReengaged.has(email)) return 'already reengaged';
  // People restart the order: only the newest order of an address counts.
  // A newer one (even a fresh one) belongs to the recovery sequence.
  const newest = ctx.newestOrderByEmail.get(email);
  if (newest && Date.parse(newest) > created) return 'newer order exists';
  const lastContact = ctx.lastContactByEmail.get(email);
  if (lastContact && t - Date.parse(lastContact) < REENGAGE_RECENT_CONTACT_MS) return 'contacted recently';
  const paid = ctx.paidByEmail.get(email) ?? [];
  if (paid.some((p) => Date.parse(p) > created - REENGAGE_PAID_LOOKBACK_MS)) return 'already paid';
  return null;
}

/** Eligible orders, newest first, one per address, capped. */
export function selectReengage(orders: ReengageOrder[], ctx: ReengageContext, limit: number): ReengageOrder[] {
  const out: ReengageOrder[] = [];
  const seen = new Set<string>();
  const sorted = [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  for (const o of sorted) {
    if (out.length >= limit) break;
    if (reengageReason(o, ctx)) continue;
    const email = normalizeEmail(o.email);
    if (seen.has(email)) continue;
    seen.add(email);
    out.push(o);
  }
  return out;
}

/** How many to send in this run, given the last 24 hours and all-time counts. */
export function reengageBudget(sentToday: number, sentTotal: number): number {
  return Math.max(0, Math.min(REENGAGE_MAX_PER_RUN, REENGAGE_DAILY_CAP - sentToday, REENGAGE_TOTAL_CAP - sentTotal));
}

/** Newest of several ISO timestamps (nulls ignored), or null. */
export function newestIso(...values: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  for (const v of values) {
    if (!v) continue;
    if (!best || Date.parse(v) > Date.parse(best)) best = v;
  }
  return best;
}
