import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'acte-necesare-certificat-de-nastere';
const TITLE = 'Certificatul de Naștere: Ghid Complet pe Situații';
const DESCRIPTION =
  'Înregistrarea nou-născutului (30 de zile, cine declară, ce se întâmplă după termen), exemplar nou după pierdere ' +
  'sau deteriorare, copilul născut în străinătate (înscriere la consulat sau transcriere) și unde ți se cere ' +
  'certificatul. Cu articolele din Legea 119/1996 și HG 255/2024.';
const DATE_PUBLISHED = '2026-06-19';
const DATE_MODIFIED = '2026-09-09';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-nastere.png',
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image="/images/articole/acte-necesare-certificat-de-nastere.webp"
      imageAlt="Femeie aliniind pe blatul din bucătărie actele pentru dosar: buletin, certificat, carnet și folie de documente, verificându-le după o listă"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="19 iunie 2026"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        {
          slug: 'certificat-nastere',
          label: 'Certificat de Naștere',
          desc: 'Exemplar nou obținut de la starea civilă, cu împuternicire avocațială, livrat prin curier.',
        },
        {
          slug: 'extras-multilingv-certificat-nastere',
          label: 'Extras Multilingv de Naștere',
          desc: 'Varianta pentru dosare depuse în statele Convenției de la Viena, fără traducere.',
        },
        {
          slug: 'certificat-casatorie',
          label: 'Certificat de Căsătorie',
          desc: 'Celălalt act de stare civilă cerut de obicei în același dosar.',
        },
      ]}
      faqs={[
        {
          q: 'În cât timp trebuie declarată nașterea copilului?',
          a: 'În 30 de zile de la naștere pentru copilul născut viu (Legea 119/1996 art. 14^1 alin. (1)). Termenul cuprinde și ziua nașterii, și ziua declarării (HG 255/2024 art. 42 alin. (2)). Pentru copilul născut mort termenul este de 3 zile, iar dacă un copil născut viu moare în primele 30 de zile, declararea se face în 24 de ore de la deces.',
        },
        {
          q: 'Ce se întâmplă dacă am depășit cele 30 de zile?',
          a: 'Nașterea se înregistrează în continuare, dar pe o procedură separată. Până la un an de la naștere, cererea scrisă a declarantului se aprobă de primar și actul se întocmește în cel mult 30 de zile de la solicitare. După un an este nevoie și de avizul conform al serviciului județean de evidență a persoanelor, iar termenul urcă la 90 de zile (Legea 119/1996 art. 14^2). Din mai 2022 nu se mai trece prin instanță.',
        },
        {
          q: 'Am pierdut certificatul de naștere. Ce cer, mai exact?',
          a: 'Un certificat nou, eliberat pe baza actului de naștere care rămâne permanent în registre. HG 255/2024 art. 163 prevede eliberarea unui nou certificat la pierdere, furt, deteriorare, distrugere, plastifiere sau reținere de către o autoritate străină, iar cererea trebuie să descrie împrejurările. Noul exemplar îl anulează pe cel anterior (art. 166 alin. (2)).',
        },
        {
          q: 'Trebuie să merg la primăria din localitatea unde m-am născut?',
          a: 'Nu. Cererea se poate depune la oricare serviciu public comunitar local de evidență a persoanelor sau primărie din România, iar certificatul se livrează la adresa indicată în cerere (HG 255/2024 art. 158). Dacă sunt necesare verificări, eliberarea poate dura până la 30 de zile (art. 162 alin. (2)).',
        },
        {
          q: 'Cine poate cere certificatul în locul meu?',
          a: 'O persoană cu procură specială sau un avocat cu împuternicire avocațială (Legea 119/1996 art. 10 alin. (1); HG 255/2024 art. 166 alin. (1)). Pentru un minor cer părinții sau reprezentantul legal. O procură generală de tipul „mă reprezintă în relația cu autoritățile” este de regulă refuzată.',
        },
        {
          q: 'Copilul s-a născut în străinătate. Transcriere sau înregistrare la consulat?',
          a: 'Dacă nașterea nu a fost înregistrată la autoritățile locale, se poate declara la misiunea diplomatică sau consulatul României în circumscripția căruia s-a produs, în același termen de 30 de zile (Legea 119/1996 art. 14). Dacă a fost înregistrată local și ai certificat străin, acesta trebuie transcris în registrele române în 6 luni (art. 41 alin. (2)). Fără transcriere, actul străin nu are putere doveditoare în România.',
        },
        {
          q: 'Trebuie certificat de naștere pentru buletin sau pașaport?',
          a: 'Pentru cartea de identitate, da, în original și copie, la prima eliberare și la fiecare preschimbare (HG 295/2021, norme, art. 51 și 57). Pentru pașaport, un adult cu carte de identitate valabilă nu îl depune; se cere însă când te legitimezi cu carte de identitate provizorie și, în original, pentru minori (HG 94/2006, norme, art. 5 și 7).',
        },
        {
          q: 'Certificatul de naștere expiră?',
          a: 'Nu. Un certificat rămâne valabil cât timp datele din el corespund actului din registru. Ai nevoie de unul nou doar dacă l-ai pierdut, s-a deteriorat, a fost plastifiat, sau dacă între timp s-au înscris mențiuni (de exemplu schimbare de nume) și îți trebuie un exemplar actualizat.',
        },
      ]}
    >
      <p>
        Certificatul de naștere ajunge în trei feluri de dosare, iar fiecare are alte reguli: îl ceri
        pentru un copil abia născut, ceri un exemplar nou pentru unul pierdut, sau vrei ca o naștere
        petrecută în altă țară să fie recunoscută în România. Pagina asta le ia pe rând, cu articolele
        de lege din spate, pentru că exact aici circulă cele mai multe informații vechi: termenul „de
        30 de zile” e real, dar consecințele depășirii lui s-au schimbat în 2022; drumul „la primăria
        unde te-ai născut” nu mai e obligatoriu din 2024.
      </p>

      <h2>Nou-născutul: 30 de zile, socotite cu tot cu ziua nașterii</h2>
      <p>
        Legea 119/1996, la art. 14^1 alin. (1), dă trei termene. Pentru copilul născut viu, 30 de
        zile de la naștere. Pentru copilul născut mort, 3 zile. Dacă un copil născut viu moare în
        primele 30 de zile, nașterea se declară în 24 de ore de la deces. Normele aprobate prin HG
        255/2024 precizează la art. 42 alin. (2) că termenul cuprinde <em>și</em> ziua nașterii,{' '}
        <em>și</em> ziua în care faci declarația, deci pentru un copil născut pe 1 ale lunii, ziua 30
        e ultima zi, nu ziua 31.
      </p>
      <p>
        Obligația de a declara o are oricare dintre părinți. Dacă niciunul nu poate, art. 16 o
        trece pe medic, pe cei care au fost de față la naștere, pe asistentul social al spitalului
        sau pe orice persoană care a aflat de naștere. Există și o plasă de siguranță: normele
        prevăd la art. 42 alin. (3) înregistrarea din oficiu, în ultima zi a termenului, pe baza
        certificatului medical constatator transmis electronic de maternitate. Nu e un motiv să
        lași lucrurile să curgă, pentru că un act întocmit din oficiu se face fără declarația
        părinților despre nume și fără prezența lor.
      </p>
      <p>
        Actul se întocmește de ofițerul de stare civilă din localitatea în care s-a produs nașterea
        (art. 14), adică a maternității, nu a domiciliului părinților. Cine naște în orașul reședință
        de județ înregistrează copilul acolo.
      </p>

      <h3>Ce prezinți la ghișeu</h3>
      <p>Lista este în HG 255/2024 art. 43 alin. (1):</p>
      <ul>
        <li>
          certificatul medical constatator al nașterii, pe formular-tip, cu număr de înregistrare,
          dată certă și semnătura medicului;
        </li>
        <li>actul de identitate al mamei și, dacă declară altcineva, al declarantului;</li>
        <li>
          certificatul de căsătorie al părinților, în original, dacă sunt căsătoriți; când poartă
          nume de familie diferite, o declarație scrisă a amândurora, dată în fața ofițerului de
          stare civilă sau la notar, despre numele pe care îl va lua copilul;
        </li>
        <li>
          pentru copilul din afara căsătoriei, declarația de recunoaștere a tatălui, dată în fața
          ofițerului de stare civilă, împreună cu consimțământul mamei privind numele de familie.
        </li>
      </ul>
      <p>
        Dacă părinții s-au căsătorit în străinătate și nu au transcris încă certificatul de
        căsătorie, art. 43 alin. (5) din norme spune că nașterea se înregistrează abia după
        transcrierea căsătoriei. E pasul care prinde nepregătite familiile venite din diaspora
        să nască în țară: transcrierea căsătoriei trebuie făcută înainte, nu în cele 30 de zile
        de după.
      </p>
      <p>
        Despre prenume, două reguli din art. 15 al legii: ofițerul refuză motivat prenumele
        indecente sau ridicole, iar prenumele declarat nu poate avea mai mult de trei cuvinte.
        Codul numeric personal se atribuie la înregistrare, dar numai copiilor cetățeni români
        (HG 255/2024 art. 43 alin. (6)).
      </p>

      <h3>Dacă ai depășit termenul</h3>
      <p>
        Aici circulă cea mai veche informație greșită: că după un an „se merge în instanță”. Nu
        mai e cazul din 2 mai 2022, când Legea 105/2022 a rescris art. 14^2. Situația de acum:
      </p>
      <table>
        <thead>
          <tr>
            <th>Declarația făcută</th>
            <th>Ce e nevoie</th>
            <th>Termen de întocmire</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>între ziua 31 și un an de la naștere</td>
            <td>cerere scrisă a declarantului, aprobarea primarului</td>
            <td>până la 30 de zile de la solicitare</td>
          </tr>
          <tr>
            <td>după un an de la naștere</td>
            <td>cerere scrisă, aprobarea primarului, avizul conform al SPCJEP sau DGEPMB</td>
            <td>90 de zile de la solicitare</td>
          </tr>
        </tbody>
      </table>
      <p>
        Când nu există certificat medical constatator, actul se întocmește pe baza unei expertize
        medico-legale privind data nașterii și sexul, care este gratuită (art. 14^2 alin. (2^1) și
        (2^3)), plus declarația de recunoaștere a mamei.
      </p>

      <h2>Exemplar nou: pierdut, furat, rupt, plastifiat</h2>
      <p>
        Certificatul nu se „reface”, pentru că nu el este actul: actul de naștere stă permanent în
        registrul de stare civilă, iar certificatul e doar un extras eliberat pe baza lui. HG
        255/2024 art. 163 enumeră situațiile în care primești, la cerere, un certificat nou:
        pierdere, furt, plastifiere, reținere de către autoritățile străine, deteriorare, distrugere.
        Cererea trebuie să descrie amănunțit împrejurările. Plastifierea merită subliniată: un
        certificat vechi băgat în folie termică la un chioșc este, în ochii normei, un certificat de
        înlocuit.
      </p>
      <p>
        Odată eliberat, noul exemplar îl anulează pe cel anterior (art. 166 alin. (2)). Dacă cel
        vechi reapare într-un sertar peste un an, nu mai are valoare; nu îl folosi la un dosar.
      </p>

      <h3>De unde și cât durează</h3>
      <p>
        Regula veche te trimitea la primăria care avea registrul. Art. 158 alin. (1) din normele
        din 2024 spune că certificatele se eliberează de <em>oricare</em> serviciu public comunitar
        local de evidență a persoanelor sau, unde nu există, de oricare primărie, iar alin. (17)
        prevede că documentul se livrează la adresa din țară indicată în cerere. Când cererea se
        depune la un consulat, livrarea se face prin curier în străinătate (alin. (18)). Motivul
        pentru care asta funcționează e sistemul informatic integrat de stare civilă; detaliile,
        cu cifrele primului an, sunt în articolul despre{' '}
        <Link href="/cum-vor-arata-documentele-de-stare-civila-2025/">
          noile documente de stare civilă
        </Link>
        .
      </p>
      <p>
        Termenul: certificatul se tipărește în prezența solicitantului sau, dacă sunt necesare
        verificări, în cel mult 30 de zile (art. 162 alin. (2)). În practică, pentru un act
        înregistrat de mult sau într-o altă localitate, așteaptă-te la verificări.
      </p>
      <p>
        Identitatea se dovedește cu actul de identitate valabil. Dacă e expirat, ofițerul verifică
        datele în evidența persoanelor și, dacă fizionomia nu corespunde cu fotografia din sistem,
        te trimite mai întâi după un act de identitate nou (art. 158 alin. (5)). Pentru cine a
        pierdut și buletinul, și certificatul, ordinea contează: cartea de identitate provizorie se
        eliberează tocmai când lipsește certificatul de naștere (HG 295/2021 art. 70 alin. (1)), așa
        că poți obține întâi actul provizoriu, apoi certificatul, apoi cartea de identitate definitivă.
      </p>

      <h3>Cine poate cere pentru altcineva</h3>
      <p>
        Legea 119/1996 art. 10 alin. (1) permite eliberarea către titular sau reprezentantul legal,
        către o persoană împuternicită prin <strong>procură specială</strong> și către un avocat cu{' '}
        <strong>împuternicire avocațială</strong>. Cuvântul „specială” nu e decorativ: procura trebuie
        să spună pentru ce document și ce operațiune e dată. Pe împuternicirea avocațială funcționează
        și{' '}
        <Link href={serviceUrl('certificat-nastere')}>serviciul nostru de certificat de naștere</Link>:
        cererea o depunem noi, documentul îl eliberează starea civilă, iar ce plătești e demersul și
        transportul. Dacă ești în țară și ai o dimineață liberă, drumul până la orice ghișeu de stare
        civilă e acum scurt.
      </p>
      <p>
        Nu confunda exemplarul nou cu copia legalizată. Copia legalizată e o fotocopie certificată de
        notar după un certificat pe care îl ai; dacă nu îl mai ai, nu are ce să legalizeze.
      </p>

      <h2>Copil născut în străinătate: două drumuri diferite</h2>
      <p>
        Prima întrebare e dacă nașterea a fost sau nu înregistrată la autoritățile statului unde s-a
        produs, pentru că de aici se despart procedurile.
      </p>
      <p>
        <strong>Nu a fost înregistrată local.</strong> Art. 14 din lege dă competența de a întocmi actul
        și ofițerului de stare civilă de la misiunea diplomatică sau oficiul consular al României în
        a cărui circumscripție s-a produs nașterea, în același termen de 30 de zile. Copilul primește
        direct act de naștere românesc, fără transcriere. Consulatele condiționează asta de faptul că
        nașterea nu a fost înregistrată la autoritățile locale.
      </p>
      <p>
        <strong>A fost înregistrată local și ai un certificat străin.</strong> Art. 41 alin. (1) e
        categoric: actele întocmite de autorități străine au putere doveditoare în România numai
        după transcriere. Alin. (2) dă un termen de 6 luni de la înregistrarea nașterii în
        străinătate. Transcrierea se aprobă de primarul localității de domiciliu sau de ultim
        domiciliu din România, cu avizul conform al serviciului județean de evidență a persoanelor
        (alin. (3)). Pentru cetățenii români care nu au avut niciodată domiciliul în țară, competența
        e la Sectorul 1 București, cu un termen de 60 de zile (alin. (6)). Cererea se poate depune,
        și aici, la oricare serviciu de evidență a persoanelor, care trimite dosarul electronic celui
        competent (HG 255/2024 art. 98 alin. (4)).
      </p>
      <p>
        Pentru copilul sub 14 ani, cererea o face unul dintre părinți, personal sau prin împuternicit
        cu procură specială (art. 99 alin. (2)). Dosarul, potrivit art. 100, cuprinde certificatul
        străin în original, legalizat după regulile de la art. 34, și traducerea legalizată în
        română sau, după caz, formularul standard multilingv. Art. 34 e locul unde se pierd cei mai
        mulți bani:
      </p>
      <ul>
        <li>
          documentele din statele Convenției de la Haga din 1961 se apostilează în statul emitent;
        </li>
        <li>
          documentele din statele membre UE aflate sub Regulamentul (UE) 2016/1191 sunt scutite de
          apostilă și de orice altă formalitate;
        </li>
        <li>
          documentele din statele cu care România are tratate de asistență juridică sunt scutite
          de apostilă;
        </li>
        <li>restul se supralegalizează, o procedură mai lungă.</li>
      </ul>
      <p>
        Deci pentru un copil născut în Italia, Spania sau Germania nu apostilezi certificatul. Pentru
        unul născut în Marea Britanie, Statele Unite sau Canada, da. Transcrierea făcută fără avizul
        conform și fără aprobarea primarului e nulă de drept (art. 102 alin. (3) și (4)), motiv
        pentru care nu există scurtături.
      </p>

      <h2>Unde ți se cere și în ce formă</h2>
      <table>
        <thead>
          <tr>
            <th>Dosar</th>
            <th>Se cere?</th>
            <th>Sursa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>prima carte de identitate, la 14 ani</td>
            <td>da, original și copie</td>
            <td>HG 295/2021, norme, art. 51</td>
          </tr>
          <tr>
            <td>preschimbarea cărții de identitate</td>
            <td>da, original și copie, de fiecare dată</td>
            <td>HG 295/2021, norme, art. 57</td>
          </tr>
          <tr>
            <td>pașaport, adult cu carte de identitate valabilă</td>
            <td>nu</td>
            <td>HG 94/2006, norme, art. 5</td>
          </tr>
          <tr>
            <td>pașaport cu carte de identitate provizorie</td>
            <td>da, în original</td>
            <td>HG 94/2006, norme, art. 5 lit. a)</td>
          </tr>
          <tr>
            <td>pașaport pentru minor</td>
            <td>da, în original</td>
            <td>HG 94/2006, norme, art. 7 alin. (2)</td>
          </tr>
          <tr>
            <td>declarația de căsătorie</td>
            <td>da, în original, pentru amândoi</td>
            <td>HG 255/2024 art. 64 alin. (1) lit. b)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Cea mai frecventă confuzie la buletin: „e deja în sistem, l-am depus acum zece ani”. Datele
        sunt în evidențe, dar norma cere prezentarea certificatului la fiecare eliberare, iar
        originalul ți se restituie după verificare. Pentru școală, grădiniță sau botez nu există o
        cerință legală unitară; instituția sau parohia stabilește dacă vrea copie sau originalul la
        vedere, așa că întreabă înainte. Detaliile despre dosarul de căsătorie sunt în{' '}
        <Link href="/acte-necesare-casatorie/">ghidul de căsătorie</Link>.
      </p>

      <h2>Pentru un dosar în străinătate</h2>
      <p>
        Certificatul românesc, în limba română, are nevoie de regulă de apostilă și traducere ca să
        fie acceptat afară, cu excepția statelor UE sub Regulamentul 2016/1191, unde apostila nu se
        mai cere. Pentru statele părți la Convenția CIEC nr. 16 de la Viena există o cale mai scurtă:{' '}
        <Link href={serviceUrl('extras-multilingv-certificat-nastere')}>
          extrasul multilingv al actului de naștere
        </Link>
        , cu rubrici numerotate identic în toate statele semnatare, care are aceeași putere
        doveditoare ca certificatul și se prezintă direct, fără traducere. Se cere de la aceleași
        ghișee ca și certificatul. Cele trei regimuri, cu lista de țări, sunt explicate în{' '}
        <Link href="/cum-vor-arata-documentele-de-stare-civila-2025/">
          articolul despre documentele de stare civilă
        </Link>
        .
      </p>
      <p>
        Dacă modelul vechi al certificatului te preocupă, nu e un motiv de înlocuire în sine:
        certificatele emise anterior rămân valabile. Vezi ce se schimbă și când merită un exemplar
        nou în{' '}
        <Link href="/schimbare-certificat-de-nastere-vechi/">
          articolul despre certificatul de naștere vechi
        </Link>
        .
      </p>
    </ArticleLayout>
  );
}
