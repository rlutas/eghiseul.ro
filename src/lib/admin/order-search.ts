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

/**
 * Lowercase, no Romanian diacritics — the same transformation the
 * `orders.search_text` column applies (migration 206), so „Lutas" finds „Luțaș".
 */
export function normalizeSearchTerm(term: string): string {
  const FROM = 'ăâîșşțţáéíóöőúüű';
  const TO = 'aaissttaeiooouuu';
  return [...term.toLowerCase()].map((ch) => {
    const at = FROM.indexOf(ch);
    return at === -1 ? ch : TO[at];
  }).join('');
}

/**
 * 'column' — `orders.search_text` exists (migration 206): one short generated
 *            text per order, every word matched against it. Fast, also finds
 *            CNP / CUI and ignores diacritics.
 * 'json'   — the column is not there (yet): match the JSON paths directly.
 */
export type OrderSearchMode = 'column' | 'json';

let cachedMode: { mode: OrderSearchMode; at: number } | null = null;
const JSON_MODE_RECHECK_MS = 60_000;

/**
 * Which matcher the database supports. Probed once per server instance; a
 * missing column is re-probed every minute, so the fast path switches on by
 * itself after the migration runs — no redeploy.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function orderSearchMode(adminClient: any): Promise<OrderSearchMode> {
  if (cachedMode && (cachedMode.mode === 'column' || Date.now() - cachedMode.at < JSON_MODE_RECHECK_MS)) {
    return cachedMode.mode;
  }
  const { error } = await adminClient.from('orders').select('search_text').limit(1);
  cachedMode = { mode: error ? 'json' : 'column', at: Date.now() };
  return cachedMode.mode;
}

/** Test hook. */
export function resetOrderSearchModeCache(): void {
  cachedMode = null;
}

/**
 * Every word must match. 'column': one ILIKE per word on `search_text`.
 * 'json': one `or(...)` group per word over the JSON paths (PostgREST ANDs
 * the groups).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyOrderSearch<Q = any>(query: Q, raw: string | null | undefined, mode: OrderSearchMode = 'json'): Q {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = query;
  for (const term of orderSearchTerms(raw)) {
    q =
      mode === 'column'
        ? q.ilike('search_text', `%${normalizeSearchTerm(term)}%`)
        : q.or(ORDER_SEARCH_FIELDS.map((f) => `${f}.ilike.%${term}%`).join(','));
  }
  return q as Q;
}
