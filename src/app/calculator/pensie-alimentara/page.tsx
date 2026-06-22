import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PensieAlimentaraCalculator } from '@/components/calculators/pensie-alimentara-calculator';

const SLUG = 'pensie-alimentara';
const TITLE = 'Calculator Pensie Alimentară 2026 — Cât Trebuie să Plătești';
const DESCRIPTION =
  'Calculează pensia alimentară pentru copii în 2026 conform Codului Civil: 1/4 din venitul net pentru un copil, 1/3 pentru doi, 1/2 pentru trei sau mai mulți.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent(TITLE)}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Pensie Alimentară 2026"
      description="Estimează pensia de întreținere datorată copiilor pe baza venitului net al părintelui obligat, conform cotelor din Codul Civil (art. 529)."
      widget={<PensieAlimentaraCalculator />}
      faqs={[
        {
          q: 'Cât este pensia alimentară pentru un copil în 2026?',
          a: 'Conform Codului Civil (art. 529), pensia este de până la 1/4 (25%) din venitul net lunar al părintelui obligat pentru un copil, 1/3 pentru doi copii și 1/2 pentru trei sau mai mulți copii. Acestea sunt limite maxime — instanța sau acordul parental pot stabili o sumă mai mică.',
        },
        {
          q: 'La ce venit se aplică procentul?',
          a: 'La venitul net lunar al părintelui care plătește (debitorul întreținerii) — nu la venitul brut și nu la venitul celui care primește pensia. Se iau în calcul veniturile cu caracter permanent (salariu, chirii, pensii), nu sumele ocazionale.',
        },
        {
          q: 'Cum se calculează pensia dacă părintele nu are venituri?',
          a: 'Dacă părintele nu are venituri sau nu le poate dovedi, instanța prezumă capacitatea de a câștiga cel puțin salariul minim și calculează pensia prin raportare la salariul minim net pe economie (2.574 lei în prima jumătate a anului 2026, 2.699 lei din iulie).',
        },
        {
          q: 'Se poate stabili pensia alimentară la notar?',
          a: 'Da, în cadrul divorțului prin acord la notar, chiar și cu copii minori, dacă soții se înțeleg asupra tuturor aspectelor (inclusiv contribuția fiecăruia). Notarul autentifică acordul parental; nu există un procent obligatoriu — părinții stabilesc suma, folosind cotele din lege ca reper. Este obligatorie ancheta socială.',
        },
        {
          q: 'Până la ce vârstă se plătește pensia alimentară?',
          a: 'Până la împlinirea vârstei de 18 ani. Dacă copilul devenit major continuă studiile, pensia se datorează până la finalizarea studiilor, dar cel mult până la vârsta de 26 de ani (art. 499 Cod Civil).',
        },
        {
          q: 'Se poate modifica pensia alimentară?',
          a: 'Da. Instanța de tutelă poate mări, micșora sau înceta pensia când se schimbă veniturile celui care plătește sau nevoile copilului. Pensia stabilită în sumă fixă se indexează automat trimestrial cu rata inflației (art. 531).',
        },
      ]}
    >
      <h2>Cum se calculează pensia alimentară</h2>
      <p>
        Pensia de întreținere datorată copiilor se stabilește ca o cotă din <strong>venitul net lunar</strong> al
        părintelui obligat, conform <strong>art. 529 din Codul Civil</strong>:
      </p>
      <ul>
        <li>
          <strong>1 copil:</strong> până la <strong>1/4 (25%)</strong> din venitul net;
        </li>
        <li>
          <strong>2 copii:</strong> până la <strong>1/3 (≈33%)</strong> din venitul net;
        </li>
        <li>
          <strong>3 sau mai mulți copii:</strong> până la <strong>1/2 (50%)</strong> din venitul net.
        </li>
      </ul>
      <p>
        Acestea sunt <strong>plafoane maxime</strong> („până la”), nu sume fixe. Totalul întreținerii datorate (copii
        plus, eventual, soțul) nu poate depăși jumătate din venitul net lunar al celui obligat (art. 529 alin. 3).
      </p>

      <h2>Exemplu de calcul</h2>
      <p>
        Un părinte cu un venit net de <strong>4.000 lei/lună</strong> și doi copii: pensia totală este 1/3 × 4.000 ={' '}
        <strong>1.333 lei</strong>, adică aproximativ <strong>667 lei pentru fiecare copil</strong>. Pentru un singur
        copil ar fi 1/4 × 4.000 = 1.000 lei, iar pentru trei copii 1/2 × 4.000 = 2.000 lei.
      </p>

      <h2>Dacă părintele nu are venituri</h2>
      <p>
        Lipsa veniturilor nu înlătură obligația. Instanța prezumă că părintele poate câștiga cel puțin{' '}
        <strong>salariul minim</strong> și raportează pensia la salariul minim net pe economie (2.574 lei în prima
        jumătate a anului 2026, 2.699 lei din 1 iulie).
      </p>

      <h2>Stabilire prin instanță sau la notar</h2>
      <p>
        Pensia poate fi stabilită de <strong>instanța de tutelă</strong> sau, în cazul{' '}
        <Link href="/servicii/">divorțului prin acord la notar</Link>, prin convenția părinților (autentificată,
        însoțită de ancheta socială). La notar nu există un procent impus — părinții convin suma, folosind cotele legale
        ca reper.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Cotele sunt maxime; cuantumul real se stabilește de instanță sau prin acordul părinților,
        ținând cont de nevoile copilului și de mijloacele părintelui.
      </p>
    </CalculatorLayout>
  );
}
