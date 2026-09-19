import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'rolul-si-atributiile-onrc-romania';
const TITLE = 'Ce face ONRC: registrul comerțului, mențiunile și cele trei proceduri pe care le caută toată lumea';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Ce face ONRC: registrul, radierea, sediul și suspendarea firmei';
const DESCRIPTION =
  'Ce ține ONRC în registrul comerțului (Legea 265/2022), ce se plătește și ce nu, și cum se fac concret ' +
  'radierea unui SRL, schimbarea sediului social și suspendarea activității: acte, termene, capcane.';
// Data la care articolul e verificabil la acest URL (migrarea din WordPress).
// Înainte aici scria '2024-01-01' — un placeholder identic pe 12 articole, adică
// o dată inventată în schema. Dacă apare dovada datei reale de pe WP, se corectează.
const DATE_PUBLISHED = '2026-06-16';
const DATE_MODIFIED = '2026-09-09';

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
      category="Comercial / ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        {
          slug: 'certificat-constatator',
          label: 'Certificat Constatator ONRC',
          desc: 'Îl obținem noi din registrul comerțului și îl primești pe email, semnat electronic.',
        },
        {
          href: '/eliberare-certificat-constatator-onrc-ghid/',
          label: 'Ghid: certificatul constatator',
          desc: 'Cele trei tipuri, ce dovedește fiecare și cât este acceptat în practică.',
        },
        {
          href: '/cazier-fiscal-fara-spv/',
          label: 'Ghid: cazierul fiscal',
          desc: 'Documentul pe care ONRC îl ia singur de la ANAF la înființare, cesiune sau numire de administrator.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este ONRC și cine îl conduce?',
          a: 'Oficiul Național al Registrului Comerțului este instituția publică, aflată în subordinea Ministerului Justiției, care ține registrul comerțului (Legea 265/2022 art. 19). Registrul este serviciul public prin care se înregistrează și se fac publice firmele, PFA-urile, întreprinderile individuale și familiale (art. 4). În fiecare județ funcționează un oficiu al registrului comerțului de pe lângă tribunal.',
        },
        {
          q: 'Se plătește ceva la ONRC pentru înmatriculare sau pentru o mențiune?',
          a: 'Nu. Legea 265/2022 art. 44 spune că pentru înmatriculare și pentru înregistrarea mențiunilor nu se percep taxe și tarife. Se plătește separat doar publicarea în Monitorul Oficial, Partea a IV-a, acolo unde legea o cere (de exemplu la dizolvare), cu 152 lei pe pagina de manuscris în 2026, și documentele cerute din registru, cum e certificatul constatator, 30 lei.',
        },
        {
          q: 'Cât durează soluționarea unei cereri la registrul comerțului?',
          a: 'O zi lucrătoare de la înregistrarea cererii, pe bază de înscrisuri, potrivit Legii 265/2022 art. 105. Dacă dosarul are lipsuri, registratorul dă un termen de completare și soluționarea se mută. Încheierea se publică în Buletinul electronic al registrului comerțului și se poate consulta gratuit.',
        },
        {
          q: 'Cât durează radierea unui SRL?',
          a: 'Cel puțin 30 de zile de la publicarea hotărârii de dizolvare în Monitorul Oficial, pentru că abia după acest termen se poate depune cererea de radiere (Legea 31/1990 art. 234, art. 62). În practică, cu dizolvare și lichidare simultană, o firmă fără datorii și fără active de împărțit se închide în aproximativ două luni. Cu lichidator, lichidarea trebuie terminată în cel mult un an de la înscrierea dizolvării, termen care se poate prelungi de două ori cu câte un an (art. 260).',
        },
        {
          q: 'Cât timp poate sta o firmă suspendată?',
          a: 'Cel mult 3 ani de la înscrierea mențiunii în registrul comerțului. Dacă activitatea nu se reia după acest termen, tribunalul poate dizolva societatea la cererea ONRC sau a oricărei persoane interesate (Legea 31/1990 art. 237 alin. (1) lit. d)).',
        },
        {
          q: 'Trebuie să anunț ANAF după ce am suspendat firma la ONRC?',
          a: 'Din 3 februarie 2022 nu mai e nevoie de o cerere separată: entitățile cu inactivitate temporară înscrisă în registrul comerțului nu mai au obligația să depună declarații fiscale începând cu data de 1 a lunii următoare înscrierii mențiunii (Codul de procedură fiscală art. 101, introdus prin OG 11/2022). Rămân obligațiile pentru perioada de dinainte și situațiile financiare anuale.',
        },
        {
          q: 'La mutarea sediului social în alt județ se schimbă și numărul de înregistrare?',
          a: 'Da. Firma este înregistrată la oficiul din județul nou și primește un număr de ordine nou, iar lista ONRC pentru transfer include și cererea de verificare a disponibilității denumirii. CUI-ul rămâne același.',
        },
      ]}
    >
      <p>
        Dacă ai firmă, ONRC e instituția cu care ai de-a face de trei ori pe an fără să vrei și
        de câteva ori în viață când chiar contează: la înființare, când muți sediul, când pui
        firma pe pauză și când o închizi. Pagina asta explică ce ține de fapt registrul
        comerțului, ce se plătește și ce nu, și apoi cele trei proceduri pentru care lumea
        ajunge aici: radierea, schimbarea sediului social și suspendarea. Cu actele din listele
        ONRC și cu articolele de lege lângă fiecare termen.
      </p>

      <h2>Ce este registrul comerțului</h2>
      <p>
        Legea care contează din noiembrie 2022 este Legea 265/2022. Ea a abrogat Legea 26/1990,
        pe care încă o citează multe ghiduri și chiar unele modele de certificate. Art. 4 spune
        că registrul comerțului este serviciul public de interes general prin care se
        înregistrează și se fac publice societățile, PFA-urile, întreprinderile individuale și
        cele familiale, iar art. 19 că ONRC este instituție publică în subordinea Ministerului
        Justiției. În fiecare județ există un oficiu pe lângă tribunal, dar din 2022 cererea se
        poate depune la oricare dintre ele (art. 85).
      </p>
      <p>
        Pentru fiecare firmă registrul ține denumirea, numărul de ordine (J pentru societăți, F
        pentru PFA și întreprinderi), CUI-ul, sediul, durata, starea (în funcțiune, suspendată,
        în insolvență, dizolvată, radiată), obiectul de activitate pe coduri CAEN, asociații,
        administratorii și capitalul social. O parte din date sunt gratuite pentru oricine, pe
        portalul ONRC, prin art. 12: denumirea și forma juridică, sediul, numărul de ordine, CUI
        și EUID, starea firmei și reprezentanții legali. Restul se eliberează la cerere, contra
        cost, sub forma certificatului constatator sau a furnizării de informații (art. 11).
      </p>
      <p>
        Partea pe care merită să o înțelegi este opozabilitatea. Art. 46 spune că înmatricularea
        și mențiunile sunt opozabile terților de la data înregistrării, iar dacă între registru
        și actele din dosar există neconcordanțe, față de terți prevalează registrul. Tradus:
        dacă ai schimbat administratorul prin hotărâre AGA dar nu ai înregistrat mențiunea, pentru
        bancă și pentru furnizori administratorul este tot cel vechi. Același articol adaugă că
        operațiunile făcute înainte de a 16-a zi de la înregistrare nu pot fi opuse terților care
        dovedesc că nu au avut cum să afle de ele.
      </p>

      <h2>Ce face ONRC, concret</h2>
      <p>
        Înmatriculează firme noi și înregistrează mențiuni, adică orice schimbare în actele
        firmei: sediu, denumire, asociați, administratori, coduri CAEN, capital, suspendare,
        dizolvare. Termenul de depunere a unei mențiuni este de 15 zile de la data actului care
        o generează (art. 43), iar registratorul soluționează cererea pe bază de înscrisuri în
        termen de o zi lucrătoare (art. 105). Registratorul, nu judecătorul delegat: din 2022
        cererile se soluționează prin încheiere a registratorului, iar prezența fizică se cere
        doar când există suspiciuni de fals.
      </p>
      <p>
        Publică. ONRC editează Buletinul electronic al registrului comerțului (art. 15), unde
        apar din oficiu încheierile registratorului, iar consultarea este gratuită. Publicarea în
        Monitorul Oficial, Partea a IV-a, a rămas obligatorie doar acolo unde legea o cere
        expres, de exemplu la dizolvare, iar actele se transmit de ONRC către Monitorul Oficial în
        cel mult 3 zile lucrătoare de la înregistrare (art. 16).
      </p>
      <p>
        Eliberează documente despre ce scrie în registru: certificatul constatator, furnizarea de
        informații, raportul istoric, copii certificate. Despre certificat am scris separat, în{' '}
        <Link href="/eliberare-certificat-constatator-onrc-ghid/">
          ghidul certificatului constatator
        </Link>
        , pentru că are trei variante și fiecare dovedește altceva.
      </p>
      <p>
        Și, mai puțin vizibil, ONRC verifică singur o parte din dosar. La înființare, la
        cesiunea de părți sociale sau la numirea unui administrator nou, cazierul fiscal al
        persoanelor implicate nu îl mai aduci tu: ONRC îl cere electronic de la ANAF, care
        răspunde în cel mult 2 ore (OG 39/2015 art. 8 alin. (2)). Dacă acolo apare o faptă
        înscrisă, cererea este respinsă, iar solicitantul află abia atunci. Detaliile sunt în{' '}
        <Link href="/cazier-fiscal-fara-spv/">ghidul cazierului fiscal</Link>.
      </p>

      <h2>Ce se plătește și ce nu</h2>
      <p>
        Regula e simplă și surprinzător de puțin cunoscută: pentru înmatriculare și pentru
        înregistrarea mențiunilor nu se percep taxe și tarife (Legea 265/2022 art. 44). Cine îți
        cere „taxa ONRC” pentru o schimbare de sediu îți cere de fapt propriul onorariu.
      </p>
      <p>
        Există două costuri reale, amândouă în afara ONRC. Primul este publicarea în Monitorul
        Oficial, Partea a IV-a, acolo unde legea o cere: 152 lei pe pagina de manuscris în 2026
        (Decizia Biroului permanent al Camerei Deputaților nr. 1/2026, publicată în Monitorul
        Oficial nr. 88 din 4 februarie 2026), iar o pagină de manuscris înseamnă 2.000 de semne
        cu spații, deci o hotărâre de dizolvare bine scrisă încape într-una. Al doilea sunt
        documentele pe care le ceri din registru, tarifate prin Ordinul ministrului justiției nr.
        380/C/2024, în vigoare din 20 martie 2024: certificatul constatator 30 lei, furnizarea de
        informații 9 lei pe firmă, raportul istoric 250 lei pe firmă, copiile certificate 10 lei
        plus 1,5 lei pe pagină.
      </p>

      <h2>Radierea unui SRL</h2>
      <p>
        „Radiere” este ultimul pas dintr-un lanț cu trei verigi: dizolvare, lichidare, radiere.
        Pentru un SRL în care asociații se înțeleg, Legea 31/1990 art. 235 permite să hotărăști
        dizolvarea și modul de lichidare în aceeași hotărâre, cu cvorumul și majoritatea cerute
        pentru modificarea actului constitutiv, cu condiția să asiguri plata datoriilor sau
        înțelegerea cu creditorii. Este varianta pe care o folosesc aproape toate firmele mici,
        pentru că sare peste numirea unui lichidator. Împărțirea activelor rămase între asociați
        cere însă vot unanim, iar dacă unanimitatea lipsește, se intră în procedura clasică de
        lichidare.
      </p>
      <h3>Etapa I: dizolvarea cu lichidare simultană</h3>
      <p>
        Lista ONRC pentru această etapă are două piese obligatorii: cererea de înregistrare și
        hotărârea asociaților (sau decizia asociatului unic) de dizolvare și lichidare simultană.
        Dacă e cazul, se adaugă dovada acordului creditorilor pentru stingerea sau regularizarea
        datoriilor și împuternicirea persoanei care depune. Plus dovada plății tarifului de
        publicare în Monitorul Oficial, pentru că dizolvarea trebuie înscrisă în registru și
        publicată în Partea a IV-a (art. 232).
      </p>
      <h3>Cele 30 de zile</h3>
      <p>
        De aici vine durata minimă. Dizolvarea are efect față de terți abia după 30 de zile de la
        publicarea în Monitorul Oficial (art. 234), iar în același termen orice creditor poate
        face opoziție (art. 62). Pagina ONRC spune explicit că cererea din etapa a II-a se depune
        după trecerea acestor 30 de zile. Termenul nu se cumpără și nu se grăbește; există tocmai
        ca o firmă să nu dispară peste noapte cu facturi neplătite în urmă.
      </p>
      <h3>Etapa a II-a: radierea</h3>
      <p>
        Lista ONRC este scurtă: cererea de înregistrare completată la secțiunea de radiere,
        dovada publicării hotărârii de dizolvare (pe care ONRC o confirmă din oficiu, nu o aduci
        tu) și dovada calculării, reținerii și plății impozitului pe venitul din lichidare, cerută
        de art. 235 alin. (2) din Legea 31/1990 prin trimitere la art. 97 alin. (5) din Codul
        fiscal. Impozitul ăsta apare oricând asociații primesc ceva din lichidare, bani sau
        bunuri, și e motivul pentru care contabilul trebuie să închidă situația financiară de
        lichidare înainte de cererea de radiere. Transmiterea proprietății asupra bunurilor
        rămase se face la data radierii (art. 235 alin. (3)), iar registrul eliberează fiecărui
        asociat un certificat constatator al dreptului asupra activelor distribuite, cu care se
        poate intabula un imobil (alin. (4)).
      </p>
      <p>
        Un lucru pe care ghidurile vechi îl repetă și care nu apare în lista actuală a ONRC:
        certificatul de atestare fiscală „fără datorii”. ONRC nu îl cere ca document la radiere.
        Datoriile contează în alt fel: art. 235 condiționează dizolvarea simultană de asigurarea
        plății pasivului, iar ANAF poate face opoziție în cele 30 de zile. O firmă cu impuneri
        din oficiu pentru declarații nedepuse nu trece de aici fără să le regularizeze.
      </p>
      <h3>Cu lichidator, când nu există înțelegere</h3>
      <p>
        Dacă asociații nu cad de acord asupra împărțirii sau firma are datorii care nu se pot
        regulariza, se numește un lichidator. Lichidarea trebuie terminată în cel mult un an de la
        înregistrarea mențiunii de dizolvare, iar oficiul o poate prelungi de cel mult două ori,
        cu câte un an (art. 260). La 3 luni după expirarea termenului, ONRC sau orice persoană
        interesată cere tribunalului radierea.
      </p>
      <h3>Ce rămâne după radiere</h3>
      <p>
        Firma dispare, urmele nu neapărat. Dacă firma fusese declarată inactivă fiscal înainte
        de radiere, inactivitatea rămâne înscrisă în cazierul fiscal al reprezentanților legali
        încă un an de la data radierii (OG 39/2015 art. 6 alin. (1) lit. j)). Iar dacă un
        administrator a fost ținut răspunzător patrimonial pentru datoriile firmei ajunse în
        insolvență, fapta intră în cazierul lui personal (art. 4 alin. (4) lit. b)) și îl
        blochează de la a mai înființa sau administra o societate până se scoate din evidență.
        Radierea făcută curat e, de fapt, biletul de intrare pentru următoarea firmă.
      </p>

      <h2>Schimbarea sediului social</h2>
      <p>
        Mutarea sediului este o mențiune ca oricare alta, cu o singură diferență importantă
        între același județ și alt județ. Lista ONRC pentru același județ cuprinde:
      </p>
      <ul>
        <li>cererea de înregistrare;</li>
        <li>
          declarația pe propria răspundere privind îndeplinirea condițiilor de funcționare pentru
          noul sediu;
        </li>
        <li>
          hotărârea adunării generale sau decizia asociatului unic, cu adresa nouă completă;
        </li>
        <li>
          documentul care atestă dreptul de folosință asupra spațiului: contract de închiriere,
          de comodat sau act de proprietate;
        </li>
        <li>actul constitutiv actualizat, în original;</li>
        <li>
          dacă sediul e într-un bloc de locuințe, avizul asociației de proprietari privind
          schimbarea destinației, pe formularul tip, cerut de Legea 196/2018;
        </li>
        <li>dovada plății tarifului de publicare în Monitorul Oficial, Partea a IV-a.</li>
      </ul>
      <p>
        Avizul asociației e pasul care ia cel mai mult timp și cu care se începe. Legea 196/2018
        art. 40 cere acordul scris al comitetului executiv și acordul prealabil scris al
        proprietarilor direct afectați, cei cu care spațiul se învecinează pe orizontală și pe
        verticală, plus o convenție privind activitatea declarată și numărul de persoane pe care
        se calculează cheltuielile. Vecinul de la etaj care nu răspunde la ușă poate amâna o
        mențiune cu săptămâni.
      </p>
      <p>
        Ce nu mai apare în lista ONRC: certificatul de la ANAF privind sediul, pe care îl cereau
        procedurile de dinainte de 2022. Dovada dreptului de folosință plus declarația pe propria
        răspundere îi țin locul.
      </p>
      <h3>În alt județ</h3>
      <p>
        Transferul într-un alt județ înseamnă înregistrarea firmei la oficiul din județul nou.
        Lista ONRC adaugă cererea de verificare a disponibilității și de rezervare a denumirii,
        iar firma primește un număr de ordine nou; CUI-ul rămâne. Partenerii care te au în
        evidențe pe numărul vechi (banca, platformele de licitații, furnizorii cu contracte
        cadru) îți vor cere actele actualizate.
      </p>
      <h3>După ONRC</h3>
      <p>
        Încheierea registratorului se publică în Buletinul electronic și se poate vedea gratuit
        pe portalul ONRC. De aici încolo urmează partea care consumă timp: declarația de mențiuni
        la ANAF pentru schimbarea domiciliului fiscal (formularul 010, respectiv 700 pentru
        depunerea online), certificatul de înregistrare fiscală refăcut, banca, care aproape
        întotdeauna cere un{' '}
        <Link href={serviceUrl('certificat-constatator')}>certificat constatator</Link> emis
        după modificare ca dovadă că adresa nouă e în registru, facturile și site-ul cu adresa
        nouă. Contractele în derulare se actualizează prin act adițional doar dacă cealaltă parte
        o cere.
      </p>
      <h3>Ce întoarce dosarul</h3>
      <p>
        Un contract de sediu expirat la data depunerii. O adresă incompletă în hotărâre față de
        cea din contract: bloc, scară, etaj, apartament, toate trebuie să bată literă cu literă.
        Și problemele mai vechi din registru, mandat de administrator expirat sau capital
        nevărsat, care blochează orice mențiune nouă. Un certificat constatator scos înainte de a
        porni procedura arată exact ce e înscris la zi și scutește un drum. Lipsa unui înscris
        obligatoriu atrage respingerea cererii (Legea 265/2022 art. 77), iar redepunerea înseamnă
        o nouă zi lucrătoare de așteptare.
      </p>

      <h2>Suspendarea activității</h2>
      <p>
        Când firma nu mai are comenzi dar nu vrei să o închizi, legea oferă o pauză: inactivitatea
        temporară, înscrisă la registrul comerțului. Dosarul e cel mai scurt dintre cele trei.
        Lista ONRC: cererea de înregistrare, hotărârea adunării generale sau decizia asociatului
        unic privind suspendarea, în care trebuie scrisă data până la care se suspendă, și
        declarația pe propria răspundere din care rezultă că firma nu desfășoară nicio activitate
        din obiectul ei, nici la sediu, nici la sediile secundare, nici în afara lor. Fără
        publicare în Monitorul Oficial; încheierea apare în Buletinul electronic.
      </p>
      <h3>Termenul de 3 ani</h3>
      <p>
        Întreruperea nu poate depăși 3 ani de la înscrierea mențiunii. Consecința la capătul
        termenului e serioasă: Legea 31/1990 art. 237 alin. (1) lit. d) permite tribunalului, la
        cererea ONRC sau a oricărei persoane interesate, să dizolve societatea care nu și-a reluat
        activitatea după perioada de inactivitate temporară. ONRC afișează listele firmelor pentru
        care urmează să ceară dizolvarea cu cel puțin 15 zile înainte. Cine știe de la început că
        nu va mai folosi firma economisește trei ani de obligații administrative mergând direct
        pe radiere.
      </p>
      <h3>Partea fiscală, care s-a schimbat în 2022</h3>
      <p>
        Până în 2022, după mențiunea de la ONRC trebuia cerut separat la ANAF un regim de
        declarare derogatoriu, iar cine uita pasul descoperea după câteva luni un șir de
        declarații nedepuse și amenzile aferente. OG 11/2022 a rezolvat problema din oficiu: de la
        3 februarie 2022, entitățile cu inactivitate temporară înscrisă în registrul comerțului nu
        mai au obligația să depună declarațiile fiscale aferente perioadei, începând cu data de 1
        a lunii următoare înscrierii mențiunii (Codul de procedură fiscală art. 101). Scutirea
        încetează la reluarea activității sau la împlinirea celor 3 ani. Obligațiile pentru
        perioada de dinainte rămân.
      </p>
      <p>
        Ce nu dispare: situațiile financiare anuale. Declarația de inactivitate care ține loc de
        bilanț există doar pentru firmele care nu au avut activitate de la înființare (Legea
        contabilității 82/1991 art. 36 alin. (2)); o firmă care a funcționat și apoi s-a suspendat
        depune în continuare situațiile anuale, chiar pe zero. Nedepunerea lor cu o întârziere de
        peste 60 de zile lucrătoare e, separat, cauză de dizolvare (Legea 31/1990 art. 237 alin.
        (1) lit. f)). Rămân și sediul social valabil pe toată durata, pentru că expirarea
        contractului de sediu este tot cauză de dizolvare (lit. c)), evidența contabilă și
        datoriile existente, pe care suspendarea nu le amână.
      </p>
      <h3>Suspendare corectă versus inactivitate fiscală</h3>
      <p>
        Sunt două lucruri diferite și confuzia costă. Suspendarea e decizia ta, înscrisă la ONRC.
        Inactivitatea fiscală e o sancțiune declarată de ANAF, de pildă pentru declarații
        nedepuse un semestru sau pentru sediu expirat, și ajunge în cazierul fiscal al firmei și
        al administratorilor din perioada respectivă. OG 39/2015 art. 4 alin. (4) lit. c)
        exceptează expres inactivitatea fiscală declarată ca urmare a inactivității temporare
        înscrise la registrul comerțului. Cu alte cuvinte, firma suspendată corect nu lasă urme în
        cazier; firma lăsată „în aer”, nesuspendată și nedeclarată, lasă.
      </p>
      <h3>Reluarea</h3>
      <p>
        Mențiune în oglindă: cerere, hotărârea de reluare și declarația pe propria răspundere
        privind condițiile de funcționare, la care se adaugă avizul asociației de proprietari dacă
        sediul e într-un bloc. De la ANAF, vectorul fiscal se reactivează prin declarație de
        mențiuni.
      </p>

      <h2>Suspendare, radiere sau vânzare</h2>
      <p>
        Suspendă dacă pauza e reală și are un capăt: sezonalitate, o plecare limitată, un an
        prost. Costul e administrativ (situațiile anuale, sediul), dar istoricul firmei și
        eventualele autorizații se păstrează. Radiază dacă activitatea s-a încheiat; procedura e
        mai lungă, dar după ea nu mai există nicio obligație. Vinde părțile sociale doar dacă firma
        are ceva de valoare pentru cumpărător, istoric, licențe, contracte, pentru că altfel
        cesiunea aduce aceleași verificări de cazier fiscal ale noilor asociați (OG 39/2015 art.
        8 alin. (1) lit. d)) fără vreun câștig. Și, în orice variantă, nu lăsa firma nefolosită
        fără mențiune: declarațiile curg, amenzile se adună, iar inactivitatea fiscală ajunge în
        cazierul tău, nu doar al firmei.
      </p>

      <h2>Unde găsești ONRC</h2>
      <p>
        Portalul de servicii online este myportal.onrc.ro, cu cont și, pentru depunerea cererilor,
        semnătură electronică calificată (Legea 265/2022 art. 84). Pentru documente din registru
        fără semnătură electronică există serviciul InfoCert, cu plata doar prin card. Oficiile
        județene au program cu publicul în timpul săptămânii, iar formularele tip se descarcă
        gratuit de pe onrc.ro sau se dau la ghișeu. Dacă îți trebuie doar certificatul
        constatator și nu vrei cont pe portal,{' '}
        <Link href={serviceUrl('certificat-constatator')}>îl obținem noi</Link> și îl primești pe
        email; ce plătești în plus față de tariful ONRC de 30 lei e munca noastră, nu documentul.
      </p>
    </ArticleLayout>
  );
}
