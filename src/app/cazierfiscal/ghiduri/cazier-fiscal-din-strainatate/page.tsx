import Link from 'next/link';
import { CazierFiscalGuide } from '@/components/cazierfiscal/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalArticleGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/cazier-fiscal-din-strainatate/';
const PUBLISHED = '2026-11-10';
const UPDATED = '2026-11-10';
const TITLE = 'Cazier fiscal din străinătate: cum îl obții fără să vii în țară';
const DESCRIPTION =
  'Ești plecat din România și îți trebuie cazierul fiscal? Variantele: SPV, împuternicit sau avocat. Ce faci cu valabilitatea de 30 de zile, traducerea și apostila.';

export const metadata = buildPageMetadata({ brand: 'cazierfiscal', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CAZIERFISCAL_INDEXABLE });

/** Facts checked on 10.11.2026 against OG 39/2015 (art. 8 and 9). */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['ANAF: înregistrarea în Spațiul Privat Virtual', 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori'],
] as const;

export default async function Page() {
  const p = await getServicePricing('cazier-fiscal');
  const traducere = optionPrice(p, 'traducere', 178.5);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const graph = cazierFiscalArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Cazier fiscal din străinătate', path: PATH }],
  });
  return (
    <CazierFiscalGuide
      path={PATH}
      crumb="Cazier fiscal din străinătate"
      title={TITLE}
      lead="Pentru cazierul fiscal nu trebuie să vii în România. Îl poți cere din SPV, dacă ai cont, sau prin cineva împuternicit. Mai jos sunt variantele și capcanele, pe rând."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.basePrice)}
      orderLead="Semnezi împuternicirea pe telefon, de oriunde ai fi. Avocatul depune cererea la ANAF, tu primești certificatul scanat pe email, iar originalul ți-l trimitem prin curier, și în străinătate."
    >
      <h2>Pe scurt</h2>
      <ul>
        <li>Cu cont SPV, ceri cazierul fiscal online, de oriunde, gratuit.</li>
        <li>Fără cont SPV, cererea o poate depune un împuternicit sau un avocat (OG 39/2015, art. 9 alin. 1).</li>
        <li>Certificatul e valabil 30 de zile și doar pentru scopul din cerere, deci contează când îl ceri.</li>
        <li>Pentru o instituție străină, de obicei ai nevoie și de traducere autorizată sau apostilă. Întreabă instituția.</li>
      </ul>

      <h2>Varianta 1: din SPV, dacă ai cont</h2>
      <p>
        Spațiul Privat Virtual al ANAF funcționează și din afara țării. Dacă ai deja cont activ, ceri certificatul din
        Solicitări → Eliberare documente și îl primești în SPV, ca PDF semnat electronic. Pașii sunt în ghidul{' '}
        <Link href="/ghiduri/cazier-fiscal-din-spv/">cazier fiscal din SPV</Link>.
      </p>
      <p>
        Dacă nu ai cont, îl creezi după procedura de pe site-ul ANAF. Verifică dinainte ce îți cere procedura de
        activare, ca să știi dacă o poți face din țara în care ești.
      </p>

      <h2>Varianta 2: prin împuternicit sau avocat</h2>
      <p>
        Legea permite ca cererea de cazier fiscal să fie depusă de un împuternicit sau de un avocat. Împuternicitul
        merge la ghișeul ANAF cu împuternicirea ta și cu actul lui de identitate.
      </p>
      <p>
        La noi, împuternicitul e avocatul: semnezi pe telefon împuternicirea avocațială, el depune cererea, iar
        certificatul ți-l trimitem scanat pe email și, dacă vrei, originalul prin curier. Costă {lei(p.basePrice)} lei
        și durează 1–3 zile lucrătoare. Detalii pe <Link href="/">pagina de comandă a cazierului fiscal online</Link>.
      </p>

      <h2>Atenție la cele 30 de zile</h2>
      <p>
        Certificatul de cazier fiscal e valabil 30 de zile de la emitere (OG 39/2015, art. 9 alin. 7). Dacă trimiți
        originalul prin poștă sau curier peste graniță, o parte din termen se duce pe drum. Cere-l când știi data la
        care depui dosarul, nu cu săptămâni înainte.
      </p>

      <h2>Traducere și apostilă</h2>
      <p>
        O instituție din străinătate poate cere certificatul tradus de un traducător autorizat sau apostilat. Apostila
        de la Haga se folosește pentru statele care au aderat la Convenția de la Haga. Ce anume îți trebuie îți spune
        instituția care cere documentul; întreab-o înainte.
      </p>
      <p>
        Le poți adăuga direct în comanda noastră: traducere autorizată, {lei(traducere)} lei, și apostila de la Haga,
        {' '}{lei(apostila)} lei. Totalul îl vezi înainte de plată.
      </p>

      <h2>Ești cetățean străin?</h2>
      <p>
        Dacă nu ești înregistrat fiscal în România, legea nu îți cere certificatul de cazier fiscal: ajunge o
        declarație autentică pe propria răspundere (OG 39/2015, art. 8 alin. 4). Întreabă instituția care ți-l cere
        înainte să comanzi.
      </p>
    </CazierFiscalGuide>
  );
}
