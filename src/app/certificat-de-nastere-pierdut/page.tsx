import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-de-nastere-pierdut';
const TITLE = 'Certificat de Naștere Pierdut: Ce Faci și Cum Obții Duplicatul';
const DESCRIPTION =
  "Ai pierdut certificatul de naștere? Vezi actele necesare, cât durează duplicatul și cum îl obții online prin eGhișeul.ro, fără drum la Starea Civilă.";
const DATE_PUBLISHED = '2026-06-19';
const DATE_MODIFIED = '2026-06-19';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-nastere.png',
});

export default function Page() {
  const nastereUrl = serviceUrl('certificat-nastere');
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image="/og/services/certificat-nastere.png"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="19 iunie 2026"
      updatedLabel="19 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-nastere',
          label: 'Certificat de Naștere Online',
          desc: 'Solicită duplicatul certificatului de naștere online, fără drum la Starea Civilă.',
        },
      ]}
      faqs={[
        {
          q: 'Am pierdut certificatul de naștere. Ce trebuie să fac?',
          a: 'Nu se „reface" vechiul document — soliciți un duplicat, adică un certificat de naștere nou și original, emis de Serviciul de Stare Civilă în baza actului de naștere existent în registre. Poți depune cererea la ghișeu sau online, prin împuternicire, prin eGhișeul.ro.',
        },
        {
          q: 'În cât timp se eliberează un certificat de naștere pierdut?',
          a: 'La ghișeu, duplicatul se eliberează de regulă în aceeași zi sau în câteva zile lucrătoare, în funcție de primărie. Prin eGhișeul.ro, termenul standard depinde de Starea Civilă competentă; pentru cereri din altă localitate sau din diaspora poate fi puțin mai lung.',
        },
        {
          q: 'Cât costă eliberarea unui duplicat de certificat de naștere?',
          a: 'Taxa de stare civilă pentru duplicat este foarte mică sau zero în multe primării. Costul serviciului online acoperă întocmirea și depunerea cererii prin împuternicire, taxele și livrarea documentului prin curier.',
        },
        {
          q: 'Pot obține duplicatul dacă am pierdut și buletinul?',
          a: 'Da. Întâi declari pierderea actului de identitate; identitatea poate fi dovedită și cu alte documente. De multe ori certificatul de naștere este chiar actul de care ai nevoie pentru a-ți reface buletinul, așa că se solicită primul.',
        },
        {
          q: 'Pot solicita duplicatul din altă localitate decât cea în care m-am născut?',
          a: 'Da. Certificatul se eliberează de primăria din localitatea unde a fost înregistrată nașterea, dar nu trebuie să te deplasezi acolo. Prin eGhișeul.ro depunem cererea prin împuternicire la primăria competentă și îți trimitem documentul prin curier, oriunde te afli.',
        },
      ]}
    >
      <p>
        Pierderea certificatului de naștere pare o problemă mare, dar soluția este simplă: nu trebuie
        să „refaci” actul vechi, ci să soliciți un <strong>duplicat</strong> — un certificat de
        naștere nou și original, emis de Serviciul de Stare Civilă pe baza actului de naștere care
        există deja în registre. În acest ghid afli exact{' '}
        <strong>ce faci când ai pierdut certificatul de naștere</strong>: actele necesare, în cât
        timp se eliberează, cât costă și cum obții duplicatul online, fără drum la ghișeu.
      </p>

      <h2>Ce înseamnă, de fapt, „certificat de naștere pierdut”</h2>
      <p>
        Certificatul de naștere este actul care atestă identitatea, data și locul nașterii. Chiar
        dacă ai pierdut exemplarul fizic, <strong>actul de naștere rămâne înregistrat</strong> în
        registrele Stării Civile din localitatea unde s-a făcut înregistrarea. De aceea nu se emite o
        „copie”, ci un <strong>duplicat original</strong>, identic ca valoare juridică cu cel
        pierdut. Același demers se aplică și dacă documentul a fost deteriorat, furat sau pur și
        simplu nu îl mai găsești.
      </p>
      <p>
        Dacă vrei să sari peste cozi și deplasări, poți solicita duplicatul direct{' '}
        <Link href={nastereUrl}>online, prin eGhișeul.ro</Link> — completezi datele, noi depunem
        cererea prin împuternicire la primăria competentă, iar tu primești certificatul prin curier.
      </p>

      <h2>Acte necesare pentru eliberarea unui certificat de naștere pierdut</h2>
      <p>Pentru a obține duplicatul, de regulă ai nevoie de:</p>
      <ul>
        <li>
          <strong>cerere tip</strong> pentru eliberarea duplicatului (o completăm noi în cazul
          serviciului online);
        </li>
        <li>
          <strong>act de identitate valabil</strong> al titularului sau al solicitantului (vezi mai
          jos ce faci dacă ai pierdut și buletinul);
        </li>
        <li>
          <strong>împuternicire</strong>, atunci când cererea este depusă de altcineva în numele tău
          (obligatorie pentru depunerea online sau pentru diaspora);
        </li>
        <li>
          dovada achitării taxei de stare civilă, acolo unde se percepe (în multe primării este
          simbolică sau zero).
        </li>
      </ul>
      <p>
        Lista exactă poate diferi ușor de la o primărie la alta. Prin eGhișeul.ro ne ocupăm noi de
        documentația corectă pentru Starea Civilă competentă, ca să nu fie nevoie să afli singur
        cerințele fiecărui ghișeu.
      </p>

      <h2>În cât timp se eliberează certificatul de naștere pierdut</h2>
      <p>
        La ghișeu, duplicatul se poate elibera <strong>în aceeași zi</strong> sau în câteva zile
        lucrătoare, în funcție de încărcarea primăriei și de localitatea de naștere. Când cererea se
        depune <strong>din altă localitate</strong> sau <strong>din străinătate</strong>, termenul
        poate fi ceva mai lung, pentru că documentul circulă prin împuternicire și apoi prin curier.
        Pentru situațiile presante există de obicei și o variantă de procesare prioritară.
      </p>

      <h2>Cât costă un duplicat de certificat de naștere</h2>
      <p>
        <strong>Taxa de stare civilă</strong> pentru eliberarea unui duplicat este, în multe
        primării, foarte mică sau inexistentă. La un serviciu online precum eGhișeul.ro, costul
        afișat acoperă întocmirea și depunerea cererii prin împuternicire, achitarea taxelor către
        primărie și livrarea documentului prin curier la adresa ta — practic plătești comoditatea de
        a nu te deplasa și a nu pierde timp la coadă. Costul curent îl vezi întotdeauna pe pagina de{' '}
        <Link href={nastereUrl}>certificat de naștere online</Link>.
      </p>

      <h2>Ce faci dacă ai pierdut și certificatul de naștere, și buletinul</h2>
      <p>
        Este o situație frecventă, mai ales după un furt sau pierderea portofelului. Pașii sunt:
      </p>
      <ul>
        <li>
          <strong>declari pierderea actului de identitate</strong> — identitatea poate fi dovedită și
          cu alte documente (pașaport, permis de conducere) sau prin verificare în evidențe;
        </li>
        <li>
          de regulă, <strong>certificatul de naștere este actul de care ai nevoie pentru a reface
          buletinul</strong>, așa că se solicită primul;
        </li>
        <li>
          dacă buletinul este și expirat, demersul este același — important este să refaci întâi
          certificatul de naștere, apoi cartea de identitate.
        </li>
      </ul>
      <p>
        Pentru că un act de identitate valabil este de obicei necesar la depunere, dacă ai pierdut
        ambele documente îți recomandăm să ne contactezi: îți spunem exact ce dovezi de identitate
        sunt acceptate în cazul tău, ca să nu faci drumuri inutile.
      </p>

      <h2>Cum obții duplicatul online, prin eGhișeul.ro</h2>
      <p>Fără programare la ghișeu și fără cozi, procesul are doar câțiva pași:</p>
      <ul>
        <li>completezi datele titularului în formularul online (2–3 minute);</li>
        <li>semnezi împuternicirea direct în aplicație și achiți cu cardul;</li>
        <li>noi depunem cererea la Starea Civilă din localitatea de naștere, în numele tău;</li>
        <li>primești duplicatul original prin curier, cu tracking pe email.</li>
      </ul>
      <p>
        Este aceeași soluție validă și pentru românii din <strong>diaspora</strong>, care altfel ar
        trebui să se întoarcă în țară doar pentru un document. Vezi detaliile și costul pe pagina de{' '}
        <Link href={nastereUrl}>eliberare certificat de naștere online</Link>.
      </p>

      <h2>Duplicat sau copie legalizată — ce îți trebuie</h2>
      <p>
        Multă lume confundă cele două. <strong>Duplicatul</strong> este un certificat de naștere nou,
        original, emis de Starea Civilă — el înlocuiește exemplarul pierdut și are aceeași valoare
        juridică. <strong>Copia legalizată</strong> este o fotocopie a unui certificat existent,
        certificată de un notar „conform cu originalul”; nu îți este de folos dacă nu mai ai deloc
        documentul. Pe scurt: dacă ai pierdut certificatul, ai nevoie de un <strong>duplicat</strong>,
        nu de o copie legalizată.
      </p>

      <h2>Ce conține și cât este valabil noul certificat</h2>
      <p>
        Duplicatul conține aceleași date ca originalul: numele titularului, data și locul nașterii,
        numele părinților, plus seria și numărul noului exemplar. <strong>Certificatul de naștere nu
        expiră</strong> — este valabil pe toată durata vieții. Unele instituții pot cere însă o copie
        legalizată recentă (emisă în ultimele luni) pentru anumite dosare, dar documentul în sine
        rămâne valabil permanent.
      </p>

      <h2>Ai pierdut certificatul de naștere fiind în străinătate</h2>
      <p>
        Dacă ești plecat din țară, nu trebuie să te întorci doar pentru un act. Pe baza unei{' '}
        <strong>împuterniciri</strong> semnate online, depunem cererea la Starea Civilă din localitatea
        de naștere și îți trimitem duplicatul oriunde te afli. Pentru folosirea documentului în fața
        autorităților străine poți avea nevoie de <strong>apostilă</strong> și de o{' '}
        <strong>traducere autorizată</strong> — le putem gestiona tot noi, ca să primești un dosar
        complet, gata de depus.
      </p>

      <h2>Concluzie</h2>
      <p>
        Un certificat de naștere pierdut nu este o problemă greu de rezolvat: soliciți un{' '}
        <strong>duplicat</strong> la Starea Civilă din localitatea de naștere, cu acte puține și
        costuri mici. Diferența o face modul în care depui cererea — la ghișeu, cu deplasare și
        așteptare, sau <Link href={nastereUrl}>online, prin eGhișeul.ro</Link>, fără să pleci de
        acasă.
      </p>
    </ArticleLayout>
  );
}
