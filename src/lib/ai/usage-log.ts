/**
 * Gemini usage logging → `ai_usage_log` (migration 199).
 *
 * Why: the AI Studio prepaid credit ran out on 23.10.2026 and nobody noticed
 * for 10 days. Google exposes no API for the prepaid balance, so we estimate
 * it ourselves: every call logs its tokens (from `usageMetadata`) and an
 * estimated USD cost; the admin page subtracts the sum from the recorded
 * top-ups (`admin_settings.gemini_credit`). CJO logs into an identical table
 * in its own DB, with the same key.
 *
 * Logging is fire-and-forget: it never throws and is never awaited on the OCR
 * critical path.
 */

/**
 * USD per 1M tokens, paid tier, Standard.
 * Source: https://ai.google.dev/gemini-api/docs/pricing (checked 02.11.2026)
 *   gemini-2.5-flash       input (text/image/video) $0.30 · output (incl. thinking) $2.50
 *   gemini-2.5-flash-lite  input (text/image/video) $0.10 · output (incl. thinking) $0.40
 * Unknown models fall back to the gemini-2.5-flash price (the dearer one), so
 * the estimate errs on the side of „credit runs out sooner".
 */
export const GEMINI_PRICES_USD_PER_1M: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.5-flash-lite': { input: 0.1, output: 0.4 },
};
const FALLBACK_PRICE = GEMINI_PRICES_USD_PER_1M['gemini-2.5-flash'];

/** Platform tag for rows written by this deploy (eghiseul + documentero share it). */
export const AI_USAGE_PLATFORM = 'eghiseul';

export function estimateGeminiCostUsd(
  model: string | null | undefined,
  promptTokens: number | null | undefined,
  outputTokens: number | null | undefined
): number {
  const price = (model && GEMINI_PRICES_USD_PER_1M[model]) || FALLBACK_PRICE;
  const cost = ((promptTokens || 0) * price.input + (outputTokens || 0) * price.output) / 1_000_000;
  return Math.round(cost * 1e6) / 1e6;
}

/** Shape of Gemini `usageMetadata` (REST and SDK). `thoughtsTokenCount` is
 *  billed as output but the 0.24 SDK typings don't list it. */
export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  totalTokenCount?: number;
}

export interface AiUsageRow {
  platform: string;
  feature: string;
  model: string | null;
  prompt_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  est_cost_usd: number | null;
  ok: boolean;
  http_status: number | null;
  error_code: string | null;
}

export function buildUsageRow(input: {
  feature: string;
  model: string;
  usage?: GeminiUsageMetadata | null;
  ok: boolean;
  httpStatus?: number | null;
  errorCode?: string | null;
}): AiUsageRow {
  const u = input.usage ?? null;
  const prompt = u?.promptTokenCount ?? null;
  const output =
    u && (u.candidatesTokenCount != null || u.thoughtsTokenCount != null)
      ? (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0)
      : null;
  const total = u?.totalTokenCount ?? (prompt != null || output != null ? (prompt ?? 0) + (output ?? 0) : null);
  return {
    platform: AI_USAGE_PLATFORM,
    feature: input.feature.slice(0, 60),
    model: input.model,
    prompt_tokens: prompt,
    output_tokens: output,
    total_tokens: total,
    // A refused call (402/429) is not billed; a call without metadata is unknown.
    est_cost_usd: u ? estimateGeminiCostUsd(input.model, prompt, output) : input.ok ? null : 0,
    ok: input.ok,
    http_status: input.httpStatus ?? null,
    error_code: input.errorCode ? String(input.errorCode).slice(0, 80) : null,
  };
}

/**
 * Insert one usage row. Never throws, never needs awaiting: callers fire it
 * and move on, so the OCR response is never delayed.
 */
export function logAiUsage(row: AiUsageRow): Promise<void> {
  const task = async () => {
    try {
      // Lazy import keeps the service-role client out of any client bundle
      // that imports types from the OCR service.
      const { createAdminClient } = await import('@/lib/supabase/admin');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;
      const { error } = await admin.from('ai_usage_log').insert(row);
      if (error) console.error('[ai-usage] insert failed:', error.message);
    } catch (err) {
      console.error('[ai-usage] log failed:', err instanceof Error ? err.message : err);
    }
  };
  const promise = task();
  // On Vercel, keep the function alive until the insert finishes without
  // making the caller wait (same hook `@vercel/functions` waitUntil uses).
  // `next/server` `after()` is not usable here: this module is reachable
  // from a client component (admin order page imports document-ocr helpers).
  try {
    const ctx = (globalThis as Record<symbol, { get?: () => { waitUntil?: (p: Promise<unknown>) => void } } | undefined>)[
      Symbol.for('@vercel/request-context')
    ]?.get?.();
    ctx?.waitUntil?.(promise);
  } catch {
    // not on Vercel / outside a request — the promise still runs
  }
  return promise;
}

/** HTTP status + short code from an SDK / fetch error. */
export function describeGeminiError(error: unknown): { status: number | null; code: string } {
  const e = error as { status?: unknown; message?: unknown; name?: unknown } | null;
  let status = typeof e?.status === 'number' ? e.status : null;
  const message = typeof e?.message === 'string' ? e.message : String(error ?? '');
  if (status == null) {
    const m = message.match(/\[(\d{3})\b/) || message.match(/\b(4\d\d|5\d\d)\b/);
    if (m) status = Number(m[1]);
  }
  let code = status != null ? String(status) : typeof e?.name === 'string' ? e.name : 'error';
  if (/credits are depleted|prepayment/i.test(message)) code = `${code}:credit_depleted`;
  else if (/RESOURCE_EXHAUSTED|quota/i.test(message)) code = `${code}:quota`;
  else if (/timeout|aborted/i.test(message)) code = 'timeout';
  return { status, code };
}

interface GenerateContentCapable<TReq, TRes> {
  generateContent(request: TReq): Promise<TRes>;
}

/**
 * Wrap an SDK `GenerativeModel` so every `generateContent` logs one row.
 * Returns the SDK result/error unchanged.
 */
export function trackGeminiModel<TReq, TRes extends { response: { usageMetadata?: unknown } }>(
  model: GenerateContentCapable<TReq, TRes>,
  modelName: string,
  feature: string
): GenerateContentCapable<TReq, TRes> {
  return {
    async generateContent(request: TReq): Promise<TRes> {
      try {
        const result = await model.generateContent(request);
        void logAiUsage(
          buildUsageRow({
            feature,
            model: modelName,
            usage: (result.response?.usageMetadata ?? null) as GeminiUsageMetadata | null,
            ok: true,
            httpStatus: 200,
          })
        );
        return result;
      } catch (error) {
        const { status, code } = describeGeminiError(error);
        void logAiUsage(buildUsageRow({ feature, model: modelName, ok: false, httpStatus: status, errorCode: code }));
        throw error;
      }
    },
  };
}
