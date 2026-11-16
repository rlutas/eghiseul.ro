/**
 * Keeps the Google Ads click when marketing consent comes late.
 *
 * gtag.js loads only after marketing consent and reads `gclid` from the URL of
 * the page it loads on. A visitor who lands from an ad, browses, and accepts
 * cookies on a later page has no `gclid` in the URL any more, so the sale is
 * never tied to the ad. Our own attribution (`eg_attribution`, first-party,
 * no consent needed) still holds the click id. Once marketing consent is
 * given, we write it into `_gcl_aw`, the cookie gtag would have set itself.
 *
 * Runs ONLY after marketing consent, and before gtag.js is injected.
 */

import type { Attribution, TouchPoint } from '@/lib/analytics/attribution';

/** Google's own click-cookie lifetime. */
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
/** Cookie-safe gclid: no separators, no whitespace. */
const GCLID_RE = /^[A-Za-z0-9_-]{10,200}$/;

function gclidTouch(touch: TouchPoint | undefined, nowMs: number): { gclid: string; at: number } | null {
  if (!touch?.click_id || touch.click_platform !== 'google') return null;
  // gbraid/wbraid live in other cookies with another format: only gclid here.
  if (touch.click_param !== 'gclid') return null;
  if (!GCLID_RE.test(touch.click_id)) return null;
  const at = new Date(touch.at).getTime();
  if (!Number.isFinite(at) || at > nowMs || nowMs - at > MAX_AGE_SECONDS * 1000) return null;
  return { gclid: touch.click_id, at };
}

/**
 * The `_gcl_aw` cookie string to set, or null when there is nothing to restore.
 * Pure: takes the stored attribution, the current cookie string and the URL
 * query, so it can be tested without a browser.
 */
export function buildGclAwCookie(
  attribution: Attribution | null,
  cookieString: string,
  search: string,
  nowMs: number = Date.now()
): string | null {
  if (!attribution) return null;
  // gtag reads the URL itself on this page, and never overwrite its own cookie.
  if (new URLSearchParams(search).has('gclid')) return null;
  if (/(^|;\s*)_gcl_aw=/.test(cookieString)) return null;

  const hit = gclidTouch(attribution.last, nowMs) ?? gclidTouch(attribution.first, nowMs);
  if (!hit) return null;

  const remaining = MAX_AGE_SECONDS - Math.floor((nowMs - hit.at) / 1000);
  return `_gcl_aw=GCL.${Math.floor(hit.at / 1000)}.${hit.gclid}; path=/; max-age=${remaining}; SameSite=Lax; Secure`;
}
