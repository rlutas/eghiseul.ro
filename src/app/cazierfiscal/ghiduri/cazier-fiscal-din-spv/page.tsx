import Link from 'next/link';
import { CazierFiscalGuide } from '@/components/cazierfiscal/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalArticleGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/cazier-fiscal-din-spv/';
const PUBLISHED = '2026-11-10';
const UPDATED = '2026-11-10';
const TITLE = 'Cazier fiscal din SPV: cum îl ceri online, gratuit';
const DESCRIPTION =
  'Cum ceri certificatul de cazier fiscal din Spațiul Privat Virtual (SPV) al ANAF: ce îți trebuie, unde e meniul, ce primești și cât e valabil. Plus ce faci dacă nu ai cont SPV.';

export const metadata = buildPageMetadata({ brand: 'cazierfiscal', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CAZIERFISCAL_INDEXABLE });

/** Facts checked on 10.11.2026 against OG 39/2015 (art. 9) and the ANAF SPV page. */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['OPANAF nr. 2594/2015: procedura și formularul de cerere (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/171984'],
  ['ANAF: înregistrarea în Spațiul Privat Virtual', 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori'],
] as const;

export default async function Page() {
  const p = await getServicePricing('cazier-fiscal');
  const graph = cazierFiscalArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Cazier fiscal din SPV', path: PATH }],
  });
  return (
    <CazierFiscalGuide
      path={PATH}
      crumb="Cazier fiscal din SPV"
      title={TITLE}
      lead="Dacă ai cont în Spațiul Privat Virtual (SPV) al ANAF, cazierul fiscal îl ceri singur, de acasă, și nu plătești nimic. Îți arătăm drumul, ce primești la final și ce faci dacă nu ai cont."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.basePrice)}
      orderLead="Fără cont SPV, cazierul fiscal se cere la ghișeul ANAF sau printr-un împuternicit. La noi, cererea o depune avocatul, pe baza împuternicirii pe care o semnezi pe telefon, iar certificatul îl primești pe email."
    >
      <h2>Pe scurt</h2>
      <ul>
        <li>Cazierul fiscal se cere din SPV, din meniul <strong>Solicitări → Eliberare documente</strong>.</li>
        <li>Certificatul vine tot în SPV, ca PDF semnat electronic de Ministerul Finanțelor.</li>
        <li>Este gratuit (OG 39/2015, art. 9 alin. 5).</li>
        <li>Este valabil 30 de zile de la emitere și doar pentru scopul trecut în cerere (art. 9 alin. 7).</li>
      </ul>

      <h2>Ce îți trebuie înainte</h2>
      <p>
        Un cont activ în Spațiul Privat Virtual, ca persoană fizică. Dacă nu ai unul, întâi îl creezi și îl activezi
        după procedura de pe{' '}
        <a href="https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori" target="_blank" rel="nofollow noopener">pagina de înregistrare a ANAF</a>.
        Cererea de cazier fiscal nu poate fi făcută din SPV fără cont.
      </p>
      <p>
        Mai ai nevoie să știi <strong>scopul</strong> pentru care îți trebuie certificatul: angajare, licitație, credit
        sau alt dosar. Scopul apare pe certificat, iar certificatul e bun doar pentru el.
      </p>

      <h2>Pașii în SPV</h2>
      <ol>
        <li>Intri în contul tău din Spațiul Privat Virtual.</li>
        <li>Deschizi meniul <strong>Solicitări</strong>, apoi <strong>Eliberare documente</strong>.</li>
        <li>Alegi certificatul de cazier fiscal și completezi scopul.</li>
        <li>Trimiți cererea. Răspunsul vine în SPV, în secțiunea de mesaje, ca document PDF.</li>
      </ol>
      <p>
        ANAF nu publică un termen fix pentru răspunsul din SPV, așa că nu îți dăm noi unul. Dacă dosarul tău are o
        dată limită, ține cont că certificatul expiră după 30 de zile și nu îl cere prea devreme.
      </p>

      <h2>Ce primești</h2>
      <p>
        Un certificat în format electronic, cu semnătura electronică a Ministerului Finanțelor. Certificatul spune dacă
        ai sau nu fapte înscrise în cazierul fiscal: fapte sancționate contravențional sau penal prevăzute de lege și
        situații precum inactivitatea fiscală. Datoriile la buget nu apar aici; ele sunt în certificatul de atestare
        fiscală, care e alt document.
      </p>

      <h2>Dacă nu ai cont SPV</h2>
      <p>Ai două variante:</p>
      <ul>
        <li>
          <strong>Ghișeul ANAF.</strong> Mergi cu actul de identitate la orice unitate ANAF, indiferent de domiciliu.
          Certificatul se eliberează pe loc și e tot gratuit.
        </li>
        <li>
          <strong>Printr-un împuternicit sau avocat.</strong> Legea permite ca cererea să fie depusă de un împuternicit
          sau de un avocat (OG 39/2015, art. 9 alin. 1). Asta facem noi: <Link href="/">cazier fiscal online prin avocat</Link>,
          {' '}{lei(p.basePrice)} lei, în 1–3 zile lucrătoare.
        </li>
      </ul>
      <p>
        Ești în altă țară? Citește și <Link href="/ghiduri/cazier-fiscal-din-strainatate/">cum obții cazierul fiscal din străinătate</Link>.
      </p>
    </CazierFiscalGuide>
  );
}
