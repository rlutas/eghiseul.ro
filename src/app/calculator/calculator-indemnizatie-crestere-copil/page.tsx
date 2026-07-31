import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { IccCalculator } from '@/components/calculators/icc-calculator';

const SLUG = 'calculator-indemnizatie-crestere-copil';
const TITLE = 'Calculator Indemnizație Creștere Copil 2026 (ICC)';
const DESCRIPTION =
  'Calculează indemnizația de creștere a copilului în 2026: 85% din venitul net mediu, între 1.650 ' +
  'și 8.500 lei brut, cu reținerea CASS de 10%.';

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
      heading="Calculator Indemnizație Creștere Copil 2026"
      description="Estimează indemnizația lunară de creștere a copilului (ICC) pe baza venitului net mediu, conform regulilor în vigoare în 2026."
      tldr="În 2026, indemnizația de creștere a copilului este 85% din venitul net mediu lunar, între minimul de 1.650 lei și maximul de 8.500 lei brut. Din suma brută se reține CASS 10%, deci maximul net încasat este 7.650 lei pe lună."
      widget={<IccCalculator />}
      faqs={[
        { q: 'Cât este indemnizația de creștere a copilului în 2026?', a: 'ICC este 85% din venitul net mediu lunar din ultimele 12 luni (din cele 24 dinaintea nașterii), între un minim de 1.650 lei și un maxim de 8.500 lei brut. Din suma brută se reține CASS 10%.' },
        { q: 'Care este indemnizația minimă și maximă?', a: 'Minimul este 1.650 lei brut (2,5 × ISR), iar maximul 8.500 lei brut. După reținerea CASS de 10%, maximul net încasat este 7.650 lei.' },
        { q: 'Se reține ceva din indemnizație?', a: 'Da, din 1 august 2025 se reține CASS 10% din indemnizația brută. Calculatorul afișează atât suma brută, cât și suma netă încasată.' },
        { q: 'Ce este stimulentul de inserție?', a: 'Dacă te întorci la muncă, poți primi stimulentul de inserție în locul ICC: 1.500 lei/lună dacă obții venituri înainte ca bebelușul să împlinească 6 luni, sau 650 lei/lună după.' },
        { q: 'Câte luni de venituri se iau în calcul?', a: 'Se folosesc 12 luni de venituri din cele 24 de luni dinaintea nașterii. Pentru aceste 12 luni se calculează venitul net mediu lunar, iar indemnizația este 85% din această medie.' },
        { q: 'Cât primește efectiv o persoană cu venitul net mediu de 4.000 lei?', a: 'Indemnizația brută este 85% × 4.000 = 3.400 lei. Suma se află între minim (1.650 lei) și maxim (8.500 lei), deci rămâne 3.400 lei brut. După reținerea CASS de 10% (340 lei), încasezi aproximativ 3.060 lei net pe lună.' },
        { q: 'Indemnizația de creștere a copilului se cumulează cu alocația de stat?', a: 'Da. Alocația de stat pentru copii este un drept separat și se acordă în plus față de indemnizația de creștere a copilului sau față de stimulentul de inserție.' },
        { q: 'Până la ce vârstă a copilului se acordă indemnizația?', a: 'Indemnizația se acordă până când copilul împlinește 2 ani. În cazul copilului cu handicap, perioada se extinde până la 3 ani. Dacă te întorci la muncă mai devreme, poți opta pentru stimulentul de inserție.' },
        { q: 'Cât este stimulentul de inserție dacă mă întorc la muncă?', a: 'Stimulentul de inserție este 1.500 lei pe lună dacă obții venituri înainte ca bebelușul să împlinească 6 luni și 650 lei pe lună dacă te întorci mai târziu. Spre deosebire de ICC, stimulentul nu depinde de venitul tău anterior și se acordă în sumă fixă.' },
        { q: 'Poate tatăl să ia concediul de creștere a copilului?', a: 'Da. Concediul poate fi luat de oricare dintre părinți, dacă a realizat venituri 12 luni din ultimele 24. În plus, cel puțin două luni din perioada totală revin obligatoriu celuilalt părinte — dacă nu le folosește, se pierd, nu se transferă.' },
        { q: 'Ce acte trebuie la dosarul de indemnizație?', a: 'Certificatul de naștere al copilului, actele de identitate ale părinților, adeverința de venituri pentru cele 12 luni, dovada suspendării contractului de muncă, cererea tip și extrasul de cont. Dosarul se depune la AJPIS în cel mult 60 de zile de la finalul concediului de maternitate.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de creștere a copilului</h2>
      <p>
        Indemnizația lunară este <strong>85% din venitul net mediu</strong> realizat în 12 luni din
        cele 24 dinaintea nașterii. Rezultatul se încadrează între un <strong>minim de 1.650 lei</strong>{' '}
        (2,5 × ISR, unde ISR = 660 lei în 2026) și un <strong>maxim de 8.500 lei</strong> brut.
      </p>
      <p>
        Din 1 august 2025 se reține <strong>CASS 10%</strong> din indemnizația brută, deci suma
        efectiv încasată este cu 10% mai mică (de exemplu, 8.500 lei brut → 7.650 lei net).
      </p>
      <h2>Durata și stimulentul de inserție</h2>
      <p>
        Indemnizația se acordă până când copilul împlinește 2 ani (3 ani pentru copilul cu handicap).
        Dacă te întorci mai devreme la muncă, poți primi <strong>stimulentul de inserție</strong> în
        locul ICC.
      </p>
      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem un venit net mediu lunar de <strong>5.000 lei</strong> în cele 12 luni luate în
        calcul. Pașii sunt:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — indemnizația brută:</strong> 85% × 5.000 = <strong>4.250 lei</strong>.
        </li>
        <li>
          <strong>Pasul 2 — încadrarea în limite:</strong> 4.250 lei se află între minimul de 1.650 lei
          și maximul de 8.500 lei, deci rămâne 4.250 lei brut.
        </li>
        <li>
          <strong>Pasul 3 — reținerea CASS 10%:</strong> 10% × 4.250 = 425 lei.
        </li>
        <li>
          <strong>Pasul 4 — suma netă încasată:</strong> 4.250 − 425 = <strong>3.825 lei pe lună</strong>.
        </li>
      </ul>
      <p>
        Dacă venitul net mediu ar fi fost foarte mare (de exemplu 12.000 lei), indemnizația brută s-ar
        plafona la <strong>8.500 lei</strong>, iar net ai încasa 7.650 lei. Dacă media netă ar fi sub
        circa 1.941 lei, indemnizația brută s-ar ridica la minimul de 1.650 lei.
      </p>

      <h2>Tabel orientativ: brut, CASS și net încasat</h2>
      <p>
        Tabelul de mai jos arată câteva scenarii frecvente. Coloana „brut” reprezintă 85% din venitul
        net mediu (încadrat între 1.650 și 8.500 lei), iar „net încasat” este suma rămasă după CASS 10%.
      </p>
      <table>
        <thead>
          <tr>
            <th>Venit net mediu</th>
            <th>Indemnizație brută (85%)</th>
            <th>CASS 10%</th>
            <th>Net încasat</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.941 lei sau mai puțin</td>
            <td>1.650 lei (minim)</td>
            <td>165 lei</td>
            <td>1.485 lei</td>
          </tr>
          <tr>
            <td>3.000 lei</td>
            <td>2.550 lei</td>
            <td>255 lei</td>
            <td>2.295 lei</td>
          </tr>
          <tr>
            <td>5.000 lei</td>
            <td>4.250 lei</td>
            <td>425 lei</td>
            <td>3.825 lei</td>
          </tr>
          <tr>
            <td>10.000 lei sau mai mult</td>
            <td>8.500 lei (maxim)</td>
            <td>850 lei</td>
            <td>7.650 lei</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente la calcul</h2>
      <ul>
        <li>
          <strong>Confuzia brut–net.</strong> Indemnizația minimă și maximă (1.650 / 8.500 lei) sunt
          exprimate în sume brute. Din ele se reține CASS 10%, deci ce primești efectiv este mai puțin.
        </li>
        <li>
          <strong>Folosirea venitului brut în loc de net.</strong> Cei 85% se aplică la media venitului
          <strong> net</strong>, nu la salariul brut din contract.
        </li>
        <li>
          <strong>Ignorarea plafonului maxim.</strong> Indiferent cât de mare e venitul, indemnizația
          brută nu poate depăși 8.500 lei.
        </li>
        <li>
          <strong>Numărarea greșită a lunilor.</strong> Se iau 12 luni cu venituri din intervalul de 24
          de luni dinaintea nașterii, nu neapărat ultimele 12 luni consecutive.
        </li>
      </ul>

      <h2>Stimulent de inserție sau indemnizație: ce alegi?</h2>
      <p>
        Mulți părinți ezită între a rămâne pe indemnizație și a reveni la muncă pentru stimulentul de
        inserție. Diferența practică este simplă: <strong>ICC</strong> îți acoperă 85% din venitul net
        mediu (între 1.650 și 8.500 lei brut), în timp ce <strong>stimulentul de inserție</strong> este o
        sumă fixă de 1.500 lei sau 650 lei pe lună, indiferent cât ai câștigat înainte.
      </p>
      <ul>
        <li>
          <strong>Dacă aveai un venit mic</strong> (de exemplu net mediu sub circa 1.765 lei), stimulentul
          de 1.500 lei poate fi mai avantajos decât indemnizația plafonată la minim.
        </li>
        <li>
          <strong>Dacă aveai un venit mare,</strong> indemnizația de creștere a copilului depășește net
          stimulentul, așa că ai de câștigat rămânând acasă cât timp ești îndreptățit.
        </li>
        <li>
          <strong>Stimulentul se cumulează cu salariul:</strong> revii la muncă, încasezi salariul integral
          și primești în plus suma fixă, plus alocația de stat a copilului.
        </li>
      </ul>

      <h2>Cazuri speciale și situații care influențează cuantumul</h2>
      <p>
        Calculul standard de 85% din venitul net mediu are câteva nuanțe importante de care depinde suma
        finală:
      </p>
      <ul>
        <li>
          <strong>Sarcini suprapuse.</strong> Dacă rămâi însărcinată din nou în timpul indemnizației, ai
          dreptul la un cuantum suplimentar pentru perioada de suprapunere, conform regulilor în vigoare.
        </li>
        <li>
          <strong>Copil cu handicap.</strong> Indemnizația se acordă până la 3 ani, nu doar 2 ani, iar
          părintele beneficiază de drepturi suplimentare prevăzute de lege.
        </li>
        <li>
          <strong>Venituri din mai multe surse.</strong> La media netă se iau în calcul nu doar salariile,
          ci și veniturile din activități independente, drepturi de autor sau alte surse impozabile
          realizate în cele 12 luni relevante.
        </li>
        <li>
          <strong>Plafonarea la maxim.</strong> Indiferent de numărul surselor de venit, indemnizația brută
          nu poate depăși 8.500 lei, deci net încasezi cel mult 7.650 lei pe lună.
        </li>
      </ul>

      <h2>Concediul de creștere a copilului: cine poate beneficia și cât durează</h2>
      <p>
        Concediul de creștere a copilului (CCC) poate fi luat de <strong>oricare dintre părinți</strong>,
        cu o condiție de bază: să fi realizat venituri impozabile timp de <strong>12 luni din ultimele
        24</strong> dinaintea nașterii — din salarii, activități independente, drepturi de autor sau
        combinații între ele. Concediul durează până când copilul împlinește <strong>2 ani</strong>{' '}
        (3 ani pentru copilul cu handicap), iar pe toată perioada contractul de muncă este suspendat,
        cu interdicția concedierii.
      </p>
      <p>
        O regulă pe care mulți o află târziu: din perioada totală a concediului,{' '}
        <strong>cel puțin două luni revin celuilalt părinte</strong> („luna tatălui”, extinsă la două
        din 2022). Dacă celălalt părinte nu își ia cele două luni, ele <strong>se pierd</strong> — nu se
        transferă. Practic, un singur părinte poate sta acasă cel mult până la vârsta de 2 ani minus
        două luni, iar planificarea acestor luni merită discutată din timp cu angajatorii amândurora.
        Pentru cele 10 zile lucrătoare de la naștere, vezi și calculatorul de{' '}
        <Link href="/calculator/concediu-paternal/">concediu paternal</Link>.
      </p>

      <h2>Actele pentru dosarul de indemnizație</h2>
      <p>
        Dosarul se depune la AJPIS (agenția județeană pentru plăți și inspecție socială), de regulă prin
        primărie sau direct, în termen de 60 de zile de la finalul concediului de maternitate. Pe scurt,
        ai nevoie de:
      </p>
      <ul>
        <li>
          <strong>certificatul de naștere al copilului</strong> (original și copie) — piesa centrală a
          dosarului; dacă nu l-ai ridicat încă sau ai nevoie de un duplicat, îl poți obține și online,
          prin serviciul de{' '}
          <Link href="/servicii/eliberare-certificat-de-nastere/">eliberare a certificatului de naștere</Link>,
          fără drumuri la starea civilă;
        </li>
        <li>actele de identitate ale ambilor părinți și, după caz, certificatul de căsătorie;</li>
        <li>
          <strong>adeverința de venituri</strong> de la angajator (sau documentele ANAF pentru veniturile
          independente) pentru cele 12 luni luate în calcul;
        </li>
        <li>dovada suspendării activității (decizia angajatorului de suspendare a contractului);</li>
        <li>cererea tip și extrasul de cont pentru plata indemnizației.</li>
      </ul>
      <p>
        Pașii administrativi de dinaintea dosarului — de la maternitate până la certificatul de naștere —
        sunt descriși pe larg în ghidul nostru despre{' '}
        <Link href="/inregistrare-nastere-copil-nou-nascut/">înregistrarea nașterii unui copil nou-născut</Link>.
      </p>

      <h2>Context legal și actualizări</h2>
      <p>
        Indemnizația de creștere a copilului este reglementată prin OUG 111/2010 și normele sale de
        aplicare. Pragul minim se calculează ca 2,5 × ISR (indicatorul social de referință), iar pragul
        maxim este stabilit la 8.500 lei brut. Reținerea <strong>CASS 10%</strong> a fost introdusă din 1
        august 2025, motiv pentru care suma efectiv încasată este mai mică decât cuantumul brut comunicat
        de autorități. Cererea pentru indemnizație se depune la agenția județeană pentru plăți și
        inspecție socială (AJPIS), de regulă în termen de 60 de zile de la încheierea concediului de
        maternitate, împreună cu documentele care atestă veniturile din cele 12 luni luate în calcul.
      </p>

      <p>
        Pentru perioada dinainte de naștere, vezi și calculatorul de{' '}
        <Link href="/calculator/concediu-maternitate/">concediu de maternitate</Link>, util pentru a estima
        indemnizația aferentă celor 126 de zile de concediu prenatal și postnatal.
      </p>

      <p>
        Dacă pregătești dosarul pentru indemnizație sau pentru reluarea activității, ai putea avea nevoie
        și de un{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar online</Link> sau de o estimare a{' '}
        <Link href="/calculator/salariu/">salariului net din salariul brut</Link> pentru perioada de după
        revenirea la muncă.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Cuantumul exact se stabilește de autorități pe baza veniturilor declarate,
        iar pragurile minim și maxim pot fi actualizate prin modificări legislative.
      </p>
    </CalculatorLayout>
  );
}
