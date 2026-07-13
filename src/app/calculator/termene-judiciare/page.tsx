import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TermeneCalculator } from '@/components/calculators/termene-calculator';

const SLUG = 'termene-judiciare';
const TITLE = 'Calculator Termene Judiciare 2026 — Exact, Gratuit, pe Loc';
const DESCRIPTION =
  'Calculează termenele procedurale (judiciare) conform Codului de Procedură Civilă și Penală: zile, săptămâni, luni sau ani, cu sărbătorile legale 2026 luate în calcul.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Termene Judiciare')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Termene Judiciare 2026"
      description="Calculează data împlinirii unui termen procedural pe zile, săptămâni, luni sau ani, conform Codului de Procedură Civilă (art. 181) și Penală (art. 269), cu sărbătorile legale luate în calcul."
      tldr="Termenele procedurale pe zile se calculează în sistemul zilelor libere (art. 181 CPC, identic în penal art. 269): nici ziua de început, nici cea de împlinire nu se socotesc, deci un termen de 5 zile acoperă 7 zile calendaristice, iar dacă ultima zi e în weekend sau sărbătoare se prelungește în prima zi lucrătoare."
      widget={<TermeneCalculator />}
      faqs={[
        {
          q: 'Cum se calculează un termen pe zile?',
          a: 'Termenele procedurale pe zile se calculează în sistemul „zile libere": nu se socotește nici ziua de la care începe să curgă termenul, nici ziua în care se împlinește (art. 181 alin. 1 pct. 2 CPC). Practic, un termen de 5 zile acoperă 7 zile calendaristice. Dacă ultima zi cade în weekend sau de sărbătoare, termenul se prelungește în prima zi lucrătoare.',
        },
        {
          q: 'Există diferență între termenele civile și cele penale?',
          a: 'Pentru termenele procedurale, NU. Atât Codul de Procedură Civilă (art. 181), cât și cel Penal (art. 269) folosesc același sistem de „zile libere" (ambele capete excluse). Sistemul „zile pline" (în care se socotesc ambele capete) se aplică doar măsurilor preventive — arest, control judiciar (art. 271 CPP).',
        },
        {
          q: 'Cum se calculează termenele pe luni sau ani?',
          a: 'Termenul pe luni sau ani se împlinește în ziua corespunzătoare din ultima lună sau ultimul an (art. 181 alin. 1 pct. 3). De exemplu, un termen de o lună care începe pe 15 iunie se împlinește pe 15 iulie. Dacă luna finală nu are zi corespunzătoare (de ex. 31), termenul se împlinește în ultima zi a lunii.',
        },
        {
          q: 'Ce se întâmplă dacă termenul se împlinește în weekend sau de sărbătoare?',
          a: 'Conform art. 181 alin. 2 CPC (și art. 269 alin. 4 CPP), dacă ultima zi a termenului cade într-o zi nelucrătoare (sâmbătă, duminică sau sărbătoare legală), termenul se prelungește până în prima zi lucrătoare următoare.',
        },
        {
          q: 'Actul trimis prin poștă sau e-mail în ultima zi este în termen?',
          a: 'Da. Actul depus la oficiul poștal prin scrisoare recomandată sau la un serviciu de curierat înăuntrul termenului este considerat făcut în termen (art. 183 CPC), chiar dacă ajunge la instanță mai târziu. Înalta Curte a extins regula și la fax și e-mail.',
        },
        {
          q: 'De când începe să curgă termenul pentru apel?',
          a: 'Ca regulă, termenul pentru exercitarea unei căi de atac curge de la comunicarea hotărârii, nu de la pronunțare. Ziua comunicării (dies a quo) nu se socotește în sistemul „zile libere" (art. 181 alin. 1 pct. 2 CPC), iar termenul se calculează începând cu ziua imediat următoare comunicării.',
        },
        {
          q: 'Cum dovedesc că am depus actul în termen prin poștă?',
          a: 'Dovada o face data poștei: ștampila oficiului poștal de pe plicul scrisorii recomandate sau recipisa de la serviciul de curierat. Conform art. 183 CPC, contează data predării către poștă, nu data la care actul ajunge efectiv la instanță, așa că păstrează recipisa cu data vizibilă.',
        },
        {
          q: 'Termenul de un an care începe pe 29 februarie când se împlinește?',
          a: 'Termenele pe ani se împlinesc în ziua corespunzătoare din ultimul an (art. 181 alin. 1 pct. 3). Când anul final nu are zi corespunzătoare — de exemplu 29 februarie într-un an nebisect — termenul se împlinește în ultima zi a acelei luni, adică 28 februarie. Aceeași regulă se aplică termenelor pe luni care încep pe data de 31.',
        },
      ]}
    >
      <h2>Ce sunt termenele procedurale</h2>
      <p>
        Termenele procedurale (sau judiciare) sunt intervalele în care trebuie îndeplinit un act de procedură — depunerea
        unei cereri, exercitarea unei căi de atac (apel, recurs), formularea unei întâmpinări. Calculul lor este
        reglementat de <strong>art. 181-183 din Codul de Procedură Civilă</strong> și de{' '}
        <strong>art. 269-271 din Codul de Procedură Penală</strong>.
      </p>

      <h2>Sistemul „zile libere”</h2>
      <p>
        Pentru termenele pe zile se folosește sistemul <strong>zilelor libere</strong>: nu se socotesc nici ziua de
        început (<em>dies a quo</em>), nici ziua de împlinire (<em>dies ad quem</em>). Astfel, un termen de 5 zile care
        începe luni acoperă 7 zile calendaristice. Acest sistem este <strong>identic</strong> în procedura civilă și în
        cea penală — diferența des invocată dintre civil și penal este, de fapt, un mit pentru termenele procedurale.
      </p>

      <h2>Termene pe săptămâni, luni și ani</h2>
      <p>
        Acestea se împlinesc în ziua corespunzătoare din ultima săptămână, lună sau ultimul an. Toggle-ul „zile libere /
        zile pline” nu le influențează. Un termen de 3 luni de pe 15 iunie se împlinește pe 15 septembrie; un termen de
        un an de pe 15 iunie 2026 se împlinește pe 15 iunie 2027.
      </p>

      <h2>Prelungirea în zi lucrătoare</h2>
      <p>
        Dacă ultima zi a termenului cade într-o zi nelucrătoare, termenul se prelungește până în prima zi lucrătoare.
        Calculatorul ia automat în calcul weekendurile și <strong>sărbătorile legale</strong> (inclusiv cele mobile —
        Paște, Rusalii).
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un termen de apel de <strong>30 de zile</strong> care curge de la comunicarea hotărârii, iar
        comunicarea s-a făcut <strong>vineri, 15 mai</strong>. În sistemul „zile libere”:
      </p>
      <ul>
        <li>
          <strong>Ziua de început</strong> (15 mai, ziua comunicării) <strong>nu se socotește</strong> — termenul începe
          să curgă de a doua zi.
        </li>
        <li>
          Numărăm 30 de zile calendaristice, începând cu 16 mai. A 30-a zi cade pe <strong>14 iunie</strong>.
        </li>
        <li>
          <strong>Ziua de împlinire</strong> nu se socotește nici ea, deci termenul se împlinește efectiv pe{' '}
          <strong>15 iunie</strong>.
        </li>
        <li>
          Dacă 15 iunie ar fi o zi nelucrătoare (weekend sau sărbătoare legală), termenul se prelungește în prima zi
          lucrătoare următoare, iar actul depus la poștă în acea zi este în termen (art. 183).
        </li>
      </ul>
      <p>
        Pentru orice termen critic, introdu data exactă în calculatorul de mai sus: el aplică automat excluderea ambelor
        capete și prelungirea în zi lucrătoare.
      </p>

      <h2>Tipuri uzuale de termene procedurale</h2>
      <p>
        Tabelul de mai jos rezumă câteva termene întâlnite frecvent. Toate se calculează cu același sistem de{' '}
        <strong>zile libere</strong> (ambele capete excluse) și se prelungesc în prima zi lucrătoare dacă ultima zi este
        nelucrătoare:
      </p>
      <table>
        <thead>
          <tr>
            <th>Act de procedură</th>
            <th>Termen orientativ</th>
            <th>De când curge (regulă)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Apel (drept comun)</td>
            <td>30 de zile</td>
            <td>De la comunicarea hotărârii</td>
          </tr>
          <tr>
            <td>Recurs (drept comun)</td>
            <td>30 de zile</td>
            <td>De la comunicarea hotărârii</td>
          </tr>
          <tr>
            <td>Întâmpinare</td>
            <td>25 de zile</td>
            <td>De la comunicarea cererii de chemare în judecată</td>
          </tr>
          <tr>
            <td>Contestație în anulare</td>
            <td>15 zile</td>
            <td>De la comunicarea hotărârii</td>
          </tr>
        </tbody>
      </table>
      <p>
        Termenele de mai sus sunt cele de drept comun; legi speciale pot prevedea termene diferite, mai scurte sau mai
        lungi. Verifică întotdeauna textul aplicabil cauzei tale.
      </p>

      <h2>Greșeli frecvente la calculul termenelor</h2>
      <ul>
        <li>
          <strong>Socotirea ambelor capete.</strong> Cea mai comună eroare este numărarea zilei de început și/sau a celei
          de împlinire. La termenele procedurale pe zile, ambele se exclud — atât în civil, cât și în penal.
        </li>
        <li>
          <strong>Confuzia civil / penal.</strong> Mulți cred că penalul folosește „zile pline”. Pentru termenele
          procedurale nu există această diferență; sistemul „zile pline” privește doar măsurile preventive (art. 271
          CPP).
        </li>
        <li>
          <strong>Ignorarea sărbătorilor mobile.</strong> Paștele și Rusaliile cad în date diferite în fiecare an;
          omiterea lor poate scurta artificial termenul cu una sau două zile.
        </li>
        <li>
          <strong>Calculul de la pronunțare, nu de la comunicare.</strong> Pentru căile de atac, termenul curge, ca
          regulă, de la comunicarea hotărârii, nu din ziua pronunțării.
        </li>
      </ul>

      <p>
        Vezi și <Link href="/calculator/taxa-judiciara-de-timbru/">calculatorul de taxă judiciară de timbru</Link>,{' '}
        <Link href="/calculator/reabilitare/">calculatorul de reabilitare</Link> sau, dacă ai nevoie de o decizie
        judecătorească definitivă, serviciul de{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar online</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Calculul concret poate depinde de natura termenului și de comunicarea actului; pentru un
        termen critic, verifică cu un avocat sau cu grefa instanței.
      </p>
    </CalculatorLayout>
  );
}
