import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'duplicat-certificat-de-nastere';
const TITLE = 'Duplicat Certificat de Naștere: Cum Îl Obții de la Orice Primărie';
const DESCRIPTION =
  'Ghid complet pentru duplicatul certificatului de naștere: din 2023 îl ceri de la orice primărie cu stare civilă, în ~30 de zile, adesea gratuit. Acte, pași și varianta online.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';
const OGIMAGE = '/og/services/certificat-nastere.png';

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
          q: 'De unde pot cere duplicatul certificatului de naștere?',
          a: 'Din 2023, poți solicita duplicatul certificatului de naștere de la orice primărie care are serviciu de stare civilă, nu doar de la primăria din localitatea unde te-ai născut. Practic, te poți adresa primăriei celei mai apropiate de tine sau, prin împuternicit, poți depune cererea online.',
        },
        {
          q: 'În cât timp se eliberează duplicatul?',
          a: 'Termenul uzual este de aproximativ 30 de zile, pentru că primăria la care depui cererea trebuie să verifice și să obțină datele actului de naștere din registrele de stare civilă. La unele ghișee și pentru localitatea de naștere, eliberarea poate fi mai rapidă.',
        },
        {
          q: 'Cât costă un duplicat de certificat de naștere?',
          a: 'Eliberarea duplicatului este, în multe primării, gratuită sau cu o taxă simbolică de stare civilă. Dacă alegi varianta online, prin împuternicit, costul afișat acoperă întocmirea și depunerea cererii, taxele și livrarea documentului prin curier.',
        },
        {
          q: 'Ce acte îmi trebuie pentru duplicat?',
          a: 'În principiu ai nevoie de actul de identitate valabil și de o cerere tip pentru eliberarea duplicatului. Dacă depui cererea prin altcineva sau online, este nevoie și de o împuternicire.',
        },
        {
          q: 'Care e diferența dintre „duplicat" și „certificat pierdut"?',
          a: 'Duplicatul este pur și simplu un nou exemplar original al certificatului de naștere, cerut indiferent de motiv (pierdere, deteriorare, furt sau nevoia unui al doilea exemplar). „Certificat pierdut" descrie o situație anume; soluția este tot un duplicat. Vezi ghidul dedicat pentru cazul în care ai pierdut documentul.',
        },
      ]}
    >
      <p>
        Ai nevoie de un nou exemplar al certificatului de naștere? Indiferent dacă l-ai pierdut, s-a
        deteriorat sau pur și simplu îți trebuie încă un original pentru un dosar, soluția este{' '}
        <strong>duplicatul certificatului de naștere</strong> — un certificat nou, cu aceeași valoare
        juridică, emis de Serviciul de Stare Civilă pe baza actului de naștere existent deja în
        registre. Vestea bună este că, din <strong>2023</strong>, procedura a devenit mult mai simplă:
        poți cere duplicatul de la <strong>orice primărie</strong> cu serviciu de stare civilă, nu
        doar de la cea din localitatea de naștere.
      </p>

      <h2>Ce înseamnă duplicat de certificat de naștere</h2>
      <p>
        Actul de naștere rămâne înregistrat permanent în registrele Stării Civile. Atunci când ceri un
        duplicat, nu se „reface” nimic și nu primești o copie — primești un{' '}
        <strong>certificat de naștere nou și original</strong>, identic ca valoare cu cel pe care îl
        aveai. Din acest motiv, duplicatul poate fi folosit oriunde îți era cerut certificatul
        inițial: la bancă, la notar, în dosare administrative sau pentru actele de identitate.
      </p>
      <p>
        Termenul „duplicat” este, de fapt, mai larg decât situația în care ai pierdut documentul. Ceri
        un duplicat și când:
      </p>
      <ul>
        <li>certificatul s-a <strong>deteriorat</strong> (rupt, șters, plastifiat greșit);</li>
        <li>ți-a fost <strong>furat</strong> împreună cu alte acte;</li>
        <li>ai nevoie de un <strong>al doilea exemplar</strong> pentru un dosar paralel;</li>
        <li>vechiul certificat are un model depășit și vrei unul actualizat.</li>
      </ul>
      <p>
        Dacă situația ta este strict aceea de a fi <strong>pierdut</strong> documentul, ai un ghid
        separat, mai detaliat, despre pașii specifici:{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificat de naștere pierdut</Link>.
      </p>

      <h2>Noutatea din 2023: orice primărie, nu doar cea de la naștere</h2>
      <p>
        Până nu demult, pentru un duplicat trebuia să te adresezi primăriei din localitatea unde fusese
        înregistrată nașterea — un drum dificil pentru cei mutați departe de orașul natal sau plecați
        din țară. Din <strong>2023</strong>, poți depune cererea la <strong>orice primărie</strong>{' '}
        care are serviciu de stare civilă. Primăria la care te adresezi obține datele actului de
        naștere din registre și îți eliberează duplicatul.
      </p>
      <p>
        Această schimbare este importantă pentru două categorii de oameni:
      </p>
      <ul>
        <li>
          cei care <strong>locuiesc în alt oraș</strong> decât cel de naștere și nu mai vor să facă un
          drum special;
        </li>
        <li>
          românii din <strong>diaspora</strong>, care pot rezolva totul printr-un împuternicit, fără
          să se întoarcă în țară.
        </li>
      </ul>

      <h2>Acte necesare pentru duplicatul certificatului de naștere</h2>
      <p>De regulă, ai nevoie de un set minim de documente:</p>
      <ul>
        <li>
          <strong>act de identitate valabil</strong> al titularului sau al solicitantului;
        </li>
        <li>
          <strong>cerere tip</strong> pentru eliberarea duplicatului (o completezi la ghișeu sau, în
          cazul serviciului online, o întocmim noi);
        </li>
        <li>
          <strong>împuternicire</strong>, dacă cererea este depusă de altcineva în numele tău —
          obligatorie pentru varianta online sau pentru diaspora.
        </li>
      </ul>
      <p>
        Lista exactă poate diferi ușor de la o primărie la alta, însă în esență duplicatul se obține cu
        actul de identitate și o cerere. Pentru o listă pe larg, vezi{' '}
        <Link href="/acte-necesare-certificat-de-nastere/">actele necesare pentru certificatul de naștere</Link>.
      </p>

      <h2>În cât timp se eliberează și cât costă</h2>
      <p>
        Pentru că primăria la care depui cererea trebuie să verifice și să preia datele din registrele
        de stare civilă, termenul uzual este de aproximativ <strong>30 de zile</strong>. La ghișeul din
        localitatea de naștere, eliberarea poate fi mai rapidă, uneori chiar în aceeași zi.
      </p>
      <p>
        Din punct de vedere al costului, eliberarea duplicatului este în multe primării{' '}
        <strong>gratuită</strong> sau cu o taxă de stare civilă simbolică. Iată o comparație rapidă a
        celor două variante:
      </p>
      <table>
        <thead>
          <tr>
            <th>Aspect</th>
            <th>La ghișeu</th>
            <th>Online, prin împuternicit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Deplasare</td>
            <td>Da, te prezinți personal</td>
            <td>Nu, totul de acasă</td>
          </tr>
          <tr>
            <td>Taxa de stare civilă</td>
            <td>Adesea gratuit sau simbolic</td>
            <td>Inclusă în costul serviciului</td>
          </tr>
          <tr>
            <td>Termen</td>
            <td>~30 de zile (mai rapid la localitatea de naștere)</td>
            <td>~30 de zile + livrare prin curier</td>
          </tr>
          <tr>
            <td>Potrivit pentru diaspora</td>
            <td>Greu, necesită prezență</td>
            <td>Da, prin împuternicire</td>
          </tr>
        </tbody>
      </table>

      <h2>Cum obții duplicatul online, prin eGhișeul.ro</h2>
      <p>
        Dacă nu vrei să te deplasezi și să aștepți la coadă, poți obține duplicatul{' '}
        <strong>online</strong>, printr-un împuternicit. Procesul are doar câțiva pași:
      </p>
      <ul>
        <li>completezi datele titularului în formularul online (2–3 minute);</li>
        <li>semnezi împuternicirea direct în aplicație și achiți cu cardul;</li>
        <li>depunem cererea la o primărie cu stare civilă, în numele tău;</li>
        <li>primești duplicatul original prin curier, cu tracking pe email.</li>
      </ul>
      <p>
        Detaliile complete și costul curent le vezi pe pagina de{' '}
        <Link href="/servicii/eliberare-certificat-de-nastere/">
          eliberare certificat de naștere online
        </Link>
        . Aceeași logică se aplică și pentru alte documente de stare civilă, cum ar fi{' '}
        <Link href="/servicii/eliberare-certificat-de-casatorie/">certificatul de căsătorie</Link> sau{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">certificatul de celibat</Link>.
      </p>

      <h2>Exemplu: un român plecat în străinătate</h2>
      <p>
        Andrei locuiește de zece ani în Germania și are nevoie urgent de un certificat de naștere
        pentru un dosar la o instituție germană. Înainte de 2023, ar fi trebuit să se întoarcă în
        orașul natal sau să apeleze la consulat. Acum, pe baza unei împuterniciri semnate online,
        cererea se depune la o primărie cu stare civilă din România, iar duplicatul îi este trimis prin
        curier. Pentru folosirea în străinătate, documentul poate avea nevoie de{' '}
        <strong>apostilă</strong> și de o <strong>traducere autorizată</strong>, pași care se pot
        gestiona tot la distanță.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Confunzi duplicatul cu copia legalizată.</strong> Copia legalizată este o fotocopie
          certificată de notar a unui certificat existent; ea nu îți este de folos dacă nu mai ai
          deloc documentul. Pentru a-l înlocui, ai nevoie de duplicat. Dacă te interesează costurile
          unei legalizări, vezi{' '}
          <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
        </li>
        <li>
          <strong>Crezi că trebuie neapărat să mergi în orașul de naștere.</strong> Din 2023 nu mai
          este cazul — te poți adresa oricărei primării cu stare civilă.
        </li>
        <li>
          <strong>Aștepți eliberarea pe loc, peste tot.</strong> Când ceri duplicatul în altă
          localitate, ține cont de termenul de aproximativ 30 de zile, pentru că datele se obțin din
          registre.
        </li>
        <li>
          <strong>Te prezinți fără act de identitate valabil.</strong> Identitatea trebuie dovedită la
          depunere; dacă ai pierdut și buletinul, planifică pașii în ordinea potrivită.
        </li>
      </ul>

      <h2>Ce trebuie să știi pe scurt</h2>
      <ul>
        <li>Duplicatul este un certificat de naștere nou și original, nu o copie.</li>
        <li>Din 2023 îl poți cere de la orice primărie cu serviciu de stare civilă.</li>
        <li>Termenul uzual este de aproximativ 30 de zile.</li>
        <li>Adesea este gratuit sau cu taxă simbolică la ghișeu.</li>
        <li>Online, prin împuternicit, eviți deplasarea — util mai ales pentru diaspora.</li>
      </ul>

      <h2>Concluzie</h2>
      <p>
        Obținerea unui duplicat de certificat de naștere nu mai este o bătaie de cap: din 2023 te poți
        adresa <strong>oricărei primării</strong> cu stare civilă, cu acte puține și, de multe ori,
        gratuit. Diferența o face modul în care depui cererea — personal, la ghișeu, sau{' '}
        <Link href="/servicii/eliberare-certificat-de-nastere/">online, prin eGhișeul.ro</Link>, fără
        să pleci de acasă. Iar dacă ai pierdut efectiv documentul, parcurge și ghidul dedicat despre{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificatul de naștere pierdut</Link>.
      </p>
    </ArticleLayout>
  );
}
