import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ConcediuMedicalCalculator } from '@/components/calculators/concediu-medical-calculator';

const SLUG = 'concediu-medical';
const TITLE = 'Calculator Concediu Medical 2026 — Indemnizație';
const DESCRIPTION =
  "Calculează indemnizația de concediu medical 2026: procentul pe tip de concediu, baza de calcul și prima zi neplătită.";

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
      heading="Calculator Concediu Medical 2026"
      description="Estimează indemnizația de concediu medical pe baza venitului mediu, a tipului de concediu și a regulilor în vigoare în 2026."
      widget={<ConcediuMedicalCalculator />}
      faqs={[
        { q: 'Cât la sută din salariu primesc pe concediu medical în 2026?', a: 'Depinde de tip: boala obișnuită are procent progresiv — 55% (până la 7 zile), 65% (8-14 zile), 75% (15+ zile). Urgențele și bolile din grupa A sunt 100%, maternitatea și îngrijirea copilului 85%, riscul maternal 75%, accidentul de muncă 80%.' },
        { q: 'Se plătește prima zi de concediu medical?', a: 'Pentru certificatele emise între 1 februarie 2026 și 31 decembrie 2027, prima zi a episodului de boală nu se plătește (OUG 91/2025). Excepție: accidentele de muncă și anumite situații.' },
        { q: 'Cum se calculează baza?', a: 'Media veniturilor brute lunare din ultimele 6 luni, plafonată la 12 salarii minime pe lună, împărțită la numărul de zile lucrătoare.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de concediu medical</h2>
      <p>
        Indemnizația = <strong>baza zilnică × procent × zile plătite</strong>. Baza zilnică e media
        venitului brut din ultimele 6 luni (plafonată la 12 salarii minime/lună), împărțită la zilele
        lucrătoare.
      </p>
      <h2>Procentele în 2026</h2>
      <ul>
        <li><strong>Boală obișnuită:</strong> progresiv 55% / 65% / 75% după durata episodului (Legea 141/2025);</li>
        <li><strong>Urgențe, grupa A, TBC, cancer:</strong> 100%;</li>
        <li><strong>Maternitate, îngrijire copil:</strong> 85%; <strong>risc maternal:</strong> 75%;</li>
        <li><strong>Accident de muncă:</strong> 80% (regim separat, Legea 346/2002).</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Estimare orientativă. Regulile 2026 (prima zi neplătită — zi calendaristică vs lucrătoare,
        excepții) se clarifică prin norme metodologice. Verifică cu angajatorul/CNAS.
      </p>
    </CalculatorLayout>
  );
}
