import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'transcriere-certificat-de-casatorie';
const TITLE = 'Transcriere Certificat de Căsătorie din Străinătate: Ghid Complet';
const DESCRIPTION =
  "Te-ai căsătorit în străinătate? Vezi ce este transcrierea certificatului de căsătorie, actele necesare (apostilă, traducere) și unde se depune.";
const DATE_PUBLISHED = '2026-06-19';
const DATE_MODIFIED = '2026-06-19';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-casatorie.png',
});

export default function Page() {
  const casatorieUrl = serviceUrl('certificat-casatorie');
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image="/og/services/certificat-casatorie.png"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="19 iunie 2026"
      updatedLabel="19 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-casatorie',
          label: 'Certificat de Căsătorie Online',
          desc: 'Obține duplicatul certificatului de căsătorie din România, online.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este transcrierea certificatului de căsătorie?',
          a: 'Este înregistrarea în registrele de stare civilă din România a unei căsătorii încheiate în străinătate. După transcriere, primești un certificat de căsătorie românesc, valabil pentru orice demers în țară.',
        },
        {
          q: 'Este obligatorie transcrierea?',
          a: 'Pentru cetățenii români, transcrierea actelor de stare civilă încheiate în străinătate este obligatorie și se face, de regulă, în termen de 6 luni de la întoarcerea în țară sau de la data evenimentului. Fără transcriere, certificatul străin nu produce efecte depline în România.',
        },
        {
          q: 'Ce acte îmi trebuie pentru transcriere?',
          a: 'În principal: certificatul de căsătorie străin în original, apostilat (pentru statele Convenției de la Haga) sau supralegalizat, însoțit de traducere legalizată în limba română, plus actele de identitate ale soților. Lista exactă depinde de țara emitentă și de primărie.',
        },
        {
          q: 'Unde se depune cererea de transcriere?',
          a: 'La Serviciul de Stare Civilă al primăriei de domiciliu sau de ultim domiciliu din România ori, în unele cazuri, prin misiunile diplomatice ale României. Cetățenii fără domiciliu în țară se adresează, de regulă, Primăriei Sectorului 1 București.',
        },
      ]}
    >
      <p>
        Dacă te-ai <strong>căsătorit în străinătate</strong>, certificatul emis acolo nu produce
        automat efecte în România. Pentru a-l putea folosi în țară — la notar, bancă, pensii,
        succesiune sau pentru actele copiilor — căsătoria trebuie <strong>transcrisă</strong> în
        registrele românești de stare civilă. În acest ghid afli ce presupune transcrierea, ce acte
        sunt necesare și unde se depune cererea.
      </p>

      <h2>Ce este transcrierea și de ce este obligatorie</h2>
      <p>
        Transcrierea înseamnă <strong>înregistrarea în România a căsătoriei încheiate în
        străinătate</strong>. În urma ei se emite un <strong>certificat de căsătorie românesc</strong>,
        recunoscut pentru orice demers oficial în țară. Pentru cetățenii români, transcrierea este{' '}
        <strong>obligatorie</strong> și se face, de regulă, în <strong>6 luni</strong> de la
        întoarcerea în țară sau de la data evenimentului.
      </p>

      <h2>Acte necesare pentru transcrierea certificatului de căsătorie</h2>
      <ul>
        <li>
          <strong>certificatul de căsătorie străin</strong> în original, <strong>apostilat</strong>{' '}
          (pentru statele membre ale Convenției de la Haga) sau <strong>supralegalizat</strong>;
        </li>
        <li><strong>traducere legalizată</strong> în limba română a certificatului și a apostilei;</li>
        <li><strong>actele de identitate</strong> ale ambilor soți (și certificatele de naștere, după caz);</li>
        <li><strong>cerere de transcriere</strong> și, dacă e cazul, o declarație privind numele purtat după căsătorie;</li>
        <li><strong>împuternicire</strong>, dacă cererea o depune o altă persoană în numele tău.</li>
      </ul>
      <p>
        Cerințele exacte diferă în funcție de <strong>țara emitentă</strong> și de primărie. De
        aceea, înainte de a începe, merită să verifici lista pentru cazul tău.
      </p>

      <h2>Unde se depune cererea de transcriere</h2>
      <p>
        Cererea se depune la <strong>Serviciul de Stare Civilă</strong> al primăriei de domiciliu sau
        de ultim domiciliu din România. Cetățenii români fără domiciliu în țară se adresează, de
        regulă, <strong>Primăriei Sectorului 1 din București</strong>. În anumite situații,
        transcrierea se poate solicita și prin <strong>misiunile diplomatice</strong> ale României.
      </p>

      <h2>Cât durează și cum te putem ajuta</h2>
      <p>
        Termenul de soluționare variază în funcție de primărie și de completitudinea dosarului.
        Pregătirea corectă a actelor (apostilă, traducere legalizată) este partea care face cea mai
        mare diferență. Dacă ai nevoie de îndrumare pentru dosarul de transcriere sau ulterior de un{' '}
        <Link href={casatorieUrl}>duplicat al certificatului de căsătorie</Link> emis în România,{' '}
        scrie-ne la <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> — îți spunem exact
        ce documente sunt acceptate în cazul tău.
      </p>

      <h2>Țări frecvente și apostila</h2>
      <p>
        Cele mai multe cereri de transcriere vin de la românii căsătoriți în{' '}
        <strong>Italia, Spania, Germania, Marea Britanie</strong> sau alte state din UE. Pentru aceste
        țări, certificatul de căsătorie trebuie de regulă <strong>apostilat</strong> (Convenția de la
        Haga) în statul emitent și apoi <strong>tradus legalizat</strong> în limba română. Documentele
        din state care nu sunt parte la Convenția de la Haga necesită <strong>supralegalizare</strong>,
        un proces mai lung. Verifică din timp cerințele, pentru că apostila se obține în țara unde s-a
        încheiat căsătoria.
      </p>

      <h2>Documente conexe</h2>
      <p>
        Dacă te-ai căsătorit în străinătate, e posibil să ai nevoie și de transcrierea altor acte sau
        de <Link href={serviceUrl('certificat-nastere')}>certificate de naștere</Link> pentru tine
        ori pentru copii. Le poți obține la fel de simplu, online.
      </p>
    </ArticleLayout>
  );
}
