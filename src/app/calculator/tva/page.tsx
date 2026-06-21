import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TvaCalculator } from '@/components/calculators/tva-calculator';

const SLUG = 'tva';
const TITLE = 'Calculator TVA 2026 — Adaugă sau Extrage TVA (21%)';
const DESCRIPTION =
  'Calculator TVA online 2026: adaugă TVA la un preț fără TVA sau extrage TVA dintr-un preț cu TVA. ' +
  'Cota standard 21% și cota redusă 11% (plus 9% pentru locuințe până în iulie 2026).';

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
      heading="Calculator TVA 2026"
      description="Adaugă sau extrage TVA rapid, cu cotele valabile în 2026: 21% standard, 11% redus și 9% tranzitoriu pentru locuințe."
      widget={<TvaCalculator />}
      faqs={[
        { q: 'Cât este TVA standard în România în 2026?', a: 'Cota standard de TVA este 21% (majorată de la 19% începând cu 1 august 2025). Cota redusă este 11% (a înlocuit fostele cote de 5% și 9%).' },
        { q: 'Cum extrag TVA dintr-un preț care include TVA?', a: 'Împarți prețul cu TVA la (1 + cota/100). Pentru 21%: net = preț / 1,21, iar TVA = preț − net (sau preț × 21/121). Calculatorul de mai sus o face automat.' },
        { q: 'Mai există cota de 9%?', a: 'Doar tranzitoriu, pentru livrarea de locuințe care îndeplinesc condițiile legale, până la 31 iulie 2026. În rest, cota redusă este 11%.' },
      ]}
    >
      <h2>Cotele de TVA în România în 2026</h2>
      <p>
        De la 1 august 2025 (Legea 141/2025), cota <strong>standard de TVA este 21%</strong>, iar cota
        <strong> redusă este 11%</strong> (a unificat fostele cote de 5% și 9%). O cotă de{' '}
        <strong>9%</strong> rămâne aplicabilă tranzitoriu pentru livrarea de locuințe care îndeplinesc
        condițiile legale, până la 31 iulie 2026.
      </p>
      <h2>Cum se calculează TVA</h2>
      <p>
        <strong>Adăugare</strong> (de la preț fără TVA): TVA = sumă × cotă / 100; preț cu TVA = sumă +
        TVA.
      </p>
      <p>
        <strong>Extragere</strong> (din preț cu TVA): preț fără TVA = sumă / (1 + cotă/100); TVA = sumă
        − preț fără TVA. Pentru 21%, TVA = sumă × 21 / 121.
      </p>
      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Pentru încadrarea corectă a cotei pe produsul/serviciul tău,
        consultă Codul Fiscal sau un contabil.
      </p>
    </CalculatorLayout>
  );
}
