import { Calculator } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorsDirectory } from '@/components/calculators/calculators-directory';

const TITLE = 'Calculatoare Online Gratuite 2026 — eGhișeul.ro';
const DESCRIPTION =
  'Peste 30 de calculatoare online gratuite: salariu, taxe, dividende, credite, notariale, juridice și de timp. Rapide, actualizate 2026, fără cont.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/calculator/',
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculatoare Online Gratuite')}`,
});

export default function Page() {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-20 lg:pb-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[900px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Calculator className="w-3.5 h-3.5" /> Instrumente gratuite
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-4">
              Calculatoare online gratuite
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">{DESCRIPTION}</p>
          </div>
        </header>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-[900px]">
            <CalculatorsDirectory />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
