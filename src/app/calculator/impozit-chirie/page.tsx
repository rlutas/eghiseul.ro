import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitChirieCalculator } from '@/components/calculators/impozit-chirie-calculator';

const SLUG = 'impozit-chirie';
const TITLE = 'Calculator Impozit pe Chirie 2026 — Venituri din Închiriere';
const DESCRIPTION =
  "Calculează impozitul pe chirie 2026: 10% pe venitul net (deducere 20%) plus CASS pe plafoane. Declarare prin Declarația Unică.";

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
      heading="Calculator Impozit pe Chirie 2026"
      description="Estimează impozitul și CASS pe veniturile din închiriere, conform regulilor fiscale în vigoare în 2026."
      tldr="În 2026, chiria pe termen lung se impozitează cu 10% pe venitul net (după deducerea forfetară de 20%), adică circa 8% din chiria brută. CASS se plătește pe plafon (6, 12 sau 24 salarii minime) doar dacă venitul net pasiv depășește 6 salarii minime pe an."
      widget={<ImpozitChirieCalculator />}
      faqs={[
        { q: 'Cât este impozitul pe chirie în 2026?', a: 'Impozitul este 10% aplicat pe venitul net. Venitul net = venit brut − 20% deducere forfetară (termen lung), deci impozitul efectiv este circa 8% din chiria încasată. Pentru închirierea turistică (scurtă durată) deducerea este 30%.' },
        { q: 'Plătesc CASS pentru veniturile din chirie?', a: 'Doar dacă venitul net cumulat din surse pasive depășește 6 salarii minime pe an. CASS se calculează pe plafon (10% din 6, 12 sau 24 salarii minime), nu pe venitul real.' },
        { q: 'Cine plătește impozitul dacă închiriez unei firme?', a: 'Dacă chiriașul este persoană juridică, firma reține impozitul de 10% la sursă. Tu poți datora în continuare CASS, declarată prin Declarația Unică.' },
        { q: 'Până când depun Declarația Unică pentru chirie?', a: 'Termenul standard este 25 mai al anului următor celui în care ai obținut venitul. În aceeași declarație estimezi și venitul anului curent și plătești impozitul aferent. Verifică termenul exact pe anaf.ro, deoarece poate fi prelungit prin ordin ANAF.' },
        { q: 'Cum se calculează CASS dacă am chirie și alte venituri pasive?', a: 'CASS pe venituri pasive (chirii, dividende, dobânzi, investiții) se cumulează. Plafonul se stabilește pe total: 6, 12 sau 24 de salarii minime brute. CASS este 10% din plafonul atins, nu din venitul real. Estimare orientativă, deoarece salariul minim crește la mijlocul anului 2026.' },
        { q: 'Pot deduce cheltuieli reale în loc de cota forfetară?', a: 'Pentru chiria în sistem real (mai mult de 5 contracte sau opțiune expresă) poți deduce cheltuieli reale documentate în locul cotei forfetare de 20%. Pentru majoritatea proprietarilor cu unul-două contracte, sistemul cu deducere forfetară de 20% este mai simplu și avantajos.' },
      ]}
    >
      <h2>Cum se calculează impozitul pe chirie în 2026</h2>
      <p>
        Pentru închirierea pe termen lung, venitul net = <strong>venit brut − 20% deducere
        forfetară</strong>, iar impozitul este <strong>10% pe venitul net</strong> (circa 8% din
        chiria brută). La închirierea turistică, deducerea forfetară este 30%.
      </p>
      <p>
        În plus, dacă venitul net cumulat din surse pasive depășește 6 salarii minime pe an, se
        datorează <strong>CASS</strong>, calculată pe plafon (6, 12 sau 24 salarii minime).
        Declararea se face prin <strong>Declarația Unică</strong>.
      </p>

      <h2>Exemplu numeric: chirie de 2.500 lei/lună (termen lung)</h2>
      <p>
        Să presupunem un apartament închiriat pe termen lung cu <strong>2.500 lei/lună</strong>,
        adică <strong>30.000 lei venit brut anual</strong>:
      </p>
      <ul>
        <li>Venit brut anual: 2.500 × 12 = <strong>30.000 lei</strong></li>
        <li>Deducere forfetară 20%: 30.000 × 20% = <strong>6.000 lei</strong></li>
        <li>Venit net impozabil: 30.000 − 6.000 = <strong>24.000 lei</strong></li>
        <li>Impozit 10%: 24.000 × 10% = <strong>2.400 lei/an</strong> (200 lei/lună, circa 8% din chiria brută)</li>
      </ul>
      <p>
        Pentru aceeași sumă închiriată în <strong>regim turistic</strong> (scurtă durată), deducerea
        este 30%: venit net = 30.000 − 9.000 = 21.000 lei, iar impozitul = <strong>2.100 lei/an</strong>.
        La un venit net pasiv de 24.000 lei nu se atinge plafonul CASS pentru 2026, deci în acest
        exemplu nu se datorează CASS — dar rezultatul depinde de salariul minim și de celelalte
        venituri pasive, fiind <strong>orientativ</strong>.
      </p>

      <h2>Plafoanele CASS pentru veniturile din chirie în 2026</h2>
      <p>
        CASS (contribuția de asigurări sociale de sănătate) se datorează doar dacă venitul net
        cumulat din surse pasive depășește 6 salarii minime brute pe an. Se aplică pe plafon, nu pe
        venitul real:
      </p>
      <ul>
        <li><strong>Sub 6 salarii minime</strong> — nu se datorează CASS din chirii.</li>
        <li><strong>Între 6 și 12 salarii minime</strong> — CASS = 10% × 6 salarii minime.</li>
        <li><strong>Între 12 și 24 salarii minime</strong> — CASS = 10% × 12 salarii minime.</li>
        <li><strong>Peste 24 salarii minime</strong> — CASS = 10% × 24 salarii minime.</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Atenție: salariul minim brut crește la mijlocul anului 2026 (4.050 lei în prima jumătate,
        4.325 lei în a doua), iar plafonul anual de referință poate varia. Valorile CASS sunt
        orientative — confirmă pragul aplicabil cu un contabil sau pe anaf.ro.
      </p>

      <h2>Greșeli frecvente și situații speciale</h2>
      <ul>
        <li>
          <strong>Aplici 10% pe chiria brută.</strong> Impozitul de 10% se aplică pe venitul net
          (după deducerea de 20% sau 30%), nu pe suma încasată integral.
        </li>
        <li>
          <strong>Uiți de reținerea la sursă când chiriașul e firmă.</strong> Dacă închiriezi unei
          persoane juridice, aceasta reține și virează impozitul; tu nu îl mai plătești a doua oară,
          dar poți datora CASS prin Declarația Unică.
        </li>
        <li>
          <strong>Nu declari în termen.</strong> Declarația Unică se depune până la 25 mai a anului
          următor; nedepunerea poate atrage majorări și penalități de întârziere.
        </li>
        <li>
          <strong>Confunzi regimul forfetar cu sistemul real.</strong> Cota forfetară de 20% este
          implicită pentru contracte obișnuite; sistemul real (cheltuieli documentate) se aplică
          peste 5 contracte sau prin opțiune expresă.
        </li>
      </ul>
      <p>
        Dacă vrei să verifici alte obligații fiscale, vezi și{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link> sau{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net/brut</Link>. Pentru
        formalități precum dovada de bună reputație la administrarea unor proprietăți, poți obține
        rapid{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar online</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă conform Codului Fiscal 2026. Pentru situații speciale consultă un contabil.
      </p>
    </CalculatorLayout>
  );
}
