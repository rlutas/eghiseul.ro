import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-pentru-licitatie';
const TITLE = 'Certificat Constatator pentru Licitație (SEAP/SICAP): Ghid Complet';
const DESCRIPTION =
  'Ai nevoie de certificat constatator pentru o licitație SEAP/SICAP? Vezi de ce trebuie emis cu maximum 30 de zile înainte de termen, ce dovedește și cum îl obții online prin eGhișeul.ro.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-constatator.png',
});

export default function Page() {
  const constatatorUrl = serviceUrl('certificat-constatator');
  return (
    <ArticleLayout
      slug={SLUG}
      category="Comercial / ONRC"
      image="/og/services/certificat-constatator.png"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="22 iunie 2026"
      updatedLabel="22 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-constatator',
          label: 'Certificat Constatator Online',
          desc: 'Obține certificatul constatator ONRC online, în format PDF e-semnat, original și acceptat în SEAP.',
        },
      ]}
      faqs={[
        {
          q: 'Certificatul constatator în format PDF este acceptat în SEAP/SICAP?',
          a: 'Da. PDF-ul e-semnat eliberat de ONRC este document original, are aceeași valoare juridică ca varianta pe hârtie și este acceptat ca atare în SEAP/SICAP. Îl încarci direct în dosarul ofertei, fără să fie nevoie de o copie ștampilată suplimentar.',
        },
        {
          q: 'Cu cât timp înainte de licitație trebuie emis certificatul constatator?',
          a: 'Certificatul trebuie să fie emis cu cel mult 30 de zile înainte de termenul-limită de depunere a ofertei. Un certificat mai vechi de 30 de zile la data ofertei poate duce la descalificarea automată din procedură, pentru că nu mai reflectă situația „la zi” a firmei.',
        },
        {
          q: 'Ce tip de certificat constatator îmi trebuie pentru o licitație?',
          a: 'Pentru majoritatea licitațiilor este suficient certificatul constatator „de bază”, care costă 30 lei. El dovedește existența legală a firmei și codurile CAEN autorizate. Verifică totuși documentația de atribuire, pentru că autoritatea contractantă stabilește exact ce informații cere.',
        },
        {
          q: 'Ce dovedește certificatul constatator în fața autorității contractante?',
          a: 'Dovedește că firma există legal, este activă și are înregistrate codurile CAEN care corespund obiectului achiziției. Practic, demonstrează că ai dreptul să prestezi sau să livrezi exact ceea ce se licitează.',
        },
        {
          q: 'Cât durează să obțin certificatul constatator online?',
          a: 'Prin eGhișeul.ro completezi datele firmei, achiți online și primești certificatul constatator în format PDF e-semnat, fără drum la ONRC. Așa eviți riscul de a depune un certificat expirat sau de a rata termenul ofertei.',
        },
      ]}
    >
      <p>
        Dacă pregătești un dosar pentru o <strong>licitație publică</strong> în SEAP/SICAP, aproape
        sigur ai nevoie de un <strong>certificat constatator</strong> eliberat de ONRC. Este unul
        dintre documentele care însoțesc oferta și, deși pare o simplă formalitate, o greșeală aici
        (în special un certificat <em>expirat</em>) poate duce la <strong>descalificarea
        automată</strong> din procedură. În acest ghid afli exact ce rol are certificatul
        constatator într-o licitație, în ce termen trebuie emis, ce tip îți trebuie și cum îl obții
        online, fără să rămâi blocat la ghișeul ONRC.
      </p>

      <h2>Ce este certificatul constatator și de ce îl cere autoritatea contractantă</h2>
      <p>
        Certificatul constatator este documentul oficial emis de Oficiul Național al Registrului
        Comerțului (ONRC) care atestă <strong>situația „la zi” a unei firme</strong>: că există
        legal, că este activă și ce <strong>coduri CAEN</strong> are autorizate. Într-o licitație,
        autoritatea contractantă îl folosește pentru a verifica două lucruri esențiale:
      </p>
      <ul>
        <li>
          că firma ofertantă <strong>există legal și funcționează</strong> la data depunerii
          ofertei;
        </li>
        <li>
          că are înregistrate <strong>codurile CAEN care corespund obiectului achiziției</strong> —
          adică are dreptul să presteze sau să livreze exact ceea ce se licitează.
        </li>
      </ul>
      <p>
        Cu alte cuvinte, certificatul constatator este dovada că ești un operator economic real și
        eligibil pentru contractul scos la licitație. Fără el, oferta ta este, de regulă,
        incompletă.
      </p>

      <h2>PDF-ul e-semnat este original și acceptat în SEAP</h2>
      <p>
        O confuzie frecventă: mulți cred că pentru licitație au nevoie neapărat de certificatul „pe
        hârtie”, cu ștampilă. <strong>Nu este așa.</strong> Certificatul constatator în format{' '}
        <strong>PDF, semnat electronic de ONRC, este document original</strong> și are aceeași
        valoare juridică precum varianta tipărită. Mai mult, fiind o platformă electronică,{' '}
        <strong>SEAP/SICAP acceptă direct PDF-ul e-semnat</strong> — îl încarci în dosarul ofertei
        ca atare.
      </p>
      <p>
        Acest detaliu îți economisește timp: nu mai trebuie să te deplasezi la ghișeu pentru un
        exemplar fizic și nici să faci copii legalizate. Poți obține documentul{' '}
        <Link href={constatatorUrl}>online, prin eGhișeul.ro</Link>, și să-l atașezi imediat la
        ofertă.
      </p>

      <h2>Regula celor 30 de zile: cel mai important detaliu</h2>
      <p>
        Aici se pierd cele mai multe oferte. Certificatul constatator trebuie să fie{' '}
        <strong>emis cu cel mult 30 de zile înainte de termenul-limită de depunere a ofertei</strong>
        . Dacă la data depunerii certificatul este mai vechi de 30 de zile, el nu mai reflectă
        situația „la zi” a firmei și autoritatea contractantă îl poate respinge — ceea ce înseamnă,
        de cele mai multe ori, <strong>descalificarea automată</strong>.
      </p>
      <p>
        Practic, regula de aur este: <strong>certificatul se solicită cât mai aproape de data
        ofertei</strong>, nu cu luni înainte „ca să-l ai”. Un document cerut prea devreme devine
        inutilizabil exact când ai mai multă nevoie de el.
      </p>

      <h3>Exemplu concret</h3>
      <p>
        Să spunem că termenul-limită de depunere a ofertelor este <strong>20 iulie</strong>. Pentru
        a fi valid, certificatul constatator trebuie să fie emis în intervalul{' '}
        <strong>20 iunie – 20 iulie</strong>. Un certificat emis pe 5 iunie ar fi, la data ofertei,
        mai vechi de 30 de zile — deci respins. De aceea ideal este să-l obții cu câteva zile înainte
        de termen, ca să ai marjă de siguranță, dar fără a depăși limita.
      </p>

      <h2>Ce tip de certificat constatator îți trebuie pentru licitație</h2>
      <p>
        Pentru marea majoritate a procedurilor, este suficient certificatul constatator{' '}
        <strong>„de bază”</strong>, care costă <strong>30 lei</strong>. El conține informațiile
        esențiale de care are nevoie autoritatea contractantă:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Ce verifică autoritatea</th>
              <th>Cum o dovedește certificatul de bază</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Existența legală a firmei</td>
              <td>Date de identificare: denumire, CUI, formă juridică, stare (activă)</td>
            </tr>
            <tr>
              <td>Dreptul de a presta obiectul achiziției</td>
              <td>Codurile CAEN autorizate, comparate cu obiectul contractului</td>
            </tr>
            <tr>
              <td>Sediul și reprezentanții</td>
              <td>Adresa sediului social și administratorii înregistrați</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Verifică totuși întotdeauna <strong>documentația de atribuire</strong>: autoritatea
        contractantă este cea care stabilește exact ce informații cere. În cazuri rare, se pot
        solicita și date suplimentare (de exemplu istoric sau anumite mențiuni), dar pentru
        confirmarea existenței firmei și a codurilor CAEN, varianta de bază acoperă cerința standard.
      </p>

      <h2>Greșeli frecvente care duc la descalificare</h2>
      <ul>
        <li>
          <strong>Certificat expirat.</strong> Cea mai comună eroare — un document mai vechi de 30 de
          zile la data ofertei. Soluția: îl emiți cât mai aproape de termen.
        </li>
        <li>
          <strong>Coduri CAEN care nu corespund obiectului achiziției.</strong> Dacă licitezi un
          serviciu pentru care firma nu are codul CAEN autorizat, certificatul o arată clar.
          Verifică din timp ce coduri ai active și, dacă lipsește vreunul relevant, autorizează-l
          înainte.
        </li>
        <li>
          <strong>Confuzia hârtie vs. PDF.</strong> Nu pierde timp căutând un exemplar fizic
          ștampilat — PDF-ul e-semnat este original și suficient pentru SEAP.
        </li>
        <li>
          <strong>Lăsatul pe ultima zi.</strong> Dacă apare o problemă (CAEN lipsă, date neactualizate
          la ONRC), nu mai ai timp să o rezolvi. Lasă-ți o marjă de câteva zile.
        </li>
      </ul>

      <h2>Cum obții certificatul constatator online, prin eGhișeul.ro</h2>
      <p>Procesul este rapid și nu presupune drum la ONRC:</p>
      <ul>
        <li>completezi datele firmei (CUI / denumire) în formularul online;</li>
        <li>achiți online, cu cardul;</li>
        <li>
          primești certificatul constatator în format <strong>PDF e-semnat</strong>, original și
          gata de încărcat în SEAP/SICAP.
        </li>
      </ul>
      <p>
        Avantajul principal pentru o licitație este controlul asupra <strong>datei de emitere</strong>
        : poți solicita documentul exact când ai nevoie de el, ca să te încadrezi sigur în fereastra
        de 30 de zile. Vezi detaliile și costul pe pagina de{' '}
        <Link href={constatatorUrl}>certificat constatator online</Link>.
      </p>

      <h2>Ce trebuie să reții</h2>
      <p>
        Certificatul constatator pentru licitație nu este complicat, dar are o regulă care nu admite
        excepții: <strong>maximum 30 de zile vechime la data ofertei</strong>. Dovedește existența
        legală a firmei și codurile CAEN potrivite obiectului achiziției, iar pentru cele mai multe
        proceduri varianta de bază (30 lei) este suficientă. PDF-ul e-semnat este original și
        acceptat direct în SEAP, așa că nu ai nevoie de exemplar pe hârtie. Singura diferență o face
        momentul în care îl obții — și aici un serviciu online precum{' '}
        <Link href={constatatorUrl}>eGhișeul.ro</Link> te ajută să-l ai exact la timp, fără riscul de
        a rata termenul.
      </p>
      <p>
        Vezi serviciul:{' '}
        <Link href="/servicii/certificat-constatator-online/">
          pagina principală certificat constatator online
        </Link>
        .
      </p>
    </ArticleLayout>
  );
}
