/**
 * Phone recovery: did the client pay after the call?
 *
 * When the team calls about an abandoned order, the client usually pays on a
 * NEW order (fresh wizard, link from the follow-up email), so the called order
 * stays draft/abandoned forever and the queue keeps showing it as unpaid.
 * Matching is by email (lowercased `customer_data.contact.email`): the first
 * paid order whose `paid_at` is after the call, minus a one-day grace (a client
 * who paid the evening before the team got round to logging the call still
 * counts as recovered, and the same rule hides them from the open queue).
 */

const DAY_MS = 86_400_000;

/**
 * Who makes the recovery calls. The team shares one admin account, so the
 * caller is picked in the dialog (Raul, 13.10.2026) and stored in
 * `orders.phone_contacted_by` instead of the login email.
 */
export const PHONE_CALLERS = ['Maria', 'Carla'] as const;
export type PhoneCaller = (typeof PHONE_CALLERS)[number];

export function isPhoneCaller(value: unknown): value is PhoneCaller {
  return typeof value === 'string' && (PHONE_CALLERS as readonly string[]).includes(value);
}

export interface PaidOrderRef {
  email: string;
  paidAt: string;
  totalRon: number;
  /** friendly_order_id or order_number, for display. */
  ref: string;
  orderId: string;
}

export function normalizeEmail(email: string | null | undefined): string | null {
  const e = (email ?? '').trim().toLowerCase();
  return e || null;
}

/** Paid orders grouped by email, each list sorted by paidAt ascending. */
export function buildPaidIndex(paid: PaidOrderRef[]): Map<string, PaidOrderRef[]> {
  const idx = new Map<string, PaidOrderRef[]>();
  for (const p of paid) {
    const email = normalizeEmail(p.email);
    if (!email || !p.paidAt) continue;
    const list = idx.get(email) ?? [];
    list.push({ ...p, email });
    idx.set(email, list);
  }
  for (const list of idx.values()) {
    list.sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime());
  }
  return idx;
}

/**
 * First paid order for `email` with paidAt > since − grace. `excludeOrderId`
 * skips the order itself (a called order that later got paid directly is a
 * recovery too, but then the caller sees it through its own status).
 */
export function findPaymentAfter(
  index: Map<string, PaidOrderRef[]>,
  email: string | null | undefined,
  sinceIso: string,
  graceMs: number = DAY_MS
): PaidOrderRef | null {
  const e = normalizeEmail(email);
  if (!e || !sinceIso) return null;
  const list = index.get(e);
  if (!list) return null;
  const from = new Date(sinceIso).getTime() - graceMs;
  return list.find((p) => new Date(p.paidAt).getTime() > from) ?? null;
}

export interface CallStats {
  calls7: number;
  calls30: number;
  recovered: number;
  recoveredLei: number;
}

/** KPI over the contacted orders (deduped by email: one recovery per client). */
export function summarizeCalls(
  contacted: { email: string | null; phoneContactedAt: string }[],
  index: Map<string, PaidOrderRef[]>,
  now: number = Date.now()
): CallStats {
  let calls7 = 0;
  let calls30 = 0;
  const recoveredOrders = new Map<string, number>();
  for (const c of contacted) {
    const age = now - new Date(c.phoneContactedAt).getTime();
    if (age <= 7 * DAY_MS) calls7 += 1;
    if (age <= 30 * DAY_MS) calls30 += 1;
    const paid = findPaymentAfter(index, c.email, c.phoneContactedAt);
    if (paid) recoveredOrders.set(paid.orderId, paid.totalRon);
  }
  const recoveredLei = [...recoveredOrders.values()].reduce((s, v) => s + v, 0);
  return { calls7, calls30, recovered: recoveredOrders.size, recoveredLei: Math.round(recoveredLei * 100) / 100 };
}

/**
 * Last 9 digits of a phone number, so "+40 712 345 678", "0712345678" and
 * "40712345678" match. Null when fewer than 9 digits.
 */
export function phoneKey(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : null;
}

/** A call logged from „Recuperare telefonică", shown on the orders list. */
export interface CallMark {
  at: string;
  by: string | null;
  notes: string | null;
  /** friendly_order_id or order_number of the order the call was logged on. */
  ref: string;
  orderId: string;
}

export interface CalledOrderRef extends CallMark {
  email: string | null;
  phone: string | null;
}

/**
 * Calls indexed by email and by phone (newest call wins). A client often has
 * several unpaid orders; the call is logged on one of them, and the
 * „Neplătite" list must show it on all, so nobody calls the same person twice.
 */
export function buildCallIndex(called: CalledOrderRef[]): Map<string, CallMark> {
  const idx = new Map<string, CallMark>();
  for (const c of called) {
    if (!c.at) continue;
    const mark: CallMark = { at: c.at, by: c.by, notes: c.notes, ref: c.ref, orderId: c.orderId };
    const email = normalizeEmail(c.email);
    const phone = phoneKey(c.phone);
    for (const key of [email && `e:${email}`, phone && `p:${phone}`]) {
      if (!key) continue;
      const prev = idx.get(key);
      if (!prev || new Date(prev.at).getTime() < new Date(mark.at).getTime()) idx.set(key, mark);
    }
  }
  return idx;
}

/** Newest call matching the email or the phone, or null. */
export function findCall(
  index: Map<string, CallMark>,
  email: string | null | undefined,
  phone: string | null | undefined,
): CallMark | null {
  const e = normalizeEmail(email);
  const p = phoneKey(phone);
  const byEmail = e ? index.get(`e:${e}`) ?? null : null;
  const byPhone = p ? index.get(`p:${p}`) ?? null : null;
  if (byEmail && byPhone) {
    return new Date(byEmail.at).getTime() >= new Date(byPhone.at).getTime() ? byEmail : byPhone;
  }
  return byEmail ?? byPhone;
}
