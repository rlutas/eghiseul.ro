import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { AmendaCalculator } from '@/components/calculators/amenda-calculator';

const SLUG = 'amenda-circulatie';
const TITLE = 'Calculator Amendă Circulație 2026 + Puncte de Penalizare';
const DESCRIPTION =
  "Calculează amenda de circulație pe clase, plata redusă în 15 zile și punctele de penalizare pentru viteză (valori 2026).";

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
      heading="Calculator Amendă Circulație 2026"
      description="Estimează amenda rutieră pe clase și punctele de penalizare pentru depășirea de viteză, cu valoarea punctului-amendă valabilă în 2026."
      widget={<AmendaCalculator />}
      faqs={[
        { q: 'Cât este un punct-amendă în 2026?', a: 'Un punct-amendă valorează 10% din salariul minim brut: 405 lei până la 30 iunie 2026 și 432,50 lei de la 1 iulie 2026 (după majorarea salariului minim). Valoarea aplicată depinde de data contravenției.' },
        { q: 'Cât e amenda pentru depășirea de viteză?', a: 'Depinde de cât depășești: 2 puncte de penalizare (10-20 km/h), 3 (21-30), 4 (31-40), 6 (41+). Peste 50 km/h se adaugă suspendarea permisului 90 de zile, peste 70 km/h — 120 de zile.' },
        { q: 'Pot plăti jumătate din amendă?', a: 'Da, jumătate din minimul amenzii dacă plătești în 15 zile calendaristice de la primirea procesului-verbal.' },
        { q: 'Când mi se suspendă permisul pentru puncte?', a: 'La acumularea a 15 puncte de penalizare — suspendare 30 de zile. Punctele expiră în 6 luni de la data constatării.' },
        { q: 'Cum sunt împărțite amenzile pe clase?', a: 'Pentru persoane fizice, OUG 195/2002 prevede 4 clase de sancțiuni exprimate în puncte-amendă: clasa I (2-3 puncte), clasa a II-a (4-5 puncte), clasa a III-a (6-8 puncte) și clasa a IV-a (9-20 puncte). Agentul constatator alege valoarea din interval, iar suma în lei rezultă înmulțind punctele cu valoarea punctului-amendă din ziua contravenției.' },
        { q: 'De la ce dată se aplică valoarea de 432,50 lei pe punct?', a: 'Valoarea punctului-amendă este 10% din salariul minim brut, deci urmărește majorarea acestuia. Pentru contravenții constatate până la 30 iunie 2026 se aplică 405 lei/punct, iar pentru cele de la 1 iulie 2026 se aplică 432,50 lei/punct. Contează data procesului-verbal, nu data plății.' },
        { q: 'Punctele de penalizare afectează cazierul auto sau cel judiciar?', a: 'Punctele de penalizare se înregistrează în evidența rutieră a poliției, nu în cazierul judiciar. O amendă de circulație este o contravenție, nu o infracțiune, deci nu apare în cazierul judiciar. Anumite fapte grave (de exemplu conducerea sub influența alcoolului peste limita legală) sunt însă infracțiuni și pot genera o mențiune care necesită ulterior reabilitare.' },
      ]}
    >
      <h2>Cum se calculează amenda de circulație în 2026</h2>
      <p>
        Amenda se exprimă în <strong>puncte-amendă</strong>, iar un punct valorează 10% din salariul
        minim: <strong>405 lei</strong> până la 30 iunie 2026 și <strong>432,50 lei</strong> de la 1
        iulie 2026. Amenda se încadrează pe clase (I-IV pentru persoane fizice).
      </p>
      <h2>Puncte de penalizare și suspendare</h2>
      <p>
        Punctele de penalizare sunt separate de amendă și urmăresc riscul de suspendare. La{' '}
        <strong>15 puncte acumulate</strong> se suspendă permisul 30 de zile. Pentru viteză, peste 50
        km/h peste limită intervine suspendarea de 90 de zile, iar peste 70 km/h — 120 de zile.
      </p>
      <h2>Clasele de sancțiuni I-IV și valoarea în lei</h2>
      <p>
        OUG 195/2002 grupează amenzile pentru persoane fizice în patru clase, fiecare exprimată
        într-un interval de puncte-amendă. Suma în lei se obține înmulțind numărul de puncte cu
        valoarea punctului din ziua contravenției. Tabelul de mai jos arată echivalentul la cele
        două valori valabile în 2026:
      </p>
      <ul>
        <li>
          <strong>Clasa I</strong> (2-3 puncte): între 810 și 1.215 lei până la 30 iunie 2026,
          respectiv 865-1.297,50 lei de la 1 iulie 2026.
        </li>
        <li>
          <strong>Clasa a II-a</strong> (4-5 puncte): 1.620-2.025 lei, respectiv 1.730-2.162,50 lei.
        </li>
        <li>
          <strong>Clasa a III-a</strong> (6-8 puncte): 2.430-3.240 lei, respectiv 2.595-3.460 lei.
        </li>
        <li>
          <strong>Clasa a IV-a</strong> (9-20 puncte): 3.645-8.100 lei, respectiv 3.892,50-8.650 lei.
        </li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valori orientative. Numărul exact de puncte din interval și clasa aplicabilă se stabilesc de
        agentul constatator în funcție de fapta concretă.
      </p>
      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem o depășire de viteză cu 35 km/h peste limită, constatată pe 10 iulie 2026,
        încadrată într-o contravenție din <strong>clasa a III-a</strong> cu 6 puncte-amendă:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — valoarea punctului:</strong> fapta este după 1 iulie 2026, deci punctul
          valorează <strong>432,50 lei</strong>.
        </li>
        <li>
          <strong>Pasul 2 — amenda de bază:</strong> 6 puncte × 432,50 lei ={' '}
          <strong>2.595 lei</strong>.
        </li>
        <li>
          <strong>Pasul 3 — plata redusă în 15 zile:</strong> jumătate din minimul clasei. Dacă
          minimul clasei a III-a este 6 puncte, achiți <strong>3 puncte × 432,50 = 1.297,50 lei</strong>.
        </li>
        <li>
          <strong>Pasul 4 — puncte de penalizare:</strong> pentru 31-40 km/h se aplică{' '}
          <strong>4 puncte de penalizare</strong>, care se cumulează separat în evidența rutieră
          (suspendare la 15 puncte).
        </li>
      </ul>
      <p className="text-sm text-neutral-500">
        Exemplu orientativ; încadrarea reală pe clasă și numărul de puncte aparțin agentului
        constatator.
      </p>
      <h2>Greșeli frecvente și cazuri speciale</h2>
      <ul>
        <li>
          <strong>Plata redusă se aplică la minimul clasei, nu la suma din proces-verbal.</strong>{' '}
          Jumătatea se calculează din amenda minimă a clasei, chiar dacă agentul a aplicat o sumă
          mai mare din interval.
        </li>
        <li>
          <strong>Termenul de 15 zile este calendaristic</strong>, nu lucrător, și curge de la
          primirea procesului-verbal, nu de la data faptei.
        </li>
        <li>
          <strong>Punctele de penalizare nu sunt puncte-amendă.</strong> Primele măsoară riscul de
          suspendare (15 puncte → 30 de zile), celelalte exprimă cuantumul amenzii în lei.
        </li>
        <li>
          <strong>Suspendarea pentru viteză se cumulează cu cea pentru puncte.</strong> Peste 50
          km/h peste limită — 90 de zile; peste 70 km/h — 120 de zile, independent de cele 15 puncte
          acumulate.
        </li>
        <li>
          <strong>Faptele grave pot fi infracțiuni, nu contravenții.</strong> Conducerea sub
          influența alcoolului peste limita legală sau fără permis depășește cadrul amenzii și poate
          lăsa o mențiune în cazierul judiciar — caz în care, ulterior, poate fi nevoie de{' '}
          <Link href="/calculator/reabilitare/">calculul termenului de reabilitare</Link> sau de
          obținerea unui{' '}
          <Link href="/servicii/cazier-judiciar-online/">cazier judiciar online</Link>.
        </li>
      </ul>
      <p className="text-sm text-neutral-500">
        Estimare orientativă conform OUG 195/2002. Suma exactă în limita clasei și încadrarea o
        stabilește agentul constatator.
      </p>
    </CalculatorLayout>
  );
}
