import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cum-aflam-numarul-carte-functionara-si-nr-cadastral';
const TITLE = 'Numărul cadastral și numărul de carte funciară: cum le afli și cum localizezi terenul';
const DESCRIPTION =
  'Cum afli numărul cadastral și numărul de carte funciară: din actul de proprietate, dintr-un extras CF ' +
  'mai vechi sau după adresă. Plus cum localizezi terenul pe hartă după numărul cadastral, pas cu pas.';
const DATE_PUBLISHED = '2023-12-01';
const DATE_MODIFIED = '2026-08-07';

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
      updatedLabel="7 august 2026"
      relatedServices={[
        { slug: 'identificare-imobil', label: 'Identificare Imobil după Adresă', desc: 'Nu știi numărul cadastral? Îl aflăm noi după adresă.' },
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară', desc: 'Document ANCPI, livrat pe email în câteva minute.' },
        { slug: 'extras-plan-cadastral', label: 'Extras de Plan Cadastral', desc: 'Localizezi terenul pe ortofotoplan după nr. cadastral.' },
        { href: '/verificare-proprietar-imobil/', label: 'Cum afli cine e proprietarul unui imobil', desc: 'Metodele reale de verificare a proprietarului, după adresă sau CF.' },
      ]}
      faqs={[
        { q: 'Cum aflu numărul de carte funciară?', a: 'Cel mai simplu, din actul de proprietate (contract de vânzare-cumpărare, certificat de moștenitor) sau dintr-un extras de carte funciară mai vechi. Dacă nu le ai, îl poți afla după adresă prin serviciul de Identificare Imobil.' },
        { q: 'Care e diferența dintre numărul cadastral și numărul de carte funciară?', a: 'Numărul cadastral este codul unic atribuit unității de proprietate pentru identificare geografică și administrativă. Numărul de carte funciară identifică înregistrarea imobilului în registrul de publicitate imobiliară. Ambele apar în extrasul de carte funciară.' },
        { q: 'Cum aflu numărul cadastral după adresă?', a: 'Dacă ai doar adresa, prin serviciul de Identificare Imobil aflăm parcela/construcția și numărul de carte funciară, apoi îți eliberăm extrasul CF.' },
        { q: 'Unde găsesc numărul cadastral într-un extras de carte funciară?', a: 'În Partea I a extrasului (descrierea imobilului) — acolo apar numărul cadastral și suprafața. Numărul de carte funciară apare în antetul extrasului, alături de localitate.' },
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

      <h2>Ce sunt cartea funciară și numărul cadastral?</h2>
      <p>
        <strong>Cartea funciară</strong> este un registru public care conține informații despre drepturile legale
        asupra unei proprietăți imobiliare, inclusiv descrierea detaliată și istoricul tranzacțiilor. <strong>Numărul
        cadastral</strong>, pe de altă parte, este un cod unic atribuit fiecărei unități de proprietate, folosit
        pentru identificarea geografică și administrativă.
      </p>

      <h2>De ce este important să știm aceste numere?</h2>
      <p>
        Cunoașterea acestor numere este crucială pentru orice tranzacție imobiliară, asigurând transparența și
        prevenind posibilele litigii legate de proprietate. Ele sunt, de asemenea, necesare în procesele de cadastru
        și înregistrare, precum și în obținerea de permise și autorizații.
      </p>

      <h2>Cum se găsește numărul de carte funciară?</h2>
      <p>
        Cel mai simplu mod este prin consultarea actelor de proprietate, cum ar fi <strong>contractul de
        vânzare-cumpărare sau certificatul de moștenitor</strong>. Alternativ, <strong>un extras de carte funciară mai
        vechi</strong> poate oferi aceste informații.
      </p>

      <h2>Cum afli numărul cadastral după adresă</h2>
      <p>
        Pentru cei care nu au acces la aceste documente, serviciul de{' '}
        <Link href={serviceUrl('identificare-imobil')}>Identificare Imobil după Adresă</Link> poate fi soluția.
        Pornind doar de la adresă, identificăm parcela/construcția și numărul de carte funciară al imobilului, iar
        apoi îți eliberăm extrasul de carte funciară. Astfel afli numărul cadastral fără să cauți prin acte vechi sau
        să te deplasezi la sediul OCPI.
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
          Primești identificarea imobilului cu numărul de carte funciară, apoi putem elibera și extrasul CF.
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

      <h2>Cum identifici numărul în practică, dintr-un extras vechi</h2>
      <p>
        Pentru a afla numărul de <strong>carte funciară</strong> și <strong>numărul cadastral</strong>, poți recurge
        la un extras de carte funciară vechi. Vizualizarea unui extras anterior te ghidează în identificarea clară a
        numărului cadastral, arătând exact unde se găsesc aceste informații în document — în <strong>Partea I</strong>{' '}
        (descrierea imobilului) apar numărul cadastral și suprafața, iar numărul de carte funciară apare în antet,
        alături de localitate. Această metodă directă îți permite să accesezi informațiile esențiale fără a naviga
        prin platforme online sau a vizita sediile OCPI.
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
            <td>apare lângă mențiunea „CF nr." sau e vizibil mai scurt</td>
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

      <h2>Sfaturi pentru solicitarea online a extrasului de carte funciară</h2>
      <p>
        Când soliciți un <Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară online</Link>,
        este esențial să acorzi o atenție deosebită identificării corecte a numărului de carte funciară și a numărului
        cadastral. O eroare în această etapă poate duce la întârzieri sau chiar la imposibilitatea de a primi
        documentul. Iată câteva sfaturi:
      </p>
      <ol>
        <li>
          <strong>Verifică cu atenție informațiile.</strong> Asigură-te că datele introduse în formular, inclusiv
          numărul de carte funciară și numărul cadastral, sunt corecte și complete. O simplă greșeală de tastare poate
          complica procesul.
        </li>
        <li>
          <strong>Folosește surse oficiale.</strong> Pentru a obține numerele necesare, bazează-te pe documente sau pe extrasul de carte funciară existent. Evită sursele neoficiale, care pot conține informații
          inexacte.
        </li>
        <li>
          <strong>Interpretează corect datele.</strong> Înainte de a completa cererea, asigură-te că înțelegi
          semnificația fiecărui câmp. Confuzia între numărul de carte funciară și numărul cadastral poate duce la
          erori în solicitare.
        </li>
      </ol>

      <h2>Concluzii</h2>
      <p>
        Aflarea numărului de carte funciară și a numărului cadastral este un pas esențial în asigurarea transparenței
        și legalității oricărei tranzacții imobiliare. Prin utilizarea resurselor disponibile și, dacă este necesar,
        apelând la serviciul de <Link href={serviceUrl('identificare-imobil')}>identificare a imobilului după
        adresă</Link>, proprietarii pot naviga cu succes prin complexitatea sistemului de cadastru și înregistrare a
        proprietăților. Odată ce ai numărul cadastral sau de carte funciară, poți obține rapid un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară online</Link>, cu situația juridică
        la zi a imobilului.
      </p>
    </ArticleLayout>
  );
}
