import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { ArticleInlineCta } from '@/components/articole/article-service-cards';
import { getServiceCards } from '@/lib/articles/service-cards';

const SLUG = 'cadastru-sistematic';
const TITLE = 'Cadastru sistematic: afișarea publică, rectificarea în 60 de zile și cartea funciară nouă';
// The root layout appends " | eGhiseul.ro"; this keeps the <title> near 60 characters.
const META_TITLE = 'Cadastru sistematic: afișare, rectificare, CF nou';
const DESCRIPTION =
  'Cadastrul sistematic e gratuit pentru proprietar, dar datele greșite se corectează simplu doar într-un termen. ' +
  'Cum afli dacă localitatea ta e în lucru, ce verifici la afișare și ce faci după.';
const DATE_PUBLISHED = '2026-10-14';
const DATE_MODIFIED = '2026-10-14';

const L7 = 'https://legislatie.just.ro/Public/DetaliiDocument/311746';
const REGULAMENT = 'https://legislatie.just.ro/Public/DetaliiDocument/292667';
const PNCCF = 'https://pnccf.site/ro/';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default async function Page() {
  const {
    cards: [extrasCf],
  } = await getServiceCards([{ slug: 'extras-carte-funciara', label: 'Extras de carte funciară', desc: '' }]);

  return (
    <ArticleLayout
      slug={SLUG}
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="14 octombrie 2026"
      updatedLabel="14 octombrie 2026"
      imageAlt="Hartă a României tipărită, cu județe colorate, lângă un plan cadastral și un telefon cu harta parcelelor"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară Online',
          desc: 'După finalizarea cadastrului sistematic: extrasul pe numărul nou, cu proprietarul și sarcinile.',
        },
        {
          slug: 'identificare-imobil',
          label: 'Identificare Imobil după Adresă',
          desc: 'Afli numărul nou de carte funciară când ai doar adresa sau actele vechi.',
        },
        {
          href: '/cum-aflam-numarul-carte-functionara-si-nr-cadastral/',
          label: 'Cum afli numărul de carte funciară',
          desc: 'Din acte, dintr-un extras vechi sau după adresă.',
        },
      ]}
      faqs={[
        {
          q: 'Cadastrul sistematic e gratuit?',
          a: 'Da, pentru proprietar. Legea 7/1996 spune că înregistrarea sistematică se face din oficiu, gratuit, pe baza realității din teren (art. 10 alin. 1). Lucrarea o plătesc ANCPI și primăria, din veniturile ANCPI, fonduri europene și bugetul local. Plătești doar ce îți ceri tu în plus, de exemplu copii legalizate pentru o cerere de rectificare.',
        },
        {
          q: 'Cât durează afișarea publică?',
          a: '60 de zile. În același termen, de 60 de zile de la afișare, se depun cererile de rectificare (art. 14 alin. 1 din Legea 7/1996). Afișarea e anunțată cu cel puțin 5 zile înainte, în presă, la primărie și online.',
        },
        {
          q: 'Unde depun cererea de rectificare și cât costă?',
          a: 'La primăria localității, prin poștă sau curier, ori electronic, după cum scrie în anunțul de afișare. Formularul e Anexa 8 din regulamentul ANCPI, o cerere pentru fiecare imobil, cu copii legalizate după acte. Legea nu prevede un tarif pentru cerere. O soluționează o comisie formată din reprezentanți ai primăriei, ai firmei care a făcut măsurătorile și ai OCPI.',
        },
        {
          q: 'Am ratat cele 60 de zile. Mai pot corecta?',
          a: 'Da. După deschiderea cărților funciare, erorile din lucrarea sistematică se corectează la OCPI, fără tarif (art. 14 alin. 7). Fereastra se închide la prima înscriere a unei vânzări, ipoteci sau a altui act, făcută după ce s-au deschis cărțile funciare pe toată localitatea (art. 14 alin. 8). Practic: corectezi înainte să vinzi sau să iei credit pe imobil. După aceea rămân procedurile obișnuite de rectificare sau instanța.',
        },
        {
          q: 'Cum aflu numărul nou de carte funciară?',
          a: 'La finalizare, fiecare imobil primește o carte funciară electronică nouă, iar numărul cadastral e același cu numărul cărții funciare. Legea prevede că extrasul de carte funciară și extrasul din planul cadastral se comunică proprietarului prin primărie. Dacă nu l-ai primit sau l-ai pierdut, numărul se poate afla după adresă sau după numele proprietarului.',
        },
        {
          q: 'Mai sunt valabile actele vechi de proprietate?',
          a: 'Actul rămâne valabil ca dovadă că ai dobândit imobilul. Își pierde valabilitatea doar descrierea imobilului din el: numerele vechi, suprafața, vecinătățile (art. 15 din Legea 7/1996, clarificat de decizia ÎCCJ publicată în Monitorul Oficial 35/2026). De acum, proprietatea se dovedește cu extrasul de carte funciară, iar limitele cu extrasul din planul cadastral.',
        },
        {
          q: 'Ce se întâmplă dacă moștenirea nu e dezbătută?',
          a: 'Primăria sesizează Camera Notarilor, iar ANCPI plătește onorariul notarului pentru certificatul de moștenitor eliberat în cadrul programului (art. 9 alin. 7). Nu se plătește nici impozitul pe transferul din succesiune. Excepție: certificatele eliberate la mai mult de 2 ani de la sesizare nu mai sunt plătite de ANCPI.',
        },
        {
          q: 'Ce înseamnă „proprietar neidentificat”?',
          a: 'Că firma care a măsurat nu a găsit acte sau un posesor pentru acel imobil. În cartea funciară se notează mențiunea, fără intabularea cuiva. Adevăratul proprietar se poate intabula ulterior, cu actul de proprietate și un certificat de la primărie (art. 13 din Legea 7/1996). Legea nu prevede că terenul trece automat la comună după un anumit termen.',
        },
        {
          q: 'Îmi crește impozitul după cadastrul sistematic?',
          a: 'Poate. Dacă suprafața măsurată e mai mare decât cea din acte, impozitul se calculează pe suprafața reală, de la 1 ianuarie a anului următor (Codul fiscal, art. 461 alin. 9 pentru clădiri și art. 466 alin. 6 pentru teren). Construcțiile înscrise prin cadastrul sistematic intră și ele la impozit.',
        },
        {
          q: 'Pot contesta decizia comisiei?',
          a: 'Da. Procesul-verbal al comisiei se comunică celui care a depus cererea, iar acesta poate face plângere la judecătorie în 15 zile de la comunicare (art. 14 alin. 4 din Legea 7/1996).',
        },
      ]}
    >
      <p>
        Pe scurt: cadastrul sistematic înseamnă că statul măsoară gratuit toate imobilele dintr-o
        comună sau dintr-un sector al ei și deschide pentru fiecare o carte funciară nouă. Pentru tine
        contează un singur moment: <strong>afișarea publică de 60 de zile</strong>. Atunci verifici dacă
        numele, suprafața și limitele sunt corecte. O greșeală prinsă atunci se corectează printr-o
        cerere, fără tarif. Una prinsă după ce vinzi imobilul poate ajunge în instanță.
      </p>
      <p>
        Mai jos ai pașii, cu articolele de lege, plus ce se schimbă după finalizare: numărul nou de
        carte funciară, extrasul și impozitul.
      </p>

      <h2>Ce e cadastrul sistematic și cine plătește</h2>
      <p>
        Programul Național de Cadastru și Carte Funciară (PNCCF) înregistrează gratuit imobilele din
        toate localitățile. Legea spune că înregistrarea se face „din oficiu, gratuit și în mod
        sistematic, pe baza realității din teren”, indiferent dacă cel găsit acolo e proprietar cu acte,
        posesor sau doar folosește terenul (
        <a href={L7} target="_blank" rel="noopener noreferrer">Legea 7/1996</a>, art. 10 alin. 1).
      </p>
      <ul>
        <li>
          <strong>Cine plătește:</strong> ANCPI și primăria, din veniturile ANCPI, din fonduri europene
          și din bugetul local. Proprietarul nu plătește măsurătoarea.
        </li>
        <li>
          <strong>Cine măsoară:</strong> o firmă de cadastru autorizată, aleasă prin licitație, care
          lucrează împreună cu un reprezentant al primăriei (art. 12 alin. 9). Lucrarea o recepționează
          oficiul de cadastru județean (OCPI).
        </li>
        <li>
          <strong>Pe ce zonă:</strong> fie toată comuna, fie câte un <strong>sector cadastral</strong>,
          adică o zonă delimitată de drumuri, ape sau alte limite stabile. De aceea, o parte a satului
          poate fi gata, iar alta abia începe.
        </li>
      </ul>
      <p>
        Ai și tu obligații pe durata lucrării: să le permiți accesul celor care măsoară, să arăți actele
        și limitele terenului și să verifici datele la afișare (art. 12 alin. 3). Dacă nu ești de găsit,
        limitele se stabilesc fără tine (art. 12 alin. 8), iar atunci afișarea e singura șansă să le vezi.
      </p>

      <h2>Cum afli dacă localitatea ta e în lucru</h2>
      <p>Trei surse, în ordinea în care merită verificate:</p>
      <ol>
        <li>
          <strong>Anunțul primăriei.</strong> Înainte de afișare, primăria anunță perioada și locul,
          cu cel puțin 5 zile înainte, la sediu, pe site-ul ei și în presă (art. 11 alin. 2 lit. j).
          Anunțul spune și unde se depun cererile.
        </li>
        <li>
          <strong>
            <a href={PNCCF} target="_blank" rel="noopener noreferrer">pnccf.site</a>
          </strong>
          , portalul de afișare a documentelor tehnice, prezentat în presă și în anunțurile primăriilor
          ca pagina ANCPI pentru afișarea online, după atacul informatic din iulie 2026 care a oprit
          site-urile agenției. Alegi județul, apoi localitatea, și vezi ce sectoare sunt afișate și în ce
          perioadă. Are și o căutare după nume sau după numărul cadastral, plus o hartă a sectoarelor.
          Pentru că portalul e nou, confirmă perioada și din anunțul primăriei.
        </li>
        <li>
          <strong>Oficiul de cadastru (OCPI) al județului</strong>, dacă primăria nu știe să-ți spună.
        </li>
      </ol>
      <p>
        Dacă localitatea ta nu apare nicăieri, lucrarea nu a început încă sau e în faza de măsurători.
        Până atunci, cartea funciară existentă rămâne cea valabilă, iar{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>extrasul de carte funciară</Link> se scoate pe
        numărul de acum.
      </p>

      <h2>Afișarea publică: 60 de zile, unde și ce documente</h2>
      <p>
        Documentele stau afișate <strong>60 de zile</strong> la sediul primăriei (sau unde stabilește
        primarul), pe site-ul primăriei și pe pagina online a ANCPI (art. 11 alin. 2 lit. k; art. 14
        alin. 1). Se afișează:
      </p>
      <ul>
        <li>
          <strong>planul cadastral</strong>: harta sectorului, cu conturul fiecărei parcele și construcții;
        </li>
        <li>
          <strong>registrul cadastral al imobilelor</strong>: pentru fiecare imobil, suprafața, folosința
          și titularii;
        </li>
        <li>
          <strong>opisul alfabetic</strong>: lista proprietarilor și posesorilor, cu trimitere la imobil;
          de aici pornești dacă știi doar numele;
        </li>
        <li>
          <strong>„Date despre imobil” (Anexa 18)</strong>: fișa fiecărui imobil, cu terenul, proprietarii
          și sarcinile. Din decembrie 2024, primăria trebuie să le comunice proprietarilor înainte de publicare (
          <a href={REGULAMENT} target="_blank" rel="noopener noreferrer">
            Regulamentul aprobat prin Ordinul ANCPI 1/2020
          </a>
          , art. 46 alin. 2).
        </li>
      </ul>

      <h2>Ce verifici în opis, registru și fișa imobilului</h2>
      <ul>
        <li>
          <strong>Numele:</strong> apari tu, cu numele scris corect? Dacă imobilul e al mai multor frați
          sau al soților, apar toți, cu cotele corecte?
        </li>
        <li>
          <strong>Suprafața:</strong> diferă mult de acte? Legea înscrie suprafața măsurată, nu pe cea din
          acte (art. 11 alin. 24), iar la diferențe mari merită o discuție cu firma care a măsurat.
        </li>
        <li>
          <strong>Limitele pe plan:</strong> gardul real corespunde conturului? Mai ales spre vecini și spre
          drum.
        </li>
        <li>
          <strong>Construcțiile:</strong> sunt toate trecute? Lipsește una sau apare una demolată?
        </li>
        <li>
          <strong>Sarcinile:</strong> o ipotecă stinsă de mult apare încă? Sau, invers, ai un drept (de
          exemplu de trecere) care nu mai apare? Cine are sarcini din vechile registre trebuie să ceară
          preluarea lor tot în cele 60 de zile (art. 14 alin. 2).
        </li>
      </ul>
      <p>
        Dacă totul e corect, nu faci nimic. Datele necontestate se consideră corecte (art. 12 alin. 16) și
        intră așa în cartea funciară nouă.
      </p>

      <h2>Cererea de rectificare: cine, unde, ce acte, cine decide</h2>
      <ul>
        <li>
          <strong>Cine:</strong> orice persoană interesată, adică proprietarul, moștenitorul, posesorul sau
          cel care are o sarcină pe imobil, personal sau prin împuternicit.
        </li>
        <li>
          <strong>Ce:</strong> formularul din Anexa 8 a regulamentului, câte o cerere pentru fiecare imobil,
          cu dovezile în copie legalizată (act de proprietate, certificat de moștenitor, hotărâre etc.).
        </li>
        <li>
          <strong>Unde:</strong> la primărie, prin poștă sau curier, ori electronic (art. 48 alin. 2 din
          regulament). Locul exact e scris în anunțul de afișare.
        </li>
        <li>
          <strong>Când:</strong> în cele 60 de zile de afișare.
        </li>
        <li>
          <strong>Cine decide:</strong> o comisie cu reprezentanți ai primarului, ai firmei care a făcut
          lucrarea și ai OCPI. Soluționează în perioada afișării, dar cel târziu în 90 de zile după
          încheierea ei, printr-un proces-verbal pe care îl primești (art. 14 din Legea 7/1996; art. 49 din
          regulament).
        </li>
        <li>
          <strong>Dacă nu ești de acord:</strong> plângere la judecătorie, în 15 zile de la comunicare
          (art. 14 alin. 4).
        </li>
      </ul>
      <p>
        Legea nu prevede un tarif pentru cerere. Costurile tale sunt copiile legalizate și, dacă ai nevoie,
        dezbaterea succesiunii. Corectura propriu-zisă o face firma care a măsurat, în cadrul contractului
        cu primăria; un alt topograf, angajat separat, nu poate interveni în lucrare.
      </p>

      <h2>Dacă ai ratat termenul: corectura la OCPI și când se închide</h2>
      <p>
        După ce se deschid cărțile funciare, erorile din lucrarea sistematică se mai pot corecta din oficiu
        sau la cerere, <strong>fără plata unui tarif</strong>, la OCPI (art. 14 alin. 7). Fereastra are însă
        un capăt: se închide la <strong>prima înscriere ulterioară</strong> a unei vânzări, a unei ipoteci
        sau a altui act care transferă ori grevează imobilul, făcută după ce s-au deschis cărțile funciare
        pe toată localitatea (art. 14 alin. 8).
      </p>
      <p>
        Ce înseamnă asta: dacă vrei să vinzi sau să iei un credit cu ipotecă pe imobil, verifică întâi
        datele din cartea funciară nouă. Un{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară</Link> îți arată exact ce
        s-a înscris. După închiderea ferestrei rămân rectificarea obișnuită și instanța, mai lente și cu
        costuri.
      </p>

      <h2>Proprietar neidentificat sau posesor fără acte</h2>
      <p>
        Dacă firma nu a găsit acte și nici pe cineva care să folosească imobilul, în cartea funciară se
        notează <strong>„proprietar neidentificat”</strong>, fără intabularea cuiva (art. 13 alin. 15).
        Adevăratul proprietar se poate intabula ulterior, cu actul de proprietate și un certificat de la
        primărie că imobilul din act e cel din plan și că apare în evidențele fiscale sau în registrul
        agricol. Legea nu prevede ca terenul să treacă automat la comună după un termen.
      </p>
      <p>
        Cine folosește imobilul fără acte e trecut ca <strong>posesor</strong>, pe baza unei fișe semnate
        și a unei adeverințe de la primărie. Dacă în 3 ani de la notare nu apare niciun litigiu, posesorul
        e intabulat din oficiu ca proprietar (art. 13 alin. 7). Dacă te privește, cei 3 ani sunt motivul
        să reacționezi repede.
      </p>

      <h2>Moșteniri nedezbătute, construcții, diferențe de suprafață</h2>
      <ul>
        <li>
          <strong>Moștenire nedezbătută:</strong> primăria sesizează Camera Notarilor, iar ANCPI plătește
          onorariul notarului pentru certificatul de moștenitor, fără impozit pe transfer (art. 9
          alin. 7–11). Atenție: dacă certificatul se eliberează la mai mult de 2 ani de la sesizare, nu
          mai e plătit de ANCPI.
        </li>
        <li>
          <strong>Mai mulți proprietari cu acte diferite</strong> pe același teren: se deschide o singură
          carte funciară, fără intabulare, până la o hotărâre judecătorească (art. 14 alin. 6¹).
        </li>
        <li>
          <strong>Construcții fără autorizație:</strong> se înscriu, dar asta nu șterge eventualele
          sancțiuni și le aduce în calculul impozitului (art. 12 alin. 17).
        </li>
        <li>
          <strong>Suprafață mai mică decât în titlu:</strong> dacă tarlaua întreagă are un deficit, se
          scade proporțional din toate titlurile (art. 11 alin. 20). Nu e o greșeală individuală, deci
          verifică întâi suprafața totală a tarlalei.
        </li>
      </ul>

      <h2>După finalizare: carte funciară nouă, număr nou, impozit</h2>
      <p>
        La final, fiecare imobil primește o <strong>carte funciară electronică nouă</strong>, iar numărul
        cadastral e același cu numărul cărții funciare. Vechile cărți funciare și numerele din actele vechi
        nu mai identifică imobilul (art. 15 din Legea 7/1996): de acum, proprietatea se dovedește cu
        extrasul de carte funciară, iar limitele cu extrasul din planul cadastral.
      </p>
      <ul>
        <li>
          <strong>Numărul nou:</strong> legea prevede că extrasul de carte funciară și extrasul din planul
          cadastral se comunică proprietarului prin primărie. Dacă nu le ai, numărul îl afli după adresă
          sau după nume, cu o{' '}
          <Link href={serviceUrl('identificare-imobil')}>identificare a imobilului</Link>, sau după pașii
          din <Link href="/cum-aflam-numarul-carte-functionara-si-nr-cadastral/">ghidul despre numărul de
          carte funciară</Link>.
        </li>
        <li>
          <strong>Extrasul pentru notar, bancă sau vânzare:</strong> se scoate pe numărul nou. Pe cel vechi,
          căutarea poate întoarce mai multe imobile sau niciunul. Când comanzi un{' '}
          <Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară</Link> la noi, trece
          și satul și strada: le folosim ca să alegem imobilul corect când un număr vechi se repetă în
          aceeași comună.
        </li>
        <li>
          <strong>Impozitul:</strong> dacă suprafața măsurată e mai mare decât cea din acte, impozitul se
          calculează pe suprafața reală, de la 1 ianuarie a anului următor (Codul fiscal, art. 461 alin. 9
          și art. 466 alin. 6).
        </li>
      </ul>
      {extrasCf && (
        <ArticleInlineCta
          card={extrasCf}
          title="Ai nevoie de extrasul pe numărul nou?"
          text="Îl obținem de la ANCPI și ți-l trimitem pe email. La comandă scrii comuna, satul și numărul de carte funciară."
        />
      )}

      <h2>Ce ai de făcut, pas cu pas</h2>
      <ol>
        <li>Urmărește anunțul primăriei și pnccf.site pentru localitatea ta.</li>
        <li>
          În cele 60 de zile, caută-te în opis și verifică fișa imobilului: nume, cote, suprafață, limite,
          construcții, sarcini.
        </li>
        <li>Dacă e ceva greșit, depune la primărie cererea de rectificare, cu copii legalizate după acte.</li>
        <li>
          După finalizare, ia-ți numărul nou de carte funciară și verifică extrasul înainte de orice vânzare
          sau credit.
        </li>
      </ol>
      <p>
        Ce s-a schimbat la ANCPI după atacul din iulie 2026 și ce platforme funcționează acum găsești în{' '}
        <Link href="/ancpi-nu-functioneaza/">articolul despre ANCPI</Link>. Tarifele pentru cadastrul făcut
        pe cont propriu, în afara programului, sunt în{' '}
        <Link href="/cat-costa-cadastrul-si-intabularea/">ghidul despre costul cadastrului</Link>.
      </p>
      <p className="text-sm text-neutral-500">
        Surse: <a href={L7} target="_blank" rel="noopener noreferrer">Legea 7/1996</a>, forma consolidată
        din 13.07.2026; <a href={REGULAMENT} target="_blank" rel="noopener noreferrer">Regulamentul aprobat
        prin Ordinul ANCPI 1/2020</a>, forma consolidată din 30.12.2024; Codul fiscal, forma consolidată din
        01.07.2026. eGhișeul este un serviciu privat, nu o instituție publică și nu e afiliat ANCPI.
      </p>
    </ArticleLayout>
  );
}
