import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'verificare-cazier-fiscal';
const TITLE = 'Verificare cazier fiscal: cum afli ce ai înscris, dacă certificatul e autentic și cât mai e valabil';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Verificare cazier fiscal: ce ai înscris și cât mai e valabil';
const DESCRIPTION =
  'Cum verifici situația ta în cazierul fiscal: de ce nu există interogare rapidă online, cum ceri ' +
  'certificatul de la ANAF, cum verifici semnătura electronică și codul de pe document, cât timp ' +
  'rămâne valabil și ce faci dacă apare o faptă pe care o credeai radiată.';
const DATE_PUBLISHED = '2026-08-07';
const DATE_MODIFIED = '2026-08-07';
const OGIMAGE = `/images/articole/${SLUG}.webp`;

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: OGIMAGE,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Documente fiscale"
      image={OGIMAGE}
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="august 2026"
      updatedLabel="7 august 2026"
      imageAlt="Femeie la birou lângă fereastră comparând un certificat tipărit cu documentul de pe ecranul laptopului, cu imprimanta alături"
      relatedServices={[
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Certificatul eliberat de ANAF prin împuternicit, fără cont SPV. 198 RON, 1–3 zile.',
        },
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator',
          desc: 'Ce poți verifica de fapt despre o firmă: asociați, administratori, stare juridică.',
        },
        {
          href: '/servicii/cazier-judiciar-online/',
          label: 'Cazier Judiciar Online',
          desc: 'Documentul eliberat de Poliție, confundat frecvent cu cel fiscal.',
        },
      ]}
      faqs={[
        {
          q: 'Cum verific cazierul fiscal?',
          a: 'Ceri certificatul de cazier fiscal de la ANAF și citești ce scrie în el. Nu există altă cale: evidența nu este publică și nu poate fi interogată cu CNP-ul într-o pagină web. Cererea se depune prin Spațiul Privat Virtual, la ghișeul administrației financiare sau printr-un împuternicit cu procură.',
        },
        {
          q: 'Se poate face verificare cazier fiscal online?',
          a: 'Da, în sensul că cererea se poate depune electronic prin SPV, iar certificatul vine semnat digital pe cont. Nu există însă un serviciu care să îți afișeze instant situația fără cerere. Orice site care promite „verificare instant cu CNP" nu are acces la evidența ANAF.',
        },
        {
          q: 'Ce conține cazierul fiscal?',
          a: 'Datele de identificare ale titularului, autoritatea emitentă, data emiterii, numărul de înregistrare și partea esențială: fie mențiunea că nu are fapte înscrise, fie lista faptelor sancționate, cu temeiul legal și data la care au rămas definitive.',
        },
        {
          q: 'Cum arată cazierul fiscal?',
          a: 'Este un certificat pe o singură pagină, cu antetul ANAF, datele titularului și rubrica de mențiuni. În varianta electronică se primește ca PDF semnat digital de ANAF, cu un cod de verificare tipărit pe document. Nu are hologramă și nu se eliberează pe hârtie specială.',
        },
        {
          q: 'Cât este valabil un cazier fiscal?',
          a: 'Certificatul de cazier fiscal este valabil 30 de zile de la data emiterii. După acest termen nu mai este acceptat, indiferent dacă între timp situația ta fiscală nu s-a schimbat cu nimic.',
        },
        {
          q: 'Cazierul fiscal se folosește o singură dată?',
          a: 'Da. Se eliberează pentru un scop declarat și se depune la instituția pentru care a fost cerut. Dacă ai nevoie de el în două dosare diferite, ceri două certificate. O copie depusă în alt dosar nu ține loc de original.',
        },
        {
          q: 'Cum verific dacă un certificat de cazier fiscal este autentic?',
          a: 'Deschizi PDF-ul într-un cititor care validează semnături electronice (Adobe Acrobat Reader) și verifici că semnătura aparține ANAF și că documentul nu a fost modificat după semnare. În plus, pe document este tipărit un cod de verificare pe care instituția destinatară îl poate folosi la confruntarea cu evidența ANAF.',
        },
        {
          q: 'Când se șterge o faptă din cazierul fiscal?',
          a: 'Contravențiile se radiază la un an de la achitarea integrală a amenzii, inactivitatea fiscală la trei luni de la reactivare, iar faptele de natură penală la cinci ani de la rămânerea definitivă a hotărârii sau de la reabilitare. Radierea se face din oficiu.',
        },
        {
          q: 'Pot verifica cazierul fiscal al unui partener de afaceri?',
          a: 'Nu. Cazierul fiscal se eliberează titularului sau împuternicitului său, nu terților. Despre un partener poți verifica altceva: certificatul constatator de la Registrul Comerțului și listele publice ANAF, printre care registrul contribuabililor inactivi și cel al plătitorilor de TVA.',
        },
        {
          q: 'Cazierul fiscal arată dacă am datorii la ANAF?',
          a: 'Nu. Datoriile la bugetul de stat apar în certificatul de atestare fiscală, care este un document diferit. Poți avea cazier fiscal curat și datorii neachitate în același timp, iar unele dosare cer ambele documente.',
        },
      ]}
    >
      <p>
        Verificarea cazierului fiscal se face într-un singur fel: ceri certificatul de la ANAF și
        citești ce scrie în el. Nu există o pagină publică unde să introduci CNP-ul și să vezi pe loc
        dacă ai ceva înscris, așa cum verifici o amendă sau rovinieta. Evidența nu este deschisă
        interogării, iar cererea se depune prin Spațiul Privat Virtual, la ghișeul administrației
        financiare sau printr-un împuternicit. Răspunsul vine sub forma unui certificat care spune fie
        că titularul nu are fapte înscrise, fie exact ce s-a înscris și când.
      </p>
      <p>
        Dacă ai deja un certificat în mână, sunt două verificări diferite de făcut. Autenticitatea se
        confirmă din semnătura electronică a ANAF și din codul de verificare tipărit pe document.
        Valabilitatea ține de calendar: 30 de zile de la emitere, cu o singură utilizare, la
        instituția pentru care a fost cerut. Mai jos le luăm pe rând, împreună cu situația în care
        apare o faptă pe care o credeai ștearsă. Pentru noțiunile de bază, adică ce este cazierul
        fiscal și ce fapte ajung în el, avem un ghid separat despre{' '}
        <Link href="/cazier-fiscal-persoana-fizica/">cazierul fiscal al persoanei fizice</Link>.
      </p>

      <h2>Cum afli dacă ai ceva înscris</h2>
      <p>
        Aceasta e întrebarea reală din spatele căutărilor de tip „verificare cazier fiscal online&rdquo;.
        Răspunsul dezamăgește pe mulți: ANAF nu pune la dispoziție un instrument de consultare rapidă a
        propriei poziții. Datele din cazierul fiscal sunt protejate, iar accesul la ele se face doar
        prin eliberarea certificatului, către titular sau către împuternicitul lui. Site-urile care
        promit „verificare instant după CNP&rdquo; nu au acces la evidența ANAF.
      </p>
      <p>Rămân trei căi, toate cu același rezultat, dar cu costuri și termene diferite.</p>
      <h3>1. Din Spațiul Privat Virtual</h3>
      <p>
        Dacă ai contul activat, depui cererea electronic și primești certificatul semnat digital, de
        regulă în câteva ore până într-o zi lucrătoare. Este gratuit. Documentul apare în secțiunea de
        mesaje a contului, ca fișier PDF descărcabil.
      </p>
      <h3>2. La administrația financiară</h3>
      <p>
        Se completează cererea tip și se prezintă actul de identitate. Termenul legal este de până la 5
        zile lucrătoare, în practică deseori mai scurt. Tot gratuit, dar presupune deplasare la
        administrația de domiciliu fiscal, în programul cu publicul.
      </p>
      <h3>3. Prin împuternicit</h3>
      <p>
        Varianta pentru cei care nu au cont SPV, nu pot trece de activarea online sau sunt în
        străinătate. Cererea o depune un împuternicit pe baza unei procuri, iar documentul ajunge pe
        email. Serviciul de{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazier fiscal online</Link> costă 198 RON cu TVA
        și durează 1–3 zile lucrătoare.
      </p>

      <h2>Ce scrie efectiv în certificat</h2>
      <p>
        Certificatul are o singură pagină. În partea de sus, antetul ANAF, autoritatea emitentă,
        numărul de înregistrare și data emiterii. Urmează datele de identificare ale titularului: nume,
        prenume, CNP, domiciliul fiscal. Iar în rubrica de mențiuni, partea pentru care ai cerut
        documentul:
      </p>
      <ul>
        <li>
          formularea că titularul nu are fapte înscrise în cazierul fiscal, în varianta cea mai
          frecventă;
        </li>
        <li>
          sau lista faptelor, fiecare cu descrierea sancțiunii, temeiul legal și data la care actul de
          sancționare a rămas definitiv.
        </li>
      </ul>
      <p>
        Nu are hologramă, nu se tipărește pe hârtie specială și nu poartă timbru sec. În varianta
        electronică, singurul element care garantează originalitatea este semnătura digitală.
      </p>

      <h2>Cum verifici că documentul primit e autentic</h2>
      <p>
        Certificatul emis electronic este semnat digital de ANAF. Deschide PDF-ul într-un cititor care
        validează semnături, cum e Adobe Acrobat Reader, și uită-te la bara de stare din partea de sus.
        Un document intact arată semnătura ca fiind validă și indică titularul certificatului digital,
        adică autoritatea fiscală. Dacă apare avertismentul că documentul a fost modificat după
        semnare, fișierul nu mai are valoare.
      </p>
      <p>
        Un detaliu contează aici: dacă printezi PDF-ul, semnătura electronică nu se transferă pe
        hârtie. Copia tipărită e doar o imagine a documentului. De aceea instituțiile care acceptă
        varianta electronică cer fișierul, nu scanul lui. Pe document este tipărit și un cod de
        verificare, prin care instituția destinatară poate confrunta datele cu evidența ANAF. Cine
        primește un certificat și are un dubiu se adresează administrației emitente, menționând
        numărul și data.
      </p>

      <h2>Cum verifici dacă mai e valabil</h2>
      <p>
        Regula e simplă: 30 de zile de la data emiterii, tipărită pe document. În ziua 31 certificatul
        nu mai este acceptat, chiar dacă situația ta nu s-a schimbat între timp. Nu există prelungire,
        reconfirmare sau viză, se cere unul nou.
      </p>
      <p>
        A doua parte a regulii se uită des: certificatul se folosește o singură dată, la instituția
        pentru care a fost cerut. Dacă îți trebuie și la Registrul Comerțului, și la o autoritate
        contractantă, ceri două certificate. Dacă ești în plin dosar și nu mai știi ce document a
        expirat, poți folosi{' '}
        <Link href="/calculator/valabilitate-documente/">calculatorul de valabilitate</Link> ca să vezi
        termenele pe fiecare act în parte.
      </p>

      <h2>Ce nu verifică cazierul fiscal</h2>
      <p>
        Confuzia numărul unu: oamenii cer cazier fiscal ca să dovedească faptul că nu au datorii la
        stat. Cazierul nu spune nimic despre datorii. El arată doar sancțiuni definitive pentru fapte
        fiscale, contabile, vamale sau de disciplină financiară. Situația sumelor datorate la buget se
        vede în <strong>certificatul de atestare fiscală</strong>, emis separat, cu altă cerere și cu
        alt conținut.
      </p>
      <p>
        Practic: poți avea cazier fiscal fără nicio mențiune și, în același timp, obligații neachitate
        la ANAF. Sau invers, cazier cu o contravenție înscrisă și zero datorii. Multe dosare de
        licitație le cer pe amândouă, iar cine aduce doar unul reia drumul.
      </p>

      <h2>Dacă apare o faptă pe care o credeai radiată</h2>
      <p>
        Se întâmplă. Radierea se face din oficiu, dar operarea în sistem poate întârzia, mai ales când
        depinde de confirmarea plății unei amenzi. Primul pas e să compari data din certificat cu
        termenele de mai jos.
      </p>
      <table>
        <thead>
          <tr>
            <th>Tipul faptei</th>
            <th>Se radiază după</th>
            <th>De când curge termenul</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contravenție sancționată cu amendă</td>
            <td>1 an</td>
            <td>de la achitarea integrală a amenzii</td>
          </tr>
          <tr>
            <td>Inactivitate fiscală</td>
            <td>3 luni</td>
            <td>de la data reactivării</td>
          </tr>
          <tr>
            <td>Faptă de natură penală</td>
            <td>5 ani</td>
            <td>de la rămânerea definitivă a hotărârii sau de la reabilitare</td>
          </tr>
          <tr>
            <td>Atragerea răspunderii solidare sau patrimoniale</td>
            <td>după stingerea obligației</td>
            <td>de la stingerea integrală, în condițiile legii</td>
          </tr>
        </tbody>
      </table>
      <p>
        Dacă termenul a trecut și fapta tot apare, depui o cerere de rectificare la administrația
        financiară de domiciliu fiscal, însoțită de dovada care justifică radierea: chitanța sau
        ordinul de plată pentru amendă, decizia de reactivare, hotărârea definitivă. ANAF verifică și
        corectează înscrierea, apoi poți cere un certificat nou. Nu depune dosarul cu certificatul
        greșit sperând că trece neobservat, o mențiune în cazierul fiscal blochează înmatriculări la
        Registrul Comerțului și descalifică oferte la licitații.
      </p>

      <h2>Cazierul fiscal al unui partener de afaceri</h2>
      <p>
        Nu se poate verifica. Certificatul se eliberează titularului sau împuternicitului său, deci nu
        poți afla situația unei firme ori a unui administrator din curiozitate sau din prudență
        comercială. Dacă ai nevoie de garanția asta într-o relație contractuală, singura variantă
        corectă e să ceri partenerului să îți prezinte el certificatul, așa cum procedează autoritățile
        contractante.
      </p>
      <p>Ce poți verifica în schimb, fără acordul nimănui:</p>
      <ul>
        <li>
          <Link href="/servicii/certificat-constatator-online/">certificatul constatator</Link> de la
          Registrul Comerțului, care arată asociații, administratorii, sediul, obiectul de activitate și
          starea juridică a firmei, inclusiv dizolvarea sau insolvența;
        </li>
        <li>
          registrul contribuabililor inactivi de pe site-ul ANAF, unde apar firmele declarate inactive
          fiscal;
        </li>
        <li>
          registrul plătitorilor de TVA și cel al persoanelor care aplică TVA la încasare, utile înainte
          de a emite facturi.
        </li>
      </ul>
      <p>
        Combinația dintre certificatul constatator și starea de inactivitate fiscală acoperă cea mai
        mare parte a riscurilor pe care oamenii încearcă să le prevină căutând cazierul fiscal al
        celuilalt.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Nu ai cum să îți consulți rapid poziția în cazierul fiscal, singura verificare reală e
        certificatul cerut de la ANAF, gratuit prin SPV sau la ghișeu și contra cost prin împuternicit.
        Documentul primit se validează prin semnătura electronică și prin codul de verificare, rămâne
        bun 30 de zile și se depune o singură dată. Datoriile la buget nu apar acolo, ci în certificatul
        de atestare fiscală. Iar dacă o faptă radiată tot figurează, cererea de rectificare la
        administrația financiară e pasul care rezolvă situația.
      </p>
    </ArticleLayout>
  );
}
