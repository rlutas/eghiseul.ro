import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { DiurnaCalculator } from '@/components/calculators/diurna-calculator';

const SLUG = 'diurna';
const TITLE = 'Calculator Diurnă 2026 — Plafon Neimpozabil Delegație';
const DESCRIPTION =
  'Calculează diurna neimpozabilă pentru delegație în țară (57,5 lei/zi) sau străinătate și partea impozabilă, conform regulilor fiscale 2026.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Diurnă')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Diurnă 2026"
      description="Estimează partea neimpozabilă și partea impozabilă a diurnei pentru delegație sau detașare, în țară sau în străinătate."
      widget={<DiurnaCalculator />}
      faqs={[
        {
          q: 'Cât este diurna neimpozabilă în țară în 2026?',
          a: 'Plafonul neimpozabil pentru sectorul privat este de 57,5 lei pe zi (2,5 × diurna din sectorul public, care este 23 lei). Există și un plafon lunar de 3 salarii de bază. Ce depășește aceste plafoane se impozitează ca venit salarial.',
        },
        {
          q: 'Cum se calculează diurna în străinătate?',
          a: 'Pentru fiecare țară există o valoare de bază (categoria I) stabilită prin HG 518/1995. Plafonul neimpozabil pentru sectorul privat este 2,5 × această valoare. De exemplu, pentru Germania baza este 35 EUR/zi, deci plafonul neimpozabil este 87,5 EUR/zi.',
        },
        {
          q: 'Ce taxe se aplică pe partea impozabilă a diurnei?',
          a: 'Partea de diurnă care depășește plafonul neimpozabil se impozitează ca salariu: impozit 10%, CAS 25% și CASS 10% (plus CAM 2,25% datorat de angajator).',
        },
      ]}
    >
      <h2>Ce este diurna și când e neimpozabilă</h2>
      <p>
        Diurna este suma acordată angajatului pentru cheltuielile de delegație sau detașare. O parte este{' '}
        <strong>neimpozabilă</strong> (până la un plafon), iar ce depășește plafonul se impozitează ca venit salarial.
      </p>

      <h2>Plafoane 2026</h2>
      <ul>
        <li><strong>În țară:</strong> 57,5 lei/zi (2,5 × 23 lei), limitat și la 3 salarii de bază pe lună;</li>
        <li><strong>Străinătate:</strong> 2,5 × valoarea categoriei I pe țară (ex. Germania 87,5 EUR/zi).</li>
      </ul>

      <p>
        Vezi și <Link href="/calculator/salariu/">calculatorul de salariu net</Link> sau{' '}
        <Link href="/curs-valutar/">cursul valutar BNR</Link> (util pentru diurna în valută).
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă. Plafonul de 3 salarii și regulile pentru deplasări parțiale (sub 12 ore = 50%) pot
        influența rezultatul.
      </p>
    </CalculatorLayout>
  );
}
