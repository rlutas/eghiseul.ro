import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitAutoCalculator } from '@/components/calculators/impozit-auto-calculator';

const SLUG = 'calculator-impozit-auto';
const TITLE = 'Calculator Impozit Auto 2026 — Taxa pe Mașină';
const DESCRIPTION =
  'Calculează impozitul auto în 2026 în funcție de capacitatea cilindrică și norma de poluare ' +
  '(noul criteriu Euro). Estimare rapidă a taxei anuale pe mijloacele de transport.';

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
      heading="Calculator Impozit Auto 2026"
      description="Estimează impozitul anual pe mașină conform noilor reguli din 2026, care țin cont atât de capacitatea cilindrică, cât și de norma de poluare Euro."
      widget={<ImpozitAutoCalculator />}
      faqs={[
        { q: 'Cum se calculează impozitul auto în 2026?', a: 'Din 2026, impozitul depinde de capacitatea cilindrică ȘI de norma de poluare (Euro). Se ia numărul de grupe de 200 cmc (rotunjit în sus) înmulțit cu tariful pe grupă corespunzător normei Euro, apoi se aplică eventuala cotă adițională a primăriei (0-50%).' },
        { q: 'Mașinile electrice plătesc impozit?', a: 'Da, din 2026 mașinile electrice plătesc un impozit fix de 40 lei/an (anterior erau scutite). Hibridele cu emisii reduse (≤50g CO₂) pot beneficia de o reducere de până la 30%.' },
        { q: 'De ce diferă suma față de ce plătesc eu?', a: 'Pentru că fiecare primărie poate aplica o cotă adițională de până la 50% peste valoarea de referință. Calculatorul oferă o estimare — suma exactă o stabilește Direcția de Taxe locale.' },
        { q: 'Contează vârsta mașinii?', a: 'Nu. Din 2026, vârsta vehiculului nu mai este criteriu — contează capacitatea cilindrică și norma de poluare.' },
      ]}
    >
      <h2>Cum se calculează impozitul auto în 2026</h2>
      <p>
        Începând cu 2026 (Legea 239/2025 și OUG 78/2025), impozitul pe mijloacele de transport se
        calculează în funcție de <strong>capacitatea cilindrică</strong> și de{' '}
        <strong>norma de poluare Euro</strong>. Formula: numărul de grupe de 200 cmc (rotunjit în
        sus) × tariful pe grupă corespunzător normei Euro, plus cota adițională a primăriei.
      </p>
      <h2>Reguli noi din 2026</h2>
      <ul>
        <li>mașinile mici (≤1.600 cmc) plătesc mai mult decât în 2025, iar cele mari (peste 3.000 cmc) plătesc mai puțin;</li>
        <li><strong>electricele</strong> plătesc 40 lei/an (nu mai sunt scutite);</li>
        <li><strong>hibridele ≤50g CO₂</strong> pot avea reducere de până la 30%;</li>
        <li>vârsta mașinii nu mai contează.</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valorile sunt orientative și se pot ajusta prin hotărâri locale; suma finală se stabilește de
        primăria de domiciliu. Verifică la Direcția de Taxe și Impozite Locale.
      </p>
    </CalculatorLayout>
  );
}
