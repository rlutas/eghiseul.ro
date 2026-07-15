/**
 * Cookie-consent state shared by the banner, the GA loader and the footer
 * "Setări cookie-uri" link. ePrivacy/GDPR: nothing non-essential loads before
 * an explicit opt-in; the choice is stored 6 months and can be reopened any
 * time via the CONSENT_OPEN_EVENT.
 */

export interface ConsentState {
  v: 1;
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of the choice — proof of when consent was given. */
  ts: string;
}

export const CONSENT_COOKIE = 'eg_cookie_consent';
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 6 months
/** window event that re-opens the banner (footer link, politica-cookies page). */
export const CONSENT_OPEN_EVENT = 'eg:open-cookie-settings';
/** window event fired after the user saves a choice (detail: ConsentState). */
export const CONSENT_CHANGED_EVENT = 'eg:cookie-consent-changed';

export function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentState;
    return parsed?.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean, marketing: boolean): ConsentState {
  const state: ConsentState = { v: 1, analytics, marketing, ts: new Date().toISOString() };
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(state))}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }));
  return state;
}

/** Expire Google Analytics cookies after a revoke (best-effort, both host and domain scope). */
export function deleteAnalyticsCookies(): void {
  const names = document.cookie.split('; ').map((c) => c.split('=')[0] ?? '');
  const domain = location.hostname.replace(/^www\./, '');
  for (const name of names) {
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
      document.cookie = `${name}=; path=/; max-age=0`;
      document.cookie = `${name}=; path=/; max-age=0; domain=.${domain}`;
    }
  }
}
