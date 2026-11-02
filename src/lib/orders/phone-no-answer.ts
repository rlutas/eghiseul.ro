/**
 * „Nu a răspuns" attempts on the phone recovery queue (team request,
 * 07.10.2026): two boxes before the client's name, ticked when the client
 * does not pick up. After the second no-answer the client leaves „De sunat"
 * for good. Stored on the order the team sees in the queue (the newest order
 * of that email) as `orders.phone_no_answer_attempts` = [{ at, caller }].
 *
 * A no-answer is NOT a call: it never sets `phone_contacted_at`, so it never
 * counts in the call KPIs nor as the call that „recovered" a client.
 */

import { normalizeEmail, phoneKey } from '@/lib/orders/phone-recovery-wins';

/** No-answers after which the client leaves the „De sunat" queue. */
export const NO_ANSWER_LIMIT = 2;

export interface NoAnswerAttempt {
  /** ISO timestamp of the tick. */
  at: string;
  /** Who tried to call (Maria/Carla). */
  caller: string;
}

export type NoAnswerAction = 'add' | 'undo';

export function isNoAnswerAction(value: unknown): value is NoAnswerAction {
  return value === 'add' || value === 'undo';
}

/** The jsonb column as stored, defensively: invalid entries are dropped, oldest first. */
export function parseNoAnswerAttempts(raw: unknown): NoAnswerAttempt[] {
  if (!Array.isArray(raw)) return [];
  const out: NoAnswerAttempt[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { at, caller } = item as { at?: unknown; caller?: unknown };
    if (typeof at !== 'string' || Number.isNaN(new Date(at).getTime())) continue;
    out.push({ at, caller: typeof caller === 'string' ? caller : '' });
  }
  return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export type NoAnswerResult =
  | { ok: true; attempts: NoAnswerAttempt[] }
  | { ok: false; error: string };

/**
 * `add` appends one attempt (refused once the limit is reached); `undo`
 * removes the LAST one, so a mis-click can be taken back.
 */
export function applyNoAnswer(
  current: NoAnswerAttempt[],
  action: NoAnswerAction,
  caller: string,
  nowIso: string = new Date().toISOString()
): NoAnswerResult {
  if (action === 'add') {
    if (current.length >= NO_ANSWER_LIMIT) {
      return { ok: false, error: `Ai bifat deja ${NO_ANSWER_LIMIT} încercări fără răspuns` };
    }
    return { ok: true, attempts: [...current, { at: nowIso, caller }] };
  }
  if (current.length === 0) {
    return { ok: false, error: 'Nu există nicio încercare de anulat' };
  }
  return { ok: true, attempts: current.slice(0, -1) };
}

/** When the limit was reached (time of the last counted attempt), or null. */
export function noAnswerClosedAt(attempts: NoAnswerAttempt[]): string | null {
  return attempts.length >= NO_ANSWER_LIMIT ? attempts[NO_ANSWER_LIMIT - 1].at : null;
}

/**
 * Clients closed by no-answers, by email and phone (latest closure wins).
 * A client often has several unpaid orders and the queue shows only the
 * newest, so the closure must follow the client, not one order: otherwise
 * an older order of the same email would pop back into „De sunat".
 */
export function buildNoAnswerIndex(
  orders: { email: string | null; phone: string | null; attempts: NoAnswerAttempt[] }[]
): Map<string, string> {
  const idx = new Map<string, string>();
  for (const o of orders) {
    const closedAt = noAnswerClosedAt(o.attempts);
    if (!closedAt) continue;
    const email = normalizeEmail(o.email);
    const phone = phoneKey(o.phone);
    for (const key of [email && `e:${email}`, phone && `p:${phone}`]) {
      if (!key) continue;
      const prev = idx.get(key);
      if (!prev || new Date(prev).getTime() < new Date(closedAt).getTime()) idx.set(key, closedAt);
    }
  }
  return idx;
}

/**
 * True when the client (email or phone) was closed by two no-answers and the
 * order was started before that. An order started AFTER the closure is a new
 * attempt by the client and goes back into the queue.
 */
export function isClosedByNoAnswer(
  index: Map<string, string>,
  email: string | null | undefined,
  phone: string | null | undefined,
  orderCreatedAt: string
): boolean {
  const e = normalizeEmail(email);
  const p = phoneKey(phone);
  const created = new Date(orderCreatedAt).getTime();
  for (const key of [e && `e:${e}`, p && `p:${p}`]) {
    if (!key) continue;
    const closedAt = index.get(key);
    if (closedAt && created <= new Date(closedAt).getTime()) return true;
  }
  return false;
}
