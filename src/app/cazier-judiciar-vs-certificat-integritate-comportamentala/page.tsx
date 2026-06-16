import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-judiciar-vs-certificat-integritate-comportamentala';
const TITLE = 'Cazier Judiciar vs Certificat de Integritate Comportamentală';
const DESCRIPTION =
  'Diferențele dintre cazierul judiciar (Legea nr. 290/2004) și certificatul de integritate comportamentală ' +
  '(Legea nr. 118/2019): ce conțin, când sunt necesare și pentru ce tip de angajare. Ghid complet + tabel comparativ.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

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
      updatedLabel="16 iunie 2026"
      relatedServices={[
        { slug: 'cazier-judiciar', label: 'Cazier Judiciar Online', desc: 'Document oficial IGPR, livrat rapid.' },
        { slug: 'certificat-integritate', label: 'Certificat de Integritate Comportamentală', desc: 'Necesar pentru lucrul cu minori.' },
      ]}
      faqs={[
        {
          q: 'Pot obține ambele documente simultan?',
          a: 'Da, poți obține atât certificatul de cazier judiciar, cât și certificatul de integritate comportamentală în același timp, fie la un ghișeu al Poliției Române, fie online prin eGhișeul.ro. Trebuie să completezi două cereri distincte, întrucât cele două documente sunt reglementate de legi diferite și vizează scopuri diferite, fiecare implicând o verificare separată în bazele de date specifice.',
        },
        {
          q: 'Cât durează eliberarea certificatului online?',
          a: 'Timpul de procesare variază, dar în majoritatea cazurilor documentele sunt disponibile în 1 până la 2 zile lucrătoare. În zilele aglomerate sau în cazul unor erori de completare a cererii, timpul de procesare poate fi extins. Platforma notifică utilizatorii prin email sau WhatsApp imediat ce certificatul este gata de livrare.',
        },
        {
          q: 'Se poate refuza eliberarea certificatului de integritate?',
          a: 'Da, eliberarea poate fi refuzată dacă solicitantul figurează în Registrul Național Automatizat al persoanelor care au comis infracțiuni sexuale, de exploatare sau asupra minorilor. În această situație nu se poate genera un certificat de „neînregistrare", deoarece persoana nu este eligibilă pentru a lucra în domenii sensibile.',
        },
        {
          q: 'Certificatul are valabilitate internațională?',
          a: 'Ambele certificate pot fi utilizate în străinătate, dar doar dacă sunt apostilate sau traduse legalizat, în funcție de cerințele țării de destinație. Apostilarea se face conform Convenției de la Haga din 1961, iar traducerea trebuie efectuată de un traducător autorizat.',
        },
        {
          q: 'Este obligatoriu pentru voluntariat în România?',
          a: 'Da, certificatul de integritate comportamentală este obligatoriu pentru orice activitate de voluntariat care implică interacțiunea cu copii, bătrâni, persoane cu dizabilități sau alte categorii vulnerabile. ONG-urile, centrele educaționale sau instituțiile sociale sunt obligate legal să verifice acest aspect.',
        },
      ]}
    >
      <p>
        Cazierul judiciar și certificatul de integritate comportamentală sunt două documente oficiale ușor de
        confundat, dar care vizează aspecte juridice diferite. Acest ghid explică ce conține fiecare, cadrul legal
        care le reglementează, când sunt necesare și de ce, în multe situații, sunt complementare — nu
        interschimbabile.
      </p>

      <h2>Ce este cazierul judiciar?</h2>

      <h3>Definiție conform Legii nr. 290/2004</h3>
      <p>
        Cazierul judiciar este un document oficial emis de Poliția Română care reflectă istoricul penal al unei
        persoane fizice sau juridice. Acesta conține informații despre condamnările definitive, măsurile educative
        sau de siguranță, amenzile penale, dar și deciziile judiciare recunoscute din alte state membre ale Uniunii
        Europene. Documentul este reglementat de Legea nr. 290/2004 privind cazierul judiciar.
      </p>

      <h3>Informații incluse în cazierul judiciar</h3>
      <p>În mod specific, cazierul judiciar include:</p>
      <ul>
        <li>Condamnările penale definitive;</li>
        <li>Măsurile educative (în special pentru minori);</li>
        <li>Măsurile de siguranță;</li>
        <li>Amenzile penale;</li>
        <li>Hotărârile străine recunoscute în România;</li>
        <li>Informații privind amnistii sau reabilitări.</li>
      </ul>

      <h3>Când este necesar</h3>
      <p>Cazierul judiciar este solicitat în numeroase situații administrative și juridice, precum:</p>
      <ul>
        <li>Angajarea în instituții publice sau private;</li>
        <li>Participarea la concursuri sau examene oficiale;</li>
        <li>Obținerea cetățeniei române;</li>
        <li>Activități notariale sau juridice;</li>
        <li>Încheierea unor contracte de prestări servicii;</li>
        <li>Activități economice reglementate.</li>
      </ul>
      <p>
        Este un document standard în evaluarea moralității și a istoricului comportamental al unei persoane
        într-un context profesional sau instituțional.
      </p>

      <h2>Ce este certificatul de integritate comportamentală</h2>

      <h3>Definiție conform Legii nr. 118/2019</h3>
      <p>
        Certificatul de integritate comportamentală este un document reglementat de Legea nr. 118/2019, care
        dovedește dacă o persoană este sau nu înscrisă în Registrul Național Automatizat al Persoanelor care au
        Comis Infracțiuni Sexuale, de Exploatare sau asupra Minorilor. El vizează exclusiv acele infracțiuni cu
        impact direct asupra categoriilor vulnerabile.
      </p>

      <h3>Infracțiuni vizate</h3>
      <p>Documentul confirmă absența sau existența condamnărilor pentru infracțiuni precum:</p>
      <ul>
        <li>Infracțiuni sexuale;</li>
        <li>Infracțiuni de exploatare a minorilor;</li>
        <li>Trafic de persoane;</li>
        <li>Coruperea sexuală a minorilor.</li>
      </ul>

      <h3>Scopuri specifice ale utilizării</h3>
      <p>Certificatul este esențial pentru persoanele care intenționează să lucreze cu:</p>
      <ul>
        <li>Copii (școli, grădinițe, centre educaționale);</li>
        <li>Persoane vârstnice;</li>
        <li>Persoane cu dizabilități;</li>
        <li>Alte categorii vulnerabile.</li>
      </ul>
      <p>
        Este solicitat în domenii precum educație, sănătate, asistență socială, voluntariat sau transport de
        persoane.
      </p>

      <h2>Comparație directă – tabel sinoptic</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Caracteristică</th>
              <th>Cazier judiciar</th>
              <th>Certificat de Integritate Comportamentală</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Lege aplicabilă</strong></td>
              <td>Legea nr. 290/2004</td>
              <td>Legea nr. 118/2019</td>
            </tr>
            <tr>
              <td><strong>Informații</strong></td>
              <td>Condamnări penale definitive, măsuri educative, amenzi</td>
              <td>Doar infracțiuni sexuale și asupra minorilor</td>
            </tr>
            <tr>
              <td><strong>Scop</strong></td>
              <td>Angajare generală, concursuri, cetățenie</td>
              <td>Verificări specifice pentru lucrul cu persoane vulnerabile</td>
            </tr>
            <tr>
              <td><strong>Valabilitate</strong></td>
              <td>6 luni</td>
              <td>6 luni</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Când este necesitat fiecare document</h2>

      <h3>Angajări în sistemul public vs. privat</h3>
      <ul>
        <li>În <strong>mediul public</strong>, ambele documente pot fi solicitate simultan.</li>
        <li>
          În <strong>sectorul privat</strong>, cazierul este necesar în domenii precum paza, IT, contabilitate etc.,
          iar certificatul de integritate în educație și servicii sociale.
        </li>
      </ul>

      <h3>Voluntariat, sănătate, educație</h3>
      <p>
        Organizațiile non-guvernamentale, spitalele și școlile sunt obligate să solicite certificatul de integritate
        comportamentală pentru a proteja beneficiarii.
      </p>

      <h3>Proceduri juridice</h3>
      <p>
        Cazierul judiciar este aproape întotdeauna obligatoriu pentru încheierea de acte notariale, dosare judiciare
        sau în procesele de naturalizare.
      </p>

      <h2>Obținerea certificatelor prin platforma eGhișeul.ro</h2>
      <p>
        Pentru o experiență digitală rapidă și fără deplasări la ghișeu, eGhișeul.ro oferă o soluție eficientă pentru
        obținerea{' '}
        <Link href={serviceUrl('cazier-judiciar')}>certificatului de cazier judiciar</Link> și a{' '}
        <Link href={serviceUrl('certificat-integritate')}>certificatului de integritate comportamentală</Link>.
        Platforma poate fi accesată de către cetățeni români, persoane juridice și cetățeni străini, fiecare având
        condiții specifice de aplicare.
      </p>

      <h3>Documente necesare pentru obținerea certificatelor</h3>
      <p>
        Pentru a obține certificatul de cazier judiciar sau certificatul de integritate comportamentală prin
        intermediul platformei <strong>eGhișeul.ro</strong>, cetățenii români trebuie să pregătească următoarele:
      </p>
      <ul>
        <li>
          <strong>Un act de identitate valabil</strong>, cum ar fi cartea de identitate, pașaportul sau cartea de
          identitate provizorie;
        </li>
        <li>
          <strong>O fotografie tip selfie</strong>, utilizată pentru verificarea identității vizuale;
        </li>
        <li>
          <strong>Completarea datelor personale corecte</strong>, incluzând numele complet, numele părinților, codul
          numeric personal (CNP), adresa de domiciliu și alte informații relevante.
        </li>
      </ul>
      <p>
        După completarea cererii online, certificatul este emis în format fizic, semnat și ștampilat de Poliția
        Română, iar ulterior poate fi livrat în format electronic (email sau WhatsApp) sau fizic, direct la
        domiciliu.
      </p>
      <p>
        Toate datele furnizate pe platforma eGhișeul.ro sunt tratate cu maximă responsabilitate, în conformitate cu
        normele legale privind protecția datelor cu caracter personal. Informațiile sunt transmise și stocate prin
        protocoale securizate, iar elemente sensibile precum CNP-ul, domiciliul sau fotografia selfie sunt complet
        criptate.
      </p>

      <h2>Situații în care cazierul afectează angajarea</h2>

      <h3>Domenii cu restricții</h3>
      <p>
        Un cazier judiciar care conține condamnări poate limita semnificativ accesul la anumite locuri de muncă, în
        special în domenii precum:
      </p>
      <ul>
        <li>ordine publică și pază;</li>
        <li>educație și învățământ;</li>
        <li>administrație publică;</li>
        <li>transport persoane;</li>
        <li>sistemul bancar sau financiar.</li>
      </ul>
      <p>Aceste sectoare impun adesea condiții stricte de integritate și reputație ireproșabilă.</p>

      <h3>Interdicții suplimentare</h3>
      <p>
        În unele cazuri, pe lângă condamnare, instanța poate stabili și interdicții legale, cum ar fi:
      </p>
      <ul>
        <li>interzicerea exercitării unei profesii;</li>
        <li>interzicerea ocupării unei funcții publice;</li>
        <li>suspendarea dreptului de a călători sau de a deține o armă.</li>
      </ul>
      <p>
        Aceste interdicții apar automat în cazier și pot descalifica persoana de la anumite activități.
      </p>

      <h3>Impact asupra reputației</h3>
      <p>Chiar dacă o condamnare este veche sau minoră, aceasta poate afecta:</p>
      <ul>
        <li>procesul de recrutare;</li>
        <li>obținerea de autorizații sau licențe;</li>
        <li>încrederea partenerilor de afaceri sau a clienților.</li>
      </ul>
      <p>De aceea, mulți angajatori solicită un cazier actualizat înainte de începerea colaborării.</p>

      <h2>Ce înseamnă să fii înregistrat în Registrul Național</h2>

      <h3>Obligații legale</h3>
      <p>
        Persoanele înscrise în Registrul Național Automatizat al infracțiunilor sexuale și de exploatare au
        responsabilități stricte, printre care:
      </p>
      <ul>
        <li>prezentarea la poliție la fiecare 3 luni pentru actualizarea datelor;</li>
        <li>informarea autorităților cu cel puțin 15 zile înainte de orice plecare din localitate;</li>
        <li>furnizarea de informații privind activitatea curentă și sursele de venit.</li>
      </ul>

      <h3>Frecvența raportării</h3>
      <p>
        Aceste obligații sunt menite să protejeze persoanele vulnerabile și sunt aplicate strict. Lipsa de conformare
        poate duce la sancțiuni suplimentare sau urmărire penală.
      </p>

      <h3>Interdicții de angajare</h3>
      <p>Persoanele înscrise în registru nu pot lucra legal în:</p>
      <ul>
        <li>instituții de învățământ;</li>
        <li>centre de plasament;</li>
        <li>spitale;</li>
        <li>ONG-uri ce lucrează cu copii sau bătrâni;</li>
        <li>firme de transport persoane.</li>
      </ul>
      <p>
        Chiar dacă nu figurează în cazierul judiciar, aceste persoane nu pot obține certificatul de integritate
        comportamentală, ceea ce le face ineligibile pentru astfel de posturi.
      </p>

      <h2>Diferențele fundamentale – recapitulare finală</h2>

      <h3>Cine are nevoie de cazier?</h3>
      <p>Orice persoană care aplică pentru:</p>
      <ul>
        <li>un loc de muncă în România sau UE;</li>
        <li>un post public;</li>
        <li>cetățenie;</li>
        <li>funcții cu răspundere penală sau financiară.</li>
      </ul>

      <h3>Cine are nevoie de certificat de integritate?</h3>
      <p>Persoanele care:</p>
      <ul>
        <li>lucrează cu copii, vârstnici sau persoane vulnerabile;</li>
        <li>doresc să activeze în educație, sănătate, ONG-uri;</li>
        <li>aplică pentru voluntariat în medii sensibile.</li>
      </ul>

      <h3>Documente complementare, nu substituente</h3>
      <p>
        Cele două documente <strong>nu se exclud reciproc</strong>. În multe situații, este necesară prezentarea
        ambelor pentru a demonstra un profil juridic complet.
      </p>
    </ArticleLayout>
  );
}
