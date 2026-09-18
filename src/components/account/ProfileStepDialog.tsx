'use client';

/**
 * The dialog behind every row of the profile checklist.
 *
 * The rows used to be links into another tab of the account: the customer lost
 * the list, the percentage and their place on the page to fill in one field.
 * Now the step opens where it was pressed and closes back onto the list, with
 * the percentage already updated.
 *
 * The shell owns what is the same for all five steps — the title, the scroll,
 * the focus on the first field, and the confirmation before throwing away
 * unsaved work — and nothing about any particular form.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ProfileStepId } from '@/lib/account/profile-completeness';
import { ContactStepForm } from './profile-steps/ContactStepForm';
import { PersonalStepForm } from './profile-steps/PersonalStepForm';
import { IdentityStepPanel } from './profile-steps/IdentityStepPanel';
import { AddressStepForm } from './profile-steps/AddressStepForm';
import { BillingStepForm } from './profile-steps/BillingStepForm';

const COPY: Record<ProfileStepId, { title: string; description: string }> = {
  contact: {
    title: 'Telefon de contact',
    description: 'Un singur număr, la care te sunăm doar dacă e ceva de lămurit.',
  },
  personal: {
    title: 'Date personale',
    description: 'Nume, CNP și data nașterii — completate automat la fiecare comandă.',
  },
  identity: {
    title: 'Act de identitate',
    description: 'Actul și un selfie, o singură dată, în pagina dedicată.',
  },
  address: {
    title: 'Adresă de livrare',
    description: 'O alegi dintr-o listă la comandă, în loc să o scrii de fiecare dată.',
  },
  billing: {
    title: 'Date de facturare',
    description: 'Factura se emite pe datele salvate aici.',
  },
};

export function ProfileStepDialog({
  step,
  onClose,
  triggerRef,
  returnFocusRef,
}: {
  step: ProfileStepId | null;
  onClose: () => void;
  /** The row this was opened from — where the focus goes back on „Anulează". */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Where the focus goes after a save, since the row it came from is gone. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);
  /** Set by a save, read once while closing to decide where focus lands. */
  const justSaved = useRef(false);
  const wasConfirming = useRef(false);

  /** The field the step opens on, and the one it comes back to. */
  const focusFirstField = useCallback(() => {
    const root = contentRef.current;
    if (!root) return null;
    // In two steps, not one comma-separated query: `querySelector` returns the
    // first match in DOCUMENT order, so a hidden file input sitting above the
    // fields would win over the field marked `data-autofocus`.
    const first =
      root.querySelector<HTMLElement>('[data-autofocus="true"]') ??
      root.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([hidden]):not([disabled]), textarea'
      );
    first?.focus();
    return first;
  }, []);

  useEffect(() => {
    if (confirming) {
      keepEditingRef.current?.focus();
      wasConfirming.current = true;
      return;
    }
    // Back from „Continuă completarea": the button that had the focus is gone,
    // and without this the focus falls to the dialog box itself.
    if (wasConfirming.current) {
      wasConfirming.current = false;
      if (step !== null) focusFirstField();
    }
  }, [confirming, step, focusFirstField]);

  /** Every way out goes through here, so the next step opens clean. */
  const close = useCallback(() => {
    setDirty(false);
    setConfirming(false);
    onClose();
  }, [onClose]);

  /** Closing with something typed asks first; otherwise it just closes. */
  const requestClose = useCallback(() => {
    if (dirty) {
      setConfirming(true);
      return;
    }
    close();
  }, [dirty, close]);

  const handleSaved = useCallback(() => {
    justSaved.current = true;
    close();
    // The checklist and its percentage are rendered on the server from the
    // database, so the row only disappears once the page data is re-read.
    router.refresh();
  }, [close, router]);

  const formProps = {
    onDirtyChange: setDirty,
    onSaved: handleSaved,
    onRequestClose: requestClose,
  };

  const copy = step ? COPY[step] : null;

  return (
    <Dialog
      open={step !== null}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (!focusFirstField()) contentRef.current?.focus();
        }}
        // Radix hands the focus back to its `DialogTrigger`, and this dialog is
        // opened from a row of the list rather than from a trigger — so left to
        // itself it focuses nothing and the customer is returned to `<body>`,
        // the top of the document, a whole page away from the list they were
        // reading. Back to the row, or, once it has been saved away, to the
        // title of the list.
        onCloseAutoFocus={(event) => {
          const saved = justSaved.current;
          justSaved.current = false;
          const row = triggerRef?.current;
          const target = !saved && row?.isConnected ? row : returnFocusRef?.current;
          if (!target) return;
          event.preventDefault();
          target.focus();
        }}
        // ESC and the backdrop close the dialog, but never silently drop work.
        onEscapeKeyDown={(event) => {
          if (!dirty) return;
          event.preventDefault();
          setConfirming(true);
        }}
        onInteractOutside={(event) => {
          if (!dirty) return;
          event.preventDefault();
          setConfirming(true);
        }}
      >
        <DialogHeader className="flex-shrink-0 border-b border-neutral-100 px-5 py-4 pr-14 text-left sm:px-6">
          <DialogTitle className="text-base font-bold text-secondary-900 sm:text-lg">
            {copy?.title ?? ''}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-neutral-500">
            {copy?.description ?? ''}
          </DialogDescription>
        </DialogHeader>

        {/* Our own close button instead of the 16px default: it has to be a
            comfortable target on a phone, and it has to go through the
            unsaved-work check like every other way out. */}
        <button
          type="button"
          onClick={requestClose}
          className="absolute top-2.5 right-3 flex h-11 w-11 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Închide</span>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 sm:px-6">
          {/* Hidden, not unmounted: „Continuă completarea" has to bring back
              what was typed, and an unmounted form comes back empty — which is
              exactly the loss the question is there to prevent. */}
          <div className={confirming ? 'hidden' : undefined}>
            {step === 'contact' && <ContactStepForm {...formProps} />}
            {step === 'personal' && <PersonalStepForm {...formProps} />}
            {step === 'identity' && <IdentityStepPanel onRequestClose={requestClose} />}
            {step === 'address' && <AddressStepForm {...formProps} />}
            {step === 'billing' && <BillingStepForm {...formProps} />}
          </div>

          {confirming && (
            <div className="space-y-5 pb-5">
              <p role="alert" className="text-sm leading-relaxed text-neutral-700">
                Ai completat ceva ce nu s-a salvat încă. Dacă închizi acum, se pierde.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  className="h-11 min-h-[44px] text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Închide fără să salvez
                </Button>
                <Button
                  ref={keepEditingRef}
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-11 min-h-[44px] bg-primary-500 font-semibold text-secondary-900 hover:bg-primary-600"
                >
                  Continuă completarea
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
