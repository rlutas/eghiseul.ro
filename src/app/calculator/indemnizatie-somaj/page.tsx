import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SomajCalculator } from '@/components/calculators/somaj-calculator';

const SLUG = 'indemnizatie-somaj';
const TITLE = 'Calculator Indemnizație de Șomaj 2026';
const DESCRIPTION =
  'Calculează indemnizația de șomaj în 2026: baza de 75% din ISR plus un supliment în funcție de ' +
  'stagiul de cotizare, cu reținerea CASS de 10% și durata de acordare.';

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
      heading="Calculator Indemnizație de Șomaj 2026"
      description="Estimează indemnizația de șomaj lunară și durata de acordare, în funcție de stagiul de cotizare și de salariul mediu."
      widget={<SomajCalculator />}
      faqs={[
        { q: 'Cât este indemnizația de șomaj în 2026?', a: 'Baza este 75% din ISR (660 lei) = 495 lei, la care se adaugă un procent din salariul mediu brut din ultimele 12 luni, în funcție de vechime: +3% (peste 3 ani), +5% (peste 5), +7% (peste 10), +10% (peste 20). Din indemnizație se reține CASS 10%.' },
        { q: 'Cât timp se acordă șomajul?', a: 'Durata depinde de stagiul de cotizare: 6 luni (1-5 ani), 9 luni (5-10 ani), 12 luni (peste 10 ani).' },
        { q: 'Se reține ceva din indemnizația de șomaj?', a: 'Da, din 1 august 2025 se reține CASS 10% din indemnizația de șomaj.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de șomaj</h2>
      <p>
        Indemnizația = <strong>495 lei (75% × ISR)</strong> + un procent din salariul mediu brut al
        ultimelor 12 luni, stabilit după stagiul de cotizare. Din suma brută se reține{' '}
        <strong>CASS 10%</strong> (din august 2025).
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă conform Legii 76/2002. Absolvenții au un regim separat. Cuantumul exact se
        stabilește de ANOFM.
      </p>
    </CalculatorLayout>
  );
}
