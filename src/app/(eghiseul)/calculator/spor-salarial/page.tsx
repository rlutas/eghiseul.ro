import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SporSalarialCalculator } from '@/components/calculators/spor-salarial-calculator';

const SLUG = 'spor-salarial';
const TITLE = 'Calculator Spor Noapte și Ore Suplimentare 2026';
const DESCRIPTION =
  'Calculator spor noapte (25%), ore suplimentare (75%) și muncă în sărbători legale (100%) conform Codului Muncii 2026. Estimează rapid suma cuvenită.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Spor Noapte și Ore Suplimentare')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Spor Noapte și Ore Suplimentare 2026"
      description="Calculează sporurile cuvenite conform Codului Muncii — spor de noapte (minim 25%), ore suplimentare (minim 75%) și muncă în sărbători legale (minim 100%). Acestea sunt minime legale; contractul colectiv de muncă poate prevedea procente mai mari."
      tldr="Conform Codului Muncii (Legea 53/2003), sporul de noapte este de minim 25% (art. 126), orele suplimentare se plătesc cu minim 75% (art. 123), iar munca în sărbători legale cu minim 100% — plată dublă (art. 142). Sunt minime legale; CCM-ul poate prevedea procente mai mari."
      widget={<SporSalarialCalculator />}
      faqs={[
        {
          q: 'Cât este sporul de noapte conform Codului Muncii?',
          a: 'Sporul de noapte este de minim 25% din salariul de bază, conform art. 126 din Codul Muncii, pentru munca prestată între orele 22:00 și 06:00. Este un minim legal — contractul colectiv de muncă (CCM) poate prevedea un procent mai mare.',
        },
        {
          q: 'Cum se plătesc orele suplimentare?',
          a: 'Conform art. 123 din Codul Muncii, dacă orele suplimentare nu se compensează cu timp liber plătit în următoarele 60 de zile, ele se plătesc cu un spor de minim 75% din salariul de bază, corespunzător duratei muncii suplimentare.',
        },
        {
          q: 'Cât primesc dacă lucrez de sărbătorile legale?',
          a: 'Munca prestată în zilele de sărbătoare legală se plătește cu un spor de minim 100% din salariul de bază (adică dublu), conform art. 142 din Codul Muncii, dacă munca în aceste zile nu a fost compensată cu timp liber.',
        },
        {
          q: 'Pot fi sporurile mai mari decât minimele din lege?',
          a: 'Da. Procentele din Codul Muncii (25% noapte, 75% ore suplimentare, 100% sărbători) sunt minime legale. Contractul colectiv de muncă sau contractul individual de muncă pot stabili sporuri mai mari, dar niciodată mai mici.',
        },
        {
          q: 'Ce înseamnă munca de noapte?',
          a: 'Munca de noapte este cea prestată în intervalul orar 22:00–06:00, conform art. 126 din Codul Muncii. Pentru orele lucrate în acest interval se acordă sporul de noapte de minim 25%.',
        },
        {
          q: 'Cum se calculează tariful orar pentru sporuri?',
          a: 'Tariful orar se obține împărțind salariul de bază lunar la numărul de ore lucrătoare din luna respectivă. De exemplu, la un salariu de bază de 4.950 lei și 165 de ore lucrătoare, tariful orar este de 30 lei. Pe baza acestui tarif se calculează apoi fiecare spor: 25% pentru noapte, 75% pentru ore suplimentare, 100% pentru sărbători.',
        },
        {
          q: 'Se pot cumula sporul de noapte și cel pentru ore suplimentare?',
          a: 'Da. Dacă orele suplimentare sunt prestate în intervalul de noapte (22:00–06:00) și nu sunt compensate cu timp liber, se pot aplica ambele sporuri: cel de noapte de minim 25% și cel pentru ore suplimentare de minim 75%, fiecare raportat la salariul de bază. CCM-ul poate stabili modul exact de cumulare.',
        },
      ]}
    >
      <h2>Cum se calculează sporurile salariale în 2026</h2>
      <p>
        Codul Muncii stabilește procente minime pentru munca prestată în condiții deosebite. Toate
        sporurile se raportează la salariul de bază (de regulă, la tariful orar rezultat din salariul
        lunar împărțit la numărul de ore lucrătoare):
      </p>
      <ul>
        <li>
          <strong>spor de noapte: minim 25%</strong> din salariul de bază, pentru orele lucrate între
          22:00 și 06:00 (art. 126);
        </li>
        <li>
          <strong>ore suplimentare: minim 75%</strong> din salariul de bază, dacă nu se compensează cu
          timp liber plătit (art. 123);
        </li>
        <li>
          <strong>muncă în sărbători legale: minim 100%</strong> din salariul de bază, adică plată
          dublă (art. 142).
        </li>
      </ul>
      <p>
        Acestea sunt <strong>minime legale</strong>. Contractul colectiv de muncă aplicabil la nivel de
        unitate poate prevedea procente mai mari — verifică întotdeauna CCM-ul firmei tale.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un tarif orar de <strong>30 lei</strong> și calculăm sumele suplimentare cuvenite
        pentru fiecare tip de muncă:
      </p>
      <ul>
        <li>
          <strong>4 ore de noapte:</strong> sporul de 25% înseamnă 30 × 25% = 7,50 lei în plus pe oră,
          deci 4 × 7,50 = <strong>30 lei spor</strong> peste plata normală;
        </li>
        <li>
          <strong>3 ore suplimentare:</strong> sporul de 75% înseamnă 30 × 75% = 22,50 lei în plus pe
          oră, deci 3 × 22,50 = <strong>67,50 lei spor</strong> peste plata orelor;
        </li>
        <li>
          <strong>8 ore în sărbătoare legală:</strong> sporul de 100% înseamnă plată dublă, adică 8 × 30
          = 240 lei suplimentar față de plata normală, deci <strong>240 lei spor</strong>.
        </li>
      </ul>
      <p>
        Sporul se adaugă peste plata normală a orelor respective. Folosește calculatorul de mai sus
        pentru a obține rapid sumele pornind de la propriul salariu de bază.
      </p>

      <h2>Tabel comparativ al sporurilor</h2>
      <p>
        Pentru a vedea rapid cât reprezintă fiecare spor în lei, tabelul de mai jos pornește de la un
        tarif orar de <strong>30 lei</strong> și arată suma suplimentară cuvenită pentru o oră de muncă,
        peste plata normală:
      </p>
      <table>
        <thead>
          <tr>
            <th>Tip de muncă</th>
            <th>Articol</th>
            <th>Spor minim</th>
            <th>Spor pe oră (la 30 lei)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Muncă de noapte (22:00–06:00)</td>
            <td>art. 126</td>
            <td>25%</td>
            <td>7,50 lei</td>
          </tr>
          <tr>
            <td>Ore suplimentare (necompensate)</td>
            <td>art. 123</td>
            <td>75%</td>
            <td>22,50 lei</td>
          </tr>
          <tr>
            <td>Sărbătoare legală (necompensată)</td>
            <td>art. 142</td>
            <td>100%</td>
            <td>30 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Tariful orar se obține împărțind salariul de bază lunar la numărul de ore lucrătoare din luna
        respectivă. Deoarece numărul de ore diferă de la o lună la alta, și valoarea exactă a sporului
        pe oră variază ușor în cursul anului.
      </p>

      <h2>Cazuri speciale</h2>
      <ul>
        <li>
          <strong>Spor de noapte cumulat cu ore suplimentare.</strong> Dacă lucrezi peste program în
          intervalul 22:00–06:00, se pot cumula ambele sporuri: cel de noapte (minim 25%) și cel pentru
          orele suplimentare (minim 75%), fiecare raportat la salariul de bază.
        </li>
        <li>
          <strong>Program de noapte reglementat aparte.</strong> Pentru salariații care lucrează cel
          puțin 3 ore în intervalul de noapte sau care prestează cel puțin 30% din timpul lunar de lucru
          noaptea, Codul Muncii prevede, ca alternativă la spor, reducerea programului cu o oră — fără
          diminuarea salariului. Verifică ce variantă aplică angajatorul tău.
        </li>
        <li>
          <strong>Sărbătoare care cade într-o zi de noapte.</strong> Munca prestată noaptea, într-o zi de
          sărbătoare legală, poate beneficia atât de sporul de 100% pentru sărbătoare, cât și de cel de
          25% pentru noapte, conform clauzelor din CCM.
        </li>
        <li>
          <strong>Sporuri prevăzute suplimentar în CCM.</strong> Pe lângă cele trei sporuri minime din
          lege, contractul colectiv poate include sporuri pentru condiții grele, vechime sau lucru în
          zilele de weekend, care se adaugă la calcul.
        </li>
      </ul>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Compensarea cu timp liber.</strong> Orele suplimentare se plătesc cu spor doar dacă
          nu sunt compensate cu timp liber plătit. Dacă angajatorul acordă timp liber, sporul de 75% nu
          se mai aplică.
        </li>
        <li>
          <strong>Confundarea intervalului de noapte.</strong> Sporul de noapte se acordă doar pentru
          orele dintre 22:00 și 06:00 — nu pentru tot schimbul, dacă acesta depășește intervalul.
        </li>
        <li>
          <strong>Considerarea minimelor drept fixe.</strong> Procentele din lege sunt minime; dacă
          CCM-ul prevede mai mult (de exemplu 30% spor de noapte), se aplică valoarea mai mare.
        </li>
        <li>
          <strong>Sărbători legale neacordate ca zile libere.</strong> Sporul de 100% se cuvine doar
          când munca în sărbătoare nu a fost compensată cu o zi liberă.
        </li>
      </ul>

      <h2>Context legal</h2>
      <p>
        Drepturile salariale pentru munca în condiții speciale sunt reglementate de Codul Muncii (Legea
        nr. 53/2003): art. 123 pentru orele suplimentare, art. 126 pentru munca de noapte și art. 142
        pentru munca în zilele de sărbătoare legală. Aceste norme stabilesc un prag minim sub care
        sporurile nu pot coborî, indiferent de înțelegerea dintre părți. Negocierile colective sau
        individuale pot doar îmbunătăți aceste condiții.
      </p>
      <p>
        Dacă vrei să vezi cum se reflectă sporurile în salariul net final, folosește{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net/brut</Link>. Pentru calculul
        zilelor de concediu cuvenite, consultă{' '}
        <Link href="/calculator/zile-concediu-odihna/">calculatorul de zile de concediu de odihnă</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și se bazează pe minimele prevăzute de Codul Muncii. Sumele reale
        pot diferi în funcție de contractul colectiv de muncă, de modul de compensare a orelor și de
        alte clauze contractuale. Pentru situații concrete, consultă fluturașul de salariu sau un
        specialist în resurse umane.
      </p>
    </CalculatorLayout>
  );
}
