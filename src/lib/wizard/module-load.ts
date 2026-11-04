/**
 * Load a wizard step module on an unreliable connection.
 *
 * A step's code is downloaded when the customer reaches it. On a phone with weak
 * signal that download can fail or never answer, and the step stayed on
 * „Se încarcă..." for good (E-261104-SAQKA).
 *
 * Importing again does not help: tested on the production build, the bundler
 * keeps the failed chunk for the life of the page and sends no new request. Only
 * a page reload recovers, so that is what the wizard does.
 */

export class ModuleLoadTimeoutError extends Error {
  constructor() {
    super('Module load timed out');
    this.name = 'ModuleLoadTimeoutError';
  }
}

export function loadWithTimeout<T>(loader: () => Promise<T>, timeoutMs = 25000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ModuleLoadTimeoutError()), timeoutMs);
    loader().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const RELOAD_KEY_PREFIX = 'wizard_module_reload:';

/** True the first time per browser tab and step. A second failure waits for the customer. */
export function shouldAutoReloadForStep(
  stepId: string,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
): boolean {
  try {
    const key = `${RELOAD_KEY_PREFIX}${stepId}`;
    if (storage.getItem(key)) return false;
    storage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}

/** Set before a reload the wizard itself starts: no „leave this page?" prompt. */
export const WIZARD_RELOAD_FLAG = '__wizardSelfReload';

export function reloadWizardPage(): void {
  (window as unknown as Record<string, boolean>)[WIZARD_RELOAD_FLAG] = true;
  window.location.reload();
}
