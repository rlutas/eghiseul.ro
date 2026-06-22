import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TermeneCalculator } from '@/components/calculators/termene-calculator';

const SLUG = 'termene-judiciare';
const TITLE = 'Calculator Termene Judiciare 2026 — Termene Procedurale';
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

      <p>
        Vezi și <Link href="/calculator/taxa-judiciara-de-timbru/">calculatorul de taxă judiciară de timbru</Link> sau{' '}
        <Link href="/calculator/reabilitare/">calculatorul de reabilitare</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Calculul concret poate depinde de natura termenului și de comunicarea actului; pentru un
        termen critic, verifică cu un avocat sau cu grefa instanței.
      </p>
    </CalculatorLayout>
  );
}
