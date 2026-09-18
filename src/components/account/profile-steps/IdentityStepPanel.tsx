'use client';

/**
 * Checklist step „Act de identitate" — the one step that does NOT get a form in
 * the dialog.
 *
 * Uploading the document is not a form: it is a document-type choice, a camera
 * or file pick per side, image compression, OCR over the result, and a face
 * match against the selfie. That flow lives in `KYCTab` and owns around twenty
 * pieces of state; copying it into a 500px-wide dialog would be a second
 * implementation to keep in sync, and lifting it out is a refactor of its own.
 *
 * So this step says what is coming and hands over to the tab that already does
 * it. The two other things the customer can act on right now — everything else
 * on the checklist — stay one press away behind „Înapoi la listă".
 */

import { useRouter } from 'next/navigation';
import { Camera, IdCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IdentityStepPanel({ onRequestClose }: { onRequestClose: () => void }) {
  const router = useRouter();

  return (
    // `pb-5`: the forms get their bottom breathing room from the sticky footer,
    // this panel has none of its own — without it the buttons sit flush against
    // the bottom edge of the dialog.
    <div className="space-y-5 pb-5">
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <IdCard className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-sm leading-relaxed text-neutral-600">
            <span className="block font-semibold text-secondary-900">
              Fotografiezi actul de identitate
            </span>
            Îl citim automat, ca să nu mai scrii datele de mână.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Camera className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-sm leading-relaxed text-neutral-600">
            <span className="block font-semibold text-secondary-900">Adaugi un selfie</span>
            Confirmă că actul este al tău. Durează sub un minut, o singură dată.
          </span>
        </li>
      </ul>

      <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onRequestClose}
          className="h-11 min-h-[44px]"
        >
          Înapoi la listă
        </Button>
        <Button
          type="button"
          onClick={() => {
            // Close first: the identity tab is behind this dialog, and leaving
            // it open would cover the uploader the button just went to.
            onRequestClose();
            router.push('/account/?tab=kyc');
          }}
          className="h-11 min-h-[44px] bg-primary-500 font-semibold text-secondary-900 hover:bg-primary-600"
        >
          Încarcă actul
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
