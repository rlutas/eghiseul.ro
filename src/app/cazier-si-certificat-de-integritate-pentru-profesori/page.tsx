import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-si-certificat-de-integritate-pentru-profesori';
const TITLE = 'Cazier judiciar și certificat de integritate pentru profesori: ce îți trebuie la începutul anului școlar';
const DESCRIPTION =
  'Cine trebuie să prezinte cazierul judiciar și certificatul de integritate comportamentală la angajarea în ' +
  'învățământ, cât sunt valabile, dacă se depun din nou la fiecare 6 luni și cum le obții — gratuit sau online.';
const DATE_PUBLISHED = '2026-07-29';
const DATE_MODIFIED = '2026-07-29';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: 'Cazier și Certificat de Integritate pentru Profesori (Ghid)',
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Juridice"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="29 iulie 2026"
      updatedLabel="29 iulie 2026"
      imageAlt="Cazier judiciar și certificat de integritate comportamentală pentru cadre didactice"
      relatedServices={[
        {
          slug: 'certificat-integritate',
          label: 'Certificat de Integritate Comportamentală',
          desc: 'Obține certificatul online, fără drum la ghișeu.',
        },
        {
          slug: 'cazier-judiciar',
          label: 'Cazier Judiciar Online',
          desc: 'Document IGPR, livrat rapid pe email.',
        },
        {
          href: '/cazier-judiciar-online-gratuit/',
          label: 'Cazierul judiciar gratuit, pas cu pas',
          desc: 'Cum îl scoți singur prin ghiseul.ro sau HUB MAI.',
        },
        {
          href: '/cazier-judiciar-vs-certificat-integritate-comportamentala/',
          label: 'Cazier vs. certificat de integritate',
          desc: 'Diferențele dintre cele două, explicate simplu.',
        },
      ]}
      faqs={[
        {
          q: 'Ce diferență este între cazierul judiciar și certificatul de integritate comportamentală?',
          a: 'Cazierul judiciar cuprinde toate condamnările penale ale unei persoane. Certificatul de integritate comportamentală atestă exclusiv dacă persoana figurează sau nu în Registrul național automatizat al persoanelor care au comis infracțiuni sexuale, de exploatare a unor persoane sau asupra minorilor (Legea 118/2019). Pentru angajarea în învățământ se cer amândouă — unul nu îl înlocuiește pe celălalt.',
        },
        {
          q: 'Cât sunt valabile cele două documente?',
          a: 'Atât cazierul judiciar, cât și certificatul de integritate comportamentală sunt valabile 6 luni de la data eliberării. Contează să fie în termen la momentul depunerii dosarului sau al semnării contractului.',
        },
        {
          q: 'Trebuie să le depun din nou la fiecare 6 luni dacă sunt deja angajat?',
          a: 'Nu. Ministerul Educației a clarificat că salariații din învățământ nu au obligația de a depune cazierul și certificatul de integritate în mod repetat, la fiecare 6 luni. Documentele se cer la angajare, adică la încheierea unui contract de muncă nou.',
        },
        {
          q: 'Pot depune dosarul de titularizare sau suplinire fără certificatul de integritate?',
          a: 'Da, în mod excepțional. Dacă documentul nu este gata în perioada de înscriere sau de validare a dosarului, ai obligația să îl prezinți unității de învățământ cel târziu la data semnării contractului individual de muncă.',
        },
        {
          q: 'Cum le obțin rapid dacă nu ajung la ghișeu?',
          a: 'Prin eGhișeul.ro completezi o singură cerere online pentru ambele documente, încarci actul de identitate și un selfie, iar noi ne ocupăm de tot. Primești documentele pe email și WhatsApp, iar la nevoie adăugăm traducere legalizată sau apostilă de la Haga.',
        },
      ]}
    >
      <p>
        În fiecare an, la final de august și început de septembrie, mii de profesori, educatori și angajați din
        școli au de pregătit același dosar: <strong>cazierul judiciar</strong> și{' '}
        <strong>certificatul de integritate comportamentală</strong>. Ambele sunt valabile doar 6 luni, așa că nu
        pot fi scoase „din timp" în primăvară. Am strâns aici regulile care se aplică de fapt — inclusiv două pe
        care mulți le știu greșit — și datele care arată de ce nu merită să lași totul pe septembrie.
      </p>

      <h2>Ce arată datele: interesul explodează înainte de școală</h2>
      <p>Nu e o impresie, se vede în cifre:</p>
      <ul>
        <li>
          în ultimele 3 luni (mai–iulie 2026), căutările Google legate de certificatul de integritate
          comportamentală au generat <strong>21.715 afișări</strong> și aproape 1.600 de accesări doar către
          paginile eGhișeul.ro — 23 de formulări diferite ale aceleiași nevoi (date proprii, Google Search
          Console);
        </li>
        <li>
          interesul de căutare pentru „certificat de integritate comportamentală" atinge vârful anual în{' '}
          <strong>septembrie</strong>, odată cu angajările din învățământ (Google Trends, România);
        </li>
        <li>
          a doua cea mai frecventă căutare din serie este „certificat de integritate comportamentala online{' '}
          <strong>gratuit</strong>" — majoritatea caută întâi ruta fără costuri. E mai jos în ghid, cu condițiile
          ei reale.
        </li>
      </ul>

      <h2>Cine trebuie să prezinte cele două documente</h2>
      <p>
        Obligația nu se limitează la profesori. Potrivit <strong>Legii nr. 118/2019</strong>, instituțiile din
        sistemul de învățământ — și orice entitate, publică sau privată, a cărei activitate presupune contact
        direct cu copii — au obligația să ceară certificatul de integritate comportamentală persoanelor cu care
        încheie raporturi de muncă. În practică, asta înseamnă:
      </p>
      <ul>
        <li>cadre didactice: titulari, suplinitori, debutanți la primul contract;</li>
        <li>educatori și puericultori din creșe și grădinițe, de stat sau private;</li>
        <li>personal didactic auxiliar și nedidactic: secretariat, administrator, îngrijitoare, paznici;</li>
        <li>șoferi de transport școlar și însoțitori de microbuz;</li>
        <li>angajați din after-school, centre de meditații, cluburi sportive, tabere;</li>
        <li>voluntari și colaboratori care lucrează direct cu minori.</li>
      </ul>
      <p>
        Cazierul judiciar se cere separat, pentru că verifică altceva: Legea învățământului preuniversitar
        condiționează angajarea de lipsa condamnărilor pentru anumite infracțiuni, iar la Titularizare dosarul
        fără cazier nu se validează.
      </p>

      <h2>Cazier vs. certificat de integritate — pe scurt</h2>
      <p>
        Cele două documente se confundă des, dar acoperă lucruri diferite. <strong>Cazierul judiciar</strong>{' '}
        cuprinde toate condamnările penale. <strong>Certificatul de integritate comportamentală</strong> verifică
        un singur lucru: dacă persoana figurează în Registrul național automatizat al celor care au comis
        infracțiuni sexuale, de exploatare a unor persoane sau asupra minorilor. Pentru dosarul de angajare în
        învățământ ai nevoie de <strong>amândouă</strong>. Diferențele complete le-am explicat în{' '}
        <Link href="/cazier-judiciar-vs-certificat-integritate-comportamentala/">
          articolul dedicat cazier vs. certificat de integritate
        </Link>
        .
      </p>

      <h2>Valabilitate: 6 luni — dar nu trebuie reînnoite la nesfârșit</h2>
      <p>
        Ambele documente sunt valabile <strong>6 luni de la eliberare</strong>. De aici apare o confuzie
        frecventă: mulți angajați din școli cred că trebuie să le depună din nou la fiecare 6 luni.{' '}
        <strong>Nu este cazul.</strong> Ministerul Educației a clarificat că documentele se cer{' '}
        <em>la angajare</em> — adică la încheierea unui contract de muncă nou — nu periodic, pe durata
        contractului existent.
      </p>
      <p>Practic:</p>
      <ul>
        <li>
          <strong>ești deja titular, cu contract în derulare</strong> → nu ai de depus nimic la început de an;
        </li>
        <li>
          <strong>semnezi contract nou</strong> (suplinire, transfer, primul post, angajare la privat) → ai nevoie
          de ambele documente, în termen de valabilitate la data semnării;
        </li>
        <li>
          <strong>ești la Titularizare și certificatul nu e gata</strong> → dosarul se poate valida și fără el,
          dar ai obligația să îl prezinți cel târziu la semnarea contractului.
        </li>
      </ul>

      <h2>Când să le ceri ca să le ai la 1 septembrie</h2>
      <p>
        Suplinirile și contractele noi se semnează în ultimele zile de august și primele zile de septembrie —
        fix perioada în care ghișeele sunt aglomerate de toți ceilalți candidați. Pentru că valabilitatea e de 6
        luni, orice document eliberat <strong>după 1 martie</strong> este încă valabil la 1 septembrie. Momentul
        ideal: <strong>august</strong>. Eviți și cozile, și riscul ca dosarul să rămână incomplet.
      </p>

      <h2>Cum le obții gratuit, singur</h2>
      <p>Ambele documente se pot obține fără niciun cost, dacă îndeplinești condițiile:</p>
      <ul>
        <li>
          <strong>Cazierul judiciar</strong> — online, prin ghiseul.ro sau HUB MAI, pentru cetățenii români cu
          cont validat. Pașii exacți și situațiile în care ruta gratuită nu funcționează i-am descris în{' '}
          <Link href="/cazier-judiciar-online-gratuit/">ghidul despre cazierul judiciar gratuit</Link>. La ghișeu,
          se eliberează pe loc la orice unitate de poliție cu ghișeu de cazier.
        </li>
        <li>
          <strong>Certificatul de integritate comportamentală</strong> — online și gratuit prin{' '}
          <strong>hub.mai.gov.ro</strong>, pentru cetățenii români cu cont validat pe platformă care nu figurează
          în Registru. Dacă nu ai cont validat sau situația ta e una specială, rămâne varianta ghișeului de
          poliție.
        </li>
      </ul>
      <p>
        Ruta gratuită are două condiții practice: cont validat (validarea cere un drum la ghișeu sau
        identificare video, o singură dată) și răbdare în perioada de vârf, când platformele răspund greu.
      </p>

      <h2>Cum le obții prin eGhișeul, fără drumuri</h2>
      <p>
        Dacă nu ai cont validat, ești plecat din țară, lucrezi în altă localitate decât cea de domiciliu sau pur
        și simplu nu ai timp de ghișee în săptămânile dinaintea școlii, le poți comanda pe amândouă online, dintr-o
        singură cerere:
      </p>
      <ol>
        <li>completezi formularul pe eGhișeul.ro — durează câteva minute;</li>
        <li>încarci actul de identitate și un selfie pentru verificarea identității;</li>
        <li>semnezi împuternicirea electronic, direct în formular;</li>
        <li>primești documentele pe email și WhatsApp, iar la cerere și în original, prin curier.</li>
      </ol>
      <p>
        Pentru posturi în străinătate sau la școli internaționale, adăugăm la aceeași comandă traducerea
        legalizată și apostila de la Haga.
      </p>

      <h2>Greșelile care blochează dosarele în septembrie</h2>
      <ul>
        <li>
          <strong>Documente expirate:</strong> un cazier scos în februarie nu mai e valabil la 1 septembrie —
          verifică data eliberării, nu doar existența hârtiei;
        </li>
        <li>
          <strong>un singur document din două:</strong> cazierul nu ține loc de certificat de integritate și nici
          invers;
        </li>
        <li>
          <strong>lăsat pe ultima sută:</strong> în prima săptămână de septembrie, ghișeele de cazier au cel mai
          mare volum din an — iar contul HUB MAI nevalidat nu se rezolvă în ziua depunerii dosarului;
        </li>
        <li>
          <strong>nume neactualizat:</strong> după schimbarea numelui (căsătorie, divorț), actul de identitate
          trebuie să fie cel curent, altfel cererea se respinge.
        </li>
      </ul>
    </ArticleLayout>
  );
}
