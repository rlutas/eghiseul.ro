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

export const SAVE_TOO_LARGE_MESSAGE =
  'Documentele încărcate sunt prea mari. Șterge ultimul document și încarcă o poză sau un PDF mai mic.';
export const SAVE_SERVER_ERROR_MESSAGE = 'Nu am putut salva comanda. Reîncercăm automat.';

/** A server failure can pass on its own. A rejected request (4xx) will not. */
export function isRetriableSaveStatus(status: number | null | undefined): boolean {
  return typeof status === 'number' && status >= 500 && status < 600;
}

export function saveFailureMessage(error: unknown, status?: number | null): string {
  if (isNetworkFailure(error)) return CONNECTION_LOST_MESSAGE;
  if (status === 413) return SAVE_TOO_LARGE_MESSAGE;
  if (isRetriableSaveStatus(status)) return SAVE_SERVER_ERROR_MESSAGE;
  return error instanceof Error && error.message ? error.message : 'Salvarea a eșuat';
}

const SAVE_RETRY_DELAYS_MS = [3000, 8000, 20000, 60000];

/** Wait before retry number `attempt` (0-based), or null when it is time to stop. */
export function nextSaveRetryDelay(attempt: number): number | null {
  return SAVE_RETRY_DELAYS_MS[attempt] ?? null;
}
