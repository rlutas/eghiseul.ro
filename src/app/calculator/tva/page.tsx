import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TvaCalculator } from '@/components/calculators/tva-calculator';

const SLUG = 'tva';
const TITLE = 'Calculator TVA 2026 — Adaugă sau Extrage TVA (21%)';
const DESCRIPTION =
  "Calculator TVA 2026: adaugă sau extrage TVA cu cota standard 21% și cota redusă 11%. Rapid, online, fără instalare.";

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
      heading="Calculator TVA 2026"
      description="Adaugă sau extrage TVA rapid, cu cotele valabile în 2026: 21% standard, 11% redus și 9% tranzitoriu pentru locuințe."
      widget={<TvaCalculator />}
      faqs={[
        { q: 'Cât este TVA standard în România în 2026?', a: 'Cota standard de TVA este 21% (majorată de la 19% începând cu 1 august 2025). Cota redusă este 11% (a înlocuit fostele cote de 5% și 9%).' },
        { q: 'Cum extrag TVA dintr-un preț care include TVA?', a: 'Împarți prețul cu TVA la (1 + cota/100). Pentru 21%: net = preț / 1,21, iar TVA = preț − net (sau preț × 21/121). Calculatorul de mai sus o face automat.' },
        { q: 'Mai există cota de 9%?', a: 'Doar tranzitoriu, pentru livrarea de locuințe care îndeplinesc condițiile legale, până la 31 iulie 2026. În rest, cota redusă este 11%.' },
        { q: 'Ce factor folosesc ca să scot rapid TVA-ul dintr-un preț de 121 lei cu TVA 21%?', a: 'Înmulțești prețul cu factorul 21/121 ≈ 0,17355. Pentru 121 lei: 121 × 21 / 121 = 21 lei TVA, iar baza fără TVA este 100 lei. Pentru cota redusă 11% factorul este 11/111.' },
        { q: 'TVA se calculează la prețul cu sau fără TVA?', a: 'TVA se aplică întotdeauna la baza fără TVA (prețul net). Dacă ai doar prețul final cu TVA, mai întâi extragi baza (preț / 1,21 la cota standard), apoi TVA-ul este diferența. A aplica direct 21% pe prețul care include deja TVA este o greșeală frecventă care umflă rezultatul.' },
        { q: 'Cota de TVA depinde de produs sau de serviciu?', a: 'Da. Majoritatea bunurilor și serviciilor au cota standard 21%. Cota redusă 11% se aplică la categorii precum alimente, medicamente, apă, cărți, manuale, cazare hotelieră și altele prevăzute expres în Codul Fiscal. Încadrarea corectă o stabilește Codul Fiscal sau contabilul tău.' },
      ]}
    >
      <h2>Cotele de TVA în România în 2026</h2>
      <p>
        De la 1 august 2025 (Legea 141/2025), cota <strong>standard de TVA este 21%</strong>, iar cota
        <strong> redusă este 11%</strong> (a unificat fostele cote de 5% și 9%). O cotă de{' '}
        <strong>9%</strong> rămâne aplicabilă tranzitoriu pentru livrarea de locuințe care îndeplinesc
        condițiile legale, până la 31 iulie 2026.
      </p>
      <h2>Cum se calculează TVA</h2>
      <p>
        <strong>Adăugare</strong> (de la preț fără TVA): TVA = sumă × cotă / 100; preț cu TVA = sumă +
        TVA.
      </p>
      <p>
        <strong>Extragere</strong> (din preț cu TVA): preț fără TVA = sumă / (1 + cotă/100); TVA = sumă
        − preț fără TVA. Pentru 21%, TVA = sumă × 21 / 121.
      </p>
      <h2>Cotele de TVA pe scurt (2026)</h2>
      <table>
        <thead>
          <tr>
            <th>Cotă</th>
            <th>Când se aplică</th>
            <th>Factor de extragere</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>21%</strong> (standard)</td>
            <td>Majoritatea bunurilor și serviciilor</td>
            <td>21 / 121 ≈ 0,17355</td>
          </tr>
          <tr>
            <td><strong>11%</strong> (redusă)</td>
            <td>Alimente, medicamente, apă, cărți, manuale, cazare etc.</td>
            <td>11 / 111 ≈ 0,09910</td>
          </tr>
          <tr>
            <td><strong>9%</strong> (tranzitorie)</td>
            <td>Locuințe eligibile, numai până la 31 iulie 2026</td>
            <td>9 / 109 ≈ 0,08257</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Încadrarea pe cota redusă depinde de categoria exactă a produsului sau serviciului și de
        condițiile din Codul Fiscal. Valorile din tabel sunt orientative.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Presupunem un produs cu <strong>preț fără TVA de 1.000 lei</strong> și cota standard de
        <strong> 21%</strong>:
      </p>
      <ul>
        <li><strong>Pasul 1 — TVA:</strong> 1.000 × 21 / 100 = <strong>210 lei</strong>.</li>
        <li><strong>Pasul 2 — preț cu TVA:</strong> 1.000 + 210 = <strong>1.210 lei</strong>.</li>
      </ul>
      <p>
        Invers, dacă pleci de la <strong>prețul cu TVA de 1.210 lei</strong> și vrei să afli baza și
        TVA-ul:
      </p>
      <ul>
        <li><strong>Pasul 1 — baza fără TVA:</strong> 1.210 / 1,21 = <strong>1.000 lei</strong>.</li>
        <li>
          <strong>Pasul 2 — TVA:</strong> 1.210 − 1.000 = <strong>210 lei</strong> (echivalent cu
          1.210 × 21 / 121).
        </li>
      </ul>

      <h2>Greșeli frecvente la calculul TVA</h2>
      <ul>
        <li>
          <strong>Aplici cota direct pe prețul cu TVA.</strong> 1.210 × 21% = 254,1 lei este greșit;
          pentru extragere folosește factorul 21/121, nu 21/100.
        </li>
        <li>
          <strong>Folosești cote vechi.</strong> Din 1 august 2025 standardul este 21% (nu 19%), iar
          redusa este 11% (nu 5% sau 9%).
        </li>
        <li>
          <strong>Confunzi cota redusă cu cea tranzitorie de 9%.</strong> Cei 9% rămân doar pentru
          locuințe eligibile, până la 31 iulie 2026; pentru restul categoriilor reduse se folosește 11%.
        </li>
        <li>
          <strong>Rotunjești prea devreme.</strong> Calculează TVA-ul pe suma exactă și rotunjește
          doar rezultatul final, pentru a evita diferențe de bani pe facturi cu multe linii.
        </li>
      </ul>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Pentru încadrarea corectă a cotei pe produsul/serviciul tău,
        consultă Codul Fiscal sau un contabil. Vezi și{' '}
        <Link href="/calculator/calculator-procente/">calculatorul de procente</Link> sau{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net/brut</Link>.
      </p>
    </CalculatorLayout>
  );
}
