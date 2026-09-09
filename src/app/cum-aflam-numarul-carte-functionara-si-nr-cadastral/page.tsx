import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cum-aflam-numarul-carte-functionara-si-nr-cadastral';
const TITLE = 'Numărul cadastral și numărul de carte funciară: cum le afli și cum localizezi terenul';
const DESCRIPTION =
  'Cum afli numărul cadastral și numărul de carte funciară: din actul de proprietate, dintr-un extras CF ' +
  'mai vechi sau după adresă. Plus cum localizezi terenul pe hartă după numărul cadastral, pas cu pas.';
const DATE_PUBLISHED = '2023-12-01';
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
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="decembrie 2023"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        { slug: 'identificare-imobil', label: 'Identificare Imobil după Adresă', desc: 'Nu știi numărul cadastral? Îl aflăm noi după adresă.' },
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară', desc: 'Document ANCPI, livrat pe email în câteva minute.' },
        { slug: 'extras-plan-cadastral', label: 'Extras de Plan Cadastral', desc: 'Localizezi terenul pe ortofotoplan după nr. cadastral.' },
        { href: '/verificare-proprietar-imobil/', label: 'Cum afli cine e proprietarul unui imobil', desc: 'Metodele reale de verificare a proprietarului, după adresă sau CF.' },
      ]}
      faqs={[
        { q: 'Cum aflu numărul de carte funciară?', a: 'Cel mai simplu, din actul de proprietate (contract de vânzare-cumpărare, certificat de moștenitor) sau dintr-un extras de carte funciară mai vechi. Dacă nu le ai, îl poți afla după adresă prin serviciul de Identificare Imobil.' },
        { q: 'Care e diferența dintre numărul cadastral și numărul de carte funciară?', a: 'Numărul cadastral descrie imobilul fizic: poziția, forma și suprafața parcelei sau a construcției. Numărul de carte funciară identifică dosarul juridic al aceluiași imobil, adică proprietarii, ipotecile și interdicțiile înscrise. Amândouă apar în extrasul de carte funciară, primul în Partea I, al doilea în antet.' },
        { q: 'Cum aflu numărul cadastral după adresă?', a: 'Dacă ai doar adresa, prin serviciul de Identificare Imobil aflăm parcela sau construcția și numărul de carte funciară. Cu numărul aflat se poate comanda apoi extrasul de carte funciară, care e emis de ANCPI.' },
        { q: 'Unde găsesc numărul cadastral într-un extras de carte funciară?', a: 'În Partea I a extrasului (descrierea imobilului) — acolo apar numărul cadastral și suprafața. Numărul de carte funciară apare în antetul extrasului, alături de localitate.' },
        { q: 'Numărul cadastral este unic în toată țara?', a: 'Nu. Numerotarea se reia în fiecare unitate administrativ-teritorială, la fel și cea a cărților funciare. Numărul cadastral 1234 există în sute de comune, deci un număr fără județ și fără UAT nu identifică niciun imobil. De asta orice cerere de extras cere întâi localitatea.' },
        { q: 'Am un apartament. De ce îmi apar două numere de carte funciară în acte?', a: 'La blocuri există o carte funciară colectivă, a întregii construcții, și câte una individuală pentru fiecare apartament. Extrasul pentru apartamentul tău se cere pe numărul individual; pe cel colectiv primești descrierea blocului și cotele-părți, nu situația locuinței.' },
        { q: 'În actul meu scrie „nr. topografic”, nu „nr. cadastral”. E același lucru?', a: 'Nu. Numărul topografic vine din cărțile funciare vechi, din Transilvania și Banat, și descrie parcela din evidența istorică. Numărul cadastral se atribuie la înregistrarea în sistemul integrat de azi. Un imobil poate avea ambele, iar extrasul le arată pe amândouă în Partea I. Pe geoportal se caută cel cadastral.' },
        { q: 'Cum localizez terenul pe hartă după numărul cadastral?', a: 'Pe geoportalul ANCPI (geoportal.ancpi.ro) cauți după județ, unitate administrativ-teritorială și numărul cadastral, iar parcela apare conturată peste ortofotoplan. Vezi forma și poziția, dar nu și limitele exacte în teren. Pentru un document care arată parcela cu coordonate, îți trebuie extrasul de plan cadastral.' },
        { q: 'Am numărul cadastral, dar nu apare nimic pe geoportal. De ce?', a: 'Cel mai des, numărul e dintr-un act vechi și nu e cel actual: imobilul a fost dezmembrat, alipit sau renumerotat la intabulare, ori nu e încă înregistrat în sistemul integrat de cadastru. Verifică întâi ce număr apare în extrasul CF actual — dacă nu ai unul, se poate afla după adresă.' },
        { q: 'Cât costă identificarea imobilului dacă nu am numărul de carte funciară?', a: 'Identificarea imobilului costă 163,64 lei + TVA — același preț și după adresă, și după numele proprietarului. În ambele cazuri primești numărul de carte funciară al imobilului, apoi poți comanda extrasul CF.' },
      ]}
    >
      {/* Intro răspuns-întâi: varianta veche (moștenită din WP) începea cu două
          fraze de umplutură înainte de orice informație. Query-ul „localizare
          teren după număr cadastral" are 6.222 expuneri și CTR 0,21% — omul vrea
          răspunsul, nu introducerea. */}
      <p>
        Numărul cadastral și numărul de carte funciară le găsești în trei locuri: în actul de
        proprietate, într-un extras de carte funciară mai vechi sau, dacă nu ai niciunul, se pot
        afla după adresa imobilului. Iar dacă ai deja numărul cadastral și vrei să vezi unde cade
        terenul pe hartă, îl cauți pe geoportalul ANCPI.
      </p>
      <p>
        Mai jos: unde apare fiecare număr, ce faci când actele sunt vechi și numerele nu mai
        corespund, și cum localizezi efectiv parcela.
      </p>

      <h2>Nu sunt două numere, ci trei</h2>
      <p>
        <strong>Numărul cadastral</strong> descrie bucata de teren sau construcția: unde e, ce
        formă are, câți metri pătrați are. Se atribuie când imobilul intră în sistemul integrat
        de cadastru. <strong>Numărul de carte funciară</strong> descrie dosarul juridic al
        aceluiași imobil: cine e proprietar, ce ipoteci și ce interdicții s-au înscris, ce s-a
        întâmplat cu el în timp. Primul e despre pământ, al doilea despre acte.
      </p>
      <p>
        Al treilea e <strong>numărul topografic</strong>, iar el apare aproape numai în
        Transilvania și Banat, în cărțile funciare deschise încă din perioada austro-ungară.
        Dacă actul tău e mai vechi și scrie „nr. top.”, ăla nu e număr cadastral și nu-l vei
        găsi pe hartă. Un imobil poate avea și număr topografic, și număr cadastral; extrasul
        actual le arată pe amândouă, în Partea I.
      </p>
      <p>
        <strong>Niciunul dintre numere nu e unic la nivel de țară.</strong> Numerotarea se reia în fiecare unitate administrativ-teritorială.
        Numărul cadastral 1234 există în sute de comune, iar cartea funciară 5678 la fel. Un
        număr fără județ și fără UAT nu identifică nimic. De aceea orice formular de extras
        cere întâi localitatea, și de aceea o căutare pe geoportal cu UAT-ul greșit nu întoarce
        nimic, chiar dacă numărul e corect.
      </p>

      <h2>Unde apare fiecare număr, act cu act</h2>
      <p>
        Nu trebuie să comanzi nimic ca să afli numerele, dacă ai actele imobilului la tine.
        Depinde ce act ai:
      </p>
      <table>
        <thead>
          <tr>
            <th>Actul pe care îl ai</th>
            <th>Ce numere găsești în el</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contract de vânzare-cumpărare autentificat</td>
            <td>imobilul e descris cu numărul cadastral și cu cartea funciară a UAT-ului, de regulă în primul articol</td>
          </tr>
          <tr>
            <td>Încheiere de intabulare de la OCPI</td>
            <td>numărul cărții funciare și numărul cadastral, plus numărul cererii care a produs înscrierea</td>
          </tr>
          <tr>
            <td>Extras de carte funciară, oricât de vechi</td>
            <td>cartea funciară și localitatea în antet; numărul cadastral, cel topografic și suprafața în Partea I</td>
          </tr>
          <tr>
            <td>Certificat de moștenitor</td>
            <td>uneori doar descrierea din actul vechi, fără număr cadastral, dacă imobilul nu era intabulat la deces</td>
          </tr>
          <tr>
            <td>Adeverință de la registrul agricol</td>
            <td>numărul rolului agricol, care nu e număr cadastral și nu funcționează la OCPI</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ultimele două rânduri sunt cauza celor mai multe drumuri degeaba. Un teren poate figura
        de zeci de ani în registrul agricol al primăriei și să nu existe deloc în evidența
        OCPI, fiindcă nu a fost niciodată măsurat și intabulat. În cazul ăsta nu ai ce număr
        să cauți: îți trebuie mai întâi cadastru și intabulare.
      </p>

      <h3>Apartamentele au două cărți funciare, nu una</h3>
      <p>
        La un bloc există o carte funciară colectivă, a construcției întregi, și câte una
        individuală pentru fiecare apartament. Sunt numere diferite și amândouă apar în acte,
        ceea ce duce la o greșeală previzibilă: se cere extrasul pe numărul colectiv și se
        primește descrierea blocului, cu lista cotelor-părți, în loc de situația locuinței.
        Documentul e corect emis, doar că e pe alt imobil, iar taxa e consumată. Dacă vezi în
        act două numere de CF, cel al apartamentului tău e cel însoțit de cota-parte din
        terenul și părțile comune ale blocului.
      </p>

      <h2>Cum afli numărul cadastral după adresă</h2>
      <p>
        Pentru cei care nu au acces la aceste documente, serviciul de{' '}
        <Link href={serviceUrl('identificare-imobil')}>Identificare Imobil după Adresă</Link> rezolvă exact
        pasul ăsta. Pornind doar de la adresă, căutăm în evidențele OCPI parcela sau construcția și numărul
        cărții funciare. Cu numărul obținut se poate cere apoi extrasul de carte funciară, pe care îl emite
        ANCPI.
      </p>
      <p>
        Merită spus și când <em>nu</em> are rost. Identificarea găsește ce e înregistrat la OCPI; dacă
        imobilul nu a fost niciodată intabulat, căutarea nu are ce să întoarcă, oricât de exactă e adresa.
        La fel, o adresă poștală poate acoperi mai multe corpuri de proprietate (o curte cu două case, un
        teren dezmembrat între frați), caz în care rezultatul e o listă, nu un singur număr, iar tu alegi
        din ea după suprafață.
      </p>

      {/* CTA — direct în formularele de comandă (cerere echipă): cine nu are
          numărul CF nu trebuie să caute mai departe prin articol. */}
      <div className="not-prose my-8 rounded-2xl border border-primary-200 bg-primary-50/60 p-6">
        <p className="text-lg font-bold text-secondary-900 mb-1">
          Nu ai numărul de carte funciară sau nu-l găsești?
        </p>
        <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
          Îl aflăm noi pentru tine, direct de la OCPI — pornind de la <strong>adresa imobilului</strong> sau de
          la <strong>numele proprietarului</strong>. Ambele variante costă <strong>163,64 lei + TVA</strong>.
          Primești identificarea imobilului cu numărul de carte funciară, iar cu el se poate comanda apoi
          extrasul CF.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/comanda/identificare-imobil/"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-3 text-sm font-semibold text-secondary-900 transition-colors"
          >
            Identificare după adresă — 163,64 lei + TVA
          </Link>
          <Link
            href="/comanda/identificare-imobile-proprietar/"
            className="inline-flex items-center justify-center rounded-xl border border-primary-400 bg-white hover:bg-primary-50 px-5 py-3 text-sm font-semibold text-secondary-900 transition-colors"
          >
            Identificare după proprietar — 163,64 lei + TVA
          </Link>
        </div>
      </div>

      <h2>Cum se citește un extras de carte funciară</h2>
      <p>
        Dacă ai deja un extras, chiar vechi de zece ani, ai toate numerele în el. Documentul e
        împărțit în trei părți, mereu în aceeași ordine:
      </p>
      <ul>
        <li>
          în antet, „Carte Funciară Nr.” și localitatea. Numărul de CF e acolo, nu mai jos;
        </li>
        <li>
          în Partea I, descrierea imobilului: numărul cadastral, numărul topografic dacă există,
          suprafața înregistrată și, la construcții, corpurile C1, C2 și unitățile individuale;
        </li>
        <li>
          în Partea a II-a, proprietarii: cine deține imobilul și în ce cotă, cu actul care a
          produs fiecare înscriere;
        </li>
        <li>
          în Partea a III-a, sarcinile: ipoteci, interdicții de înstrăinare, servituți, notări de
          litigiu.
        </li>
      </ul>
      <p>
        Numerele din antet și din Partea I nu se schimbă în timp, deci le poți lua dintr-un extras
        vechi fără grijă. Ce se schimbă e Partea a II-a și a III-a, adică exact motivul pentru care
        un extras vechi nu ține loc de unul actual la o tranzacție: proprietarul poate fi altul,
        iar ipoteca de care nu știi s-a înscris ieri.
      </p>
      <p>
        Un lucru care nu e evident: registrul de publicitate imobiliară e public, iar un extras de
        informare poate fi cerut de oricine, nu doar de proprietar. Extrasul pentru autentificare,
        cel care blochează cartea funciară până la semnarea actului, îl cere doar notarul.
      </p>

      <div className="not-prose my-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm leading-relaxed text-amber-950">
          <strong>Iulie 2026:</strong> sistemele ANCPI sunt indisponibile în urma unui atac
          cibernetic, deci extrasele nu se pot elibera momentan din nicio sursă. Vezi{' '}
          <Link href="/ancpi-nu-functioneaza/">starea sistemelor și cronologia</Link>. Dacă ai
          antecontract cu TVA de 9%, termenul de 31 iulie e afectat direct —{' '}
          <Link href="/tva-9-locuinte-31-iulie-2026/">detalii aici</Link>.
        </p>
      </div>

      {/* Secțiune nouă (26 iulie 2026): acoperă „localizare teren după numărul
          cadastral" — 6.222 expuneri/3 luni la CTR 0,21%, pentru că articolul
          răspundea la „cum aflu numărul", nu la „unde e terenul". */}
      <h2>Cum localizezi terenul după numărul cadastral</h2>
      <p>
        Ai numărul cadastral și vrei să vezi unde cade parcela. Se face pe geoportalul ANCPI
        (geoportal.ancpi.ro), gratuit și fără cont:
      </p>
      <ol>
        <li>alegi județul și unitatea administrativ-teritorială (comuna sau orașul);</li>
        <li>cauți după numărul cadastral, nu după numele proprietarului — datele de proprietar nu sunt publice;</li>
        <li>parcela apare conturată peste ortofotoplan, cu suprafața înregistrată.</li>
      </ol>
      <p>
        Ce vezi acolo e orientativ: forma și poziția parcelei, nu limitele exacte din teren. Pentru
        un document cu coordonate și vecinătăți, îți trebuie{' '}
        <Link href={serviceUrl('extras-plan-cadastral')}>extrasul de plan cadastral</Link>. Iar
        pentru situația juridică (proprietar, ipoteci, sarcini) e nevoie de{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>extrasul de carte funciară</Link> —
        geoportalul nu arată nimic din toate astea.
      </p>
      <p>
        <strong>Când numărul nu găsește nimic</strong>, aproape întotdeauna e unul vechi. Imobilul a
        fost între timp dezmembrat, alipit sau renumerotat la intabulare, ori pur și simplu nu a
        ajuns încă în sistemul integrat. Nu insista pe numărul din actul vechi: pornește de la
        adresă și află numărul actual, apoi caută din nou.
      </p>

      <h3>Numărul nu apare pe hartă: cele cinci cauze, în ordinea frecvenței</h3>
      <table>
        <thead>
          <tr>
            <th>Cauză</th>
            <th>Cum îți dai seama</th>
            <th>Ce faci</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ai selectat altă unitate administrativ-teritorială</td>
            <td>numărul e valid, dar parcela cade în altă localitate</td>
            <td>verifică UAT-ul exact din actul de proprietate — numerele se repetă de la o comună la alta</td>
          </tr>
          <tr>
            <td>Numărul e de carte funciară, nu cadastral</td>
            <td>apare lângă mențiunea „CF nr.&rdquo; sau e vizibil mai scurt</td>
            <td>caută în act numărul cadastral sau cel topografic</td>
          </tr>
          <tr>
            <td>Imobilul nu e intabulat</td>
            <td>întreaga zonă apare fără parcele desenate</td>
            <td>e nevoie de cadastru și intabulare — vezi <Link href="/cat-costa-cadastrul-si-intabularea/">cât costă</Link></td>
          </tr>
          <tr>
            <td>Geometria nu e digitizată încă</td>
            <td>cartea funciară există pe hârtie, parcela lipsește de pe hartă</td>
            <td>identificare în evidențele OCPI, nu pe geoportal</td>
          </tr>
          <tr>
            <td>Număr vechi, înlocuit la renumerotare</td>
            <td>actul e anterior anilor 2010–2015</td>
            <td>pornește de la adresă și află numărul actual</td>
          </tr>
        </tbody>
      </table>

      <h3>Sufixele din numărul cadastral</h3>
      <p>
        Un număr de forma <strong>123456-C1-U5</strong> nu e o eroare de tipărire:{' '}
        <strong>123456</strong> e terenul, <strong>C1</strong> e prima construcție ridicată pe el, iar{' '}
        <strong>U5</strong> e unitatea individuală cinci din acea construcție, adică apartamentul. Când
        cauți un apartament pe hartă vei găsi conturul blocului, nu al locuinței — planul interior apare
        doar în <Link href={serviceUrl('copie-releveu')}>releveu</Link>.
      </p>

      <h3>După ce ai localizat imobilul: ce document îți trebuie mai departe</h3>
      <table>
        <thead>
          <tr>
            <th>Vrei să afli</th>
            <th>Documentul potrivit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>cine e proprietarul, ce ipoteci și interdicții are imobilul</td>
            <td><Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară de informare</Link></td>
          </tr>
          <tr>
            <td>limitele și vecinătățile, pentru un proiect sau o dispută</td>
            <td><Link href={serviceUrl('extras-plan-cadastral')}>extras de plan cadastral</Link></td>
          </tr>
          <tr>
            <td>configurația interioară a construcției</td>
            <td><Link href={serviceUrl('copie-releveu')}>copie după releveu</Link></td>
          </tr>
          <tr>
            <td>poziționarea exactă în teren, cu coordonate</td>
            <td><Link href={serviceUrl('plan-amplasament-delimitare')}>plan de amplasament și delimitare</Link></td>
          </tr>
          <tr>
            <td>dacă imobilul are sarcini înainte de o tranzacție</td>
            <td><Link href={serviceUrl('certificat-sarcini')}>certificat de sarcini</Link></td>
          </tr>
        </tbody>
      </table>
      <p>
        Pentru o vânzare, extrasul de carte funciară nu trebuie să fie mai vechi de 30 de zile la data
        semnării la notar — detaliile și excepțiile sunt în ghidul despre{' '}
        <Link href="/valabilitate-extras-de-carte-funciara/">valabilitatea extrasului de carte funciară</Link>.
      </p>

      <h2>Greșelile care întorc o cerere de extras</h2>
      <p>
        Cererea de <Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară</Link> se
        depune pe un număr, iar ANCPI o rezolvă exact pe numărul primit. Când numărul e greșit,
        rezultatul nu e o eroare, ci un document corect emis despre alt imobil, cu taxa consumată.
        Astea sunt confuziile care se repetă:
      </p>
      <ol>
        <li>
          Numărul fără UAT. „CF 1234” nu înseamnă nimic în lipsa comunei sau a
          orașului. Ia UAT-ul din act, nu din memorie: proprietățile de la marginea localităților
          cad des în comuna vecină față de cum le știe lumea.
        </li>
        <li>
          Numărul topografic trecut în locul celui cadastral, tipic pentru actele
          transilvănene. Dacă în act scrie „nr. top.”, mai caută o dată; numărul cadastral e altul
          sau încă nu există.
        </li>
        <li>
          Cartea funciară colectivă în locul celei individuale, la apartamente.
          Primești blocul.
        </li>
        <li>
          Numărul cererii confundat cu numărul cărții funciare. Pe încheierile de
          la OCPI apar amândouă, iar cel al cererii e mai lung și are anul în el.
        </li>
        <li>
          Un număr valabil, dar dintr-un act de dinaintea dezmembrării. Aici
          extrasul chiar iese, doar că descrie un imobil care nu mai există în forma aia.
          Suprafața din extras care nu seamănă cu cea din teren e primul semn.
        </li>
      </ol>
      <p>
        Când niciuna dintre variante nu se potrivește și numerele din acte nu produc nimic, e mai
        ieftin să pornești invers, de la adresă, decât să comanzi extrase pe rând ca să vezi care
        nimerește.
      </p>
    </ArticleLayout>
  );
}
