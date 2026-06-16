import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'amenda-rovinieta-2025-tarife-plata-online-ghid-complet';
const TITLE = 'Amendă Rovinietă 2025: Tarife, Plată Online și Contestație';
const DESCRIPTION =
  'Ghid complet despre amenda pentru rovinietă în 2025: cuantumul amenzii pe categorii de vehicule, ' +
  'reducerea de 50% în 15 zile, modalitățile de plată online și termenele de contestație.';
const DATE_PUBLISHED = '2025-01-01';
const DATE_MODIFIED = '2026-06-16';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE}`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Auto"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2025"
      updatedLabel="16 iunie 2026"
      relatedServices={[
        {
          href: '/tools/verificare-rovinieta-online/',
          label: 'Verificare Rovinietă Online',
          desc: 'Verifică valabilitatea rovinietei pe numărul de înmatriculare.',
        },
      ]}
      faqs={[
        {
          q: 'Cât este amenda pentru lipsa rovinietei în 2025?',
          a: 'Pentru autoturisme (categoria A), amenda este cuprinsă între 500 și 1.000 lei. Pentru celelalte categorii de vehicule cuantumul crește în funcție de masa totală maximă autorizată și numărul de locuri, ajungând până la 14.250–28.500 lei pentru vehiculele de minimum 12 tone cu cel puțin 4 axe.',
        },
        {
          q: 'Pot plăti jumătate din amenda de rovinietă?',
          a: 'Da. Dacă achiți amenda în termen de 15 zile de la primirea procesului-verbal, beneficiezi de reducerea de 50%, plătind doar jumătate din minimul amenzii. Pentru autoturisme aceasta înseamnă 250 lei în loc de 500 lei.',
        },
        {
          q: 'Unde pot plăti amenda de rovinietă?',
          a: 'Amenda se poate achita online (card, PayPal sau transfer bancar, disponibil 24/7), la bănci și oficii poștale (numerar sau card, în timpul programului), precum și la trezoreria locală (luni–vineri, 8:00–16:00, fără comision).',
        },
        {
          q: 'Care este termenul de contestație pentru amenda de rovinietă?',
          a: 'Procesul-verbal poate fi contestat în termen de 15 zile de la primire. După acest termen amenda rămâne definitivă, iar după 30 de zile fără plată pot începe procedurile de executare silită.',
        },
        {
          q: 'Cât costă rovinieta în 2025?',
          a: 'Pentru autoturisme, rovinieta costă 3,5€ (aprox. 18 lei) pentru o zi, 6€ (aprox. 30 lei) pentru 10 zile și 50€ (aprox. 250 lei) pentru 12 luni.',
        },
      ]}
    >
      <p>
        Circulația fără rovinietă valabilă pe drumurile naționale din România se sancționează cu amendă.
        În acest ghid găsești <strong>cuantumul amenzii pe categorii de vehicule în 2025</strong>, cum
        beneficiezi de reducerea de 50%, ce modalități de plată ai la dispoziție și care sunt termenele de
        contestație.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Pentru autoturismele fără rovinietă valabilă în 2025, amenzile sunt cuprinse între{' '}
        <strong>500 și 1.000 lei</strong>. Achitarea în termen de 15 zile dă dreptul la o{' '}
        <strong>reducere de 50%</strong>. Plata online este disponibilă 24/7, iar fereastra de contestație
        este de 15 zile.
      </p>

      <h2>Cuantumul amenzii pe categorii de vehicule</h2>
      <p>
        Valoarea amenzii depinde de categoria vehiculului, stabilită în funcție de masa totală maximă
        autorizată și numărul de locuri. Tabelul de mai jos prezintă minimul și maximul amenzii, precum și
        sumele corespunzătoare reducerii de 50%.
      </p>
      <table>
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Tip vehicul</th>
            <th>Amendă minimă</th>
            <th>Amendă maximă</th>
            <th>Redus 50% (min)</th>
            <th>Redus 50% (max)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>Autoturisme</td>
            <td>500 lei</td>
            <td>1.000 lei</td>
            <td>250 lei</td>
            <td>500 lei</td>
          </tr>
          <tr>
            <td>B</td>
            <td>Vehicule ≤3,5t</td>
            <td>1.140 lei</td>
            <td>2.280 lei</td>
            <td>570 lei</td>
            <td>1.140 lei</td>
          </tr>
          <tr>
            <td>C</td>
            <td>Vehicule 3,5–7,5t</td>
            <td>3.800 lei</td>
            <td>7.600 lei</td>
            <td>1.900 lei</td>
            <td>3.800 lei</td>
          </tr>
          <tr>
            <td>D</td>
            <td>Vehicule 7,5–12t</td>
            <td>6.650 lei</td>
            <td>13.300 lei</td>
            <td>3.325 lei</td>
            <td>6.650 lei</td>
          </tr>
          <tr>
            <td>E</td>
            <td>Vehicule ≥12t (max. 3 axe)</td>
            <td>8.550 lei</td>
            <td>17.100 lei</td>
            <td>4.275 lei</td>
            <td>8.550 lei</td>
          </tr>
          <tr>
            <td>F</td>
            <td>Vehicule ≥12t (min. 4 axe)</td>
            <td>14.250 lei</td>
            <td>28.500 lei</td>
            <td>7.125 lei</td>
            <td>14.250 lei</td>
          </tr>
          <tr>
            <td>G</td>
            <td>Microbuze (9–23 locuri)</td>
            <td>3.800 lei</td>
            <td>7.600 lei</td>
            <td>1.900 lei</td>
            <td>3.800 lei</td>
          </tr>
          <tr>
            <td>H</td>
            <td>Autobuze (peste 23 locuri)</td>
            <td>6.650 lei</td>
            <td>13.300 lei</td>
            <td>3.325 lei</td>
            <td>6.650 lei</td>
          </tr>
        </tbody>
      </table>

      <h2>Modalități de plată a amenzii</h2>
      <ul>
        <li>
          <strong>Online (eghiseul.ro):</strong> card, PayPal sau transfer bancar — procesare instantanee,
          disponibil 24/7.
        </li>
        <li>
          <strong>Bănci și oficii poștale:</strong> plată cu numerar sau card, în timpul programului de
          lucru.
        </li>
        <li>
          <strong>Trezoreria locală:</strong> luni–vineri, 8:00–16:00, fără comision.
        </li>
      </ul>

      <h2>Termene importante</h2>
      <ul>
        <li>
          <strong>Zilele 0–15:</strong> se aplică reducerea de 50%.
        </li>
        <li>
          <strong>Zilele 16–30:</strong> se achită suma integrală.
        </li>
        <li>
          <strong>După 30 de zile:</strong> încep procedurile de executare silită.
        </li>
        <li>
          <strong>15 zile:</strong> fereastra de contestație, calculată de la primirea procesului-verbal.
        </li>
      </ul>

      <h2>Prețul rovinietei în 2025</h2>
      <p>
        Cea mai sigură metodă de a evita amenda este să ai rovinieta valabilă. Tabelul de mai jos prezintă
        prețurile pentru autoturisme în 2025.
      </p>
      <table>
        <thead>
          <tr>
            <th>Durată</th>
            <th>Preț</th>
            <th>Recomandat pentru</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1 zi</td>
            <td>3,5€ (~18 lei)</td>
            <td>Călătorii ocazionale</td>
          </tr>
          <tr>
            <td>10 zile</td>
            <td>6€ (~30 lei)</td>
            <td>Vacanțe scurte</td>
          </tr>
          <tr>
            <td>12 luni</td>
            <td>50€ (~250 lei)</td>
            <td>Utilizare frecventă</td>
          </tr>
        </tbody>
      </table>

      <h2>Verifică-ți rovinieta înainte de a pleca la drum</h2>
      <p>
        Înainte de orice deplasare pe drumurile naționale, asigură-te că rovinieta este valabilă. Poți
        verifica gratuit valabilitatea după numărul de înmatriculare folosind instrumentul de{' '}
        <Link href="/tools/verificare-rovinieta-online/">Verificare Rovinietă Online</Link>. Astfel eviți
        amenda și plata sumelor mult mai mari prezentate mai sus.
      </p>
    </ArticleLayout>
  );
}
