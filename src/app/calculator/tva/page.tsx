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
  ogImage: `/api/og/calculator?title=${encodeURIComponent(TITLE)}`,
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
        { q: 'De la ce plafon devin plătitor de TVA?', a: 'Pragul de scutire pentru întreprinderi mici este de 395.000 lei cifră de afaceri anuală. Sub acest plafon poți rămâne neplătitor de TVA și nu adaugi TVA pe facturi. Dacă depășești plafonul, ai obligația să te înregistrezi în scopuri de TVA și să aplici cota corespunzătoare (de regulă 21%) pe vânzări.' },
        { q: 'Ce diferență e între plătitor și neplătitor de TVA pe factură?', a: 'Un neplătitor de TVA emite facturi fără TVA: clientul plătește exact valoarea netă, fără cei 21% adăugați, dar firma nu își poate deduce TVA-ul de la furnizori. Un plătitor adaugă TVA pe facturi (de exemplu 1.000 lei × 1,21 = 1.210 lei) și poate deduce TVA-ul plătit la achiziții, virând la stat doar diferența.' },
        { q: 'Cum calculez prețul cu TVA dacă vând în 2026 cu cota standard?', a: 'Înmulțești prețul net cu 1,21. De exemplu, un serviciu de 500 lei fără TVA devine 500 × 1,21 = 605 lei cu TVA, din care 105 lei reprezintă TVA-ul colectat de 21%.' },
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

      <h2>Plătitor vs. neplătitor de TVA: plafonul de 395.000 lei</h2>
      <p>
        Nu orice firmă adaugă TVA pe facturi. Întreprinderile mici beneficiază de un regim special de
        scutire cât timp cifra de afaceri anuală rămâne sub <strong>plafonul de 395.000 lei</strong>. Sub
        acest prag rămâi <strong>neplătitor de TVA</strong>: emiți facturi fără TVA, iar clientul achită
        exact valoarea netă, însă nu poți deduce TVA-ul plătit furnizorilor tăi.
      </p>
      <p>
        Dacă depășești 395.000 lei, ai obligația să te înregistrezi în scopuri de TVA și să devii
        <strong> plătitor</strong>. De atunci adaugi TVA pe vânzări — de regulă cota standard, deci
        înmulțești prețul net cu <strong>×1,21</strong> — și colectezi acel TVA pentru stat. În schimb,
        poți deduce TVA-ul achitat la achiziții, astfel încât virezi efectiv doar diferența dintre TVA-ul
        colectat și cel deductibil.
      </p>
      <table>
        <thead>
          <tr>
            <th>Aspect</th>
            <th>Neplătitor de TVA</th>
            <th>Plătitor de TVA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cifră de afaceri</td>
            <td>sub 395.000 lei</td>
            <td>peste 395.000 lei (sau opțional)</td>
          </tr>
          <tr>
            <td>TVA pe factură</td>
            <td>fără TVA</td>
            <td>cu TVA (de regulă 21%)</td>
          </tr>
          <tr>
            <td>Preț de 1.000 lei net</td>
            <td>1.000 lei</td>
            <td>1.000 × 1,21 = 1.210 lei</td>
          </tr>
          <tr>
            <td>Deducere TVA achiziții</td>
            <td>nu</td>
            <td>da</td>
          </tr>
        </tbody>
      </table>

      <h2>Cazuri speciale și TVA tranzitoriu de 9%</h2>
      <p>
        Cota de <strong>9%</strong> nu mai este o cotă redusă generală, ci o măsură tranzitorie strict
        limitată. Ea se aplică doar la <strong>livrarea de locuințe</strong> care îndeplinesc condițiile
        legale și numai până la <strong>31 iulie 2026</strong>. După această dată, dacă măsura nu este
        prelungită, livrările respective intră pe regimul standard.
      </p>
      <ul>
        <li>
          <strong>Locuințe eligibile (până la 31 iulie 2026):</strong> 9% — factor de extragere 9/109.
        </li>
        <li>
          <strong>Categorii reduse (alimente, medicamente, apă, cărți, manuale, cazare):</strong> 11% —
          factor de extragere 11/111.
        </li>
        <li>
          <strong>Restul bunurilor și serviciilor:</strong> 21% — factor de extragere 21/121.
        </li>
      </ul>
      <p>
        Pentru o locuință de <strong>200.000 lei fără TVA</strong> încadrată pe cota tranzitorie de 9%,
        TVA-ul este 200.000 × 9 / 100 = <strong>18.000 lei</strong>, iar prețul final cu TVA ajunge la
        <strong> 218.000 lei</strong>. Aceeași locuință la cota standard de 21% ar avea 42.000 lei TVA,
        deci 242.000 lei — de aici importanța încadrării corecte și a termenului-limită.
      </p>

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

      <h2>Context legal: de ce s-au schimbat cotele în 2026</h2>
      <p>
        Cotele aplicabile în 2026 provin din modificarea adusă de <strong>Legea 141/2025</strong>, care
        a majorat cota standard de la 19% la <strong>21%</strong> începând cu <strong>1 august 2025</strong>
        {' '}și a unificat fostele cote reduse de 5% și 9% într-o singură cotă redusă de <strong>11%</strong>.
        Singura excepție rămasă este cota tranzitorie de <strong>9%</strong> pentru locuințe eligibile,
        valabilă până la <strong>31 iulie 2026</strong>.
      </p>
      <p>
        În practică, asta înseamnă că documentele și ofertele întocmite înainte de august 2025 pot conține
        cote vechi. Când recalculezi un preț azi, folosește <strong>21%</strong> pentru regimul standard
        (adăugare ×1,21, extragere cu factorul 21/121) și <strong>11%</strong> pentru categoriile reduse.
        Verifică întotdeauna data tranzacției, pentru că momentul faptului generator stabilește cota
        aplicabilă, nu data la care emiți factura.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Pentru încadrarea corectă a cotei pe produsul/serviciul tău,
        consultă Codul Fiscal sau un contabil. Vezi și{' '}
        <Link href="/calculator/calculator-procente/">calculatorul de procente</Link>,{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net/brut</Link> sau verifică online{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazierul fiscal al firmei</Link>.
      </p>
    </CalculatorLayout>
  );
}
