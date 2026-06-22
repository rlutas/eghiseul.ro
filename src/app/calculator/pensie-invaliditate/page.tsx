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
        {
          q: 'Se poate cumula pensia de invaliditate cu un salariu?',
          a: 'La gradul III, persoana își păstrează cel puțin jumătate din capacitatea de muncă și poate lucra cu program redus, cumulând pensia cu venituri din muncă. La gradele I și II, capacitatea de muncă este pierdută total, deci cumulul cu un salariu nu este permis. Pensia de invaliditate se revizuiește periodic de medicul expert, iar gradul se poate modifica în timp.',
        },
        {
          q: 'Ce se întâmplă cu pensia de invaliditate la vârsta de pensionare?',
          a: 'La împlinirea vârstei standard de pensionare, pensia de invaliditate se transformă din oficiu în pensie pentru limită de vârstă, fiind recalculată dacă varianta pentru limită de vârstă este mai avantajoasă. Stagiul potențial creditat în perioada de invaliditate rămâne valorificat în noua pensie.',
        },
        {
          q: 'Cum afectează gradul de invaliditate cuantumul pensiei?',
          a: 'Gradul influențează direct creditarea stagiului potențial: 0,25 puncte/lună la gradul I, 0,20 la gradul II și 0,10 la gradul III. Cu cât gradul este mai sever, cu atât perioada potențială (până la 35 de ani) aduce mai multe puncte, deci o pensie mai mare. Doar la gradul I se adaugă și indemnizația de însoțitor de 2.163 lei.',
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

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem o persoană încadrată în <strong>gradul II</strong> de invaliditate la 40 de ani, care a acumulat
        deja <strong>15 puncte realizate</strong> din contribuțiile de până atunci. Pentru a ajunge la stagiul complet
        de 35 de ani i-ar mai fi rămas de cotizat 20 de ani, adică 240 de luni — aceasta este perioada de stagiu
        potențial.
      </p>
      <ul>
        <li><strong>Pasul 1 — stagiul potențial în puncte:</strong> 240 de luni × 0,20 puncte/lună = 48 de puncte.</li>
        <li><strong>Pasul 2 — total puncte:</strong> 15 puncte realizate + 48 de puncte din stagiul potențial = 63 de puncte.</li>
        <li><strong>Pasul 3 — cuantumul pensiei:</strong> 63 de puncte × 81 lei (VPR) = 5.103 lei pe lună.</li>
      </ul>
      <p>
        Dacă aceeași persoană ar fi fost încadrată în <strong>gradul I</strong>, stagiul potențial s-ar fi creditat cu
        0,25 puncte/lună (240 × 0,25 = 60 de puncte), iar la pensia rezultată s-ar fi adăugat și indemnizația de
        însoțitor de <strong>2.163 lei</strong>. La gradul III, creditarea ar fi fost de doar 0,10 puncte/lună
        (240 × 0,10 = 24 de puncte), reflectând faptul că persoana își păstrează o parte din capacitatea de muncă.
      </p>

      <h2>Comparație între grade (același caz)</h2>
      <p>
        Tabelul de mai jos arată cum se schimbă cuantumul pentru persoana din exemplu (15 puncte realizate, 240 de luni
        de stagiu potențial), în funcție de gradul de invaliditate, la VPR de 81 lei:
      </p>
      <table>
        <thead>
          <tr>
            <th>Grad</th>
            <th>Credit/lună</th>
            <th>Puncte potențiale</th>
            <th>Total puncte</th>
            <th>Pensie (× 81 lei)</th>
            <th>Indemnizație însoțitor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gradul I</td>
            <td>0,25</td>
            <td>60</td>
            <td>75</td>
            <td>6.075 lei</td>
            <td>+ 2.163 lei</td>
          </tr>
          <tr>
            <td>Gradul II</td>
            <td>0,20</td>
            <td>48</td>
            <td>63</td>
            <td>5.103 lei</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Gradul III</td>
            <td>0,10</td>
            <td>24</td>
            <td>39</td>
            <td>3.159 lei</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente la estimare</h2>
      <ul>
        <li>
          <strong>Ignorarea stagiului potențial:</strong> mulți calculează doar punctele realizate și subestimează
          masiv pensia. Stagiul potențial (perioada până la 35 de ani) este adesea componenta dominantă pentru
          persoanele tinere.
        </li>
        <li>
          <strong>Aplicarea indemnizației de însoțitor la toate gradele:</strong> cei 2.163 lei se adaugă exclusiv la
          gradul I, nu la gradele II sau III.
        </li>
        <li>
          <strong>Confundarea VPR cu valoarea punctului de pensie:</strong> formula folosește valoarea punctului de
          referință (81 lei în 2026), nu alți indicatori din presă.
        </li>
        <li>
          <strong>Plafonarea greșită a stagiului potențial:</strong> creditarea se oprește la împlinirea celor 35 de
          ani de stagiu complet — lunile peste acest prag nu se mai numără.
        </li>
      </ul>

      <h2>Cazuri speciale și revizuirea gradului</h2>
      <p>
        Încadrarea în grad nu este, de regulă, definitivă: medicul expert al asigurărilor sociale stabilește un termen
        de revizuire periodică, la care gradul poate fi confirmat, modificat sau ridicat. O trecere de la gradul II la
        gradul I aduce atât o creditare mai mare a stagiului potențial (0,25 în loc de 0,20 puncte/lună), cât și
        indemnizația de însoțitor de 2.163 lei. Invers, ameliorarea stării de sănătate poate duce la încadrarea într-un
        grad inferior și la recalcularea pensiei.
      </p>
      <p>
        Pentru persoanele care devin invalide foarte tinere, stagiul potențial poate acoperi aproape întreaga carieră
        rămasă până la cei 35 de ani, motiv pentru care formula este concepută să nu le dezavantajeze. La gradul III,
        unde se păstrează cel puțin jumătate din capacitatea de muncă, pensia se poate cumula cu venituri din muncă cu
        program redus, spre deosebire de gradele I și II.
      </p>

      <p>
        Vezi și <Link href="/calculator/estimare-pensie/">calculatorul de estimare pensie</Link>,{' '}
        <Link href="/calculator/varsta-pensionare/">calculatorul de vârstă de pensionare</Link> și{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net</Link> pentru a estima contribuțiile care îți
        construiesc punctele de pensie.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă (Legea 360/2023). Încadrarea în grad se face de medicul expert, iar cuantumul exact se
        stabilește de CNPP pe baza istoricului real de venituri.
      </p>
    </CalculatorLayout>
  );
}
