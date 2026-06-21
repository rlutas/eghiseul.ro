import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'schimbare-certificat-de-nastere-vechi';
const TITLE = 'Schimbare Certificat de Naștere Vechi cu Unul Nou: Ghid Complet';
const DESCRIPTION =
  "Schimbă certificatul de naștere vechi sau deteriorat cu modelul actual: ce acte îți trebuie, cât durează și cum obții duplicatul online.";
const DATE_PUBLISHED = '2026-06-19';
const DATE_MODIFIED = '2026-06-19';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-nastere.png',
});

export default function Page() {
  const nastereUrl = serviceUrl('certificat-nastere');
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image="/og/services/certificat-nastere.png"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="19 iunie 2026"
      updatedLabel="19 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-nastere',
          label: 'Certificat de Naștere Online',
          desc: 'Schimbă certificatul vechi cu un duplicat nou, online, fără drum la Starea Civilă.',
        },
      ]}
      faqs={[
        {
          q: 'Mai este valabil un certificat de naștere vechi?',
          a: 'Da. Certificatul de naștere nu expiră, indiferent de model. Totuși, unele instituții din țară sau autorități din străinătate preferă modelul actual, lizibil și tipărit, motiv pentru care poți solicita un duplicat nou.',
        },
        {
          q: 'Cum schimb un certificat de naștere vechi cu unul nou?',
          a: 'Soliciți un duplicat la Serviciul de Stare Civilă din localitatea unde a fost înregistrată nașterea. Duplicatul este emis pe modelul actual, în baza actului de naștere existent în registre. Prin eGhișeul.ro depunem cererea în numele tău și primești noul certificat prin curier.',
        },
        {
          q: 'Trebuie să predau certificatul vechi?',
          a: 'În general, la eliberarea duplicatului poți preda exemplarul vechi sau deteriorat, dar procedura diferă de la o primărie la alta. Noi îți comunicăm exact cerințele Stării Civile competente.',
        },
        {
          q: 'Pot schimba certificatul vechi dacă locuiesc în altă localitate sau în străinătate?',
          a: 'Da. Cererea se depune la primăria din localitatea de naștere, dar nu trebuie să te deplasezi. Depunem cererea prin împuternicire și îți trimitem documentul prin curier oriunde te afli.',
        },
      ]}
    >
      <p>
        Multe persoane au încă un <strong>certificat de naștere vechi</strong> — model mai vechi,
        completat de mână, îngălbenit sau deteriorat de timp. Vestea bună este că acesta{' '}
        <strong>nu expiră și rămâne valabil</strong>. Totuși, când documentul a devenit greu de citit
        sau o instituție îți cere modelul actual, soluția este simplă: soliciți un{' '}
        <strong>duplicat nou</strong>, tipărit pe modelul în vigoare. În acest ghid afli{' '}
        <strong>când și cum schimbi certificatul de naștere vechi cu unul nou</strong>.
      </p>

      <h2>Când este nevoie să schimbi certificatul de naștere vechi</h2>
      <p>Cele mai frecvente situații în care merită să ceri un duplicat pe modelul actual:</p>
      <ul>
        <li>certificatul este <strong>deteriorat, rupt, pătat sau ilizibil</strong>;</li>
        <li>este un <strong>model vechi, completat de mână</strong>, greu de acceptat de unele instituții;</li>
        <li>o autoritate din <strong>străinătate</strong> îți cere un exemplar recent, tipărit (eventual împreună cu <Link href="/servicii/extras-multilingv-certificat-nastere/">extrasul multilingv</Link>);</li>
        <li>ai nevoie de un exemplar curat pentru un <strong>dosar oficial</strong> (notariat, bancă, pensii, succesiune).</li>
      </ul>

      <h2>Ce înseamnă, de fapt, „schimbarea” certificatului</h2>
      <p>
        Nu există o procedură separată de „preschimbare” — pur și simplu se emite un{' '}
        <strong>duplicat</strong>, adică un certificat de naștere nou și original, pe modelul actual,
        în baza actului de naștere care există deja în registrele Stării Civile. Valoarea juridică
        este identică; diferă doar forma documentului. Dacă ai și{' '}
        <Link href="/certificat-de-nastere-pierdut/">pierdut certificatul</Link>, demersul este
        același — un duplicat.
      </p>

      <h2>Acte necesare pentru schimbarea certificatului de naștere vechi</h2>
      <ul>
        <li><strong>cerere tip</strong> pentru eliberarea duplicatului (o completăm noi pentru serviciul online);</li>
        <li><strong>act de identitate valabil</strong> al titularului sau al solicitantului;</li>
        <li><strong>certificatul vechi</strong>, dacă mai există (uneori se predă la eliberare);</li>
        <li><strong>împuternicire</strong>, când cererea este depusă de altcineva în numele tău;</li>
        <li>dovada taxei de stare civilă, acolo unde se percepe (de regulă mică sau zero).</li>
      </ul>
      <p>
        Cerințele pot varia ușor de la o primărie la alta. Prin eGhișeul.ro pregătim documentația
        corectă pentru Starea Civilă competentă, ca să nu fie nevoie să afli singur lista fiecărui
        ghișeu.
      </p>

      <h2>Cât durează și cât costă</h2>
      <p>
        La ghișeu, duplicatul se eliberează de regulă în aceeași zi sau în câteva zile lucrătoare.
        <strong> Taxa de stare civilă</strong> este mică sau inexistentă în multe primării. Prin
        eGhișeul.ro, costul afișat acoperă întocmirea și depunerea cererii prin împuternicire,
        achitarea taxelor și livrarea prin curier — vezi prețul curent pe pagina de{' '}
        <Link href={nastereUrl}>certificat de naștere online</Link>.
      </p>

      <h2>Cum schimbi certificatul vechi online, prin eGhișeul.ro</h2>
      <ul>
        <li>completezi datele titularului în formularul online (2–3 minute);</li>
        <li>semnezi împuternicirea în aplicație și achiți cu cardul;</li>
        <li>depunem cererea la Starea Civilă din localitatea de naștere, în numele tău;</li>
        <li>primești duplicatul pe modelul nou, prin curier, cu tracking pe email.</li>
      </ul>
      <p>
        Este aceeași soluție validă și pentru românii din <strong>diaspora</strong>, care nu trebuie
        să se întoarcă în țară doar pentru un document. Detalii și cost pe pagina de{' '}
        <Link href={nastereUrl}>eliberare certificat de naștere online</Link>.
      </p>

      <h2>Certificatele de naștere vechi, completate de mână</h2>
      <p>
        Certificatele emise în urmă cu zeci de ani erau adesea <strong>completate de mână</strong>, pe
        un formular mai vechi, iar cu timpul cerneala se decolorează sau hârtia se deteriorează. Aceste
        documente rămân valabile, însă pot fi greu de citit sau de acceptat la dosare oficiale ori în
        străinătate. Soluția este aceeași: soliciți un <strong>duplicat tipărit pe modelul actual</strong>,
        cu toate datele preluate din registrele Stării Civile. Dacă între timp documentul s-a și pierdut,
        vezi pașii pentru un{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificat de naștere pierdut</Link>.
      </p>

      <h2>Concluzie</h2>
      <p>
        Un certificat de naștere vechi rămâne valabil, dar îl poți înlocui oricând cu un{' '}
        <strong>duplicat pe modelul actual</strong>, cu acte puține și costuri mici. Cel mai comod
        este <Link href={nastereUrl}>online, prin eGhișeul.ro</Link>, fără drum la ghișeu și fără
        cozi.
      </p>
    </ArticleLayout>
  );
}
