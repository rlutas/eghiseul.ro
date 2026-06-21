import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PenalitatiAnafCalculator } from '@/components/calculators/penalitati-anaf-calculator';

const SLUG = 'penalitati-anaf';
const TITLE = 'Calculator Penalități și Dobânzi ANAF — Întârziere la Plată';
const DESCRIPTION =
  'Calculează dobânda (0,02%/zi) și penalitățile de întârziere (0,01%/zi) sau de nedeclarare ' +
  '(0,08%/zi) pentru obligațiile fiscale plătite cu întârziere, conform Codului de procedură fiscală.';

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
      heading="Calculator Penalități și Dobânzi ANAF"
      description="Estimează accesoriile (dobândă + penalități) pentru o obligație fiscală plătită cu întârziere, conform Codului de procedură fiscală."
      widget={<PenalitatiAnafCalculator />}
      faqs={[
        { q: 'Cât este dobânda de întârziere la ANAF?', a: 'Dobânda de întârziere este 0,02% pe zi (aproximativ 7,3% pe an), conform art. 174 din Codul de procedură fiscală. Se aplică în toate cazurile de plată cu întârziere.' },
        { q: 'Care e diferența între penalitatea de întârziere și cea de nedeclarare?', a: 'Penalitatea de întârziere (0,01%/zi) se aplică sumelor declarate dar neplătite. Penalitatea de nedeclarare (0,08%/zi) se aplică sumelor descoperite de ANAF la control (nedeclarate) și nu se cumulează cu cea de întârziere pe aceeași sumă.' },
        { q: 'Se poate reduce penalitatea de nedeclarare?', a: 'Da, cu 75% dacă debitul stabilit se achită în termen sau se eșalonează. Penalitatea de nedeclarare nu poate depăși valoarea debitului.' },
      ]}
    >
      <h2>Cum se calculează penalitățile ANAF</h2>
      <p>
        Pentru o obligație fiscală plătită cu întârziere se datorează <strong>accesorii</strong>,
        calculate pe zile de întârziere (de la scadență până la data plății):
      </p>
      <ul>
        <li><strong>dobândă de întârziere: 0,02%/zi</strong> (se aplică mereu);</li>
        <li><strong>penalitate de întârziere: 0,01%/zi</strong> — pentru sume declarate dar neplătite;</li>
        <li><strong>penalitate de nedeclarare: 0,08%/zi</strong> — pentru sume nedeclarate, descoperite la control (în loc de cea de întârziere).</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Estimare orientativă conform Legii 207/2015. Pentru cuantumul exact, consultă decizia de
        impunere sau un contabil.
      </p>
    </CalculatorLayout>
  );
}
