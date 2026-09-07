/**
 * Meta (Facebook/Instagram Ads) — Conversions API, server-side.
 *
 * Trimitem două evenimente:
 *  - `InitiateCheckout` la crearea draftului (ruta /api/orders/draft)
 *  - `Purchase` din webhook-ul Stripe după ce comanda e marcată plătită.
 * Dedup cu pixelul din browser: același `event_id` pe ambele canale
 * (`<order_number>` pentru Purchase, `ic_<order_number>` pentru
 * InitiateCheckout); Meta păstrează primul, ignoră duplicatul.
 *
 * DE CE server-side și pentru InitiateCheckout: pixelul din browser se încarcă
 * doar după consimțământul de marketing (cookie-consent.tsx), iar bannerul e
 * neblocant — în practică majoritatea vizitatorilor nu apasă „Accept toate".
 * Măsurat pe campania din 03–07.09.2026: 191 clicuri pe link → 25 vizualizări
 * de pagină raportate (13%). Fără canalul server-side, evenimentul pe care
 * optimizează campania e sub-raportat masiv și algoritmul nu are ce învăța.
 * Vezi `docs/ads/meta/08-verificare-campanie-07-09.md`.
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

export interface MetaInitiateCheckoutInput {
  /** `friendly_order_id` al draftului — cheia de dedup cu pixelul. */
  orderNumber: string;
  /** Valoarea coșului în momentul creării draftului, RON (poate fi 0). */
  totalRon: number;
  serviceSlug?: string | null;
  serviceName?: string | null;
  email?: string | null;
  phone?: string | null;
  attribution?: AttributionLike | null;
}

interface MetaEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  action_source: 'website';
  event_source_url: string;
  user_data: Record<string, unknown>;
  custom_data: Record<string, unknown>;
}

/** Datele de utilizator, hash-uite conform regulilor Meta. */
function buildUserData(
  touch: TouchLike,
  email?: string | null,
  phone?: string | null
): Record<string, unknown> {
  const em = email ? [hashEmail(email)].filter(Boolean) : [];
  const ph = phone ? [hashPhone(phone)].filter(Boolean) : [];
  const fbc = buildFbc(touch);
  return {
    ...(em.length ? { em } : {}),
    ...(ph.length ? { ph } : {}),
    ...(fbc ? { fbc } : {}),
    country: [sha256('ro')],
  };
}

/**
 * POST către Graph API. Nu aruncă niciodată — analytics-ul nu are voie să rupă
 * nici plata, nici salvarea draftului.
 */
async function postEvent(event: MetaEvent, pixelId: string, token: string, label: string): Promise<boolean> {
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
      console.error(`[meta-conversions] ${res.status} for ${label}: ${text.slice(0, 300)}`);
      return false;
    }
    console.log(`[meta-conversions] ${label} sent`);
    return true;
  } catch (e) {
    console.error(`[meta-conversions] failed for ${label}:`, e instanceof Error ? e.message : e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * `InitiateCheckout` la crearea draftului. Fire-and-forget din ruta de draft:
 * apelantul NU așteaptă rezultatul, ca salvarea să nu depindă de Meta.
 *
 * `event_id` = `ic_<friendly_order_id>`, același cu cel trimis de pixel după
 * primul POST reușit (modular-wizard-provider) — Meta ține un singur eveniment.
 */
export async function sendMetaInitiateCheckoutEvent(
  input: MetaInitiateCheckoutInput
): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return false;
  const touch = metaTouch(input.attribution);
  if (!touch) return false;

  const event: MetaEvent = {
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    event_id: `ic_${input.orderNumber}`,
    action_source: 'website',
    event_source_url: 'https://eghiseul.ro/comanda/',
    user_data: buildUserData(touch, input.email, input.phone),
    custom_data: {
      currency: 'RON',
      value: Number((input.totalRon || 0).toFixed(2)),
      content_type: 'product',
      content_ids: [input.serviceSlug || 'serviciu'],
      content_name: input.serviceName || 'Serviciu eGhișeul',
      num_items: 1,
    },
  };

  return postEvent(event, pixelId, token, `InitiateCheckout ${input.orderNumber}`);
}

/** Niciodată nu aruncă; true doar când Meta a acceptat request-ul. */
export async function sendMetaPurchaseEvent(input: MetaPurchaseInput): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return false;
  const touch = metaTouch(input.attribution);
  if (!touch) return false;

  const event: MetaEvent = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.orderNumber,
    action_source: 'website',
    event_source_url: 'https://eghiseul.ro/comanda/success/',
    user_data: buildUserData(touch, input.email, input.phone),
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

  return postEvent(event, pixelId, token, `Purchase ${input.orderNumber}`);
}
