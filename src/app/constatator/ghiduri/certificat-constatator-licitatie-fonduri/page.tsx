import Link from 'next/link';
import { ConstatatorGuide, GuideLink } from '@/components/constatator/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorArticleGraph } from '@/lib/seo/constatator-schema';
import { getConstatatorPrices } from '@/lib/constatator/pricing';
import { lei } from '@/lib/documentero/services';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/certificat-constatator-licitatie-fonduri/';
const PUBLISHED = '2026-12-16';
const UPDATED = '2026-12-16';
const TITLE = 'Certificat constatator pentru licitație și fonduri: ce scop alegi';
const DESCRIPTION =
  'Pe cererea ONRC, licitația și fondurile IMM sunt scopuri separate ale aceluiași certificat constatator. Ce bifezi, ce verifici în dosar și cât durează fiecare.';

export const metadata = buildPageMetadata({ brand: 'constatator', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CONSTATATOR_INDEXABLE });

/**
 * Facts checked 11.11.2026: form 11-10-188 pct. 4.1 (purpose list, footnote 1
 * "Se va preciza scopul"); ONRC "Certificate constatatoare" (contents, 30
 * lei, form "bifat la pct. 4.1, în concordanţă cu scopul", InfoCert 24/7);
 * Legea 265/2022 art. 11 alin. 3. Timing per purpose is OUR operational data,
 * not an ONRC statement: in InfoCert the fonduri IMM and insolvență requests
 * are separate report types that go through an ONRC operator in working
 * hours (src/app/api/onrc/result/route.ts), the basic one is automatic. No
 * procurement law, programme names or term requirements on purpose.
 */
