/**
 * Browser helper: record an error the customer just saw, so the team can
 * count how many people hit it (`/admin/erori-clienti`).
 *
 * Fire-and-forget: sendBeacon (survives navigation) with a keepalive fetch
 * fallback; never throws, never awaits. Do NOT pass personal data — no CNP,
 * names, emails, file contents. The server scrubs anyway.
 */
import type { ClientErrorPayload } from './schema';

const ENDPOINT = '/api/client-errors';
// The same error repeated (re-render, double click) counts once per page view.
const sent = new Set<string>();
const MAX_PER_PAGE_VIEW = 30;

export function reportClientError(payload: ClientErrorPayload): void {
  try {
    if (typeof window === 'undefined') return;
    const key = `${payload.kind}|${payload.code ?? ''}|${payload.step ?? ''}|${payload.meta?.docType ?? ''}|${payload.meta?.fallback ?? ''}`;
    if (sent.has(key) || sent.size >= MAX_PER_PAGE_VIEW) return;
    sent.add(key);

    const body = JSON.stringify({
      ...payload,
      message: payload.message?.slice(0, 300),
      page: payload.page ?? window.location.pathname,
    });
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (ok) return;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // never break the page for telemetry
  }
}

/** Test hook. */
export function __resetClientErrorDedupe(): void {
  sent.clear();
}
