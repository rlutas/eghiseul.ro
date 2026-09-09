import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'eliberare-certificat-constatator-onrc-ghid';
const TITLE = 'Certificatul constatator ONRC: cele trei tipuri, ce dovedește fiecare și cât e acceptat în practică';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Certificat constatator ONRC: tipuri, conținut, valabilitate';
const DESCRIPTION =
  'Certificatul constatator de bază, pentru fonduri IMM și pentru insolvență: ce scrie în fiecare, ce nu ' +
  'dovedește, ce înseamnă „la zi”, de ce băncile și licitațiile cer 30 de zile deși legea nu o face, ' +
  'și cum îl ceri de la ONRC cu 30 lei.';
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
          desc: 'Îl obținem noi din registrul comerțului, semnat electronic, fără cont pe portal.',
        },
        {
          href: '/cele-4-tipuri-de-certificat-constatator-online/',
          label: 'Care tip îți trebuie',
          desc: 'Comparația pe situații: bancă, licitație, fonduri, notar, angajare.',
        },
        {
          href: '/rolul-si-atributiile-onrc-romania/',
          label: 'Ce face ONRC',
          desc: 'Registrul comerțului, mențiunile, radierea, sediul și suspendarea firmei.',
        },
      ]}
      faqs={[
        {
          q: 'Cât costă certificatul constatator la ONRC?',
          a: '30 lei, indiferent de tip, potrivit Ordinului ministrului justiției nr. 380/C/2024, în vigoare din 20 martie 2024. Raportul istoric al firmei costă 250 lei, iar furnizarea de informații (doar datele de identificare) 9 lei pe firmă. Dacă îl ceri printr-un intermediar, diferența față de 30 lei este onorariul acestuia.',
        },
        {
          q: 'Cât este valabil certificatul constatator?',
          a: 'Legea 265/2022 nu fixează un termen de valabilitate: certificatul atestă ce era înscris în registru la data generării lui. Termenul de 30 de zile pe care îl cer băncile, notarii sau autoritățile contractante este o regulă a instituției care îl primește, nu a ONRC. La achiziții publice, normele cer ca informațiile din certificat să fie reale și actuale la data prezentării.',
        },
        {
          q: 'Cine poate cere certificatul constatator al unei firme?',
          a: 'Oricine. Registrul comerțului este public (Legea 265/2022 art. 11), iar certificatul se eliberează la cererea și pe cheltuiala persoanei interesate. Nu trebuie să fii administrator sau asociat. Îți trebuie doar CUI-ul sau denumirea firmei.',
        },
        {
          q: 'Care este diferența dintre certificatul de bază și cel pentru fonduri IMM?',
          a: 'Amândouă pornesc de la aceleași date de identificare, sediu, capital, asociați, administratori și activități. Varianta pentru fonduri IMM adaugă indicatorii din situațiile financiare anuale depuse: cifra de afaceri, profitul brut și net și numărul mediu de salariați, adică exact cifrele după care se judecă încadrarea în categoria IMM la finanțări nerambursabile.',
        },
        {
          q: 'Ce dovedește certificatul constatator pentru insolvență?',
          a: 'Că în registrul comerțului este sau nu este înscrisă vreo mențiune privind insolvența, reorganizarea, falimentul, dizolvarea sau lichidarea firmei. Legea 265/2022 art. 11 prevede expres certificatele care atestă că un anumit act sau fapt nu este înregistrat. Îl cer de regulă instanțele, notarii și autoritățile contractante.',
        },
        {
          q: 'Certificatul constatator arată datoriile firmei?',
          a: 'Nu. Registrul comerțului nu ține evidența datoriilor la buget sau la furnizori. Pentru datoriile fiscale există certificatul de atestare fiscală de la ANAF, pentru sancțiunile fiscale cazierul fiscal, iar pentru gajuri și ipoteci mobiliare Registrul Național de Publicitate Mobiliară. Certificatul constatator arată doar ce este înscris în registrul comerțului.',
        },
        {
          q: 'Certificatul constatator în format PDF este acceptat?',
          a: 'Da. Legea 265/2022 art. 11 alin. (3) prevede eliberarea în formă electronică, semnată cu semnătură sau sigiliu electronic calificat al ONRC. Instituția care îl primește verifică semnătura la deschiderea fișierului. Copia tipărită a unui PDF nu mai poartă semnătura, deci se transmite fișierul, nu scanul lui.',
        },
        {
          q: 'Ce fac dacă informațiile din certificat sunt greșite?',
          a: 'Certificatul reproduce registrul. Dacă registrul e în urmă, de exemplu pentru că o schimbare de administrator nu a fost înregistrată, se depune mențiunea la ONRC, în termenul de 15 zile de la actul modificator prevăzut de Legea 265/2022 art. 43, și se cere un certificat nou după înregistrare. Dacă eroarea este a registrului, se cere îndreptarea ei la oficiul care a făcut înscrierea.',
        },
      ]}
    >
      <p>
        Certificatul constatator e documentul pe care îl cere banca la deschiderea contului,
        finanțatorul la dosarul de fonduri, notarul la vânzarea unui imobil al firmei și
        autoritatea contractantă la licitație. Toți îl numesc la fel și fiecare vrea, de fapt,
        altceva din el. Mai jos: ce este, ce variante există, ce dovedește și ce nu, și de ce
        „valabil 30 de zile” nu scrie nicăieri în lege, dar îl cer toți.
      </p>

      <h2>Ce este, în termenii legii</h2>
      <p>
        Registrul comerțului este public. Legea 265/2022 art. 11 alin. (1) spune că oficiul
        eliberează, la cererea și pe cheltuiala persoanei interesate, informații și certificate
        constatatoare despre datele înregistrate, precum și certificate constatatoare că un anumit
        act sau fapt nu este înregistrat. Din această frază vin toate cele trei tipuri: primele
        două atestă ce scrie în registru, al treilea atestă o absență.
      </p>
      <p>
        Certificatul nu este o evaluare și nu conține opinia nimănui. E o fotografie a
        înregistrărilor din registru la momentul generării, semnată electronic de ONRC. Pe
        document scrie „Raport generat în data de”, iar ONRC îl descrie ca prezentând starea la
        zi a firmei. Tot ce urmează pleacă de la această idee: certificatul e exact atât de bun
        cât e registrul, și exact atât de proaspăt cât e data generării.
      </p>

      <h2>Ce conține certificatul de bază</h2>
      <p>
        Conform descrierii ONRC, certificatul constatator pe firmă cuprinde denumirea, numărul
        de ordine în registrul comerțului, CUI-ul, identificatorul unic la nivel european (EUID),
        forma juridică, durata de funcționare, starea firmei, activitatea principală, capitalul
        social, administratorii, asociații sau acționarii, activitățile secundare, activitățile
        autorizate, sediile secundare cu reprezentanții lor, cenzorii, cinci indicatori din
        situațiile financiare anuale disponibile și alte informații, după caz.
      </p>
      <p>
        Două rubrici sunt citite mai rar și spun cel mai mult. Prima e „Stare firmă”: în
        funcțiune, întrerupere temporară de activitate, dizolvare, insolvență, radiată. A doua e
        secțiunea sediului, care arată actul de sediu, data de început și data expirării dovezii
        de sediu. Un contract de comodat expirat se vede aici înainte să devină problemă la ANAF,
        iar banca sau finanțatorul care citește rubrica o va observa înaintea ta.
      </p>
      <p>
        Ce nu conține: datorii, litigii, salariați nominal, contracte, conturi bancare.
        Registrul comerțului nu ține evidența niciunuia dintre ele. Cine vrea datoriile la buget
        cere certificatul de atestare fiscală, cine vrea sancțiunile fiscale cere{' '}
        <Link href="/cazier-fiscal-fara-spv/">cazierul fiscal</Link>, iar cine vrea garanțiile
        mobiliare consultă Registrul Național de Publicitate Mobiliară. Un certificat constatator
        impecabil poate aparține unei firme cu datorii la zi; documentul nu a promis niciodată
        altceva.
      </p>

      <h2>Cele trei tipuri pe firmă</h2>
      <p>
        ONRC publică specimene pentru trei variante eliberate prin InfoCert: de bază, pentru
        fonduri IMM și pentru insolvență. Toate trei costă la fel, 30 lei, și toate pornesc de la
        aceleași date de identificare. Diferă ce au în plus și cine le cere.
      </p>
      <h3>De bază</h3>
      <p>
        E varianta pe care o vor băncile, partenerii de afaceri și cei mai mulți notari. Arată
        cine deține și cine administrează firma, unde are sediul, ce poate face legal (codurile
        CAEN autorizate, nu doar cele declarate) și în ce stare e. Când cineva spune „adu un
        certificat constatator” fără alte precizări, despre acesta vorbește.
      </p>
      <h3>Pentru fonduri IMM</h3>
      <p>
        Adaugă, pe fiecare exercițiu financiar depus, cifra de afaceri, profitul brut, profitul
        net și numărul mediu de salariați. Sunt cifrele de care depinde încadrarea în categoria
        microîntreprindere, întreprindere mică sau mijlocie (Legea 346/2004), deci eligibilitatea
        la programe de finanțare pentru IMM. Autoritățile de management îl cer ca să nu se bazeze
        pe declarația solicitantului. Dacă firma nu a depus situații financiare, rubrica e goală
        și certificatul spune asta, ceea ce e, în sine, o informație.
      </p>
      <h3>Pentru insolvență</h3>
      <p>
        Atestă dacă în registru există sau nu mențiuni privind insolvența, reorganizarea
        judiciară, falimentul, dizolvarea sau lichidarea. Este certificatul „că un anumit act sau
        fapt nu este înregistrat” din art. 11. Îl cer instanțele, notarii la tranzacții cu active
        ale firmei și autoritățile contractante, pentru care Legea 98/2016 face din insolvență un
        motiv de excludere. Un detaliu care contează: hotărârile privind insolvența ajung în
        registru pe baza comunicării făcute de instanță (Legea 265/2022 art. 45), deci
        certificatul reflectă ce s-a înregistrat, nu dosarul de la tribunal din ziua respectivă.
        Pentru o verificare la zi a unei proceduri în curs, Buletinul Procedurilor de Insolvență
        rămâne sursa.
      </p>

      <h2>Certificatul pe persoană fizică</h2>
      <p>
        Se cere pe CNP, nu pe CUI, și arată ce calități a avut sau are persoana în firme
        înregistrate: asociat, acționar, administrator, cenzor. ONRC îl menționează în legătură
        cu casele de asigurări de sănătate, care verifică dacă o persoană a deținut funcții în
        entități profesionale în ultimii 5 ani, și e cerut în aceleași condiții de alte instituții
        care acordă indemnizații sau ajutoare condiționate de lipsa unei afaceri. Costă tot 30 lei.
      </p>

      <h2>Raportul istoric</h2>
      <p>
        Nu e, tehnic, un certificat constatator, deși toată lumea îl numește „certificat cu
        istoric”. Este un raport cu toate înregistrările din viața firmei: asociații care au
        intrat și au ieșit, administratorii succesivi, sediile, modificările de capital, fiecare
        mențiune cu data ei. Costă 250 lei pe firmă (Ordinul MJ 380/C/2024) și se cere la
        due diligence, în litigii și la dosare de fonduri unde finanțatorul vrea să vadă
        legăturile dintre firme. Pentru 95% din situații e prea mult; pentru restul e singurul
        document care răspunde la întrebare.
      </p>

      <h2>Ce înseamnă „la zi” și de ce contează data</h2>
      <p>
        Pe certificat nu scrie „valabil până la”. Scrie data la care a fost generat, iar
        conținutul reflectă registrul la acea dată. De aceea o instituție care vrea siguranță nu
        poate face altceva decât să ceară un document recent, și de aici vine regula de 30 de
        zile: nu din Legea 265/2022, ci din procedurile interne ale băncilor, din ghidurile
        finanțatorilor și din practica notarială. Unele proceduri cer termene și mai scurte,
        altele acceptă orice certificat cu condiția ca datele să fie actuale.
      </p>
      <p>
        La achiziții publice formularea e precisă: normele de aplicare a Legii 98/2016 (HG
        395/2016) cer ca informațiile din certificatul constatator să fie reale și actuale la
        data prezentării. Un certificat vechi de două luni, dar care reflectă încă exact
        registrul, e în regulă pe litera normei; un certificat de ieri, emis înaintea unei
        schimbări de administrator înregistrate azi, nu e. În practică, comisiile cer un document
        emis cu cel mult 30 de zile înainte de termenul de depunere, ca să nu aibă de verificat
        nimic.
      </p>
      <p>
        Aici intervine și opozabilitatea: Legea 265/2022 art. 46 spune că mențiunile sunt
        opozabile terților de la înregistrare și că, la neconcordanță între registru și actele din
        dosar, prevalează registrul. O hotărâre AGA semnată, dar neînregistrată, nu există pentru
        bancă. Asta e bine pentru cine citește certificatul și rău pentru cine a uitat să depună
        mențiunea.
      </p>

      <h2>Cum îl obții</h2>
      <p>
        Cererea se poate depune la ghișeul oricărui oficiu, prin poștă sau electronic (art. 11
        alin. (2)), iar documentul se eliberează electronic, cu semnătură sau sigiliu electronic
        calificat, ori pe hârtie (alin. (3)). Trei căi concrete:
      </p>
      <ul>
        <li>
          InfoCert, serviciul online al ONRC: nu cere semnătură electronică, plata se face doar
          cu cardul, iar documentul vine semnat electronic. Îți trebuie CUI-ul sau denumirea.
        </li>
        <li>
          Portalul de servicii online myportal.onrc.ro: cere cont și semnătură electronică
          calificată pentru cereri, dar acceptă și plata prin ordin de plată.
        </li>
        <li>
          Ghișeul: cererea tip, actul de identitate, 30 lei. Pentru livrare prin poștă ONRC
          adaugă un tarif auxiliar de 9,78 lei.
        </li>
      </ul>
      <p>
        Sau printr-un intermediar. Noi{' '}
        <Link href={serviceUrl('certificat-constatator')}>obținem certificatul constatator</Link>{' '}
        din registrul comerțului și îl trimitem pe email, iar ce plătești peste tariful ONRC de 30
        lei este munca și verificarea datelor, nu documentul. Are sens dacă nu ai card, nu vrei
        cont pe portal, ai nevoie de mai multe certificate odată sau ceri pentru o firmă în
        insolvență și vrei să știi ce cere exact instanța. Dacă ai 5 minute și un card, InfoCert
        e suficient.
      </p>
      <p>
        Timpul de eliberare: documentul de bază vine, de regulă, în câteva minute de la plată.
        Din experiența noastră, variantele pentru fonduri IMM și pentru insolvență trec printr-un
        pas de verificare la ONRC și pot întârzia până în ziua lucrătoare următoare. Dacă ai un
        termen de depunere, nu le ceri în ultima zi.
      </p>

      <h2>Când informațiile din certificat nu sunt cele așteptate</h2>
      <p>
        Cel mai frecvent caz nu e o eroare a registrului, ci o mențiune nedepusă. Administratorul
        a fost schimbat prin hotărâre, sediul s-a mutat, un asociat a cesionat părțile, dar
        nimeni nu a depus cererea la ONRC în termenul de 15 zile de la actul modificator (art.
        43). Certificatul arată corect un registru rămas în urmă. Remediul e mențiunea, apoi un
        certificat nou; registratorul soluționează în termen de o zi lucrătoare (art. 105).
        Procedura pentru mențiunile uzuale e în{' '}
        <Link href="/rolul-si-atributiile-onrc-romania/">ghidul despre ONRC</Link>.
      </p>
      <p>
        Când eroarea este a registrului, de exemplu un nume scris greșit la operare, se cere
        îndreptarea la oficiul care a făcut înscrierea, cu actul din dosar care dovedește forma
        corectă. Art. 46 alin. (6) prevede că, dacă neconcordanța nu e imputabilă firmei, oficiul
        corectează pe cheltuiala sa.
      </p>

      <h2>Două lucruri de știut înainte să îl trimiți mai departe</h2>
      <p>
        Pe fiecare certificat scrie că folosirea lui în alte scopuri decât cele pentru care a fost
        solicitat, contrafacerea sau multiplicarea constituie infracțiune. Asta înseamnă că pentru
        două dosare diferite se cer două certificate, nu o copie a primului.
      </p>
      <p>
        Și PDF-ul se transmite ca fișier. Semnătura electronică a ONRC e în fișier, nu pe hârtie;
        printat și scanat, documentul devine o imagine fără semnătură validă, iar instituțiile
        care lucrează electronic îl refuză. Cine vrea hârtie cere varianta pe hârtie de la
        început.
      </p>
    </ArticleLayout>
  );
}