const SOURCES = [
  ['ONRC: formularul 11-10-188, cerere de eliberare acte și informații (PDF)', 'https://www.onrc.ro/templates/site/formulare/11-10-188.pdf'],
  ['ONRC: Certificate constatatoare (conținut, tarif, modalități de eliberare)', 'https://onrc.ro/index.php/ro/informatii/certificate-constatatoare'],
  ['Legea nr. 265/2022 privind registrul comerțului, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocumentAfis/288036'],
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
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Licitație și fonduri', path: PATH }],
  });
  return (
    <ConstatatorGuide
      path={PATH}
      crumb="Licitație și fonduri"
      title={TITLE}
      lead="Pentru o licitație sau pentru o cerere de finanțare îți trebuie același certificat constatator ca pentru bancă: documentul e unul singur. Diferă scopul pe care îl bifezi în cerere, iar de el depinde și cât aștepți. Iată cum alegi și ce verifici înainte în dosar."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.firma)}
      summary={[
        <>Pe cererea ONRC, certificatul constatator e unul singur, iar scopul se bifează: licitație, bancă, viză, leasing, notariat, fonduri IMM, CAS, insolvență sau altele.</>,
        <>Bifează scopul pe care îl cere dosarul. Pentru o licitație alegi „licitație”, pentru o finanțare pentru IMM-uri „fonduri IMM”.</>,
        <>Certificatul pentru licitație se emite automat, de obicei în câteva minute. Cererile pentru fonduri IMM trec printr-un operator ONRC și pot ajunge în ziua lucrătoare următoare.</>,
        <>Cât de recent trebuie să fie certificatul scrie în documentația licitației sau în ghidul programului, nu în lege.</>,
      ]}
      toc={[
        ['un-singur-certificat', 'Un singur certificat, mai multe scopuri'],
        ['ce-bifezi', 'Ce bifezi pentru licitație și pentru fonduri'],
        ['cat-dureaza', 'Cât durează fiecare'],
        ['ce-verifici', 'Ce verifici în dosar înainte să comanzi'],
        ['ce-arata', 'Ce arată certificatul și ce nu'],
        ['cum-comanzi', 'Cum îl comanzi'],
      ]}
      readMinutes={5}
      orderLead="Alegi scopul din listă, scrii CUI-ul și plătești. Certificatul pentru licitație pleacă automat. La fonduri IMM și insolvență, ONRC răspunde în programul lui de lucru. Primești PDF-ul semnat pe email."
    >
      <h2 id="un-singur-certificat">Un singur certificat, mai multe scopuri</h2>
      <p>
        Pe formularul ONRC de cerere, 11-10-188, la punctul 4.1 scrie „Certificat constatator pentru” și urmează o
        listă de căsuțe:
      </p>
      <ul>
        <li>licitație;</li>
        <li>bancă;</li>
        <li>obținere viză (IGI);</li>
        <li>leasing;</li>
        <li>notariat;</li>
        <li>fonduri IMM;</li>
        <li>CAS;</li>
        <li>procedura insolvenței;</li>
        <li>altele, unde precizezi tu scopul.</li>
      </ul>
      <p>
        Nota de subsol a formularului spune simplu: „Se va preciza scopul.” Iar pagina ONRC despre certificate cere ca
        formularul să fie „bifat la pct. 4.1, în concordanţă cu scopul pentru care este solicitat”. Deci nu ceri un
        alt document pentru licitație, ci același certificat constatator, cu scopul potrivit. Taxa ONRC e tot 30 de
        lei (Ordinul MJ 380/C/2024, anexa, pct. 1).
      </p>
      <p>
        De aici vine și confuzia cu certificatul „extins” sau „pentru fonduri”: sunt nume folosite în practică, nu
        tipuri separate în lista ONRC. Am scris despre asta în{' '}
        <GuideLink href="/ghiduri/certificat-constatator-extins/">ghidul despre certificatul constatator „extins”</GuideLink>.
      </p>

      <h2 id="ce-bifezi">Ce bifezi pentru licitație și pentru fonduri</h2>
      <p>Regula e să bifezi scopul care corespunde dosarului în care depui certificatul:</p>
      <ul>
        <li>
          <strong>Licitație</strong>, când participi la o procedură de achiziție, publică sau privată, și dosarul îți
          cere certificatul constatator.
        </li>
        <li>
          <strong>Fonduri IMM</strong>, când depui o cerere de finanțare într-un program pentru întreprinderi mici și
          mijlocii.
        </li>
        <li>
          <strong>Altele</strong>, cu scopul scris explicit, când nicio căsuță nu se potrivește. Treci acolo ce scrie
          în documentația pe care o ai.
        </li>
      </ul>
      <p>
        Dacă documentația spune doar „certificat constatator”, fără alte cerințe, întreabă organizatorul sau
        finanțatorul dacă au o preferință. E mai ușor să clarifici înainte decât să refaci dosarul după.
      </p>
      <p>
        Dacă vrei să folosești același certificat în două dosare cu scopuri diferite, de exemplu o licitație și o
        cerere de finanțare, întreabă-i pe amândoi dacă îl acceptă. Dacă nu, comandă câte unul, cu scopul fiecăruia.
      </p>

      <h2 id="cat-dureaza">Cât durează fiecare</h2>
      <p>
        Prin serviciul online InfoCert, ONRC emite certificatul constatator automat, 24 de ore din 24, ca document
        semnat electronic. Din comenzile pe care le procesăm, durata depinde însă de scopul ales:
      </p>
      <ul>
        <li>
          <strong>Licitație, bancă, leasing, notariat și celelalte scopuri pentru firmă:</strong> certificatul se
          emite automat și ajunge de obicei pe email în câteva minute.
        </li>
        <li>
          <strong>Fonduri IMM și procedura insolvenței:</strong> cererea trece printr-un operator ONRC, în programul
          lui de lucru. În practică poate ajunge abia în ziua lucrătoare următoare. Dacă depui vineri seara, nu conta
          pe certificat în weekend.
        </li>
      </ul>
      <p>
        Aceste durate sunt observațiile noastre, nu un termen publicat de ONRC. Pentru un dosar de finanțare cu
        termen-limită, lasă-ți cel puțin o zi lucrătoare de rezervă.
      </p>

      <h2 id="ce-verifici">Ce verifici în dosar înainte să comanzi</h2>
      <p>
        Cerințele despre certificat le stabilește cine organizează licitația sau programul. Caută-le în documentația
        de atribuire sau în ghidul solicitantului și verifică trei lucruri:
      </p>
      <ul>
        <li>
          <strong>Cât de recent trebuie să fie.</strong> Legea nu îi fixează certificatului o valabilitate, așa că
          termenul e cel din documentație. Mai multe în ghidul despre{' '}
          <GuideLink href="/ghiduri/valabilitate-certificat-constatator/">valabilitatea certificatului constatator</GuideLink>.
        </li>
        <li>
          <strong>În ce formă îl depui.</strong> ONRC eliberează certificatul electronic cu semnătură electronică
          calificată sau cu sigiliu electronic calificat (Legea 265/2022, art. 11 alin. 3). Dacă depunerea se face
          online, încarcă fișierul PDF primit, nu o scanare.
        </li>
        <li>
          <strong>Ce trebuie să reiasă din el.</strong> Uneori dosarul cere ca firma să aibă o anumită activitate sau să
          nu fie în insolvență ori dizolvare. Certificatul arată aceste lucruri, dar nu le poate schimba: dacă la
          registru lipsește o activitate, o adaugi întâi acolo.
        </li>
      </ul>

      <h2 id="ce-arata">Ce arată certificatul și ce nu</h2>
      <p>
        Pagina ONRC enumeră conținutul certificatului. Pentru o licitație sau o finanțare, rubricile care contează de
        obicei sunt:
      </p>
      <ul>
        <li>starea firmei;</li>
        <li>activitatea principală, activitățile secundare și cele autorizate;</li>
        <li>administratorii și asociații sau acționarii;</li>
        <li>capitalul social;</li>
        <li>5 indicatori din situațiile financiare anuale disponibile.</li>
      </ul>
      <p>
        Certificatul arată situația la zi, nu istoricul firmei. Dacă finanțatorul vrea să vadă cum s-a schimbat
        acționariatul în timp, documentul e{' '}
        <GuideLink href="/ghiduri/raport-istoric-onrc/">raportul istoric ONRC</GuideLink>, care se emite în cel mult 30
        de zile. Iar pentru un PFA sau pentru un punct de lucru, vezi ghidul despre{' '}
        <GuideLink href="/ghiduri/certificat-constatator-pfa-punct-de-lucru/">certificatul constatator pentru PFA și punct de lucru</GuideLink>.
      </p>
      <p>
        Alte documente des cerute în aceleași dosare, cum ar fi certificatul de atestare fiscală sau cazierul fiscal,
        nu vin de la Registrul Comerțului și nu le conține certificatul constatator.
      </p>

      <h2 id="cum-comanzi">Cum îl comanzi</h2>
      <p>
        În formularul nostru scrii CUI-ul firmei, alegi scopul din listă și plătești.
        Prețul e {lei(p.firma)} lei, cu taxa ONRC și TVA-ul incluse, oricare ar fi scopul. Certificatul vine doar pe
        email, ca PDF semnat electronic, așa cum îl emite ONRC.
      </p>
      <p>
        Verifică scopul înainte de plată. Cererea pleacă imediat la ONRC, deci comanda nu se mai poate anula, iar un
        certificat emis corect pentru scopul ales nu se rambursează dacă ai vrut altul. Când ești sigur,{' '}
        <Link href={CONSTATATOR_ORDER_HREF}>comandă certificatul</Link>. Dacă vrei să vezi întâi toate variantele și
        prețurile, sunt pe <Link href="/">pagina principală</Link>.
      </p>
    </ConstatatorGuide>
  );
}
