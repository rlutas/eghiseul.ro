import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'totul-despre-cartea-funciara-colectiva';
const TITLE = 'Tot Ce Trebuie Să Știi Despre Cartea Funciară Colectivă';
const DESCRIPTION =
  'Ce este cartea funciară colectivă, cum este înființată, ce conține extrasul (Părțile A, B, C), ' +
  'rolul asociației de proprietari, intabularea și actualizarea cotelor indivize. Ghid complet + cum obții extrasul.';
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
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="16 iunie 2026"
      relatedServices={[
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară', desc: 'Document oficial ANCPI, livrat pe email.' },
        { href: '/importanta-extras-de-carte-funciara-colectiva/', label: 'Importanța extrasului de carte funciară colectivă', desc: 'De ce contează CF colectivă pentru apartamente.' },
      ]}
      faqs={[
        {
          q: 'Ce este cartea funciară colectivă?',
          a: 'Cartea funciară colectivă este un document oficial înființat odată cu înregistrarea primei cărți funciare individuale la oficiul de cadastru și publicitate imobiliară, care include informații despre terenul pe care se află condominiul, cotele indivize și drepturile de proprietate ale fiecărui proprietar.',
        },
        {
          q: 'Care este diferența dintre un extras de carte funciară și un extras de carte funciară colectivă?',
          a: 'Extrasul de carte funciară oferă detalii despre o unitate individuală (apartament sau casă), în timp ce extrasul de carte funciară colectivă se referă la situația imobilului și terenului comun, precum și la cotele indivize ale proprietarilor din cadrul condominiului.',
        },
        {
          q: 'Ce fac dacă datele din extras nu sunt actualizate?',
          a: 'Consultați oficiul de cadastru și publicitate imobiliară pentru actualizarea documentului. Puteți solicita intabularea noilor informații referitoare la drepturile de proprietate sau cotele indivize.',
        },
        {
          q: 'Când e nevoie de carte funciară colectivă?',
          a: 'Cartea funciară colectivă este necesară în tranzacții imobiliare, obținerea unui credit bancar, actualizarea drepturilor de proprietate și în litigii privind proprietățile comune.',
        },
        {
          q: 'De ce informații am nevoie pentru a scoate un extras de carte funciară colectivă?',
          a: 'Sunt necesare datele proprietarului, numărul de carte funciară și informații despre imobil, precum adresa sau numărul cadastral.',
        },
      ]}
    >
      <h2>Ce este cartea funciară?</h2>
      <p>
        <strong>Cartea funciară</strong> este un registru public oficial utilizat în sistemul de{' '}
        <strong>cadastru și publicitate imobiliară</strong>, care are scopul de a înregistra și evidenția{' '}
        <strong>situația juridică a imobilelor</strong>. Aceasta include <strong>informații esențiale</strong> despre:
      </p>
      <ul>
        <li>
          <strong>Descrierea imobilului</strong> – dimensiuni, amplasament și destinație.
        </li>
        <li>
          <strong>Titularii drepturilor de proprietate</strong> – <strong>identitatea proprietarilor</strong> și{' '}
          <strong>cotele lor indivize</strong>, dacă este cazul.
        </li>
        <li>
          <strong>Sarcinile care grevează imobilul</strong> – ipoteci, servituți, sechestru sau alte sarcini juridice.
        </li>
      </ul>
      <p>
        <strong>Cartea funciară</strong> oferă garanția că drepturile de proprietate și alte aspecte juridice sunt
        înregistrate oficial, fiind un <strong>document oficial</strong> indispensabil pentru realizarea{' '}
        <strong>tranzacțiilor imobiliare</strong>, obținerea de credite bancare sau rezolvarea litigiilor legate de
        proprietăți.
      </p>

      <h2>Cum este înființată cartea funciară colectivă?</h2>
      <p>
        <strong>Cartea funciară colectivă</strong> este înființată odată cu înregistrarea la{' '}
        <strong>Oficiul de Cadastru și Publicitate Imobiliară</strong> a primei{' '}
        <strong>cărți funciare individuale</strong> aferente unui spațiu din interiorul unui{' '}
        <strong>condominiu</strong>. Aceasta include date esențiale referitoare la:
      </p>
      <ul>
        <li>
          <strong>Terenul pe care se află construcția</strong>
        </li>
        <li>
          <strong>Imobilul în sine</strong>
        </li>
        <li>
          <strong>Cotele indivize ale fiecărui proprietar</strong>
        </li>
      </ul>
      <p>
        <strong>Cartea funciară colectivă</strong> este un document esențial în <strong>lumea imobiliară</strong>,
        reducând suspiciunea de fraudă prin oferirea de informații actualizate și clare despre situația juridică a{' '}
        <strong>imobilelor</strong>.
      </p>

      <h2>Ce conține extrasul de carte funciară colectivă?</h2>
      <p>
        <strong>Extrasul de carte funciară colectivă</strong> este o versiune restrânsă a{' '}
        <strong>cărții funciare colective</strong> și reprezintă un <strong>document oficial</strong> necesar pentru
        diverse <strong>tranzacții imobiliare</strong>. Structura sa este următoarea:
      </p>
      <ul>
        <li>
          <strong>Partea A – Descrierea imobilului</strong>: include detalii despre <strong>imobil</strong>, cum ar fi
          dimensiunea, destinația și locația acestuia.
        </li>
        <li>
          <strong>Partea B – Titularii dreptului de proprietate</strong>: evidențiază{' '}
          <strong>identitatea proprietarilor</strong> și <strong>cotele indivize</strong> care revin fiecărui
          proprietar.
        </li>
        <li>
          <strong>Partea C – Sarcini</strong>: aici sunt menționate eventualele ipoteci, servituți sau alte sarcini
          juridice care afectează <strong>imobilul</strong>.
        </li>
      </ul>
      <p>
        <strong>Documentul este solicitat</strong> frecvent pentru verificarea legalității{' '}
        <strong>tranzacțiilor imobiliare</strong>, pentru <strong>intabulare</strong> sau în cazul obținerii unui
        extras de plan <strong>cadastral</strong>.
      </p>

      <h2>Rolul asociației de proprietari în gestionarea cărții funciare colective</h2>
      <p>
        În cadrul <strong>condominiului</strong>, rolul <strong>asociației de proprietari</strong> este crucial în
        actualizarea și gestionarea <strong>cărților funciare colective</strong>. Aceasta trebuie să se asigure că{' '}
        <strong>informațiile cu privire la cotele</strong> indivize sunt corecte și reflectă{' '}
        <strong>situația actuală a imobilelor înregistrate</strong>.
      </p>
      <p>
        O <strong>carte funciară colectivă</strong> actualizată corect previne <strong>litigii</strong> și facilitează
        procesul de <strong>vânzare-cumpărare</strong>, dar și accesul la <strong>utilități</strong> sau{' '}
        <strong>programe de reconstituire a imobilelor</strong>.
      </p>

      <h3>Cum se obține extrasul de carte funciară colectivă?</h3>
      <ul>
        <li>
          <strong>Platforma eGhișeul</strong>: permite accesul rapid și aplicarea ușoară pentru obținerea
          informațiilor cadastrale și a documentului în format digital.
        </li>
        <li>
          <strong>Oficiul de Cadastru (OCPI)</strong>: documentul poate fi solicitat direct la sediul oficiului.
        </li>
        <li>
          <strong>Servicii notariale</strong>: notarii publici facilitează accesul la acest document pentru tranzacții
          imobiliare.
        </li>
      </ul>
      <p>
        <Link href={serviceUrl('extras-carte-funciara')}>Extrasul de carte funciară</Link> colectivă oferă informații
        detaliate despre <strong>imobil</strong>, <strong>proprietari</strong> și situația juridică, fiind
        indispensabil pentru <strong>tranzacțiile imobiliare</strong>. Poți solicita un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară online</Link>, livrat oficial de
        ANCPI direct pe email, fără deplasare la ghișeu.
      </p>

      <h2>Intabularea și actualizarea informațiilor</h2>
      <p>
        Orice schimbare în <strong>situația juridică a imobilelor</strong>, fie că este vorba despre{' '}
        <strong>vânzare-cumpărare</strong>, <strong>intabulare</strong> sau modificări privind{' '}
        <strong>cotele indivize</strong>, trebuie reflectată în <strong>cartea funciară colectivă</strong>.{' '}
        <strong>Intabularea</strong> asigură legalitatea și transparența proprietăților, facilitând obținerea{' '}
        <strong>extrasului de carte funciară colectivă</strong>.
      </p>

      <h2>Procedura pentru actualizarea informațiilor din cartea funciară colectivă</h2>
      <p>
        Cum se pot face modificări în cartea funciară colectivă în cazul schimbării proprietarilor sau a cotelor
        indivize?
      </p>
      <p>
        Actualizarea informațiilor din <strong>cartea funciară colectivă</strong> este esențială pentru a reflecta
        modificările legale și de proprietate. Iată pașii principali pentru efectuarea acestor modificări:
      </p>
      <ol>
        <li>
          <strong>Depunerea cererii</strong>: proprietarii sau reprezentanții legali trebuie să depună o cerere de
          actualizare la <strong>Oficiul de Cadastru și Publicitate Imobiliară (OCPI)</strong>. Cererea trebuie să fie
          însoțită de documentele justificative relevante, cum ar fi actele de vânzare-cumpărare, contractele de
          donație sau alte acte notariale.
        </li>
        <li>
          <strong>Documentele necesare</strong>: în funcție de tipul modificării, documentele necesare pot include:
          <ul>
            <li>Actul de identitate al proprietarului.</li>
            <li>
              Documentele care dovedesc transferul de proprietate (de exemplu, contractul de vânzare-cumpărare).
            </li>
            <li>
              Actele adiționale necesare pentru modificarea <strong>cotelor indivize</strong>.
            </li>
          </ul>
        </li>
        <li>
          <strong>Verificarea documentelor</strong>: funcționarii OCPI vor verifica autenticitatea și legalitatea
          documentelor depuse. Dacă documentele sunt în ordine, cererea va fi acceptată.
        </li>
        <li>
          <strong>Actualizarea informațiilor</strong>: după verificarea documentelor, informațiile noi vor fi
          înregistrate în <strong>cartea funciară colectivă</strong>. Aceasta poate include modificări în privința
          proprietarilor, <strong>cotelor indivize</strong> sau alte detalii relevante.
        </li>
        <li>
          <strong>Intabularea</strong>: <strong>intabularea</strong> este procesul prin care modificările sunt înscrise
          oficial în <strong>cartea funciară colectivă</strong>, asigurând transparența și legalitatea acestor
          schimbări. Este important ca toate modificările să fie <strong>intabulate</strong> pentru a reflecta{' '}
          <strong>situația actuală a imobilelor înregistrate</strong>.
        </li>
      </ol>

      <h2>Avantajele utilizării cărții funciare colective</h2>
      <ul>
        <li>
          <strong>Transparență și siguranță</strong>: reducerea suspiciunilor de fraudă și protecția drepturilor de
          proprietate.
        </li>
        <li>
          <strong>Sprijin în lumea imobiliară</strong>: facilitarea <strong>tranzacțiilor imobiliare</strong> și
          accesul la finanțare.
        </li>
        <li>
          <strong>Prevenirea litigiilor</strong>: informații clare despre drepturile și obligațiile fiecărui
          proprietar.
        </li>
      </ul>

      <h2>Concluzii</h2>
      <p>
        <strong>Cartea funciară colectivă</strong> este un <strong>document esențial</strong> pentru{' '}
        <strong>cadastru și publicitate imobiliară</strong>. Aceasta oferă <strong>informații actualizate</strong>{' '}
        despre situația juridică a <strong>imobilelor</strong>, <strong>cotele indivize</strong> și{' '}
        <strong>identitatea proprietarilor</strong>, fiind un instrument indispensabil în cadrul{' '}
        <strong>tranzacțiilor imobiliare</strong>.
      </p>
      <p>
        Acest articol a fost redactat pentru a te ajuta să înțelegi importanța și utilizarea acestui document. Dacă
        dorești să începi acum procesul de obținere a unui{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară</Link> colectivă, consultă oficiul de
        cadastru sau portalul ANCPI. Pentru mai multe detalii despre cum afli numărul de carte funciară și numărul
        cadastral, poți consulta și{' '}
        <Link href="/cum-aflam-numarul-carte-functionara-si-nr-cadastral/">ghidul nostru complet</Link>.
      </p>
    </ArticleLayout>
  );
}
