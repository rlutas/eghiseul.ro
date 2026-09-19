import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'informatii-cazier-auto-online';
const TITLE = 'Cazier Auto Online: Tot Ce Trebuie Să Știi';
const DESCRIPTION =
  'Cum se numește oficial cazierul auto, ce conține, cât rămân sancțiunile în evidență (5 ani, nu 6 luni), ' +
  'de ce punctele de penalizare se sting separat și de ce nu îți schimbă prima RCA.';
// Data la care articolul e verificabil la acest URL (migrarea din WordPress).
// Înainte aici scria '2024-01-01' — un placeholder identic pe 12 articole, adică
// o dată inventată în schema. Dacă apare dovada datei reale de pe WP, se corectează.
const DATE_PUBLISHED = '2026-06-16';
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
      category="Auto"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        { slug: 'cazier-auto', label: 'Cazier Auto Online', desc: 'Istoricul sancțiunilor rutiere, obținut de la Poliția Rutieră.' },
        { slug: 'cazier-judiciar', label: 'Cazier Judiciar Online', desc: 'Documentul cerut la angajare, vize și dosare — livrat pe email.' },
        { href: '/tools/verificare-rovinieta-online/', label: 'Verificare rovinietă', desc: 'Vezi gratuit dacă numărul tău are rovinietă activă.' },
      ]}
      faqs={[
        {
          q: 'Cum se numește oficial cazierul auto?',
          a: 'Nu există niciun act normativ care să folosească termenul „cazier auto”. Denumirea din catalogul serviciilor publice este „Istoric de sancțiuni la regimul circulației rutiere”, iar pe platforma MAI apare ca „Istoric sancțiuni rutiere. Puncte penalizare. Status permis.”. Emitentul este Poliția Română, prin Direcția Rutieră, nu DRPCIV.',
        },
        {
          q: 'Cât timp rămân sancțiunile în evidența Poliției Rutiere?',
          a: 'Cinci ani. Ordinul MAI 141/2014 prevede la art. 4 alin. (1) că mențiunile despre permisele reținute și sancțiunile aplicate se șterg automat în termen de 5 ani de la 1 ianuarie a anului următor celui în care s-a săvârșit fapta. Există și mențiuni care nu se șterg niciodată: infracțiunile contra siguranței circulației, cele soldate cu deces sau vătămare, interzicerea dreptului de a conduce printr-o hotărâre definitivă și permisul obținut nelegal.',
        },
        {
          q: 'Punctele de penalizare se șterg tot la 5 ani?',
          a: 'Nu, ele au un regim separat și mult mai scurt. Potrivit art. 103 alin. (4) din OUG 195/2002, punctele de penalizare se anulează la împlinirea a 6 luni de la data constatării contravenției. Suspendarea dreptului de a conduce anulează toate punctele acumulate până în acel moment. Deci poți avea zero puncte active și, în același timp, sancțiuni vizibile în evidență.',
        },
        {
          q: 'Îmi crește prima RCA din cauza amenzilor?',
          a: 'Nu prin sistemul bonus-malus. Norma ASF 20/2017 leagă bonusul și malusul exclusiv de daunele plătite în perioada de referință, nu de contravenții: pentru fiecare eveniment despăgubit se aplică o penalizare de două clase. Cuvintele „amendă”, „contravenție” și „puncte de penalizare” nu apar în textul normei. Asigurătorii pot aplica, opțional, coeficienți de corecție suplimentari pe baza istoricului șoferului, dar aceștia sunt în afara sistemului bonus-malus.',
        },
        {
          q: 'Cum obțin gratuit istoricul sancțiunilor?',
          a: 'Prin hub.mai.gov.ro, la secțiunea dedicată șoferilor. Ai nevoie de un cont în HUB, care cere o singură deplasare la poliție pentru confirmarea identității, sau de un cont ghiseul.ro deja validat, caz în care nu mai e nevoie de nicio deplasare. Documentul generat astfel este valabil doar în format electronic; varianta tipărită se obține de la serviciul rutier al IPJ sau de la Brigada Rutieră București.',
        },
        {
          q: 'Ce se întâmplă cu șoferii care au permis emis în străinătate?',
          a: 'Sancțiunile aplicate pe teritoriul României titularilor de permise străine se țin într-o evidență separată, prevăzută de art. 106² alin. (3) din OUG 195/2002. Titularul unui permis străin suspendat poate cere restituirea documentului înainte de expirarea suspendării, cu cel mult o zi lucrătoare înainte de a părăsi România, iar IGPR comunică sancțiunea autorității străine emitente.',
        },
        {
          q: 'Pot cere cazierul auto dacă am permisul suspendat?',
          a: 'Da. Suspendarea nu blochează accesul la propriile date; dimpotrivă, perioada de suspendare e una dintre informațiile pe care documentul le arată.',
        },
      ]}
    >
      <p>
        Prima problemă cu „cazierul auto” e chiar numele lui: nu există în lege. Nicio normă nu
        folosește termenul. Ce cauți se numește, în catalogul serviciilor publice,{' '}
        <strong>istoric de sancțiuni la regimul circulației rutiere</strong>, iar pe platforma
        Ministerului de Interne apare ca „Istoric sancțiuni rutiere. Puncte penalizare. Status
        permis.”. Îl ține Poliția Română prin Direcția Rutieră, nu DRPCIV, care se ocupă de
        înmatriculări și de permise ca documente.
      </p>
      <p>
        Contează pentru că, atunci când un angajator sau o autoritate îți cere „cazierul auto”, tu
        trebuie să știi ce anume să ceri la ghișeu ca să nu te trimită înapoi.
      </p>

      <h2>Ce conține și ce nu conține</h2>
      <p>
        Evidența cuprinde permisele de conducere reținute, sancțiunile contravenționale
        complementare aplicate și punctele de penalizare, plus infracțiunile rutiere. Baza legală
        a dreptului tău de a le afla e art. 208 din Regulamentul de aplicare a OUG 195/2002, care
        spune că titularul permisului poate obține informații despre punctele de penalizare la
        sediul poliției rutiere din județul care îl are în evidență.
      </p>
      <p>
        Ce nu conține: absolut nimic din afara circulației rutiere. O condamnare pentru evaziune
        fiscală, o amendă de la ANAF sau un litigiu de muncă nu au ce căuta acolo. Invers,{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar</Link> nu arată amenzile tale
        de viteză. Singura zonă de suprapunere sunt infracțiunile rutiere propriu-zise, cele care
        trec pragul de la contravenție la faptă penală.
      </p>
      <table>
        <thead>
          <tr>
            <th>Fapta</th>
            <th>Unde apare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Depășire de viteză, neacordare de prioritate, alcoolemie sub 0,8 g/l</td>
            <td>doar în evidența rutieră</td>
          </tr>
          <tr>
            <td>Conducere fără permis, alcoolemie peste 0,8 g/l, părăsirea locului accidentului</td>
            <td>în ambele: e infracțiune și rămâne și în cazierul judiciar</td>
          </tr>
          <tr>
            <td>Furt, evaziune, violență</td>
            <td>doar în cazierul judiciar</td>
          </tr>
        </tbody>
      </table>

      <h2>Cinci ani, nu șase luni. Iar punctele sunt altceva</h2>
      <p>
        Circulă masiv pe internet ideea că sancțiunile rutiere „se șterg după 6–12 luni”. E o
        confuzie între două termene diferite, și e cea mai utilă corectură din articolul ăsta.
      </p>
      <p>
        <strong>Sancțiunile și permisele reținute</strong> se șterg din evidența informatică în
        termen de 5 ani, socotiți de la 1 ianuarie a anului următor celui în care ai comis fapta.
        Regula e la art. 4 alin. (1) din Ordinul MAI 141/2014. Practic, fereastra reală e de cinci
        până la aproape șase ani: o amendă din februarie 2026 se șterge la începutul lui 2032.
      </p>
      <p>
        <strong>Punctele de penalizare</strong> se sting mult mai repede. Art. 103 alin. (4) din
        OUG 195/2002 spune că se anulează la 6 luni de la data constatării contravenției, iar
        alin. (5) că o suspendare a dreptului de a conduce șterge toate punctele acumulate până
        atunci. De aici vine impresia că „totul se curăță în șase luni”. Nu se curăță: doar
        contorul de puncte se resetează, iar sancțiunea rămâne consemnată ani buni după aceea.
      </p>
      <p>
        Unele mențiuni nu se șterg niciodată. Ordinul le enumeră: infracțiunile soldate cu decesul
        sau vătămarea unei persoane din cauza nerespectării regulilor, infracțiunile contra
        siguranței circulației, hotărârile definitive de interzicere a dreptului de a conduce și
        permisul obținut prin mijloace nelegale.
      </p>

      <h2>Nu, nu îți scumpește RCA-ul</h2>
      <p>
        Afirmația că amenzile îți cresc polița se repetă peste tot, iar până la actualizarea de față
        stătea și pe pagina asta. Am căutat-o în textul normei și nu se susține.
      </p>
      <p>
        Sistemul bonus-malus e reglementat de Norma ASF 20/2017. Art. 31 alin. (4) spune că, pentru
        aplicarea unui malus, se iau în calcul <em>evenimentele pentru care este plătită o daună</em>{' '}
        în perioada de referință, cu responsabilitatea totală sau parțială a conducătorului auto.
        Art. 32 adaugă penalizarea de două clase pentru fiecare eveniment despăgubit. În tot textul
        normei nu apar cuvintele „amendă”, „contravenție” sau „puncte de penalizare”.
      </p>
      <p>
        Cu alte cuvinte, ce te scumpește sunt <strong>daunele plătite de asigurător</strong>, adică
        accidentele în care ai fost vinovat. Poți aduna zece amenzi de viteză într-un an și să
        rămâi în aceeași clasă de bonus, atâta timp cât nu ai avariat pe nimeni.
      </p>
      <p>
        Există o singură portiță, la art. 32 alin. (8): asigurătorii <em>pot</em> aplica, suplimentar
        față de bonus-malus, coeficienți de corecție bazați pe istoricul șoferului. E opțional, e în
        afara sistemului propriu-zis, iar norma nu spune nicăieri că „istoric” ar însemna amenzi. Dacă
        un agent îți spune că poliția i-a arătat cazierul tău auto, îți vinde o poveste: documentul se
        eliberează titularului, nu companiilor de asigurări.
      </p>

      <h2>Când chiar ai nevoie de el</h2>
      <p>
        Aici merită să fim mai reținuți decât e restul internetului. Singura cerință pe care am
        găsit-o scrisă într-o lege e la <strong>taximetrie</strong>: art. 27 din Legea 38/2003 cere
        pentru cursul de atestare profesională o adeverință de la Serviciul Poliției Rutiere din care
        să rezulte că în ultimul an candidatul nu a avut dreptul de a conduce suspendat și nu a fost
        implicat în accidente. Cazierul judiciar e cerut separat, la altă literă a aceluiași articol.
      </p>
      <p>
        În rest, documentul se cere prin practica angajatorului, nu prin obligație legală: firme de
        transport, companii care dau mașină de serviciu, flote care își asigură parcul. Pagina
        oficială a ARR pentru atestatele profesionale nu îl listează printre actele necesare, deci
        dacă cineva îți spune că „e obligatoriu pentru atestat”, cere-i să-ți arate unde scrie.
      </p>
      <p>
        Al doilea motiv, mai puțin discutat, e verificarea proprie. Dacă ai primit procese-verbale
        prin poștă și nu ești sigur care au rămas în picioare, ori dacă vrei să știi câte puncte
        active ai înainte de a mai risca unul, documentul îți arată exact starea evidenței.
      </p>

      <h2>Cum îl obții</h2>
      <p>
        Varianta gratuită e <strong>hub.mai.gov.ro</strong>, la secțiunea pentru șoferi și vehicule.
        Ai nevoie de cont: fie unul creat direct în HUB, care cere o singură deplasare la poliție
        pentru confirmarea identității, fie contul tău de pe ghiseul.ro, unde identitatea e deja
        confirmată și nu mai trebuie să te deplasezi deloc. Documentul generat online e valabil doar
        în format electronic. Dacă îți trebuie pe hârtie, ștampilat, îl iei de la serviciul rutier al
        IPJ din județul tău sau de la Brigada Rutieră, în București.
      </p>
      <p>
        Varianta prin noi, la{' '}
        <Link href={serviceUrl('cazier-auto')}>cazier auto online</Link>, are sens într-un singur set
        de situații: nu ai cont și nu vrei drumul de confirmare a identității, ești plecat din țară,
        sau ai nevoie de document în aceeași comandă cu alte acte. Nu emitem noi nimic, iar termenul
        depinde de Poliție. Dacă ai deja cont pe ghiseul.ro, ia-l singur; durează câteva minute și nu
        costă nimic.
      </p>

      <h2>Cum îți menții evidența curată</h2>
      <p>
        Nu prin trucuri administrative, ci prin aritmetică simplă: punctele se sting la șase luni de
        la constatare, deci un șofer care nu adună nimic nou are contorul la zero de două ori pe an.
        Pragul care declanșează suspendarea e de 15 puncte acumulate în 6 luni, ceea ce înseamnă că
        problemele reale apar din aglomerarea abaterilor într-un interval scurt, nu din una singură.
      </p>
      <p>
        Iar dacă vrei să nu strângi amenzi ieftine și evitabile, cea mai frecventă rămâne lipsa
        rovinietei valabile. Poți verifica gratuit, după numărul de înmatriculare, cu{' '}
        <Link href="/tools/verificare-rovinieta-online/">instrumentul de verificare rovinietă</Link>,
        iar cuantumurile și termenele sunt în{' '}
        <Link href="/amenda-rovinieta-2025-tarife-plata-online-ghid-complet/">
          ghidul despre amenda de rovinietă
        </Link>
        .
      </p>
    </ArticleLayout>
  );
}
