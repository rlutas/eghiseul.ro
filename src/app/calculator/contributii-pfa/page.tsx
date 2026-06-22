import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PfaCalculator } from '@/components/calculators/pfa-calculator';

const SLUG = 'contributii-pfa';
const TITLE = 'Calculator Contribuții PFA 2026 (CAS, CASS, Impozit)';
const DESCRIPTION =
  "Calculează contribuțiile PFA pentru Declarația Unică 2026: CASS 10%, CAS 25% și impozit 10%, cu plafoanele pe salariul minim.";

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
      heading="Calculator Contribuții PFA 2026"
      description="Estimează contribuțiile și impozitul de plată pentru o PFA (Declarația Unică): CASS, CAS și impozit pe venit, cu plafoanele în vigoare."
      widget={<PfaCalculator />}
      faqs={[
        { q: 'Ce contribuții plătește o PFA în 2026?', a: 'CASS 10% (sănătate), CAS 25% (pensie, doar peste 12 salarii minime) și impozit pe venit 10%. CASS și CAS se scad din baza impozitului.' },
        { q: 'Care sunt plafoanele pentru CAS și CASS?', a: 'Plafoanele se raportează la salariul minim de la 1 ianuarie al anului de venit (4.050 lei). CAS se datorează la 12 sau 24 salarii minime în funcție de venit; CASS are minim 6 salarii minime și plafon de 60 (venit 2025) sau 72 (venit 2026) salarii minime.' },
        { q: 'Dacă sunt și salariat, mai plătesc CASS la PFA?', a: 'Dacă ești deja asigurat din altă sursă (salariat sau pensionar) și venitul din PFA e sub 6 salarii minime, nu datorezi CASS minim. Bifează opțiunea în calculator.' },
        { q: 'Când se depune Declarația Unică?', a: 'Declarația Unică pentru venitul realizat anul anterior se depune și se plătește până pe 25 mai. Plata anticipată poate aduce o bonificație.' },
        { q: 'Ce înseamnă plafonul de 6, 12, 24, 60 sau 72 de salarii minime?', a: 'Sunt praguri de venit net raportate la salariul minim de la 1 ianuarie (4.050 lei). 6 SM = pragul minim de la care datorezi CASS; 12 SM = pragul de la care apare CAS; 24 SM = baza maximă pentru CAS; 60 SM (venit 2025) sau 72 SM (venit 2026) = plafonul maxim pentru CASS. Peste plafon, baza rămâne la nivelul plafonului.' },
        { q: 'Cum se calculează impozitul de 10% la PFA?', a: 'Impozitul de 10% se aplică pe venitul net din care s-au scăzut CAS și CASS efectiv datorate. Adică: impozit = 10% × (venit net − CAS datorat − CASS datorat). Contribuțiile reduc deci baza impozabilă.' },
        { q: 'Plătesc CAS dacă am venituri mici la PFA?', a: 'Nu. CAS (pensia, 25%) se datorează doar dacă venitul net depășește 12 salarii minime (48.600 lei în 2026). Sub acest prag CAS este zero, dar poți opta voluntar pentru a-ți construi stagiu de cotizare la pensie.' },
      ]}
    >
      <h2>Cum se calculează contribuțiile PFA în 2026</h2>
      <p>O PFA în sistem real datorează, pe venitul net (brut − cheltuieli deductibile):</p>
      <ul>
        <li><strong>CASS (sănătate) 10%</strong> — pe venitul net, între un minim (6 salarii minime) și un plafon (60 sau 72 salarii minime, după anul de venit);</li>
        <li><strong>CAS (pensie) 25%</strong> — doar dacă venitul depășește 12 salarii minime; baza este 12 sau 24 salarii minime;</li>
        <li><strong>impozit pe venit 10%</strong> — pe venitul net, după scăderea CAS și CASS datorate.</li>
      </ul>
      <p>
        Plafoanele folosesc salariul minim de la <strong>1 ianuarie al anului de venit (4.050 lei)</strong> —
        creșterea de la mijlocul anului nu le afectează.
      </p>

      <h2>Pragurile pe salariul minim (4.050 lei) în 2026</h2>
      <p>
        Toate plafoanele se calculează la salariul minim de la <strong>1 ianuarie al anului de venit</strong>.
        Pentru venitul realizat în 2026, salariul minim de referință este <strong>4.050 lei</strong>:
      </p>
      <ul>
        <li><strong>6 salarii minime = 24.300 lei</strong> — pragul de la care datorezi CASS (sub el, dacă nu ești asigurat din altă parte, datorezi totuși CASS minim la 6 SM);</li>
        <li><strong>12 salarii minime = 48.600 lei</strong> — pragul de la care apare CAS și baza minimă de calcul a pensiei;</li>
        <li><strong>24 salarii minime = 97.200 lei</strong> — baza maximă pe care se calculează CAS;</li>
        <li><strong>60 salarii minime = 243.000 lei</strong> — plafonul CASS pentru venitul realizat în 2025;</li>
        <li><strong>72 salarii minime = 291.600 lei</strong> — plafonul CASS pentru venitul realizat în 2026.</li>
      </ul>

      <h2>Exemplu de calcul: venit net de 300.000 lei (2026)</h2>
      <p>Să presupunem o PFA în sistem real cu un venit net (după cheltuieli deductibile) de 300.000 lei în 2026:</p>
      <ul>
        <li>
          <strong>CASS 10%:</strong> venitul depășește plafonul de 72 SM (291.600 lei), deci baza se oprește la plafon.
          CASS = 10% × 291.600 = <strong>29.160 lei</strong>.
        </li>
        <li>
          <strong>CAS 25%:</strong> venitul depășește 24 SM (97.200 lei), deci baza este 24 SM.
          CAS = 25% × 97.200 = <strong>24.300 lei</strong>.
        </li>
        <li>
          <strong>Impozit 10%:</strong> se aplică pe venitul net minus contribuțiile datorate.
          Impozit = 10% × (300.000 − 29.160 − 24.300) = 10% × 246.540 = <strong>24.654 lei</strong>.
        </li>
      </ul>
      <p>
        Total de plată prin Declarația Unică: 29.160 + 24.300 + 24.654 = <strong>78.114 lei</strong>.
        Restul de <strong>221.886 lei</strong> rămâne venit net după contribuții și impozit.
      </p>
      <p className="text-sm text-neutral-500">
        Valori orientative. Plafoanele depind de salariul minim al anului de venit și de eventuale modificări
        legislative aflate în clarificare la momentul depunerii.
      </p>

      <h2>Greșeli frecvente la calculul contribuțiilor PFA</h2>
      <ul>
        <li><strong>Confuzia între venitul brut și venitul net.</strong> Contribuțiile se calculează pe venitul net (încasări minus cheltuieli deductibile), nu pe încasări.</li>
        <li><strong>Folosirea salariului minim greșit.</strong> Conta plafonul de la 1 ianuarie al anului de venit (4.050 lei), nu cel majorat de la mijlocul anului.</li>
        <li><strong>Plata CAS sub prag.</strong> CAS nu se datorează obligatoriu dacă venitul net e sub 12 salarii minime — doar opțional.</li>
        <li><strong>Uitarea scăderii contribuțiilor din baza impozitului.</strong> Impozitul de 10% se aplică după ce scazi CAS și CASS, nu pe tot venitul net.</li>
        <li><strong>Nedeclararea CASS minim când nu ai alt venit.</strong> O PFA fără alte venituri datorează CASS minim la 6 SM, chiar dacă venitul net e zero sau sub prag.</li>
      </ul>

      <h2>Calculatoare și servicii utile</h2>
      <p>
        Dacă ești salariat și PFA în paralel, verifică și{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net</Link> pentru a vedea contribuțiile reținute
        deja de angajator. Pentru deschiderea sau modificarea unei PFA la Registrul Comerțului, vezi{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar online</Link>, document adesea cerut în
        relația cu instituțiile.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă pentru Declarația Unică. Pentru normă de venit, activități multiple sau
        situații speciale, consultă un contabil.
      </p>
    </CalculatorLayout>
  );
}
