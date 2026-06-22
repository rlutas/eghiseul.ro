import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { VarstaPensionareCalculator } from '@/components/calculators/varsta-pensionare-calculator';

const SLUG = 'varsta-pensionare';
const TITLE = 'Calculator Vârstă de Pensionare 2026 — Când Ies la Pensie';
const DESCRIPTION =
  'Află vârsta standard de pensionare și data ieșirii la pensie în funcție de sex și data nașterii, conform Anexei 5 din Legea 360/2023.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Vârstă Pensionare')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Vârstă de Pensionare"
      description="Calculează vârsta standard de pensionare, data ieșirii la pensie și stagiile de cotizare, pe baza datei nașterii și a sexului (Anexa 5, Legea 360/2023)."
      widget={<VarstaPensionareCalculator />}
      faqs={[
        {
          q: 'Care este vârsta de pensionare în România în 2026?',
          a: 'Vârsta standard de pensionare crește treptat până la egalizarea la 65 de ani pentru femei și bărbați. Bărbații au deja 65 de ani (pentru cei născuți după 1950), iar pentru femei vârsta urcă gradual: femeile născute din ianuarie 1970 se pensionează tot la 65 de ani.',
        },
        {
          q: 'Cât este stagiul complet de cotizare?',
          a: 'Stagiul complet de cotizare crește treptat la 35 de ani. Stagiul minim necesar pentru o pensie pentru limită de vârstă este de 15 ani. Valorile exacte depind de data nașterii (Anexa 5 din Legea 360/2023).',
        },
        {
          q: 'Pot ieși la pensie mai devreme?',
          a: 'Da, prin pensie anticipată sau anticipată parțială, dacă ai realizat un stagiu de cotizare mai mare decât cel complet. Pensia anticipată parțială se acordă cu cel mult 5 ani înainte de vârsta standard, cu o penalizare ce depinde de stagiul depășit.',
        },
        {
          q: 'De ce vârsta de pensionare diferă pe luni?',
          a: 'În perioada de tranziție, vârsta standard crește lună de lună în funcție de data exactă a nașterii, conform tabelului din Anexa 5. De aceea două persoane născute în luni diferite ale aceluiași an pot avea vârste de pensionare ușor diferite.',
        },
        {
          q: 'Ce se întâmplă dacă nu am stagiul minim de 15 ani?',
          a: 'Fără cele 15 ani de stagiu minim de cotizare nu se poate acorda pensia pentru limită de vârstă, indiferent de vârsta atinsă. Persoanele aflate în această situație pot solicita pensie socială minimă garantată sau pot continua să cotizeze pentru a atinge pragul de 15 ani.',
        },
        {
          q: 'Femeile se pot pensiona la aceeași vârstă ca bărbații?',
          a: 'În perioada de tranziție femeile au, în general, o vârstă standard mai mică decât bărbații. Odată cu egalizarea, femeile născute începând cu ianuarie 1970 se pensionează tot la 65 de ani, ca și bărbații născuți după 1950. O femeie poate opta și pentru pensionare la vârsta bărbaților dacă dorește un stagiu suplimentar.',
        },
        {
          q: 'Stagiul peste cel complet îmi crește pensia?',
          a: 'Da. Stagiul de cotizare realizat peste cel complet (35 de ani) este valorificat și poate deschide accesul la pensie anticipată, fără penalizare în cazul anticipatei complete cu stagiu suficient depășit. În plus, fiecare an cotizat suplimentar adaugă puncte la calculul cuantumului.',
        },
      ]}
    >
      <h2>Cum se stabilește vârsta de pensionare</h2>
      <p>
        Vârsta standard de pensionare este stabilită în <strong>Anexa 5 din Legea 360/2023</strong>, în funcție de sex și
        de luna și anul nașterii. În perioada de tranziție, vârsta crește gradual, urmând ca femeile și bărbații să se
        pensioneze la <strong>65 de ani</strong> după finalizarea tranziției.
      </p>

      <h2>Egalizarea la 65 de ani</h2>
      <p>
        Bărbații născuți după 1950 se pensionează deja la 65 de ani. Pentru femei, vârsta urcă treptat de la 57-60 de ani
        (generațiile mai vechi) până la 65 de ani pentru cele născute începând cu ianuarie 1970. Stagiul complet de
        cotizare ajunge la 35 de ani, iar stagiul minim rămâne 15 ani.
      </p>

      <h2>Pensionare anticipată</h2>
      <p>
        Dacă ai un stagiu de cotizare mai mare decât cel complet, te poți pensiona anticipat (cu până la 5 ani mai
        devreme). Vezi și <Link href="/calculator/impozit-pensie/">calculatorul de impozit pe pensie</Link> și{' '}
        <Link href="/calculator/vechime-in-munca/">calculatorul de vechime în muncă</Link>.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem o <strong>femeie născută în ianuarie 1970</strong>. Pentru a estima când iese la pensie, parcurgem
        următorii pași:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — identifici vârsta standard.</strong> Pentru femeile născute începând cu ianuarie 1970,
          tranziția s-a finalizat, deci vârsta standard de pensionare este <strong>65 de ani</strong> (egalizarea cu
          bărbații).
        </li>
        <li>
          <strong>Pasul 2 — calculezi data ieșirii la pensie.</strong> Ianuarie 1970 plus 65 de ani înseamnă că dreptul
          la pensie pentru limită de vârstă se deschide în <strong>ianuarie 2035</strong>.
        </li>
        <li>
          <strong>Pasul 3 — verifici stagiul.</strong> Ai nevoie de minimum 15 ani de cotizare pentru a primi pensie. Cu
          un stagiu complet de 35 de ani realizat integral, primești pensia fără reducerea aferentă stagiului
          incomplet.
        </li>
        <li>
          <strong>Pasul 4 — verifici opțiunea anticipată.</strong> Dacă la 60 de ani persoana are deja un stagiu mai
          mare decât cel complet de 35 de ani, se poate pensiona anticipat, cu cel mult 5 ani înainte de vârsta
          standard.
        </li>
      </ul>
      <p>
        Pentru un <strong>bărbat născut după 1950</strong>, pasul 1 este direct: vârsta standard este deja 65 de ani,
        fără tranziție, iar data ieșirii la pensie se obține adăugând 65 de ani la luna nașterii.
      </p>

      <h2>Tabel orientativ vârstă și stagiu</h2>
      <p>
        Tabelul de mai jos rezumă reperele din Anexa 5 pentru câteva situații tipice. Sunt valori de referință după
        finalizarea tranziției; în interiorul perioadei de tranziție vârsta crește gradual, lună de lună.
      </p>
      <table>
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Vârstă standard</th>
            <th>Stagiu complet</th>
            <th>Stagiu minim</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bărbați născuți după 1950</td>
            <td>65 de ani</td>
            <td>35 de ani</td>
            <td>15 ani</td>
          </tr>
          <tr>
            <td>Femei născute din ianuarie 1970</td>
            <td>65 de ani</td>
            <td>35 de ani</td>
            <td>15 ani</td>
          </tr>
          <tr>
            <td>Femei în tranziție (generații mai vechi)</td>
            <td>de la 57 spre 65 de ani</td>
            <td>spre 35 de ani</td>
            <td>15 ani</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confuzia dintre vârstă și stagiu.</strong> Atingerea vârstei standard nu este suficientă: ai nevoie și
          de cei 15 ani de stagiu minim de cotizare pentru a primi pensie pentru limită de vârstă.
        </li>
        <li>
          <strong>Presupunerea că toate femeile ies la 65 de ani.</strong> Egalizarea la 65 de ani vizează femeile
          născute începând cu ianuarie 1970; generațiile mai vechi se pensionează în interiorul tranziției, la vârste
          mai mici care urcă gradual.
        </li>
        <li>
          <strong>Ignorarea lunii nașterii.</strong> În tranziție, vârsta standard se modifică lună de lună, deci anul
          nașterii singur nu este suficient pentru o estimare exactă.
        </li>
        <li>
          <strong>Confuzia anticipatei cu pensia normală.</strong> Pensionarea anticipată parțială vine cu o penalizare
          care depinde de stagiul depășit; cea anticipată completă presupune un stagiu de cotizare mai mare decât cel
          complet.
        </li>
      </ul>

      <h2>Cazuri speciale</h2>
      <p>
        Anumite categorii beneficiază de condiții diferite față de regula generală. Persoanele care au lucrat în
        <strong> condiții deosebite sau speciale de muncă</strong> pot avea reduceri de vârstă standard, în funcție de
        perioadele cotizate în aceste condiții. La fel, stagiul realizat peste cel complet de 35 de ani deschide accesul
        la pensionare anticipată, iar fiecare an cotizat suplimentar este valorificat în calculul punctajului. Pentru
        formalitățile administrative legate de dosarul de pensie poți consulta și{' '}
        <Link href="/servicii/">serviciile noastre online</Link>, iar pentru estimarea reținerilor din pensie folosește{' '}
        <Link href="/calculator/impozit-pensie/">calculatorul de impozit pe pensie</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă pe baza Anexei 5 (Legea 360/2023). Cuantumul efectiv al pensiei depinde de numărul de puncte
        și de valoarea punctului de pensie. Pentru situația ta exactă, verifică la Casa Națională de Pensii Publice.
      </p>
    </CalculatorLayout>
  );
}
