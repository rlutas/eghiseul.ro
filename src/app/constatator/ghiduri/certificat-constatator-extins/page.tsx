import Link from 'next/link';
import { ConstatatorGuide, GuideLink } from '@/components/constatator/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorArticleGraph } from '@/lib/seo/constatator-schema';
import { getConstatatorPrices } from '@/lib/constatator/pricing';
import { lei } from '@/lib/documentero/services';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/certificat-constatator-extins/';
const PUBLISHED = '2026-12-02';
const UPDATED = '2026-12-02';
const TITLE = 'Certificat constatator extins: ce e de fapt și ce să ceri';
const DESCRIPTION =
  'ONRC nu are un certificat constatator „extins” sau „detaliat”: are un singur certificat, cu o listă fixă de date, și alte documente separate. Ce conține fiecare și cât costă.';

export const metadata = buildPageMetadata({ brand: 'constatator', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CONSTATATOR_INDEXABLE });

/**
 * Facts checked 11.11.2026: ONRC "Certificate constatatoare" (contents list,
 * 30 lei, CAS certificate section II and its channels); ONRC "Informații RC"
 * (raport istoric 250 lei; grouped information 9 lei/firmă with volume
 * reductions; certified copies 10 lei + 1,5 lei/page; copies 1,5 lei/page);
 * form 11-10-188 pct. 4.1–4.5; Ordin MJ 380/C/2024 annex pct. 1–2. What other
 * sellers put under "extins" is not stated, on purpose.
 */
const SOURCES = [
  ['ONRC: Certificate constatatoare (conținut, tarif, certificatul pentru CAS)', 'https://onrc.ro/index.php/ro/informatii/certificate-constatatoare'],
  ['ONRC: Informații din registrul comerțului (raport istoric, informații grupate, copii)', 'https://onrc.ro/index.php/ro/informatii/informatii-rc'],
  ['ONRC: formularul 11-10-188, cerere de eliberare acte și informații (PDF)', 'https://www.onrc.ro/templates/site/formulare/11-10-188.pdf'],
  ['Ordinul ministrului justiției nr. 380/C/2024: tarifele ONRC', 'https://www.onrc.ro/documente/legislatie/Ordin%20nr.%20380.doc'],
] as const;

