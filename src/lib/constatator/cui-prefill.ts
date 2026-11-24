/**
 * Hand-off of the CUI typed on the constatator homepage into the order wizard.
 *
 * The homepage looks the firm up first (the way every competitor starts), then
 * sends the visitor to the wizard. The CUI travels in sessionStorage, not in the
 * URL: the wizard URL goes to analytics with every page view.
 */

const KEY = 'constatator_cui_prefill';

/** Digits of a Romanian CUI (accepts "RO 123", spaces, dots). Null when not 2–10 digits. */
export function normalizeCui(raw: string): string | null {
  const digits = raw.replace(/^\s*RO/i, '').replace(/\D/g, '');
  return digits.length >= 2 && digits.length <= 10 ? digits : null;
}

export function saveCuiPrefill(cui: string, storage: Storage | undefined = safeSession()): void {
  const clean = normalizeCui(cui);
  if (!clean || !storage) return;
  try {
    storage.setItem(KEY, clean);
  } catch {
    // storage blocked: the wizard simply asks for the CUI again
  }
}

/** Reads and clears the CUI saved by the homepage, if any. */
export function takeCuiPrefill(storage: Storage | undefined = safeSession()): string | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(KEY);
    storage.removeItem(KEY);
    return value ? normalizeCui(value) : null;
  } catch {
    return null;
  }
}

function safeSession(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}
