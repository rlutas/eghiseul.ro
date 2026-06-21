import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SalariuCalculator } from '@/components/calculators/salariu-calculator';

const SLUG = 'salariu';
const TITLE = 'Calculator Salariu Net/Brut 2026 — Din Brut în Net';
const DESCRIPTION =
  'Calculator salariu 2026: convertești brut în net și invers, cu CAS 25%, CASS 10%, impozit 10% ' +
  'și deducerea personală. Include actualizarea salariului minim de la 1 iulie 2026.';

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
      heading="Calculator Salariu Net/Brut 2026"
      description="Calculează salariul net din brut (sau invers) cu ratele valabile în 2026 — CAS, CASS, impozit și deducerea personală — plus costul total pentru angajator."
      widget={<SalariuCalculator />}
      faqs={[
        { q: 'Ce rețineri se aplică la salariu în 2026?', a: 'Din salariul brut se rețin: CAS (pensie) 25%, CASS (sănătate) 10% și impozit pe venit 10% (după scăderea contribuțiilor și a deducerii personale). Angajatorul plătește în plus CAM 2,25%.' },
        { q: 'Cât e salariul minim brut în 2026?', a: 'Salariul minim brut este 4.050 lei în perioada ianuarie–iunie 2026 și crește la 4.325 lei de la 1 iulie 2026. Calculatorul ține cont de perioada selectată.' },
        { q: 'Ce este deducerea personală?', a: 'O sumă scutită de impozit, acordată dacă salariul brut nu depășește salariul minim + 2.000 lei. Depinde de numărul de persoane în întreținere și scade treptat pe măsură ce salariul crește.' },
        { q: 'Mai există scutirea de impozit pentru IT?', a: 'Nu. Facilitățile sectoriale (IT, construcții, agricultură) au fost eliminate din 2025. În 2026 toți angajații se calculează cu aceleași rate: 25% / 10% / 10%.' },
      ]}
    >
      <h2>Cum se calculează salariul net din brut în 2026</h2>
      <p>Din salariul brut se scad, în ordine:</p>
      <ul>
        <li><strong>CAS (contribuția la pensie): 25%</strong> din brut;</li>
        <li><strong>CASS (contribuția la sănătate): 10%</strong> din brut;</li>
        <li><strong>impozit pe venit: 10%</strong>, aplicat după scăderea CAS, CASS și a deducerii personale.</li>
      </ul>
      <p>
        <strong>Salariul net = brut − CAS − CASS − impozit.</strong> Angajatorul mai plătește, peste
        brut, contribuția asiguratorie pentru muncă (CAM) de 2,25%.
      </p>
      <h2>Salariul minim și deducerea personală</h2>
      <p>
        Salariul minim brut este <strong>4.050 lei</strong> (ianuarie–iunie 2026) și{' '}
        <strong>4.325 lei</strong> de la 1 iulie 2026. La salariul minim cu normă întreagă se aplică o
        scutire de impozit. Deducerea personală se acordă dacă brutul nu depășește salariul minim +
        2.000 lei și depinde de numărul de persoane în întreținere.
      </p>
      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Pentru situații speciale (mai multe locuri de muncă, venituri
        din alte surse) consultă un contabil.
      </p>
    </CalculatorLayout>
  );
}
