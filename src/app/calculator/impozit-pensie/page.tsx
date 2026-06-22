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
      tldr="În 2026, pensia se impozitează cu 10% și se reține CASS 10%, dar doar pe partea care depășește 3.000 lei pe lună (Legea 141/2025); pensiile până în 3.000 lei sunt scutite integral. CASS se reține prima și se scade din baza impozitului."
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
        {
          q: 'De ce CASS se calculează înaintea impozitului?',
          a: 'Pentru că CASS este o contribuție deductibilă: se reține prima, din partea care depășește 3.000 lei, iar impozitul de 10% se aplică abia după ce CASS a fost scăzut din bază. Astfel impozitul nu se calculează pe o sumă din care s-a reținut deja CASS, evitând dubla impozitare a aceleiași contribuții.',
        },
        {
          q: 'Pensia de invaliditate sau de urmaș se impozitează la fel?',
          a: 'Regula pragului de 3.000 lei și cotele de 10% impozit și 10% CASS se aplică pe suma încasată lunar, indiferent de tipul pensiei. Dacă o persoană încasează mai multe pensii, modul de cumulare poate diferi, de aceea recomandăm verificarea pe talonul de pensie emis de Casa de Pensii.',
        },
        {
          q: 'Cine reține impozitul și CASS din pensie?',
          a: 'Reținerea se face automat la sursă de către Casa Națională de Pensii Publice, înainte de plata pensiei. Pensionarul primește direct suma netă, fără să depună vreo declarație, iar pe talon apar separat impozitul și CASS reținute.',
        },
        {
          q: 'O pensie de exact 3.001 lei cât plătește?',
          a: 'Doar 1 leu depășește pragul de 3.000 lei, deci se aplică 10% CASS pe acel leu (0,1 lei) și 10% impozit pe restul (sub 0,1 lei). În practică, pensiile aflate imediat peste prag sunt impozitate cu sume neglijabile, pentru că ambele cote se aplică exclusiv pe diferența peste 3.000 lei, nu pe toată pensia.',
        },
        {
          q: 'Pensiile private de la Pilonul II și III intră în acest calcul?',
          a: 'Acest calculator estimează impozitul și CASS pe pensia publică plătită de Casa Națională de Pensii Publice. Sumele încasate din pensiile private (Pilon II și III) au reguli proprii de impozitare la momentul plății și nu se cumulează automat cu pensia publică în formula de aici. Verifică talonul și documentele administratorului fondului pentru regimul exact.',
        },
        {
          q: 'Se modifică pragul de 3.000 lei în fiecare an?',
          a: 'Pragul scutit de 3.000 lei și cotele de 10% impozit și 10% CASS sunt valorile în vigoare pentru 2026, conform legislației aplicabile pensiilor. Orice modificare a pragului sau a cotelor printr-o lege ulterioară ar schimba rezultatul, motiv pentru care calculatorul este orientativ și recomandăm verificarea pe talonul oficial.',
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

      <h2>Calcul pas cu pas pentru o pensie de 5.000 lei</h2>
      <p>
        Pentru a vedea exact cum se aplică regulile, urmărește un exemplu detaliat la o pensie brută de{' '}
        <strong>5.000 lei</strong> pe lună:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — partea impozabilă:</strong> din 5.000 lei se scade pragul scutit de 3.000 lei, rămân{' '}
          <strong>2.000 lei</strong> peste prag.
        </li>
        <li>
          <strong>Pasul 2 — CASS:</strong> 10% din 2.000 lei = <strong>200 lei</strong>. CASS se reține prima.
        </li>
        <li>
          <strong>Pasul 3 — baza impozitului:</strong> din partea peste prag se scade CASS: 2.000 − 200 ={' '}
          <strong>1.800 lei</strong>.
        </li>
        <li>
          <strong>Pasul 4 — impozit:</strong> 10% din 1.800 lei = <strong>180 lei</strong>.
        </li>
        <li>
          <strong>Pasul 5 — pensie netă:</strong> 5.000 − 200 (CASS) − 180 (impozit) = <strong>4.620 lei</strong> încasați.
        </li>
      </ul>

      <h2>Tabel comparativ pensie brută vs. netă</h2>
      <table>
        <thead>
          <tr>
            <th>Pensie brută</th>
            <th>CASS (10%)</th>
            <th>Impozit (10%)</th>
            <th>Pensie netă</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>3.000 lei</td>
            <td>0 lei</td>
            <td>0 lei</td>
            <td>3.000 lei</td>
          </tr>
          <tr>
            <td>4.000 lei</td>
            <td>100 lei</td>
            <td>90 lei</td>
            <td>3.810 lei</td>
          </tr>
          <tr>
            <td>5.000 lei</td>
            <td>200 lei</td>
            <td>180 lei</td>
            <td>4.620 lei</td>
          </tr>
          <tr>
            <td>6.300 lei</td>
            <td>330 lei</td>
            <td>297 lei</td>
            <td>5.673 lei</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente la calculul impozitului pe pensie</h2>
      <ul>
        <li>
          <strong>Aplicarea cotei pe toată pensia.</strong> Cele două cote de 10% nu se aplică pe întreaga pensie, ci
          doar pe partea care depășește pragul de 3.000 lei. O pensie de 3.000 lei rămâne scutită integral.
        </li>
        <li>
          <strong>Inversarea ordinii.</strong> Dacă impozitul se calculează înaintea CASS, rezultă o sumă greșită. CASS
          se reține prima și reduce baza pe care se aplică impozitul de 10%.
        </li>
        <li>
          <strong>Confuzia între brut și net.</strong> Suma de pe talon poate fi deja netă; pentru a estima câștigul net
          pornește mereu de la pensia brută lunară.
        </li>
      </ul>

      <h2>Context legal</h2>
      <p>
        Extinderea CASS la pensii pentru perioada <strong>2026-2027</strong> a fost introdusă prin{' '}
        <strong>Legea 141/2025</strong>. Măsura se aplică doar pensiilor a căror parte depășește pragul de 3.000 lei și
        este în vigoare, însă a fost contestată la Curtea Constituțională (CCR). Până la o eventuală decizie de
        neconstituționalitate, reținerile se fac conform legii în vigoare, motiv pentru care rezultatul acestui
        calculator rămâne orientativ.
      </p>

      <h2>Cum funcționează pragul de 3.000 lei</h2>
      <p>
        Pragul de <strong>3.000 lei</strong> nu este o sumă de la care se schimbă cota, ci o{' '}
        <strong>parte scutită</strong> care se scade întotdeauna înainte de aplicarea celor două cote de 10%. Indiferent
        cât de mare este pensia, primii 3.000 lei rămân neimpozitați, iar impozitul și CASS se aplică exclusiv pe
        diferența de deasupra pragului. De aceea o pensie aflată chiar peste prag plătește sume foarte mici, în timp ce
        sarcina fiscală crește treptat pe măsură ce pensia se îndepărtează de cei 3.000 lei.
      </p>
      <table>
        <thead>
          <tr>
            <th>Pensie brută</th>
            <th>Parte peste prag</th>
            <th>Total reținut (CASS + impozit)</th>
            <th>Procent din pensie</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>3.000 lei</td>
            <td>0 lei</td>
            <td>0 lei</td>
            <td>0%</td>
          </tr>
          <tr>
            <td>4.000 lei</td>
            <td>1.000 lei</td>
            <td>190 lei</td>
            <td>4,75%</td>
          </tr>
          <tr>
            <td>5.000 lei</td>
            <td>2.000 lei</td>
            <td>380 lei</td>
            <td>7,60%</td>
          </tr>
          <tr>
            <td>6.300 lei</td>
            <td>3.300 lei</td>
            <td>627 lei</td>
            <td>9,95%</td>
          </tr>
        </tbody>
      </table>
      <p>
        Pe măsură ce partea peste prag se apropie de valoarea totală a pensiei, procentul efectiv reținut se apropie de
        cumulul celor două cote, dar nu îl atinge niciodată, fiindcă cei 3.000 lei scutiți rămân mereu în afara bazei de
        calcul.
      </p>

      <h2>Cazuri speciale</h2>
      <ul>
        <li>
          <strong>Mai multe pensii încasate simultan.</strong> Dacă o persoană primește mai multe pensii, modul în care
          se cumulează sumele pentru aplicarea pragului de 3.000 lei și a cotelor de 10% poate diferi. Pe talonul emis de
          Casa de Pensii apar reținerile efective, așa că acolo se vede situația exactă.
        </li>
        <li>
          <strong>Pensia de invaliditate și de urmaș.</strong> Aceleași reguli — pragul scutit de 3.000 lei și cele două
          cote de 10% — se aplică pe suma încasată lunar, indiferent de tipul pensiei publice.
        </li>
        <li>
          <strong>Pensie cumulată cu salariu.</strong> Dacă pensionarul are și venituri din muncă, salariul se
          impozitează separat, după regulile lui, iar pensia rămâne supusă pragului de 3.000 lei și cotelor de aici.
        </li>
        <li>
          <strong>Pensii imediat peste prag.</strong> O pensie aflată cu puțin peste 3.000 lei plătește sume neglijabile,
          pentru că ambele cote se aplică doar pe diferența mică ce depășește pragul.
        </li>
      </ul>

      <h2>De ce rezultatul este orientativ</h2>
      <p>
        Reținerile se fac automat la sursă de Casa Națională de Pensii Publice, iar pe talon impozitul și CASS apar
        separat. Acest calculator reproduce ordinea oficială — CASS prima, scăzută din baza impozitului — și folosește
        pragul de 3.000 lei și cotele de 10% în vigoare pentru 2026. Totuși, situațiile cu pensii cumulate, eventuale
        modificări legislative ulterioare sau o decizie a Curții Constituționale pot schimba sumele finale. Pentru
        cifrele exacte încasate, sursa de referință rămâne talonul de pensie.
      </p>

      <p>
        Vezi și <Link href="/calculator/salariu/">calculatorul de salariu net</Link>,{' '}
        <Link href="/calculator/indemnizatie-somaj/">calculatorul de indemnizație de șomaj</Link> sau{' '}
        <Link href="/calculator/impozit-chirie/">calculatorul de impozit pe chirie</Link>. Dacă ai nevoie de documente
        oficiale, vezi <Link href="/servicii/">serviciile eGhișeul.ro</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. CASS pe pensii este în vigoare 2026-2027 și este contestat la CCR; regulile pot fi
        modificate.
      </p>
    </CalculatorLayout>
  );
}
