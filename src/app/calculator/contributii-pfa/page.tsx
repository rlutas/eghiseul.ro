import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PfaCalculator } from '@/components/calculators/pfa-calculator';

const SLUG = 'contributii-pfa';
const TITLE = 'Calculator Contribuții PFA 2026 (CAS, CASS, Impozit)';
const DESCRIPTION =
  'Calculează contribuțiile PFA pentru Declarația Unică: CASS 10%, CAS 25% și impozit 10%, cu ' +
  'plafoanele 2026 raportate la salariul minim. Estimare rapidă a totalului de plată.';

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
      <p className="text-sm text-neutral-500">
        Estimare orientativă pentru Declarația Unică. Pentru normă de venit, activități multiple sau
        situații speciale, consultă un contabil.
      </p>
    </CalculatorLayout>
  );
}
