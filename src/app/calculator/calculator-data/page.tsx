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
        <Link href="/calculator/vechime-in-munca/">calculatorul de vechime în muncă</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și au scop informativ. Pentru termene cu efecte juridice verifică
        regulile aplicabile, deoarece modul de calcul (zile calendaristice sau lucrătoare, ziua de
        început și cea de împlinire) poate diferi de la caz la caz.
      </p>
    </CalculatorLayout>
  );
}
