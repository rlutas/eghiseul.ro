import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-de-celibat';
const TITLE = 'Certificat de Celibat (Anexa 9): Ce Este și Cum Îl Obții';
const DESCRIPTION =
  "Certificatul de celibat este, de fapt, Anexa 9 — dovada de stare civilă pentru căsătoria în străinătate. Vezi denumirea corectă, actele necesare, modelul și cum îl obții.";
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-celibat.png',
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image="/og/services/certificat-celibat.png"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="22 iunie 2026"
      updatedLabel="22 iunie 2026"
      relatedServices={[
        {
          slug: 'eliberare-certificat-de-celibat',
          label: 'Certificat de Celibat (Anexa 9) Online',
          desc: 'Obține dovada de stare civilă pentru căsătoria în străinătate, prin împuternicit, fără drum la primărie.',
        },
      ]}
      faqs={[
        {
          q: 'Există cu adevărat un „certificat de celibat”?',
          a: 'Nu există un document numit legal „certificat de celibat”. Instrumentul oficial este Anexa 9 — o adeverință de stare civilă care atestă că persoana nu este căsătorită. Termenul „certificat de celibat” este folosit în vorbirea curentă și de autoritățile străine, dar la primăria din România ceri Anexa 9.',
        },
        {
          q: 'Cine eliberează Anexa 9?',
          a: 'Anexa 9 se eliberează de Serviciul de Stare Civilă al primăriei care deține actul de naștere al solicitantului, conform HG 64/2011 și Legii 119/1996. Pentru cetățenii născuți în România, este primăria localității de naștere.',
        },
        {
          q: 'Cât costă certificatul de celibat (Anexa 9)?',
          a: 'La majoritatea primăriilor, Anexa 9 se eliberează gratuit. Dacă apelezi la un serviciu privat sau la un împuternicit, costul afișat acoperă întocmirea și depunerea cererii, taxele eventuale și livrarea documentului.',
        },
        {
          q: 'Pot obține Anexa 9 online, fără să merg la ghișeu?',
          a: 'La ghișeu te poți prezenta personal. Online, documentul se obține doar prin împuternicit sau printr-un serviciu privat care depune cererea în numele tău la primăria competentă și îți trimite Anexa 9 prin curier — util mai ales pentru cei din diaspora.',
        },
        {
          q: 'Pentru ce se folosește, în practică, certificatul de celibat?',
          a: 'Cel mai des este cerut pentru încheierea unei căsătorii în străinătate, ca dovadă că ești necăsătorit. Autoritatea străină îți cere această confirmare de stare civilă, iar Anexa 9 (uneori apostilată și tradusă) acoperă cerința.',
        },
      ]}
    >
      <p>
        Mulți români aud de „certificatul de celibat” când urmează să se căsătorească în străinătate
        și descoperă că la primărie nimeni nu eliberează un document cu acest nume. Explicația este
        simplă: <strong>nu există un document numit legal „certificat de celibat”</strong>.
        Instrumentul oficial prin care statul român atestă că o persoană nu este căsătorită este{' '}
        <strong>Anexa 9</strong> — o adeverință (dovadă) de stare civilă. În acest ghid afli{' '}
        <strong>denumirea corectă</strong>, actele necesare, modelul/formularul, cum se obține și
        pentru ce se folosește.
      </p>

      <h2>Ce este, de fapt, „certificatul de celibat”</h2>
      <p>
        „Certificat de celibat” este o expresie din limbajul curent, folosită inclusiv de unele
        autorități străine care îți cer „o dovadă că nu ești căsătorit”. În legislația din România,
        documentul corespunzător este <strong>Anexa 9</strong>, o <strong>adeverință de stare
        civilă</strong> (numită uneori și „dovada de celibat”), reglementată prin{' '}
        <strong>HG 64/2011</strong> și <strong>Legea 119/1996</strong> privind actele de stare
        civilă.
      </p>
      <p>
        Cu alte cuvinte, când cineva îți cere un „certificat de celibat”, tu trebuie să soliciți la
        primărie <strong>Anexa 9</strong>. Este același lucru, doar că denumirea corectă, oficială,
        este cea din lege. Reținerea acestei diferențe te scutește de drumuri inutile și de confuzii
        la ghișeu.
      </p>

      <h2>Denumirea corectă: Anexa 9 (adeverință / dovadă de stare civilă)</h2>
      <p>Ca să nu existe confuzie, iată cum se „traduc” termenii uzuali în limbaj oficial:</p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cum i se spune în vorbirea curentă</th>
              <th>Denumirea oficială</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Certificat de celibat</td>
              <td>Anexa 9 — adeverință de stare civilă</td>
            </tr>
            <tr>
              <td>Dovada de celibat</td>
              <td>Anexa 9 — dovadă de stare civilă</td>
            </tr>
            <tr>
              <td>Adeverință că nu sunt căsătorit(ă)</td>
              <td>Anexa 9</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Temeiul legal este dat de <strong>HG 64/2011</strong> (Metodologia cu privire la aplicarea
        unitară a dispozițiilor în materie de stare civilă) și de <strong>Legea 119/1996</strong>.
        Anexa 9 este un formular tipizat, completat și semnat de ofițerul de stare civilă.
      </p>

      <h2>Acte necesare pentru Anexa 9</h2>
      <p>
        Cerințele exacte pot diferi ușor de la o primărie la alta, însă, de regulă, pentru
        eliberarea Anexei 9 ai nevoie de:
      </p>
      <ul>
        <li>
          <strong>cerere</strong> adresată Serviciului de Stare Civilă (o completezi la ghișeu sau o
          întocmește împuternicitul, în cazul depunerii online);
        </li>
        <li>
          <strong>act de identitate valabil</strong> al solicitantului (carte de identitate sau
          pașaport, pentru cei din diaspora);
        </li>
        <li>
          <strong>certificatul de naștere</strong> al solicitantului, după caz;
        </li>
        <li>
          <strong>împuternicire</strong>, atunci când cererea este depusă de altcineva în numele tău
          (obligatorie pentru obținerea online sau din străinătate).
        </li>
      </ul>
      <p>
        Pentru că Anexa 9 atestă starea civilă actuală, primăria verifică în registrele proprii dacă
        ești sau nu căsătorit. De aceea documentul se eliberează de primăria care deține actul tău de
        naștere, nu de orice primărie.
      </p>

      <h2>Model / formular Anexa 9</h2>
      <p>
        Anexa 9 nu este un act pe care îl completezi tu acasă, ci un <strong>formular tipizat
        oficial</strong>, prevăzut de HG 64/2011. Conține, în esență:
      </p>
      <ul>
        <li>datele de identificare ale solicitantului (nume, prenume, data și locul nașterii);</li>
        <li>mențiunea privind starea civilă (faptul că persoana nu figurează căsătorită);</li>
        <li>autoritatea emitentă, data eliberării, semnătura ofițerului de stare civilă și ștampila.</li>
      </ul>
      <p>
        Practic, tu depui cererea, iar primăria îți eliberează formularul completat. Nu trebuie să
        „cauți modelul” pe internet și să-l completezi singur — important este să te adresezi
        primăriei corecte și să ai actele de identitate la zi.
      </p>

      <h2>Cum se obține certificatul de celibat (Anexa 9)</h2>
      <p>Există două căi principale prin care poți obține documentul:</p>
      <ul>
        <li>
          <strong>La ghișeu, personal</strong> — te prezinți la Serviciul de Stare Civilă al
          primăriei care deține actul tău de naștere, depui cererea cu actul de identitate și, de
          regulă, ridici Anexa 9 în aceeași zi sau în câteva zile lucrătoare;
        </li>
        <li>
          <strong>Online, prin împuternicit sau serviciu privat</strong> — dacă ești în altă
          localitate sau în diaspora, un împuternicit depune cererea în numele tău, pe baza unei
          împuterniciri, iar documentul îți este trimis prin curier.
        </li>
      </ul>
      <p>
        Dacă vrei să eviți deplasarea la primăria din localitatea de naștere, poți solicita documentul{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">
          online, prin eGhișeul.ro
        </Link>{' '}
        — completezi datele, semnezi împuternicirea în aplicație, iar noi depunem cererea la primăria
        competentă și îți livrăm Anexa 9 prin curier.
      </p>

      <h2>Pentru ce se folosește certificatul de celibat</h2>
      <p>
        Cea mai frecventă situație este <strong>căsătoria în străinătate</strong>. Înainte de a te
        căsători cu un cetățean străin sau în fața unei autorități din altă țară, ți se cere o{' '}
        <strong>dovadă că nu ești deja căsătorit(ă)</strong> în România. Anexa 9 confirmă exact acest
        lucru.
      </p>
      <p>
        În funcție de țară, este posibil ca Anexa 9 să fie cerută cu <strong>apostilă</strong> (pentru
        statele semnatare ale Convenției de la Haga) și însoțită de o <strong>traducere
        autorizată</strong>. Verifică întotdeauna ce formă cere autoritatea străină, ca să nu fie
        nevoie să repeți demersul.
      </p>

      <h2>Greșeli frecvente și ce trebuie să știi</h2>
      <ul>
        <li>
          <strong>Ceri „certificatul de celibat” cu acest nume.</strong> La ghișeu, cere{' '}
          <strong>Anexa 9</strong> — funcționarul va ști imediat la ce te referi.
        </li>
        <li>
          <strong>Te duci la orice primărie.</strong> Documentul se eliberează de primăria care
          deține <strong>actul tău de naștere</strong>, nu de cea de domiciliu, dacă diferă.
        </li>
        <li>
          <strong>Uiți de apostilă și traducere.</strong> Pentru folosirea în străinătate, o Anexă 9
          fără apostilă și traducere autorizată poate fi respinsă.
        </li>
        <li>
          <strong>Aștepți prea mult.</strong> Anexa 9 reflectă starea civilă la data eliberării;
          unele autorități cer un document recent, așa că nu o solicita cu luni înainte fără să
          verifici valabilitatea acceptată.
        </li>
      </ul>

      <h2>Exemplu practic</h2>
      <p>
        Maria s-a născut la Cluj-Napoca, dar locuiește în Italia și vrea să se căsătorească acolo.
        Primăria italiană îi cere un „certificato di stato libero” — adică o dovadă că nu este
        căsătorită în România. În loc să se întoarcă în țară, Maria semnează o{' '}
        <strong>împuternicire</strong>, iar cererea pentru <strong>Anexa 9</strong> este depusă la
        Starea Civilă din Cluj-Napoca. Documentul este apoi apostilat, tradus autorizat și trimis
        prin curier la adresa ei din Italia. Astfel, rezolvă cerința fără să-și ia liber și fără bilet
        de avion.
      </p>

      <h2>Cât costă și cât durează</h2>
      <p>
        La <strong>majoritatea primăriilor, Anexa 9 se eliberează gratuit</strong>, ca adeverință de
        stare civilă. Dacă apelezi la un serviciu privat sau la un împuternicit, costul afișat acoperă
        întocmirea cererii, depunerea la primăria competentă și livrarea prin curier. Termenul de
        eliberare depinde de primărie: la ghișeu poate fi chiar în aceeași zi, iar pentru cererile din
        altă localitate sau din diaspora se adaugă timpul de circulație a documentului. Dacă ai nevoie
        și de o estimare a costurilor notariale (de exemplu pentru apostilă sau acte conexe), poți
        folosi <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
      </p>

      <h2>Documente conexe de stare civilă</h2>
      <p>
        Anexa 9 face parte din familia documentelor de stare civilă pe care le poți obține, la nevoie,
        prin împuternicit. Dintre cele mai des solicitate:
      </p>
      <ul>
        <li>
          <Link href="/servicii/eliberare-certificat-de-nastere/">
            eliberare certificat de naștere
          </Link>{' '}
          — inclusiv duplicat, dacă l-ai{' '}
          <Link href="/certificat-de-nastere-pierdut/">pierdut</Link>;
        </li>
        <li>
          <Link href="/servicii/eliberare-certificat-de-casatorie/">
            eliberare certificat de căsătorie
          </Link>{' '}
          — pentru dovada căsătoriei deja înregistrate;
        </li>
        <li>
          <Link href="/servicii/certificat-constatator-online/">certificat constatator ONRC</Link>{' '}
          — atunci când ai nevoie de date oficiale despre o firmă.
        </li>
      </ul>

      <h2>Concluzie</h2>
      <p>
        „Certificatul de celibat” nu este un document de sine stătător: ceea ce ceri, în mod oficial,
        este <strong>Anexa 9 — adeverința de stare civilă</strong>, eliberată de primăria care deține
        actul tău de naștere, gratuit la majoritatea primăriilor, conform HG 64/2011 și Legii
        119/1996. Dacă vrei să eviți drumul la ghișeu, mai ales din străinătate, poți obține Anexa 9{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">
          online, prin eGhișeul.ro
        </Link>
        , prin împuternicit, cu livrare prin curier.
      </p>
    </ArticleLayout>
  );
}
