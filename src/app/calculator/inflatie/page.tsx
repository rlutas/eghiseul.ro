import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { InflatieCalculator } from '@/components/calculators/inflatie-calculator';

const SLUG = 'inflatie';
const TITLE = 'Calculator Inflație — Puterea de Cumpărare a Banilor';
const DESCRIPTION =
  'Calculează cum a afectat inflația valoarea banilor între doi ani, pe baza ratei medii anuale a inflației (IPC) publicate de INS. Vezi puterea de cumpărare.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Inflație')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Inflație"
      description="Află cât valorează azi o sumă de bani din trecut și cât a fost inflația cumulată între doi ani, pe baza datelor INS."
      widget={<InflatieCalculator />}
      faqs={[
        {
          q: 'Cum se calculează efectul inflației?',
          a: 'Se înmulțesc ratele anuale ale inflației pentru fiecare an din interval. De exemplu, dacă inflația a fost 5% și apoi 10%, o sumă de 100 lei ajunge să valoreze 100 × 1,05 × 1,10 = 115,5 lei în termeni de putere de cumpărare.',
        },
        {
          q: 'Ce rată a inflației folosește calculatorul?',
          a: 'Folosește rata medie anuală a inflației (indicele prețurilor de consum, IPC) publicată de Institutul Național de Statistică (INS), pentru anii 2000–2025.',
        },
        {
          q: 'De ce în unii ani inflația este negativă?',
          a: 'În 2015 și 2016 România a avut deflație (prețurile au scăzut, în parte din cauza reducerii TVA), deci rata anuală a fost negativă. Calculatorul ține cont de aceste valori.',
        },
      ]}
    >
      <h2>Ce arată calculatorul de inflație</h2>
      <p>
        Inflația erodează puterea de cumpărare a banilor: aceeași sumă cumpără mai puțin pe măsură ce trec anii.
        Calculatorul îți arată cât ar trebui să ai azi ca să cumperi ce cumpărai cu o anumită sumă într-un an din trecut,
        pe baza ratelor oficiale INS.
      </p>

      <h2>Cum se calculează</h2>
      <p>
        Se aplică, an de an, rata medie anuală a inflației. Factorul cumulat este produsul tuturor ratelor din interval.
        De exemplu, 1.000 lei din 2015 valorează semnificativ mai mult azi din cauza inflației ridicate din 2022–2023.
      </p>

      <p>
        Vezi și <Link href="/curs-valutar/">cursul valutar BNR</Link> sau{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă, pe baza ratei medii anuale a inflației (IPC) INS. Inflația resimțită pe coșul personal
        poate diferi de media națională.
      </p>
    </CalculatorLayout>
  );
}