export default async function Page() {
  const p = await getConstatatorPrices();
  const graph = constatatorArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    citations: SOURCES,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Certificat extins', path: PATH }],
  });
  return (
    <ConstatatorGuide
      path={PATH}
      crumb="Certificat extins"
      title={TITLE}
      lead="Pe formularul ONRC nu găsești „extins”, „detaliat” sau „de bază”. Găsești un singur certificat constatator, la care bifezi scopul, și câteva documente separate, fiecare cu taxa lui. Ca să ceri ce trebuie, întâi vezi ce conține fiecare."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.firma)}
      summary={[
        <>„Extins” și „detaliat” nu sunt tipuri oficiale. Ordinul de tarife ONRC are un singur certificat constatator, de 30 de lei.</>,
        <>Certificatul are o listă de date stabilită de ONRC: identificarea firmei, starea, activitățile, capitalul, asociații, administratorii, 5 indicatori financiari.</>,
        <>Dacă îți trebuie tot ce s-a înregistrat la o firmă, în timp, documentul e raportul istoric, de 250 de lei.</>,
        <>Când nu știi ce vrea instituția, întreab-o ce informații trebuie să conțină documentul, nu cum se numește.</>,
      ]}
      toc={[
        ['nu-exista', 'De ce nu există certificat „extins”'],
        ['ce-contine', 'Ce conține certificatul constatator'],
        ['ce-poate-insemna', 'Ce poate însemna „extins” în cererea instituției'],
        ['alte-documente', 'Celelalte documente ONRC'],
        ['ce-intrebi', 'Ce întrebi înainte să comanzi'],
      ]}
      readMinutes={5}
      orderLead="Ai aflat ce îți trebuie? Certificatul pe firmă, cel pe persoană fizică și raportul istoric se comandă din același formular, cu taxa ONRC și TVA-ul incluse. Documentul vine pe email, ca PDF."
    >
      <h2 id="nu-exista">De ce nu există certificat „extins”</h2>
      <p>
        Uită-te la formularul de cerere al ONRC, numărul 11-10-188. La punctul 4.1 scrie „Certificat constatator
        pentru”, urmat de o listă de scopuri: licitație, bancă, obținere viză (IGI), leasing, notariat, fonduri IMM,
        CAS, procedura insolvenței și „altele”. Nu există o căsuță pentru „extins”, una pentru „detaliat” și una
        pentru „de bază”.
      </p>
      <p>
        Același lucru îl vezi în ordinul care fixează tarifele ONRC, Ordinul MJ 380/C/2024. Certificatul constatator e
        un singur rând, la punctul 1 din anexă, cu 30 de lei. Raportul istoric e alt rând, la punctul 2, cu 250 de
        lei pe firmă.
      </p>
      <p>
        Denumirile „extins” și „detaliat” le folosesc unele instituții și unele site-uri. Nu știm ce înțelege fiecare
        prin ele, așa că nu presupunem. Mai jos găsești documentele care există de fapt.
      </p>

      <h2 id="ce-contine">Ce conține certificatul constatator</h2>
      <p>
        Pagina ONRC despre certificate spune că certificatul constatator „prezintă starea la zi a firmei” și enumeră
        informațiile din el:
      </p>
      <ul>
        <li>denumirea firmei;</li>
        <li>numărul de ordine din registrul comerțului;</li>
        <li>codul unic de înregistrare (CUI);</li>
        <li>identificatorul unic la nivel european (EUID);</li>
        <li>forma juridică și durata de funcționare;</li>
        <li>starea firmei;</li>
        <li>activitatea principală, activitățile secundare și activitățile autorizate;</li>
        <li>capitalul social;</li>
        <li>administratorii și asociații sau acționarii;</li>
        <li>directorii sau reprezentanții pentru sucursale, subunități și sedii secundare;</li>
        <li>cenzorii;</li>
        <li>5 indicatori din situațiile financiare anuale disponibile;</li>
        <li>alte informații, după caz.</li>
      </ul>
      <p>
        Asta e lista pe care ONRC o publică pentru certificatul constatator, fără să o împartă în variante mai scurte
        sau mai lungi. Așa că, dacă cineva îți cere un certificat „extins” pentru că vrea să vadă asociații,
        administratorii sau activitățile, certificatul obișnuit le are deja.
      </p>
      <p>
        Scopul îl bifezi separat, iar pentru licitații sau fonduri IMM alegerea corectă contează. Le-am explicat în
        ghidul despre{' '}
        <GuideLink href="/ghiduri/certificat-constatator-licitatie-fonduri/">certificatul pentru licitație și fonduri</GuideLink>.
      </p>

      <h2 id="ce-poate-insemna">Ce poate însemna „extins” în cererea instituției</h2>
      <p>Din ce oferă ONRC, sunt trei documente la care se poate referi cineva:</p>
      <ul>
        <li>
          <strong>Certificatul constatator obișnuit</strong>, cu toată lista de mai sus. E varianta cea mai frecventă:
          unii îl numesc „extins” doar ca să-l deosebească de o simplă verificare a CUI-ului.
        </li>
        <li>
          <strong>Raportul istoric</strong>, care arată toate înregistrările făcute la o firmă, în ordine
          cronologică, plus situația la zi. Îl ceri când instituția vrea să vadă și ce s-a schimbat în timp: foștii
          administratori, sediile vechi, modificările de capital. Detaliile sunt în ghidul despre{' '}
          <GuideLink href="/ghiduri/raport-istoric-onrc/">raportul istoric ONRC</GuideLink>.
        </li>
        <li>
          <strong>Certificatul pe persoană fizică</strong>, cerut după CNP, care arată în ce firme o persoană are
          funcții sau calități. ONRC are o variantă a lui pentru casa de asigurări de sănătate, care acoperă ultimii 5
          ani și costă 30 de lei, indiferent dacă persoana apare sau nu într-o firmă.
        </li>
      </ul>
      <p>
        Dacă cerința vine fără explicații, nu ghici. Un raport istoric costă la ONRC de peste opt ori mai mult decât
        un certificat și se emite în cel mult 30 de zile, deci o alegere greșită te costă și bani, și timp.
      </p>

      <h2 id="alte-documente">Celelalte documente ONRC</h2>
      <p>
        În afară de certificat și de raportul istoric, ONRC mai eliberează câteva documente care se confundă uneori cu
        un certificat „extins”. Tarifele sunt cele de pe paginile ONRC, conform Ordinului MJ 380/C/2024:
      </p>
      <ul>
        <li>
          <strong>Informații grupate după un criteriu:</strong> liste de firme alese după un criteriu, cu denumirea,
          numărul de ordine, CUI-ul, sediul, starea și informația folosită drept criteriu. Costă 9 lei pe firmă, cu
          reduceri de la 101 firme în sus. Se cere la punctul 4.3 din formular.
        </li>
        <li>
          <strong>Copii certificate</strong> de pe actele din dosarul firmei: 10 lei, plus 1,5 lei pe pagină
          (punctul 4.4).
        </li>
        <li>
          <strong>Copii simple</strong> de pe aceleași acte: 1,5 lei pe pagină (punctul 4.5).
        </li>
      </ul>
      <p>
        Dacă instituția vrea să vadă un act anume, de exemplu actul constitutiv sau o hotărâre a asociaților,
        documentul potrivit e o copie certificată, nu un certificat constatator.
      </p>

      <h2 id="ce-intrebi">Ce întrebi înainte să comanzi</h2>
      <p>Trei întrebări pentru cine îți cere documentul îți spun aproape mereu ce să alegi:</p>
      <ul>
        <li>Vreți situația firmei de azi sau și istoricul modificărilor?</li>
        <li>Vreți date despre firmă sau despre o persoană anume?</li>
        <li>Pentru ce scop îl folosiți și cât de recent trebuie să fie?</li>
      </ul>
      <p>
        Dacă răspunsul e „situația de azi, despre firmă”, îți trebuie certificatul constatator obișnuit. La noi costă{' '}
        {lei(p.firma)} lei, cu taxa ONRC și TVA-ul incluse, și ajunge de obicei pe email în câteva minute. Certificatul
        pe persoană fizică e {lei(p.pf)} lei, iar raportul istoric {lei(p.istoric)} lei. Pe acestea două le preia
        echipa, în programul de lucru. Poți{' '}
        <Link href={CONSTATATOR_ORDER_HREF}>comanda certificatul</Link> sau compara variantele pe{' '}
        <Link href="/">pagina principală</Link>.
      </p>
    </ConstatatorGuide>
  );
}
