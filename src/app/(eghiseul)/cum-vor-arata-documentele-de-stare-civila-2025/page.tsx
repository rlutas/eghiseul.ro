import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cum-vor-arata-documentele-de-stare-civila-2025';
const TITLE = 'Cum Arată Noile Documente de Stare Civilă (din 2025)';
const DESCRIPTION =
  'Culorile, filigranul și codul unic de pe noile certificate de naștere, căsătorie, divorț și deces, ' +
  'plus schimbarea care contează cu adevărat după SIIEASC: le poți cere de la orice primărie din țară.';
const DATE_PUBLISHED = '2025-01-01';
const DATE_MODIFIED = '2026-09-09';

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
      category="Stare civilă"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2025"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        { slug: 'certificat-nastere', label: 'Certificat de Naștere', desc: 'Duplicat obținut de la starea civilă, cu împuternicire avocațială.' },
        { slug: 'certificat-casatorie', label: 'Certificat de Căsătorie', desc: 'Duplicat obținut de la starea civilă, livrat oriunde.' },
      ]}
      faqs={[
        {
          q: 'Pot cere certificatul de la orice primărie, sau doar de unde s-a înregistrat actul?',
          a: 'De la oricare. Normele metodologice aprobate prin HG 255/2024 prevăd, la art. 158, că cererea se poate depune la orice serviciu public comunitar local de evidență a persoanelor sau la orice primărie din România, iar certificatul se livrează la adresa indicată în cerere. Asta e schimbarea practică adusă de sistemul informatic integrat, nu formatul documentului.',
        },
        {
          q: 'Cum arată noul certificat de naștere?',
          a: 'Hârtie specială A4 cu filigran cu stema României, tentă de culoare albastră și un șir unic de trei litere și șapte cifre tipărit în stânga jos. Căsătoria e roz, decesul cenușiu, iar certificatul de divorț verde. Elementele de siguranță se stabilesc prin ordin al ministrului afacerilor interne.',
        },
        {
          q: 'Certificatele se emit acum doar electronic?',
          a: 'Nu. Legea prevede ambele formate, fizic și electronic, iar cel electronic se semnează electronic de emitent, primește automat sigiliul sistemului și un cod de verificare a autenticității. În primul an de funcționare la nivel național, însă, formatul fizic a rămas covârșitor majoritar: sub 5% din certificatele de naștere și de căsătorie au fost eliberate digital, iar la deces sub 1%.',
        },
        {
          q: 'Pot descărca certificatul de pe internet, fără să merg nicăieri?',
          a: 'Nu, deocamdată. Normele descriu un portal extern prin care s-ar putea depune cereri online, dar el nu a fost confirmat ca funcțional pentru cetățeni. În practică rămân trei căi: te duci personal la un ghișeu, trimiți pe cineva cu procură specială autentificată, sau mandatezi un avocat cu împuternicire avocațială.',
        },
        {
          q: 'Certificatul românesc e valabil automat în străinătate?',
          a: 'Nu automat. Pentru statele părți la Convenția CIEC nr. 16 de la Viena există extrasul multilingv, care are aceeași putere doveditoare ca certificatul și se prezintă direct. Pentru documentele care circulă între state UE se aplică Regulamentul (UE) 2016/1191, care le scutește de apostilă. În afara acestor două regimuri, pentru statele Convenției de la Haga, certificatul trebuie apostilat.',
        },
        {
          q: 'Cine emite certificatul de divorț?',
          a: 'Ofițerul de stare civilă, când divorțul se face pe cale administrativă prin acordul soților, sau notarul public. Numărul se alocă din Registrul unic al certificatelor de divorț. Instanța nu emite certificat de divorț, ci o hotărâre judecătorească, pe baza căreia se face apoi mențiunea.',
        },
        {
          q: 'Ce este SIIEASC și de când funcționează?',
          a: 'Sistemul informatic integrat pentru emiterea actelor de stare civilă, care leagă între ele evidențele primăriilor. A devenit operațional la nivel național pe 31 martie 2025. În primul an au fost înregistrate 1.018.393 de evenimente de stare civilă și validate aproape 2,93 milioane de acte în arhiva electronică.',
        },
      ]}
    >
      <p>
        Dacă ai ajuns aici căutând cum arată noile certificate, răspunsul scurt e mai jos, cu
        culori și elemente de siguranță. Dar merită spus din capul locului că partea vizuală e
        cea mai puțin importantă schimbare. Ce s-a schimbat cu adevărat pentru un om obișnuit e
        <strong> de unde poate cere documentul</strong>, iar asta nu se vede pe hârtie.
      </p>

      <h2>Schimbarea care contează: nu mai depinzi de primăria unde s-a înregistrat actul</h2>
      <p>
        Regula veche era simplă și enervantă. Certificatul de naștere se lua de la primăria
        unde fusese înregistrată nașterea. Dacă te-ai născut în Botoșani și locuiești în
        Timișoara, mergeai la Botoșani sau trimiteai pe cineva acolo.
      </p>
      <p>
        Normele metodologice aprobate prin <strong>HG 255/2024</strong>, date în aplicarea Legii
        119/1996, schimbă asta la art. 158: cererea se poate depune la <em>oricare</em> serviciu
        public comunitar local de evidență a persoanelor sau la oricare primărie din România, iar
        certificatul se livrează la adresa din țară indicată în cerere. Când cererea se depune la
        o misiune diplomatică sau la un consulat, livrarea se face prin curier în străinătate.
      </p>
      <p>
        Asta funcționează pentru că actele nu mai stau doar în registrele de hârtie ale primăriei
        emitente. Sistemul informatic integrat pentru emiterea actelor de stare civilă, SIIEASC,
        a devenit operațional la nivel național pe <strong>31 martie 2025</strong>. În primul an
        de funcționare au fost înregistrate 1.018.393 de evenimente de stare civilă și validate
        aproape 2,93 milioane de acte în arhiva electronică.
      </p>

      <h2>Cum arată efectiv noile certificate</h2>
      <p>
        Elementele sunt stabilite prin art. 9 din aceleași norme. Toate cele patru documente se
        tipăresc pe hârtie specială format A4, de minimum 95 de grame, cu <strong>filigran cu
        stema României</strong>. Fiecare exemplar poartă, tipărit în stânga jos, un{' '}
        <strong>șir unic format din trei litere și șapte cifre</strong>. Restul elementelor de
        siguranță se stabilesc prin ordin al ministrului afacerilor interne, deci nu sunt publice
        în detaliu, ceea ce e de altfel firesc.
      </p>
      <p>Ce le deosebește la prima vedere e culoarea de fond:</p>
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Tentă de culoare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Certificat de naștere</td>
            <td>albastră</td>
          </tr>
          <tr>
            <td>Certificat de căsătorie</td>
            <td>roz</td>
          </tr>
          <tr>
            <td>Certificat de deces</td>
            <td>cenușie</td>
          </tr>
          <tr>
            <td>Certificat de divorț</td>
            <td>verde</td>
          </tr>
        </tbody>
      </table>
      <p>
        Formatul A4 e o schimbare cu efecte practice mărunte, dar reale: noile certificate nu mai
        intră în portofel și nu mai încap în foliile de plastic în care generații întregi și-au
        ținut certificatul de naștere. Merită o folie de dosar.
      </p>

      <h2>Formatul electronic există. Aproape nimeni nu-l cere</h2>
      <p>
        Art. 158 alin. (1) prevede că certificatele se eliberează în format fizic <em>și</em>{' '}
        electronic. Varianta electronică se semnează electronic de emitent, primește automat
        sigiliul SIIEASC și un cod de verificare care îi confirmă autenticitatea. Deci da,
        certificatul digital există și e un document real, nu o poză a celui de hârtie.
      </p>
      <p>
        Cifrele din primul an de funcționare arată însă cât de puțin s-a mutat lumea acolo. Din
        cele 797.088 de certificate de naștere eliberate, 763.241 au fost fizice și 33.847
        digitale, adică 4,2%. La căsătorie proporția e aproape identică, 4,3%. La deces, 2.753 din
        485.824, adică sub 1%.
      </p>
      <p>
        Explicația probabilă nu e tehnică. Certificatul îl ceri ca să-l dai altcuiva, iar acel
        altcineva — un notar, o bancă, un consulat, un HR — cere de obicei hârtie. Un document
        digital e util doar dacă cel care îl primește știe ce să facă cu el, și încă nu e cazul
        peste tot.
      </p>

      <h2>Ce nu poți face încă online</h2>
      <p>
        Aici trebuie să fim exacți, pentru că se scrie mult și greșit pe tema asta. Normele descriu,
        la art. 32, un <strong>portal extern</strong> al SIIEASC prin care cetățeanul ar putea
        depune cereri pentru înregistrarea actelor, pentru transcrieri, pentru eliberarea
        certificatelor și a extraselor multilingve, chiar și pentru divorțul administrativ.
        Autentificarea s-ar face cu certificat calificat de semnătură electronică sau cu un cont
        creat la un ghișeu.
      </p>
      <p>
        Portalul e scris în normă. Funcționarea lui pentru publicul larg nu e confirmată. În mai
        2024, Ministerul Afacerilor Interne anunța că partea destinată cetățenilor nu e accesibilă,
        din cauza extinderii în etape și a interconectării celor 3.188 de unități
        administrativ-teritoriale. Comunicatul de bilanț de la un an de la operaționalizarea
        națională nu anunță lansarea ei. Presa a scris în mai 2026 despre o implementare întinsă
        pe peste cinci ani față de cei circa trei planificați, cu primării care raportează
        dificultăți de utilizare și fluxuri rămase parțial manuale.
      </p>
      <p>
        Concluzia practică: <strong>nu poți descărca azi un certificat de naștere de acasă.</strong>{' '}
        Cineva tot trebuie să ajungă la un ghișeu. Diferența față de acum doi ani e că ghișeul poate
        fi oricare, nu neapărat cel din orașul nașterii.
      </p>

      <h2>Certificatul de divorț, documentul de care puțini au auzit</h2>
      <p>
        E singurul din cele patru care nu atestă un eveniment consemnat de la sine, ci rezultatul
        unei proceduri. Se emite de ofițerul de stare civilă atunci când căsătoria se desface prin
        acordul soților, pe cale administrativă, sau de notarul public. Numărul se alocă din{' '}
        <strong>Registrul unic al certificatelor de divorț</strong>, care ține evidența centralizată
        a ambelor categorii de emitenți.
      </p>
      <p>
        Confuzia frecventă: dacă ai divorțat în instanță, nu primești certificat de divorț. Primești
        o hotărâre judecătorească definitivă, pe baza căreia se operează mențiunea pe actul de
        căsătorie. Cere hotărârea, nu certificatul.
      </p>

      <h2>Pentru străinătate: trei regimuri diferite, ușor de confundat</h2>
      <p>
        Aici se fac cele mai scumpe greșeli, fiindcă oamenii plătesc traduceri și apostile de care
        nu aveau nevoie, sau se prezintă fără cele de care aveau.
      </p>
      <p>
        <strong>Extrasul multilingv</strong> al actului de stare civilă se eliberează în aplicarea
        Convenției CIEC nr. 16, semnată la Viena în 1976. Are <em>aceeași putere doveditoare</em> ca
        certificatul propriu-zis și se folosește direct în fața autorităților din statele părți la
        convenție. Se cere, ca și certificatul, de la oricare primărie.
      </p>
      <p>
        <strong>Formularul standard multilingv</strong> din Regulamentul (UE) 2016/1191 e altceva,
        deși numele seamănă. E un instrument ajutător de traducere, nu are valoare juridică
        autonomă și se prezintă <em>numai împreună</em> cu documentul original pe care îl însoțește.
        În schimb, documentul astfel însoțit e acceptat fără traducere și fără legalizare.
      </p>
      <p>
        <strong>Apostila</strong> nu mai e necesară pentru documentele care circulă între state
        membre UE sub incidența aceluiași regulament. Rămâne necesară pentru statele Convenției de
        la Haga din 1961 aflate în afara acestui regim. Cu alte cuvinte: pentru Italia, Spania sau
        Germania nu apostilezi; pentru Statele Unite, Canada sau Turcia, da.
      </p>

      <h2>Dacă ești plecat din țară</h2>
      <p>
        Legea 119/1996 permite eliberarea certificatului către trei categorii: titularul, persoana
        împuternicită prin <strong>procură specială autentificată</strong> și avocatul care are{' '}
        <strong>împuternicire avocațială</strong>. Asta e baza pe care funcționează orice
        intermediere, inclusiv a noastră.
      </p>
      <p>
        Prin{' '}
        <Link href={serviceUrl('certificat-nastere')}>serviciul de certificat de naștere</Link> și
        prin cel de{' '}
        <Link href={serviceUrl('certificat-casatorie')}>certificat de căsătorie</Link>, cererea se
        depune la starea civilă în baza împuternicirii avocațiale, iar documentul, emis de
        instituție, ajunge la adresa ta, în țară sau afară. Noi nu emitem nimic și nu putem grăbi
        un act care nu se găsește; ce plătești e demersul și transportul.
      </p>
      <p>
        Dacă ești în România și ai o dimineață liberă, mergi la ghișeu. De când poți alege orice
        primărie, drumul e mult mai scurt decât era.
      </p>
    </ArticleLayout>
  );
}
