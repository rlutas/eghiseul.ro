import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { IccCalculator } from '@/components/calculators/icc-calculator';

const SLUG = 'calculator-indemnizatie-crestere-copil';
const TITLE = 'Calculator Indemnizație Creștere Copil 2026 (ICC)';
const DESCRIPTION =
  'Calculează indemnizația de creștere a copilului în 2026: 85% din venitul net mediu, între 1.650 ' +
  'și 8.500 lei brut, cu reținerea CASS de 10%.';

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
      heading="Calculator Indemnizație Creștere Copil 2026"
      description="Estimează indemnizația lunară de creștere a copilului (ICC) pe baza venitului net mediu, conform regulilor în vigoare în 2026."
      widget={<IccCalculator />}
      faqs={[
        { q: 'Cât este indemnizația de creștere a copilului în 2026?', a: 'ICC este 85% din venitul net mediu lunar din ultimele 12 luni (din cele 24 dinaintea nașterii), între un minim de 1.650 lei și un maxim de 8.500 lei brut. Din suma brută se reține CASS 10%.' },
        { q: 'Care este indemnizația minimă și maximă?', a: 'Minimul este 1.650 lei brut (2,5 × ISR), iar maximul 8.500 lei brut. După reținerea CASS de 10%, maximul net încasat este 7.650 lei.' },
        { q: 'Se reține ceva din indemnizație?', a: 'Da, din 1 august 2025 se reține CASS 10% din indemnizația brută. Calculatorul afișează atât suma brută, cât și suma netă încasată.' },
        { q: 'Ce este stimulentul de inserție?', a: 'Dacă te întorci la muncă, poți primi stimulentul de inserție în locul ICC: 1.500 lei/lună dacă obții venituri înainte ca bebelușul să împlinească 6 luni, sau 650 lei/lună după.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de creștere a copilului</h2>
      <p>
        Indemnizația lunară este <strong>85% din venitul net mediu</strong> realizat în 12 luni din
        cele 24 dinaintea nașterii. Rezultatul se încadrează între un <strong>minim de 1.650 lei</strong>{' '}
        (2,5 × ISR, unde ISR = 660 lei în 2026) și un <strong>maxim de 8.500 lei</strong> brut.
      </p>
      <p>
        Din 1 august 2025 se reține <strong>CASS 10%</strong> din indemnizația brută, deci suma
        efectiv încasată este cu 10% mai mică (de exemplu, 8.500 lei brut → 7.650 lei net).
      </p>
      <h2>Durata și stimulentul de inserție</h2>
      <p>
        Indemnizația se acordă până când copilul împlinește 2 ani (3 ani pentru copilul cu handicap).
        Dacă te întorci mai devreme la muncă, poți primi <strong>stimulentul de inserție</strong> în
        locul ICC.
      </p>
      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Cuantumul exact se stabilește de autorități pe baza veniturilor declarate.
      </p>
    </CalculatorLayout>
  );
}
