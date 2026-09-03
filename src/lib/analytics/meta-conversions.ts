/**
 * Meta (Facebook/Instagram Ads) — Conversions API, server-side.
 *
 * Trimitem `Purchase` din webhook-ul Stripe după ce comanda e marcată plătită.
 * Dedup cu pixelul din browser: același `event_id` (order_number) pe ambele
 * canale; Meta păstrează primul, ignoră duplicatul.
 *
 * Trimitem DOAR pentru comenzile venite din Meta (fbclid în atribuire sau
 * utm_source=meta/facebook/instagram) — minimizarea datelor (GDPR). Hash-urile
 * de email/telefon urmează regulile Meta (SHA-256, lowercase/trim, telefon în
 * format internațional fără `+`).
 *
 * Config: NEXT_PUBLIC_META_PIXEL_ID (public) + META_CAPI_ACCESS_TOKEN (secret,
 * Events Manager → Settings → Conversions API → Generate access token).
 * Lipsa oricăreia = no-op tăcut.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto';

const GRAPH_VERSION = 'v21.0';
const TIMEOUT_MS = 5000;

interface TouchLike {
  utm_source?: string;
  click_id?: string;
  click_platform?: string;
  at?: string;
}

interface AttributionLike {
  first?: TouchLike;
  last?: TouchLike;
}

export interface MetaPurchaseInput {
  orderNumber: string;
  /** Total plătit, RON. */
  totalRon: number;
  serviceSlug?: string | null;
  serviceName?: string | null;
  email?: string | null;
  phone?: string | null;
  attribution?: AttributionLike | null;
}

function sha256(v: string): string {
  return createHash('sha256').update(v, 'utf8').digest('hex');
}

function hashEmail(email: string): string | null {
  const v = email.trim().toLowerCase();
  return v.includes('@') ? sha256(v) : null;
}

function hashPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, '').replace(/^0+/, '');
  if (digits.length === 9 && digits.startsWith('7')) digits = `40${digits}`;
  if (digits.length < 8 || digits.length > 15) return null;
  return sha256(digits);
}

const META_SOURCES = new Set(['meta', 'facebook', 'instagram', 'fb', 'ig']);

function metaTouch(attribution?: AttributionLike | null): TouchLike | undefined {
  if (!attribution) return undefined;
  for (const t of [attribution.last, attribution.first]) {
    if (!t) continue;
    if (t.click_platform === 'meta' && t.click_id) return t;
    if (t.utm_source && META_SOURCES.has(t.utm_source.toLowerCase())) return t;
  }
  return undefined;
}

export function cameFromMeta(attribution?: AttributionLike | null): boolean {
  return Boolean(metaTouch(attribution));
}

/**
 * `fbc` reconstruit din fbclid conform formatului Meta:
 * fb.1.<timestamp ms al clicului>.<fbclid>
 */
function buildFbc(touch: TouchLike | undefined): string | undefined {
  if (!touch?.click_id || touch.click_platform !== 'meta') return undefined;
  const ts = touch.at ? new Date(touch.at).getTime() : Date.now();
  return `fb.1.${Number.isFinite(ts) ? ts : Date.now()}.${touch.click_id}`;
}

/** Niciodată nu aruncă; true doar când Meta a acceptat request-ul. */
export async function sendMetaPurchaseEvent(input: MetaPurchaseInput): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return false;
  const touch = metaTouch(input.attribution);
  if (!touch) return false;

  const em = input.email ? [hashEmail(input.email)].filter(Boolean) : [];
  const ph = input.phone ? [hashPhone(input.phone)].filter(Boolean) : [];
  const fbc = buildFbc(touch);

  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.orderNumber,
    action_source: 'website',
    event_source_url: 'https://eghiseul.ro/comanda/success/',
    user_data: {
      ...(em.length ? { em } : {}),
      ...(ph.length ? { ph } : {}),
      ...(fbc ? { fbc } : {}),
      country: [sha256('ro')],
    },
    custom_data: {
      currency: 'RON',
      value: Number(input.totalRon.toFixed(2)),
      content_type: 'product',
      content_ids: [input.serviceSlug || 'serviciu'],
      content_name: input.serviceName || 'Serviciu eGhișeul',
      num_items: 1,
      order_id: input.orderNumber,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [event] }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[meta-conversions] ${res.status} for order ${input.orderNumber}: ${text.slice(0, 300)}`);
      return false;
    }
    console.log(`[meta-conversions] Purchase sent for ${input.orderNumber}${fbc ? ' (fbclid)' : ' (utm only)'}`);
    return true;
  } catch (e) {
    console.error(`[meta-conversions] failed for order ${input.orderNumber}:`, e instanceof Error ? e.message : e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
