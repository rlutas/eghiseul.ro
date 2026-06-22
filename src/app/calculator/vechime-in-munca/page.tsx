import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { VechimeCalculator } from '@/components/calculators/vechime-calculator';

const SLUG = 'vechime-in-munca';
const TITLE = 'Calculator Vechime în Muncă — Ani, Luni, Zile';
const DESCRIPTION =
  "Calculează vechimea totală în muncă adunând mai multe perioade de angajare. Rezultat în ani, luni și zile.";

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
      heading="Calculator Vechime în Muncă"
      description="Adună mai multe perioade de angajare și află vechimea totală în muncă, exprimată în ani, luni și zile."
      widget={<VechimeCalculator />}
      faqs={[
        { q: 'Cum se calculează vechimea în muncă?', a: 'Se adună toate perioadele lucrate (de la data angajării până la data încetării, inclusiv) și se exprimă în ani, luni și zile. Calculatorul însumează automat mai multe perioade.' },
        { q: 'La ce îmi folosește vechimea în muncă?', a: 'La stabilirea stagiului de cotizare pentru pensie, a sporului de vechime, a numărului de zile de concediu sau în diverse dosare administrative.' },
        { q: 'Vechimea se calculează în zile lucrătoare sau calendaristice?', a: 'Vechimea în muncă se exprimă în timp calendaristic (ani/luni/zile). Calculatorul folosește o aproximare uzuală (lună = 30 zile, an = 365 zile).' },
        { q: 'Câți ani de vechime îmi trebuie pentru pensie?', a: 'Stagiul minim de cotizare este de 15 ani (atât pentru bărbați, cât și pentru femei). Stagiul complet de cotizare este de 35 de ani la bărbați; la femei crește treptat spre 35 de ani până în ianuarie 2030. Vechimea în muncă nu coincide întotdeauna cu stagiul de cotizare: contează perioadele pentru care s-au plătit contribuții.' },
        { q: 'Vechimea în muncă este același lucru cu stagiul de cotizare?', a: 'Nu întotdeauna. Vechimea în muncă reflectă timpul lucrat pe baza contractelor, iar stagiul de cotizare reflectă perioadele pentru care s-au plătit efectiv contribuțiile la pensie. Pentru pensie contează stagiul de cotizare din evidențele casei de pensii, nu doar vechimea din carnetul de muncă.' },
        { q: 'Concediile (medical, creștere copil, fără plată) intră în vechime?', a: 'Concediul medical și concediul de creștere a copilului sunt, în general, perioade asimilate și se iau în calcul. Concediul fără plată, de regulă, NU adaugă vechime. Reguli exacte se aplică pe caz; rezultatul calculatorului rămâne orientativ.' },
      ]}
    >
      <h2>Cum aduni vechimea din mai multe locuri de muncă</h2>
      <p>
        Vechimea totală este suma tuturor perioadelor în care ai fost angajat. Pentru fiecare perioadă
        se numără zilele de la data angajării până la data încetării (inclusiv), apoi se însumează și
        se transformă în <strong>ani, luni și zile</strong>.
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă. Pentru stagiul de cotizare exact (pensie), datele oficiale sunt cele din
        REVISAL și din evidențele casei de pensii.
      </p>

      <h2>Exemplu numeric: vechime din trei contracte</h2>
      <p>
        Să presupunem că ai lucrat la trei angajatori, cu pauze între ele. Pentru fiecare perioadă numeri
        zilele de la data angajării până la data încetării, <strong>inclusiv</strong> ambele capete:
      </p>
      <ul>
        <li><strong>Firma A:</strong> 01.03.2015 – 31.08.2018 ≈ 3 ani, 6 luni</li>
        <li><strong>Firma B:</strong> 15.01.2019 – 14.07.2021 ≈ 2 ani, 6 luni</li>
        <li><strong>Firma C:</strong> 01.10.2022 – 30.06.2026 ≈ 3 ani, 9 luni</li>
      </ul>
      <p>
        Aduni durata fiecărei perioade (nu și pauzele dintre ele): 3a 6l + 2a 6l + 3a 9l =
        <strong> 9 ani și 9 luni</strong> vechime totală în muncă. Pauzele dintre contracte nu se
        adună, pentru că în acele intervale nu ai fost angajat. Calculatorul de mai sus face automat
        această însumare pentru oricâte perioade introduci.
      </p>

      <h2>Praguri de vechime relevante (orientativ 2026)</h2>
      <p>
        Vechimea în muncă conta în mai multe situații. Câteva repere uzuale pentru 2026:
      </p>
      <ul>
        <li><strong>Stagiu minim de cotizare pentru pensie:</strong> 15 ani (bărbați și femei).</li>
        <li><strong>Stagiu complet de cotizare:</strong> 35 de ani la bărbați; la femei crește treptat spre 35 de ani până în ianuarie 2030.</li>
        <li><strong>Vârsta standard de pensionare (ian. 2026):</strong> 65 de ani la bărbați; 62 de ani și 6 luni la femei (crește gradual spre 65 până în 2035).</li>
        <li><strong>Concediu de odihnă:</strong> minimum 20 de zile lucrătoare pe an, indiferent de vechime (zile suplimentare pot fi negociate prin contract).</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valorile privind pensionarea sunt orientative și depind de Legea 360/2023 (Anexa 5), de stagiul
        de cotizare efectiv și de eventualele reduceri (de exemplu, pentru mame). Verifică situația ta
        exactă cu calculatorul oficial CNPP și cu casa de pensii.
      </p>

      <h2>Greșeli frecvente la calculul vechimii</h2>
      <ul>
        <li><strong>Numărarea pauzelor:</strong> intervalele în care nu ai avut contract NU se adună la vechime.</li>
        <li><strong>Omiterea ultimei zile:</strong> data încetării se include în calcul (perioada se numără inclusiv).</li>
        <li><strong>Confuzia vechime vs. stagiu de cotizare:</strong> pentru pensie contează stagiul de cotizare din evidențele casei de pensii, nu doar vechimea din contracte.</li>
        <li><strong>Suprapunerea perioadelor:</strong> dacă ai avut două contracte simultan, timpul se numără o singură dată pentru vechime.</li>
      </ul>
      <p>
        Dacă pregătești un dosar administrativ care cere și un certificat de integritate, poți obține
        rapid online{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar</Link>. Pentru alte estimări
        utile, vezi și calculatorul de{' '}
        <Link href="/calculator/zile-concediu-odihna/">zile de concediu de odihnă</Link> sau cel de{' '}
        <Link href="/calculator/salariu/">salariu net din brut</Link>.
      </p>
    </CalculatorLayout>
  );
}
