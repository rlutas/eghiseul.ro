import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'taxa-cazier-judiciar';
const TITLE = 'Taxa pentru cazier judiciar: cât e de fapt și ce plătești online';
const DESCRIPTION =
  'La ghișeu, cazierul judiciar este gratuit din 2017 — taxele au fost eliminate. Ce plătești când îl obții ' +
  'online, ce acte îți trebuie și în ce situații ți se cere.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-08-24';

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
      updatedLabel="24 august 2026"
      relatedServices={[
        {
          slug: 'cazier-judiciar',
          label: 'Cazier Judiciar Online',
          desc: 'Obține cazierul judiciar online, fără drum la ghișeu.',
        },
      ]}
      faqs={[
        {
          q: 'Cât costă cazierul judiciar la ghișeu?',
          a: 'Nimic. Taxa de eliberare (fostă 10 lei) și timbrul fiscal au fost eliminate la 1 februarie 2017. La ghișeul de cazier al poliției, certificatul se eliberează gratuit, în multe cazuri chiar pe loc.',
        },
        {
          q: 'Atunci ce plătesc dacă îl cer online?',
          a: 'Serviciul, nu taxa: un avocat împuternicit de tine depune cererea, ridică certificatul și ți-l trimite semnat electronic. La noi costă 198 de lei pentru persoane fizice, cu factură.',
        },
        {
          q: 'Pot obține cazier judiciar pentru altcineva?',
          a: 'Da, dar numai cu procură notarială sau prin avocat, în baza împuternicirii avocațiale. Fluxul online funcționează exact pe acest mecanism: semnezi împuternicirea electronic, iar avocatul depune în numele tău.',
        },
        {
          q: 'Pot plăti cu cardul?',
          a: 'Online, da — Visa, Mastercard, Apple Pay sau Google Pay. La ghișeu nu ai ce plăti, documentul e gratuit.',
        },
        {
          q: 'Cât e valabil cazierul judiciar?',
          a: '6 luni de la eliberare, conform Legii 290/2004. Atenție: unele instituții și angajatori cer un certificat mai proaspăt, de exemplu emis în ultimele 30 de zile — verifică cerința exactă înainte să-l comanzi.',
        },
      ]}
    >
      <p>
        Să lămurim din start confuzia care aduce cei mai mulți oameni pe pagina asta: <strong>la ghișeu, cazierul
        judiciar nu mai costă nimic din 1 februarie 2017</strong>. Atunci s-au eliminat și taxa de eliberare de 10
        lei, și timbrul fiscal de 2 lei. Mergi la orice ghișeu de cazier al Poliției Române cu buletinul și primești
        certificatul gratuit, de regulă pe loc.
      </p>
      <p>
        Ce se plătește astăzi nu e o taxă către stat. E serviciul cuiva care face drumul în locul tău, dacă alegi
        varianta online.
      </p>

      <h2>De unde vine confuzia cu „taxa”</h2>
      <p>
        Ani de zile, cererea de cazier a mers împreună cu chitanța: 10 lei taxă de eliberare, plătită la trezorerie
        sau CEC, plus timbru fiscal. Formularul vechi încă circulă pe internet cu rubrica de chitanță, iar multe
        ghiduri nu au fost actualizate. Legea s-a schimbat însă în 2017, când taxele extrajudiciare de timbru pentru
        acte de acest tip au fost eliminate.
      </p>
      <p>
        Deci dacă cineva îți cere azi „dovada plății taxei de cazier” pentru ghișeu, lucrează după o procedură
        veche. Singura excepție reală: legalizările sau traducerile ulterioare ale certificatului, care se plătesc
        separat, la notar sau traducător.
      </p>

      <h2>Ce plătești când îl obții online</h2>
      <p>
        Statul nu eliberează cazierul printr-un click pentru oricine: îl primești la ghișeu, personal, sau prin
        împuternicit. Serviciile online, al nostru inclusiv, funcționează pe a doua cale: semnezi electronic o
        împuternicire avocațială, avocatul depune cererea, ridică certificatul și ți-l trimite pe email, semnat
        electronic.
      </p>
      <p>
        La noi, <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar online</Link> costă 198 de lei pentru
        persoane fizice. În preț intră împuternicirea, depunerea și ridicarea de către avocat, verificarea datelor
        din actul tău de identitate și livrarea pe email; primești factură fiscală. Există și opțiuni contra cost:
        procesare urgentă, traducere autorizată, apostilă, livrare prin curier.
      </p>
      <p>
        Merită sau nu depinde de situația ta. Dacă stai la două stații de un ghișeu și ai o dimineață liberă, du-te
        personal — e gratuit. Serviciul online are sens când ești în altă țară, în alt oraș, sau pur și simplu nu
        poți ajunge în programul ghișeului.
      </p>

      <h2>Ce acte îți trebuie</h2>
      <p>
        Pentru persoane fizice: actul de identitate valabil, buletin sau pașaport. Atât, la ghișeu.
        Online mai semnezi împuternicirea (electronic, în formular) și încarci o poză a actului.
      </p>
      <p>
        Câteva situații particulare:
      </p>
      <ul>
        <li>
          Minorii nu își pot cere singuri cazierul: cererea o depune părintele sau reprezentantul legal, cu
          certificatul de naștere al copilului.
        </li>
        <li>
          Pentru altă persoană poți cere doar cu procură notarială sau prin avocat.
        </li>
        <li>
          Românii din diaspora pot folosi varianta online ca să nu mai depindă de programările la consulat.
        </li>
        <li>
          Firmele primesc certificat de cazier pe persoana juridică, în baza CUI-ului și a împuternicirii semnate de
          reprezentantul legal. Îl cer mai ales la licitații și autorizări.
        </li>
      </ul>

      <h2>Unde ți se cere cazierul</h2>
      <p>
        Cel mai des la angajare, mai ales în pază, transport, educație, sănătate și instituții publice. Apoi la
        concursuri pentru posturi la stat, la dosarele de cetățenie sau rezidență, la autorizarea pentru arme, la
        adopție sau tutelă și la unele vize. Firmele îl depun la licitații publice și la autorizările din domeniile
        reglementate.
      </p>
      <p>
        Un detaliu care scutește drumuri duble: certificatul e valabil 6 luni, dar instituția care ți-l cere poate
        pretinde unul mai recent. Întreabă întâi ce vechime maximă acceptă, apoi comandă-l.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Taxa de cazier judiciar nu mai există din 2017; la ghișeu, documentul e gratuit. Online plătești serviciul
        de obținere prin avocat, util când nu poți ajunge personal. Dacă asta e situația ta, poți{' '}
        <Link href="/servicii/cazier-judiciar-online/">comanda cazierul judiciar aici</Link>; dacă nu, ghișeul
        poliției rămâne varianta corectă și fără niciun cost.
      </p>
    </ArticleLayout>
  );
}
