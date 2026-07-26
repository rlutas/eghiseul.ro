import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-judiciar-online-gratuit';
// H1 descriptiv; titlul din SERP e mai scurt și pune platformele în față,
// pentru că exact ele sunt căutate („ghiseul.ro cazier” = 22.016 expuneri/3 luni).
const TITLE =
  'Cazier judiciar online gratuit: cum îl scoți singur prin ghiseul.ro sau HUB MAI și când ruta gratuită nu funcționează';
const META_TITLE = 'Cazier judiciar gratuit online — ghiseul.ro și HUB MAI, pas cu pas';
const DESCRIPTION =
  'Certificatul de cazier judiciar este gratuit online pentru persoanele fizice cu cetățenie română și cont validat, ' +
  'prin ghiseul.ro sau hub.mai.gov.ro. Cum îl scoți singur, ce condiții trebuie îndeplinite și situațiile în care ' +
  'ruta gratuită nu se aplică: firme, cetățeni străini, card bancar nerezident, exemplar pe hârtie.';
const DATE_PUBLISHED = '2026-07-26';
const DATE_MODIFIED = '2026-07-26';

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
      category="Cazier judiciar"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="26 iulie 2026"
      updatedLabel="26 iulie 2026"
      imageAlt="Laptop cu formular online deschis, alături de buletin și card bancar — obținerea gratuită a cazierului judiciar prin platformele statului"
      relatedServices={[
        {
          slug: 'cazier-judiciar-persoana-juridica',
          label: 'Cazier judiciar pentru firmă',
          desc: 'Pentru persoane juridice nu există rută online la stat — cererea se depune fizic. O depunem noi.',
        },
        {
          slug: 'cazier-judiciar-persoana-fizica',
          label: 'Cazier judiciar persoană fizică',
          desc: 'Când nu ai cont validat, card românesc sau nu ești în țară.',
        },
        {
          href: '/taxa-cazier-judiciar/',
          label: 'Cât costă cazierul judiciar',
          desc: 'Taxele reale, pe fiecare variantă de obținere.',
        },
      ]}
      faqs={[
        {
          q: 'Cazierul judiciar online este într-adevăr gratuit?',
          a: 'Da, pentru persoane fizice cu cetățenie română care au cont validat pe ghiseul.ro sau hub.mai.gov.ro. Certificatul în formă electronică se eliberează gratuit, conform Legii 290/2004. Nu există taxă de timbru și nici cost de platformă.',
        },
        {
          q: 'Ce îmi trebuie ca să scot cazierul gratuit prin ghiseul.ro?',
          a: 'Cont pe platformă și validarea identității cu un card bancar înrolat în 3D Secure, emis de o instituție bancară din România. Fără card românesc, ruta asta nu se poate parcurge.',
        },
        {
          q: 'Dar prin HUB MAI?',
          a: 'Se completează formularul online, dar contul se validează printr-o prezență fizică, o singură dată, la o unitate de poliție. După validare, cererile ulterioare se fac integral online.',
        },
        {
          q: 'Pot obține gratuit online cazierul judiciar pentru firmă?',
          a: 'Nu. Pentru persoane juridice nu există flux electronic complet: cererea (Anexa nr. 35 la H.G. 345/2010) se depune fizic la o subunitate de poliție, de reprezentantul legal sau de o persoană împuternicită, împreună cu actul de identitate în original și documentul de înregistrare al firmei. Serviciul e gratuit, dar nu online.',
        },
        {
          q: 'Sunt cetățean străin cu ședere în România. Pot folosi ruta gratuită online?',
          a: 'Nu. Poliția Română precizează explicit că certificatul poate fi obținut online de persoane fizice de cetățenie română. Cetățenii străini depun cererea fizic sau printr-un împuternicit.',
        },
        {
          q: 'Locuiesc în străinătate. Merge ruta gratuită?',
          a: 'Depinde de ce ai. Îți trebuie fie card bancar emis de o bancă din România și înrolat 3D Secure (pentru ghiseul.ro), fie o deplasare în țară pentru validarea contului la poliție (pentru HUB MAI). Dacă nu ai niciuna dintre ele, ruta gratuită rămâne închisă până revii în țară.',
        },
        {
          q: 'Certificatul electronic e valabil peste tot? Îl pot printa?',
          a: 'Certificatul electronic este semnat cu semnătură electronică calificată și este asimilat înscrisurilor autentice. Atenție însă la un detaliu care surprinde pe mulți: versiunea printată nu are valoare legală. Dacă instituția care ți-l cere vrea exemplar pe hârtie, cu ștampilă — sau apostilă pentru străinătate — fișierul PDF nu îți rezolvă problema.',
        },
        {
          q: 'Cât este valabil certificatul de cazier judiciar?',
          a: 'Șase luni de la data eliberării.',
        },
        {
          q: 'Am antecedente. Îl primesc tot pe loc?',
          a: 'Nu neapărat. Eliberarea imediată funcționează când datele nu necesită verificări suplimentare în evidențe. Dacă apar înscrieri sau potriviri care cer verificare, cererea intră pe flux de lucru și durează.',
        },
      ]}
    >
      <p>
        Da, certificatul de cazier judiciar se obține gratuit online. Nu e o ofertă comercială, e
        serviciu al statului: pentru persoane fizice cu cetățenie română care au cont validat,
        documentul electronic se eliberează fără nicio taxă, prin{' '}
        <strong>ghiseul.ro</strong> sau <strong>hub.mai.gov.ro</strong>. Dacă intri în categoria
        asta și ai deja contul făcut, îl poți avea în câteva minute și nu ai nevoie de nimeni.
      </p>
      <p>
        Restul articolului e despre partea pe care platformele nu ți-o spun din prima: ce anume
        înseamnă „cont validat”, de ce mulți oameni se blochează exact acolo, și cele șase situații
        în care ruta gratuită pur și simplu nu se aplică.
      </p>

      <h2>Cele două rute gratuite, pe scurt</h2>
      <p>
        Ambele duc la același document. Diferă doar felul în care statul se convinge că ești cine
        spui că ești.
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-100 text-left">
              <th className="border border-neutral-200 p-3 font-bold">&nbsp;</th>
              <th className="border border-neutral-200 p-3 font-bold">ghiseul.ro</th>
              <th className="border border-neutral-200 p-3 font-bold">hub.mai.gov.ro</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Cum îți validezi identitatea</td>
              <td className="border border-neutral-200 p-3">
                Card bancar înrolat 3D Secure, emis de o bancă din România
              </td>
              <td className="border border-neutral-200 p-3">
                O singură prezență fizică la o unitate de poliție
              </td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-200 p-3 font-semibold">Cost</td>
              <td className="border border-neutral-200 p-3">Gratuit</td>
              <td className="border border-neutral-200 p-3">Gratuit</td>
            </tr>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Cine poate</td>
              <td className="border border-neutral-200 p-3" colSpan={2}>
                Persoane fizice, cetățenie română
              </td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-200 p-3 font-semibold">Ce primești</td>
              <td className="border border-neutral-200 p-3" colSpan={2}>
                PDF semnat cu semnătură electronică calificată, valabil 6 luni
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Pas cu pas, prin ghiseul.ro</h2>
      <ol>
        <li>Îți faci cont pe platformă, dacă nu ai deja unul.</li>
        <li>
          Validezi identitatea cu un card bancar emis în România, înrolat în 3D Secure. Cardul e
          folosit ca metodă de identificare, nu ca să plătești ceva — certificatul rămâne gratuit.
        </li>
        <li>Cauți serviciul de eliberare a certificatului de cazier judiciar și completezi cererea.</li>
        <li>
          Dacă datele tale nu necesită verificări suplimentare în evidențe, primești pe loc PDF-ul
          semnat electronic. Dacă apar potriviri care cer verificare, cererea intră pe flux normal de
          lucru.
        </li>
      </ol>
      <p>
        Prin HUB MAI, pașii sunt aceiași, cu o singură diferență importantă: validarea contului cere
        o deplasare, o dată, la o unitate de poliție. După ea, orice cerere ulterioară se face
        integral online.
      </p>

      <h2>Când ruta gratuită nu funcționează</h2>
      <p>
        Aici se împotmolesc majoritatea oamenilor, și de obicei descoperă asta după ce au pierdut
        o zi încercând. Sunt șase situații.
      </p>

      <h3>1. Ai nevoie de cazier pentru o firmă</h3>
      <p>
        Pentru persoane juridice nu există flux electronic complet. Cererea (formularul din Anexa
        nr. 35 la H.G. nr. 345/2010) se depune <strong>fizic</strong>, la o subunitate de poliție, de
        către reprezentantul legal sau de o persoană împuternicită, cu actul de identitate în
        original și cu documentul de înregistrare al firmei. Serviciul e gratuit, dar online nu se
        poate. Aici intervine{' '}
        <Link href={serviceUrl('cazier-judiciar-persoana-juridica')}>
          varianta prin împuternicit
        </Link>
        : depunem noi cererea, tu nu te miști de la birou.
      </p>

      <h3>2. Nu ai cetățenie română</h3>
      <p>
        Poliția Română spune explicit că certificatul se poate obține online de persoane fizice{' '}
        <em>de cetățenie română</em>. Un cetățean străin cu rezidență în România, oricât de în regulă
        ar fi cu actele, nu poate parcurge fluxul online. Rămâne depunerea fizică sau prin
        împuternicit.
      </p>

      <h3>3. Ești plecat din țară și nu ai card bancar românesc</h3>
      <p>
        Combinația asta blochează ambele rute. Pentru ghiseul.ro îți trebuie card emis de o bancă din
        România, înrolat în 3D Secure — un card spaniol, italian sau german nu merge. Pentru HUB MAI
        îți trebuie o deplasare la poliție, în România. Dacă ești în Torino și ai nevoie de cazier
        săptămâna asta, ruta gratuită nu există pentru tine.
      </p>

      <h3>4. Ai nevoie de exemplar pe hârtie, cu valoare legală</h3>
      <p>
        Detaliul ăsta surprinde pe toată lumea. Certificatul electronic este asimilat înscrisurilor
        autentice, dar <strong>versiunea printată acasă nu are valoare legală</strong>. Deci dacă
        angajatorul, instanța sau o instituție îți cere exemplar fizic, faptul că ai PDF-ul nu te
        ajută. La fel și când documentul pleacă în străinătate și are nevoie de apostilă sau de
        traducere legalizată: acelea se aplică pe hârtie, nu pe fișier.
      </p>

      <h3>5. Certificatul e pentru un minor sau pentru altcineva</h3>
      <p>
        Contul validat e al tău și emite certificatul tău. Pentru copil, pentru un părinte în vârstă
        sau pentru oricine altcineva, e nevoie de reprezentant legal ori de împuternicire, iar
        traseul redevine unul cu depunere.
      </p>

      <h3>6. Ai înscrieri în cazier</h3>
      <p>
        Eliberarea instantanee funcționează când nu e nimic de verificat. Când există înscrieri sau
        potriviri care cer verificare în evidențe, cererea nu mai iese pe loc, indiferent de
        platformă. Nu e o eroare a sistemului, așa e construit fluxul.
      </p>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Te-ai regăsit în vreuna dintre cele șase?
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Atunci nu mai pierde timpul cu platformele. Depunem noi cererea prin împuternicit, iar tu
          primești certificatul pe email și, dacă ai nevoie, exemplarul fizic prin curier — inclusiv
          în străinătate, cu apostilă și traducere, dacă situația o cere.
        </p>
        <Link
          href={serviceUrl('cazier-judiciar')}
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Vezi cum funcționează serviciul nostru →
        </Link>
      </div>

      <h2>Gratuit la stat sau prin intermediar: cum alegi onest</h2>
      <p>
        Dacă ești persoană fizică, cetățean român, ai cont validat și îți trebuie PDF-ul pentru un
        angajator din România, folosește ruta gratuită. E documentul tău, e dreptul tău, iar noi nu
        avem ce să adăugăm acolo. Nu are rost să plătești pentru ceva ce durează cinci minute.
      </p>
      <p>
        Un serviciu ca al nostru are sens exact în situațiile în care statul nu ți-a deschis o ușă
        online: firmă, cetățean străin, plecat din țară fără card românesc, nevoie de hârtie cu
        apostilă, cerere pentru altcineva. Atunci alternativa reală nu e „gratuit versus plătit”, ci
        „împuternicit versus drum în țară”.
      </p>

      <h2>Ce ne întreabă oamenii cel mai des</h2>
      <p>
        <strong>„Am plătit undeva 10 lei taxă, de ce se spune că e gratuit?”</strong> Taxa de timbru
        pentru cazier a fost eliminată. Dacă ai plătit ceva, ori era o taxă pentru alt document, ori
        un serviciu de intermediere. Detaliile complete sunt în articolul despre{' '}
        <Link href="/taxa-cazier-judiciar/">taxa de cazier judiciar</Link>.
      </p>
      <p>
        <strong>„Cazierul auto e tot gratuit?”</strong> Sunt documente diferite, emise de instituții
        diferite. Cazierul judiciar vine de la Poliția Română, iar istoricul de sancțiuni rutiere de
        la DRPCIV — vezi{' '}
        <Link href="/informatii-cazier-auto-online/">explicația pe cazierul auto</Link>.
      </p>
      <p>
        <strong>„Certificatul de integritate comportamentală e același lucru?”</strong> Nu, și se
        confundă des. Comparația e{' '}
        <Link href="/cazier-judiciar-vs-certificat-integritate-comportamentala/">aici</Link>.
      </p>

      <h2>Surse</h2>
      <ul>
        <li>
          Direcția Generală de Poliție a Municipiului București — obținerea certificatului de cazier
          judiciar în sistem electronic (condiții de identificare, valoarea juridică a certificatului
          electronic).
        </li>
        <li>
          HUB servicii MAI — fișa serviciului pentru persoane juridice (depunere fizică, Anexa nr. 35
          la H.G. nr. 345/2010, termen maxim 3 zile lucrătoare, valabilitate 6 luni).
        </li>
        <li>Legea nr. 290/2004 privind cazierul judiciar, republicată.</li>
      </ul>
    </ArticleLayout>
  );
}
