import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ConcediuOdihnaCalculator } from '@/components/calculators/concediu-odihna-calculator';

const SLUG = 'zile-concediu-odihna';
const TITLE = 'Calculator Zile Concediu de Odihnă — Proporțional';
const DESCRIPTION =
  "Calculează zilele de concediu de odihnă cuvenite proporțional cu lunile lucrate (minim legal 20 de zile lucrătoare).";

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
      heading="Calculator Zile Concediu de Odihnă"
      description="Află câte zile de concediu de odihnă ți se cuvin proporțional cu perioada lucrată în anul curent."
      widget={<ConcediuOdihnaCalculator />}
      faqs={[
        { q: 'Câte zile de concediu de odihnă am pe an?', a: 'Minimul legal este de 20 de zile lucrătoare pe an (Codul Muncii, art. 145). Prin contract sau contract colectiv pot fi acordate mai multe (frecvent 21-25).' },
        { q: 'Cum se calculează concediul proporțional?', a: 'Dacă nu ai lucrat tot anul, zilele se acordă proporțional cu lunile lucrate: zile pe an × luni lucrate / 12.' },
        { q: 'Ce se întâmplă cu zilele neefectuate?', a: 'La încetarea contractului, zilele de concediu neefectuate se compensează în bani (indemnizație de concediu).' },
      ]}
    >
      <h2>Cum se calculează zilele de concediu de odihnă</h2>
      <p>
        Concediul de odihnă se acordă proporțional cu timpul lucrat:{' '}
        <strong>zile cuvenite = zile pe an × luni lucrate / 12</strong>. Numărul de zile pe an pornește
        de la minimul legal de <strong>20 de zile lucrătoare</strong> (Codul Muncii, art. 145), dar
        poate fi mai mare prin contract.
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă. Concediile suplimentare (pentru condiții deosebite, tineri sub 18 ani
        etc.) și regulile din contractul colectiv pot modifica rezultatul.
      </p>
    </CalculatorLayout>
  );
}
