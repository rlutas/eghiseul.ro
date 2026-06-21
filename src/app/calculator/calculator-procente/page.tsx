import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ProcenteCalculator } from '@/components/calculators/procente-calculator';

const SLUG = 'calculator-procente';
const TITLE = 'Calculator Procente Online — Cât e X% din Y';
const DESCRIPTION =
  "Calculator de procente online: cât e X% din Y, cât la sută reprezintă un număr din altul și variația procentuală. Gratuit.";

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
      heading="Calculator Procente"
      description="Calculează rapid procente: X% dintr-o valoare, cât la sută reprezintă un număr din altul sau variația procentuală dintre două valori."
      widget={<ProcenteCalculator />}
      faqs={[
        { q: 'Cum calculez X% dintr-o valoare?', a: 'Înmulțești valoarea cu procentul împărțit la 100. De exemplu, 20% din 250 = 250 × 20 / 100 = 50. În calculatorul de mai sus alege modul „X% din Y".' },
        { q: 'Cum aflu cât la sută reprezintă un număr din altul?', a: 'Împarți numărul la total și înmulțești cu 100. De exemplu, 50 din 250 = 50 / 250 × 100 = 20%. Alege modul „Cât % e X din Y".' },
        { q: 'Cum calculez creșterea sau scăderea procentuală?', a: 'Scazi valoarea inițială din cea finală, împarți la valoarea inițială și înmulțești cu 100. Un rezultat negativ înseamnă scădere.' },
      ]}
    >
      <h2>Cum funcționează calculatorul de procente</h2>
      <p>
        Procentul este o fracție raportată la 100. Calculatorul de mai sus acoperă cele trei
        situații cele mai întâlnite, fără să fie nevoie să ții minte formulele.
      </p>
      <h3>1. Cât este X% dintr-o valoare</h3>
      <p>
        Formula: <strong>rezultat = valoare × procent / 100</strong>. Util la reduceri, dobânzi,
        comisioane sau TVA.
      </p>
      <h3>2. Cât la sută reprezintă X din Y</h3>
      <p>
        Formula: <strong>procent = X / Y × 100</strong>. Util ca să afli ponderea unei sume într-un
        total.
      </p>
      <h3>3. Creșterea sau scăderea procentuală</h3>
      <p>
        Formula: <strong>variație = (final − inițial) / inițial × 100</strong>. Pozitiv = creștere,
        negativ = scădere.
      </p>
    </CalculatorLayout>
  );
}
