import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'acte-necesare-casatorie';
const TITLE = 'Acte Necesare Căsătorie: Dosarul Complet la Starea Civilă';
const DESCRIPTION =
  'Ghid complet cu actele necesare pentru căsătorie: declarația se depune personal de ambii soți, cu cel puțin 10 zile înainte. Certificate medicale prenupțiale, acte de identitate, certificate de naștere și cazurile speciale.';
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
          q: 'Cu cât timp înainte trebuie depusă declarația de căsătorie?',
          a: 'Declarația de căsătorie se depune cu cel puțin 10 zile înainte de data oficierii. La calculul termenului se numără atât ziua în care depui declarația, cât și ziua în care se oficiază căsătoria. De aceea, este recomandat să mergi la starea civilă cu o marjă de timp, ca să nu fii nevoit să amâni data.',
        },
        {
          q: 'Certificatul medical prenupțial este obligatoriu?',
          a: 'Da, certificatul medical prenupțial este obligatoriu pentru ambii viitori soți. Atenție la valabilitate: certificatul este valabil 14 zile de la data emiterii, deci trebuie să fie încă valabil în ziua oficierii căsătoriei, nu doar în ziua depunerii dosarului.',
        },
        {
          q: 'Ce acte trebuie să depună un cetățean străin care se căsătorește în România?',
          a: 'Un cetățean străin are nevoie de pașaport (valabil), de certificatul de cutumă — adică dovada eliberată de autoritatea sau ambasada țării sale că poate încheia o căsătorie în România — și de traducerea legalizată a acestor documente. Lista exactă poate varia în funcție de țara de origine.',
        },
        {
          q: 'Pot depune declarația de căsătorie prin împuternicit?',
          a: 'Nu. Declarația de căsătorie se depune personal de către ambii viitori soți, împreună, la serviciul de stare civilă al localității unde se va oficia căsătoria. Nu se poate depune prin împuternicit sau de către un singur partener.',
        },
        {
          q: 'Am nevoie de certificat de celibat ca să mă căsătoresc în România?',
          a: 'Pentru o căsătorie oficiată în România, cetățenii români nu au nevoie de certificat de celibat. Acest document este cerut de regulă cetățenilor români care se căsătoresc în străinătate, ca dovadă pentru autoritățile de acolo că nu sunt deja căsătoriți.',
        },
      ]}
    >
      <p>
        Înainte de marea zi, urmează un pas administrativ care nu trebuie lăsat pe ultima sută de
        metri: <strong>depunerea dosarului de căsătorie la starea civilă</strong>. Procedura nu este
        complicată, dar are reguli ferme de termen și de valabilitate a actelor, iar o greșeală poate
        însemna amânarea oficierii. În acest ghid găsești exact <strong>ce acte îți trebuie</strong>,
        când și unde se depun, plus cazurile speciale (divorț anterior, deces al fostului soț, cetățeni
        străini).
      </p>

      <h2>Unde și cum se depune declarația de căsătorie</h2>
      <p>
        Declarația de căsătorie se depune <strong>personal, de ambii viitori soți</strong>, împreună,
        la <strong>serviciul de stare civilă al localității în care se va oficia</strong> căsătoria.
        Nu se poate depune prin împuternicit și nici de către un singur partener — prezența amândurora
        este obligatorie.
      </p>
      <p>
        Regula de aur este termenul: declarația trebuie depusă cu <strong>cel puțin 10 zile</strong>{' '}
        înainte de data oficierii. La calculul acestor 10 zile se numără atât ziua depunerii, cât și
        ziua oficierii. Practic, dacă vrei o nuntă la o anumită dată, fă-ți o marjă de siguranță și
        depune dosarul mai devreme, ca nu cumva o valabilitate expirată sau un act lipsă să te oblige
        să o iei de la capăt.
      </p>

      <h2>Actele necesare pentru căsătorie</h2>
      <p>
        Dosarul de bază, valabil pentru cetățenii români, cuprinde următoarele documente, pentru{' '}
        <strong>fiecare dintre cei doi viitori soți</strong>:
      </p>
      <ul>
        <li>
          <strong>actele de identitate</strong> (buletin / carte de identitate) — în termen de
          valabilitate;
        </li>
        <li>
          <strong>certificatele de naștere</strong> — în original și copie;
        </li>
        <li>
          <strong>certificatele medicale prenupțiale</strong> — obligatorii, valabile{' '}
          <strong>14 zile</strong> de la data emiterii;
        </li>
        <li>
          <strong>declarația de căsătorie</strong>, completată la ghișeu în momentul depunerii.
        </li>
      </ul>
      <p>
        Pe lângă acestea, în funcție de situația fiecăruia, pot fi necesare și{' '}
        <strong>acte suplimentare</strong> pe care le detaliem mai jos (divorț anterior, văduvie,
        cetățenie străină).
      </p>

      <h2>Atenție la certificatul medical prenupțial</h2>
      <p>
        Cel mai des întâlnit motiv de amânare este <strong>certificatul medical prenupțial</strong>.
        Reține două lucruri:
      </p>
      <ul>
        <li>
          este <strong>obligatoriu pentru ambii</strong> viitori soți, nu doar pentru unul;
        </li>
        <li>
          are o valabilitate scurtă, de doar <strong>14 zile</strong> de la emitere — și trebuie să
          fie valabil în <strong>ziua oficierii</strong>, nu doar în ziua depunerii.
        </li>
      </ul>
      <p>
        Cu alte cuvinte, nu îți face certificatul medical prea devreme. Sincronizează-l cu data
        depunerii și cu cele cel puțin 10 zile până la oficiere, astfel încât în ziua nunții să fie
        încă valabil.
      </p>

      <h2>Cazuri speciale: divorț, văduvie, vârstă</h2>
      <p>
        Dacă unul dintre viitorii soți a mai fost căsătorit, dosarul trebuie completat cu{' '}
        <strong>dovada că fosta căsătorie a fost desfăcută</strong>:
      </p>
      <ul>
        <li>
          <strong>sentința de divorț</strong> (sau certificatul/actul care atestă desfacerea
          căsătoriei anterioare), dacă persoana a fost divorțată;
        </li>
        <li>
          <strong>certificatul de deces al fostului soț</strong>, dacă persoana este văduvă.
        </li>
      </ul>
      <p>
        În privința vârstei, regula este simplă: <strong>vârsta minimă pentru căsătorie este 18 ani</strong>.
        Prin excepție, un minor de <strong>16 ani</strong> se poate căsători cu încuviințare, în
        condițiile legii. Sub această vârstă, căsătoria nu este permisă.
      </p>

      <h2>Cetățeni străini care se căsătoresc în România</h2>
      <p>
        Dacă unul dintre viitorii soți este cetățean străin, pe lângă regulile generale, dosarul
        include documente specifice:
      </p>
      <ul>
        <li>
          <strong>pașaportul</strong> valabil;
        </li>
        <li>
          <strong>certificatul de cutumă</strong> — dovada eliberată de autoritatea competentă sau de
          ambasada țării sale că <strong>poate încheia căsătoria</strong> (echivalentul unei dovezi de
          capacitate matrimonială);
        </li>
        <li>
          <strong>traducerea legalizată</strong> a documentelor emise în străinătate.
        </li>
      </ul>
      <p>
        Lista exactă poate diferi în funcție de țara de origine a partenerului străin, așa că merită
        verificată din timp la starea civilă unde se va oficia.
      </p>

      <h2>Tabel rezumat: actele pe scurt</h2>
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Detaliu important</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Act de identitate</td>
            <td>În termen de valabilitate, pentru fiecare soț</td>
          </tr>
          <tr>
            <td>Certificat de naștere</td>
            <td>Original + copie</td>
          </tr>
          <tr>
            <td>Certificat medical prenupțial</td>
            <td>Obligatoriu pentru ambii; valabil 14 zile de la emitere</td>
          </tr>
          <tr>
            <td>Sentință de divorț</td>
            <td>Doar dacă a existat o căsătorie anterioară desfăcută prin divorț</td>
          </tr>
          <tr>
            <td>Certificat de deces fost soț</td>
            <td>Doar în caz de văduvie</td>
          </tr>
          <tr>
            <td>Pașaport + certificat de cutumă + traducere legalizată</td>
            <td>Pentru cetățeni străini</td>
          </tr>
        </tbody>
      </table>

      <h2>Exemplu: o nuntă programată în trei săptămâni</h2>
      <p>
        Maria și Andrei au stabilit oficierea pentru o sâmbătă. Pentru a respecta termenul de cel
        puțin 10 zile, depun declarația cu aproape două săptămâni înainte, marți. Își fac certificatele
        medicale prenupțiale cu câteva zile înainte de depunere, astfel încât acestea să fie încă
        valabile în ziua nunții, în limita celor 14 zile. Andrei, care a mai fost căsătorit, adaugă la
        dosar sentința de divorț. Totul se închide fără amânări tocmai pentru că au sincronizat
        valabilitatea actelor cu data oficierii.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Depui declarația prea târziu.</strong> Termenul de cel puțin 10 zile include și
          ziua depunerii, și ziua oficierii — nu lăsa dosarul pe ultima sută de metri.
        </li>
        <li>
          <strong>Faci certificatul medical prea devreme.</strong> Cu valabilitate de doar 14 zile,
          riști să expire înainte de oficiere. Sincronizează-l cu data nunții.
        </li>
        <li>
          <strong>Crezi că poate depune un singur partener.</strong> Declarația se depune personal, de
          ambii viitori soți, împreună.
        </li>
        <li>
          <strong>Uiți actele din cazurile speciale.</strong> Sentința de divorț sau certificatul de
          deces al fostului soț sunt indispensabile dacă a existat o căsătorie anterioară.
        </li>
        <li>
          <strong>Confunzi certificatul de celibat cu dosarul de căsătorie din România.</strong> Pentru
          o căsătorie în România nu îți trebuie certificat de celibat; el e cerut românilor care se
          căsătoresc în străinătate.
        </li>
      </ul>

      <h2>Și după căsătorie: certificatul de căsătorie</h2>
      <p>
        După oficiere, primești <strong>certificatul de căsătorie</strong>, documentul care atestă
        noul tău statut. Dacă ulterior îl pierzi, se deteriorează sau ai nevoie de un nou exemplar,
        poți obține un{' '}
        <Link href="/duplicat-certificat-de-casatorie/">duplicat al certificatului de căsătorie</Link>.
        Iar dacă te-ai căsătorit în străinătate și ai nevoie ca acea căsătorie să fie recunoscută în
        România, vei avea de parcurs o{' '}
        <Link href="/transcriere-certificat-de-casatorie/">
          transcriere a certificatului de căsătorie
        </Link>
        .
      </p>
      <p>
        Pentru eliberarea sau obținerea online a documentelor de stare civilă, vezi paginile dedicate
        de{' '}
        <Link href="/servicii/eliberare-certificat-de-casatorie/">
          eliberare certificat de căsătorie
        </Link>{' '}
        și{' '}
        <Link href="/servicii/eliberare-certificat-de-nastere/">
          eliberare certificat de naștere
        </Link>
        .
      </p>

      <h2>Despre certificatul de celibat</h2>
      <p>
        Mențiunea este importantă pentru a evita confuziile: <strong>certificatul de celibat</strong>{' '}
        nu face parte din dosarul unei căsătorii oficiate în România. El este necesar{' '}
        <strong>românilor care se căsătoresc în străinătate</strong>, ca dovadă pentru autoritățile de
        acolo că nu sunt deja căsătoriți. Dacă te afli în această situație, vezi ghidul despre{' '}
        <Link href="/certificat-de-celibat/">certificatul de celibat</Link> sau pagina de{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">
          eliberare certificat de celibat
        </Link>
        .
      </p>

      <h2>Ce trebuie să reții pe scurt</h2>
      <ul>
        <li>Declarația se depune personal, de ambii soți, cu cel puțin 10 zile înainte de oficiere.</li>
        <li>Termenul include ziua depunerii și ziua oficierii.</li>
        <li>Acte de bază: identitate valabilă, certificat de naștere (original + copie), certificat medical prenupțial.</li>
        <li>Certificatul medical prenupțial e obligatoriu și valabil doar 14 zile.</li>
        <li>Cazuri speciale: sentință de divorț, certificat de deces al fostului soț, dovada desfacerii căsătoriei anterioare.</li>
        <li>Cetățeni străini: pașaport, certificat de cutumă și traducere legalizată.</li>
        <li>Vârsta minimă: 18 ani (16 ani cu încuviințare).</li>
      </ul>
    </ArticleLayout>
  );
}
