/**
 * SelfieLegalNotice
 *
 * Why we ask for the selfie, what happens to it, and how long we keep it —
 * written NEXT TO the uploader, not only in the privacy policy. A photo of a
 * face is biometric data, a special category under GDPR art. 9, and ANSPDCP
 * has sanctioned the "ID copy + selfie, collected for identification" pattern
 * precisely for having no documented purpose or retention on screen.
 * See `docs/dashboard-client/PLAN.md` §9.2.
 *
 * EVERY claim below must stay backed by code. What is true today:
 *
 *  - 90 days is `KYC_VALIDITY_DAYS` (src/lib/kyc/constants.ts). It is how long
 *    a stored document is REUSED without asking again — it is NOT a deletion
 *    deadline, and this text must not present it as one. Nothing in the
 *    application code deletes a selfie on a timer: `deleteKycVerification`
 *    (src/lib/aws/s3.ts) has zero callers and `anonymize_expired_drafts`
 *    (migration 009) only touches UNPAID drafts, on a manual button.
 *
 *  - The three years come from the retention decided on 17.09.2026 and written
 *    into the privacy policy: the order file, including the identity document
 *    and the selfie, is kept for the duration of the contract plus three years,
 *    because we have to be able to prove to a control body that we verified the
 *    identity of the person whose request we filed (GDPR art. 17(3)(b) and (e)).
 *    Enforcement is the S3 lifecycle rule on the `kyc/` prefix
 *    (`docs/deployment/AWS_S3_SETUP.md`, 1095 days) — if that rule is ever
 *    removed from the bucket, this sentence stops being true.
 *
 *  - `matching` is not decoration. The ACCOUNT compares the two faces through
 *    Gemini (KYCTab → `runFaceMatch` → `/api/kyc/validate` →
 *    `src/lib/services/kyc-validation.ts`, Google's API). The ORDER WIZARD
 *    does NOT: automatic matching was removed there on 2026-06-09
 *    (KYCDocumentsStep:416) and the selfie is flagged `needsManualReview`, so
 *    a colleague compares it in the admin panel. Naming the wrong one is a
 *    false statement about an external processor — pass the variant that
 *    matches the surface you render it on.
 *
 *  - No explicit consent tick exists for this processing anywhere in the flow
 *    (the wizard's only consents live on the review step, bundled as terms +
 *    privacy + withdrawal waiver, and they are given AFTER the upload). That
 *    is why this text documents purpose, processing and retention rather than
 *    claiming a GDPR art. 9(2)(a) basis it cannot show.
 */

import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelfieLegalNoticeProps {
  /**
   * Who performs the face comparison on this surface.
   * `automated` — the account: the two images go to Google (Gemini).
   * `human` — the order wizard: a colleague compares them in the admin panel.
   */
  matching: 'automated' | 'human';
  className?: string;
}

export function SelfieLegalNotice({ matching, className }: SelfieLegalNoticeProps) {
  return (
    <details
      aria-label="Temeiul și durata de păstrare a fotografiei de verificare"
      className={cn(
        'group rounded-xl border border-neutral-200 bg-neutral-50/70 p-4',
        className,
      )}
    >
      {/* The summary IS the disclosure — purpose, who compares, retention —
          readable where the photo is asked for; the full text is one tap
          away on the same surface (feedback 18.09.2026, #23). Every figure
          below is backed by the notes at the top of this file. */}
      <summary className="flex cursor-pointer list-none gap-3 [&::-webkit-details-marker]:hidden">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
        <span className="min-w-0 text-xs leading-relaxed text-neutral-600">
          <span className="block text-sm font-semibold text-secondary-900">
            De ce cerem selfie-ul și cât îl păstrăm
          </span>
          Confirmă că tu ești titularul actului;{' '}
          {matching === 'automated' ? 'comparația o face un serviciu Google (Gemini)' : 'o compară un coleg, nu un algoritm'};
          o refolosim 90 de zile și rămâne la dosarul comenzii 3 ani.
          <span className="ml-1 font-medium text-primary-600 group-open:hidden">Citește tot</span>
        </span>
      </summary>
      <div className="flex gap-3 pt-3">
        <span className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <div className="min-w-0 space-y-2 text-xs leading-relaxed text-neutral-600">

          <p>
            <span className="font-medium text-secondary-900">De ce.</span>{' '}
            Depunem cererea în numele tău, pe baza împuternicirii pe care o
            semnezi. Selfie-ul cu actul în mână e singurul fel în care putem
            confirma că cel care comandă e chiar titularul actului, nu altcineva
            care i-a fotografiat buletinul.
          </p>

          <p>
            <span className="font-medium text-secondary-900">Ce facem cu poza.</span>{' '}
            {matching === 'automated' ? (
              <>
                Comparăm fața din selfie cu fotografia de pe actul tău. Comparația
                e făcută automat de un serviciu Google (Gemini), care primește
                cele două imagini doar pentru această verificare.
              </>
            ) : (
              <>
                Un coleg din echipa noastră compară fața din selfie cu fotografia
                de pe actul tău. Nu o dăm unui serviciu automat de recunoaștere
                facială.
              </>
            )}{' '}
            Nu o publicăm nicăieri, nu o trimitem instituției care eliberează
            documentul și nu o folosim în alt scop.
          </p>

          <p>
            <span className="font-medium text-secondary-900">Ce fel de dată este.</span>{' '}
            Fotografia feței tale e o dată biometrică — categorie specială în
            GDPR (art. 9). De-aia o cerem doar la serviciile care au nevoie de
            actul de identitate și o spunem aici, nu doar în politică.
          </p>

          <p>
            <span className="font-medium text-secondary-900">Cât o păstrăm.</span>{' '}
            90 de zile o refolosim, ca să nu ți-o cerem din nou la o comandă
            următoare. După 90 de zile îți cerem una nouă. Poza rămâne la dosarul
            comenzii 3 ani de la finalizarea ei, fiindcă trebuie să putem dovedi la
            control că am verificat identitatea persoanei pentru care am depus
            cererea. Ștergerea o poți cere oricând la{' '}
            <a
              href="mailto:contact@eghiseul.ro"
              className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
            >
              contact@eghiseul.ro
            </a>
            .
          </p>

          <p>
            <span className="font-medium text-secondary-900">Dacă nu vrei.</span>{' '}
            Nu ești obligat să o încarci. Fără ea nu putem verifica identitatea,
            deci nu putem prelua serviciile care cer act de identitate. Serviciile
            care nu cer act — certificat constatator, extras de carte funciară și
            celelalte — rămân disponibile fără selfie.
          </p>

          <p>
            <a
              href="/politica-de-confidentialitate/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
            >
              Politica de confidențialitate
            </a>{' '}
            — drepturile tale și restul prelucrărilor.
          </p>
        </div>
      </div>
    </details>
  );
}

export default SelfieLegalNotice;
