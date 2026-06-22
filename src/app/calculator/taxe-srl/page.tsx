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

      <p>
        Vezi și <Link href="/calculator/dividende/">calculatorul de dividende</Link> sau{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link>. Pentru o firmă ai nevoie de un{' '}
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
