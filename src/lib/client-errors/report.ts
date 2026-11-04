/**
 * Browser helper: record an error the customer just saw, so the team can
 * count how many people hit it (`/admin/erori-clienti`).
 *
 * Fire-and-forget: sendBeacon (survives navigation) with a keepalive fetch
 * fallback; never throws, never awaits. Do NOT pass personal data — no CNP,
 * names, emails, file contents. The server scrubs anyway.
 */
import type { ClientErrorPayload } from './schema';

const ENDPOINT = '/api/client-errors/';
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

const QUEUE_KEY = 'client_error_queue';
const MAX_QUEUED = 10;

function readQueue(): ClientErrorPayload[] {
  const raw = sessionStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as ClientErrorPayload[]) : [];
}

function writeQueue(queue: ClientErrorPayload[]): void {
  if (queue.length === 0) sessionStorage.removeItem(QUEUE_KEY);
  else sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * For errors caused by a lost connection: `reportClientError` would be lost with
 * it, because sendBeacon says „ok" even when nothing leaves the phone. The row
 * stays in sessionStorage until `flushQueuedClientErrors` gets a real answer.
 */
export function queueClientError(payload: ClientErrorPayload): void {
  try {
    if (typeof window === 'undefined') return;
    const key = `queued|${payload.kind}|${payload.code ?? ''}|${payload.step ?? ''}`;
    if (sent.has(key) || sent.size >= MAX_PER_PAGE_VIEW) return;
    sent.add(key);
    const row = {
      ...payload,
      message: payload.message?.slice(0, 300),
      page: payload.page ?? window.location.pathname,
    };
    writeQueue([...readQueue(), row].slice(-MAX_QUEUED));
  } catch {
    // never break the page for telemetry
  }
}

/** Send what is queued. Call after a request succeeded, on `online`, on page load. */
export async function flushQueuedClientErrors(): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    let queue = readQueue();
    while (queue.length > 0) {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queue[0]),
        keepalive: true,
      });
      if (!response.ok) return;
      queue = queue.slice(1);
      writeQueue(queue);
    }
  } catch {
    // still offline: the queue stays for the next flush
  }
}

/** Test hook. */
export function __resetClientErrorDedupe(): void {
  sent.clear();
}
