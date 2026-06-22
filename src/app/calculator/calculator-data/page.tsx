import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { DataCalculator } from '@/components/calculators/data-calculator';

const SLUG = 'calculator-data';
const TITLE = 'Calculator Dată — Adună sau Scade Zile';
const DESCRIPTION =
  'Calculator dată: adună sau scade zile, luni ori ani (sau doar zile lucrătoare) la o dată și află diferența în zile între două date.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Dată')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Dată 2026"
      description="Adună sau scade zile, luni ori ani la o dată (sau doar zile lucrătoare) și calculează diferența în zile între două date — util pentru termene, scadențe și vârste."
      widget={<DataCalculator />}
      faqs={[
        { q: 'Ce face acest calculator de dată?', a: 'Adună sau scade un număr de zile, luni sau ani la o dată de pornire și îți arată data rezultată. Alternativ, calculează câte zile sunt între două date. Poți alege să numeri toate zilele sau doar zilele lucrătoare.' },
        { q: 'Pot calcula doar zilele lucrătoare?', a: 'Da. Există opțiunea de a aduna sau scădea exclusiv zile lucrătoare, ignorând weekendurile. Este utilă pentru termene procedurale și scadențe care se calculează în zile lucrătoare.' },
        { q: 'Cum aflu câte zile sunt între două date?', a: 'Alege modul de diferență dintre date, introdu data de început și data de sfârșit, iar calculatorul îți arată numărul de zile dintre ele. Funcția e potrivită pentru a calcula o vârstă sau durata până la o scadență.' },
        { q: 'La ce este util un calculator de dată?', a: 'Pentru a stabili termene și scadențe (de exemplu data limită după un anumit număr de zile), pentru a calcula vârste sau pentru a afla câte zile au trecut ori mai sunt până la un eveniment.' },
        { q: 'Rezultatul este oficial?', a: 'Nu. Rezultatul este orientativ și are scop informativ. Pentru termene legale verifică întotdeauna regulile aplicabile, deoarece unele se calculează diferit (zile libere, zile lucrătoare sau cu reguli speciale de începere și de împlinire).' },
        { q: 'Cum se numără un termen pe luni sau pe ani?', a: 'Un termen pe luni sau pe ani se împlinește în ziua corespunzătoare din ultima lună, respectiv din ultimul an. Dacă luna de final nu are o zi cu același număr (de exemplu 31), termenul se împlinește în ultima zi a acelei luni. Calculatorul aplică automat această ajustare când aduni luni sau ani.' },
        { q: 'Ce se întâmplă dacă termenul cade într-o zi de sărbătoare legală?', a: 'Acest calculator numără zilele calendaristice sau, opțional, doar zilele lucrătoare (fără sâmbete și duminici). El nu cunoaște sărbătorile legale din fiecare an. Pentru termene unde ultima zi nu poate fi o zi nelucrătoare, verifică manual dacă data rezultată coincide cu o sărbătoare și mută termenul în prima zi lucrătoare următoare.' },
        { q: 'Pot calcula vârsta exactă a unei persoane?', a: 'Da. Folosește modul de diferență, introdu data nașterii ca dată de început și data de azi (sau o dată de referință) ca dată de sfârșit. Rezultatul în zile poate fi împărțit pentru a estima vârsta în ani; ține cont că anii bisecți influențează numărul total de zile.' },
      ]}
    >
      <h2>Cum se calculează o dată adunând sau scăzând zile</h2>
      <p>
        Calculatorul lucrează în două moduri. În primul, pornești de la o dată și{' '}
        <strong>aduni sau scazi</strong> un număr de zile, luni sau ani; rezultatul este data nouă. În
        al doilea, introduci <strong>două date</strong> și afli diferența dintre ele, exprimată în
        zile. Pentru termenele care se socotesc în zile lucrătoare, poți activa opțiunea care ignoră
        weekendurile, astfel încât sâmbăta și duminica să nu fie numărate.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem că vrei să afli data la care expiră un termen de <strong>30 de zile</strong>,
        pornind de la 1 iunie 2026. Pașii sunt:
      </p>
      <ul>
        <li>alegi modul „adună / scade” și introduci data de pornire: <strong>1 iunie 2026</strong>;</li>
        <li>setezi operația pe „adună” și introduci <strong>30 de zile</strong>;</li>
        <li>rezultatul este <strong>1 iulie 2026</strong> (iunie are 30 de zile).</li>
      </ul>
      <p>
        Dacă activezi opțiunea „doar zile lucrătoare”, cele 30 de zile se numără sărind peste
        weekenduri, deci data finală cade mai târziu în calendar. Pentru a afla, invers, câte zile sunt
        între 1 iunie 2026 și 1 iulie 2026, treci pe modul de diferență și obții <strong>30 de
        zile</strong>.
      </p>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confundarea zilelor calendaristice cu cele lucrătoare.</strong> Un termen „în zile”
          nu este același lucru cu un termen „în zile lucrătoare”. Verifică ce tip de zile se aplică
          înainte de a alege opțiunea din calculator.
        </li>
        <li>
          <strong>Adunarea lunilor la sfârșit de lună.</strong> Când aduni o lună la o dată de 31, luna
          următoare poate avea mai puține zile; rezultatul se ajustează la ultima zi validă.
        </li>
        <li>
          <strong>Includerea sau excluderea zilei de pornire.</strong> La calculul unei vârste sau al
          unei durate, fii atent dacă prima zi se numără sau nu, pentru că modifică rezultatul cu o zi.
        </li>
      </ul>

      <h2>Tabel: tipuri de calcul și când le folosești</h2>
      <p>
        Cele două moduri ale calculatorului acoperă majoritatea nevoilor practice. Tabelul de mai jos
        rezumă ce introduci, ce obții și pentru ce situații se potrivește fiecare combinație:
      </p>
      <table>
        <thead>
          <tr>
            <th>Ce vrei să afli</th>
            <th>Mod și operație</th>
            <th>Ce introduci</th>
            <th>Rezultat</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data limită a unui termen</td>
            <td>Adună / scade — adună</td>
            <td>Data de pornire + număr de zile, luni sau ani</td>
            <td>Data scadentă</td>
          </tr>
          <tr>
            <td>O dată din trecut</td>
            <td>Adună / scade — scade</td>
            <td>Data de referință − număr de zile</td>
            <td>Data anterioară</td>
          </tr>
          <tr>
            <td>Termen procedural pe zile lucrătoare</td>
            <td>Adună / scade — doar zile lucrătoare</td>
            <td>Data de pornire + zile lucrătoare</td>
            <td>Data fără weekenduri</td>
          </tr>
          <tr>
            <td>Durata dintre două evenimente</td>
            <td>Diferență între date</td>
            <td>Data de început + data de sfârșit</td>
            <td>Număr de zile</td>
          </tr>
          <tr>
            <td>Vârsta sau vechimea în zile</td>
            <td>Diferență între date</td>
            <td>Data nașterii / de start + data de azi</td>
            <td>Număr total de zile</td>
          </tr>
        </tbody>
      </table>

      <h2>Cazuri speciale de care să ții cont</h2>
      <p>
        Câteva situații merită atenție pentru ca rezultatul să fie corect:
      </p>
      <ul>
        <li>
          <strong>Anii bisecți.</strong> Luna februarie are 29 de zile în anii bisecți (de exemplu 2028
          sau 2032). Când diferența dintre două date traversează un 29 februarie, numărul de zile crește
          cu una față de un an obișnuit; calculatorul ține cont automat de acest lucru.
        </li>
        <li>
          <strong>Scăderea peste granița de an.</strong> Dacă scazi mai multe zile decât au trecut de la
          1 ianuarie, data rezultată cade în anul precedent. Verifică anul afișat, nu doar ziua și luna.
        </li>
        <li>
          <strong>Termene foarte scurte în zile lucrătoare.</strong> Un termen de 3 zile lucrătoare
          pornit într-o zi de joi se împlinește abia marțea următoare, pentru că sâmbăta și duminica nu
          se numără. Diferența față de zilele calendaristice devine semnificativă la termene scurte.
        </li>
        <li>
          <strong>Combinarea anilor, lunilor și zilelor.</strong> Când aduni simultan ani, luni și zile,
          ordinea contează mai puțin, dar ajustarea de sfârșit de lună se aplică după adunarea lunilor și
          a anilor, înainte de adunarea zilelor.
        </li>
      </ul>

      <h2>Context legal: cum se socotesc termenele</h2>
      <p>
        În dreptul român, regula uzuală este că termenul pe zile se calculează pe zile libere, adică nu
        se ia în calcul nici ziua de început, nici ziua de împlinire. Termenele pe luni și pe ani se
        împlinesc în ziua corespunzătoare din ultima lună sau din ultimul an, iar dacă acea zi nu există,
        termenul se socotește împlinit în ultima zi a lunii. De asemenea, când ultima zi a unui termen
        cade într-o zi nelucrătoare, termenul se prelungește, de regulă, până la sfârșitul primei zile
        lucrătoare următoare. Acest calculator nu aplică automat regula zilelor libere de început și de
        sfârșit și nu cunoaște sărbătorile legale; de aceea îl folosești ca instrument de numărare, iar
        încadrarea juridică finală o verifici după normele aplicabile cazului tău.
      </p>

      <h2>Context: termene, scadențe și vârste</h2>
      <p>
        Un calculator de dată este util ori de câte ori ai nevoie să stabilești un <strong>termen</strong>{' '}
        sau o <strong>scadență</strong> — de pildă data limită pentru depunerea unui document după un
        număr de zile, ziua în care se împlinește o perioadă contractuală sau câte zile mai sunt până la
        un eveniment. Tot el ajută la calculul unei <strong>vârste</strong>, transformând diferența
        dintre data nașterii și o dată de referință în zile. Rețineți însă că anumite termene legale au
        reguli proprii privind ziua de început și ziua de împlinire, iar acest instrument oferă doar un
        reper de calcul.
      </p>
      <p>
        Pentru termene procedurale care se socotesc în zile lucrătoare, vezi și{' '}
        <Link href="/calculator/termene-judiciare/">calculatorul de termene judiciare</Link>, iar pentru
        a calcula vechimea acumulată într-o perioadă folosește{' '}
        <Link href="/calculator/vechime-in-munca/">calculatorul de vechime în muncă</Link>. Dacă ai
        nevoie să planifici și zilele de odihnă pentru o perioadă, vezi și{' '}
        <Link href="/calculator/zile-concediu-odihna/">calculatorul de concediu de odihnă</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și au scop informativ. Pentru termene cu efecte juridice verifică
        regulile aplicabile, deoarece modul de calcul (zile calendaristice sau lucrătoare, ziua de
        început și cea de împlinire) poate diferi de la caz la caz.
      </p>
    </CalculatorLayout>
  );
}
