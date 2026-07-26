import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-de-nastere-din-strainatate';
const TITLE =
  'Certificat de naștere când ești plecat din țară: duplicat, extras multilingv sau apostilă — ce îți trebuie de fapt';
const META_TITLE = 'Certificat de naștere din străinătate — cum îl obții fără să vii în țară';
const DESCRIPTION =
  'Ai nevoie de certificatul de naștere, dar locuiești în străinătate. Cele trei rute reale (consulat, împuternicit, ' +
  'serviciu de intermediere), diferența dintre duplicat și extras multilingv și când chiar ai nevoie de apostilă.';
const DATE_PUBLISHED = '2026-07-26';
const DATE_MODIFIED = '2026-07-26';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

// Statele parte la Convenția nr. 16 de la Viena (1976), unde extrasul multilingv
// circulă fără traducere și fără apostilă.
const STATE_CONVENTIA_16 = [
  'Austria', 'Belgia', 'Bosnia și Herțegovina', 'Bulgaria', 'Croația', 'Elveția', 'Estonia',
  'Franța', 'Germania', 'Italia', 'Lituania', 'Luxemburg', 'Macedonia de Nord', 'Moldova',
  'Muntenegru', 'Olanda', 'Polonia', 'Portugalia', 'România', 'Serbia', 'Slovenia', 'Spania',
  'Turcia',
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="26 iulie 2026"
      updatedLabel="26 iulie 2026"
      imageAlt="Plic de corespondență internațională, formular cu rubrici numerotate și pașaport pe o masă, lângă fereastră — obținerea certificatului de naștere din străinătate"
      relatedServices={[
        {
          slug: 'extras-multilingv-certificat-nastere',
          label: 'Extras multilingv de naștere',
          desc: 'Valabil direct în 22 de state europene, fără traducere și fără apostilă.',
        },
        {
          slug: 'certificat-nastere',
          label: 'Duplicat certificat de naștere',
          desc: 'Îl scoatem de la Starea Civilă și îl livrăm oriunde în lume.',
        },
        {
          href: '/acte-necesare-certificat-de-nastere/',
          label: 'Ce acte trebuie pentru duplicat',
          desc: 'Lista completă, pe fiecare situație.',
        },
      ]}
      faqs={[
        {
          q: 'Pot obține certificatul de naștere din străinătate fără să vin în România?',
          a: 'Da. Ai trei rute: prin misiunea diplomatică sau consulatul României din țara în care locuiești, printr-o persoană împuternicită cu procură specială care depune cererea în țară, sau printr-un serviciu de intermediere care se ocupă de tot și îți livrează documentul prin curier internațional.',
        },
        {
          q: 'Care e diferența dintre duplicatul certificatului și extrasul multilingv?',
          a: 'Duplicatul este certificatul românesc, în limba română — pentru autoritățile străine cere de regulă traducere legalizată și apostilă. Extrasul multilingv este eliberat pe formularul standardizat al Convenției nr. 16 de la Viena și e recunoscut direct în statele părți, fără traducere și fără apostilă. Dacă documentul rămâne în România, îți trebuie duplicatul; dacă pleacă la o autoritate dintr-un stat semnatar, extrasul multilingv îți scutește doi pași și câteva sute de lei.',
        },
        {
          q: 'În ce țări e valabil extrasul multilingv fără apostilă?',
          a: 'În statele părți la Convenția nr. 16: Austria, Belgia, Bosnia și Herțegovina, Bulgaria, Croația, Elveția, Estonia, Franța, Germania, Italia, Lituania, Luxemburg, Macedonia de Nord, Moldova, Muntenegru, Olanda, Polonia, Portugalia, Serbia, Slovenia, Spania și Turcia. România a aderat prin Legea nr. 65/2012, în vigoare din 24 august 2012.',
        },
        {
          q: 'Locuiesc în Marea Britanie, SUA sau Canada. Merge extrasul multilingv?',
          a: 'Nu, acele state nu sunt părți la Convenția nr. 16. Acolo ai nevoie de certificat cu apostilă (Convenția de la Haga, 1961) și, de regulă, de traducere autorizată. Practic: duplicat, apoi apostilă, apoi traducere — în ordinea asta.',
        },
        {
          q: 'Cum funcționează procura specială dacă nu sunt în țară?',
          a: 'O poți face la consulatul României din țara ta, caz în care e direct valabilă în România. Alternativ, la un notar local — dar atunci procura are nevoie de apostilă și de traducere legalizată în română, ceea ce adaugă timp și costuri. Consulatul e aproape întotdeauna varianta mai simplă.',
        },
        {
          q: 'Cât durează pe ruta consulară?',
          a: 'Consulatul preia cererea și o transmite autorității din România, iar documentul face drumul înapoi pe același traseu. De aceea ruta asta e cea mai lentă dintre cele trei, chiar dacă e cea mai ieftină. Când ai un termen de respectat, ia în calcul întârzierea, nu doar taxa.',
        },
        {
          q: 'Certificatul vechi, cu coperta veche, mai e valabil?',
          a: 'Da, certificatele emise anterior rămân valabile. Nu ai nevoie de duplicat doar pentru că modelul s-a schimbat — ai nevoie când documentul e pierdut, deteriorat, sau când îți trebuie într-o formă anume (multilingv, cu apostilă).',
        },
      ]}
    >
      <p>
        Ai nevoie de certificatul de naștere pentru un dosar depus în Spania, Germania sau Italia, iar
        actul e la primăria din localitatea unde te-ai născut, la 2.000 de kilometri distanță. Vestea
        bună: nu trebuie să vii în țară. Ai trei rute reale, iar alegerea corectă depinde mai puțin
        de buget și mai mult de <strong>țara în care depui dosarul</strong>.
      </p>

      <h2>Prima decizie: duplicat sau extras multilingv?</h2>
      <p>
        E întrebarea care decide dacă plătești două sute de lei sau șapte sute, și dacă documentul
        îți e acceptat sau întors.
      </p>
      <p>
        <strong>Duplicatul</strong> este certificatul românesc obișnuit, în limba română. Pentru o
        autoritate străină, el are nevoie aproape întotdeauna de apostilă și de traducere legalizată.
      </p>
      <p>
        <strong>Extrasul multilingv</strong> se eliberează pe formularul standardizat al Convenției
        nr. 16 de la Viena (1976), la care România a aderat prin Legea nr. 65/2012. Rubricile sunt
        numerotate identic în toate statele părți, așa că funcționarul din Sevilla înțelege documentul
        fără traducător. Iar articolul 8 alineatul 2 din Convenție scutește expres aceste extrase de
        apostilă.
      </p>
      <p>
        Deci: dosar depus într-un stat parte la Convenție → extras multilingv, fără traducere și fără
        apostilă. Dosar depus în România sau într-un stat din afara Convenției → duplicat, plus pașii
        de legalizare.
      </p>

      <div className="not-prose my-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <p className="mb-2 text-sm font-bold text-secondary-900">
          Statele unde extrasul multilingv circulă fără apostilă și fără traducere
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">
          {STATE_CONVENTIA_16.join(' · ')}
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          Convenția nr. 16 de la Viena, 8 septembrie 1976. România — Legea nr. 65/2012, în vigoare
          din 24 august 2012.
        </p>
      </div>

      <h2>Cele trei rute, comparate</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-100 text-left">
              <th className="border border-neutral-200 p-3 font-bold">Rută</th>
              <th className="border border-neutral-200 p-3 font-bold">Ce presupune</th>
              <th className="border border-neutral-200 p-3 font-bold">Punctul slab</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Consulat</td>
              <td className="border border-neutral-200 p-3">
                Depui cererea la misiunea diplomatică din țara ta; ea o transmite autorității din
                România
              </td>
              <td className="border border-neutral-200 p-3">
                Cea mai lentă — documentul face dus-întors pe canal diplomatic. Programările pot fi
                greu de prins.
              </td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-200 p-3 font-semibold">Împuternicit</td>
              <td className="border border-neutral-200 p-3">
                Dai procură specială cuiva din țară, care depune și ridică
              </td>
              <td className="border border-neutral-200 p-3">
                Îți trebuie cineva disponibil să meargă de două ori. Procura de la notar străin cere
                apostilă și traducere.
              </td>
            </tr>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Serviciu de intermediere</td>
              <td className="border border-neutral-200 p-3">
                Semnezi împuternicirea online, restul se ocupă altcineva; primești documentul prin
                curier
              </td>
              <td className="border border-neutral-200 p-3">
                Costă mai mult decât taxa de stat. Are sens când timpul sau distanța chiar contează.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Procura specială: unde o faci contează mai mult decât crezi</h2>
      <p>
        Dacă mergi pe ruta cu împuternicit, procura e piesa care rupe planul cel mai des. Făcută la
        consulatul României, e valabilă direct în țară și gata. Făcută la un notar din Spania sau
        Italia, are nevoie de apostilă și de traducere legalizată în română — două drumuri în plus și
        încă o săptămână sau două, exact când te grăbeai.
      </p>
      <p>
        Un al doilea detaliu ignorat: procura trebuie să fie <em>specială</em>, adică să spună explicit
        pentru ce document și pentru ce operațiune e dată. O procură generală de tipul „mă reprezintă
        în relația cu autoritățile” e refuzată la ghișeu de multe ori.
      </p>

      <h2>Când chiar ai nevoie de apostilă</h2>
      <p>
        Apostila (Convenția de la Haga, 1961) confirmă autenticitatea semnăturii și a ștampilei, ca
        documentul să fie recunoscut în alt stat. Îți trebuie în două situații:
      </p>
      <ul>
        <li>
          dosarul se depune într-un stat care <strong>nu</strong> e parte la Convenția nr. 16 — de
          exemplu Marea Britanie, Statele Unite, Canada;
        </li>
        <li>
          autoritatea îți cere expres certificatul românesc, nu extrasul multilingv (se întâmplă la
          proceduri de cetățenie și la unele instanțe).
        </li>
      </ul>
      <p>
        În ambele cazuri ordinea e: întâi duplicatul, apoi apostila, apoi traducerea autorizată.
        Inversată, o iei de la capăt — traducerea făcută înainte de apostilă nu acoperă apostila.
      </p>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Nu ești sigur ce formă îți trebuie?
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Spune-ne în ce țară depui dosarul și la ce instituție. Îți spunem dacă e nevoie de duplicat
          cu apostilă sau de extras multilingv, apoi ne ocupăm de tot — inclusiv de livrarea prin
          curier internațional, la adresa ta din străinătate.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={serviceUrl('extras-multilingv-certificat-nastere')}
            className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600"
          >
            Extras multilingv →
          </Link>
          <Link
            href={serviceUrl('certificat-nastere')}
            className="inline-flex items-center rounded-xl border-2 border-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 transition-all hover:bg-primary-100"
          >
            Duplicat certificat de naștere →
          </Link>
        </div>
      </div>

      <h2>Greșelile care costă cel mai mult timp</h2>
      <p>
        <strong>Traducere făcută înaintea apostilei.</strong> Apostila se aplică pe certificat, iar
        traducerea trebuie să o cuprindă. Făcută invers, o refaci.
      </p>
      <p>
        <strong>Extras multilingv cerut pentru un dosar din România.</strong> Instituțiile românești
        vor certificatul românesc. Extrasul multilingv e pentru drumul invers.
      </p>
      <p>
        <strong>Procură generală în loc de specială.</strong> Vezi mai sus — e cel mai frecvent motiv
        de întors de la ghișeu.
      </p>
      <p>
        <strong>Presupunerea că duplicatul se ia din orice primărie.</strong> Certificatul se
        eliberează de structura care are actul de naștere, adică de la locul nașterii. Dacă te-ai
        născut în Vaslui și locuiești în Cluj, la Cluj nu se rezolvă.
      </p>

      <h2>Dacă documentul e pentru dosarul de pensie</h2>
      <p>
        Situația apare des la românii care au lucrat în UE și își depun dosarul de pensie. Acolo se
        cer certificatul de naștere și, când numele diferă de cel din acte, cel de căsătorie. Dacă
        dosarul se depune la o casă de pensii dintr-un stat parte la Convenția nr. 16, extrasul
        multilingv e varianta care îți scutește traducerea. Vezi și{' '}
        <Link href="/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/">
          cum se iau în calcul anii lucrați în străinătate
        </Link>
        .
      </p>

      <h2>Surse</h2>
      <ul>
        <li>
          Convenția nr. 16 privind eliberarea extraselor multilingve ale actelor de stare civilă,
          Viena, 8 septembrie 1976 — art. 8 alin. 2 (scutirea de apostilă).
        </li>
        <li>Legea nr. 65/2012 privind aderarea României la Convenția nr. 16, în vigoare din 24 august 2012.</li>
        <li>Convenția de la Haga din 1961 privind apostila.</li>
      </ul>
    </ArticleLayout>
  );
}
