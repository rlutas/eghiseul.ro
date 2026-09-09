import Link from 'next/link';

/**
 * Nota de neafiliere + datele firmei, pentru ECRANELE DE COMANDĂ.
 *
 * De ce există separat de footer: footerul NU e în root layout, iar
 * `comanda/[service]`, `comanda/checkout/[orderId]` și `comanda/success/[orderId]`
 * nu îl importă — deci exact ecranele pe care clientul dă CNP, scan de act de
 * identitate și date de card nu conțineau nicio mențiune că suntem un serviciu
 * privat, niciun link ANPC și niciun dat de firmă (audit 09.09.2026).
 *
 * Ținut compact: e o bandă de subsol, nu un banner care mănâncă din conversie.
 */
export function OrderFlowDisclosure() {
  return (
    <div className="border-t border-neutral-200 bg-neutral-50">
      <div className="container mx-auto max-w-[1200px] px-4 py-6 space-y-2">
        <p className="text-[13px] leading-relaxed text-neutral-600">
          eGhișeul.ro este un <strong className="font-semibold">serviciu privat de asistență și
          intermediere</strong> — nu suntem instituție de stat și nu suntem afiliați autorităților.
          Documentele sunt emise exclusiv de autoritățile competente din România, iar serviciul
          nostru este opțional: documentele pot fi solicitate și direct la instituțiile emitente.
        </p>
        <p className="text-[12px] leading-relaxed text-neutral-500">
          eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · Jud. Satu Mare, Com.
          Odoreu, Str. Salcâmilor nr. 2 ·{' '}
          <Link href="/termeni-si-conditii/" className="underline underline-offset-2 hover:text-neutral-700">
            Termeni și condiții
          </Link>{' '}
          ·{' '}
          <Link href="/politica-de-confidentialitate/" className="underline underline-offset-2 hover:text-neutral-700">
            Confidențialitate
          </Link>{' '}
          ·{' '}
          <a
            href="https://anpc.ro/ce-este-sal/"
            target="_blank"
            rel="nofollow noopener"
            className="underline underline-offset-2 hover:text-neutral-700"
          >
            ANPC — SAL
          </a>
        </p>
      </div>
    </div>
  );
}
