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
      tldr="În 2026, dividendele se impozitează cu 16% (Legea 141/2025). În plus, datorezi CASS în sumă fixă pe plafon (2.430, 4.860 sau 9.720 lei) dacă veniturile extra-salariale depășesc 24.300 lei/an."
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
        {
          q: 'Contează data distribuirii sau data plății dividendelor?',
          a: 'Contează data distribuirii — adică data hotărârii AGA prin care asociații aprobă repartizarea profitului. Dividendele distribuite până la 31 decembrie 2025 rămân la cota de 10%, chiar dacă banii sunt încasați efectiv în 2026. Cele distribuite de la 1 ianuarie 2026 se impozitează cu 16%.',
        },
        {
          q: 'CASS de pe dividende este deductibil sau îl recuperez?',
          a: 'Nu. CASS pe veniturile extra-salariale este o contribuție în sumă fixă pe plafon, nu un avans din care se face regularizare. O plătești ca obligație personală prin Declarația Unică și nu se scade din impozitul pe dividende de 16% și nici nu se restituie.',
        },
        {
          q: 'Plătesc CASS dacă scot dividende dintr-un singur SRL, dar am și chirii?',
          a: 'Da. Plafonul CASS se aplică la totalul veniturilor extra-salariale dintr-un an: dividende + chirii + dobânzi + alte venituri. Dacă suma cumulată depășește 24.300 lei (6 salarii minime în 2026), datorezi CASS pe plafonul corespunzător, indiferent din câte surse provin veniturile.',
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

      <h2>Exemplu pas cu pas: dividende mai mici</h2>
      <p>
        Să presupunem că distribui <strong>30.000 lei</strong> dividende brute în 2026, fără alte venituri
        extra-salariale. Calculul se face în doi pași:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — impozitul pe dividende:</strong> 16% × 30.000 lei = <strong>4.800 lei</strong>.
        </li>
        <li>
          <strong>Pasul 2 — CASS:</strong> venitul de 30.000 lei depășește pragul de 24.300 lei (6 salarii minime), dar
          nu și pragul de 48.600 lei, deci datorezi CASS pe primul plafon: <strong>2.430 lei</strong>.
        </li>
        <li>
          <strong>Suma netă încasată:</strong> 30.000 − 4.800 − 2.430 = <strong>22.770 lei</strong>.
        </li>
      </ul>
      <p>
        Observă efectul de prag: chiar dacă depășești cu un singur leu plafonul de 24.300 lei, datorezi CASS-ul complet
        de 2.430 lei pe acel plafon. De aceea, la venituri apropiate de un prag, suma netă pe care o încasezi efectiv
        poate scădea peste prag.
      </p>

      <h2>Tabel comparativ: brut vs. net pe plafoane</h2>
      <table>
        <thead>
          <tr>
            <th>Dividend brut</th>
            <th>Impozit 16%</th>
            <th>CASS</th>
            <th>Net încasat</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>20.000 lei</td>
            <td>3.200 lei</td>
            <td>0 lei</td>
            <td>16.800 lei</td>
          </tr>
          <tr>
            <td>30.000 lei</td>
            <td>4.800 lei</td>
            <td>2.430 lei</td>
            <td>22.770 lei</td>
          </tr>
          <tr>
            <td>60.000 lei</td>
            <td>9.600 lei</td>
            <td>4.860 lei</td>
            <td>45.540 lei</td>
          </tr>
          <tr>
            <td>100.000 lei</td>
            <td>16.000 lei</td>
            <td>9.720 lei</td>
            <td>74.280 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Cifrele de mai sus presupun că dividendele sunt singurul venit extra-salarial din an. Dacă mai ai chirii,
        dobânzi sau alte venituri, acestea se cumulează la stabilirea plafonului CASS.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Confuzia cotelor:</strong> din 2026 impozitul este 16%, nu 10% ca în 2025. Aplicarea cotei vechi duce
          la o sumă netă supraestimată.
        </li>
        <li>
          <strong>Calcularea CASS ca procent:</strong> CASS pe dividende nu este 10% din fiecare dividend, ci o sumă
          fixă pe plafon (2.430, 4.860 sau 9.720 lei).
        </li>
        <li>
          <strong>Ignorarea celorlalte venituri:</strong> dacă scoți dividende din mai multe firme sau ai și chirii,
          toate se cumulează pentru plafonul CASS.
        </li>
        <li>
          <strong>Presupunerea că salariul scutește de CASS:</strong> CASS pe venitul din dividende se datorează
          separat, chiar dacă plătești deja CASS din salariu sau pensie.
        </li>
      </ul>

      <p>
        Ai nevoie să verifici cine sunt asociații sau cât profit poate fi distribuit? Poți consulta{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu brut-net</Link> pentru a compara cum te
        avantajează salariul față de dividende, sau obține rapid un{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator</Link> cu situația firmei.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. CASS este o obligație anuală personală declarată prin Declarația Unică; pragul exact depinde
        de toate veniturile tale extra-salariale din an.
      </p>
    </CalculatorLayout>
  );
}
