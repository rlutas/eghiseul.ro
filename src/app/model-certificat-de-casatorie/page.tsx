import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'model-certificat-de-casatorie';
const TITLE = 'Model Certificat de Căsătorie: Cum Arată și Ce Conține';
const DESCRIPTION =
  'Cum arată modelul actual al certificatului de căsătorie, ce date conține și de ce nu există ' +
  'un „model PDF" oficial de descărcat. Plus cum obții un exemplar real (duplicat) prin eGhișeul.ro.';
const DATE_PUBLISHED = '2026-06-20';
const DATE_MODIFIED = '2026-06-20';

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
      publishedLabel="20 iunie 2026"
      updatedLabel="20 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-casatorie',
          label: 'Certificat de Căsătorie Online',
          desc: 'Obține un exemplar oficial (duplicat) al certificatului de căsătorie, online.',
        },
      ]}
      faqs={[
        {
          q: 'Există un model PDF de certificat de căsătorie de descărcat?',
          a: 'Nu. Certificatul de căsătorie este un document oficial, securizat, tipărit pe formular tipizat de Starea Civilă — nu poate fi descărcat ca PDF sau completat singur. Online găsești doar imagini ale modelului, cu rol informativ. Un exemplar valabil se obține doar de la Starea Civilă.',
        },
        {
          q: 'Ce date conține certificatul de căsătorie?',
          a: 'Numele soților înainte și după căsătorie, data și locul încheierii căsătoriei, numărul actului de căsătorie, autoritatea emitentă și, pe verso, eventuale mențiuni ulterioare (de exemplu divorț).',
        },
        {
          q: 'Cum obțin un exemplar oficial dacă nu am certificatul?',
          a: 'Soliciți un duplicat la Serviciul de Stare Civilă din localitatea unde s-a încheiat căsătoria. Prin eGhișeul.ro depunem cererea în numele tău, prin împuternicire, și primești documentul prin curier.',
        },
      ]}
    >
      <p>
        Mulți caută un <strong>model de certificat de căsătorie</strong> sau un{' '}
        <strong>„certificat de căsătorie PDF”</strong> — fie ca să vadă cum arată documentul, fie
        crezând că îl pot descărca și completa. În acest ghid afli cum arată modelul actual, ce date
        conține și de ce un certificat valabil se obține doar de la Starea Civilă.
      </p>

      <h2>Cum arată modelul actual al certificatului de căsătorie</h2>
      <p>
        Certificatul de căsătorie este tipărit pe un <strong>formular tipizat, securizat</strong>,
        emis de Serviciul de Stare Civilă. Modelul actual conține elemente de siguranță (stemă,
        serie, semnături și ștampilă), tocmai pentru că este un act oficial cu valoare juridică.
        Imaginile de tip „model” pe care le găsești online au doar rol <strong>informativ</strong> —
        nu pot fi folosite ca document.
      </p>

      <h2>Ce date conține certificatul de căsătorie</h2>
      <ul>
        <li><strong>numele soților</strong> înainte și după căsătorie;</li>
        <li><strong>data și locul</strong> încheierii căsătoriei;</li>
        <li><strong>numărul actului de căsătorie</strong> și autoritatea emitentă;</li>
        <li>pe verso, <strong>mențiuni ulterioare</strong> (de exemplu, mențiunea de divorț).</li>
      </ul>

      <h2>De ce nu există un „model PDF” oficial de descărcat</h2>
      <p>
        Spre deosebire de o cerere (care poate avea un formular-tip), <strong>certificatul în sine nu
        se descarcă și nu se completează</strong> de către cetățean. Este emis exclusiv de Starea
        Civilă, pe baza actului de căsătorie din registre. Așadar, dacă ai nevoie de document — nu de
        o simplă imagine — trebuie să soliciți un exemplar oficial.
      </p>

      <h2>Certificat de căsătorie sau extras multilingv?</h2>
      <p>
        Dacă ai nevoie de document pentru o autoritate din străinătate, există și{' '}
        <strong>extrasul multilingv</strong> de pe actul de căsătorie — un formular standardizat,
        recunoscut în UE <strong>fără traducere</strong>. Pentru folosirea în România este suficient
        certificatul de căsătorie obișnuit (sau duplicatul lui); pentru dosare în alt stat UE, extrasul
        multilingv îți poate scuti o traducere. Alege în funcție de unde depui documentul.
      </p>

      <h2>Cum obții un exemplar oficial (duplicat)</h2>
      <p>
        Dacă ai pierdut certificatul, l-ai deteriorat sau îți trebuie un exemplar suplimentar,
        soliciți un <strong>duplicat</strong>. Prin{' '}
        <Link href={casatorieUrl}>certificat de căsătorie online</Link> completezi datele, semnezi
        împuternicirea în aplicație și primești documentul original prin curier, fără drum la ghișeu.
        Dacă te-ai căsătorit în străinătate, vezi întâi ghidul de{' '}
        <Link href="/transcriere-certificat-de-casatorie/">transcriere a certificatului de căsătorie</Link>.
      </p>
    </ArticleLayout>
  );
}
