import Link from 'next/link';
import { CazierFiscalGuide, GuideLink } from '@/components/cazierfiscal/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalArticleGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/cazier-fiscal-administrator-pfa/';
const PUBLISHED = '2026-11-24';
const UPDATED = '2026-11-24';
const TITLE = 'Cazier fiscal pentru administrator, firmă sau PFA';
const DESCRIPTION =
  'Când îți trebuie cazierul fiscal la înființarea unei firme, a unui PFA, la cesiune sau la numirea unui administrator, când îl verifică singur Registrul Comerțului și cum te afectează o firmă inactivă.';

export const metadata = buildPageMetadata({ brand: 'cazierfiscal', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CAZIERFISCAL_INDEXABLE });

/**
 * Facts checked 11.11.2026 on the consolidated texts (legislatie.just.ro):
 * OG 39/2015 art. 4 alin. 4–7, art. 6 alin. 1 lit. h–j, art. 8 alin. 1–5, art. 9 alin. 2.
 */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['Codul de procedură fiscală, Legea nr. 207/2015, art. 18 și art. 92 (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/170007'],
  ['OPANAF nr. 2048/2023: formularele de cerere și certificat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/277749'],
] as const;

export default async function Page() {
  const p = await getServicePricing('cazier-fiscal');
  const graph = cazierFiscalArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    citations: SOURCES,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Administrator, firmă, PFA', path: PATH }],
  });
  return (
    <CazierFiscalGuide
      path={PATH}
      crumb="Administrator, firmă, PFA"
      title={TITLE}
      lead="Legea cere cazierul fiscal la înființarea unei firme sau a unui PFA, la cesiunea părților sociale și la numirea unui administrator nou. Vestea bună: la Registrul Comerțului, de cele mai multe ori nu trebuie să-l aduci tu."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.basePrice)}
      summary={[
        <>La înființare, cesiune și numire de administrator, Registrul Comerțului primește datele direct de la ANAF, în maximum 2 ore (OG 39/2015, art. 8 alin. 2).</>,
        <>La asociații și fundații nu există verificarea automată: fondatorii aduc ei certificatul (art. 8 alin. 1 lit. b).</>,
        <>Dacă ai o faptă înscrisă, operațiunea nu se autorizează (art. 8 alin. 5).</>,
        <>Inactivitatea fiscală a firmei se trece și în cazierul administratorului (art. 4 alin. 5).</>,
      ]}
      toc={[
        ['cand-e-obligatoriu', 'Când e obligatoriu'],
        ['registrul-comertului', 'La Registrul Comerțului îl verifică ei'],
        ['cand-il-aduci-tu', 'Când îl aduci tu'],
        ['firma-inactiva', 'Firma inactivă și cazierul administratorului'],
        ['cine-il-poate-cere', 'Cine poate cere certificatul pentru firmă'],
      ]}
      readMinutes={4}
      orderLead="Dacă îți cere cineva certificatul pe hârtie sau PDF și nu ai SPV, cererea o depune avocatul nostru, pe baza împuternicirii semnate pe telefon. Certificatul vine pe email. Gratuit îl iei de la ANAF, din SPV sau de la ghișeu."
    >
      <h2 id="cand-e-obligatoriu">Când e obligatoriu</h2>
      <p>Articolul 8 alin. 1 din OG 39/2015 enumeră situațiile:</p>
      <ul>
        <li>la înființarea unei societăți, cooperative sau entități fără personalitate juridică, pentru asociați, acționari și administratori;</li>
        <li>la înscrierea unei asociații sau fundații, pentru fondatori;</li>
        <li>la autorizarea unei activități independente (aici intră PFA-ul);</li>
        <li>la cesiunea părților sociale sau a acțiunilor, pentru noii asociați;</li>
        <li>la numirea unui administrator nou sau la cooptarea de asociați noi la o majorare de capital;</li>
        <li>la numirea de reprezentanți noi într-o asociație sau fundație deja înregistrată;</li>
        <li>în alte cazuri prevăzute de lege.</li>
      </ul>

      <h2 id="registrul-comertului">La Registrul Comerțului îl verifică ei</h2>
      <p>
        Pentru înființarea de firme, PFA, cesiuni și numiri de administratori, obligația se consideră îndeplinită prin
        verificarea electronică: Registrul Comerțului cere datele de la ANAF, iar ANAF răspunde în maximum 2 ore (art. 8
        alin. 2). Registrul trimite la ANAF numele și CNP-ul tău.
      </p>
      <p>
        Asta înseamnă că, dacă îți faci un SRL sau un PFA, nu trebuie să alergi după certificat înainte.
      </p>

      <h2 id="cand-il-aduci-tu">Când îl aduci tu</h2>
      <p>
        Verificarea electronică merge doar pentru ce se înscrie la Registrul Comerțului. La asociații și fundații,
        care se înscriu la judecătorie, în Registrul asociațiilor și fundațiilor, certificatul îl prezintă fondatorii
        și noii reprezentanți (art. 8 alin. 1 lit. b și f).
      </p>
      <p>
        Mai e nevoie de el în „alte cazuri prevăzute de lege” (art. 8 alin. 1 lit. g) și oricând ți-l cere cineva
        pentru un dosar al lui. Fiecare cere certificatul pentru scopul lui, iar certificatul e bun 30 de zile și doar
        pentru acel scop (art. 9 alin. 7). Detaliile despre valabilitate sunt în{' '}
        <GuideLink href="/ghiduri/valabilitate-cazier-fiscal/">cât e valabil cazierul fiscal și ce conține</GuideLink>.
      </p>
      <p>
        Ești persoană străină și nu ai cod fiscal în România? Pentru situațiile de mai sus nu ți se cere certificatul.
        Ajunge o declarație pe propria răspundere, autentificată, din care să reiasă că n-ai fapte de natura celor din
        cazier și că nu ești înregistrat fiscal în România (art. 8 alin. 4).
      </p>

      <h2 id="firma-inactiva">Firma inactivă și cazierul administratorului</h2>
      <p>
        Aici e capcana pentru administratori. Când ANAF declară o firmă inactivă fiscal, inactivitatea se înscrie și în cazierul
        fiscal al reprezentanților legali din perioada respectivă (art. 4 alin. 5–6). Un administrator nou o primește
        și el dacă firma rămâne inactivă mai mult de un semestru calendaristic de la înscrierea numirii lui la Registrul Comerțului (art. 4 alin. 7).
      </p>
      <p>
        Consecința e concretă. Cât timp inactivitatea e în cazierul tău, nu poți fi asociat sau administrator într-o
        firmă nouă: legea interzice autorizarea operațiunii dacă ai informații înscrise (art. 8 alin. 5).
      </p>
      <p>Iese din evidență astfel (art. 6 alin. 1):</p>
      <ul>
        <li>la data reactivării firmei sau la 3 luni după, în funcție de motivul inactivității (lit. h);</li>
        <li>la un an după ce schimbarea administratorului e înregistrată la Registrul Comerțului, dacă tu ai plecat din funcție, sau la un an după ce ți-a expirat mandatul (lit. i);</li>
        <li>la un an de la radierea firmei, dacă inactivitatea a fost înscrisă înainte de radiere (lit. j).</li>
      </ul>
      <p>
        Inactivitatea temporară înscrisă la cererea ta la Registrul Comerțului (suspendarea activității) nu se trece în
        cazierul fiscal (art. 4 alin. 4 lit. c).
      </p>

      <h2 id="cine-il-poate-cere">Cine poate cere certificatul pentru firmă</h2>
      <p>
        Pentru o persoană juridică, cererea o depune reprezentantul legal, cu acte care arată calitatea lui, sau un
        reprezentant cu mandat (art. 9 alin. 2). Pentru tine, ca persoană fizică, o poți depune singur, din{' '}
        <Link href="/ghiduri/cazier-fiscal-din-spv/">SPV</Link> sau de la orice ghișeu ANAF, sau prin împuternicit.
      </p>
      <p>
        Ca împuternicit, un avocat folosește împuternicirea avocațială, nu formularul ANAF (Codul de procedură fiscală,
        art. 18 alin. 3). Așa lucrăm și noi: <Link href="/">cazier fiscal prin avocat</Link>, {lei(p.basePrice)} lei.
      </p>
    </CazierFiscalGuide>
  );
}
