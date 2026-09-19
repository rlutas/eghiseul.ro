import type { Metadata } from 'next';
import Link from 'next/link';
import { BRANDS } from '@/lib/brand/brands';

/**
 * PLACEHOLDER until the hub content is written (Faza 3 of the plan). Kept
 * out of the index on purpose: an empty home indexed early is the worst
 * first impression a new domain can give Google.
 */
export const metadata: Metadata = {
  title: { absolute: 'documentero.ro — în curând' },
  description: 'Acte de stare civilă obținute prin avocat și livrate prin curier.',
  alternates: { canonical: `${BRANDS.documentero.baseUrl}/` },
  robots: { index: false, follow: false },
};

export default function DocumenteroHomePlaceholder() {
  return (
    <main id="main-content" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#C8401F]">În curând</p>
      <h1 className="mt-4 max-w-[14ch] text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1] tracking-[-0.02em]">
        Actul tău, fără ghișeu.
      </h1>
      <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-[#4A4640]">
        Certificate de naștere, căsătorie, celibat și extrase multilingve, obținute de un avocat și
        livrate prin curier. Până lansăm, poți comanda pe eghiseul.ro.
      </p>
      <Link
        href={`${BRANDS.eghiseul.baseUrl}/servicii/eliberare-certificat-de-nastere/`}
        className="mt-8 inline-flex h-12 items-center rounded-md bg-[#1C1A17] px-5 font-semibold text-[#F3EEE4]"
      >
        Comandă pe eghiseul.ro
      </Link>
    </main>
  );
}
