import { Info } from 'lucide-react';

/**
 * Notă de neafiliere pentru paginile de serviciu — cerință a politicii Google Ads
 * „Documente guvernamentale și servicii oficiale": serviciul privat trebuie declarat
 * vizibil pe landing, cu trimitere la canalul direct al instituției. Modelul urmează
 * pattern-ul competitorilor aprobați (caziere.ro / roghiseul.ro): discret, sub hero,
 * pe fundal neutru — nu banner care mănâncă din conversie.
 */
export function PrivateServiceNotice({
  institutionLabel,
  institutionUrl,
}: {
  /** Cum numim canalul direct, ex. „la Starea Civilă sau pe hub.mai.gov.ro". */
  institutionLabel: string;
  institutionUrl: string;
}) {
  return (
    <div className="bg-neutral-100 border-y border-neutral-200">
      <div className="container mx-auto px-4 max-w-[1200px] py-3">
        <p className="text-[13px] leading-relaxed text-neutral-600 flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-neutral-400" aria-hidden="true" />
          <span>
            eGhișeul.ro este un <strong className="font-semibold">serviciu privat de asistență și
            intermediere</strong> — nu suntem instituție de stat și nu suntem afiliați autorităților.
            Documentele sunt emise exclusiv de autoritățile competente, iar serviciul nostru este
            opțional: poți solicita documentul și direct,{' '}
            <a
              href={institutionUrl}
              target="_blank"
              rel="nofollow noopener"
              className="underline decoration-neutral-400 underline-offset-2 hover:text-neutral-800"
            >
              {institutionLabel}
            </a>
            .
          </span>
        </p>
      </div>
    </div>
  );
}
