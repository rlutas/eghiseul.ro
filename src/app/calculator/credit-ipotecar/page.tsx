import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { CreditIpotecarCalculator } from '@/components/calculators/credit-ipotecar-calculator';

const SLUG = 'credit-ipotecar';
const TITLE = 'Calculator Credit Ipotecar 2026 — Rata Lunară';
const DESCRIPTION =
  'Calculator credit ipotecar 2026: afli rata lunară, totalul de plată și dobânda totală pentru un credit cu rate egale, orientativ, fără comisioane.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Credit Ipotecar')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Credit Ipotecar 2026"
      description="Estimează rata lunară a unui credit ipotecar cu rate egale (anuitate), totalul de plată și dobânda totală. Calculul este orientativ, fără comisioane și fără DAE."
      widget={<CreditIpotecarCalculator />}
      faqs={[
        { q: 'Cum se calculează rata lunară la un credit ipotecar?', a: 'La un credit cu rate egale (anuitate) rata lunară se calculează cu formula R = P·i/(1−(1+i)^−n), unde P este suma împrumutată, i este dobânda lunară (dobânda anuală împărțită la 12) și n este numărul total de luni. Rata rămâne constantă pe toată perioada dacă dobânda nu se modifică.' },
        { q: 'Ce înseamnă totalul de plată și dobânda totală?', a: 'Totalul de plată este rata lunară înmulțită cu numărul de luni, adică tot ce returnezi băncii. Dobânda totală este diferența dintre totalul de plată și suma împrumutată — costul efectiv al banilor pe toată durata creditului.' },
        { q: 'Calculatorul include comisioanele și DAE?', a: 'Nu. Rezultatul este orientativ și ține cont doar de principal, dobândă și perioadă. Comisioanele de analiză, asigurările obligatorii și alte costuri nu sunt incluse, deci DAE (dobânda anuală efectivă) reală va fi mai mare decât dobânda nominală folosită aici.' },
        { q: 'Ce este gradul de îndatorare?', a: 'Este ponderea ratelor lunare totale în venitul net. Conform reglementărilor, rata lunară (împreună cu celelalte credite) nu trebuie să depășească, de regulă, 40% din venitul net lunar.' },
        { q: 'De ce diferă rata calculată aici de oferta băncii?', a: 'Banca aplică propria dobândă (de obicei legată de IRCC plus o marjă), adaugă comisioane și asigurări și poate folosi o altă metodă de rotunjire. Folosește acest calcul ca estimare, iar pentru cifra exactă cere graficul de rambursare de la bancă.' },
        { q: 'Cum influențează perioada rata și costul total?', a: 'O perioadă mai lungă scade rata lunară, fiindcă principalul se împarte la mai multe luni (n mai mare în formula R = P·i/(1−(1+i)^−n)), dar crește dobânda totală pentru că plătești dobândă pe mai mult timp. Pentru același credit de 300.000 lei la 6%, trecerea de la 25 la 30 de ani scade rata de la circa 1.933 lei la circa 1.799 lei, însă dobânda totală urcă de la circa 279.900 lei la circa 347.640 lei.' },
        { q: 'Avansul mai mare reduce rata lunară?', a: 'Da. În formulă P este suma efectiv împrumutată, nu prețul locuinței. Un avans mai mare micșorează P, deci scad direct atât rata lunară, cât și dobânda totală, la aceeași dobândă și perioadă.' },
        { q: 'Pot rambursa anticipat ca să plătesc mai puțină dobândă?', a: 'Da. Orice plată anticipată reduce principalul rămas, ceea ce scade fie rata lunară, fie perioada și, în ambele cazuri, dobânda totală pe care o mai plătești. Cât economisești exact depinde de momentul plății și de soldul rămas.' },
      ]}
    >
      <h2>Cum se calculează rata la un credit ipotecar</h2>
      <p>
        Cele mai multe credite ipotecare folosesc <strong>rate egale (anuitate)</strong>: plătești
        aceeași sumă în fiecare lună, dar proporția dintre dobândă și principal se schimbă în timp. La
        început rata conține mai multă dobândă, iar spre final mai mult principal. Rata lunară se
        calculează cu formula:
      </p>
      <p>
        <strong>R = P·i/(1−(1+i)^−n)</strong>
      </p>
      <p>
        unde <strong>P</strong> este suma împrumutată, <strong>i</strong> este dobânda lunară (dobânda
        anuală împărțită la 12), iar <strong>n</strong> este numărul total de luni. Din rată derivă
        apoi <strong>totalul de plată</strong> (rata × n) și <strong>dobânda totală</strong> (totalul
        de plată − P).
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un credit de <strong>300.000 lei</strong>, cu o dobândă anuală de{' '}
        <strong>6%</strong>, pe <strong>25 de ani</strong> (300 de luni). Calculul decurge astfel:
      </p>
      <ul>
        <li>
          <strong>dobânda lunară:</strong> i = 6% / 12 = 0,5% = 0,005;
        </li>
        <li>
          <strong>numărul de luni:</strong> n = 25 × 12 = 300;
        </li>
        <li>
          <strong>rata lunară:</strong> R = 300.000 × 0,005 / (1 − (1,005)^−300) ≈ 1.933 lei;
        </li>
        <li>
          <strong>totalul de plată:</strong> 1.933 × 300 ≈ 579.900 lei;
        </li>
        <li>
          <strong>dobânda totală:</strong> 579.900 − 300.000 ≈ 279.900 lei.
        </li>
      </ul>
      <p>
        Pe un orizont lung, dobânda aproape egalează suma împrumutată. Modifică perioada sau dobânda în
        calculatorul de mai sus ca să vezi cât de mult contează fiecare an în plus.
      </p>

      <h2>Cum schimbă perioada rata și dobânda totală</h2>
      <p>
        Aceeași sumă împrumutată, la aceeași dobândă, produce rate foarte diferite în funcție de
        perioadă. Tabelul de mai jos păstrează un credit de <strong>300.000 lei</strong> la o dobândă
        anuală de <strong>6%</strong> (dobânda lunară i = 0,005) și variază doar numărul de ani. Cifrele
        rezultă din aceeași formulă R = P·i/(1−(1+i)^−n) și sunt rotunjite, deci orientative.
      </p>
      <table>
        <thead>
          <tr>
            <th>Perioadă</th>
            <th>Luni (n)</th>
            <th>Rata lunară</th>
            <th>Total de plată</th>
            <th>Dobândă totală</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>15 ani</td>
            <td>180</td>
            <td>≈ 2.532 lei</td>
            <td>≈ 455.760 lei</td>
            <td>≈ 155.760 lei</td>
          </tr>
          <tr>
            <td>20 ani</td>
            <td>240</td>
            <td>≈ 2.149 lei</td>
            <td>≈ 515.760 lei</td>
            <td>≈ 215.760 lei</td>
          </tr>
          <tr>
            <td>25 ani</td>
            <td>300</td>
            <td>≈ 1.933 lei</td>
            <td>≈ 579.900 lei</td>
            <td>≈ 279.900 lei</td>
          </tr>
          <tr>
            <td>30 ani</td>
            <td>360</td>
            <td>≈ 1.799 lei</td>
            <td>≈ 647.640 lei</td>
            <td>≈ 347.640 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Observă tiparul: prelungirea cu cinci ani scade rata lunară cu doar câteva sute de lei, dar
        adaugă zeci de mii de lei la dobânda totală. Perioada se alege, în practică, cât de scurtă o
        permite <strong>gradul de îndatorare</strong> — adică rata să nu depășească 40% din venitul net.
      </p>

      <h2>Cazuri speciale</h2>
      <ul>
        <li>
          <strong>Avans și suma împrumutată.</strong> În formulă, P este suma efectiv împrumutată, nu
          prețul locuinței. Un avans mai mare reduce P și, implicit, rata lunară și dobânda totală.
        </li>
        <li>
          <strong>Doi co-debitori.</strong> Când la credit participă două venituri, banca raportează
          rata la venitul net cumulat, dar pragul de 40% se aplică tot pe total — un al doilea venit
          poate face diferența între respins și aprobat.
        </li>
        <li>
          <strong>Dobândă variabilă (IRCC + marjă).</strong> Calculul de aici presupune o dobândă
          constantă. Dacă IRCC crește, dobânda lunară i crește și ea, iar rata recalculată de bancă va
          fi mai mare; reia simularea cu noua dobândă ca să vezi impactul.
        </li>
        <li>
          <strong>Plăți anticipate.</strong> Orice sumă achitată în avans micșorează principalul rămas,
          deci scade fie rata, fie perioada, reducând dobânda totală plătită. Vezi cât economisești cu{' '}
          <Link href="/calculator/rambursare-anticipata/">calculatorul de rambursare anticipată</Link>.
        </li>
      </ul>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confundarea dobânzii nominale cu DAE.</strong> Acest calcul folosește dobânda
          nominală. Costul real (cu comisioane și asigurări) este reflectat de DAE, care este mai
          mare.
        </li>
        <li>
          <strong>Ignorarea gradului de îndatorare.</strong> Rata lunară, împreună cu celelalte
          credite, nu ar trebui să depășească <strong>40% din venitul net</strong>. Dacă o depășește,
          banca poate respinge cererea.
        </li>
        <li>
          <strong>Subestimarea perioadei.</strong> O perioadă mai lungă scade rata lunară, dar crește
          semnificativ dobânda totală plătită.
        </li>
        <li>
          <strong>Presupunerea unei dobânzi fixe pe toată durata.</strong> Multe credite au dobândă
          variabilă (IRCC plus o marjă), deci rata se poate modifica când indicele se schimbă.
        </li>
      </ul>

      <h2>Context legal și de bun-simț financiar</h2>
      <p>
        Gradul maxim de îndatorare este reglementat tocmai pentru a proteja debitorul de
        supraîndatorare: de regulă, ratele lunare totale nu pot depăși 40% din venitul net lunar. Un
        credit ipotecar este, de obicei, cea mai mare obligație financiară a unei gospodării pe câteva
        decenii, așa că merită comparate mai multe oferte și verificat impactul unei dobânzi variabile.
        Înainte de a semna, cere băncii graficul complet de rambursare și citește costurile incluse în
        DAE.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și nu includ comisioane, asigurări sau DAE. Pentru cifra exactă
        cere graficul de rambursare de la bancă. Vezi și{' '}
        <Link href="/calculator/rambursare-anticipata/">calculatorul de rambursare anticipată</Link>{' '}
        dacă vrei să afli cât economisești achitând în avans, sau{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link> pentru costurile
        actului de vânzare-cumpărare.
      </p>
    </CalculatorLayout>
  );
}
