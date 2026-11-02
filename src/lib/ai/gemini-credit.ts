/**
 * Estimated Gemini (AI Studio prepaid) credit — eghiseul + CJO.
 *
 * Google gives no API for the prepaid balance. We estimate it:
 *   remaining = Σ top-ups (admin_settings.gemini_credit) − Σ est_cost_usd of
 *               every call logged since the first top-up, on BOTH databases
 *               (eghiseul `ai_usage_log` + CJO `ai_usage_log`, same key).
 * The estimate is only as good as the top-ups typed in admin and the price
 * table in `usage-log.ts`; the AI Studio billing page stays the truth.
 */

import { createCjoClient } from '@/lib/supabase/cjo';

export const CREDIT_SETTING_KEY = 'gemini_credit';
export const CREDIT_ALERT_STATE_KEY = 'gemini_credit_alert';
export const DEFAULT_ALERT_BELOW_USD = 5;
export const ALERT_DAYS_LEFT = 7;

export interface GeminiTopup {
  date: string; // YYYY-MM-DD
  amount_usd: number;
  note?: string;
}

export interface GeminiCreditSettings {
  topups: GeminiTopup[];
  alert_below_usd: number;
}

export interface UsageLogRow {
  created_at: string;
  platform: string;
  feature: string;
  est_cost_usd: number | string | null;
  ok: boolean;
  http_status: number | null;
  error_code: string | null;
}

export interface UsageBucket {
  calls: number;
  errors: number;
  cost: number;
}

export interface UsageWindow {
  total: UsageBucket;
  byPlatform: Record<string, UsageBucket>;
  byFeature: Record<string, UsageBucket>;
}

export interface GeminiCreditSummary {
  settings: GeminiCreditSettings;
  topupsTotal: number;
  firstTopupDate: string | null;
  spentSinceFirstTopup: number;
  remaining: number | null;
  burnPerDay7d: number;
  daysLeft: number | null;
  lastCall: { at: string; ok: boolean; platform: string; feature: string; http_status: number | null; error_code: string | null } | null;
  lastError: { at: string; platform: string; feature: string; http_status: number | null; error_code: string | null } | null;
  windows: { today: UsageWindow; d7: UsageWindow; d30: UsageWindow };
  sources: { platform: string; ok: boolean; note?: string }[];
  lowCredit: boolean;
}

