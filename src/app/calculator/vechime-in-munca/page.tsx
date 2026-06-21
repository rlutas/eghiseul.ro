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
    </CalculatorLayout>
  );
}
