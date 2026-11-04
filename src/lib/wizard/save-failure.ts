/**
 * What to do when the wizard autosave fails.
 *
 * `fetch` rejects with a TypeError when the request never gets an answer. The
 * text differs per browser and is English, so it must not reach the customer
 * (it showed as „Failed to fetch" next to „Continuă", E-261104-SAQKA).
 */

const NETWORK_MESSAGES = [
  'failed to fetch', // Chrome, Edge, Samsung Internet
  'networkerror', // Firefox
  'load failed', // Safari
  'network request failed',
];

export const CONNECTION_LOST_MESSAGE = 'Conexiune slabă. Reîncercăm automat.';

export function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const message = error.message.toLowerCase();
  return NETWORK_MESSAGES.some((known) => message.includes(known));
}

export function saveFailureMessage(error: unknown): string {
  if (isNetworkFailure(error)) return CONNECTION_LOST_MESSAGE;
  return error instanceof Error && error.message ? error.message : 'Salvarea a eșuat';
}

const SAVE_RETRY_DELAYS_MS = [3000, 8000, 20000, 60000];

/** Wait before retry number `attempt` (0-based), or null when it is time to stop. */
export function nextSaveRetryDelay(attempt: number): number | null {
  return SAVE_RETRY_DELAYS_MS[attempt] ?? null;
}
