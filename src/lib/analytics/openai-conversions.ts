/**
 * OpenAI Ads (ChatGPT Ads) — Conversions API, server-side.
 *
 * Trimitem `order_created` din webhook-ul Stripe după ce comanda e marcată
 * plătită. Dedup cu pixelul din browser: același `id` (order_number) pe ambele
 * canale; OpenAI păstrează primul eveniment și ignoră duplicatele.
 *
 * Trimitem DOAR pentru comenzile care au venit din ChatGPT (au `oppref` sau
 * `utm_source=chatgpt` în atribuire) — nu expediem hash-urile tuturor
 * clienților către OpenAI fără motiv (GDPR: minimizarea datelor).
 *
 * Config: NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID (public, e și în snippet) +
 * OPENAI_ADS_API_KEY (secret, „Conversion keys" din Ads Manager). Lipsa
 * oricăreia = no-op tăcut; nu are voie să rupă webhook-ul.
 *
 * Docs: https://developers.openai.com/ads/conversions-api
 */

import { createHash } from 'crypto';

const ENDPOINT = 'https://bzr.openai.com/v1/events';
const TIMEOUT_MS = 5000;

interface TouchLike {
  utm_source?: string;
  oppref?: string;
  landing?: string;
}

interface AttributionLike {
  first?: TouchLike;
  last?: TouchLike;
}

export interface OpenAiPurchaseInput {
  orderNumber: string;
  /** Total plătit, în RON (unitate majoră). */
  totalRon: number;
  serviceSlug?: string | null;
  serviceName?: string | null;
  email?: string | null;
  phone?: string | null;
  attribution?: AttributionLike | null;
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Normalizare conform docs: trim + lowercase. */
function hashEmail(email: string): string | null {
  const v = email.trim().toLowerCase();
  return v.includes('@') ? sha256(v) : null;
}

/** Normalizare conform docs: doar cifre, fără `+`, fără zerouri inițiale; 8–15 cifre. */
function hashPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, '').replace(/^0+/, '');
  // 07xx… (România) fără prefix → 407xx…
  if (digits.length === 9 && digits.startsWith('7')) digits = `40${digits}`;
  if (digits.length < 8 || digits.length > 15) return null;
  return sha256(digits);
}

/** `oppref` din atribuire — ultimul touch câștigă, apoi primul. */
export function pickOppref(attribution?: AttributionLike | null): string | undefined {
  return attribution?.last?.oppref || attribution?.first?.oppref || undefined;
}

/** Comanda a venit din ChatGPT? (click id sau UTM-ul nostru). */
export function cameFromChatGpt(attribution?: AttributionLike | null): boolean {
  if (!attribution) return false;
  const touches = [attribution.last, attribution.first];
  return touches.some((t) => Boolean(t?.oppref) || t?.utm_source === 'chatgpt');
}

/**
 * Trimite `order_created`. Niciodată nu aruncă; întoarce true doar când
 * OpenAI a acceptat request-ul.
 */
export async function sendOpenAiPurchaseEvent(input: OpenAiPurchaseInput): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID;
  const apiKey = process.env.OPENAI_ADS_API_KEY;
  if (!pixelId || !apiKey) return false;
  if (!cameFromChatGpt(input.attribution)) return false;

  const emails = input.email ? [hashEmail(input.email)].filter(Boolean) : [];
  const phones = input.phone ? [hashPhone(input.phone)].filter(Boolean) : [];
  const amountMinor = Math.round(Number(input.totalRon) * 100);
  const oppref = pickOppref(input.attribution);

  const event = {
    id: input.orderNumber,
    type: 'order_created',
    timestamp_ms: Date.now(),
    action_source: 'web',
    source_url: 'https://eghiseul.ro/comanda/success/',
    ...(oppref ? { oppref } : {}),
    user: {
      ...(emails.length ? { emails_sha256: emails } : {}),
      ...(phones.length ? { phone_numbers_sha256: phones } : {}),
      countries: ['RO'],
    },
    data: {
      type: 'contents',
      amount: amountMinor,
      currency: 'RON',
      contents: [
        {
          id: input.serviceSlug || 'serviciu',
          name: input.serviceName || 'Serviciu eGhișeul',
          quantity: 1,
          amount: amountMinor,
          currency: 'RON',
        },
      ],
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}?pid=${encodeURIComponent(pixelId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ validate_only: false, integration_source: 'eghiseul-stripe-webhook', events: [event] }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[openai-conversions] ${res.status} for order ${input.orderNumber}: ${text.slice(0, 300)}`);
      return false;
    }
    console.log(`[openai-conversions] order_created sent for ${input.orderNumber}${oppref ? ' (oppref)' : ' (utm only)'}`);
    return true;
  } catch (e) {
    console.error(`[openai-conversions] failed for order ${input.orderNumber}:`, e instanceof Error ? e.message : e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
