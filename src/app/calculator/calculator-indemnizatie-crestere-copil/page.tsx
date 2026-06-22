import Link from 'next/link';
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
  ogImage: `/api/og/calculator?title=${encodeURIComponent(TITLE)}`,
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
        { q: 'Câte luni de venituri se iau în calcul?', a: 'Se folosesc 12 luni de venituri din cele 24 de luni dinaintea nașterii. Pentru aceste 12 luni se calculează venitul net mediu lunar, iar indemnizația este 85% din această medie.' },
        { q: 'Cât primește efectiv o persoană cu venitul net mediu de 4.000 lei?', a: 'Indemnizația brută este 85% × 4.000 = 3.400 lei. Suma se află între minim (1.650 lei) și maxim (8.500 lei), deci rămâne 3.400 lei brut. După reținerea CASS de 10% (340 lei), încasezi aproximativ 3.060 lei net pe lună.' },
        { q: 'Indemnizația de creștere a copilului se cumulează cu alocația de stat?', a: 'Da. Alocația de stat pentru copii este un drept separat și se acordă în plus față de indemnizația de creștere a copilului sau față de stimulentul de inserție.' },
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
      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem un venit net mediu lunar de <strong>5.000 lei</strong> în cele 12 luni luate în
        calcul. Pașii sunt:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — indemnizația brută:</strong> 85% × 5.000 = <strong>4.250 lei</strong>.
        </li>
        <li>
          <strong>Pasul 2 — încadrarea în limite:</strong> 4.250 lei se află între minimul de 1.650 lei
          și maximul de 8.500 lei, deci rămâne 4.250 lei brut.
        </li>
        <li>
          <strong>Pasul 3 — reținerea CASS 10%:</strong> 10% × 4.250 = 425 lei.
        </li>
        <li>
          <strong>Pasul 4 — suma netă încasată:</strong> 4.250 − 425 = <strong>3.825 lei pe lună</strong>.
        </li>
      </ul>
      <p>
        Dacă venitul net mediu ar fi fost foarte mare (de exemplu 12.000 lei), indemnizația brută s-ar
        plafona la <strong>8.500 lei</strong>, iar net ai încasa 7.650 lei. Dacă media netă ar fi sub
        circa 1.941 lei, indemnizația brută s-ar ridica la minimul de 1.650 lei.
      </p>

      <h2>Tabel orientativ: brut, CASS și net încasat</h2>
      <p>
        Tabelul de mai jos arată câteva scenarii frecvente. Coloana „brut” reprezintă 85% din venitul
        net mediu (încadrat între 1.650 și 8.500 lei), iar „net încasat” este suma rămasă după CASS 10%.
      </p>
      <table>
        <thead>
          <tr>
            <th>Venit net mediu</th>
            <th>Indemnizație brută (85%)</th>
            <th>CASS 10%</th>
            <th>Net încasat</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.941 lei sau mai puțin</td>
            <td>1.650 lei (minim)</td>
            <td>165 lei</td>
            <td>1.485 lei</td>
          </tr>
          <tr>
            <td>3.000 lei</td>
            <td>2.550 lei</td>
            <td>255 lei</td>
            <td>2.295 lei</td>
          </tr>
          <tr>
            <td>5.000 lei</td>
            <td>4.250 lei</td>
            <td>425 lei</td>
            <td>3.825 lei</td>
          </tr>
          <tr>
            <td>10.000 lei sau mai mult</td>
            <td>8.500 lei (maxim)</td>
            <td>850 lei</td>
            <td>7.650 lei</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente la calcul</h2>
      <ul>
        <li>
          <strong>Confuzia brut–net.</strong> Indemnizația minimă și maximă (1.650 / 8.500 lei) sunt
          exprimate în sume brute. Din ele se reține CASS 10%, deci ce primești efectiv este mai puțin.
        </li>
        <li>
          <strong>Folosirea venitului brut în loc de net.</strong> Cei 85% se aplică la media venitului
          <strong> net</strong>, nu la salariul brut din contract.
        </li>
        <li>
          <strong>Ignorarea plafonului maxim.</strong> Indiferent cât de mare e venitul, indemnizația
          brută nu poate depăși 8.500 lei.
        </li>
        <li>
          <strong>Numărarea greșită a lunilor.</strong> Se iau 12 luni cu venituri din intervalul de 24
          de luni dinaintea nașterii, nu neapărat ultimele 12 luni consecutive.
        </li>
      </ul>

      <p>
        Dacă pregătești dosarul pentru indemnizație sau pentru reluarea activității, ai putea avea nevoie
        și de un{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar online</Link> sau de o estimare a{' '}
        <Link href="/calculator/salariu/">salariului net din salariul brut</Link> pentru perioada de după
        revenirea la muncă.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Cuantumul exact se stabilește de autorități pe baza veniturilor declarate,
        iar pragurile minim și maxim pot fi actualizate prin modificări legislative.
      </p>
    </CalculatorLayout>
  );
}
