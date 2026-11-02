/**
 * Gemini (Google AI) availability — the OCR behind „Extrage date" and the ID
 * scan in the wizard.
 *
 * Incident 23.10–02.11.2026: the AI Studio prepaid credit ran out. Every call
 * answered 402 „Your prepayment credits are depleted", the OCR returned an
 * empty result, and the admin showed blank fields plus „CNP-ul nu trece cifra
 * de control" — so the team chased a CNP bug for days. One key
 * (`GOOGLE_AI_API_KEY`) serves eghiseul, documentero, CJO and ecazier, so a
 * single probe here covers all four sites.
 */

import { buildUsageRow, logAiUsage, type GeminiUsageMetadata } from '@/lib/ai/usage-log';

/** Message shown instead of the generic OCR error when the provider is down.
 *  Neutral wording: the wizard shows it to customers too. */
export const OCR_UNAVAILABLE_MESSAGE =
  'Citirea automată a actelor nu funcționează momentan. Completează datele manual.';

/** True for errors that mean „the provider refuses every call" (billing,
 *  quota, revoked key) rather than „this image was unreadable". */
export function isGeminiUnavailableError(error: unknown): boolean {
  const text = error instanceof Error ? `${error.message}` : String(error ?? '');
  return /\b(402|403|429)\b|prepayment credits|credits are depleted|quota|RESOURCE_EXHAUSTED|API key (not valid|expired)|PERMISSION_DENIED/i.test(
    text
  );
}

export interface GeminiProbeResult {
  ok: boolean;
  status: number | null;
  message: string;
}

/** One tiny generateContent call on the OCR model. */
export async function probeGemini(model = 'gemini-2.5-flash-lite'): Promise<GeminiProbeResult> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return { ok: false, status: null, message: 'GOOGLE_AI_API_KEY lipsește' };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply OK' }] }] }),
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (res.ok) {
      const body = (await res.json().catch(() => null)) as { usageMetadata?: GeminiUsageMetadata } | null;
      await logAiUsage(buildUsageRow({ feature: 'health_probe', model, usage: body?.usageMetadata, ok: true, httpStatus: res.status }));
      return { ok: true, status: res.status, message: 'OK' };
    }
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    const message = body?.error?.message?.slice(0, 300) || res.statusText;
    await logAiUsage(
      buildUsageRow({
        feature: 'health_probe',
        model,
        ok: false,
        httpStatus: res.status,
        errorCode: /credits are depleted|prepayment/i.test(message) ? `${res.status}:credit_depleted` : String(res.status),
      })
    );
    return { ok: false, status: res.status, message };
  } catch (err) {
    await logAiUsage(buildUsageRow({ feature: 'health_probe', model, ok: false, httpStatus: null, errorCode: 'network' }));
    return { ok: false, status: null, message: err instanceof Error ? err.message : String(err) };
  }
}

/** Re-alert at most once per day while the outage lasts. */
const ALERT_EVERY_MS = 24 * 60 * 60 * 1000;
const ALERT_SETTING_KEY = 'gemini_ocr_alert';

/**
 * Probe Gemini and email the admin when it refuses calls. Throttled through
 * `admin_settings[gemini_ocr_alert]` ({ sent_at, recovered_at }), so an
 * hourly cron sends one email per day of outage plus one „a revenit".
 * Never throws — it piggybacks on another cron.
 */
export async function checkGeminiAndAlert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  send: (input: { to: string; subject: string; html: string; text: string }) => Promise<unknown>
): Promise<GeminiProbeResult & { alerted: boolean }> {
  const probe = await probeGemini();
  try {
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', ALERT_SETTING_KEY)
      .maybeSingle();
    const state = (data?.value ?? {}) as { sent_at?: string | null };
    const lastSent = state.sent_at ? new Date(state.sent_at).getTime() : 0;
    const to = process.env.ADMIN_NOTIFY_EMAIL || 'contact@eghiseul.ro';
    const save = (value: Record<string, unknown>) =>
      supabase
        .from('admin_settings')
        .upsert({ key: ALERT_SETTING_KEY, value, updated_at: new Date().toISOString() });

    if (!probe.ok && Date.now() - lastSent > ALERT_EVERY_MS) {
      const detail = `${probe.status ?? 'fără răspuns'} — ${probe.message}`;
      await send({
        to,
        subject: '⚠️ Citirea actelor (Gemini) nu funcționează — eghiseul, documentero, CJO, ecazier',
        text:
          `Google AI (Gemini) refuză cererile: ${detail}\n\n` +
          'Efect: „Extrage date” din admin și scanarea actului din wizard nu mai completează nimic, pe toate cele 4 site-uri.\n' +
          'Dacă mesajul spune „credits are depleted”: încarcă credit în https://ai.studio/projects (proiectul cheii GOOGLE_AI_API_KEY).\n' +
          'Alerta se repetă o dată pe zi cât timp durează.',
        html:
          `<p>Google AI (Gemini) refuză cererile: <strong>${detail.replace(/</g, '&lt;')}</strong></p>` +
          '<p>Efect: „Extrage date” din admin și scanarea actului din wizard nu mai completează nimic, pe toate cele 4 site-uri.</p>' +
          '<p>Dacă mesajul spune „credits are depleted”: încarcă credit în <a href="https://ai.studio/projects">AI Studio</a> (proiectul cheii <code>GOOGLE_AI_API_KEY</code>).</p>' +
          '<p>Alerta se repetă o dată pe zi cât timp durează.</p>',
      });
      await save({ sent_at: new Date().toISOString(), status: probe.status, message: probe.message });
      return { ...probe, alerted: true };
    }

    if (probe.ok && state.sent_at) {
      await send({
        to,
        subject: '✅ Citirea actelor (Gemini) funcționează din nou',
        text: 'Google AI răspunde din nou. Echipa poate apăsa din nou „Extrage date” pe comenzile din perioada căderii.',
        html: '<p>Google AI răspunde din nou. Echipa poate apăsa din nou „Extrage date” pe comenzile din perioada căderii.</p>',
      });
      await save({ sent_at: null, recovered_at: new Date().toISOString() });
      return { ...probe, alerted: true };
    }
  } catch (err) {
    console.error('[gemini-health] alert bookkeeping failed:', err);
  }
  return { ...probe, alerted: false };
}
