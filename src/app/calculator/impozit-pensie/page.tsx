import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitPensieCalculator } from '@/components/calculators/impozit-pensie-calculator';

const SLUG = 'impozit-pensie';
const TITLE = 'Calculator Impozit pe Pensie 2026 — Pensie Netă';
const DESCRIPTION =
  'Calculează impozitul și CASS pe pensie în 2026: 10% impozit și 10% CASS pe partea care depășește 3.000 lei, și află pensia netă încasată.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Impozit pe Pensie')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Impozit pe Pensie 2026"
      description="Estimează impozitul, CASS și pensia netă pe baza pensiei brute lunare, conform regulilor în vigoare în 2026."
      widget={<ImpozitPensieCalculator />}
      faqs={[
        {
          q: 'Cât este impozitul pe pensie în 2026?',
          a: 'Impozitul pe pensie este 10%, aplicat doar părții care depășește 3.000 lei pe lună. Pensiile până în 3.000 lei sunt scutite. În plus, din 2026 se reține și CASS 10% pe aceeași parte care depășește 3.000 lei.',
        },
        {
          q: 'Se plătește CASS pe pensie în 2026?',
          a: 'Da. Începând cu august 2025 și pentru 2026-2027, pensionarii plătesc CASS 10% pe partea din pensie care depășește 3.000 lei (Legea 141/2025). Măsura este în vigoare, dar contestată la Curtea Constituțională.',
        },
        {
          q: 'Cum se calculează pensia netă?',
          a: 'Mai întâi se calculează CASS (10% din partea peste 3.000 lei), apoi impozitul (10% din partea peste 3.000 lei, după ce s-a scăzut CASS din bază). De exemplu, la o pensie brută de 4.000 lei: CASS 100 lei, impozit 90 lei, pensie netă 3.810 lei.',
        },
        {
          q: 'Pensiile mici sunt impozitate?',
          a: 'Nu. Pensiile până în 3.000 lei pe lună sunt scutite integral atât de impozit, cât și de CASS.',
        },
      ]}
    >
      <h2>Cum se impozitează pensia în 2026</h2>
      <p>
        Pensia se impozitează cu <strong>10%</strong>, dar numai pe partea care depășește <strong>3.000 lei</strong> pe
        lună. Din 2026 se adaugă și <strong>CASS 10%</strong> pe aceeași parte. Ordinea contează: CASS se calculează
        prima și se scade din baza impozitului.
      </p>

      <h2>Exemple de calcul</h2>
      <ul>
        <li>Pensie 4.000 lei → CASS 100, impozit 90, <strong>net 3.810 lei</strong>;</li>
        <li>Pensie 6.300 lei → CASS 330, impozit 297, <strong>net 5.673 lei</strong>;</li>
        <li>Pensie 3.000 lei sau mai mică → <strong>scutită integral</strong>.</li>
      </ul>

      <p>
        Vezi și <Link href="/calculator/salariu/">calculatorul de salariu net</Link> sau{' '}
        <Link href="/calculator/indemnizatie-somaj/">calculatorul de indemnizație de șomaj</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. CASS pe pensii este în vigoare 2026-2027 și este contestat la CCR; regulile pot fi
        modificate.
      </p>
    </CalculatorLayout>
  );
}
