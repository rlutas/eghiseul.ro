import Image from 'next/image';

/**
 * Our redacted extras-CF specimen with numbered markers on each zone, plus the
 * same numbers as a text legend (screen readers, AI crawlers, and readers who
 * zoom). Marker positions are percentages of the 1000×1414 image.
 */
const MARKERS: { n: number; x: number; y: number; title: string; text: string }[] = [
  { n: 1, x: 18, y: 6.4, title: 'Oficiul care l-a emis', text: 'OCPI-ul județului și biroul teritorial (BCPI) unde e ținută cartea funciară.' },
  { n: 2, x: 47, y: 12.7, title: '„Pentru informare”', text: 'Tipul extrasului. Cel pentru autentificare îl cere doar notarul, înainte de semnarea actului.' },
  { n: 3, x: 37, y: 14.4, title: 'Numărul cărții funciare și localitatea (UAT)', text: 'Numărul se reia în fiecare comună, deci contează împreună cu localitatea.' },
  { n: 4, x: 75, y: 8.5, title: 'Numărul cererii, data și codul de verificare', text: 'Data arată cât de recent e extrasul; codul permite verificarea autenticității.' },
  { n: 5, x: 8, y: 22.6, title: 'Partea I: tipul și adresa imobilului', text: 'Teren intravilan sau extravilan, adresa; în dreapta, „Nr. CF vechi” când imobilul vine dintr-o carte veche.' },
  { n: 6, x: 8, y: 29.7, title: 'A1: terenul', text: 'Numărul cadastral (sau topografic) și suprafața măsurată.' },
  { n: 7, x: 8, y: 38, title: 'A1.1: construcția', text: 'Construcția de pe teren, cu numărul ei cadastral (aici „-C1”) și observații: niveluri, suprafața construită la sol.' },
  { n: 8, x: 8, y: 45.8, title: 'Partea a II-a: cererea și actul', text: 'Fiecare înscriere începe cu numărul și data cererii, apoi actul care a produs-o (contract, certificat de moștenitor, hotărâre).' },
  { n: 9, x: 8, y: 49.9, title: 'B5: proprietarii și cota', text: '„Intabulare, drept de proprietate”, cota (1/1 = întreg) și titularii.' },
  { n: 10, x: 85, y: 49.7, title: 'Referințe', text: 'La ce imobil din Partea I se aplică înscrierea: A1 = terenul, A1.1 = construcția.' },
  { n: 11, x: 8, y: 60.5, title: 'B8: o notare, în Partea a II-a', text: 'Interdicțiile de înstrăinare și grevare în favoarea băncii. Apar aici, nu la sarcini.' },
  { n: 12, x: 8, y: 73.8, title: 'Partea a III-a: C3, ipoteca', text: 'Dreptul băncii: valoarea, rangul și creditorul. Același act de ipotecă a produs și B8.' },
];

export function CfSpecimenAnnotated() {
  return (
    <figure className="not-prose my-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div className="relative mx-auto aspect-[1000/1414] w-full max-w-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
          <Image
            src="/images/specimens/extras-cf-anonim.png"
            alt="Specimen de extras de carte funciară pentru informare, cu datele personale acoperite: antet, Partea I (teren și construcție), Partea a II-a (proprietari și o notare) și Partea a III-a (ipotecă)"
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-contain"
          />
          {MARKERS.map((m) => (
            <span
              key={m.n}
              aria-hidden="true"
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-500 text-[11px] font-black text-secondary-900 shadow ring-2 ring-white"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              {m.n}
            </span>
          ))}
        </div>
        <ol className="space-y-2.5 text-sm leading-snug">
          {MARKERS.map((m) => (
            <li key={m.n} className="flex gap-2.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-[11px] font-black text-secondary-900">
                {m.n}
              </span>
              <span className="text-neutral-700">
                <strong className="text-secondary-900">{m.title}.</strong> {m.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-3 text-center text-xs text-neutral-500">
        Specimen de extras de carte funciară pentru informare, cu datele personale acoperite.
      </figcaption>
    </figure>
  );
}
