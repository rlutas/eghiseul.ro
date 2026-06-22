import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { VarstaPensionareCalculator } from '@/components/calculators/varsta-pensionare-calculator';

const SLUG = 'varsta-pensionare';
const TITLE = 'Calculator Vârstă de Pensionare 2026 — Când Ies la Pensie';
const DESCRIPTION =
  'Află vârsta standard de pensionare și data ieșirii la pensie în funcție de sex și data nașterii, conform Anexei 5 din Legea 360/2023.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Vârstă Pensionare')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Vârstă de Pensionare"
      description="Calculează vârsta standard de pensionare, data ieșirii la pensie și stagiile de cotizare, pe baza datei nașterii și a sexului (Anexa 5, Legea 360/2023)."
      widget={<VarstaPensionareCalculator />}
      faqs={[
        {
          q: 'Care este vârsta de pensionare în România în 2026?',
          a: 'Vârsta standard de pensionare crește treptat până la egalizarea la 65 de ani pentru femei și bărbați. Bărbații au deja 65 de ani (pentru cei născuți după 1950), iar pentru femei vârsta urcă gradual: femeile născute din ianuarie 1970 se pensionează tot la 65 de ani.',
        },
        {
          q: 'Cât este stagiul complet de cotizare?',
          a: 'Stagiul complet de cotizare crește treptat la 35 de ani. Stagiul minim necesar pentru o pensie pentru limită de vârstă este de 15 ani. Valorile exacte depind de data nașterii (Anexa 5 din Legea 360/2023).',
        },
        {
          q: 'Pot ieși la pensie mai devreme?',
          a: 'Da, prin pensie anticipată sau anticipată parțială, dacă ai realizat un stagiu de cotizare mai mare decât cel complet. Pensia anticipată parțială se acordă cu cel mult 5 ani înainte de vârsta standard, cu o penalizare ce depinde de stagiul depășit.',
        },
        {
          q: 'De ce vârsta de pensionare diferă pe luni?',
          a: 'În perioada de tranziție, vârsta standard crește lună de lună în funcție de data exactă a nașterii, conform tabelului din Anexa 5. De aceea două persoane născute în luni diferite ale aceluiași an pot avea vârste de pensionare ușor diferite.',
        },
      ]}
    >
      <h2>Cum se stabilește vârsta de pensionare</h2>
      <p>
        Vârsta standard de pensionare este stabilită în <strong>Anexa 5 din Legea 360/2023</strong>, în funcție de sex și
        de luna și anul nașterii. În perioada de tranziție, vârsta crește gradual, urmând ca femeile și bărbații să se
        pensioneze la <strong>65 de ani</strong> după finalizarea tranziției.
      </p>

      <h2>Egalizarea la 65 de ani</h2>
      <p>
        Bărbații născuți după 1950 se pensionează deja la 65 de ani. Pentru femei, vârsta urcă treptat de la 57-60 de ani
        (generațiile mai vechi) până la 65 de ani pentru cele născute începând cu ianuarie 1970. Stagiul complet de
        cotizare ajunge la 35 de ani, iar stagiul minim rămâne 15 ani.
      </p>

      <h2>Pensionare anticipată</h2>
      <p>
        Dacă ai un stagiu de cotizare mai mare decât cel complet, te poți pensiona anticipat (cu până la 5 ani mai
        devreme). Vezi și <Link href="/calculator/impozit-pensie/">calculatorul de impozit pe pensie</Link> și{' '}
        <Link href="/calculator/vechime-in-munca/">calculatorul de vechime în muncă</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă pe baza Anexei 5 (Legea 360/2023). Cuantumul efectiv al pensiei depinde de numărul de puncte
        și de valoarea punctului de pensie. Pentru situația ta exactă, verifică la Casa Națională de Pensii Publice.
      </p>
    </CalculatorLayout>
  );
}
