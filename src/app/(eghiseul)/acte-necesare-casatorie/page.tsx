import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'acte-necesare-casatorie';
const TITLE = 'Acte Necesare Căsătorie: Dosarul, Termenele și Certificatul';
const DESCRIPTION =
  'Ce se depune cu declarația de căsătorie (certificatul medical e valabil 30 de zile, nu 14), cum curg cele 10 zile ' +
  'de publicare, martorii, minorii, soțul străin și dovada de la ambasadă. Plus certificatul nou, duplicatul și ' +
  'transcrierea unei căsătorii din străinătate, cu articolele din Codul civil, Legea 119/1996 și HG 255/2024.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-09-09';
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
      publishedLabel="22 iunie 2026"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        {
          slug: 'certificat-casatorie',
          label: 'Certificat de Căsătorie',
          desc: 'Exemplar nou obținut de la starea civilă, cu împuternicire avocațială, livrat prin curier.',
        },
        {
          slug: 'certificat-celibat',
          label: 'Certificat de Celibat',
          desc: 'Pentru românii care se căsătoresc în străinătate, nu pentru dosarul din țară.',
        },
        {
          slug: 'extras-multilingv-certificat-casatorie',
          label: 'Extras Multilingv de Căsătorie',
          desc: 'Acceptat direct în statele Convenției de la Viena, fără traducere.',
        },
      ]}
      faqs={[
        {
          q: 'Cât este valabil certificatul medical prenupțial?',
          a: '30 de zile de la data emiterii, potrivit HG 255/2024 art. 64 alin. (1) lit. c). Trebuie întocmit pe formular-tip, cu număr de înregistrare, dată certă și semnătura medicului, și trebuie să conțină mențiunea că persoana se poate căsători. Cifra de 14 zile care mai circulă pe internet nu se regăsește în normele în vigoare.',
        },
        {
          q: 'Cu cât timp înainte se depune declarația de căsătorie?',
          a: 'Căsătoria se încheie începând cu a 11-a zi de la depunerea declarației și cel târziu în a 30-a zi (Legea 119/1996 art. 27 alin. (1)). Cele 10 zile sunt termenul în care oricine poate face opoziție (Codul civil art. 283). Dacă a 30-a zi trece fără oficiere, se face o declarație nouă și se ia totul de la capăt (Codul civil art. 284).',
        },
        {
          q: 'Se poate scurta termenul de 10 zile?',
          a: 'Da, pentru motive temeinice dovedite cu documente, cu aprobarea primarului localității unde se încheie căsătoria (Legea 119/1996 art. 27 alin. (2)). Normele exclud însă dispensa când căsătoria se încheie în altă localitate decât cea de domiciliu sau reședință a viitorilor soți (HG 255/2024 art. 66 lit. c)).',
        },
        {
          q: 'Poate depune declarația un singur partener sau un împuternicit?',
          a: 'Declarația se face personal, în scris, de ambii viitori soți (Codul civil art. 280; Legea 119/1996 art. 25 alin. (1)). Singura relaxare: cel care nu se află în localitatea unde se va încheia căsătoria o poate face la primăria de domiciliu sau reședință, care o trimite în 48 de ore la primăria competentă (art. 25 alin. (4)). Prin împuternicit nu se poate.',
        },
        {
          q: 'Ce documente prezintă un cetățean străin?',
          a: 'Pe lângă actele obișnuite, o dovadă din care să rezulte că îndeplinește condițiile de fond ale legii sale naționale, eliberată de misiunea diplomatică sau consulatul statului său (Legea 119/1996 art. 31). Cetățenii statelor cu tratate de asistență juridică cu România sau fără misiune acreditată aduc documente de la autoritățile de acasă, datate cu cel mult 3 luni în urmă (HG 255/2024 art. 66 lit. h)). Interpretul autorizat e obligatoriu dacă nu cunoaște româna. Pașaportul cu viză trebuie să fie valabil și la depunere, și la oficiere.',
        },
        {
          q: 'Câți martori trebuie și cine poate fi martor?',
          a: 'Doi. Pot fi rude sau afini cu oricare dintre soți, indiferent de grad (Codul civil art. 288 alin. (3)). Nu pot fi martori persoanele incapabile sau cele care, din cauza unei deficiențe psihice ori fizice, nu pot atesta consimțământul soților.',
        },
        {
          q: 'Am pierdut certificatul de căsătorie. De unde cer altul?',
          a: 'De la oricare serviciu public comunitar local de evidență a persoanelor sau primărie din țară, care îl livrează la adresa din cerere (HG 255/2024 art. 158). Îl poate cere oricare dintre soți, o persoană cu procură specială sau un avocat cu împuternicire avocațială (Legea 119/1996 art. 10). După divorț sau deces, certificatul se eliberează numai cu mențiunea corespunzătoare (art. 51 alin. (2)).',
        },
        {
          q: 'M-am căsătorit în străinătate. Ce fac cu certificatul?',
          a: 'Îl transcrii în registrele române în 6 luni de la înregistrarea căsătoriei în străinătate (Legea 119/1996 art. 41 alin. (2)). Fără transcriere, actul nu are putere doveditoare în România. Dosarul: certificatul străin în original, apostilat sau scutit de apostilă după regulile din HG 255/2024 art. 34, traducerea legalizată sau formularul standard multilingv, plus declarațiile despre nume și regim matrimonial.',
        },
      ]}
    >
      <p>
        Dosarul de căsătorie nu e complicat, dar are două numere care încurcă multă lume, iar unul
        dintre ele circulă greșit pe multe site-uri: certificatul medical e valabil{' '}
        <strong>30 de zile</strong>, nu 14, iar căsătoria se poate încheia cel mai devreme în a
        11-a zi de la depunerea declarației. Restul e o listă de documente și câteva situații
        speciale. Mai jos, totul cu articolul de lege lângă, ca să nu fie nevoie să crezi pe cuvânt.
      </p>

      <h2>Cine se poate căsători</h2>
      <p>
        Codul civil pune condițiile de fond în art. 271 și următoarele. Căsătoria se încheie între un
        bărbat și o femeie (art. 271; art. 277 nu recunoaște căsătoriile între persoane de același sex
        încheiate în străinătate). Vârsta este 18 ani (art. 272 alin. (1)). Minorul de 16 ani se poate
        căsători pentru motive temeinice, cu aviz medical, cu încuviințarea părinților sau a tutorelui
        și cu autorizarea instanței de tutelă de la domiciliul lui (alin. (2)); dacă un părinte refuză,
        tot instanța decide. Sunt interzise căsătoria unei persoane deja căsătorite (art. 273) și cea
        între rude în linie dreaptă sau colaterală până la gradul al patrulea inclusiv (art. 274), cu
        o singură excepție: verii primari, gradul al patrulea, pot fi autorizați de instanță pe baza
        unui aviz medical special.
      </p>

      <h2>Unde se depune declarația</h2>
      <p>
        La serviciul public comunitar local de evidență a persoanelor sau la primăria în raza căreia
        are domiciliul ori reședința <em>unul</em> dintre viitorii soți (Legea 119/1996 art. 24 alin.
        (1)). Nu trebuie să fie primăria amândurora. Dacă vreți să vă căsătoriți în altă localitate
        decât cea de domiciliu, se poate, cu aprobarea primarului de acolo și cu înștiințarea
        primăriei de domiciliu pentru publicare (HG 255/2024 art. 63 alin. (2)). Oficierea în aer
        liber, în parcuri, grădini publice sau muzee, se face la cerere, tot cu aprobarea primarului
        (art. 72 alin. (2)).
      </p>
      <p>
        Declarația se face personal, în scris, de amândoi (Codul civil art. 280; Legea 119/1996 art.
        25 alin. (1)). În ea arătați că nu există niciun impediment, ce nume de familie veți purta și
        ce regim matrimonial alegeți. Dacă unul dintre voi nu e în localitate, poate da declarația la
        primăria lui de domiciliu, care o trimite în 48 de ore (art. 25 alin. (4)). Prin împuternicit
        nu se poate, nici cu procură notarială.
      </p>

      <h2>Ce se prezintă odată cu declarația</h2>
      <p>Lista este în HG 255/2024 art. 64 alin. (1), pentru fiecare dintre viitorii soți:</p>
      <ul>
        <li>actul de identitate, în original;</li>
        <li>
          certificatul de naștere, în original; pentru cetățeanul străin, extrasul de naștere sau
          extrasul multilingv, legalizat după regulile de la art. 34;
        </li>
        <li>
          certificatul medical privind starea sănătății, pe formular-tip, cu număr de înregistrare,
          dată certă, semnătura medicului și mențiunea că persoana se poate căsători; valabil 30 de
          zile de la emitere;
        </li>
        <li>convenția matrimonială autentificată de notar, dacă ați încheiat una;</li>
        <li>
          dovada desfacerii sau încetării căsătoriei anterioare, dacă e cazul.
        </li>
      </ul>
      <p>
        Despre certificatul medical, două lucruri practice. Legea îl cere ca dovadă că v-ați comunicat
        reciproc starea sănătății (Codul civil art. 278). Normele spun că se prezintă „aflat în termen
        de valabilitate” odată cu declarația, deci ceasul contează la depunere. Cum oficierea vine
        între ziua 11 și ziua 30 de la depunere, un certificat făcut în săptămâna dinaintea
        declarației acoperă tot intervalul. Dacă l-ai făcut cu 30 de zile înainte să depui, ai o
        problemă la ghișeu, nu la nuntă.
      </p>
      <p>
        Dovada că o căsătorie anterioară s-a desfăcut se face, potrivit art. 64 alin. (2), cu
        certificatul de naștere sau de căsătorie purtând mențiunea de divorț, cu sentința de divorț
        rămasă definitivă sau cu certificatul de divorț eliberat de ofițerul de stare civilă ori de
        notar. Pentru văduvi, cu certificatul de deces al fostului soț (alin. (3)). Dacă ai pierdut
        documentele, ceri un exemplar nou; pașii sunt aceiași ca la{' '}
        <Link href="/acte-necesare-certificat-de-nastere/">certificatul de naștere</Link>.
      </p>

      <h3>Minorul de 16 ani</h3>
      <p>
        La dosar se adaugă avizul medical, dovada încuviințării părinților sau a tutorelui și
        autorizarea, prin sentință definitivă, a instanței de tutelă (Legea 119/1996 art. 25 alin.
        (3) lit. b)). Încuviințarea părinților se dă printr-o declarație la starea civilă, odată cu
        declarația de căsătorie, sau la primăria lor de domiciliu dacă locuiesc în altă localitate
        (HG 255/2024 art. 68). Avizul medical nu ține loc de certificatul medical obișnuit; se cer
        amândouă (art. 67 alin. (2)).
      </p>

      <h3>Soțul cetățean străin</h3>
      <p>
        Legea 119/1996 art. 31 alin. (1) condiționează încheierea căsătoriei de o dovadă eliberată
        de misiunea diplomatică sau oficiul consular al statului al cărui cetățean este, din care să
        rezulte că sunt îndeplinite condițiile de fond cerute de legea lui națională. În limbaj
        curent i se spune „certificat de cutumă”; în lege nu apare numele ăsta. Pentru cetățenii
        statelor cu care România are tratate de asistență juridică, ai statelor fără misiune
        acreditată la București, precum și pentru cei care se căsătoresc la un consulat român, dovada
        vine de la autoritățile competente din țara de cetățenie (alin. (2)), iar normele cer ca
        documentele să fie datate cu cel mult 3 luni în urmă (HG 255/2024 art. 66 lit. h)). Există și
        state despre care Ministerul Afacerilor Externe a notificat că nu eliberează deloc o astfel
        de dovadă; acolo se acceptă o declarație notarială pe propria răspundere (art. 66 lit. j)).
      </p>
      <p>
        Identitatea o dovedește cu pașaportul în care e aplicată viza de intrare, iar viza trebuie
        să fie valabilă atât la depunerea declarației, cât și la oficiere (art. 64 alin. (5) lit. a)).
        Dacă nu cunoaște româna, atât la declarație, cât și la ceremonie e obligatoriu un interpret
        și traducător autorizat, cu proces-verbal (Legea 119/1996 art. 30). Nu e opțional și nu
        poate fi un prieten care „știe engleză”.
      </p>

      <h2>Cum curg zilele: publicarea, opoziția, oficierea</h2>
      <p>
        În ziua în care primește declarația, ofițerul de stare civilă o afișează în extras la sediul
        primăriei, pe site-ul ei și pe portalul sistemului informatic de stare civilă (Codul civil
        art. 283 alin. (1); HG 255/2024 art. 63 alin. (1)). Extrasul conține datele voastre de stare
        civilă și înștiințarea că oricine poate face opoziție în 10 zile de la afișare. Opoziția se
        face numai în scris, cu dovezi (Codul civil art. 285).
      </p>
      <p>
        Căsătoria se încheie după ce trec cele 10 zile, adică începând cu a 11-a zi, și nu mai târziu
        de a 30-a zi de la declarație (Legea 119/1996 art. 27 alin. (1)). Termenul de 10 zile cuprinde
        și ziua afișării, și ziua încheierii (Codul civil art. 283 alin. (3)). Un exemplu: declarație
        depusă marți, 6 octombrie; a 11-a zi cade vineri, 16 octombrie, prima zi în care se poate
        oficia; a 30-a zi este 4 noiembrie, ultima. Dacă pe 4 noiembrie nu v-ați căsătorit, sau dacă
        vreți să schimbați numele ori regimul matrimonial din declarație, faceți o declarație nouă și
        curge un nou termen (Codul civil art. 284; HG 255/2024 art. 63 alin. (6)).
      </p>
      <p>
        Scurtarea termenului există: pentru motive temeinice dovedite cu documente, primarul poate
        încuviința încheierea căsătoriei înainte de a 11-a zi (Legea 119/1996 art. 27 alin. (2)).
        Normele închid însă ușa asta când vă căsătoriți într-o localitate în care niciunul nu are
        domiciliul sau reședința (art. 66 lit. c)): nunta la munte, în comuna cu biserica frumoasă,
        merge, dar cu termenul întreg.
      </p>

      <h2>Ceremonia</h2>
      <p>
        Vă prezentați împreună la sediul primăriei, în prezența a 2 martori, și vă dați
        consimțământul în mod public, în fața ofițerului de stare civilă (Codul civil art. 287).
        Martorii atestă consimțământul; pot fi rude sau afini, indiferent de grad (art. 288 alin.
        (3)). Ofițerul vă declară căsătoriți, citește dispozițiile din Codul civil despre drepturile
        și îndatoririle soților și întocmește pe loc actul de căsătorie, pe care îl semnați cu numele
        de familie ales, alături de martori (Legea 119/1996 art. 29). Persoanele care aparțin
        minorităților naționale pot cere, în scris, oficierea în limba maternă, dacă ofițerul o
        cunoaște (HG 255/2024 art. 72 alin. (4)).
      </p>
      <p>
        Numele: puteți păstra fiecare numele dinainte, puteți lua numele oricăruia dintre voi sau
        numele reunite; unul îl poate păstra pe al lui, iar celălalt să poarte numele reunite (Codul
        civil art. 282). Decizia intră în declarație, deci se ia înainte de depunere, nu în ziua nunții.
      </p>

      <h2>Certificatul de căsătorie: cum arată și când ai nevoie de altul</h2>
      <p>
        Certificatul se eliberează la întocmirea actului (HG 255/2024 art. 162 alin. (1)). Modelul
        emis din 2025 e pe hârtie A4 cu filigran cu stema României, tentă roz și un cod unic de trei
        litere și șapte cifre; nu mai încape în portofel. Ce se schimbă și de ce e în{' '}
        <Link href="/cum-vor-arata-documentele-de-stare-civila-2025/">
          articolul despre noile documente de stare civilă
        </Link>
        ; certificatele emise pe modelul vechi rămân valabile.
      </p>
      <p>
        Un exemplar nou ceri când l-ai pierdut, ți-a fost furat, s-a deteriorat, l-ai plastifiat sau
        ți-a fost reținut de o autoritate străină (art. 163). Cererea descrie împrejurările, iar
        noul certificat îl anulează pe cel vechi. Îl poate cere oricare dintre soți, ca titular, sau
        o persoană cu procură specială ori un avocat cu împuternicire avocațială (Legea 119/1996
        art. 10 alin. (1)). Din 2024, cererea se depune la oricare serviciu de evidență a
        persoanelor sau primărie din țară, iar documentul se livrează la adresa din cerere (HG
        255/2024 art. 158); dacă sunt necesare verificări, eliberarea durează până la 30 de zile
        (art. 162 alin. (2)).
      </p>
      <p>
        Două lucruri pe care le află lumea abia la ghișeu. După divorț sau după decesul unuia dintre
        soți, certificatul de căsătorie se eliberează numai cu mențiunea corespunzătoare (Legea
        119/1996 art. 51 alin. (2)); nu poți primi un certificat „curat” pentru o căsătorie
        desfăcută. Și copia legalizată nu înlocuiește exemplarul pierdut, pentru că notarul
        legalizează după un original pe care trebuie să îl ai.
      </p>
      <p>
        Pe împuternicirea avocațială funcționează{' '}
        <Link href={serviceUrl('certificat-casatorie')}>serviciul nostru de certificat de căsătorie</Link>
        : depunem cererea, starea civilă eliberează documentul, iar el ajunge la adresa ta, în țară
        sau în străinătate. Ce plătești e demersul și transportul; dacă ești în România și ai un
        ghișeu aproape, mergi personal.
      </p>

      <h2>Căsătoria încheiată în străinătate</h2>
      <p>
        Actele de stare civilă întocmite de autorități străine au putere doveditoare în România
        numai după transcriere (Legea 119/1996 art. 41 alin. (1)). Termenul este de 6 luni de la
        înregistrarea căsătoriei în străinătate (alin. (2)); depășirea lui nu blochează transcrierea,
        dar până atunci, pentru statul român, nu ești căsătorit: nu îți schimbi numele în buletin,
        nu apari ca soț la notar, iar nașterea unui copil se înregistrează abia după transcrierea
        căsătoriei (HG 255/2024 art. 43 alin. (5)).
      </p>
      <p>
        Cererea se aprobă de primarul localității de domiciliu sau de ultim domiciliu din România, cu
        avizul conform al serviciului județean de evidență a persoanelor (art. 41 alin. (3)); pentru
        cine nu a avut niciodată domiciliul în țară, competența e la Sectorul 1 București, cu termen
        de 60 de zile (alin. (6)). Se poate depune și la consulat, personal sau prin împuternicit cu
        procură specială (HG 255/2024 art. 99 alin. (1)).
      </p>
      <p>Dosarul, potrivit art. 100 din norme:</p>
      <ul>
        <li>
          certificatul sau extrasul de căsătorie străin, în original, apostilat dacă vine dintr-un
          stat al Convenției de la Haga, scutit de apostilă dacă vine dintr-un stat membru UE sub
          Regulamentul (UE) 2016/1191 ori dintr-un stat cu tratat de asistență juridică, supralegalizat
          în rest (art. 34);
        </li>
        <li>traducerea legalizată în română sau formularul standard multilingv;</li>
        <li>
          declarații ale soților despre numele de familie purtat după căsătorie, dacă certificatul
          străin nu îl menționează; numele celuilalt soț se poartă numai cu consimțământul lui;
        </li>
        <li>declarații notariale despre regimul matrimonial, dacă vreți înscris în act;</li>
        <li>
          declarația soțului străin că nu are altă căsătorie nedesfăcută, când vine dintr-un stat a
          cărui lege permite mai multe căsătorii; fără ea, certificatul nu se transcrie.
        </li>
      </ul>
      <p>
        Transcrierea fără avizul conform și fără aprobarea primarului e nulă de drept (art. 102
        alin. (3) și (4)). Nu există o cale mai rapidă prin cunoștințe.
      </p>

      <h2>Certificatul de celibat nu intră în dosarul din România</h2>
      <p>
        Pentru o căsătorie încheiată în România, cetățeanul român nu depune certificat de celibat;
        lipsa unei căsătorii anterioare rezultă din evidențele de stare civilă. Documentul e cerut
        românilor de autoritățile din străinătate, ca dovadă că nu sunt deja căsătoriți, și îl
        obținem prin{' '}
        <Link href={serviceUrl('certificat-celibat')}>serviciul de certificat de celibat</Link>.
        Pentru drumul invers, un dosar românesc depus într-un stat al Convenției de la Viena,{' '}
        <Link href={serviceUrl('extras-multilingv-certificat-casatorie')}>
          extrasul multilingv al actului de căsătorie
        </Link>{' '}
        se prezintă direct, fără traducere. Pentru certificatul de naștere cerut în același dosar,
        vezi <Link href="/acte-necesare-certificat-de-nastere/">ghidul de certificat de naștere</Link>.
      </p>
    </ArticleLayout>
  );
}
