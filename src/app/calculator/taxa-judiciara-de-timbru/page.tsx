import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TaxaTimbruCalculator } from '@/components/calculators/taxa-timbru-calculator';

const SLUG = 'taxa-judiciara-de-timbru';
const TITLE = 'Calculator Taxă Judiciară de Timbru 2026 (OUG 80/2013)';
const DESCRIPTION =
  "Calculează taxa judiciară de timbru pe tranșe (OUG 80/2013) plus taxele fixe frecvente: divorț, apel, ordonanță președințială.";

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
      heading="Calculator Taxă Judiciară de Timbru"
      description="Estimează taxa judiciară de timbru pentru o cerere evaluabilă în bani, conform tranșelor din OUG 80/2013, plus taxele fixe cele mai întâlnite."
      widget={<TaxaTimbruCalculator />}
      faqs={[
        { q: 'Cum se calculează taxa de timbru pentru o cerere evaluabilă în bani?', a: 'Se aplică tranșe progresive (Art. 3 OUG 80/2013): de exemplu, pentru 100.000 lei taxa este 2.105 lei + 2% din suma ce depășește 50.000 lei = 3.105 lei.' },
        { q: 'Cât este taxa de timbru pentru divorț?', a: 'Divorțul prin acord sau din culpă se timbrează cu 200 lei; cel din motive de sănătate cu 50 lei. Cererile accesorii (locuința copilului, autoritatea părintească) — 20 lei fiecare.' },
        { q: 'Se indexează taxa de timbru cu inflația?', a: 'Nu. Sumele din OUG 80/2013 sunt nominale și nu se indexează. Ultima modificare cu impact asupra valorilor a fost Legea 268/2024.' },
      ]}
    >
      <h2>Cum se calculează taxa judiciară de timbru</h2>
      <p>
        Pentru <strong>cererile evaluabile în bani</strong>, taxa se calculează pe tranșe progresive,
        conform Art. 3 din OUG 80/2013:
      </p>
      <ul>
        <li>până la 500 lei: 8% (minimum 20 lei);</li>
        <li>501–5.000 lei: 40 lei + 7% peste 500;</li>
        <li>5.001–25.000 lei: 355 lei + 5% peste 5.000;</li>
        <li>25.001–50.000 lei: 1.355 lei + 3% peste 25.000;</li>
        <li>50.001–250.000 lei: 2.105 lei + 2% peste 50.000;</li>
        <li>peste 250.000 lei: 6.105 lei + 1% peste 250.000.</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valori orientative conform OUG 80/2013 (text consolidat 2026). Pentru încadrarea exactă a
        cererii tale, consultă un avocat.
      </p>
    </CalculatorLayout>
  );
}
