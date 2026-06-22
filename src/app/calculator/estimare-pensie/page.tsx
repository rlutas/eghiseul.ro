import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { EstimarePensieCalculator } from '@/components/calculators/estimare-pensie-calculator';

const SLUG = 'estimare-pensie';
const TITLE = 'Calculator Estimare Pensie 2026 — Puncte și Cuantum';
const DESCRIPTION =
  'Estimează pensia pentru limită de vârstă în 2026 pe baza stagiului și a salariului: puncte de contributivitate + stabilitate × valoarea punctului de referință (81 lei).';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Estimare Pensie')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Estimare Pensie"
      description="Estimează cuantumul pensiei pentru limită de vârstă pe baza stagiului de cotizare și a salariului, conform sistemului de puncte din Legea 360/2023."
      widget={<EstimarePensieCalculator />}
      faqs={[
        {
          q: 'Cum se calculează pensia în 2026?',
          a: 'Conform Legii 360/2023, pensia = numărul total de puncte × valoarea punctului de referință (VPR). Punctele se compun din punctele de contributivitate (raportul dintre salariul tău și salariul mediu pe economie, pe fiecare an de stagiu) plus punctele de stabilitate pentru stagiul peste 25 de ani.',
        },
        {
          q: 'Cât este valoarea punctului de referință în 2026?',
          a: 'Valoarea punctului de referință (VPR) este 81 de lei în 2026 și a fost înghețată (nu se indexează în 2026, conform Legii 141/2025).',
        },
        {
          q: 'Ce sunt punctele de stabilitate?',
          a: 'Sunt puncte suplimentare pentru stagiul de cotizare de peste 25 de ani: 0,50 puncte/an pentru anii 26-30, 0,75 puncte/an pentru 31-35 și 1,00 punct/an pentru fiecare an peste 35. De exemplu, 35 de ani de stagiu aduc 6,25 puncte de stabilitate.',
        },
        {
          q: 'Cât de exactă este estimarea?',
          a: 'Este orientativă. Calculul oficial al Casei de Pensii folosește venitul real lunar raportat la câștigul salarial mediu din fiecare an al carierei. Calculatorul folosește un salariu mediu constant, ca toate estimatoarele publice.',
        },
      ]}
    >
      <h2>Cum se calculează pensia în sistemul cu puncte</h2>
      <p>
        Din 2024 (Legea 360/2023), pensia se calculează ca <strong>număr total de puncte × valoarea punctului de
        referință (VPR)</strong>. VPR este 81 de lei în 2026. Numărul de puncte are două componente: punctele de
        contributivitate și punctele de stabilitate.
      </p>

      <h2>Punctele de contributivitate</h2>
      <p>
        Pentru fiecare an, punctajul este raportul dintre venitul tău brut și câștigul salarial mediu pe economie
        (aproximativ 9.192 lei în 2026). Dacă ai câștigat exact cât media, primești 1 punct pe an. Suma pe toți anii de
        stagiu dă punctele de contributivitate.
      </p>

      <h2>Exemplu: 35 de ani de stagiu, salariu egal cu media</h2>
      <p>
        Puncte de contributivitate = 1,0 × 35 = 35. Puncte de stabilitate = 0,50 × 5 (anii 26-30) + 0,75 × 5 (anii
        31-35) = 6,25. Total = 41,25 puncte × 81 lei = <strong>~3.341 lei/lună</strong>.
      </p>

      <p>
        Vezi și <Link href="/calculator/varsta-pensionare/">calculatorul de vârstă de pensionare</Link> și{' '}
        <Link href="/calculator/impozit-pensie/">calculatorul de impozit pe pensie</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă. Valoarea exactă se stabilește de CNPP pe baza istoricului real de venituri. VPR este
        înghețat la 81 de lei în 2026.
      </p>
    </CalculatorLayout>
  );
}
