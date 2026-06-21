import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitChirieCalculator } from '@/components/calculators/impozit-chirie-calculator';

const SLUG = 'impozit-chirie';
const TITLE = 'Calculator Impozit pe Chirie 2026 — Venituri din Închiriere';
const DESCRIPTION =
  'Calculează impozitul pe venitul din chirii în 2026: 10% pe venitul net (cu deducere forfetară ' +
  'de 20%), plus CASS pe plafoane, cu declarare prin Declarația Unică.';

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
      heading="Calculator Impozit pe Chirie 2026"
      description="Estimează impozitul și CASS pe veniturile din închiriere, conform regulilor fiscale în vigoare în 2026."
      widget={<ImpozitChirieCalculator />}
      faqs={[
        { q: 'Cât este impozitul pe chirie în 2026?', a: 'Impozitul este 10% aplicat pe venitul net. Venitul net = venit brut − 20% deducere forfetară (termen lung), deci impozitul efectiv este circa 8% din chiria încasată. Pentru închirierea turistică (scurtă durată) deducerea este 30%.' },
        { q: 'Plătesc CASS pentru veniturile din chirie?', a: 'Doar dacă venitul net cumulat din surse pasive depășește 6 salarii minime pe an. CASS se calculează pe plafon (10% din 6, 12 sau 24 salarii minime), nu pe venitul real.' },
        { q: 'Cine plătește impozitul dacă închiriez unei firme?', a: 'Dacă chiriașul este persoană juridică, firma reține impozitul de 10% la sursă. Tu poți datora în continuare CASS, declarată prin Declarația Unică.' },
      ]}
    >
      <h2>Cum se calculează impozitul pe chirie în 2026</h2>
      <p>
        Pentru închirierea pe termen lung, venitul net = <strong>venit brut − 20% deducere
        forfetară</strong>, iar impozitul este <strong>10% pe venitul net</strong> (circa 8% din
        chiria brută). La închirierea turistică, deducerea forfetară este 30%.
      </p>
      <p>
        În plus, dacă venitul net cumulat din surse pasive depășește 6 salarii minime pe an, se
        datorează <strong>CASS</strong>, calculată pe plafon (6, 12 sau 24 salarii minime).
        Declararea se face prin <strong>Declarația Unică</strong>.
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă conform Codului Fiscal 2026. Pentru situații speciale consultă un contabil.
      </p>
    </CalculatorLayout>
  );
}
