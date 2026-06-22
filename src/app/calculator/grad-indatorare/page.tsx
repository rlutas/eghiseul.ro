import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { GradIndatorareCalculator } from '@/components/calculators/grad-indatorare-calculator';

const SLUG = 'grad-indatorare';
const TITLE = 'Calculator Grad de Îndatorare (DTI) 2026';
const DESCRIPTION =
  'Calculator grad de îndatorare 2026: vezi ce procent din venitul net merge pe rate și dacă te încadrezi în plafonul BNR de 40% (45% prima locuință).';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Grad de Îndatorare')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Grad de Îndatorare 2026"
      description="Calculează gradul de îndatorare (DTI) — ce procent din venitul net lunar pleacă pe rate — și verifică dacă te încadrezi în plafoanele impuse de BNR pentru a obține un credit."
      widget={<GradIndatorareCalculator />}
      faqs={[
        {
          q: 'Ce este gradul de îndatorare?',
          a: 'Gradul de îndatorare (DTI — Debt-to-Income) este procentul din venitul net lunar care merge pe ratele tuturor creditelor. Se calculează ca total rate lunare împărțit la venitul net, înmulțit cu 100.',
        },
        {
          q: 'Care este gradul maxim de îndatorare permis în 2026?',
          a: 'Conform Regulamentului BNR nr. 17/2012 (modificat prin Regulamentul nr. 6/2018), plafonul este de 40% din venitul net pentru creditele în lei și 20% pentru cele în valută. Pentru prima locuință limitele cresc la 45% în lei și 25% în valută.',
        },
        {
          q: 'Cum se calculează gradul de îndatorare?',
          a: 'Formula este: grad de îndatorare = (total rate lunare / venit net lunar) × 100. Aduni toate ratele lunare (credite, carduri, leasing), le împarți la venitul net și înmulțești cu 100 ca să obții procentul.',
        },
        {
          q: 'De ce am un plafon de 45% și nu 40%?',
          a: 'Plafonul de 45% în lei (respectiv 25% în valută) se aplică doar pentru achiziția primei locuințe, conform excepției din Regulamentul BNR nr. 6/2018. Pentru orice alt credit limita rămâne 40% în lei și 20% în valută.',
        },
        {
          q: 'Intră toate creditele în calculul gradului de îndatorare?',
          a: 'Da. Banca însumează ratele tuturor creditelor active (ipotecar, nevoi personale, auto, leasing) și limitele cardurilor de credit și ale descoperitului de cont, raportate la venitul net. Acesta este motivul pentru care un card neutilizat îți poate reduce capacitatea de creditare.',
        },
      ]}
    >
      <h2>Cum se calculează gradul de îndatorare</h2>
      <p>
        Gradul de îndatorare (DTI) arată cât din venitul tău net lunar este „blocat” în rate. Formula
        este simplă:
      </p>
      <p>
        <strong>grad de îndatorare = (total rate lunare / venit net lunar) × 100.</strong>
      </p>
      <p>
        În „total rate lunare” intră absolut toate obligațiile de plată: rata ipotecară, creditele de
        nevoi personale, ratele auto sau de leasing, dar și limitele cardurilor de credit și ale
        descoperitului de cont. Rezultatul, exprimat în procente, este comparat de bancă cu plafoanele
        stabilite de Banca Națională a României.
      </p>

      <h2>Plafoanele BNR în 2026</h2>
      <p>
        Limitele provin din <strong>Regulamentul BNR nr. 17/2012</strong>, modificat prin{' '}
        <strong>Regulamentul nr. 6/2018</strong>, și sunt diferite în funcție de moneda creditului și
        de scopul acestuia:
      </p>
      <ul>
        <li>
          <strong>credite în lei: maximum 40%</strong> din venitul net (
          <strong>45%</strong> pentru achiziția primei locuințe);
        </li>
        <li>
          <strong>credite în valută: maximum 20%</strong> din venitul net (
          <strong>25%</strong> pentru achiziția primei locuințe).
        </li>
      </ul>
      <p>
        Dacă depășești aceste praguri, banca este obligată să respingă cererea de credit, indiferent
        de cât de bun este istoricul tău la Biroul de Credit.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un venit net lunar de <strong>6.000 lei</strong> și că vrei un credit ipotecar
        pentru prima locuință, cu o rată estimată de <strong>2.400 lei</strong>. Mai ai în plus un
        credit de nevoi personale cu o rată de <strong>300 lei</strong>. Calculul:
      </p>
      <ul>
        <li>
          <strong>total rate lunare:</strong> 2.400 + 300 = 2.700 lei;
        </li>
        <li>
          <strong>grad de îndatorare:</strong> (2.700 / 6.000) × 100 ={' '}
          <strong>45%</strong>.
        </li>
      </ul>
      <p>
        În acest caz te încadrezi exact la limita de <strong>45%</strong> aplicabilă primei locuințe
        în lei. Dacă același credit ar fi pentru o a doua locuință, plafonul ar scădea la{' '}
        <strong>40%</strong> și cererea ar fi respinsă: ar trebui fie să reduci rata (avans mai mare
        sau perioadă mai lungă), fie să închizi creditul de nevoi personale.
      </p>

      <h2>Greșeli frecvente și context legal</h2>
      <ul>
        <li>
          <strong>Calculul din venitul brut, nu din cel net.</strong> Plafoanele BNR se raportează la
          venitul <em>net</em> încasat, nu la brut. Folosirea brutului îți dă un grad de îndatorare
          mai mic decât cel real.
        </li>
        <li>
          <strong>Uitarea cardurilor de credit.</strong> Banca ia în calcul limita cardului, nu suma
          efectiv folosită. Un card cu limită mare, chiar neutilizat, îți reduce capacitatea de
          creditare.
        </li>
        <li>
          <strong>Ignorarea riscului valutar.</strong> La creditele în valută plafonul este mult mai
          strict (20%, respectiv 25% pentru prima locuință) tocmai pentru a proteja împrumutatul de
          fluctuațiile cursului.
        </li>
        <li>
          <strong>Confundarea plafonului cu o garanție.</strong> Încadrarea în grad este o condiție
          necesară, dar banca evaluează separat veniturile stabile, vechimea în muncă și istoricul la
          Biroul de Credit.
        </li>
      </ul>
      <p>
        Cadrul legal este dat de Regulamentul BNR nr. 17/2012 (cu modificările ulterioare din
        Regulamentul nr. 6/2018), aplicabil tuturor instituțiilor de credit din România. Înainte de a
        depune dosarul, verifică-ți și salariul net cu{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net/brut</Link>, iar dacă ai nevoie
        de documente oficiale pentru bancă, vezi{' '}
        <Link href="/servicii/">serviciile eGhișeul</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și nu reprezintă o ofertă de creditare. Gradul de îndatorare final
        este stabilit de fiecare bancă pe baza propriilor politici și a documentelor depuse. Pentru o
        analiză exactă consultă un consultant de credite.
      </p>
    </CalculatorLayout>
  );
}
