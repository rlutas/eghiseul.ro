import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SalariuCalculator } from '@/components/calculators/salariu-calculator';

const SLUG = 'salariu';
const TITLE = 'Calculator Salariu Net/Brut 2026 — Din Brut în Net';
const DESCRIPTION =
  "Calculator salariu 2026: convertești brut în net și invers (CAS, CASS, impozit, deducere personală) plus costul angajatorului.";

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
      heading="Calculator Salariu Net/Brut 2026"
      description="Calculează salariul net din brut (sau invers) cu ratele valabile în 2026 — CAS, CASS, impozit și deducerea personală — plus costul total pentru angajator."
      widget={<SalariuCalculator />}
      faqs={[
        { q: 'Ce rețineri se aplică la salariu în 2026?', a: 'Din salariul brut se rețin: CAS (pensie) 25%, CASS (sănătate) 10% și impozit pe venit 10% (după scăderea contribuțiilor și a deducerii personale). Angajatorul plătește în plus CAM 2,25%.' },
        { q: 'Cât e salariul minim brut în 2026?', a: 'Salariul minim brut este 4.050 lei în perioada ianuarie–iunie 2026 și crește la 4.325 lei de la 1 iulie 2026. Calculatorul ține cont de perioada selectată.' },
        { q: 'Ce este deducerea personală?', a: 'O sumă scutită de impozit, acordată dacă salariul brut nu depășește salariul minim + 2.000 lei. Depinde de numărul de persoane în întreținere și scade treptat pe măsură ce salariul crește.' },
        { q: 'Mai există scutirea de impozit pentru IT?', a: 'Nu. Facilitățile sectoriale (IT, construcții, agricultură) au fost eliminate din 2025. În 2026 toți angajații se calculează cu aceleași rate: 25% / 10% / 10%.' },
        { q: 'Cât costă angajatorul un salariat în 2026?', a: 'Costul total = salariul brut + CAM 2,25%. Pentru un brut de 5.000 lei, angajatorul plătește 5.000 + 112,50 = 5.112,50 lei pe lună. Restul contribuțiilor (CAS, CASS, impozit) se rețin din brutul angajatului, nu se adaugă peste el.' },
        { q: 'Cât e salariul net la salariul minim în 2026?', a: 'La salariul minim de 4.050 lei brut (ianuarie–iunie 2026), cu scutirea de impozit de 300 lei și deducerea personală aplicate, rețineri pentru o persoană fără întreținuți: CAS 938 lei, CASS 375 lei, impozit 163 lei, rezultând un net de aproximativ 2.574 lei. Valoarea este orientativă.' },
        { q: 'De ce diferă netul meu de cel calculat aici?', a: 'Calculatorul folosește cazul standard (un singur loc de muncă, fără rețineri suplimentare). Netul real poate diferi din cauza popririlor, a sindicatului, a tichetelor de masă, a pensiilor private (Pilon III) sau a mai multor surse de venit. Pentru aceste situații consultă fluturașul de salariu sau un contabil.' },
      ]}
    >
      <h2>Cum se calculează salariul net din brut în 2026</h2>
      <p>Din salariul brut se scad, în ordine:</p>
      <ul>
        <li><strong>CAS (contribuția la pensie): 25%</strong> din brut;</li>
        <li><strong>CASS (contribuția la sănătate): 10%</strong> din brut;</li>
        <li><strong>impozit pe venit: 10%</strong>, aplicat după scăderea CAS, CASS și a deducerii personale.</li>
      </ul>
      <p>
        <strong>Salariul net = brut − CAS − CASS − impozit.</strong> Angajatorul mai plătește, peste
        brut, contribuția asiguratorie pentru muncă (CAM) de 2,25%.
      </p>
      <h2>Salariul minim și deducerea personală</h2>
      <p>
        Salariul minim brut este <strong>4.050 lei</strong> (ianuarie–iunie 2026) și{' '}
        <strong>4.325 lei</strong> de la 1 iulie 2026. La salariul minim cu normă întreagă se aplică o
        scutire de impozit. Deducerea personală se acordă dacă brutul nu depășește salariul minim +
        2.000 lei și depinde de numărul de persoane în întreținere.
      </p>
      <h2>Exemplu numeric: din 5.000 lei brut în net</h2>
      <p>
        Să presupunem un salariu de <strong>5.000 lei brut</strong> în prima jumătate a anului 2026,
        pentru o persoană fără întreținuți. Deoarece brutul depășește pragul de scutire (salariul
        minim + 250 lei), nu se aplică scutirea de impozit și nici deducerea personală. Calculul pas
        cu pas:
      </p>
      <ul>
        <li><strong>CAS 25%:</strong> 5.000 × 25% = <strong>1.250 lei</strong>;</li>
        <li><strong>CASS 10%:</strong> 5.000 × 10% = <strong>500 lei</strong>;</li>
        <li>
          <strong>baza impozabilă:</strong> 5.000 − 1.250 − 500 = 3.250 lei;
        </li>
        <li><strong>impozit 10%:</strong> 3.250 × 10% = <strong>325 lei</strong>;</li>
        <li>
          <strong>salariu net:</strong> 5.000 − 1.250 − 500 − 325 = <strong>2.925 lei</strong>.
        </li>
      </ul>
      <p>
        Peste cei 5.000 lei brut, angajatorul mai plătește <strong>CAM 2,25%</strong> = 112,50 lei,
        deci costul total al angajatului este de <strong>5.112,50 lei</strong> pe lună. Pentru orice
        alt salariu, folosește calculatorul de mai sus — face automat și conversia inversă, din net în
        brut.
      </p>

      <h2>Tabel: ce se reține și cine plătește</h2>
      <table>
        <thead>
          <tr>
            <th>Contribuție</th>
            <th>Cotă</th>
            <th>Cine plătește</th>
            <th>Baza de calcul</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CAS (pensie)</td>
            <td>25%</td>
            <td>Angajat (reținut din brut)</td>
            <td>Salariul brut</td>
          </tr>
          <tr>
            <td>CASS (sănătate)</td>
            <td>10%</td>
            <td>Angajat (reținut din brut)</td>
            <td>Salariul brut</td>
          </tr>
          <tr>
            <td>Impozit pe venit</td>
            <td>10%</td>
            <td>Angajat (reținut din brut)</td>
            <td>Brut − CAS − CASS − deducere</td>
          </tr>
          <tr>
            <td>CAM (asiguratorie pentru muncă)</td>
            <td>2,25%</td>
            <td>Angajator (peste brut)</td>
            <td>Salariul brut</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Cotele sunt cele standard din 2026. Sumele rezultate sunt orientative și pot varia când se
        aplică praguri de scutire sau deduceri personale.
      </p>

      <h2>Deducerea personală pe tranșe (salariu minim)</h2>
      <p>
        Deducerea personală de bază se calculează ca procent din salariul minim și depinde de numărul
        de persoane în întreținere. Se acordă integral doar la salariul minim și scade cu 0,5 puncte
        procentuale la fiecare 50 de lei peste minim, până se anulează:
      </p>
      <ul>
        <li><strong>0 persoane în întreținere:</strong> 20% din salariul minim;</li>
        <li><strong>1 persoană:</strong> 25%;</li>
        <li><strong>2 persoane:</strong> 30%;</li>
        <li><strong>3 persoane:</strong> 35%;</li>
        <li><strong>4 sau mai multe persoane:</strong> 45%.</li>
      </ul>
      <p>
        Angajații sub 26 de ani beneficiază de un plus de 15% din salariul minim, iar pentru fiecare
        copil aflat în întreținere care urmează o formă de învățământ se adaugă 100 de lei. Deducerea
        se aplică <strong>doar dacă brutul nu depășește salariul minim + 2.000 lei</strong>.
      </p>

      <h2>Greșeli frecvente la calculul salariului</h2>
      <ul>
        <li>
          <strong>Confundarea costului angajatorului cu brutul.</strong> CAM 2,25% se adaugă peste
          brut și este suportat de firmă — nu se scade din salariul angajatului.
        </li>
        <li>
          <strong>Aplicarea impozitului direct pe brut.</strong> Impozitul de 10% se calculează pe
          baza impozabilă (brut minus CAS, CASS și deducere), nu pe brutul integral.
        </li>
        <li>
          <strong>Ignorarea schimbării de la 1 iulie 2026.</strong> Salariul minim crește de la 4.050
          la 4.325 lei, ceea ce modifică pragurile de scutire și deducere. Selectează perioada corectă
          în calculator.
        </li>
        <li>
          <strong>Așteptarea facilităților IT sau construcții.</strong> Acestea au fost eliminate; toți
          angajații se calculează identic, cu 25% / 10% / 10%.
        </li>
      </ul>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Pentru situații speciale (mai multe locuri de muncă, venituri
        din alte surse, popriri, tichete de masă) consultă un contabil. Vezi și{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link> dacă ești
        independent, sau{' '}
        <Link href="/calculator/concediu-medical/">calculatorul de concediu medical</Link> pentru
        indemnizația din perioada de boală.
      </p>
    </CalculatorLayout>
  );
}
