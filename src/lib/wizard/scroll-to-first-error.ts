// Wizard UX: when the user taps «Continuă» on an invalid step, the step
// reveals its validation errors (via validationAttempt) and THEN we scroll
// the first problem into view — otherwise on mobile the error sits off-screen
// and the button just looks broken (root cause of most "form blocat" tickets).

const ERROR_SELECTOR = [
  // Explicit marker for custom (non react-hook-form) steps: put
  // data-wizard-error on the container of a missing/incomplete section.
  '[data-wizard-error]',
  // react-hook-form + shadcn: inputs get aria-invalid, messages get
  // id="...-form-item-message" (see src/components/ui/form.tsx).
  '[aria-invalid="true"]',
  '[id$="-form-item-message"]',
].join(', ');

/**
 * Scroll the first visible validation error into view and focus it if
 * focusable. Delayed so the step has a render pass to show its errors after
 * `requestValidation()` bumps `validationAttempt`.
 */
export function scrollToFirstWizardError(delayMs = 150): void {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(ERROR_SELECTOR));
    // Skip hidden elements (collapsed sections, display:none inputs).
    const el = candidates.find((c) => c.offsetParent !== null || c.getClientRects().length > 0);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      el.focus({ preventScroll: true });
    }
  }, delayMs);
}
