import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'valabilitate-certificat-de-celibat';
const TITLE = 'Valabilitate Certificat de Celibat: 6 Luni în România, 90 de Zile în Străinătate';
const DESCRIPTION =
  'Cât e valabil certificatul de celibat (Anexa 9): 6 luni în România și 90 de zile (3 luni) când îl prezinți în străinătate pentru căsătorie. Vezi de ce diferă și ce verifici.';
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
      publishedLabel="22 iunie 2026"
      updatedLabel="22 iunie 2026"
      relatedServices={[
        {
          href: '/servicii/eliberare-certificat-de-celibat/',
          label: 'Certificat de Celibat Online',
          desc: 'Obține certificatul de celibat (Anexa 9) online, prin împuternicire, fără drum la Starea Civilă.',
        },
        {
          href: '/servicii/eliberare-certificat-de-casatorie/',
          label: 'Certificat de Căsătorie Online',
          desc: 'Duplicat de certificat de căsătorie solicitat online și livrat prin curier.',
        },
      ]}
      faqs={[
        {
          q: 'Cât este valabil certificatul de celibat?',
          a: 'Sunt două valori, ambele corecte în funcție de unde îl folosești. Pentru utilizarea în România, valabilitatea practică este de 6 luni de la data eliberării. Atunci când îl prezinți în străinătate pentru încheierea căsătoriei, autoritățile și consulatele MAE îl acceptă de regulă cu o valabilitate de 90 de zile (3 luni). Verifică întotdeauna cerința exactă a autorității care îl solicită.',
        },
        {
          q: 'De ce este valabil 6 luni în România, dar doar 90 de zile în străinătate?',
          a: 'Documentul în sine este același (Anexa 9). Diferența vine din regula autorității care îl primește: în România practica uzuală acceptă certificatul timp de 6 luni, în timp ce multe autorități și consulate din străinătate impun un termen mai scurt, de 90 de zile, pentru a se asigura că situația de stare civilă este cât mai recentă la momentul căsătoriei.',
        },
        {
          q: 'De la ce dată se calculează valabilitatea?',
          a: 'Termenul se calculează de la data eliberării înscrise pe certificat, nu de la data la care depui dosarul de căsătorie. De aceea este recomandat să soliciți certificatul cu puțin timp înainte de a-l folosi, ca să nu expire în timpul demersurilor.',
        },
        {
          q: 'Ce verific la autoritatea care îmi cere certificatul de celibat?',
          a: 'Verifică trei lucruri: termenul de valabilitate acceptat (6 luni sau 90 de zile), dacă au nevoie de apostilă și dacă au nevoie de traducere autorizată. Aceste cerințe diferă de la o țară la alta și chiar de la o primărie sau un consulat la altul.',
        },
        {
          q: 'Pot obține certificatul de celibat din străinătate, fără să mă întorc în țară?',
          a: 'Da. Prin eGhișeul.ro depunem cererea prin împuternicire la Starea Civilă competentă și îți trimitem certificatul de celibat prin curier, oriunde te afli. La nevoie gestionăm și apostila și traducerea autorizată, ca să primești un dosar complet.',
        },
      ]}
    >
      <p>
        Cea mai frecventă întrebare legată de <strong>certificatul de celibat</strong> (numit oficial{' '}
        <strong>Anexa 9</strong>) nu este cum îl obții, ci <strong>cât timp rămâne valabil</strong>. Iar
        răspunsul corect nu este unul singur, ci <strong>două valori</strong>, ambele valabile în funcție
        de locul în care folosești documentul:
      </p>
      <ul>
        <li>
          <strong>6 luni</strong> — valabilitatea practică atunci când certificatul este folosit{' '}
          <strong>în România</strong>;
        </li>
        <li>
          <strong>90 de zile (3 luni)</strong> — termenul acceptat de regulă atunci când documentul este
          prezentat <strong>în străinătate</strong>, pentru încheierea căsătoriei, confirmat de
          consulatele MAE.
        </li>
      </ul>
      <p>
        Dacă te uiți pe alte site-uri, vei vedea de obicei doar una dintre aceste cifre — și de aici
        confuzia. În realitate <strong>ambele sunt corecte</strong>; depinde doar cine îți cere
        documentul. Mai jos îți explicăm de ce diferă termenele, cum calculezi corect valabilitatea și
        ce trebuie să verifici înainte să depui certificatul.
      </p>

      <h2>Ce este certificatul de celibat (Anexa 9)</h2>
      <p>
        Certificatul de celibat este documentul prin care Serviciul de Stare Civilă atestă că o persoană{' '}
        <strong>nu este căsătorită</strong> la data eliberării. În practică, mai poartă și numele de{' '}
        <em>dovadă de celibat</em> sau <em>certificat de stare civilă</em>, iar forma sa oficială este{' '}
        <strong>Anexa 9</strong>. Este cerut aproape întotdeauna atunci când vrei să te căsătorești{' '}
        <strong>în străinătate</strong>, dar și în anumite proceduri din România unde trebuie dovedit că
        ești liber de orice impediment legal pentru încheierea unei noi căsătorii.
      </p>
      <p>
        Spre deosebire de un certificat de naștere — care nu expiră niciodată — certificatul de celibat
        are o valabilitate limitată tocmai pentru că atestă o <strong>situație care se poate schimba</strong>:
        starea ta civilă de astăzi nu garantează că vei fi în aceeași situație peste un an. De aici vine
        întreaga logică a termenelor de valabilitate.
      </p>

      <h2>Cele două valabilități, pe scurt</h2>
      <p>
        Pentru a nu greși, reține tabelul de mai jos. El sintetizează cele două situații în care vei
        folosi cel mai des certificatul de celibat:
      </p>
      <table>
        <thead>
          <tr>
            <th>Unde folosești certificatul</th>
            <th>Valabilitate uzuală</th>
            <th>Observații</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>În România</td>
            <td>
              <strong>6 luni</strong>
            </td>
            <td>Valabilitatea practică acceptată de autoritățile române.</td>
          </tr>
          <tr>
            <td>În străinătate (pentru căsătorie)</td>
            <td>
              <strong>90 de zile (3 luni)</strong>
            </td>
            <td>Termen confirmat de consulatele MAE; verifică cerința exactă a autorității străine.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ambele valori se calculează de la <strong>data eliberării</strong> înscrise pe certificat. Cu
        alte cuvinte, ceasul pornește în momentul în care primești documentul, nu în momentul în care îl
        depui la primărie, la notar sau la consulat.
      </p>

      <h2>De ce diferă cele două termene</h2>
      <p>
        Mulți se întreabă cum poate avea <strong>același document</strong> două valabilități diferite.
        Explicația este simplă: <strong>documentul este identic (Anexa 9)</strong>, dar regula de
        valabilitate o stabilește <strong>autoritatea care îl primește</strong>, nu cea care îl emite.
      </p>
      <ul>
        <li>
          <strong>În România</strong>, practica uzuală acceptă certificatul de celibat timp de{' '}
          <strong>6 luni</strong> de la eliberare. Este un termen rezonabil pentru demersurile interne,
          în care evidențele de stare civilă pot fi reverificate ușor.
        </li>
        <li>
          <strong>În străinătate</strong>, multe autorități și ofițeri de stare civilă impun un termen
          mai scurt, de <strong>90 de zile</strong>, tocmai pentru că nu pot reverifica direct
          evidențele românești. Ei vor o dovadă cât mai <strong>recentă</strong> că ești încă liber la
          momentul căsătoriei, iar consulatele MAE confirmă acest termen de 3 luni pentru dosarele de
          căsătorie în afara țării.
        </li>
      </ul>
      <p>
        Pe scurt: <strong>cu cât autoritatea este mai „departe” de evidențele de stare civilă din
        România, cu atât vrea un document mai proaspăt.</strong> De aceea, când te căsătorești afară,
        regula prudentă este să te raportezi la 90 de zile, nu la 6 luni.
      </p>

      <h2>Cum calculezi corect valabilitatea</h2>
      <p>Pentru a evita surprizele, ține minte aceste reguli simple:</p>
      <ul>
        <li>
          termenul curge de la <strong>data eliberării</strong> de pe certificat, nu de la data
          solicitării și nici de la data depunerii dosarului;
        </li>
        <li>
          contează ziua în care <strong>autoritatea primește</strong> documentul, nu ziua în care ai
          început tu demersurile — dacă programarea pentru căsătorie este peste câteva săptămâni, lasă o
          marjă;
        </li>
        <li>
          dacă ai nevoie de <strong>apostilă</strong> și de o <strong>traducere autorizată</strong>,
          adaugă timpul necesar acestor pași la calcul, ca documentul să nu expire între timp.
        </li>
      </ul>
      <p>
        <strong>Exemplu.</strong> Vrei să te căsătorești în Italia, iar primăria de acolo acceptă
        certificatul de celibat cu valabilitate de 90 de zile. Dacă îl obții pe 1 martie, el este în
        regulă pentru o căsătorie programată până pe 30 mai. Dacă nunta este planificată pentru iulie,
        certificatul emis în martie va fi deja expirat în ochii autorității italiene — chiar dacă în
        România ar mai fi fost considerat valabil până în septembrie. Concluzia: <strong>solicită
        certificatul aproape de momentul în care îl folosești</strong>, nu cu luni înainte.
      </p>

      <h2>Ce trebuie să verifici la autoritatea care îl cere</h2>
      <p>
        Înainte să depui certificatul de celibat, întreabă <strong>direct autoritatea</strong> care îl
        solicită (primărie, ofițer de stare civilă din străinătate, consulat sau notar) trei lucruri
        esențiale:
      </p>
      <ul>
        <li>
          <strong>Ce valabilitate acceptă</strong> — 6 luni, 90 de zile sau, în cazuri particulare, un
          alt termen pe care îl impun ei.
        </li>
        <li>
          <strong>Dacă au nevoie de apostilă</strong> — pentru folosirea în multe state, certificatul
          trebuie apostilat pentru a fi recunoscut oficial.
        </li>
        <li>
          <strong>Dacă au nevoie de traducere autorizată</strong> — în limba țării respective, uneori
          chiar tradusă și legalizată la rândul ei.
        </li>
      </ul>
      <p>
        Aceste cerințe <strong>diferă de la o țară la alta</strong> și uneori chiar de la o primărie la
        alta. O întrebare în plus la început îți poate economisi un drum și banii pe un certificat
        expirat sau incomplet.
      </p>

      <h2>Greșeli frecvente legate de valabilitate</h2>
      <ul>
        <li>
          <strong>„Am citit că e valabil 6 luni, deci e bun și afară.”</strong> Nu neapărat. În
          străinătate se aplică des termenul de 90 de zile, deci un certificat de 5 luni vechime poate fi
          refuzat la un consulat sau la o primărie din afara țării.
        </li>
        <li>
          <strong>Calculul de la data greșită.</strong> Valabilitatea curge de la data eliberării, nu de
          la data depunerii dosarului — dacă întârzii cu programarea, riști să-l folosești expirat.
        </li>
        <li>
          <strong>Obținerea prea devreme.</strong> Mulți îl iau „să fie”, cu luni înainte de nuntă, și
          descoperă apoi că a expirat. Mai bine îl soliciți aproape de eveniment.
        </li>
        <li>
          <strong>Uitarea apostilei și a traducerii.</strong> Chiar dacă certificatul este în termen,
          fără apostilă și traducere autorizată poate fi respins de autoritatea străină.
        </li>
      </ul>

      <h2>Cum obții certificatul de celibat online, prin eGhișeul.ro</h2>
      <p>
        Pentru că termenele sunt limitate, contează să nu pierzi timp cu deplasări și cozi. Prin{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">eGhișeul.ro</Link> obții certificatul de
        celibat (Anexa 9) fără drum la ghișeu:
      </p>
      <ul>
        <li>completezi datele în formularul online, în câteva minute;</li>
        <li>semnezi împuternicirea direct în aplicație și achiți cu cardul;</li>
        <li>depunem cererea la Starea Civilă competentă, în numele tău;</li>
        <li>primești certificatul prin curier, cu tracking pe email.</li>
      </ul>
      <p>
        Este aceeași soluție validă și pentru românii din <strong>diaspora</strong>, care altfel ar
        trebui să se întoarcă în țară doar pentru un act. La nevoie ne ocupăm și de{' '}
        <strong>apostilă</strong> și de <strong>traducerea autorizată</strong>, ca să primești un dosar
        complet, gata de depus la autoritatea din străinătate. Pentru că certificatul de celibat are o
        valabilitate scurtă, îți recomandăm să îl soliciți cât mai aproape de momentul în care îl
        folosești.
      </p>

      <h2>Documente conexe de care ai putea avea nevoie</h2>
      <p>Pentru un dosar de căsătorie complet, ai putea avea nevoie și de:</p>
      <ul>
        <li>
          <Link href="/servicii/eliberare-certificat-de-nastere/">certificat de naștere</Link> — sau
          duplicatul lui, dacă l-ai{' '}
          <Link href="/certificat-de-nastere-pierdut/">pierdut</Link>;
        </li>
        <li>
          <Link href="/servicii/eliberare-certificat-de-casatorie/">certificat de căsătorie</Link> —
          util în special pentru recăsătorire sau pentru recunoașterea unei căsătorii în străinătate;
        </li>
        <li>
          o estimare a costurilor notariale, dacă ai nevoie de copii legalizate sau de alte acte — vezi{' '}
          <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
        </li>
      </ul>

      <h2>Concluzie</h2>
      <p>
        Valabilitatea certificatului de celibat are <strong>două răspunsuri corecte</strong>:{' '}
        <strong>6 luni</strong> pentru folosirea în România și <strong>90 de zile</strong> atunci când îl
        prezinți în străinătate pentru căsătorie. Documentul este același (Anexa 9); diferă doar regula
        autorității care îl primește. Calculează termenul de la data eliberării, verifică din timp ce
        valabilitate, apostilă și traducere îți cere autoritatea — și solicită certificatul aproape de
        momentul folosirii. Iar dacă vrei să eviți drumurile, poți obține totul{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">online, prin eGhișeul.ro</Link>.
      </p>
    </ArticleLayout>
  );
}
