import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitCladiriCalculator } from '@/components/calculators/impozit-cladiri-calculator';

const SLUG = 'impozit-casa';
const TITLE = 'Calculator Impozit pe Casă (Clădiri) 2026';
const DESCRIPTION =
  'Calculează impozitul pe casă/clădiri în 2026 după suprafață, tip construcție, zonă și vechime, conform valorilor indexate din Codul Fiscal.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Impozit pe Casă')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Impozit pe Casă 2026"
      description="Estimează impozitul anual pe clădirea rezidențială pe baza suprafeței, tipului de construcție, zonei și vechimii, conform valorilor 2026."
      widget={<ImpozitCladiriCalculator />}
      faqs={[
        {
          q: 'Cum se calculează impozitul pe casă în 2026?',
          a: 'Se calculează o valoare impozabilă = suprafața construită × valoarea pe m² (din Codul Fiscal, indexată în 2026) × coeficientul de corecție (după zonă și rangul localității) × ajustarea pentru vechime. Impozitul este cota locală (0,08–0,2% pentru locuințe) aplicată acestei valori.',
        },
        {
          q: 'Ce reduceri se aplică pentru clădirile vechi?',
          a: 'Din 2026 (OUG 9/2026): clădirile cu vechime între 50 și 100 de ani au o reducere de 15% a valorii impozabile, iar cele peste 100 de ani o reducere de 25%. Sub 50 de ani nu se aplică reducere.',
        },
        {
          q: 'De ce a crescut impozitul pe casă în 2026?',
          a: 'Valorile pe metru pătrat din Codul Fiscal au fost indexate cu aproximativ 79,6% pentru 2026, ceea ce a dus la creșterea valorii impozabile și implicit a impozitului.',
        },
        {
          q: 'Cât este cota de impozitare?',
          a: 'Pentru clădirile rezidențiale ale persoanelor fizice cota este între 0,08% și 0,2%, stabilită de fiecare consiliu local (frecvent 0,1%). Pentru clădirile nerezidențiale cota este 0,2–1,3%.',
        },
      ]}
    >
      <h2>Cum se calculează impozitul pe clădiri</h2>
      <p>
        Pentru 2026 se folosește metoda valorii impozabile pe metru pătrat (Cod Fiscal art. 457), cu valorile indexate.
        Formula este: <strong>suprafață × valoare/m² × coeficient de corecție × ajustare vechime</strong>, iar impozitul
        este cota locală aplicată valorii impozabile.
      </p>

      <h2>Ce influențează impozitul</h2>
      <ul>
        <li><strong>Tipul construcției</strong> și dacă are instalații (apă, canalizare, electricitate, încălzire);</li>
        <li><strong>Zona și rangul localității</strong> (coeficient între 0,90 și 2,60);</li>
        <li><strong>Vechimea</strong> (reduceri de 15% sau 25% pentru clădiri vechi);</li>
        <li><strong>Cota locală</strong> (0,08–0,2% pentru locuințe).</li>
      </ul>

      <p>
        Vezi și <Link href="/calculator/impozit-auto/">calculatorul de impozit auto</Link> sau{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Orientativ. Cota exactă, zona și majorările locale se stabilesc prin hotărâre a consiliului local; valoarea
        obligatorie este la Direcția de Taxe (DITL) a primăriei tale.
      </p>
    </CalculatorLayout>
  );
}
