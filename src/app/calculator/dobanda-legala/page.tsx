import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { DobandaLegalaCalculator } from '@/components/calculators/dobanda-legala-calculator';

const SLUG = 'dobanda-legala';
const TITLE = 'Calculator Dobândă Legală 2026 (Penalizatoare)';
const DESCRIPTION =
  'Calculator dobândă legală 2026: penalizatoare (BNR+4pp) și pentru profesioniști (BNR+8pp), pe baza ratei de referință BNR de 6,50%.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Dobândă Legală')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Dobândă Legală 2026"
      description="Calculează dobânda legală penalizatoare sau remuneratorie pe baza ratei de referință BNR (6,50% în februarie 2026), conform OG 13/2011 și Legii 72/2013, pentru o sumă și o perioadă de întârziere."
      tldr="La rata BNR de 6,50% (februarie 2026), dobânda legală penalizatoare civilă este 10,50% pe an (BNR+4pp), iar între profesioniști 14,50% pe an (BNR+8pp, Legea 72/2013). Suma se calculează: sumă × rata × zile / 365."
      widget={<DobandaLegalaCalculator />}
      faqs={[
        {
          q: 'Cât este dobânda legală penalizatoare în 2026?',
          a: 'Dobânda legală penalizatoare se calculează ca rata de referință BNR plus 4 puncte procentuale. La o rată BNR de 6,50% (februarie 2026), dobânda penalizatoare este 6,50% + 4 = 10,50% pe an.',
        },
        {
          q: 'Ce dobândă se aplică între profesioniști (B2B)?',
          a: 'În raporturile dintre profesioniști și între aceștia și autorități contractante, conform Legii 72/2013, dobânda penalizatoare este rata de referință BNR plus 8 puncte procentuale, adică 6,50% + 8 = 14,50% pe an.',
        },
        {
          q: 'Care este diferența dintre dobânda remuneratorie și cea penalizatoare?',
          a: 'Dobânda remuneratorie este prețul folosirii banilor împrumutați și este egală cu rata de referință BNR (6,50%). Dobânda penalizatoare se datorează pentru neîndeplinirea la termen a obligației și este mai mare (BNR+4pp sau BNR+8pp).',
        },
        {
          q: 'Cum se calculează concret suma dobânzii?',
          a: 'Formula este: sumă × rata anuală × număr de zile de întârziere / 365. Astfel se obține dobânda aferentă perioadei de întârziere indicate.',
        },
        {
          q: 'Se aplică o reducere pentru persoanele fizice?',
          a: 'Da. În raporturile care nu decurg din exploatarea unei întreprinderi cu scop lucrativ (non-profesional), rata dobânzii legale se reduce cu 20% față de nivelul standard, conform OG 13/2011.',
        },
        {
          q: 'De unde provine rata de referință BNR de 6,50%?',
          a: 'Rata de referință este chiar rata dobânzii de politică monetară stabilită de Banca Națională a României. În februarie 2026 această rată este 6,50% pe an și constituie baza de calcul pentru toate tipurile de dobândă legală din OG 13/2011 și Legea 72/2013.',
        },
        {
          q: 'Pot părțile să stabilească prin contract o altă dobândă?',
          a: 'Da, părțile pot conveni prin contract o dobândă diferită de cea legală. Dobânda legală (remuneratorie 6,50%, penalizatoare 10,50% sau 14,50%) se aplică atunci când contractul nu prevede o rată proprie sau când legea trimite la nivelul legal. Pentru raporturile non-profesionale, dobânda convențională remuneratorie nu poate depăși dobânda legală cu mai mult de 50%.',
        },
        {
          q: 'Dobânda legală se calculează la suma cu sau fără TVA?',
          a: 'Dobânda penalizatoare pentru întârziere se aplică la suma datorată și neachitată la termen, adică la valoarea totală a facturii, inclusiv TVA, atunci când TVA face parte din suma scadentă. Formula rămâne aceeași: sumă × rata × zile / 365.',
        },
      ]}
    >
      <h2>Cum se calculează dobânda legală în 2026</h2>
      <p>
        Dobânda legală pornește de la <strong>rata de referință BNR</strong>, care în februarie 2026
        este <strong>6,50%</strong>. Pe baza acesteia, OG 13/2011 stabilește două tipuri de dobândă:
      </p>
      <ul>
        <li>
          <strong>dobânda remuneratorie</strong> — egală cu rata de referință BNR, adică{' '}
          <strong>6,50%</strong>, datorată pentru folosirea unei sume de bani;
        </li>
        <li>
          <strong>dobânda penalizatoare (civilă)</strong> — rata BNR plus 4 puncte procentuale, adică
          6,50% + 4 = <strong>10,50%</strong>, datorată pentru întârzierea la plată;
        </li>
        <li>
          <strong>dobânda penalizatoare între profesioniști</strong> — rata BNR plus 8 puncte
          procentuale, adică 6,50% + 8 = <strong>14,50%</strong>, conform Legii 72/2013.
        </li>
      </ul>
      <p>
        Pentru raporturile <strong>non-profesionale</strong> (care nu decurg din exploatarea unei
        întreprinderi cu scop lucrativ), nivelul dobânzii legale se reduce cu 20%. Suma efectivă a
        dobânzii se obține cu formula: <strong>sumă × rata × zile / 365</strong>.
      </p>

      <h2>Exemplu numeric, pas cu pas</h2>
      <p>
        Să presupunem o factură neachitată de <strong>10.000 lei</strong> între doi profesioniști,
        cu o întârziere de <strong>90 de zile</strong>. Se aplică dobânda penalizatoare B2B de{' '}
        <strong>14,50%</strong> pe an (BNR 6,50% + 8 puncte procentuale):
      </p>
      <ul>
        <li>
          <strong>rata anuală:</strong> 14,50%, adică 0,145;
        </li>
        <li>
          <strong>aplicarea formulei:</strong> 10.000 × 0,145 × 90 / 365;
        </li>
        <li>
          <strong>dobânda datorată:</strong> aproximativ <strong>357,53 lei</strong> pentru cele 90
          de zile de întârziere.
        </li>
      </ul>
      <p>
        Pentru aceeași sumă și perioadă, dacă raportul ar fi civil (nu între profesioniști), s-ar
        aplica <strong>10,50%</strong> și dobânda ar scădea la circa 258,90 lei. Calculatorul de mai
        sus face automat aceste calcule în funcție de tipul de raport selectat.
      </p>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confundarea celor două tipuri.</strong> Dobânda remuneratorie (6,50%) este prețul
          folosirii banilor, iar cea penalizatoare (10,50% sau 14,50%) sancționează întârzierea — nu
          se aplică ambele simultan pentru aceeași întârziere.
        </li>
        <li>
          <strong>Folosirea ratei greșite pentru tipul de raport.</strong> Între profesioniști se
          aplică BNR+8pp (Legea 72/2013), nu BNR+4pp. Alegerea greșită modifică semnificativ suma.
        </li>
        <li>
          <strong>Calculul pe 360 de zile.</strong> Formula legală folosește un an de{' '}
          <strong>365 de zile</strong>, nu 360.
        </li>
        <li>
          <strong>Ignorarea reducerii de 20%.</strong> În raporturile non-profesionale, dobânda
          legală se reduce cu 20% față de nivelul standard.
        </li>
      </ul>

      <h2>Tabel comparativ al ratelor de dobândă în 2026</h2>
      <p>
        Toate ratele de mai jos pornesc de la rata de referință BNR de <strong>6,50%</strong>{' '}
        (februarie 2026). Pentru raporturile non-profesionale, nivelul se reduce cu 20%, conform OG
        13/2011.
      </p>
      <table>
        <thead>
          <tr>
            <th>Tip de dobândă</th>
            <th>Formulă</th>
            <th>Rata anuală</th>
            <th>Temei legal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Remuneratorie (folosirea banilor)</td>
            <td>rata BNR</td>
            <td>
              <strong>6,50%</strong>
            </td>
            <td>OG 13/2011</td>
          </tr>
          <tr>
            <td>Penalizatoare civilă (întârziere)</td>
            <td>BNR + 4 pp</td>
            <td>
              <strong>10,50%</strong>
            </td>
            <td>OG 13/2011</td>
          </tr>
          <tr>
            <td>Penalizatoare între profesioniști (B2B)</td>
            <td>BNR + 8 pp</td>
            <td>
              <strong>14,50%</strong>
            </td>
            <td>Legea 72/2013</td>
          </tr>
          <tr>
            <td>Non-profesională (redusă cu 20%)</td>
            <td>rata standard − 20%</td>
            <td>variabilă</td>
            <td>OG 13/2011</td>
          </tr>
        </tbody>
      </table>
      <p>
        De reținut: dobânda penalizatoare între profesioniști (<strong>14,50%</strong>) este cu 4
        puncte procentuale mai mare decât cea civilă (<strong>10,50%</strong>), tocmai pentru a
        descuraja întârzierile la plată în mediul de afaceri.
      </p>

      <h2>Cazuri speciale</h2>
      <ul>
        <li>
          <strong>Întârziere care traversează o schimbare de rată BNR.</strong> Dacă rata de
          referință se modifică în perioada de întârziere, dobânda se calculează pe segmente, fiecare
          cu rata valabilă în intervalul respectiv. Calculatorul de mai sus folosește rata curentă
          de <strong>6,50%</strong> pentru întreaga perioadă, ca estimare orientativă.
        </li>
        <li>
          <strong>Cumul cu penalitățile contractuale.</strong> Dacă un contract prevede deja
          penalități de întârziere, acestea se aplică conform clauzei, iar dobânda legală intervine
          de regulă doar în lipsa unei astfel de clauze sau ca limită de referință.
        </li>
        <li>
          <strong>Recuperarea în instanță.</strong> Dobânda penalizatoare se poate cere alături de
          debitul principal printr-o acțiune în pretenții. La introducerea cererii se datorează taxa
          judiciară de timbru, calculată separat în funcție de valoarea pretențiilor.
        </li>
        <li>
          <strong>Anul bisect.</strong> Chiar și în anii cu 366 de zile, formula legală standard se
          raportează la un an de <strong>365 de zile</strong>, pentru consecvență cu OG 13/2011.
        </li>
      </ul>

      <h2>Context legal</h2>
      <p>
        Regimul dobânzii legale este stabilit prin <strong>OG 13/2011</strong> privind dobânda legală
        remuneratorie și penalizatoare. Aceasta definește dobânda remuneratorie ca fiind egală cu
        rata de referință BNR și dobânda penalizatoare ca rata BNR plus 4 puncte procentuale. Pentru
        întârzierile la plată în raporturile dintre profesioniști și dintre aceștia și autoritățile
        contractante se aplică <strong>Legea 72/2013</strong>, care majorează diferența la 8 puncte
        procentuale peste rata de referință BNR. Rata de referință este cea comunicată de Banca
        Națională a României, iar în februarie 2026 valoarea este de <strong>6,50%</strong>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și se bazează pe rata de referință BNR valabilă în februarie
        2026. Rata se poate modifica, iar pentru situații specifice (clauze contractuale de
        penalitate, cumul cu daune) consultă un specialist. Vezi și{' '}
        <Link href="/calculator/penalitati-anaf/">calculatorul de penalități ANAF</Link> pentru
        obligațiile fiscale, sau{' '}
        <Link href="/calculator/taxa-judiciara-de-timbru/">
          calculatorul taxei judiciare de timbru
        </Link>{' '}
        dacă vrei să recuperezi suma în instanță. Pentru alte calcule utile, vezi și{' '}
        <Link href="/calculator/">toate calculatoarele disponibile</Link>.
      </p>
    </CalculatorLayout>
  );
}
