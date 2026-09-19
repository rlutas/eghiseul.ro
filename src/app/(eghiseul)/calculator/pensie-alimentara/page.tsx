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
      tldr="Pensia alimentară se calculează ca o cotă din venitul net lunar al părintelui obligat (art. 529 Cod Civil): până la 1/4 (25%) pentru un copil, 1/3 pentru doi și 1/2 pentru trei sau mai mulți, fără ca totalul întreținerii să depășească 50% din venitul net."
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
        {
          q: 'Ce se întâmplă cu pensia dacă mai am alți copii dintr-o altă relație?',
          a: 'Cota se raportează la numărul total de copii pe care părintele obligat are datoria să îi întrețină, indiferent din câte relații provin. Un părinte cu doi copii din relații diferite datorează în total până la 1/3 din venitul net, sumă care se împarte între cei doi copii — nu 1/4 separat pentru fiecare.',
        },
        {
          q: 'Pensia alimentară se calculează din venitul net sau brut?',
          a: 'Întotdeauna din venitul net, adică suma rămasă după reținerea impozitului pe venit și a contribuțiilor sociale obligatorii (CAS, CASS). De aceea calculatorul cere venitul net încasat efectiv, nu salariul brut din contract.',
        },
        {
          q: 'Se plătește pensie alimentară dacă există custodie comună sau program egal de vizitare?',
          a: 'Da, obligația de întreținere rămâne chiar și în custodie comună. Dacă veniturile părinților diferă, părintele cu venitul mai mare poate fi obligat la o pensie pentru a echilibra contribuția fiecăruia la cheltuielile copilului. Custodia comună nu anulează automat pensia alimentară.',
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

      <h2>Tabel orientativ: pensia în funcție de venit și număr de copii</h2>
      <p>
        Tabelul de mai jos aplică plafoanele maxime din art. 529 (1/4, 1/3, 1/2 din venitul net) pentru câteva niveluri
        uzuale de venit. Sumele reprezintă <strong>totalul</strong> datorat pentru toți copiii, nu pe copil:
      </p>
      <table>
        <thead>
          <tr>
            <th>Venit net lunar</th>
            <th>1 copil (1/4)</th>
            <th>2 copii (1/3)</th>
            <th>3+ copii (1/2)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2.574 lei (salariu minim)</td>
            <td>644 lei</td>
            <td>858 lei</td>
            <td>1.287 lei</td>
          </tr>
          <tr>
            <td>4.000 lei</td>
            <td>1.000 lei</td>
            <td>1.333 lei</td>
            <td>2.000 lei</td>
          </tr>
          <tr>
            <td>6.000 lei</td>
            <td>1.500 lei</td>
            <td>2.000 lei</td>
            <td>3.000 lei</td>
          </tr>
          <tr>
            <td>10.000 lei</td>
            <td>2.500 lei</td>
            <td>3.333 lei</td>
            <td>5.000 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Valorile sunt <strong>limite maxime</strong>. La un salariu minim net de 2.699 lei (din 1 iulie 2026), pensia
        pentru un copil ar fi 1/4 × 2.699 = <strong>675 lei</strong>.
      </p>

      <h2>Exemplu pas cu pas: doi copii din relații diferite</h2>
      <p>
        Un părinte are un venit net de <strong>4.500 lei/lună</strong> și doi copii proveniți din relații diferite.
        Deoarece cota se raportează la <strong>numărul total de copii întreținuți</strong>, se aplică plafonul pentru doi
        copii:
      </p>
      <ul>
        <li>
          <strong>Pas 1:</strong> identifici cota — pentru 2 copii, până la <strong>1/3</strong> din venitul net.
        </li>
        <li>
          <strong>Pas 2:</strong> calculezi totalul — 1/3 × 4.500 = <strong>1.500 lei</strong>.
        </li>
        <li>
          <strong>Pas 3:</strong> împarți între copii — aproximativ <strong>750 lei pentru fiecare copil</strong>.
        </li>
      </ul>
      <p>
        Atenție la o greșeală frecventă: nu se aplică 1/4 separat pentru fiecare copil (ceea ce ar însemna 2.250 lei),
        pentru că totalul întreținerii nu poate depăși plafonul corespunzător numărului total de copii.
      </p>

      <h2>Greșeli frecvente la calculul pensiei</h2>
      <ul>
        <li>
          <strong>Folosirea venitului brut:</strong> cota se aplică la venitul <strong>net</strong>, nu la salariul brut
          din contract.
        </li>
        <li>
          <strong>Ignorarea plafonului global de 50%:</strong> totalul întreținerii datorate (copii plus, eventual,
          soțul) nu poate depăși jumătate din venitul net (art. 529 alin. 3).
        </li>
        <li>
          <strong>Oprirea plății la 18 ani când copilul studiază:</strong> dacă tânărul major continuă studiile, pensia
          se datorează până la finalizarea lor, dar cel mult până la 26 de ani (art. 499).
        </li>
        <li>
          <strong>Presupunerea că lipsa veniturilor anulează obligația:</strong> instanța raportează pensia la salariul
          minim net pe economie chiar dacă părintele nu prezintă venituri.
        </li>
      </ul>
      <p>
        Dacă pregătești un dosar de divorț sau de stabilire a pensiei, poți estima și alte costuri cu{' '}
        <Link href="/calculator/">celelalte calculatoare eGhișeul</Link> sau poți rezolva online formalitățile prin{' '}
        <Link href="/servicii/">serviciile noastre</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Cotele sunt maxime; cuantumul real se stabilește de instanță sau prin acordul părinților,
        ținând cont de nevoile copilului și de mijloacele părintelui.
      </p>
    </CalculatorLayout>
  );
}
