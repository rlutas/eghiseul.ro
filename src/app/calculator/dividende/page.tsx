import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { DividendeCalculator } from '@/components/calculators/dividende-calculator';

const SLUG = 'dividende';
const TITLE = 'Calculator Dividende 2026 — Impozit 16% și CASS';
const DESCRIPTION =
  'Calculează impozitul pe dividende în 2026: 16% impozit (Legea 141/2025) plus CASS pe plafoane, și află suma netă pe care o încasezi din dividende.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Dividende')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Dividende 2026"
      description="Estimează impozitul pe dividende și suma netă încasată, conform regulilor în vigoare în 2026 (impozit 16% + CASS pe plafoane)."
      widget={<DividendeCalculator />}
      faqs={[
        {
          q: 'Cât este impozitul pe dividende în 2026?',
          a: 'Pentru dividendele distribuite începând cu 1 ianuarie 2026, impozitul este 16% (Legea 141/2025), în creștere față de 10% cât era în 2025. Ce contează este data distribuirii (hotărârea AGA), nu data plății — dividendele distribuite până la 31 decembrie 2025 rămân la 10%.',
        },
        {
          q: 'Se plătește CASS pe dividende?',
          a: 'Da, dacă venitul extra-salarial cumulat (dividende + chirii + dobânzi etc.) depășește 6 salarii minime pe an (24.300 lei în 2026). CASS este în sume fixe pe plafoane: 2.430 lei (peste 6 salarii), 4.860 lei (peste 12) sau 9.720 lei (peste 24 — plafonul maxim), nu 10% din fiecare dividend.',
        },
        {
          q: 'CASS se plătește chiar dacă am deja salariu?',
          a: 'Da. CASS pe venitul din dividende se cumulează — nu se reduce dacă plătești deja CASS din salariu sau pensie. Se declară prin Declarația Unică.',
        },
        {
          q: 'Cum se calculează suma netă din dividende?',
          a: 'Din dividendul brut se scade impozitul de 16% și, dacă e cazul, CASS-ul datorat pe plafon. De exemplu, la 100.000 lei dividende brute: 16.000 lei impozit + 9.720 lei CASS (plafon maxim) = 74.280 lei net.',
        },
      ]}
    >
      <h2>Cum se calculează impozitul pe dividende</h2>
      <p>
        Din 2026, dividendele se impozitează cu <strong>16%</strong> (Legea 141/2025), aplicat la dividendul brut.
        Suplimentar, dacă veniturile tale extra-salariale depășesc anumite plafoane, datorezi și <strong>CASS</strong>{' '}
        (contribuția de sănătate, 10%), calculat nu pe tot venitul, ci pe un plafon fix.
      </p>

      <h2>Plafoanele CASS 2026</h2>
      <ul>
        <li>sub 24.300 lei (6 salarii minime): <strong>0 lei</strong>;</li>
        <li>între 24.300 și 48.600 lei: <strong>2.430 lei</strong>;</li>
        <li>între 48.600 și 97.200 lei: <strong>4.860 lei</strong>;</li>
        <li>peste 97.200 lei (24 salarii minime): <strong>9.720 lei</strong> — plafon maxim.</li>
      </ul>

      <h2>Exemplu de calcul</h2>
      <p>
        La dividende brute de <strong>100.000 lei</strong>: impozit 16% = 16.000 lei; CASS = 9.720 lei (venit peste 24
        de salarii minime). Suma netă încasată = 100.000 − 16.000 − 9.720 = <strong>74.280 lei</strong>.
      </p>

      <p>
        Dacă ai un SRL, vezi și <Link href="/calculator/taxe-srl/">calculatorul de taxe SRL</Link> pentru taxarea totală
        (impozit firmă + dividende), sau obține un{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator ONRC</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. CASS este o obligație anuală personală declarată prin Declarația Unică; pragul exact depinde
        de toate veniturile tale extra-salariale din an.
      </p>
    </CalculatorLayout>
  );
}
