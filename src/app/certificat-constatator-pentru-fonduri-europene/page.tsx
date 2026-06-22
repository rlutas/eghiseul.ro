import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-pentru-fonduri-europene';
const TITLE = 'Certificat Constatator pentru Fonduri Europene și APIA: Ghid Complet';
const DESCRIPTION =
  'De ce ai nevoie de certificat constatator la dosarul de fonduri europene sau APIA/AFIR, ce dovedește, ce tip alegi și cum îl obții online prin eGhișeul.ro.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';
const OGIMAGE = '/og/services/certificat-constatator.png';
const CATEGORY = 'Comercial / ONRC';

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
      category={CATEGORY}
      image={OGIMAGE}
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="22 iunie 2026"
      updatedLabel="22 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-constatator',
          label: 'Certificat Constatator Online',
          desc: 'Obține certificatul constatator de la ONRC, emis online cu semnătură electronică, fără drum la registru.',
        },
      ]}
      faqs={[
        {
          q: 'De ce îmi cere finanțatorul un certificat constatator?',
          a: 'Pentru că este documentul oficial prin care ONRC atestă că firma există, este activă și are obiectul de activitate (codul CAEN) potrivit activității pe care vrei să o finanțezi. Finanțatorul (Agenția pentru IMM, AFIR, APIA) îl folosește pentru a verifica eligibilitatea solicitantului înainte de a aproba grantul.',
        },
        {
          q: 'Ce tip de certificat constatator îmi trebuie pentru fonduri europene?',
          a: 'De regulă este suficient certificatul constatator „de bază”, care costă 30 de lei și conține datele de identificare, starea juridică și obiectul de activitate al firmei. Verifică totuși ghidul solicitantului al apelului tău, pentru că unele dosare pot cere informații suplimentare (istoric, asociați, puncte de lucru).',
        },
        {
          q: 'Certificatul emis online este acceptat la dosarul de finanțare?',
          a: 'Da. Certificatul constatator emis prin portalul ONRC în format PDF, semnat electronic, are aceeași valoare juridică precum cel eliberat la ghișeu și este considerat document original. Nu mai trebuie tipărit și ștampilat la registru.',
        },
        {
          q: 'Cât costă un certificat constatator pentru un dosar APIA sau AFIR?',
          a: 'Certificatul constatator de bază emis online prin ONRC costă 30 de lei. La un serviciu precum eGhișeul.ro plătești în plus comoditatea de a-l primi rapid, fără cont la ONRC și fără să gestionezi singur portalul.',
        },
        {
          q: 'CAEN-ul din certificat trebuie să corespundă activității finanțate?',
          a: 'Da, acesta este chiar unul dintre motivele pentru care se cere documentul. Codul CAEN înscris în certificat trebuie să acopere activitatea pentru care soliciți finanțarea. Dacă nu îl ai, trebuie întâi adăugat la ONRC, înainte de depunerea dosarului.',
        },
      ]}
    >
      <p>
        Dacă pregătești un dosar de finanțare — fie pentru un <strong>grant pentru IMM-uri</strong>,
        fie pentru un sprijin la <strong>APIA</strong> sau <strong>AFIR</strong> în agricultură —
        aproape sigur ți se cere un <strong>certificat constatator</strong>. Este unul dintre cele
        mai des solicitate documente în dosarele de fonduri europene, pentru că oferă
        finanțatorului o imagine oficială și actuală a firmei tale. În acest ghid afli{' '}
        <strong>ce dovedește acest document</strong>, ce tip îți trebuie, ce greșeli să eviți și cum
        îl obții online, fără să stai la coadă la registru.
      </p>

      <h2>Ce este certificatul constatator și de ce îl cere finanțatorul</h2>
      <p>
        Certificatul constatator este documentul emis de <strong>ONRC</strong> (Oficiul Național al
        Registrului Comerțului) care atestă situația oficială a unei firme. La un dosar de fonduri
        europene, finanțatorul îl folosește pentru a confirma trei lucruri esențiale despre
        solicitant:
      </p>
      <ul>
        <li>
          <strong>că firma este înregistrată</strong> și există în mod legal, cu datele de
          identificare corecte (denumire, CUI, sediu);
        </li>
        <li>
          <strong>starea juridică</strong> a firmei — adică faptul că este în funcțiune și nu se
          află în dizolvare, insolvență sau radiere;
        </li>
        <li>
          <strong>că obiectul de activitate (codul CAEN) corespunde</strong> activității pe care
          vrei să o finanțezi prin proiect.
        </li>
      </ul>
      <p>
        Practic, certificatul constatator este „cartea de identitate” a firmei tale în fața
        finanțatorului. Fără el, dosarul nu poate fi evaluat, pentru că nu există o dovadă oficială
        că solicitantul îndeplinește condițiile de eligibilitate.
      </p>

      <h2>Unde se cere: granturi IMM vs. APIA și AFIR</h2>
      <p>
        Certificatul constatator apare în două mari categorii de finanțări, fiecare cu logica ei:
      </p>
      <ul>
        <li>
          <strong>Granturi pentru IMM-uri.</strong> În dosarele de finanțare pentru
          întreprinderi mici și mijlocii, certificatul demonstrează că firma este activă și că
          domeniul de activitate se potrivește investiției propuse (de exemplu, achiziția de
          echipamente sau digitalizare).
        </li>
        <li>
          <strong>APIA și AFIR (agricultură).</strong> Pentru sprijinul din agricultură, document
          ul confirmă forma juridică a beneficiarului și faptul că activitatea agricolă este
          înscrisă printre codurile CAEN ale firmei. Este relevant mai ales pentru fermele
          organizate ca societăți comerciale.
        </li>
      </ul>
      <p>
        În ambele cazuri rolul este același: să dovedească, oficial și la zi, că ești o entitate
        eligibilă. Diferă doar instituția care îți evaluează dosarul.
      </p>

      <h2>Ce tip de certificat constatator alegi</h2>
      <p>
        Pentru majoritatea dosarelor de finanțare este suficient certificatul constatator{' '}
        <strong>„de bază”</strong>, care costă <strong>30 de lei</strong> și conține informațiile
        esențiale despre firmă. Tabelul de mai jos rezumă ce acoperă, de obicei, varianta de bază
        față de ce ai putea avea nevoie suplimentar:
      </p>
      <table>
        <thead>
          <tr>
            <th>Ce verifică finanțatorul</th>
            <th>Acoperit de certificatul „de bază”</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Date de identificare (denumire, CUI, sediu)</td>
            <td>Da</td>
          </tr>
          <tr>
            <td>Starea juridică (activă / nu în insolvență)</td>
            <td>Da</td>
          </tr>
          <tr>
            <td>Obiect de activitate (coduri CAEN)</td>
            <td>Da</td>
          </tr>
          <tr>
            <td>Istoric detaliat, mențiuni vechi</td>
            <td>Poate necesita o variantă extinsă</td>
          </tr>
        </tbody>
      </table>
      <p>
        Recomandarea practică: înainte de a comanda documentul, citește{' '}
        <strong>ghidul solicitantului</strong> al apelului tău. Acolo se precizează exact ce
        informații trebuie să conțină certificatul. În marea majoritate a cazurilor, varianta de
        bază este suficientă, dar e bine să verifici, ca să nu refaci dosarul.
      </p>
      <p>
        Dacă vrei detalii despre diferențele dintre tipurile de certificat, poți consulta și
        ghidul nostru despre{' '}
        <Link href="/cele-4-tipuri-de-certificat-constatator-online/">
          cele 4 tipuri de certificat constatator
        </Link>{' '}
        și pașii de{' '}
        <Link href="/eliberare-certificat-constatator-onrc-ghid/">
          eliberare a certificatului constatator de la ONRC
        </Link>
        .
      </p>

      <h2>Documentul emis online este original și valabil</h2>
      <p>
        O întrebare frecventă: <em>„dacă îl iau online, mai e bun la dosar?”</em>. Răspunsul este
        da. Certificatul constatator emis prin portalul ONRC în format <strong>PDF semnat
        electronic</strong> are aceeași valoare juridică precum cel ridicat fizic de la ghișeu și
        este considerat <strong>document original</strong>. Nu trebuie tipărit, ștampilat sau
        legalizat suplimentar — semnătura electronică a ONRC îl validează automat.
      </p>
      <p>
        Asta înseamnă că poți încărca PDF-ul direct în platforma de depunere a proiectului sau îl
        poți atașa la dosarul fizic, în funcție de cerințele apelului.
      </p>

      <h2>Exemplu concret</h2>
      <p>
        Să presupunem că deții un SRL cu activitate de comerț și vrei să accesezi un grant pentru
        digitalizare. Finanțatorul cere un certificat constatator pentru a verifica:
      </p>
      <ul>
        <li>că firma ta este activă și nu se află în insolvență;</li>
        <li>că ai înscris codul CAEN potrivit pentru activitatea pentru care ceri sprijin;</li>
        <li>că datele de sediu și de identificare corespund cu cele din cererea de finanțare.</li>
      </ul>
      <p>
        Comanzi certificatul de bază, primești PDF-ul semnat electronic, îl atașezi la dosar și
        treci de verificarea de conformitate. Dacă, în schimb, codul CAEN necesar nu apare în
        certificat, înseamnă că trebuie întâi adăugat la ONRC — abia apoi documentul îți este de
        folos.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>CAEN-ul nu corespunde activității finanțate.</strong> Este cea mai des întâlnită
          problemă. Dacă firma nu are codul CAEN necesar, certificatul îți va arăta exact asta —
          adaugă codul la ONRC înainte de a depune dosarul.
        </li>
        <li>
          <strong>Certificat prea vechi.</strong> Finanțatorii cer de obicei un document recent.
          Un certificat emis cu luni în urmă poate fi respins ca neactualizat; comandă-l aproape
          de momentul depunerii.
        </li>
        <li>
          <strong>Alegi o variantă greșită.</strong> Plătești în plus pentru informații pe care
          nu ți le cere nimeni, sau iei prea puțin și trebuie să refaci. Citește ghidul
          solicitantului înainte.
        </li>
        <li>
          <strong>Date neactualizate la registru.</strong> Dacă ai schimbat sediul sau
          administratorul și nu ai înregistrat mențiunea la ONRC, certificatul va reflecta datele
          vechi — corectează întâi situația la registru.
        </li>
      </ul>

      <h2>Ce trebuie să știi înainte să comanzi</h2>
      <p>
        Înainte de a solicita documentul, asigură-te că:
      </p>
      <ul>
        <li>
          ai la îndemână <strong>CUI-ul firmei</strong> (codul unic de înregistrare), pe baza
          căruia se identifică societatea;
        </li>
        <li>
          datele firmei la ONRC sunt <strong>actualizate</strong> (sediu, asociați, coduri CAEN);
        </li>
        <li>
          știi exact <strong>ce cere ghidul solicitantului</strong> în privința conținutului
          certificatului.
        </li>
      </ul>

      <h2>Cum obții certificatul constatator online, prin eGhișeul.ro</h2>
      <p>
        Nu trebuie să îți faci cont pe portalul ONRC și nici să te deplasezi la registru. Prin{' '}
        <Link href="/servicii/certificat-constatator-online/">
          serviciul de certificat constatator online
        </Link>{' '}
        de pe eGhișeul.ro, procesul are doar câțiva pași:
      </p>
      <ul>
        <li>introduci CUI-ul firmei și alegi tipul de certificat de care ai nevoie;</li>
        <li>achiți cu cardul, fără cont la ONRC;</li>
        <li>noi solicităm documentul prin ONRC online, în numele tău;</li>
        <li>
          primești certificatul în format <strong>PDF semnat electronic</strong>, gata de atașat la
          dosarul de finanțare.
        </li>
      </ul>
      <p>
        Așa eviți timpul pierdut pe portalul oficial și ești sigur că documentul are formatul
        corect pentru depunere. Costul curent îl vezi întotdeauna pe pagina serviciului.
      </p>

      <h2>Concluzie</h2>
      <p>
        Certificatul constatator este piesa care dovedește, oficial, că firma ta este eligibilă
        pentru fonduri europene sau pentru sprijinul de la APIA și AFIR: arată că este înregistrată,
        activă și că are codul CAEN potrivit activității finanțate. Pentru cele mai multe dosare,
        varianta <strong>de bază (30 de lei)</strong> este suficientă, iar PDF-ul semnat electronic
        emis prin ONRC este document original. Diferența o face cât de simplu îl obții — la ghișeu,
        cu deplasare, sau{' '}
        <Link href="/servicii/certificat-constatator-online/">online, prin eGhișeul.ro</Link>, în
        câțiva pași.
      </p>
    </ArticleLayout>
  );
}
