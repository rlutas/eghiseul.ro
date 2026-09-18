'use client';

/**
 * The pieces every profile-checklist step form shares.
 *
 * The checklist opens each step in a dialog, so the forms are small and all
 * behave the same way: a visible label above every control, the error under the
 * field it belongs to, validation on blur rather than on every keystroke, and a
 * save button that disables itself while the request is in flight.
 */

import { useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** What the dialog shell hands every step form. */
export interface ProfileStepFormProps {
  /** Unsaved work — the shell asks before closing when this is true. */
  onDirtyChange: (dirty: boolean) => void;
  /** Saved: the shell closes itself and refreshes the checklist percentage. */
  onSaved: () => void;
  /** „Anulează" — the shell decides whether to confirm first. */
  onRequestClose: () => void;
}

/**
 * One labelled control. The label is a real `<label>` with visible text, never
 * a placeholder standing in for one, and the message sits under its own field
 * so it is obvious which one is wrong.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="font-medium text-secondary-900">
        {label}
        {required && (
          <span className="text-red-500">
            *<span className="sr-only"> obligatoriu</span>
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium leading-relaxed text-red-600"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Ties a field to its own error/hint for screen readers. */
export function describedBy(id: string, error?: string | null, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

/** Height that keeps inputs tappable on a phone; the shadcn default is 36px. */
export const INPUT_CLASS = 'h-11 bg-white';

/**
 * The failure of the request itself (not of a field): network down, 500, an
 * expired session. Announced, because it appears far from where the customer is
 * looking after pressing save.
 *
 * It also brings itself into view: it sits at the top of the form, and the save
 * button that produced it is at the bottom of a form taller than the dialog. On
 * a phone that means the customer presses „Salvează", the button comes back to
 * life and nothing else appears to happen — the explanation is scrolled out of
 * sight above them.
 */
export function FormError({ message }: { message: string | null }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!message || !node) return;
    node.focus({ preventScroll: true });
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
  }, [message]);

  if (!message) return null;
  return (
    <p
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 focus:outline-none"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/**
 * Save and cancel. Sticky so they stay reachable on a phone when the form is
 * taller than the dialog, which is the whole billing form.
 */
export function StepFormFooter({
  saving,
  onCancel,
  saveLabel = 'Salvează',
}: {
  saving: boolean;
  onCancel: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-2 border-t border-neutral-100 bg-white px-5 pt-3 pb-5 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={saving}
        className="h-11 min-h-[44px]"
      >
        Anulează
      </Button>
      <Button
        type="submit"
        disabled={saving}
        className="h-11 min-h-[44px] bg-primary-500 font-semibold text-secondary-900 hover:bg-primary-600"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Se salvează…
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </div>
  );
}

/**
 * Moves the focus to the first field the customer still has to fix.
 *
 * `idOf` maps the key the errors are stored under to the `id` of the control in
 * the page, for the forms whose fields are named one way in state and another
 * in the DOM.
 */
export function focusFirstInvalid(
  keys: string[],
  errors: Record<string, string | null>,
  idOf: (key: string) => string = (key) => key
) {
  const firstBad = keys.find((key) => errors[key]);
  if (!firstBad) return;
  const el = document.getElementById(idOf(firstBad));
  if (el instanceof HTMLElement) el.focus();
}

/**
 * The same check the order form makes — per-country length and pattern through
 * libphonenumber-js — so a number the account accepts is a number the wizard
 * accepts, and one the team can dial.
 */
export { validatePhone } from '@/lib/format/validate-phone';
