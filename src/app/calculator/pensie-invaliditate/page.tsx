import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PensieInvaliditateCalculator } from '@/components/calculators/pensie-invaliditate-calculator';

const SLUG = 'pensie-invaliditate';
const TITLE = 'Calculator Pensie de Invaliditate 2026';
const DESCRIPTION =
  'Estimează pensia de invaliditate în 2026 pe grade (I, II, III): puncte realizate + stagiu potențial × VPR 81 lei, plus indemnizația de însoțitor pentru gradul I.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Pensie Invaliditate')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Pensie de Invaliditate"
      description="Estimează cuantumul pensiei de invaliditate pe grade (I, II, III), pe baza stagiului realizat și a salariului, conform Legii 360/2023."
      widget={<PensieInvaliditateCalculator />}
      faqs={[
        {
          q: 'Care sunt gradele de invaliditate?',
          a: 'Gradul I — pierderea totală a capacității de muncă și nevoia de îngrijire permanentă (însoțitor). Gradul II — pierderea totală a capacității de muncă, fără nevoie de îngrijire. Gradul III — pierderea a cel puțin jumătate din capacitatea de muncă, persoana putând încă lucra cu program redus.',
        },
        {
          q: 'Cum se calculează pensia de invaliditate?',
          a: 'La punctele realizate din stagiul de cotizare se adaugă punctele din stagiul potențial (perioada până la 35 de ani de stagiu), creditat cu 0,25 puncte/lună la gradul I, 0,20 la gradul II și 0,10 la gradul III. Totalul se înmulțește cu valoarea punctului de referință (81 lei în 2026).',
        },
        {
          q: 'Ce este indemnizația de însoțitor?',
          a: 'Pentru gradul I de invaliditate se adaugă o indemnizație de însoțitor egală cu 50% din salariul minim brut — 2.163 lei de la 1 iulie 2026 (2.025 lei înainte). Se acordă doar la gradul I.',
        },
        {
          q: 'Ce este stagiul potențial?',
          a: 'Este perioada cuprinsă între momentul încadrării în invaliditate și împlinirea stagiului complet de cotizare (35 de ani), care se ia în calcul ca și cum ai fi contribuit, pentru a nu dezavantaja persoanele care devin invalide tinere.',
        },
      ]}
    >
      <h2>Cum se calculează pensia de invaliditate</h2>
      <p>
        Pensia de invaliditate se calculează ca <strong>(puncte realizate + puncte din stagiul potențial) × valoarea
        punctului de referință</strong> (81 lei în 2026). Stagiul potențial reprezintă perioada până la împlinirea
        stagiului complet de 35 de ani și este creditat în funcție de grad.
      </p>

      <h2>Creditarea stagiului potențial pe grade</h2>
      <ul>
        <li><strong>Gradul I:</strong> 0,25 puncte/lună (+ indemnizație de însoțitor);</li>
        <li><strong>Gradul II:</strong> 0,20 puncte/lună;</li>
        <li><strong>Gradul III:</strong> 0,10 puncte/lună.</li>
      </ul>

      <h2>Indemnizația de însoțitor (gradul I)</h2>
      <p>
        La gradul I se adaugă o indemnizație de însoțitor egală cu 50% din salariul minim — 2.163 lei de la 1 iulie 2026.
        Este neimpozabilă și se plătește împreună cu pensia.
      </p>

      <p>
        Vezi și <Link href="/calculator/estimare-pensie/">calculatorul de estimare pensie</Link> și{' '}
        <Link href="/calculator/varsta-pensionare/">calculatorul de vârstă de pensionare</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă (Legea 360/2023). Încadrarea în grad se face de medicul expert, iar cuantumul exact se
        stabilește de CNPP pe baza istoricului real de venituri.
      </p>
    </CalculatorLayout>
  );
}
