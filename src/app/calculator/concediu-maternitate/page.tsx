import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ConcediuMaternitateCalculator } from '@/components/calculators/concediu-maternitate-calculator';

const SLUG = 'concediu-maternitate';
const TITLE = 'Calculator Concediu Maternitate 2026 — Indemnizație';
const DESCRIPTION =
  'Calculator concediu maternitate 2026: estimează indemnizația de 85% din media venitului brut pe 6 luni, durata de 126 zile și suma netă, neimpozabilă.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Concediu Maternitate')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Concediu Maternitate 2026"
      description="Estimează indemnizația de maternitate (concediul de sarcină și lăuzie) pe baza venitului brut din ultimele 6 luni — 85% din media lunară, pe o durată de 126 de zile, neimpozabilă."
      tldr="Indemnizația de maternitate este de 85% din media venitului brut din ultimele 6 luni, plafonată la 12 salarii minime brute, pe o durată de 126 de zile (63 prenatal + 63 postnatal), conform OUG 158/2005. Este neimpozabilă, deci netul încasat este egal cu suma brută."
      widget={<ConcediuMaternitateCalculator />}
      faqs={[
        { q: 'Cât durează concediul de maternitate în 2026?', a: 'Concediul de maternitate durează 126 de zile calendaristice, conform OUG 158/2005: 63 de zile prenatal (înainte de naștere) și 63 de zile postnatal (după naștere). Cele două perioade se pot compensa între ele, dar concediul de lăuzie obligatoriu, de minimum 42 de zile după naștere, trebuie efectuat integral.' },
        { q: 'Cât este indemnizația de maternitate?', a: 'Indemnizația este de 85% din media venitului lunar brut din ultimele 6 luni dinaintea lunii în care începe concediul. Baza de calcul este plafonată la 12 salarii minime brute pe țară.' },
        { q: 'Indemnizația de maternitate se impozitează?', a: 'Nu. Indemnizația de maternitate este neimpozabilă: nu se rețin impozit pe venit, CAS sau CASS din ea, conform art. 62 din Codul Fiscal. Suma netă încasată este egală cu suma brută calculată.' },
        { q: 'Care este diferența dintre concediul de maternitate și cel de creștere a copilului?', a: 'Concediul de maternitate (sarcină și lăuzie) acoperă 126 de zile în jurul nașterii și se plătește prin sistemul de asigurări sociale de sănătate (OUG 158/2005). Concediul pentru creșterea copilului începe după el și se acordă până la 2 ani, fiind reglementat separat și cu altă bază de calcul.' },
        { q: 'Cine plătește indemnizația de maternitate?', a: 'Indemnizația se suportă integral din bugetul Fondului Național Unic de Asigurări Sociale de Sănătate (FNUASS). Angajatorul o calculează și o avansează, apoi recuperează sumele de la Casa de Asigurări de Sănătate.' },
        { q: 'Ce se întâmplă dacă venitul meu brut depășește plafonul?', a: 'Baza de calcul a indemnizației este plafonată la 12 salarii minime brute pe țară. Dacă media venitului brut din ultimele 6 luni depășește acest plafon, indemnizația se calculează aplicând 85% asupra plafonului, nu asupra venitului real. Astfel, indemnizația nu mai crește peste valoarea maximă corespunzătoare plafonului.' },
        { q: 'Cum se calculează indemnizația dacă am avut luni cu venit incomplet?', a: 'Media se raportează la venitul efectiv asigurat din cele 6 luni de referință. Dacă în această perioadă ai avut luni cu zile fără contribuție (de exemplu un alt concediu medical), baza de calcul poate fi mai mică, ceea ce reduce indemnizația de 85%. Pentru situații exacte consultă Casa de Asigurări de Sănătate sau un contabil.' },
        { q: 'Pot beneficia de indemnizație fără stagiu de asigurare?', a: 'Nu. Pentru deschiderea dreptului la indemnizația de maternitate trebuie îndeplinit stagiul minim de asigurare prevăzut de OUG 158/2005. Fără acest stagiu, dreptul la indemnizație nu se deschide, chiar dacă concediul de maternitate de 126 de zile rămâne posibil.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de maternitate în 2026</h2>
      <p>
        Indemnizația de maternitate se stabilește pe baza venitului brut din ultimele 6 luni dinaintea
        lunii în care începe concediul. Pașii sunt:
      </p>
      <ul>
        <li>
          se calculează <strong>media lunară a venitului brut</strong> din cele 6 luni de referință;
        </li>
        <li>
          se aplică procentul de <strong>85%</strong> asupra acestei medii;
        </li>
        <li>
          baza de calcul nu poate depăși <strong>12 salarii minime brute pe țară</strong> — peste acest
          plafon, venitul nu mai crește indemnizația.
        </li>
      </ul>
      <p>
        Rezultatul reprezintă indemnizația lunară. Pentru că este <strong>neimpozabilă</strong> (fără
        impozit, CAS sau CASS, conform art. 62 din Codul Fiscal), suma încasată este egală cu cea
        calculată.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un venit brut constant de <strong>5.000 lei</strong> pe lună în cele 6 luni
        anterioare începerii concediului:
      </p>
      <ul>
        <li>
          <strong>media venitului brut:</strong> (5.000 × 6) ÷ 6 = <strong>5.000 lei</strong>;
        </li>
        <li>
          <strong>indemnizație 85%:</strong> 5.000 × 85% = <strong>4.250 lei</strong> pe lună;
        </li>
        <li>
          <strong>net încasat:</strong> 4.250 lei — fiind neimpozabilă, nu se mai scade nimic.
        </li>
      </ul>
      <p>
        Concediul are o durată totală de <strong>126 de zile</strong> (63 prenatal + 63 postnatal),
        adică aproximativ 4 luni. Pentru venituri variabile sau pentru a vedea efectul plafonului de
        12 salarii minime, folosește calculatorul de mai sus.
      </p>

      <h2>Tabel orientativ: indemnizația în funcție de venitul brut</h2>
      <p>
        Tabelul de mai jos arată cum se transformă media venitului brut lunar din ultimele 6 luni în
        indemnizație de maternitate, aplicând cota de <strong>85%</strong>. Pentru că indemnizația este
        neimpozabilă, suma din coloana indemnizației este și suma netă încasată lunar.
      </p>
      <table>
        <thead>
          <tr>
            <th>Media venitului brut lunar</th>
            <th>Indemnizație lunară (85%)</th>
            <th>Net încasat (neimpozabil)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>3.000 lei</td>
            <td>2.550 lei</td>
            <td>2.550 lei</td>
          </tr>
          <tr>
            <td>4.000 lei</td>
            <td>3.400 lei</td>
            <td>3.400 lei</td>
          </tr>
          <tr>
            <td>5.000 lei</td>
            <td>4.250 lei</td>
            <td>4.250 lei</td>
          </tr>
          <tr>
            <td>8.000 lei</td>
            <td>6.800 lei</td>
            <td>6.800 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Valorile sunt orientative și presupun un venit brut constant pe toată perioada de referință.
        Atenție: dacă media venitului brut depășește <strong>12 salarii minime brute pe țară</strong>,
        baza de calcul se oprește la acest plafon, iar indemnizația nu mai crește peste valoarea
        corespunzătoare plafonului — vezi exemplul de mai jos.
      </p>

      <h2>Exemplu cu plafonul de 12 salarii minime</h2>
      <p>
        Plafonul protejează bugetul de asigurări, dar înseamnă că veniturile foarte mari nu se reflectă
        integral în indemnizație. Pașii sunt aceiași, doar că baza de calcul se „taie” la plafon:
      </p>
      <ul>
        <li>
          se stabilește <strong>plafonul</strong> ca 12 × salariul minim brut pe țară aplicabil;
        </li>
        <li>
          dacă media venitului brut din cele 6 luni este peste plafon, se folosește{' '}
          <strong>plafonul</strong> drept bază de calcul, nu media reală;
        </li>
        <li>
          se aplică <strong>85%</strong> asupra plafonului, obținând indemnizația lunară maximă.
        </li>
      </ul>
      <p>
        Astfel, două persoane cu venituri brute diferite, dar ambele peste plafon, vor primi aceeași
        indemnizație de maternitate. Calculatorul de mai sus aplică automat acest plafon, deci nu este
        nevoie să-l calculezi manual.
      </p>

      <h2>Cazuri speciale</h2>
      <ul>
        <li>
          <strong>Luni cu venit incomplet în perioada de referință.</strong> Dacă în cele 6 luni există
          luni cu zile fără contribuție (de exemplu alt concediu medical), media se calculează raportat
          la venitul efectiv asigurat, ceea ce poate reduce baza de calcul.
        </li>
        <li>
          <strong>Stagiu de asigurare insuficient.</strong> Pentru a beneficia de indemnizație trebuie
          îndeplinit stagiul minim de asigurare prevăzut de OUG 158/2005; fără acesta, dreptul nu se
          deschide.
        </li>
        <li>
          <strong>Compensarea celor 63 + 63 de zile.</strong> Cele două perioade (prenatal și postnatal)
          se pot compensa între ele în limita celor 126 de zile, însă concediul de lăuzie de minimum 42
          de zile după naștere rămâne obligatoriu și nu poate fi redus.
        </li>
        <li>
          <strong>Naștere prematură sau întârziată.</strong> Repartizarea zilelor se ajustează în
          funcție de momentul real al nașterii, dar durata totală rămâne de 126 de zile.
        </li>
      </ul>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confundarea cu concediul de creștere a copilului.</strong> Maternitatea acoperă
          doar cele 126 de zile din jurul nașterii; creșterea copilului este un concediu separat,
          care începe după.
        </li>
        <li>
          <strong>Neefectuarea celor 42 de zile postnatale obligatorii.</strong> Indiferent cum se
          repartizează cele 126 de zile, concediul de lăuzie de minimum 42 de zile după naștere este
          obligatoriu.
        </li>
        <li>
          <strong>Așteptarea unei rețineri de impozit.</strong> Indemnizația este neimpozabilă, deci
          netul este egal cu brutul calculat — nu te aștepta la deduceri suplimentare.
        </li>
        <li>
          <strong>Ignorarea plafonului.</strong> La venituri mari, baza de calcul este limitată la 12
          salarii minime brute, așa că indemnizația nu crește la nesfârșit odată cu salariul.
        </li>
      </ul>

      <h2>Context legal</h2>
      <p>
        Concediul și indemnizația de maternitate sunt reglementate de <strong>OUG 158/2005</strong>{' '}
        privind concediile și indemnizațiile de asigurări sociale de sănătate. Durata este de 126 de
        zile (63 prenatal și 63 postnatal, cu minimum 42 de zile postnatal obligatorii), iar cuantumul
        este de 85% din media venitului brut din ultimele 6 luni, plafonat la 12 salarii minime brute.
        Caracterul neimpozabil al indemnizației rezultă din art. 62 din Codul Fiscal.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Cuantumul exact poate varia în funcție de veniturile efective
        din perioada de referință și de eventuale luni cu venit incomplet. Pentru situații speciale
        consultă un contabil sau Casa de Asigurări de Sănătate. Vezi și{' '}
        <Link href="/calculator/concediu-medical/">calculatorul de concediu medical</Link> sau{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net/brut</Link>.
      </p>
    </CalculatorLayout>
  );
}
