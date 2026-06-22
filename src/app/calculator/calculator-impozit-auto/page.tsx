import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitAutoCalculator } from '@/components/calculators/impozit-auto-calculator';

const SLUG = 'calculator-impozit-auto';
const TITLE = 'Calculator Impozit Auto 2026 — Taxa pe Mașină';
const DESCRIPTION =
  "Calculează impozitul auto 2026 după capacitatea cilindrică și norma de poluare Euro. Estimare rapidă a taxei anuale pe mașină.";

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
      heading="Calculator Impozit Auto 2026"
      description="Estimează impozitul anual pe mașină conform noilor reguli din 2026, care țin cont atât de capacitatea cilindrică, cât și de norma de poluare Euro."
      widget={<ImpozitAutoCalculator />}
      faqs={[
        { q: 'Cum se calculează impozitul auto în 2026?', a: 'Din 2026, impozitul depinde de capacitatea cilindrică ȘI de norma de poluare (Euro). Se ia numărul de grupe de 200 cmc (rotunjit în sus) înmulțit cu tariful pe grupă corespunzător normei Euro, apoi se aplică eventuala cotă adițională a primăriei (0-50%).' },
        { q: 'Mașinile electrice plătesc impozit?', a: 'Da, din 2026 mașinile electrice plătesc un impozit fix de 40 lei/an (anterior erau scutite). Hibridele cu emisii reduse (≤50g CO₂) pot beneficia de o reducere de până la 30%.' },
        { q: 'De ce diferă suma față de ce plătesc eu?', a: 'Pentru că fiecare primărie poate aplica o cotă adițională de până la 50% peste valoarea de referință. Calculatorul oferă o estimare — suma exactă o stabilește Direcția de Taxe locale.' },
        { q: 'Contează vârsta mașinii?', a: 'Nu. Din 2026, vârsta vehiculului nu mai este criteriu — contează capacitatea cilindrică și norma de poluare.' },
        { q: 'Cum aflu norma de poluare Euro a mașinii mele?', a: 'Norma Euro apare în cartea de identitate a vehiculului (CIV) și în certificatul de înmatriculare, de regulă la rubrica privind nivelul de emisii sau în câmpul de observații. Dacă nu este menționată explicit, o poți afla după anul de fabricație și tipul motorului sau întrebând la RAR. Norma corectă contează, pentru că tariful pe grupă de 200 cmc diferă de la Euro 3 la Euro 6.' },
        { q: 'Plătesc impozit dacă mașina e nefolosită sau în reparații?', a: 'Da. Impozitul auto se datorează cât timp vehiculul este înmatriculat pe numele tău, indiferent dacă circulă sau nu. Singura modalitate de a nu mai plăti este radierea din circulație la Serviciul de Înmatriculări. Dacă vinzi mașina, impozitul se recalculează începând cu data de 1 ianuarie a anului următor radierii sau transferului.' },
        { q: 'Când se plătește impozitul auto și există reduceri?', a: 'Impozitul se plătește în două rate egale, până la 31 martie și până la 30 septembrie. Multe primării acordă o bonificație de până la 10% pentru plata integrală anticipată, de regulă până la 31 martie. Procentul exact al bonificației se stabilește prin hotărâre locală, deci este orientativ și diferă de la o localitate la alta.' },
      ]}
    >
      <h2>Cum se calculează impozitul auto în 2026</h2>
      <p>
        Începând cu 2026 (Legea 239/2025 și OUG 78/2025), impozitul pe mijloacele de transport se
        calculează în funcție de <strong>capacitatea cilindrică</strong> și de{' '}
        <strong>norma de poluare Euro</strong>. Formula: numărul de grupe de 200 cmc (rotunjit în
        sus) × tariful pe grupă corespunzător normei Euro, plus cota adițională a primăriei.
      </p>
      <h2>Reguli noi din 2026</h2>
      <ul>
        <li>mașinile mici (≤1.600 cmc) plătesc mai mult decât în 2025, iar cele mari (peste 3.000 cmc) plătesc mai puțin;</li>
        <li><strong>electricele</strong> plătesc 40 lei/an (nu mai sunt scutite);</li>
        <li><strong>hibridele ≤50g CO₂</strong> pot avea reducere de până la 30%;</li>
        <li>vârsta mașinii nu mai contează.</li>
      </ul>
      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem o mașină cu <strong>1.598 cmc</strong> și normă de poluare <strong>Euro 5</strong>,
        înmatriculată într-o localitate care aplică o cotă adițională de 20%:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — grupe de 200 cmc:</strong> 1.598 ÷ 200 = 7,99, rotunjit în sus la{' '}
          <strong>8 grupe</strong> (rotunjirea se face întotdeauna în sus, chiar și la o fracțiune mică).
        </li>
        <li>
          <strong>Pasul 2 — tariful pe grupă:</strong> pentru tranșa ≤1.600 cmc și Euro 5 tariful de
          referință este de aproximativ <strong>17,6 lei/grupă</strong>.
        </li>
        <li>
          <strong>Pasul 3 — impozitul de bază:</strong> 8 × 17,6 = <strong>140,8 lei</strong>.
        </li>
        <li>
          <strong>Pasul 4 — cota adițională a primăriei:</strong> 140,8 × 20% = 28,16 lei, deci total
          ≈ <strong>169 lei/an</strong> (rotunjit conform regulilor locale).
        </li>
      </ul>
      <p className="text-sm text-neutral-500">
        Tarifele pe grupă sunt orientative: ele reprezintă valori de referință din Codul Fiscal, iar
        consiliile locale pot stabili nivelul efectiv în limita prevăzută de lege.
      </p>

      <h2>Tabelul orientativ pe tranșe de capacitate cilindrică</h2>
      <p>
        Tariful pe fiecare grupă de 200 cmc (în lei) variază în funcție de tranșa de capacitate
        cilindrică și de norma de poluare. Cu cât norma Euro este mai recentă, cu atât tariful este
        mai mic:
      </p>
      <table>
        <thead>
          <tr>
            <th>Capacitate cilindrică</th>
            <th>Euro 3</th>
            <th>Euro 4</th>
            <th>Euro 5</th>
            <th>Euro 6</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>până la 1.600 cmc</td>
            <td>19,5</td>
            <td>18,8</td>
            <td>17,6</td>
            <td>16,5</td>
          </tr>
          <tr>
            <td>1.601 – 2.000 cmc</td>
            <td>29,7</td>
            <td>28,5</td>
            <td>26,7</td>
            <td>25,1</td>
          </tr>
          <tr>
            <td>2.001 – 2.600 cmc</td>
            <td>92,2</td>
            <td>88,6</td>
            <td>82,8</td>
            <td>77,8</td>
          </tr>
          <tr>
            <td>2.601 – 3.000 cmc</td>
            <td>182,9</td>
            <td>172,8</td>
            <td>154,1</td>
            <td>151,2</td>
          </tr>
          <tr>
            <td>peste 3.001 cmc</td>
            <td>319,0</td>
            <td>297,3</td>
            <td>294,4</td>
            <td>290,0</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Valorile sunt orientative (lei per grupă de 200 cmc) și se aplică <em>înainte</em> de cota
        adițională municipală de 0-50%. Pentru vehiculele electrice se aplică impozitul fix de 40 lei/an,
        iar hibridele cu emisii reduse (≤50g CO₂) pot beneficia de o reducere de până la 30%.
      </p>

      <h2>Greșeli frecvente la calcul</h2>
      <ul>
        <li>
          <strong>Rotunjirea greșită a grupelor:</strong> un motor de 1.601 cmc nu intră în 8 grupe, ci
          în 9 (1.601 ÷ 200 = 8,005, rotunjit în sus la 9) — și, în plus, trece în tranșa superioară de
          capacitate, unde tariful pe grupă este mai mare.
        </li>
        <li>
          <strong>Ignorarea normei Euro:</strong> două mașini cu aceeași capacitate, dar norme diferite,
          plătesc impozit diferit. Verifică norma în cartea de identitate a vehiculului.
        </li>
        <li>
          <strong>Omiterea cotei adiționale:</strong> impozitul „de referință” nu este suma finală;
          primăria poate adăuga până la 50% peste el.
        </li>
        <li>
          <strong>Presupunerea că electricele sunt scutite:</strong> din 2026 plătesc 40 lei/an.
        </li>
      </ul>

      <h2>Documente și formalități conexe</h2>
      <p>
        Impozitul auto se declară și se achită la Direcția de Taxe și Impozite Locale din localitatea de
        domiciliu. La cumpărarea sau vânzarea unei mașini ai nevoie de documente actualizate, iar pentru
        anumite formalități (înmatriculare, transcriere, dosare la instituții) îți poate fi solicitat un{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar</Link>, pe care îl poți obține
        online fără deplasare. Dacă vrei să estimezi și alte costuri, poți folosi{' '}
        <Link href="/calculator/calculator-procente/">calculatorul de procente</Link> pentru a verifica
        rapid cota adițională aplicată de primărie.
      </p>

      <p className="text-sm text-neutral-500">
        Valorile sunt orientative și se pot ajusta prin hotărâri locale; suma finală se stabilește de
        primăria de domiciliu. Verifică la Direcția de Taxe și Impozite Locale.
      </p>
    </CalculatorLayout>
  );
}
