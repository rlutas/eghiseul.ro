import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'ghid-complet-certificat-de-integritate-comportamentala';
const TITLE = 'Certificat de Integritate Comportamentală: Ghid Complet';
const DESCRIPTION =
  'Ce verifică efectiv certificatul de integritate comportamentală (Legea 118/2019), de ce reabilitarea nu îl curăță, ' +
  'ce a schimbat Legea 38/2026 pentru angajatori și cum îl obții gratuit, la ghișeu sau online.';
// Data la care articolul e verificabil la acest URL (migrarea din WordPress).
// Înainte aici scria '2024-01-01' — un placeholder identic pe 12 articole, adică
// o dată inventată în schema. Dacă apare dovada datei reale de pe WP, se corectează.
const DATE_PUBLISHED = '2026-06-16';
const DATE_MODIFIED = '2026-09-09';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE}`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Juridice"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        {
          slug: 'certificat-integritate',
          label: 'Certificat de Integritate Comportamentală',
          desc: 'Îl obținem noi de la Poliție, cu împuternicire avocațială.',
        },
        {
          slug: 'cazier-judiciar',
          label: 'Cazier Judiciar Online',
          desc: 'Documentul separat, cerut în același dosar de angajare.',
        },
      ]}
      faqs={[
        {
          q: 'Ce verifică certificatul de integritate comportamentală?',
          a: 'Un singur lucru: dacă persoana figurează sau nu în Registrul național automatizat cu privire la persoanele care au comis infracțiuni sexuale, de exploatare a unor persoane sau asupra minorilor. Registrul conține exclusiv condamnări și măsuri dispuse pentru infracțiunile enumerate limitativ în Legea 118/2019 — trafic de persoane, proxenetism, viol, agresiune sexuală, act sexual cu un minor, corupere sexuală a minorilor, pornografie infantilă și altele din aceeași categorie. Nu conține abateri de comportament, sancțiuni disciplinare sau reclamații.',
        },
        {
          q: 'De ce iese certificatul cu mențiuni dacă am fost reabilitat?',
          a: 'Pentru că registrul din Legea 118/2019 nu funcționează ca și cazierul judiciar. Art. 10 alin. (5) spune explicit că grațierea, prescripția executării pedepsei, amnistia și reabilitarea nu duc la scoaterea persoanei din registru, iar art. 10 alin. (1) că radierea din cazierul judiciar nu produce efecte asupra registrului. O persoană poate avea, în același timp, cazier judiciar curat și certificat de integritate cu mențiuni.',
        },
        {
          q: 'Cât costă certificatul de integritate comportamentală?',
          a: 'Eliberarea nu e purtătoare de taxe: e gratuit și la ghișeul de poliție, și în varianta electronică prin hub.mai.gov.ro. Formularele de cerere se dau gratuit de către poliție. Se plătește doar dacă alegi să nu te ocupi personal și mandatezi pe cineva să depună și să ridice în locul tău.',
        },
        {
          q: 'Îl pot obține online, singur?',
          a: 'Din 1 iulie 2026, da, prin hub.mai.gov.ro, dacă ești cetățean român, ai cel puțin 14 ani, ai un cont validat în HUB și o semnătură electronică calificată. Fluxul online funcționează însă numai pentru persoanele care nu figurează în registru; cine are înscrieri e trimis la ghișeu.',
        },
        {
          q: 'Ce riscă angajatorul care nu cere certificatul?',
          a: 'Din 28 martie 2026, când a intrat în vigoare Legea 38/2026, nerespectarea obligației de a solicita certificatul e infracțiune, pedepsită cu închisoare de la 6 luni la 3 ani sau cu amendă. Răspunde persoana responsabilă din instituție, nu instituția ca atare.',
        },
        {
          q: 'Cât este valabil certificatul?',
          a: 'Șase luni de la data eliberării, potrivit art. 16 alin. (3) din Legea 118/2019. Termenul se raportează la data la care semnezi contractul, nu la data la care depui dosarul.',
        },
        {
          q: 'Se eliberează și pentru firme?',
          a: 'Nu. Certificatul se eliberează numai persoanelor fizice. Un angajator poate cere, cu acordul scris al persoanei, o copie de pe registru, în condițiile prevăzute pentru extrasul de cazier judiciar.',
        },
      ]}
    >
      <p>
        Numele documentului e cea mai mare sursă de confuzie din tot subiectul. „Integritate
        comportamentală” sună a evaluare generală de conduită, iar oamenii ajung să creadă că
        certificatul cuprinde reclamații, sancțiuni de la locul de muncă sau abateri care nu sunt
        infracțiuni. Nu cuprinde nimic din toate astea. Verifică un singur lucru, și îl verifică
        strict.
      </p>

      <h2>Ce conține de fapt</h2>
      <p>
        Legea 118/2019 a creat un registru național automatizat al persoanelor care au comis
        infracțiuni sexuale, de exploatare a unor persoane sau asupra minorilor. Certificatul de
        integritate comportamentală e, în definiția din art. 3 lit. a), documentul care atestă
        lipsa înscrierilor în acel registru sau, dacă există, chiar datele înscrise. Art. 16
        alin. (2) merge mai departe: în certificat se trec <em>toate</em> datele existente în
        registru despre persoana respectivă.
      </p>
      <p>
        Registrul, la rândul lui, se alimentează dintr-o listă închisă de infracțiuni: trafic de
        persoane și de minori, proxenetism, exploatarea cerșetoriei, viol, agresiune sexuală, act
        sexual cu un minor, corupere sexuală a minorilor, incest, pornografie infantilă și
        corespondentele lor din codurile penale anterioare. Ce nu e pe listă nu ajunge în registru,
        deci nu ajunge nici în certificat. Un șofer cu zece amenzi, un contabil condamnat pentru
        evaziune sau un angajat concediat disciplinar primesc, toți trei, un certificat curat.
      </p>

      <h2>Diferența care contează cu adevărat: reabilitarea nu îl curăță</h2>
      <p>
        Aici e singurul lucru din articolul ăsta pe care merită să-l reții dacă nu citești mai
        departe. Cazierul judiciar se golește: la reabilitare, condamnarea se radiază și documentul
        iese fără mențiuni. Registrul din Legea 118/2019 nu se comportă la fel.
      </p>
      <p>
        Art. 10 alin. (5) spune, negru pe alb, că grațierea, prescripția executării pedepsei,
        amnistia și reabilitarea nu duc la scoaterea persoanei din evidența registrului. Iar
        alin. (1) al aceluiași articol precizează că radierea din cazierul judiciar nu produce
        niciun efect asupra registrului. Cele două evidențe sunt independente una de alta.
      </p>
      <p>
        Consecința e contraintuitivă: aceeași persoană poate avea, în aceeași zi, cazier judiciar
        perfect curat și certificat de integritate cu mențiuni. Nu e o eroare de sistem și nu se
        rezolvă cu o contestație.
      </p>
      <p>
        Ștergerea din registru există, dar la alte termene. Art. 10 alin. (2) o prevede la
        dezincriminarea faptei, la achitare sau încetarea procesului penal, la 10 ani de la o
        suspendare fără revocare, la 20 de ani de la înscriere dacă pedeapsa a fost de cel mult 5
        ani, la împlinirea vârstei de 85 de ani dacă pedeapsa a depășit 5 ani, și la deces. Sunt
        alte ordine de mărime decât reabilitarea.
      </p>

      <h2>Ce s-a schimbat în martie 2026</h2>
      <p>
        Legea 38/2026 a modificat articolele 12, 18 și 21 din Legea 118/2019 și e în vigoare de
        pe <strong>28 martie 2026</strong>. Dacă ai citit ceva despre subiectul ăsta înainte de
        primăvară, informația e depășită pe două puncte.
      </p>
      <p>
        Primul: art. 18 alin. (1) formulează acum o <strong>interdicție directă</strong>. Persoanele
        înscrise în registru nu au voie să încheie raporturi de muncă, contracte de voluntariat sau
        raporturi asemănătoare cu entități publice sau private din învățământ, sănătate, protecție
        socială, educație fizică și sport, și nici cu vreo entitate a cărei activitate presupune
        contact direct cu copii, vârstnici, persoane cu dizabilități sau alte categorii vulnerabile,
        ori examinarea fizică sau evaluarea psihologică a unei persoane. Sportul a fost adăugat
        explicit prin modificarea din 2026. Nu e o recomandare pe care angajatorul o cântărește; e
        o interdicție legală.
      </p>
      <p>
        Al doilea, și mai dur: art. 21 alin. (2) transformă neîndeplinirea obligației de a cere
        certificatul în <strong>infracțiune</strong>, pedepsită cu închisoare de la 6 luni la 3 ani
        sau cu amendă. Răspunde persoana responsabilă din instituție, nu instituția în abstract.
        Până în martie 2026 obligația exista deja, dar fără o sancțiune penală atașată, așa că era
        tratată de multe locuri ca o formalitate opțională. De aici încolo nu mai poate fi.
      </p>

      <h2>Cine trebuie să îl prezinte</h2>
      <p>
        Lista din art. 18 nu e o listă de meserii, ci un criteriu: contactul direct cu categorii
        vulnerabile. Intră în ea și posturi la care nimeni nu se gândește prima dată.
      </p>
      <ul>
        <li>învățământ de orice nivel, de stat sau privat, inclusiv creșe și after-school;</li>
        <li>sănătate și protecție socială, inclusiv centre rezidențiale și îngrijire la domiciliu;</li>
        <li>educație fizică și sport, adăugat expres în 2026: antrenori, cluburi, tabere;</li>
        <li>personal nedidactic care lucrează în aceleași clădiri: secretariat, îngrijitoare, paznici, șoferi de transport școlar;</li>
        <li>voluntari și colaboratori, nu doar angajați cu contract de muncă;</li>
        <li>orice post care presupune examinare fizică sau evaluare psihologică a unei persoane.</li>
      </ul>
      <p>
        Pentru dosarul de angajare din învățământ se cer amândouă documentele, iar unul nu îl
        înlocuiește pe celălalt. Calendarul concret al lunii septembrie, cu termenele de la
        suplinire și titularizare, e într-un{' '}
        <Link href="/cazier-si-certificat-de-integritate-pentru-profesori/">
          ghid separat pentru profesori
        </Link>
        , iar comparația punct cu punct dintre cele două documente e în{' '}
        <Link href="/cazier-judiciar-vs-certificat-integritate-comportamentala/">
          articolul cazier judiciar vs. certificat de integritate
        </Link>
        .
      </p>

      <h2>Cum îl obții gratuit, fără noi</h2>
      <p>
        Spunem asta pe față, pentru că e adevărat și pentru că oricum o afli: eliberarea
        certificatului nu e un serviciu purtător de taxe. E gratuit, iar formularele de cerere ți
        le dă poliția tot gratuit. Ai două căi.
      </p>
      <p>
        La ghișeu, cererea se depune la orice subunitate de poliție unde funcționează ghișeu de
        cazier judiciar, nu neapărat în localitatea de domiciliu. Îți trebuie actul de identitate în
        original și cererea-tip. Se eliberează de regulă pe loc, iar termenul maxim e de 3 zile.
      </p>
      <p>
        Online, din <strong>1 iulie 2026</strong>, prin hub.mai.gov.ro. Condițiile sunt destul de
        stricte: cetățean român, minimum 14 ani, cont validat în HUB (direct, prin ghiseul.ro, prin
        cartea electronică de identitate sau prin ROeID) și o semnătură electronică calificată.
        Există și o limitare pe care merită să o știi dinainte: fluxul online funcționează doar
        pentru persoanele care nu figurează în registru. Cine are înscrieri e trimis la ghișeu, ceea
        ce înseamnă că o cerere online respinsă e, în sine, un semnal.
      </p>
      <p>
        A treia variantă e mandatul. Certificatul se poate obține prin avocat, în baza împuternicirii
        avocațiale, sau prin altă persoană, cu procură notarială autentică. Asta facem noi, prin{' '}
        <Link href={serviceUrl('certificat-integritate')}>serviciul de certificat de integritate</Link>:
        depunem și ridicăm în locul tău, iar ce plătești e munca și livrarea, nu documentul. Are sens
        dacă ești în străinătate, dacă nu ai semnătură electronică calificată sau dacă îți trebuie în
        aceeași comandă cu{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar</Link>, o traducere sau apostila
        de la Haga. Dacă ești în țară, ai o oră liberă și un ghișeu în apropiere, du-te singur.
      </p>

      <h2>Când certificatul iese cu mențiuni</h2>
      <p>
        Dacă persoana figurează în registru, certificatul conține datele înscrise, iar art. 18
        alin. (1) închide direct accesul la posturile de mai sus. Angajatorul nu are marjă de
        apreciere aici, oricât de bine ar arăta restul dosarului, iar dacă angajează totuși,
        persoana responsabilă intră sub art. 21 alin. (2).
      </p>
      <p>
        Pentru cetățenii străini și apatrizi, art. 18 alin. (2) prevede echivalentul: cazierul
        judiciar sau un alt document oficial din statul de origine, din care să reiasă dacă persoana
        a săvârșit vreuna dintre infracțiunile din listă.
      </p>

      <h2>Valabilitatea de 6 luni, citită corect</h2>
      <p>
        Art. 16 alin. (3) stabilește o valabilitate de 6 luni de la data eliberării. Greșeala
        frecventă e să numeri de la depunerea dosarului. Se numără până la <em>semnarea
        contractului</em>, iar între cele două momente pot trece săptămâni bune, mai ales în
        învățământ, unde repartizarea vine târziu. Un certificat scos în martie e la limită pe 1
        septembrie. Unul scos în august nu ridică nicio discuție.
      </p>
      <p>
        Cealaltă confuzie ține de reînnoire: documentul se cere la încheierea unui raport de muncă
        nou, nu la fiecare șase luni pe durata unui contract care merge deja.
      </p>
    </ArticleLayout>
  );
}
