/**
 * In which month does a Stripe payout belong for accounting?
 *
 * The accountant works from the bank statement, so the answer is the day the
 * money reached the bank — not Stripe's `arrival_date`, which is an estimate
 * and runs one business day late: the payout created on Friday 30.10.2026
 * (1.143,42 lei) was in the bank the same day, while Stripe said 02.11, so the
 * October settlement missed it and it showed up under November.
 *
 * Order of trust:
 *   1. the date of the bank statement line the payout is matched to;
 *   2. the day Stripe created the payout (Romanian time) — on the payouts
 *      checked, the bank date equals it every time;
 *   3. Stripe's `arrival_date`, when nothing else is known.
 */

export interface PayoutDates {
  id: string;
  arrival_date: string | null;
  created_at_stripe?: string | null;
}

/** YYYY-MM-DD in Romanian time. */
function roDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(d);
}

export function payoutAccountingDate(p: PayoutDates, bankDate?: string | null): string | null {
  if (bankDate) return bankDate.slice(0, 10);
  if (p.created_at_stripe) {
    const created = roDate(p.created_at_stripe);
    if (created) return created;
  }
  return p.arrival_date ? p.arrival_date.slice(0, 10) : null;
}

export function isInMonth(date: string | null, month: string): boolean {
  return !!date && date.slice(0, 7) === month;
}

/** Stripe's estimate can sit a few days on either side of the bank date. */
const WINDOW_DAYS = 7;

export function monthQueryWindow(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const start = Date.UTC(y, m - 1, 1);
  const end = Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1);
  const day = 86_400_000;
  return {
    from: new Date(start - WINDOW_DAYS * day).toISOString().slice(0, 10),
    to: new Date(end + WINDOW_DAYS * day).toISOString().slice(0, 10),
  };
}

/**
 * Payouts with their accounting date; with `month` (YYYY-MM), only those whose
 * accounting date falls in it. Newest first.
 */
export async function loadPayoutsByAccountingDate<T extends PayoutDates>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  opts: { month?: string | null; payoutId?: string | null; limit?: number }
): Promise<Array<T & { bank_date: string | null; accounting_date: string | null }>> {
  let query = admin.from('stripe_payouts').select('*').order('arrival_date', { ascending: false });
  const month = opts.month && /^\d{4}-\d{2}$/.test(opts.month) ? opts.month : null;
  if (opts.payoutId) query = query.eq('id', opts.payoutId);
  else if (month) {
    const { from, to } = monthQueryWindow(month);
    query = query.gte('arrival_date', from).lt('arrival_date', to);
  } else query = query.limit(opts.limit ?? 200);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const payouts = (data ?? []) as T[];

  const bankDates = new Map<string, string>();
  const ids = payouts.map((p) => p.id);
  for (let i = 0; i < ids.length; i += 200) {
    const { data: entries } = await admin
      .from('bank_statement_entries')
      .select('matched_payout_id, tx_date')
      .in('matched_payout_id', ids.slice(i, i + 200));
    for (const e of entries ?? []) {
      if (e.matched_payout_id && e.tx_date) bankDates.set(e.matched_payout_id, String(e.tx_date).slice(0, 10));
    }
  }

  const withDates = payouts.map((p) => {
    const bank_date = bankDates.get(p.id) ?? null;
    return { ...p, bank_date, accounting_date: payoutAccountingDate(p, bank_date) };
  });
  const filtered = month && !opts.payoutId ? withDates.filter((p) => isInMonth(p.accounting_date, month)) : withDates;
  return filtered.sort((a, b) => String(b.accounting_date ?? '').localeCompare(String(a.accounting_date ?? '')));
}
