import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-de-celibat-pentru-casatorie-in-strainatate';
const TITLE = 'Certificat de Celibat pentru Căsătorie în Străinătate: Apostilă și Traducere';
const DESCRIPTION =
  'Te căsătorești în străinătate? Vezi cum obții certificatul de celibat (Anexa 9), apostila de la Prefectură și traducerea legalizată — pas cu pas, fără drum în țară.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';
const OGIMAGE = '/og/services/certificat-celibat.png';
const CATEGORY = 'Stare civilă';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: OGIMAGE,
});

export default function Page() {
  const celibatUrl = serviceUrl('certificat-celibat');
  const nastereUrl = serviceUrl('certificat-nastere');
  const casatorieUrl = serviceUrl('certificat-casatorie');
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
          slug: 'certificat-celibat',
          label: 'Certificat de Celibat Online',
          desc: 'Obținem Anexa 9 de la primărie, în numele tău, fără să te deplasezi la ghișeu.',
        },
      ]}
      faqs={[
        {
          q: 'De ce am nevoie de certificat de celibat ca să mă căsătoresc în străinătate?',
          a: 'Autoritățile din țara unde te căsătorești cer o dovadă oficială că ești necăsătorit(ă) și că nu există un impediment legal pentru căsătorie. În România, această dovadă este certificatul (Anexa 9) eliberat de primăria de domiciliu. Pentru a fi recunoscut în afara țării, documentul trebuie apostilat și tradus legalizat în limba țării respective.',
        },
        {
          q: 'Cine pune apostila pe certificatul de celibat?',
          a: 'Apostila se obține de la Instituția Prefectului, NU de la primărie. Primăria emite Anexa 9, iar Prefectura aplică apostila de la Haga, care confirmă autenticitatea documentului pentru folosire în statele semnatare ale Convenției de la Haga. Sunt două instituții diferite, cu doi pași separați.',
        },
        {
          q: 'Cât este valabil certificatul de celibat pentru străinătate?',
          a: 'Certificatul de celibat folosit în străinătate are o valabilitate de 90 de zile. Planifică-ți astfel demersurile (apostilă, traducere, depunere la autoritatea străină) încât să nu depășești acest termen, altfel va trebui să reiei procedura.',
        },
        {
          q: 'Ce diferență este între certificatul de celibat și certificatul de cutumă?',
          a: 'Certificatul de celibat (Anexa 9) este emis de primăria din România și atestă starea de necăsătorit. Certificatul de cutumă este emis de consulatul țării în care te căsătorești și confirmă că, potrivit legii române, ești liber să te căsătorești. Sunt documente diferite, emise de autorități diferite — verifică din timp care anume îți este cerut.',
        },
        {
          q: 'Pot obține certificatul de celibat dacă sunt deja plecat din țară?',
          a: 'Da. Prin eGhișeul.ro depunem cererea la primăria ta de domiciliu pe baza unei împuterniciri semnate online și îți trimitem documentul prin curier, oriunde te afli. Putem gestiona și pasul de apostilă, ca să primești un dosar cât mai aproape de gata.',
        },
      ]}
    >
      <p>
        Dacă te pregătești să te căsătorești în afara țării, una dintre primele cerințe pe care le vei
        întâlni este <strong>certificatul de celibat</strong> — dovada oficială că ești necăsătorit(ă)
        și că nu există un impediment legal pentru căsătorie. Pentru românii din{' '}
        <strong>diaspora</strong>, acesta este de departe cel mai frecvent motiv pentru care se solicită
        documentul. În acest ghid afli exact ce este certificatul de celibat, cum îl obții, de ce ai
        nevoie de <strong>apostilă</strong> și de o <strong>traducere legalizată</strong>, cât este
        valabil și cum eviți greșelile care te-ar putea trimite înapoi la coada de la primărie.
      </p>

      <h2>Ce este certificatul de celibat (Anexa 9)</h2>
      <p>
        Certificatul de celibat este, în limbaj administrativ, <strong>Anexa 9</strong> — un document
        eliberat de <strong>primăria de domiciliu</strong>, prin Serviciul de Stare Civilă, care atestă
        că la momentul emiterii ești <strong>necăsătorit(ă)</strong>. Autoritățile din statul unde vrei
        să te căsătorești îl cer pentru a se asigura că nu ești deja căsătorit în România și că poți
        încheia legal o nouă căsătorie.
      </p>
      <p>
        Spre deosebire de un certificat de naștere, care nu expiră, certificatul de celibat are o
        valabilitate limitată tocmai pentru că atestă o <strong>stare civilă la zi</strong>. De aceea
        este important să nu îl obții prea devreme față de data nunții. Dacă vrei să sari peste
        deplasarea la ghișeu, poți solicita documentul{' '}
        <Link href={celibatUrl}>online, prin eGhișeul.ro</Link>, iar noi îl depunem la primăria ta de
        domiciliu prin împuternicire.
      </p>

      <h2>Pașii pentru a folosi certificatul de celibat în străinătate</h2>
      <p>
        Pentru ca un document românesc să fie recunoscut de o autoritate străină, nu este suficient
        să-l obții de la primărie. Procesul corect are <strong>trei etape</strong>, în această ordine:
      </p>
      <ol>
        <li>
          <strong>Obții Anexa 9 de la primărie</strong> — Serviciul de Stare Civilă din localitatea
          ta de domiciliu emite certificatul de celibat. Aici se completează cererea, se verifică
          identitatea și se eliberează documentul.
        </li>
        <li>
          <strong>Aplici apostila la Instituția Prefectului</strong> — apostila de la Haga se obține de
          la <strong>Prefectură, NU de la primărie</strong>. Este pasul care confirmă autenticitatea
          documentului pentru statele care au semnat Convenția de la Haga.
        </li>
        <li>
          <strong>Faci traducerea legalizată în limba țării</strong> — un traducător autorizat traduce
          certificatul (deja apostilat), iar traducerea este legalizată la notar, ca să fie acceptată
          de autoritatea străină.
        </li>
      </ol>
      <p>
        Ordinea contează: apostila se aplică pe documentul original românesc, iar traducerea se face
        de regulă <strong>după</strong> apostilă, ca să fie tradus și textul apostilei. Inversarea
        pașilor este una dintre cele mai frecvente cauze de respingere a dosarului.
      </p>

      <h2>Cele trei instituții implicate — pe scurt</h2>
      <p>
        Ca să nu confunzi cine ce face, ține minte că în proces sunt implicate trei instituții
        diferite:
      </p>
      <table>
        <thead>
          <tr>
            <th>Etapă</th>
            <th>Cine se ocupă</th>
            <th>Ce primești</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Certificatul de celibat</td>
            <td>Primăria de domiciliu (Stare Civilă)</td>
            <td>Anexa 9 — original</td>
          </tr>
          <tr>
            <td>Apostila</td>
            <td>Instituția Prefectului (Prefectura)</td>
            <td>Apostila de la Haga aplicată pe document</td>
          </tr>
          <tr>
            <td>Traducerea legalizată</td>
            <td>Traducător autorizat + notar</td>
            <td>Traducerea în limba țării, legalizată</td>
          </tr>
        </tbody>
      </table>
      <p>
        Greșeala clasică este să mergi cu certificatul la primărie pentru apostilă — primăria nu pune
        apostila. Apostila este atribuția <strong>exclusivă a Prefecturii</strong>.
      </p>

      <h2>Cât este valabil certificatul de celibat</h2>
      <p>
        Pentru folosirea în străinătate, certificatul de celibat are o valabilitate de{' '}
        <strong>90 de zile</strong>. Acest termen este motivul pentru care trebuie să-ți planifici cu
        atenție demersurile: dacă obții documentul prea devreme și pierzi timp cu apostila și
        traducerea, riști să ajungi la autoritatea străină cu un certificat deja expirat.
      </p>
      <p>Un calendar realist arată cam așa:</p>
      <ul>
        <li>obții Anexa 9 de la primărie;</li>
        <li>aplici imediat apostila la Prefectură;</li>
        <li>faci traducerea legalizată în limba țării;</li>
        <li>depui dosarul la autoritatea străină — toate în interiorul celor 90 de zile.</li>
      </ul>

      <h2>Certificat de celibat vs. certificat de cutumă</h2>
      <p>
        Mulți români care se căsătoresc în străinătate se lovesc de o confuzie: li se cere uneori un{' '}
        <strong>certificat de cutumă</strong>, nu unul de celibat. Cele două nu sunt același lucru:
      </p>
      <ul>
        <li>
          <strong>Certificatul de celibat (Anexa 9)</strong> este emis de{' '}
          <strong>primăria din România</strong> și atestă că ești necăsătorit(ă);
        </li>
        <li>
          <strong>Certificatul de cutumă</strong> este emis de <strong>consulatul</strong> țării în
          care vrei să te căsătorești și confirmă că, potrivit legii române, ești liber(ă) să te
          căsătorești în acel stat.
        </li>
      </ul>
      <p>
        Înainte de a începe orice demers, întreabă autoritatea străină (primăria locală, ofițerul de
        stare civilă sau notarul de acolo) <strong>exact ce document îți cere</strong>. Dacă îți cere
        certificat de cutumă, te adresezi consulatului țării respective; dacă îți cere dovada de
        celibat din România, urmezi pașii din acest ghid.
      </p>

      <h2>Acte necesare pentru certificatul de celibat</h2>
      <p>Pentru emiterea Anexei 9, primăria îți va cere de regulă:</p>
      <ul>
        <li>
          <strong>act de identitate valabil</strong> al solicitantului;
        </li>
        <li>
          <strong>cerere tip</strong> pentru eliberarea certificatului de celibat (o completăm noi în
          cazul serviciului online);
        </li>
        <li>
          <strong>împuternicire</strong>, atunci când cererea este depusă de altcineva în numele tău —
          obligatorie pentru diaspora și pentru depunerea online;
        </li>
        <li>
          dovada achitării taxei de stare civilă, acolo unde se percepe.
        </li>
      </ul>
      <p>
        Cerințele pot varia ușor de la o primărie la alta. Prin eGhișeul.ro pregătim noi documentația
        corectă pentru Starea Civilă competentă, ca să nu fie nevoie să afli singur regulile fiecărui
        ghișeu.
      </p>

      <h2>Cum obții certificatul de celibat online, din diaspora</h2>
      <p>
        Dacă ești deja plecat din țară, nu trebuie să te întorci doar pentru un act. Procesul prin
        eGhișeul.ro are câțiva pași simpli:
      </p>
      <ul>
        <li>completezi datele în formularul online (2–3 minute);</li>
        <li>semnezi împuternicirea direct în aplicație și achiți cu cardul;</li>
        <li>depunem cererea la primăria ta de domiciliu, în numele tău;</li>
        <li>primești certificatul prin curier, cu tracking pe email;</li>
        <li>
          la cerere, gestionăm și pasul de <strong>apostilă</strong>, ca să primești un dosar cât mai
          aproape de gata.
        </li>
      </ul>
      <p>
        Vezi detaliile și costul pe pagina de{' '}
        <Link href={celibatUrl}>eliberare certificat de celibat online</Link>.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Cauți apostila la primărie</strong> — apostila se obține doar de la Instituția
          Prefectului. Primăria emite doar certificatul.
        </li>
        <li>
          <strong>Obții certificatul prea devreme</strong> — valabilitatea de 90 de zile începe de la
          emitere, nu de la depunerea în străinătate. Lasă apostila și traducerea în interiorul
          acestui termen.
        </li>
        <li>
          <strong>Confunzi celibatul cu cutuma</strong> — sunt documente diferite, emise de
          autorități diferite. Verifică ce îți cere efectiv autoritatea străină.
        </li>
        <li>
          <strong>Traduci înainte de apostilă</strong> — traducerea legalizată se face de regulă după
          apostilare, ca să fie tradus și textul apostilei.
        </li>
      </ul>

      <h2>Ce trebuie să știi înainte să începi</h2>
      <p>
        Înainte de a porni demersurile, confirmă cu autoritatea străină <strong>limba</strong> în care
        trebuie făcută traducerea și dacă acceptă certificatul de celibat românesc sau cere certificat
        de cutumă. Pentru un dosar complet, ai nevoie de cele trei piese în ordine corectă: Anexa 9 de
        la primărie, apostila de la Prefectură și traducerea legalizată în limba țării. Dacă în
        paralel îți pregătești și actele pentru nuntă, s-ar putea să-ți fie util și{' '}
        <Link href={nastereUrl}>certificatul de naștere</Link> sau, după căsătorie,{' '}
        <Link href={casatorieUrl}>certificatul de căsătorie</Link> — pe care le poți obține tot online.
      </p>
      <p>
        Pentru costurile de legalizare la notar din etapa de traducere, te poți orienta cu{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>. Iar dacă ai
        pierdut între timp și alte documente de stare civilă, vezi ghidul despre{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificat de naștere pierdut</Link>.
      </p>

      <h2>Concluzie</h2>
      <p>
        Certificatul de celibat pentru o căsătorie în străinătate nu este complicat dacă respecți
        ordinea corectă: <strong>Anexa 9</strong> de la primărie, <strong>apostila</strong> de la
        Instituția Prefectului și <strong>traducerea legalizată</strong> în limba țării, toate în
        interiorul celor 90 de zile de valabilitate. Cea mai mare diferență o face modul în care
        depui cererea — cu deplasare și cozi, sau{' '}
        <Link href={celibatUrl}>online, prin eGhișeul.ro</Link>, fără să pleci de acasă, oriunde te-ai
        afla în lume.
      </p>
    </ArticleLayout>
  );
}
