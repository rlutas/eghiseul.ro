import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { AmendaCalculator } from '@/components/calculators/amenda-calculator';

const SLUG = 'amenda-circulatie';
const TITLE = 'Calculator Amendă Circulație 2026 + Puncte de Penalizare';
const DESCRIPTION =
  "Calculează amenda de circulație pe clase, plata redusă în 15 zile și punctele de penalizare pentru viteză (valori 2026).";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: '/og/default.png',
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Amendă Circulație 2026"
      description="Estimează amenda rutieră pe clase și punctele de penalizare pentru depășirea de viteză, cu valoarea punctului-amendă valabilă în 2026."
      widget={<AmendaCalculator />}
      faqs={[
        { q: 'Cât este un punct-amendă în 2026?', a: 'Un punct-amendă valorează 10% din salariul minim brut: 405 lei până la 30 iunie 2026 și 432,50 lei de la 1 iulie 2026 (după majorarea salariului minim). Valoarea aplicată depinde de data contravenției.' },
        { q: 'Cât e amenda pentru depășirea de viteză?', a: 'Depinde de cât depășești: 2 puncte de penalizare (10-20 km/h), 3 (21-30), 4 (31-40), 6 (41+). Peste 50 km/h se adaugă suspendarea permisului 90 de zile, peste 70 km/h — 120 de zile.' },
        { q: 'Pot plăti jumătate din amendă?', a: 'Da, jumătate din minimul amenzii dacă plătești în 15 zile calendaristice de la primirea procesului-verbal.' },
        { q: 'Când mi se suspendă permisul pentru puncte?', a: 'La acumularea a 15 puncte de penalizare — suspendare 30 de zile. Punctele expiră în 6 luni de la data constatării.' },
      ]}
    >
      <h2>Cum se calculează amenda de circulație în 2026</h2>
      <p>
        Amenda se exprimă în <strong>puncte-amendă</strong>, iar un punct valorează 10% din salariul
        minim: <strong>405 lei</strong> până la 30 iunie 2026 și <strong>432,50 lei</strong> de la 1
        iulie 2026. Amenda se încadrează pe clase (I-IV pentru persoane fizice).
      </p>
      <h2>Puncte de penalizare și suspendare</h2>
      <p>
        Punctele de penalizare sunt separate de amendă și urmăresc riscul de suspendare. La{' '}
        <strong>15 puncte acumulate</strong> se suspendă permisul 30 de zile. Pentru viteză, peste 50
        km/h peste limită intervine suspendarea de 90 de zile, iar peste 70 km/h — 120 de zile.
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă conform OUG 195/2002. Suma exactă în limita clasei și încadrarea o
        stabilește agentul constatator.
      </p>
    </CalculatorLayout>
  );
}
