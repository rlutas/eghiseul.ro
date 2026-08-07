import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-de-nastere-pentru-buletin-pasaport';
const TITLE =
  'Certificat de naștere pentru buletin, pașaport, botez sau căsătorie: când se cere (2026)';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Certificat de naștere pentru buletin sau pașaport: când se cere';
const DESCRIPTION =
  'Când ți se cere certificatul de naștere și în ce formă: la buletin se cere în original de ' +
  'fiecare dată, la pașaport de regulă doar pentru minori. Plus ce faci dacă ai pierdut și ' +
  'buletinul, și certificatul de naștere.';
const DATE_PUBLISHED = '2026-08-07';
const DATE_MODIFIED = '2026-08-07';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="august 2026"
      updatedLabel="7 august 2026"
      imageAlt="Bărbat la masa din bucătărie verificând un dosar cu acte înainte de a merge la ghișeu, cu buletinul și certificatul de naștere alături"
      relatedServices={[
        {
          href: '/servicii/eliberare-certificat-de-nastere/',
          label: 'Certificat de naștere',
          desc: 'Un exemplar nou al certificatului de naștere, cerut prin împuternicit, livrat prin curier.',
        },
        {
          href: '/servicii/extras-multilingv-certificat-nastere/',
          label: 'Extras multilingv certificat naștere',
          desc: 'Varianta acceptată direct în statele UE, fără traducere autorizată.',
        },
        {
          href: '/servicii/eliberare-certificat-de-casatorie/',
          label: 'Certificat de căsătorie',
          desc: 'Celălalt act de stare civilă cerut frecvent în aceleași dosare.',
        },
      ]}
      faqs={[
        {
          q: 'Trebuie certificat de naștere pentru buletin?',
          a: 'Da. Certificatul de naștere se cere în original la depunerea dosarului pentru cartea de identitate, atât la prima eliberare, la 14 ani, cât și la orice preschimbare ulterioară. Se prezintă împreună cu o copie, iar originalul îți este restituit după verificare.',
        },
        {
          q: 'Se poate face buletin fără certificat de naștere?',
          a: 'În procedura obișnuită, nu. Fără certificat, serviciul de evidență a persoanelor poate elibera cel mult o carte de identitate provizorie, cu valabilitate limitată. Pentru cartea de identitate definitivă ai nevoie de certificatul de naștere, așa că soluția practică este să ceri mai întâi un exemplar nou al acestuia.',
        },
        {
          q: 'Se poate schimba buletinul fără certificat de naștere?',
          a: 'Nu. Preschimbarea la expirare nu este o excepție: dosarul se depune cu aceleași documente ca la prima eliberare, inclusiv certificatul de naștere în original. Faptul că l-ai depus și acum zece ani nu te scutește, pentru că documentul nu rămâne la ghișeu.',
        },
        {
          q: 'Buletin provizoriu fără certificat de naștere se poate?',
          a: 'Cartea de identitate provizorie există tocmai pentru situațiile în care nu poți prezenta toate documentele necesare. Se eliberează la aprecierea serviciului de evidență a persoanelor, are valabilitate limitată, de regulă până la un an, și îți dă timp să obții certificatul. Nu înlocuiește definitiv cartea de identitate.',
        },
        {
          q: 'Trebuie certificat de naștere pentru pașaport?',
          a: 'Pentru un adult care se prezintă cu cartea de identitate valabilă, de regulă nu. Dosarul obișnuit conține cererea, actul de identitate valabil, dovada plății și pașaportul anterior, dacă există. Certificatul de naștere se cere pentru minori și în situații speciale.',
        },
        {
          q: 'Se poate face pașaport fără certificat de naștere?',
          a: 'Da, în cazul obișnuit al unui adult cu carte de identitate valabilă. Situația se schimbă dacă actul de identitate lipsește sau este expirat, dacă ți-ai schimbat numele, dacă ești cetățean român cu domiciliul în străinătate sau dacă soliciți pașaport pentru un copil. În aceste cazuri se cer și acte de stare civilă.',
        },
        {
          q: 'Trebuie certificat de naștere la pașaport pentru copil?',
          a: 'Da. Pentru minori, certificatul de naștere se prezintă în original, împreună cu actele de identitate ale părinților și cu acordul acestora exprimat în fața funcționarului. Pentru copiii care au deja carte de identitate se prezintă și aceasta.',
        },
        {
          q: 'Trebuie certificat de naștere pentru botez?',
          a: 'Nu este o cerință a statului, ci a parohiei. Preotul are nevoie de datele exacte ale copilului pentru registrul de botez și pentru certificatul de botez, așa că cere de obicei certificatul de naștere sau o copie a lui. Practicile diferă de la o parohie la alta, deci întreabă preotul paroh înainte.',
        },
        {
          q: 'Am pierdut și certificatul de naștere, și buletinul. De unde încep?',
          a: 'Declari pierderea actului de identitate la serviciul de evidență a persoanelor și primești o dovadă. Apoi ceri un exemplar nou al certificatului de naștere, pentru care identitatea se poate proba cu pașaportul sau cu permisul de conducere, iar în lipsa lor prin verificare în evidențele de stare civilă. Cu certificatul obținut, refaci cartea de identitate.',
        },
        {
          q: 'Eliberare certificat de naștere fără buletin se poate?',
          a: 'Da, dar depinde de ce alte documente ai. Ofițerul de stare civilă trebuie să se convingă cine ești: acceptă de regulă pașaportul sau permisul de conducere, iar dacă nu ai niciun act, verifică datele în evidențe. Anunță din start că nu ai act de identitate, ca să îți spună ce dovezi acceptă.',
        },
      ]}
    >
      <p>
        Dacă ai ajuns aici pentru că ți se cere certificatul de naștere într-un alt demers, răspunsul
        scurt este acesta. Pentru cartea de identitate se cere <strong>în original</strong>, de fiecare
        dată, atât la prima eliberare cât și la preschimbare. Pentru pașaport, dacă ești adult și ai
        cartea de identitate valabilă, de regulă <strong>nu</strong> ți se cere. Pentru botez, pentru
        dosarul de căsătorie și pentru înscrierea la școală se cere, dar în forme diferite.
      </p>
      <p>
        Problema reală apare când te uiți după el și nu îl mai găsești. Nu este un blocaj definitiv:
        actul de naștere rămâne înregistrat permanent în registrele de stare civilă, iar tu poți cere
        un exemplar nou. Mai jos ai fiecare situație luată separat, plus cazul care încurcă cel mai
        mult lumea: ai pierdut și buletinul, și certificatul de naștere, și pare că ai nevoie de
        fiecare ca să îl obții pe celălalt.
      </p>

      <h2>Tabelul situațiilor</h2>
      <p>
        Cerințele nu sunt identice de la un ghișeu la altul, dar în practică lucrurile arată așa:
      </p>
      <table>
        <thead>
          <tr>
            <th>Situația</th>
            <th>Se cere certificatul de naștere?</th>
            <th>Original sau copie?</th>
            <th>Observații</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prima carte de identitate, la 14 ani</td>
            <td>Da</td>
            <td>Original și copie</td>
            <td>Minorul se prezintă însoțit de un părinte</td>
          </tr>
          <tr>
            <td>Preschimbare la expirare</td>
            <td>Da</td>
            <td>Original și copie</td>
            <td>Se cere din nou, chiar dacă l-ai depus și acum zece ani</td>
          </tr>
          <tr>
            <td>Carte de identitate pierdută sau furată</td>
            <td>Da</td>
            <td>Original și copie</td>
            <td>Fără el se poate obține doar varianta provizorie</td>
          </tr>
          <tr>
            <td>Carte de identitate provizorie</td>
            <td>Nu neapărat</td>
            <td>Nu se depune</td>
            <td>Soluția pentru cine nu are toate documentele; valabilitate limitată</td>
          </tr>
          <tr>
            <td>Pașaport, adult cu carte de identitate valabilă</td>
            <td>De regulă nu</td>
            <td>Nu se depune</td>
            <td>Actul de identitate valabil acoperă datele de stare civilă</td>
          </tr>
          <tr>
            <td>Pașaport pentru minor</td>
            <td>Da</td>
            <td>Original și copie</td>
            <td>Plus actele părinților și acordul acestora</td>
          </tr>
          <tr>
            <td>Pașaport în situații speciale</td>
            <td>Frecvent da</td>
            <td>Original</td>
            <td>Nume schimbat, domiciliu în străinătate, act de identitate lipsă sau expirat</td>
          </tr>
          <tr>
            <td>Dosar de căsătorie</td>
            <td>Da</td>
            <td>Original și copie</td>
            <td>Pentru amândoi viitorii soți</td>
          </tr>
          <tr>
            <td>Botez</td>
            <td>De regulă da</td>
            <td>Copie, uneori originalul doar la vedere</td>
            <td>Cerință a parohiei, nu a instituțiilor statului</td>
          </tr>
          <tr>
            <td>Înscriere la grădiniță sau la școală</td>
            <td>Da</td>
            <td>Copie certificată după original</td>
            <td>Originalul rămâne la tine</td>
          </tr>
        </tbody>
      </table>

      <h2>Buletin: certificatul de naștere se cere de fiecare dată</h2>
      <p>
        La depunerea dosarului pentru cartea de identitate, serviciul public comunitar de evidență a
        persoanelor verifică datele de stare civilă direct din certificatul de naștere. De aceea
        documentul se prezintă <strong>în original</strong>, împreună cu o copie. Originalul nu rămâne
        la ghișeu, îți este restituit după verificare, dar trebuie să existe fizic în momentul
        depunerii.
      </p>
      <p>
        Regula se aplică în toate variantele: prima carte de identitate la împlinirea vârstei de 14
        ani, preschimbarea la expirare, schimbarea domiciliului, schimbarea numelui după căsătorie sau
        după divorț și înlocuirea unui act pierdut ori furat. Trecerea la cărțile electronice de
        identitate nu schimbă acest lucru, dosarul se depune la fel.
      </p>
      <p>
        Cea mai frecventă confuzie este că documentul ar fi „deja în sistem&rdquo; fiindcă l-ai depus
        odată. Nu funcționează așa. Datele nașterii sunt într-adevăr în evidențe, dar procedura de la
        ghișeu cere prezentarea certificatului, iar funcționarul nu poate sări peste acest pas.
      </p>

      <h3>Ce faci dacă nu îl mai ai</h3>
      <p>
        Ai două căi, iar ordinea contează. Prima, și cea recomandată dacă nu ești presat de timp: ceri
        un exemplar nou al certificatului de naștere și abia apoi depui dosarul pentru buletin. Vezi
        pașii în ghidul despre{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificatul de naștere pierdut</Link>.
      </p>
      <p>
        A doua cale este <strong>cartea de identitate provizorie</strong>. Ea există exact pentru
        situațiile în care solicitantul nu poate prezenta toate documentele necesare. Se eliberează la
        aprecierea serviciului de evidență, cu fotografii și cu o taxă mică, și are valabilitate
        limitată, de regulă până la un an. Îți rezolvă urgența, dar nu îți rezolvă problema: pentru
        cartea de identitate definitivă tot vei avea nevoie de certificatul de naștere, așa că merită
        să pornești demersul în paralel.
      </p>

      <h2>Pașaport: depinde cine îl solicită</h2>
      <p>
        Pentru un adult care se prezintă cu <strong>cartea de identitate valabilă</strong>, certificatul
        de naștere nu face parte din dosarul obișnuit. Se depun cererea, actul de identitate în
        original, dovada plății și pașaportul anterior, dacă îl mai ai. Cartea de identitate atestă deja
        datele preluate din certificat, așa că ghișeul de pașapoarte nu mai cere documentul de bază.
      </p>
      <p>
        Pentru <strong>minori</strong> situația este diferită. Aici certificatul de naștere se prezintă
        în original, alături de actele de identitate ale ambilor părinți și de acordul acestora exprimat
        în fața funcționarului. Dacă minorul are deja carte de identitate, se prezintă și aceasta, dar
        nu înlocuiește certificatul.
      </p>
      <p>
        Rămân situațiile speciale, în care ghișeul poate cere acte de stare civilă chiar și de la un
        adult: actul de identitate expirat, pierdut sau inexistent, schimbarea numelui prin căsătorie
        ori pe cale administrativă, calitatea de cetățean român cu domiciliul în străinătate,
        neconcordanțe între datele din evidențe și cele din actele prezentate. Un telefon la serviciul
        de pașapoarte înainte de programare economisește un drum.
      </p>

      <h2>Ai pierdut și buletinul, și certificatul de naștere</h2>
      <p>
        Este cercul care blochează cei mai mulți oameni. Ca să refaci buletinul îți trebuie certificatul
        de naștere. Ca să ceri certificatul de naștere ți se cere, la ghișeu, un act de identitate. De
        aici senzația că nu se poate ieși.
      </p>
      <p>
        Se poate, iar punctul de rupere este la <strong>starea civilă</strong>. Ofițerul de stare civilă
        nu are nevoie neapărat de buletin, ci de certitudinea că persoana din fața lui este cea din
        cerere. Identitatea se poate proba cu <strong>pașaportul</strong> sau cu{' '}
        <strong>permisul de conducere</strong>, ambele fiind documente cu fotografie acceptate în
        practică. Dacă nu ai niciunul dintre ele, funcționarul poate verifica datele în evidențele de
        stare civilă și în evidența persoanelor, unde figurezi oricum.
      </p>
      <p>Ordinea practică arată așa:</p>
      <ul>
        <li>
          declari pierderea sau furtul actului de identitate la serviciul de evidență a persoanelor și
          păstrezi dovada primită;
        </li>
        <li>
          ceri un exemplar nou al certificatului de naștere, prezentând ce act cu fotografie mai ai sau
          anunțând din start că nu ai niciunul;
        </li>
        <li>cu certificatul obținut, depui dosarul pentru cartea de identitate;</li>
        <li>
          dacă timpul te presează, ceri între timp o carte de identitate provizorie, ca să ai cu ce te
          legitima.
        </li>
      </ul>
      <p>
        Sfatul care contează: anunță de la început, la ghișeul de stare civilă, că nu ai act de
        identitate. Funcționarul îți spune atunci ce dovezi acceptă în cazul tău, în loc să te trimită
        acasă după ce ai stat la coadă. Aceeași conversație o poți avea și înainte de a depune o cerere
        prin împuternicit, ca documentația să fie corectă din prima.
      </p>

      <h2>Botez: cerință a parohiei, nu a statului</h2>
      <p>
        Nicio lege nu condiționează botezul de prezentarea certificatului de naștere. Cu toate acestea,
        aproape toate parohiile îl cer, dintr-un motiv simplu: preotul completează registrul de botez și
        eliberează certificatul de botez cu numele, data și locul nașterii copilului, iar aceste date
        trebuie luate de undeva.
      </p>
      <p>
        Practicile diferă. Unele parohii se mulțumesc cu o copie, altele vor să vadă originalul, iar în
        unele locuri se cere și certificatul de cununie religioasă al părinților sau al nașilor. Nu
        există o listă unică, așa că întrebarea se pune preotului paroh, cu câteva săptămâni înainte de
        slujbă.
      </p>
      <p>
        Dacă botezi un nou-născut și încă nu ai certificatul lui, demersul e altul: nașterea trebuie
        întâi înregistrată la starea civilă, iar primul certificat se eliberează gratuit cu acea ocazie.
        Pașii sunt în ghidul despre{' '}
        <Link href="/inregistrare-nastere-copil-nou-nascut/">înregistrarea nou-născutului</Link>.
      </p>

      <h2>Căsătorie: intră în dosar, pentru amândoi</h2>
      <p>
        La depunerea declarației de căsătorie, certificatele de naștere ale <strong>ambilor</strong>{' '}
        viitori soți se depun în original, cu copie. Alături de ele intră actele de identitate,
        certificatele medicale prenupțiale și, dacă este cazul, dovada desfacerii unei căsătorii
        anterioare prin divorț sau prin deces. Căsătoria se încheie de regulă la zece zile de la
        depunerea declarației.
      </p>
      <p>
        Aici planificarea contează mai mult decât în alte situații, pentru că data este stabilită
        dinainte și invitațiile sunt trimise. Dacă unul dintre viitorii soți este plecat din țară sau
        s-a născut în altă localitate, exemplarul nou al certificatului se cere cu câteva săptămâni
        înainte, nu cu trei zile.
      </p>

      <h2>Școală și grădiniță: copie, nu original</h2>
      <p>
        La înscrierea în învățământ, unitatea reține o <strong>copie</strong> a certificatului de
        naștere, certificată conform cu originalul de către secretariat. Practic mergi cu originalul, se
        face copia pe loc, iar tu pleci cu documentul în mână. Același lucru se aplică la înscrierea la
        grădiniță, la creșă, la after-school sau la cluburile sportive.
      </p>
      <p>
        Două lucruri de evitat: nu trimite originalul prin poștă sau prin curier către o instituție care
        cere doar copie, și nu preda originalul la secretariat „până se face dosarul&rdquo;. Dacă îți
        trebuie un al doilea exemplar pentru un dosar paralel, este mai simplu să ceri unul nou decât să
        umbli după cel predat.
      </p>

      <h2>Nu îl mai găsești. Ce ceri, de fapt</h2>
      <p>
        Certificatul de naștere nu se „reface&rdquo;. Actul de naștere există permanent în registrele de
        stare civilă, iar ceea ce ceri este un <strong>duplicat</strong>, adică un certificat nou și
        original, cu aceeași valoare juridică. Din 2023 îl poți solicita de la orice primărie care are
        serviciu de stare civilă, nu doar de la cea din localitatea unde te-ai născut.
      </p>
      <p>
        Procedura, actele și termenele sunt detaliate în{' '}
        <Link href="/duplicat-certificat-de-nastere/">ghidul despre duplicat</Link>, iar lista pe
        situații în articolul despre{' '}
        <Link href="/acte-necesare-certificat-de-nastere/">
          actele necesare pentru certificatul de naștere
        </Link>
        . Dacă nu poți ajunge la un ghișeu, cererea se poate depune prin împuternicit, iar documentul
        ajunge prin curier: vezi pagina de{' '}
        <Link href="/servicii/eliberare-certificat-de-nastere/">
          eliberare certificat de naștere
        </Link>
        .
      </p>

      <h2>Pe scurt</h2>
      <p>
        La buletin certificatul de naștere se cere în original de fiecare dată, iar fără el se poate
        obține doar o carte de identitate provizorie. La pașaport, un adult cu carte de identitate
        valabilă de regulă nu îl depune, dar pentru minori și în situații speciale se cere. Botezul
        depinde de parohie, dosarul de căsătorie îl cere în original de la ambii soți, iar școala se
        mulțumește cu o copie. Dacă ai pierdut și buletinul, și certificatul, pornești de la starea
        civilă, unde identitatea se poate proba și altfel decât cu buletinul.
      </p>
    </ArticleLayout>
  );
}