export function normalizeCreditSettings(value: unknown): GeminiCreditSettings {
  const v = (value ?? {}) as { topups?: unknown; alert_below_usd?: unknown };
  const topups = Array.isArray(v.topups)
    ? (v.topups as unknown[])
        .map((t) => t as { date?: unknown; amount_usd?: unknown; note?: unknown })
        .filter((t) => typeof t.date === 'string' && Number.isFinite(Number(t.amount_usd)) && Number(t.amount_usd) > 0)
        .map((t) => ({
          date: String(t.date).slice(0, 10),
          amount_usd: Number(t.amount_usd),
          ...(typeof t.note === 'string' && t.note ? { note: t.note.slice(0, 200) } : {}),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const threshold = Number(v.alert_below_usd);
  return {
    topups,
    alert_below_usd: Number.isFinite(threshold) && threshold >= 0 ? threshold : DEFAULT_ALERT_BELOW_USD,
  };
}

function emptyBucket(): UsageBucket {
  return { calls: 0, errors: 0, cost: 0 };
}
function emptyWindow(): UsageWindow {
  return { total: emptyBucket(), byPlatform: {}, byFeature: {} };
}
function add(bucket: UsageBucket, row: UsageLogRow, cost: number) {
  bucket.calls += 1;
  if (!row.ok) bucket.errors += 1;
  bucket.cost += cost;
}
function addToWindow(w: UsageWindow, row: UsageLogRow, cost: number) {
  add(w.total, row, cost);
  add((w.byPlatform[row.platform] ??= emptyBucket()), row, cost);
  add((w.byFeature[row.feature] ??= emptyBucket()), row, cost);
}

/** Midnight in Europe/Bucharest for `now`, as a UTC epoch. */
export function bucharestMidnight(now: Date): number {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  // Offset of Bucharest at that moment (+2 or +3).
  const hourThere = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', hour: '2-digit', hourCycle: 'h23' }).format(now)
  );
  const offsetH = (hourThere - now.getUTCHours() + 24) % 24;
  return Date.parse(`${ymd}T00:00:00Z`) - offsetH * 3600_000;
}

/** Pure: everything the admin card shows, from settings + rows of both DBs. */
export function summarizeCredit(
  settingsValue: unknown,
  rows: UsageLogRow[],
  now: Date = new Date(),
  sources: GeminiCreditSummary['sources'] = []
): GeminiCreditSummary {
  const settings = normalizeCreditSettings(settingsValue);
  const topupsTotal = settings.topups.reduce((s, t) => s + t.amount_usd, 0);
  const firstTopupDate = settings.topups[0]?.date ?? null;
  // A top-up dated D counts calls from D 00:00 (Bucharest ≈ UTC; a few hours
  // of slack do not matter at these amounts).
  const firstTopupMs = firstTopupDate ? Date.parse(`${firstTopupDate}T00:00:00Z`) - 3 * 3600_000 : null;

  const nowMs = now.getTime();
  const todayStart = bucharestMidnight(now);
  const d7 = nowMs - 7 * 86400_000;
  const d30 = nowMs - 30 * 86400_000;

  const windows = { today: emptyWindow(), d7: emptyWindow(), d30: emptyWindow() };
  let spent = 0;
  let lastCall: GeminiCreditSummary['lastCall'] = null;
  let lastError: GeminiCreditSummary['lastError'] = null;
  let lastCallMs = -Infinity;
  let lastErrorMs = -Infinity;

  for (const row of rows) {
    const t = Date.parse(row.created_at);
    if (!Number.isFinite(t)) continue;
    const cost = Number(row.est_cost_usd) || 0;
    if (firstTopupMs != null && t >= firstTopupMs) spent += cost;
    if (t >= d30) addToWindow(windows.d30, row, cost);
    if (t >= d7) addToWindow(windows.d7, row, cost);
    if (t >= todayStart) addToWindow(windows.today, row, cost);
    if (t > lastCallMs) {
      lastCallMs = t;
      lastCall = { at: row.created_at, ok: row.ok, platform: row.platform, feature: row.feature, http_status: row.http_status, error_code: row.error_code };
    }
    if (!row.ok && t > lastErrorMs) {
      lastErrorMs = t;
      lastError = { at: row.created_at, platform: row.platform, feature: row.feature, http_status: row.http_status, error_code: row.error_code };
    }
  }

  const remaining = firstTopupDate ? Math.round((topupsTotal - spent) * 1e4) / 1e4 : null;
  const burnPerDay7d = windows.d7.total.cost / 7;
  const daysLeft =
    remaining == null ? null : burnPerDay7d > 0 ? Math.max(0, remaining / burnPerDay7d) : remaining > 0 ? Infinity : 0;
  const lowCredit =
    remaining != null && (remaining < settings.alert_below_usd || (daysLeft != null && daysLeft < ALERT_DAYS_LEFT));

  return {
    settings,
    topupsTotal,
    firstTopupDate,
    spentSinceFirstTopup: Math.round(spent * 1e6) / 1e6,
    remaining,
    burnPerDay7d,
    daysLeft,
    lastCall,
    lastError,
    windows,
    sources,
    lowCredit,
  };
}

const PAGE = 1000;
const MAX_ROWS = 200_000;
const COLUMNS = 'created_at, platform, feature, est_cost_usd, ok, http_status, error_code';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRows(client: any, sinceIso: string): Promise<UsageLogRow[]> {
  const out: UsageLogRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    // A fresh builder per page (postgrest-js mutates a reused builder).
    const { data, error } = await client
      .from('ai_usage_log')
      .select(COLUMNS)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as UsageLogRow[]));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

/** Reads settings + both DBs and summarizes. CJO failures degrade to a note. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadGeminiCreditSummary(supabase: any, now: Date = new Date()): Promise<GeminiCreditSummary> {
  const { data: setting } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', CREDIT_SETTING_KEY)
    .maybeSingle();
  const settings = normalizeCreditSettings(setting?.value);
  const d30 = now.getTime() - 30 * 86400_000;
  const firstTopupMs = settings.topups[0] ? Date.parse(`${settings.topups[0].date}T00:00:00Z`) - 3 * 3600_000 : d30;
  const sinceIso = new Date(Math.min(d30, firstTopupMs)).toISOString();

  const sources: GeminiCreditSummary['sources'] = [];
  let rows: UsageLogRow[] = [];
  try {
    rows = rows.concat(await fetchRows(supabase, sinceIso));
    sources.push({ platform: 'eghiseul', ok: true });
  } catch (err) {
    sources.push({ platform: 'eghiseul', ok: false, note: err instanceof Error ? err.message : String(err) });
  }
  const cjo = createCjoClient();
  if (!cjo) {
    sources.push({ platform: 'cjo', ok: false, note: 'CJO_SUPABASE_URL / CJO_SUPABASE_SERVICE_KEY lipsesc' });
  } else {
    try {
      rows = rows.concat(await fetchRows(cjo, sinceIso));
      sources.push({ platform: 'cjo', ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sources.push({
        platform: 'cjo',
        ok: false,
        note: /ai_usage_log|does not exist|schema cache|PGRST205/i.test(msg)
          ? 'Tabela ai_usage_log nu există încă pe CJO — se adună doar consumul eghiseul.'
          : msg,
      });
    }
  }
  return summarizeCredit(settings, rows, now, sources);
}

export function formatUsd(n: number | null | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `$${n.toFixed(digits)}`;
}

/**
 * Email once when the estimate drops under the threshold or under 7 days of
 * burn. State in admin_settings[gemini_credit_alert] = { sent_at,
 * topups_total }: a new top-up (different total) re-arms it; recovering above
 * the thresholds clears it. No top-ups recorded → no estimate → no alert.
 * Never throws.
 */
export async function checkGeminiCreditAndAlert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  send: (input: { to: string; subject: string; html: string; text: string }) => Promise<unknown>,
  now: Date = new Date()
): Promise<{ alerted: boolean; remaining: number | null; daysLeft: number | null }> {
  try {
    const summary = await loadGeminiCreditSummary(supabase, now);
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', CREDIT_ALERT_STATE_KEY)
      .maybeSingle();
    const state = (data?.value ?? {}) as { sent_at?: string | null; topups_total?: number };
    const save = (value: Record<string, unknown>) =>
      supabase
        .from('admin_settings')
        .upsert({ key: CREDIT_ALERT_STATE_KEY, value, updated_at: now.toISOString() });

    if (summary.remaining == null) return { alerted: false, remaining: null, daysLeft: null };

    if (!summary.lowCredit) {
      if (state.sent_at) await save({ sent_at: null, cleared_at: now.toISOString() });
      return { alerted: false, remaining: summary.remaining, daysLeft: summary.daysLeft };
    }

    const alreadySent = !!state.sent_at && state.topups_total === summary.topupsTotal;
    if (alreadySent) return { alerted: false, remaining: summary.remaining, daysLeft: summary.daysLeft };

    const days =
      summary.daysLeft == null || !Number.isFinite(summary.daysLeft) ? '—' : `${summary.daysLeft.toFixed(1)} zile`;
    const remaining = formatUsd(summary.remaining);
    const burn = formatUsd(summary.burnPerDay7d, 3);
    const to = process.env.ADMIN_NOTIFY_EMAIL || 'contact@eghiseul.ro';
    await send({
      to,
      subject: `⚠️ Credit Gemini (OCR) aproape epuizat: ~${remaining} rămași`,
      text:
        `Estimare credit Google AI Studio (cheia comună eghiseul, documentero, CJO, ecazier): ~${remaining} rămași, ` +
        `consum mediu ${burn}/zi în ultimele 7 zile → ajunge pentru ~${days}.\n\n` +
        'Încarcă credit în https://ai.studio/projects, apoi trece suma în admin → Credit Gemini („Adaugă alimentare”).\n' +
        'Când creditul se termină, citirea automată a actelor se oprește pe toate cele 4 site-uri.',
      html:
        `<p>Estimare credit Google AI Studio (cheia comună eghiseul, documentero, CJO, ecazier): <strong>~${remaining} rămași</strong>, ` +
        `consum mediu ${burn}/zi în ultimele 7 zile → ajunge pentru <strong>~${days}</strong>.</p>` +
        '<p>Încarcă credit în <a href="https://ai.studio/projects">AI Studio</a>, apoi trece suma în admin → <a href="https://eghiseul.ro/admin/credit-gemini">Credit Gemini</a> („Adaugă alimentare”).</p>' +
        '<p>Când creditul se termină, citirea automată a actelor se oprește pe toate cele 4 site-uri.</p>',
    });
    await save({ sent_at: now.toISOString(), topups_total: summary.topupsTotal, remaining: summary.remaining });
    return { alerted: true, remaining: summary.remaining, daysLeft: summary.daysLeft };
  } catch (err) {
    console.error('[gemini-credit] alert check failed:', err);
    return { alerted: false, remaining: null, daysLeft: null };
  }
}
