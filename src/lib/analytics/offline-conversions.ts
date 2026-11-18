/**
 * Offline click conversions for Google Ads.
 *
 * The Ads conversion tag loads only after marketing consent, so a buyer who
 * never touches the cookie banner is invisible to Google even when the sale
 * came from an ad. Our own first-party attribution still holds the click id
 * of that visit. This module picks the ad click of an order and builds the
 * file Google Ads accepts under Goals → Conversions → Uploads.
 *
 * Pure functions, no I/O.
 */

export interface AdClick {
  /** The click id value. */
  id: string;
  /** Which URL parameter carried it: gclid, gbraid, wbraid, msclkid. */
  param: string;
  platform: string;
  at: string;
  landing?: string;
}

interface TouchWithClick {
  click_id?: string | null;
  click_platform?: string | null;
  click_param?: string | null;
  at?: string | null;
  landing?: string | null;
}

export interface AttributionWithAdClick {
  first?: TouchWithClick | null;
  last?: TouchWithClick | null;
  ad_click?: Partial<AdClick> | null;
  /** Set by the success page when the Ads tag itself reported the sale. */
  ads_tag_sent_at?: string | null;
}

const PAID_CLICK_PLATFORMS = new Set(['google', 'microsoft']);
/** Same shape gtag accepts; also rejects the hand-made ids of our own test runs. */
const CLICK_ID_RE = /^[A-Za-z0-9_-]{20,200}$/;

function fromTouch(t: TouchWithClick | null | undefined): AdClick | null {
  if (!t?.click_id || !t.click_platform || !PAID_CLICK_PLATFORMS.has(t.click_platform)) return null;
  return {
    id: t.click_id,
    // Touches saved before 16.11.2026 have no click_param; Google's were gclid.
    param: t.click_param || (t.click_platform === 'microsoft' ? 'msclkid' : 'gclid'),
    platform: t.click_platform,
    at: t.at || '',
    ...(t.landing ? { landing: t.landing } : {}),
  };
}

/**
 * The paid click behind an order: the explicit `ad_click` (saved from
 * 18.11.2026), else the most recent touch that carries a paid click id.
 * Null for test ids and malformed values.
 */
export function adClickOf(a: AttributionWithAdClick | null | undefined): AdClick | null {
  if (!a) return null;
  const explicit =
    a.ad_click?.id && a.ad_click.platform && PAID_CLICK_PLATFORMS.has(a.ad_click.platform)
      ? {
          id: a.ad_click.id,
          param: a.ad_click.param || 'gclid',
          platform: a.ad_click.platform,
          at: a.ad_click.at || '',
          ...(a.ad_click.landing ? { landing: a.ad_click.landing } : {}),
        }
      : null;
  const candidates = [explicit, fromTouch(a.last), fromTouch(a.first)].filter((c): c is AdClick => !!c);
  if (candidates.length === 0) return null;
  candidates.sort((x, y) => (Date.parse(y.at) || 0) - (Date.parse(x.at) || 0));
  const click = candidates[0];
  return CLICK_ID_RE.test(click.id) ? click : null;
}

export interface OfflineOrder {
  orderNumber: string;
  paidAt: string;
  totalRon: number;
  attribution: AttributionWithAdClick | null;
}

export interface OfflineRow {
  orderNumber: string;
  clickId: string;
  clickParam: string;
  /** `yyyy-MM-dd HH:mm:ss` in Europe/Bucharest, the zone declared in the file. */
  conversionTime: string;
  value: string;
  /** True when the Ads tag already reported this sale: uploading it again would count it twice. */
  tagAlreadySent: boolean;
}

/** `yyyy-MM-dd HH:mm:ss` in Romanian local time. */
export function bucharestTime(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

/** Paid orders that came from a Google ad click, one row each. */
export function googleOfflineRows(orders: OfflineOrder[]): OfflineRow[] {
  const rows: OfflineRow[] = [];
  for (const o of orders) {
    const click = adClickOf(o.attribution);
    if (!click || click.platform !== 'google' || !o.paidAt) continue;
    rows.push({
      orderNumber: o.orderNumber,
      clickId: click.id,
      clickParam: click.param,
      conversionTime: bucharestTime(o.paidAt),
      value: Number(o.totalRon || 0).toFixed(2),
      tagAlreadySent: !!o.attribution?.ads_tag_sent_at,
    });
  }
  return rows;
}

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/**
 * The upload file for Google Ads (template "Conversions from clicks").
 * Only `gclid` rows go in: `gbraid` / `wbraid` use other columns and are
 * listed by the caller for manual handling.
 */
export function buildGoogleOfflineCsv(rows: OfflineRow[], conversionName: string): string {
  const lines = [
    'Parameters:TimeZone=Europe/Bucharest',
    'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID',
  ];
  for (const r of rows) {
    if (r.clickParam !== 'gclid') continue;
    lines.push([r.clickId, conversionName, r.conversionTime, r.value, 'RON', r.orderNumber].map(cell).join(','));
  }
  return lines.join('\n') + '\n';
}
