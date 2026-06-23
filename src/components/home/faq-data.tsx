import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Homepage FAQ — rich answers (lists + internal links) for display + a `plain`
 * string for the FAQPage JSON-LD (schema text must match the visible meaning).
 * `HOMEPAGE_FAQS` (derived) keeps the {question, answer} shape used by
 * buildHomepageGraph. Internal links boost the service hub pages (SEO).
 */
export interface HomepageFaqItem {
  question: string;
  answer: ReactNode;
  plain: string;
}

const A = 'text-primary-600 font-medium underline hover:text-primary-700';

export const HOMEPAGE_FAQ_ITEMS: HomepageFaqItem[] = [
  {
    question: 'Cât durează obținerea unui cazier judiciar online?',
    answer: (
      <>
        <p><strong>Cazierul judiciar online</strong> se obține în 24-48 de ore de la validarea cererii. Procesul este simplu:</p>
        <ul>
          <li>Completezi formularul online (2 minute)</li>
          <li>Efectuezi plata securizată</li>
          <li>Primești documentul prin curier la adresa dorită</li>
        </ul>
        <p>Livrăm în România și internațional, inclusiv în UE, SUA, Canada și alte țări.</p>
      </>
    ),
    plain: 'Cazierul judiciar online se obține în 24-48 de ore de la validarea cererii. Completezi formularul online, efectuezi plata securizată și primești documentul prin curier la adresa dorită. Livrăm în România și internațional.',
  },
  {
    question: 'Pot obține documente dacă sunt în străinătate?',
    answer: (
      <>
        <p><strong>Da, absolut!</strong> Serviciile noastre sunt create special pentru românii din diaspora. Poți obține:</p>
        <ul>
          <li>Cazier judiciar, cazier fiscal, cazier auto</li>
          <li>Certificate de naștere, căsătorie, celibat</li>
          <li><Link href="/servicii/extras-multilingv-certificat-nastere/" className={A}>Extras multilingv</Link> pentru acte de stare civilă</li>
          <li>Extras carte funciară, certificat constatator</li>
        </ul>
        <p>Documentele fizice ajung prin curier internațional, iar cele digitale instant pe email.</p>
      </>
    ),
    plain: 'Da, serviciile noastre sunt create special pentru românii din diaspora. Poți obține cazier judiciar, cazier fiscal, cazier auto, certificate de naștere, căsătorie, celibat, extras carte funciară și certificat constatator. Documentele fizice ajung prin curier internațional, iar cele digitale instant pe email.',
  },
  {
    question: 'Documentele obținute prin eGhișeul sunt legale și oficiale?',
    answer: (
      <>
        <p><strong>Da, 100% legale și oficiale.</strong> Toate documentele sunt eliberate de instituțiile statului român:</p>
        <ul>
          <li>Cazierul judiciar — de la Inspectoratul General al Poliției Române</li>
          <li>Certificatele de stare civilă — de la primăriile competente</li>
          <li>Cazierul fiscal — de la ANAF</li>
          <li>Extrasul CF — de la ANCPI</li>
        </ul>
        <p>Avocatul nostru colaborator, înscris în Barou, depune cererea în numele clientului în baza unui contract de mandat (împuternicire avocațială). Documentele sunt emise de autorități — noi oferim asistență juridică profesională pentru facilitarea procedurii.</p>
      </>
    ),
    plain: 'Da, 100% legale și oficiale. Documentele sunt eliberate de instituțiile statului român: cazierul judiciar de la Poliția Română, certificatele de stare civilă de la primării, cazierul fiscal de la ANAF, extrasul CF de la ANCPI. Avocatul colaborator, înscris în Barou, depune cererea în numele clientului în baza unui contract de mandat. Noi oferim asistență juridică pentru facilitarea procedurii.',
  },
  {
    question: 'Cine procesează cererile și ce înseamnă „avocat colaborator"?',
    answer: (
      <p>Toate cererile depuse prin eGhișeul.ro sunt gestionate de un <strong>avocat colaborator</strong>, membru al Baroului din România, cu drept de exercitare a profesiei. Când soliciți un document, se încheie un <strong>contract de mandat</strong> (împuternicire avocațială) prin care avocatul te reprezintă în fața autorităților competente. Acesta depune cererea în numele tău, iar documentul este emis de autoritatea statului român (Poliția Română, ANAF, Primării, ANCPI sau ONRC). Secretul profesional avocațial protejează datele tale personale, iar procedura este 100% conformă cu legislația română.</p>
    ),
    plain: 'Toate cererile sunt gestionate de un avocat colaborator, membru al Baroului din România. Se încheie un contract de mandat (împuternicire avocațială) prin care avocatul te reprezintă în fața autorităților și depune cererea în numele tău. Documentul este emis de autoritatea statului (Poliția Română, ANAF, Primării, ANCPI sau ONRC). Secretul profesional avocațial protejează datele personale.',
  },
  {
    question: 'Ce metode de plată acceptați?',
    answer: (
      <>
        <p>Acceptăm următoarele metode de plată:</p>
        <ul>
          <li><strong>Card bancar</strong> — Visa, Mastercard, Maestro (plată securizată prin Stripe cu 3D Secure)</li>
          <li><strong>Transfer bancar</strong> — RON sau EUR</li>
        </ul>
        <p>Toate tranzacțiile sunt procesate securizat și primești factură fiscală.</p>
      </>
    ),
    plain: 'Acceptăm card bancar (Visa, Mastercard, Maestro) cu plată securizată prin Stripe cu 3D Secure și transfer bancar în RON sau EUR. Toate tranzacțiile sunt procesate securizat și primești factură fiscală.',
  },
  {
    question: 'Cum funcționează livrarea documentelor?',
    answer: (
      <>
        <p>Avem două tipuri de livrare, în funcție de document.</p>
        <p><strong>Livrare fizică prin curier (24-48h):</strong> cazier judiciar, cazier fiscal, cazier auto, certificate de naștere/căsătorie/celibat, extras multilingv.</p>
        <p><strong>Livrare instant pe email:</strong> extras carte funciară, certificat constatator ONRC, rovinietă online.</p>
        <p>Primești notificare și tracking pentru livrările fizice.</p>
      </>
    ),
    plain: 'Avem două tipuri de livrare: fizică prin curier (24-48h) pentru cazier judiciar, cazier fiscal, cazier auto și certificate de stare civilă; și instant pe email pentru extras carte funciară, certificat constatator ONRC și rovinieta online.',
  },
  {
    question: 'Ce fac dacă am nevoie de traducere legalizată?',
    answer: (
      <>
        <p>Oferim servicii complete de <strong>traducere legalizată</strong> pentru toate documentele:</p>
        <ul>
          <li>Traduceri autorizate în engleză, germană, franceză, spaniolă și alte limbi</li>
          <li>Apostilare pentru recunoaștere internațională</li>
          <li>Supralegalizare pentru țările care nu sunt parte la Convenția de la Haga</li>
        </ul>
        <p>Poți comanda traducerea odată cu documentul sau separat. Contactează-ne pe WhatsApp pentru detalii.</p>
      </>
    ),
    plain: 'Oferim traducere legalizată în engleză, germană, franceză, spaniolă și alte limbi, plus apostilare pentru recunoaștere internațională și supralegalizare pentru țările care nu sunt parte la Convenția de la Haga.',
  },
  {
    question: 'Cât timp este valabil certificatul de cazier judiciar?',
    answer: (
      <>
        <p><strong>Certificatul de cazier judiciar</strong> este valabil <strong>6 luni</strong> de la data eliberării — valabilitatea standard pentru:</p>
        <ul>
          <li>Angajare în România sau străinătate</li>
          <li>Emigrare sau obținere viză</li>
          <li>Participare la licitații publice</li>
          <li>Obținere permis port-armă sau alte autorizații</li>
        </ul>
        <p>Pentru scopuri specifice, verifică cerințele instituției solicitante — unele pot cere un document mai recent de 30 sau 90 de zile.</p>
      </>
    ),
    plain: 'Certificatul de cazier judiciar este valabil 6 luni de la data eliberării — valabilitatea standard pentru angajare, emigrare, licitații publice sau obținere autorizații. Pentru scopuri specifice, verifică cerințele instituției solicitante.',
  },
  {
    question: 'Este valabil cazierul judiciar românesc în străinătate?',
    answer: (
      <>
        <p><strong>Da!</strong> Cazierul judiciar din România este recunoscut internațional:</p>
        <ul>
          <li><strong>În UE</strong> — recunoscut automat conform Regulamentului 2016/1191</li>
          <li><strong>Țări membre Convenția de la Haga</strong> — cu apostilă</li>
          <li><strong>Alte țări</strong> — cu supralegalizare și traducere autorizată</li>
        </ul>
        <p>Pentru documente destinate străinătății oferim și <Link href="/servicii/extras-multilingv-certificat-nastere/" className={A}>extras multilingv</Link>, care elimină nevoia de traducere în multe țări UE.</p>
      </>
    ),
    plain: 'Da, cazierul judiciar din România este recunoscut internațional. În UE este recunoscut automat conform Regulamentului 2016/1191. Pentru țările membre Convenția de la Haga este necesar cu apostilă, iar pentru alte țări cu supralegalizare și traducere autorizată.',
  },
  {
    question: 'Care este diferența dintre cazier judiciar și certificat de integritate?',
    answer: (
      <>
        <p>Sunt două documente diferite, fiecare cu scopul său:</p>
        <ul>
          <li><strong><Link href="/servicii/cazier-judiciar-online/" className={A}>Cazierul judiciar</Link></strong> — atestă lipsa antecedentelor penale; necesar pentru angajare, emigrare, vize.</li>
          <li><strong><Link href="/servicii/certificat-de-integritate-comportamentala/" className={A}>Certificatul de integritate comportamentală</Link></strong> — conține informații extinse, obligatoriu pentru lucrul cu minori, în educație, sănătate sau pază.</li>
        </ul>
        <p>Dacă nu ești sigur care document îți trebuie, contactează-ne și te ajutăm să alegi corect.</p>
      </>
    ),
    plain: 'Cazierul judiciar atestă lipsa antecedentelor penale și este necesar pentru angajare, emigrare sau vize. Certificatul de integritate comportamentală conține informații extinse și este obligatoriu pentru lucrul cu minori, în educație, sănătate sau pază.',
  },
  {
    question: 'Ce este extrasul de carte funciară și când am nevoie de el?',
    answer: (
      <>
        <p><strong><Link href="/servicii/extras-de-carte-funciara/" className={A}>Extrasul de carte funciară</Link></strong> este documentul de la ANCPI care arată situația juridică a unui imobil. Ai nevoie de el pentru:</p>
        <ul>
          <li>Vânzare sau cumpărare proprietate</li>
          <li>Obținere credit ipotecar</li>
          <li>Verificare sarcini și ipoteci</li>
          <li>Moșteniri și partaje</li>
          <li>Închiriere sau autorizații de construire</li>
        </ul>
        <p>Îl primești în format digital pe email în maxim 24 de ore.</p>
      </>
    ),
    plain: 'Extrasul de carte funciară este documentul de la ANCPI care arată situația juridică a unui imobil. Este necesar pentru vânzare sau cumpărare proprietate, credit ipotecar, verificare sarcini și ipoteci, moșteniri sau autorizații de construire.',
  },
  {
    question: 'Ce este cazierul fiscal și cine are nevoie de el?',
    answer: (
      <>
        <p><strong><Link href="/servicii/cazier-fiscal-online/" className={A}>Cazierul fiscal</Link></strong> este emis de ANAF și atestă că nu ai datorii la stat. Este necesar pentru:</p>
        <ul>
          <li>Participare la licitații publice</li>
          <li>Obținere licențe și autorizații</li>
          <li>Înființare firmă sau numire administrator</li>
          <li>Accesare fonduri europene</li>
          <li>Contracte cu instituții publice</li>
        </ul>
        <p>Poate fi solicitat atât de persoane fizice, cât și de persoane juridice (firme).</p>
      </>
    ),
    plain: 'Cazierul fiscal este emis de ANAF și atestă că nu ai datorii la stat. Este necesar pentru licitații publice, obținere licențe și autorizații, înființare firmă, accesare fonduri europene sau contracte cu instituții publice.',
  },
  {
    question: 'Pentru ce am nevoie de certificat de celibat?',
    answer: (
      <>
        <p><strong><Link href="/servicii/eliberare-certificat-de-celibat/" className={A}>Certificatul de celibat</Link></strong> (sau de capacitate matrimonială) atestă că ești liber de căsătorie. Este obligatoriu pentru:</p>
        <ul>
          <li>Căsătorie în străinătate</li>
          <li>Căsătorie cu cetățean străin în România</li>
          <li>Dovada stării civile pentru emigrare</li>
        </ul>
        <p>Se eliberează de primăria unde ai locul nașterii înregistrat. Îl poți obține rapid prin eGhișeul, cu livrare în România sau internațional.</p>
      </>
    ),
    plain: 'Certificatul de celibat (capacitate matrimonială) atestă că ești liber de căsătorie. Este obligatoriu pentru căsătorie în străinătate, căsătorie cu cetățean străin în România sau ca dovadă a stării civile pentru emigrare.',
  },
  {
    question: 'Ce documente sunt necesare pentru a solicita documente online?',
    answer: (
      <>
        <p>Pentru a solicita documente prin eGhișeul ai nevoie de:</p>
        <ul>
          <li><strong>CNP</strong> (Codul Numeric Personal)</li>
          <li><strong>Date personale</strong> — nume, prenume, data și locul nașterii</li>
          <li><strong>Adresă de livrare</strong> — unde dorești să primești documentul</li>
          <li><strong>Act de identitate</strong> — poză cu buletinul/cartea de identitate</li>
          <li><strong>Selfie pentru verificare</strong> — pentru confirmarea identității</li>
        </ul>
        <p>Procesul de verificare este necesar pentru securitatea ta și conformitatea legală. Completezi formularul online, încarci documentele și noi ne ocupăm de restul.</p>
      </>
    ),
    plain: 'Ai nevoie de CNP, date personale (nume, prenume, data și locul nașterii), adresă de livrare, poză cu actul de identitate și un selfie pentru verificarea identității. Procesul de verificare este necesar pentru securitate și conformitate legală.',
  },
  {
    question: 'Ce este certificatul constatator și când este necesar?',
    answer: (
      <>
        <p><strong><Link href="/servicii/certificat-constatator-online/" className={A}>Certificatul constatator</Link></strong> este emis de Registrul Comerțului (ONRC) și conține informații oficiale despre o firmă:</p>
        <ul>
          <li>Denumire, sediu social, CUI</li>
          <li>Asociați și administratori</li>
          <li>Capital social și obiect de activitate</li>
          <li>Puncte de lucru și sucursale</li>
        </ul>
        <p>Este necesar pentru licitații, contracte, verificări due-diligence și orice situație în care trebuie să dovedești existența legală a unei firme.</p>
      </>
    ),
    plain: 'Certificatul constatator este emis de Registrul Comerțului (ONRC) și conține informații oficiale despre o firmă: denumire, sediu, asociați, administratori, capital social. Este necesar pentru licitații, contracte și verificări due-diligence.',
  },
];

/** Plain {question, answer} pairs for FAQPage JSON-LD. */
export const HOMEPAGE_FAQS = HOMEPAGE_FAQ_ITEMS.map((i) => ({ question: i.question, answer: i.plain }));
