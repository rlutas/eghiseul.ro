import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'duplicat-certificat-de-casatorie';
const TITLE = 'Duplicat Certificat de Căsătorie: Acte, Cost și Cum Îl Obții';
const DESCRIPTION =
  'Ai pierdut certificatul de căsătorie? Vezi cum obții un duplicat la Starea Civilă, ce acte îți trebuie, cât durează și cum îl ceri online, prin împuternicit, pe eGhișeul.ro.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';
const OGIMAGE = '/og/services/certificat-casatorie.png';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: OGIMAGE,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image={OGIMAGE}
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      faqs={[
        {
          q: 'Cum obțin un duplicat al certificatului de căsătorie?',
          a: 'Depui o cerere la Serviciul de Stare Civilă, însoțită de actul de identitate al unuia dintre soți. Din 2023 cererea poate fi depusă la orice primărie din țară, nu doar la cea unde s-a oficiat căsătoria. Poți merge personal la ghișeu sau poți ceda demersul unui împuternicit, inclusiv online prin eGhișeul.ro.',
        },
        {
          q: 'Cât durează eliberarea unui duplicat de certificat de căsătorie?',
          a: 'Termenul uzual este de aproximativ 30 de zile. Când cererea se depune la o altă primărie decât cea care deține actul de căsătorie, documentul circulă între instituții, așa că este bine să iei în calcul acest interval.',
        },
        {
          q: 'Cât costă duplicatul certificatului de căsătorie?',
          a: 'Eliberarea duplicatului este, în multe primării, gratuită — taxa de stare civilă este de regulă mică sau inexistentă. La un serviciu online costul afișat acoperă întocmirea și depunerea cererii prin împuternicire și livrarea documentului prin curier.',
        },
        {
          q: 'Pot obține duplicatul fără să fie prezenți ambii soți?',
          a: 'Da. Este suficient actul de identitate al unuia dintre soți. Demersul poate fi făcut și de un împuternicit, pe baza unei împuterniciri semnate, fără ca soții să se prezinte personal la ghișeu.',
        },
        {
          q: 'Mi-am schimbat numele după căsătorie. Am nevoie de duplicat?',
          a: 'Certificatul de căsătorie este documentul care atestă noul nume de familie. Dacă l-ai pierdut sau s-a deteriorat, ai nevoie de un duplicat pentru a-l prezenta la actualizarea altor acte (carte de identitate, pașaport, evidențe bancare).',
        },
      ]}
    >
      <p>
        Dacă ai pierdut certificatul de căsătorie, l-ai deteriorat sau pur și simplu nu îl mai
        găsești, soluția nu este să „refaci” actul vechi, ci să soliciți un{' '}
        <strong>duplicat</strong> — un certificat de căsătorie nou și original, emis de Serviciul de
        Stare Civilă pe baza actului de căsătorie care există deja în registre. În acest ghid afli
        exact <strong>ce acte îți trebuie</strong>, <strong>cât durează</strong>,{' '}
        <strong>cât costă</strong> și cum poți obține duplicatul online, prin împuternicit, fără drum
        la ghișeu.
      </p>

      <h2>Ce este, de fapt, duplicatul certificatului de căsătorie</h2>
      <p>
        Certificatul de căsătorie atestă încheierea căsătoriei și, de multe ori, noul nume de
        familie al soților. Chiar dacă ai pierdut exemplarul fizic,{' '}
        <strong>actul de căsătorie rămâne înregistrat</strong> în registrele Stării Civile. De aceea
        nu primești o simplă copie, ci un <strong>duplicat original</strong>, cu aceeași valoare
        juridică precum certificatul pierdut. Același demers se aplică atunci când documentul a fost
        deteriorat, furat sau distrus.
      </p>
      <p>
        Duplicatul îți este necesar într-o serie de situații frecvente: la{' '}
        <strong>pierderea sau deteriorarea</strong> documentului, la{' '}
        <strong>schimbarea numelui</strong> după căsătorie când trebuie să-ți actualizezi celelalte
        acte, ori atunci când o instituție îți cere certificatul în original și nu mai dispui de el.
      </p>

      <h2>Acte necesare pentru duplicatul certificatului de căsătorie</h2>
      <p>Pentru a obține duplicatul, de regulă ai nevoie de:</p>
      <ul>
        <li>
          <strong>actul de identitate</strong> al unuia dintre soți (carte de identitate sau
          pașaport valabil);
        </li>
        <li>
          <strong>cerere tip</strong> pentru eliberarea duplicatului (o completăm noi în cazul
          serviciului online);
        </li>
        <li>
          <strong>împuternicire</strong>, atunci când demersul este făcut de altcineva în numele
          tău (obligatorie pentru depunerea online sau pentru cei din diaspora).
        </li>
      </ul>
      <p>
        Un avantaj important: nu este necesar ca <strong>ambii soți</strong> să fie prezenți. Este
        suficient actul de identitate al unuia dintre ei, iar cererea poate fi depusă chiar de un
        împuternicit. Lista exactă poate diferi ușor de la o primărie la alta; prin eGhișeul.ro ne
        ocupăm noi de documentația corectă pentru Starea Civilă competentă.
      </p>

      <h2>Unde depui cererea: din 2023, la orice primărie</h2>
      <p>
        O schimbare importantă: <strong>din 2023, cererea pentru duplicat poate fi depusă la orice
        primărie din țară</strong>, nu doar la cea unde s-a oficiat căsătoria. Practic, dacă te-ai
        căsătorit într-o localitate și acum locuiești în alta, nu mai ești obligat să te deplasezi
        până la primăria de origine — poți depune cererea la o primărie convenabilă, iar actul
        circulă între instituții.
      </p>
      <p>
        Acest lucru simplifică mult lucrurile, dar pentru cei plecați din țară sau pentru cine vrea
        să economisească timp rămâne și mai comodă varianta <strong>online, prin împuternicit</strong>
        , unde nu trebuie să te prezinți la niciun ghișeu.
      </p>

      <h2>Cât durează și cât costă</h2>
      <table>
        <thead>
          <tr>
            <th>Aspect</th>
            <th>Detaliu</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Termen uzual</td>
            <td>aproximativ 30 de zile</td>
          </tr>
          <tr>
            <td>Taxă de stare civilă</td>
            <td>adesea gratuită (mică sau inexistentă)</td>
          </tr>
          <tr>
            <td>Unde depui</td>
            <td>din 2023, la orice primărie din țară</td>
          </tr>
          <tr>
            <td>Prezența soților</td>
            <td>nu este obligatorie — ajunge actul unuia dintre soți</td>
          </tr>
          <tr>
            <td>Variantă online</td>
            <td>prin împuternicit, fără deplasare</td>
          </tr>
        </tbody>
      </table>
      <p>
        Termenul de aproximativ 30 de zile este orientativ și ține de încărcarea primăriei și de
        traseul actului între instituții. <strong>Eliberarea duplicatului este, în multe primării,
        gratuită</strong>. La un serviciu online precum eGhișeul.ro, costul afișat acoperă
        întocmirea și depunerea cererii prin împuternicire și livrarea documentului prin curier la
        adresa ta.
      </p>

      <h2>Exemplu practic</h2>
      <p>
        Ana și Mihai s-au căsătorit la Iași, dar acum locuiesc la București. Ana și-a schimbat numele
        de familie după căsătorie și trebuie să-și actualizeze cartea de identitate, însă a pierdut
        certificatul de căsătorie. Datorită regulii din 2023, ei nu mai sunt nevoiți să meargă la
        Iași: Ana depune cererea de duplicat — fie la o primărie din București, fie online, prin
        împuternicit, cu actul ei de identitate. Documentul circulă către primăria din Iași, care
        deține actul de căsătorie, iar duplicatul îi este eliberat și trimis. Mihai nu trebuie să fie
        prezent.
      </p>

      <h2>Cum obții duplicatul online, prin eGhișeul.ro</h2>
      <p>Fără programare la ghișeu și fără cozi, procesul are doar câțiva pași:</p>
      <ul>
        <li>completezi datele căsătoriei și ale unuia dintre soți în formularul online;</li>
        <li>semnezi împuternicirea direct în aplicație și achiți cu cardul;</li>
        <li>noi depunem cererea la Starea Civilă, în numele tău;</li>
        <li>primești duplicatul original prin curier, cu tracking pe email.</li>
      </ul>
      <p>
        Vezi detaliile și costul actualizat pe pagina de{' '}
        <Link href="/servicii/eliberare-certificat-de-casatorie/">
          eliberare certificat de căsătorie online
        </Link>
        . Este aceeași soluție validă și pentru românii din <strong>diaspora</strong>, care altfel
        ar trebui să se întoarcă în țară doar pentru un document.
      </p>

      <h2>Duplicat, transcriere sau alt certificat — ce îți trebuie</h2>
      <p>
        Demersurile de stare civilă se confundă ușor. Iată cum le deosebești:
      </p>
      <ul>
        <li>
          <strong>Duplicat certificat de căsătorie</strong> — un exemplar nou și original, când l-ai
          pierdut sau s-a deteriorat. Este subiectul acestui ghid.
        </li>
        <li>
          <Link href="/transcriere-certificat-de-casatorie/">Transcrierea certificatului</Link> — se
          aplică atunci când căsătoria a fost încheiată în străinătate și trebuie înscrisă în
          registrele românești. Nu este același lucru cu un duplicat.
        </li>
        <li>
          <Link href="/servicii/eliberare-certificat-de-celibat/">Certificatul de celibat</Link> —
          atestă că o persoană nu este căsătorită; se folosește, de exemplu, înainte de o căsătorie
          în străinătate.
        </li>
      </ul>
      <p>
        Dacă ai pierdut certificatul existent, ai nevoie de un <strong>duplicat</strong>, nu de o
        transcriere și nici de o copie legalizată (aceasta din urmă presupune să mai ai documentul
        original la îndemână).
      </p>

      <h2>Greșeli frecvente și ce trebuie să știi</h2>
      <ul>
        <li>
          <strong>Aștepți „refacerea” actului vechi.</strong> Nu se reface nimic — primești un
          document nou, original. Cere direct un duplicat.
        </li>
        <li>
          <strong>Crezi că ambii soți trebuie să fie prezenți.</strong> Este suficient actul de
          identitate al unuia dintre soți.
        </li>
        <li>
          <strong>Te deplasezi inutil la primăria unde te-ai căsătorit.</strong> Din 2023, cererea se
          poate depune la orice primărie din țară.
        </li>
        <li>
          <strong>Lași totul pe ultima sută de metri.</strong> Cu un termen de aproximativ 30 de
          zile, depune cererea din timp dacă ai nevoie de document pentru un dosar cu termen.
        </li>
        <li>
          <strong>Confunzi duplicatul cu transcrierea.</strong> Pentru o căsătorie din străinătate
          ai nevoie de transcriere, nu de duplicat.
        </li>
      </ul>

      <h2>Alte demersuri de stare civilă utile</h2>
      <p>
        Dacă rezolvi mai multe acte odată, îți pot fi de folos și ghidurile pentru{' '}
        <Link href="/servicii/eliberare-certificat-de-nastere/">
          eliberarea certificatului de naștere
        </Link>{' '}
        sau, în caz de pierdere a actului de naștere, articolul despre{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificat de naștere pierdut</Link>. Pentru
        cei care au nevoie de documente legate de firmă, există și{' '}
        <Link href="/servicii/certificat-constatator-online/">
          certificatul constatator online
        </Link>
        . Iar dacă mergi pe la notar pentru autentificări sau legalizări, poți estima costurile cu{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
      </p>

      <h2>Concluzie</h2>
      <p>
        Un certificat de căsătorie pierdut nu este o problemă greu de rezolvat: soliciți un{' '}
        <strong>duplicat</strong> la Starea Civilă, cu acte puține — în esență actul de identitate al
        unuia dintre soți — și costuri mici, adesea zero. Din 2023 poți depune cererea la orice
        primărie, iar termenul uzual este de aproximativ 30 de zile. Diferența o face modul în care
        depui cererea: la ghișeu, cu deplasare și așteptare, sau{' '}
        <Link href="/servicii/eliberare-certificat-de-casatorie/">
          online, prin împuternicit, pe eGhișeul.ro
        </Link>
        , fără să pleci de acasă.
      </p>
    </ArticleLayout>
  );
}
