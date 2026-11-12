/**
 * The admin orders search, in one place — the list and the tab counts must
 * match the same rows.
 *
 * What was wrong before (team report 12.11.2026, „searchul merge super nașpa"):
 *  - the whole phrase was matched against each field, so „Popescu Ion" found
 *    nothing: no single field holds both words;
 *  - the name was searched only in `personal`, but real-estate orders keep it
 *    in `billing` (and companies in `company` / `billing.companyName`);
 *  - the counts searched 4 fields and the list 8, so a tab could say „3" and
 *    show 0;
 *  - a comma or a parenthesis in the box broke the PostgREST filter (HTTP 400,
 *    the list silently kept the previous results).
 *
 * Now: the phrase is split into words; EVERY word must match SOME field.
 */

/**
 * Text columns / JSON paths searched, in PostgREST syntax.
 *
 * Kept to 8 JSON paths on purpose: `customer_data` is large (OCR results,
 * documents) and every path costs ~110 ms on today's table, per query — and
 * the tab counts run 22 queries. More fields (CNP, CUI) wait for a
 * pre-computed search column.
 */
export const ORDER_SEARCH_FIELDS = [
  'order_number',
  'friendly_order_id',
  'delivery_tracking_number',
  'customer_data->contact->>email',
  'customer_data->contact->>phone',
  'customer_data->personal->>firstName',
  'customer_data->personal->>lastName',
  'customer_data->billing->>firstName',
  'customer_data->billing->>lastName',
  'customer_data->billing->>companyName',
  'customer_data->company->>companyName',
] as const;

const MAX_TERMS = 5;

/**
 * Words to search for. Characters with a meaning in a PostgREST `or=(…)`
 * filter or in LIKE (`,` `(` `)` `"` `\` `%` `*` `_` is kept — it is rare in
 * what people type and common in emails) are dropped, never escaped: a
 * half-escaped filter is a 400.
 */
export function orderSearchTerms(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .replace(/[,()"'\\%*]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, MAX_TERMS);
}

/** One `or(...)` group per word; PostgREST ANDs the groups. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyOrderSearch<Q = any>(query: Q, raw: string | null | undefined): Q {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = query;
  for (const term of orderSearchTerms(raw)) {
    q = q.or(ORDER_SEARCH_FIELDS.map((f) => `${f}.ilike.%${term}%`).join(','));
  }
  return q as Q;
}
