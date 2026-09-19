import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TaxeSrlCalculator } from '@/components/calculators/taxe-srl-calculator';

const SLUG = 'taxe-srl';
const TITLE = 'Calculator Taxe SRL 2026 — Micro 1%, Profit, Dividende';
const DESCRIPTION =
  'Calculează taxele unui SRL în 2026: impozit micro 1% sau profit 16%, plus impozit pe dividende 16% și CASS, și află câți bani rămân efectiv în mână.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Taxe SRL')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Taxe SRL 2026"
      description="Estimează taxarea totală a unui SRL în 2026 — impozit micro 1% sau pe profit 16%, plus impozit pe dividende și CASS — și câți bani rămân efectiv în mână."
      tldr="În 2026 un SRL plătește impozit micro 1% pe venituri (sub 100.000 EUR, cu cel puțin un salariat) sau 16% pe profit, iar dividendele distribuite se impozitează cu 16% plus CASS pe plafoane. Exemplu: la 300.000 lei venituri și 100.000 lei cheltuieli rămân ~155.760 lei în mână."
      widget={<TaxeSrlCalculator />}
      faqs={[
        {
          q: 'Ce impozit plătește o microîntreprindere în 2026?',
          a: 'Microîntreprinderile plătesc 1% pe venituri (cota de 3% a fost eliminată din 2026, OUG 89/2025). Plafonul pentru a rămâne microîntreprindere a scăzut la 100.000 EUR, iar firma trebuie să aibă cel puțin un salariat (sau un contract de mandat plătit cel puțin cu salariul minim).',
        },
        {
          q: 'Când e mai bine impozit pe profit decât micro?',
          a: 'Microîntreprinderea taxează toate veniturile cu 1%, indiferent de profit. Dacă ai cheltuieli mari (peste circa 80% din venituri), impozitul pe profit de 16% aplicat doar pe profit poate fi mai avantajos. Calculatorul îți semnalează acest lucru.',
        },
        {
          q: 'Cât plătesc dacă scot profitul ca dividende?',
          a: 'Pe lângă impozitul firmei, dividendele se impozitează cu 16% (2026) și pot atrage CASS pe plafoane. De exemplu, la 300.000 lei venituri și 100.000 lei cheltuieli, în regim micro: 3.000 lei impozit firmă + 31.520 lei impozit dividende + 9.720 lei CASS, rămân ~155.760 lei în mână.',
        },
        {
          q: 'Care este plafonul de TVA în 2026?',
          a: 'Plafonul de înregistrare în scopuri de TVA a crescut la 395.000 lei în 2026 (de la 300.000 lei). Sub acest prag, firma poate fi neplătitoare de TVA.',
        },
        {
          q: 'O firmă fără salariat mai poate fi microîntreprindere?',
          a: 'Nu. Din 2026, condiția de a avea cel puțin un salariat (sau un contract de mandat plătit cel puțin la nivelul salariului minim) este obligatorie pentru a aplica regimul micro de 1%. O firmă fără salariat trece automat la impozit pe profit de 16% pe profitul realizat.',
        },
        {
          q: 'Pot lăsa profitul în firmă ca să nu plătesc impozit pe dividende?',
          a: 'Da. Impozitul pe dividende de 16% și CASS se aplică doar când distribui efectiv profitul către asociați. Dacă reinvestești profitul în firmă (echipamente, stocuri, dezvoltare), plătești doar impozitul firmei (micro 1% sau profit 16%), iar dividendele rămân netaxate până la distribuire.',
        },
        {
          q: 'Cum se schimbă calculul dacă firma depășește 100.000 EUR?',
          a: 'Dacă veniturile depășesc plafonul de 100.000 EUR în cursul anului, firma iese din regimul micro și trece la impozit pe profit de 16%, aplicat începând cu trimestrul în care s-a depășit plafonul. Profitul distribuit ca dividende rămâne impozitat cu 16% plus CASS pe plafoane.',
        },
      ]}
    >
      <h2>Cum se calculează taxele unui SRL</h2>
      <p>
        Taxarea unui SRL are două etaje: <strong>impozitul firmei</strong> (micro 1% pe venituri sau 16% pe profit) și,
        dacă scoți banii ca dividende, <strong>impozitul pe dividende</strong> (16% în 2026) plus eventual{' '}
        <strong>CASS</strong> pe plafoane.
      </p>

      <h2>Micro 1% sau profit 16%?</h2>
      <p>
        Microîntreprinderea plătește 1% pe toate veniturile, indiferent de marjă — avantajoasă când cheltuielile sunt
        mici. Impozitul pe profit (16% pe profit) devine mai bun când cheltuielile depășesc circa 80% din venituri.
        Pentru a rămâne micro în 2026: venituri sub 100.000 EUR și cel puțin un salariat.
      </p>

      <h2>Exemplu: SRL cu 300.000 lei venituri</h2>
      <p>
        Venituri 300.000 lei, cheltuieli 100.000 lei, regim micro, profitul distribuit ca dividende: impozit micro 3.000
        lei → profit distribuibil 197.000 lei → impozit dividende 16% = 31.520 lei + CASS 9.720 lei →{' '}
        <strong>~155.760 lei în mână</strong>, total taxe ~44.240 lei (≈14,7% din venituri).
      </p>

      <h2>Micro vs. profit: pragul cheltuielilor</h2>
      <p>
        Decizia între micro 1% și profit 16% depinde de cât de mari sunt cheltuielile firmei față de venituri. Cu cât
        marja de profit e mai mică, cu atât impozitul pe profit devine mai avantajos, pentru că se aplică doar pe ce
        rămâne după cheltuieli. Tabelul de mai jos arată cum se schimbă impozitul firmei la 300.000 lei venituri, în
        funcție de nivelul cheltuielilor:
      </p>
      <table>
        <thead>
          <tr>
            <th>Cheltuieli (% din venituri)</th>
            <th>Profit</th>
            <th>Micro 1%</th>
            <th>Profit 16%</th>
            <th>Regim mai bun</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>50% (150.000 lei)</td>
            <td>150.000 lei</td>
            <td>3.000 lei</td>
            <td>24.000 lei</td>
            <td>Micro</td>
          </tr>
          <tr>
            <td>80% (240.000 lei)</td>
            <td>60.000 lei</td>
            <td>3.000 lei</td>
            <td>9.600 lei</td>
            <td>Micro</td>
          </tr>
          <tr>
            <td>90% (270.000 lei)</td>
            <td>30.000 lei</td>
            <td>3.000 lei</td>
            <td>4.800 lei</td>
            <td>Micro</td>
          </tr>
          <tr>
            <td>95% (285.000 lei)</td>
            <td>15.000 lei</td>
            <td>3.000 lei</td>
            <td>2.400 lei</td>
            <td>Profit</td>
          </tr>
        </tbody>
      </table>
      <p>
        Pe acest exemplu, impozitul pe profit de 16% îl bate pe micro doar când cheltuielile depășesc circa 80% din
        venituri, adică marja de profit scade sub 20%. Sub acest prag, micro 1% rămâne mai ieftin la nivelul firmei.
      </p>

      <h2>Greșeli frecvente la estimarea taxelor SRL</h2>
      <ul>
        <li>
          <strong>Confuzia între impozitul firmei și banii în mână.</strong> Impozitul micro de 1% nu e taxa finală — ca
          să folosești banii personal, mai plătești 16% impozit pe dividende plus CASS pe plafoane.
        </li>
        <li>
          <strong>Ignorarea condiției de salariat.</strong> Fără cel puțin un salariat (sau contract de mandat plătit la
          salariul minim), firma pierde regimul micro și trece la impozit pe profit de 16%.
        </li>
        <li>
          <strong>Uitarea plafonului de 100.000 EUR.</strong> La depășire, firma iese din micro în cursul anului și
          recalculează impozitul pe profit.
        </li>
        <li>
          <strong>Omiterea TVA.</strong> Peste plafonul de 395.000 lei (2026) firma devine plătitoare de TVA, ceea ce
          schimbă complet structura de prețuri și cash-flow.
        </li>
      </ul>

      <h2>Cazuri speciale</h2>
      <p>
        Dacă firma are cheltuieli foarte mari (marjă sub 20%), merită analizat trecerea la impozit pe profit de 16%
        chiar dacă veniturile sunt sub plafon. Invers, o firmă cu cheltuieli mici și venituri sub 100.000 EUR câștigă cel
        mai mult din micro 1%. Atunci când profitul nu e distribuit, ci reinvestit, impozitul pe dividende de 16% și CASS
        nu se aplică — se plătește doar impozitul firmei, ceea ce reduce semnificativ taxarea efectivă față de scenariul
        cu dividende.
      </p>

      <p>
        Vezi și <Link href="/calculator/dividende/">calculatorul de dividende</Link>,{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link> sau{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net</Link> pentru a compara taxarea
        administratorului. Pentru o firmă ai nevoie de un{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator ONRC</Link>, pe care îl obții online
        de la eGhișeul.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Nu include salariul sau contractul de mandat al administratorului și nici TVA. Pentru
        situația ta exactă, consultă un contabil.
      </p>
    </CalculatorLayout>
  );
}
