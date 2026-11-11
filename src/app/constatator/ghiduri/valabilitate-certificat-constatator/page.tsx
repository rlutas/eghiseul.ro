import Link from 'next/link';
import { ConstatatorGuide, GuideLink } from '@/components/constatator/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorArticleGraph } from '@/lib/seo/constatator-schema';
import { getConstatatorPrices } from '@/lib/constatator/pricing';
import { lei } from '@/lib/documentero/services';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/valabilitate-certificat-constatator/';
const PUBLISHED = '2026-11-18';
const UPDATED = '2026-11-18';
const TITLE = 'Valabilitate certificat constatator: cât e bun și când îți trebuie unul nou';
const DESCRIPTION =
  'Nicio lege nu fixează valabilitatea certificatului constatator. Certificatul arată firma în ziua emiterii, iar termenul de 30 de zile îl cere instituția care îl primește.';

export const metadata = buildPageMetadata({ brand: 'constatator', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CONSTATATOR_INDEXABLE });

/**
 * Facts checked 11.11.2026: ONRC "Certificate constatatoare" page (contents,
 * "starea la zi", 30 lei, InfoCert 24/7, card only); Legea 265/2022 art. 11
 * alin. 1, 3 and 8 (consolidated text). No law sets a validity term, and no
 * primary source names which institutions ask for 30 days, so the page names
 * none.
 */
