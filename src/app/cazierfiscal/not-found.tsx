import Link from 'next/link';
import { HeaderCazierFiscal } from '@/components/cazierfiscal/header';
import { Arrow, Section } from '@/components/documentero/ui';

export const metadata = {
  title: 'Pagina nu a fost găsită',
  robots: { index: false, follow: true },
};

export default function CazierFiscalNotFound() {
  return (
    <>
      <HeaderCazierFiscal />
      <main id="main-content">
        <Section reveal={false} className="flex flex-col items-start gap-5 py-24 sm:py-32">
          <p className="m-0 text-[64px] font-extrabold leading-none tracking-[-0.05em] text-d-acc">404</p>
          <h1 className="m-0 text-[32px] font-bold tracking-[-0.03em] sm:text-[40px]">Pagina nu a fost găsită</h1>
          <p className="m-0 max-w-[560px] text-[17px] leading-[1.6] text-d-muted">
            Adresa nu există sau a fost mutată. Pornește de pe pagina principală sau comandă direct cazierul fiscal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex h-12 items-center rounded-xl border-[1.5px] border-d-line bg-d-card px-5 font-semibold">Pagina principală</Link>
            <Link href="/comanda/cazier-fiscal/" className="inline-flex h-12 items-center gap-2 rounded-xl bg-d-acc px-5 font-bold text-d-ink">Comandă cazierul fiscal <Arrow /></Link>
          </div>
        </Section>
      </main>
    </>
  );
}