const SOURCES = [
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
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Valabilitate', path: PATH }],
  });
  return (
    <ConstatatorGuide
      path={PATH}
      crumb="Valabilitate"
      title={TITLE}
      lead="Pe certificatul constatator nu scrie o dată de expirare, iar legea nu îi dă una. Termenul îl stabilește cine ți-l cere. Mai jos: de unde vine regula celor 30 de zile, ce se poate schimba după emitere și cum alegi momentul în care îl comanzi."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.firma)}
      summary={[
        <>Legea registrului comerțului nu stabilește un termen de valabilitate pentru certificatul constatator.</>,
        <>Certificatul „prezintă starea la zi a firmei”, adică firma așa cum era în registru în ziua emiterii.</>,
        <>Cele 30 de zile sunt o cerință a instituției care primește certificatul. Termenul îl găsești în dosarul sau în anunțul ei.</>,
        <>Comandă certificatul aproape de data depunerii. Dacă firma se schimbă între timp, îți trebuie unul nou oricum.</>,
      ]}
      toc={[
        ['ce-spune-legea', 'Ce spune legea'],
        ['de-unde-30-de-zile', 'De unde vin cele 30 de zile'],
        ['ce-se-schimba', 'Ce se poate schimba după emitere'],
        ['electronic', 'Certificatul electronic'],
        ['cand-il-comanzi', 'Când îl comanzi'],
        ['daca-a-expirat', 'Dacă instituția ți-l refuză'],
      ]}
      readMinutes={5}
      orderLead="Ai nevoie de un certificat proaspăt pentru un dosar? Scrii CUI-ul, alegi scopul și plătești. Certificatul de bază pe firmă pleacă automat și ajunge de obicei pe email în câteva minute, ca PDF semnat electronic."
    >
      <h2 id="ce-spune-legea">Ce spune legea</h2>
      <p>
        Certificatul constatator îl eliberează oficiul registrului comerțului, la cererea oricui, despre datele
        înregistrate în registru (Legea 265/2022, art. 11 alin. 1). Articolul spune cine îl eliberează, în ce limbă și
        pe cheltuiala cui. Despre cât timp rămâne bun după emitere, legea nu spune nimic. Nici ordinul care stabilește
        tarifele ONRC nu fixează un termen: fixează doar prețul, 30 de lei.
      </p>
      <p>
        Explicația stă în ce este documentul. Pagina ONRC despre certificate spune că certificatul constatator
        „prezintă starea la zi a firmei”. E o fotografie a registrului într-o anumită zi: denumirea, sediul, capitalul,
        asociații, administratorii, activitățile, starea firmei. Fotografia nu expiră. Doar că, de la o zi la alta,
        firma din registru se poate îndepărta de cea din certificat.
      </p>

      <h2 id="de-unde-30-de-zile">De unde vin cele 30 de zile</h2>
      <p>
        Termenul vine de la cine primește certificatul. O bancă, o autoritate care organizează o licitație, un
        program de finanțare sau un notar vrea să știe cum arată firma acum, nu cum arăta acum un an. Ca să fie
        sigur, își scrie în regulile proprii cât de recent trebuie să fie certificatul. Cel mai des întâlnești 30 de
        zile, dar termenul poate fi și mai scurt, iar unele instituții nu cer niciunul.
      </p>
      <p>
        Nu există o listă oficială cu instituțiile care cer 30 de zile, așa că nu o inventăm aici. Ce poți face e să
        cauți termenul acolo unde îl pune instituția:
      </p>
      <ul>
        <li>în lista de documente a dosarului, la rândul cu certificatul constatator;</li>
        <li>în anunțul de participare sau în ghidul programului, dacă e vorba de o licitație sau de o finanțare;</li>
        <li>în emailul sau în lista primită de la bancă ori de la notar.</li>
      </ul>
      <p>
        Formula obișnuită e „emis cu cel mult X zile înainte de data depunerii”. Atenție la data de referință: uneori
        se numără până la depunerea dosarului, alteori până la data-limită a procedurii. Dacă nu e clar, întreabă
        înainte să comanzi.
      </p>

      <h2 id="ce-se-schimba">Ce se poate schimba după emitere</h2>
      <p>
        Orice înregistrare nouă în registru face certificatul vechi incomplet. Câteva exemple din lucrurile pe care
        certificatul le arată, potrivit listei ONRC:
      </p>
      <ul>
        <li>un administrator nou sau unul care a plecat;</li>
        <li>un asociat care și-a vândut părțile sociale;</li>
        <li>sediul mutat sau un sediu secundar nou;</li>
        <li>activități noi adăugate, ori activități autorizate la alt sediu;</li>
        <li>schimbarea stării firmei, de exemplu o suspendare de activitate sau intrarea în insolvență;</li>
        <li>o modificare a capitalului social.</li>
      </ul>
      <p>
        De aceea, chiar dacă dosarul nu cere un termen, nu folosi un certificat emis înainte de o schimbare făcută
        la registru. Instituția poate compara datele din el cu restul actelor din dosar, iar o nepotrivire te
        trimite înapoi după altul.
      </p>
      <p>
        Dacă vrei să vezi și ce s-a schimbat în timp, nu doar situația de azi, documentul potrivit e{' '}
        <GuideLink href="/ghiduri/raport-istoric-onrc/">raportul istoric ONRC</GuideLink>, care arată toate
        înregistrările unei firme, în ordine.
      </p>

      <h2 id="electronic">Certificatul electronic</h2>
      <p>
        Certificatul cerut online vine ca fișier PDF semnat. Legea permite oficiului registrului comerțului să
        elibereze documentele în formă electronică, cu semnătură electronică calificată sau cu sigiliu electronic
        calificat (Legea 265/2022, art. 11 alin. 3). Prin serviciul InfoCert al ONRC, certificatul se emite automat,
        24 de ore din 24, cu plata cu cardul.
      </p>
      <p>
        Semnătura electronică nu schimbă nimic la valabilitate: data care contează rămâne data emiterii, trecută pe
        certificat. Ce merită verificat e forma în care îl primește instituția. Dacă dosarul se depune electronic,
        trimite fișierul PDF primit, nu o scanare a unei foi tipărite. Dacă instituția vrea hârtie, întreabă dacă
        acceptă o imprimare a documentului electronic.
      </p>

      <h2 id="cand-il-comanzi">Când îl comanzi</h2>
      <p>
        Regula simplă: cât mai aproape de ziua în care depui dosarul, dar nu în ultima oră. Certificatul de bază pe
        firmă se emite de obicei în câteva minute, deci nu are rost să îl ceri cu săptămâni înainte. Câteva situații
        în care contează ordinea:
      </p>
      <ul>
        <li>
          Ai o modificare în lucru la registru, de exemplu un administrator nou. Așteaptă să fie înregistrată și abia
          apoi comandă certificatul, ca să apară deja în el.
        </li>
        <li>
          Depui același certificat în mai multe dosare. Ia data-limită cea mai strânsă dintre ele și comandă în
          funcție de ea.
        </li>
        <li>
          Instituția cere un anumit scop pe certificat. Scopul îl alegi la comandă, iar pentru unele scopuri emiterea
          durează mai mult. Detaliile sunt în ghidul despre{' '}
          <GuideLink href="/ghiduri/certificat-constatator-licitatie-fonduri/">certificatul pentru licitație și fonduri</GuideLink>.
        </li>
      </ul>
      <p>
        Un detaliu util: autoritățile și instituțiile publice pot primi gratuit informațiile din registru (Legea
        265/2022, art. 11 alin. 8). Unele le verifică direct. Cele mai multe îți cer totuși certificatul în dosar, iar
        termenul lor rămâne cel scris în cerințe.
      </p>

      <h2 id="daca-a-expirat">Dacă instituția ți-l refuză</h2>
      <p>
        Dacă certificatul are mai multe zile decât acceptă instituția, singura soluție e un certificat nou. Nu se
        prelungește și nu se „reactualizează”. Taxa ONRC e aceeași, 30 de lei, oricâte certificate ai cerut pentru
        aceeași firmă.
      </p>
      <p>
        La noi, certificatul pe firmă costă {lei(p.firma)} lei, cu taxa ONRC și TVA-ul incluse, și vine doar pe
        email. Comanda nu se mai poate anula după plată, pentru că cererea pleacă imediat la ONRC. Un certificat
        corect emis nu se rambursează nici dacă instituția a cerut între timp unul mai nou, așa că verifică termenul
        înainte. Când ai data: <Link href={CONSTATATOR_ORDER_HREF}>comandă certificatul</Link>{' '}
        sau citește mai întâi <Link href="/">cum funcționează serviciul</Link>.
      </p>
    </ConstatatorGuide>
  );
}
