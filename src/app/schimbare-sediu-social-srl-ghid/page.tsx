import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'schimbare-sediu-social-srl-ghid';
const TITLE = 'Schimbarea sediului social la SRL: acte, pași la ONRC și ce urmează după (2026)';
const DESCRIPTION =
  'Ghid schimbare sediu social în 2026: actele necesare, pașii la Registrul Comerțului, diferența ' +
  'dintre mutarea în același județ și în alt județ, plus ce instituții trebuie anunțate după.';
const DATE_PUBLISHED = '2026-07-31';
const DATE_MODIFIED = '2026-07-31';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Firme & ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="iulie 2026"
      updatedLabel="31 iulie 2026"
      relatedServices={[
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator Online',
          desc: 'După schimbarea sediului, banca și partenerii cer constatator actualizat.',
        },
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Cerut în unele dosare de modificare și la relația cu instituțiile.',
        },
      ]}
      faqs={[
        {
          q: 'Ce acte trebuie pentru schimbarea sediului social?',
          a: 'Hotărârea adunării generale (sau decizia asociatului unic), dovada dreptului de folosință asupra noului spațiu (contract de închiriere, comodat sau act de proprietate), actul constitutiv actualizat și cererea de înregistrare a mențiunii la ONRC. Dacă spațiul e într-un bloc de locuințe, poate fi nevoie și de acordul asociației de proprietari și al vecinilor direcți.',
        },
        {
          q: 'Cât durează schimbarea sediului la ONRC?',
          a: 'De regulă circa 3 zile lucrătoare de la depunerea dosarului complet, indiferent dacă depui la ghișeu sau online, prin portalul ONRC. La mutarea în alt județ, dosarul trece pe la registrul din județul nou, iar firma primește număr nou de ordine în registrul comerțului.',
        },
        {
          q: 'Trebuie să anunț ANAF după schimbarea sediului?',
          a: 'Informația ajunge la ANAF de la ONRC, dar firma depune și declarația de mențiuni fiscale pentru actualizarea vectorului fiscal, iar certificatul de înregistrare fiscală se preschimbă. Contabilul firmei face de regulă acest pas.',
        },
        {
          q: 'Ce se întâmplă dacă sediul social a expirat și nu îl prelungesc?',
          a: 'Un sediu expirat blochează orice altă operațiune la registru și poate duce, în timp, la declararea firmei inactive fiscal. Prelungirea contractului de sediu se înregistrează la ONRC ca orice mențiune, iar amânarea ei se plătește scump în timp pierdut.',
        },
      ]}
    >
      <p>
        Mutarea sediului social pare o formalitate până în ziua în care chiar trebuie făcută: contractul
        de comodat a expirat, firma s-a mutat în alt oraș sau contabilul anunță că nu mai poate depune
        nimic pentru că sediul „a picat”. Procedura la Registrul Comerțului este previzibilă, dar are o
        ordine precisă a actelor și câteva capcane care întorc dosarele din drum.
      </p>

      <h2>Actele necesare, în ordinea în care le pregătești</h2>
      <ul>
        <li>
          <strong>Dovada noului spațiu:</strong> contract de închiriere, comodat sau act de proprietate.
          Pentru un apartament în bloc se adaugă, după caz, acordul asociației de proprietari și al
          vecinilor cu pereți comuni — pasul care ia cel mai mult timp, deci cu el se începe.
        </li>
        <li>
          <strong>Hotărârea AGA sau decizia asociatului unic</strong> privind mutarea sediului, cu
          adresa nouă completă.
        </li>
        <li>
          <strong>Actul constitutiv actualizat</strong> cu noua adresă.
        </li>
        <li>
          <strong>Cererea de înregistrare a mențiunii</strong> — la ghișeul oficiului din județ sau
          online, în portalul ONRC, cu semnătură electronică.
        </li>
      </ul>
      <p>
        Din 2017, taxele de înregistrare la registrul comerțului au fost eliminate; acolo unde legea
        cere publicarea hotărârii în Monitorul Oficial, se achită doar tariful de publicare.
      </p>

      <h2>Același județ sau alt județ: diferența care schimbă dosarul</h2>
      <p>
        Mutarea în interiorul aceluiași județ este mențiunea simplă descrisă mai sus. Mutarea în
        <strong> alt județ</strong> înseamnă transferul firmei la oficiul registrului din județul nou:
        firma primește un număr nou de ordine (J-ul se schimbă), iar verificările durează de regulă
        puțin mai mult. Partenerii care au firma în evidențe pe vechiul număr — bănci, furnizori cu
        contracte-cadru, platforme de licitații — vor cere documentele actualizate.
      </p>

      <h2>Ce urmează DUPĂ înregistrarea la ONRC</h2>
      <p>
        Aici se opresc majoritatea ghidurilor, deși abia aici începe partea care consumă timp:
      </p>
      <ul>
        <li>
          <strong>ANAF:</strong> declarația de mențiuni pentru vectorul fiscal și preschimbarea
          certificatului de înregistrare fiscală — de regulă prin contabil.
        </li>
        <li>
          <strong>Banca:</strong> aproape toate băncile cer un{' '}
          <Link href="/servicii/certificat-constatator-online/">certificat constatator</Link> emis după
          modificare, ca dovadă că noua adresă e înregistrată. Îl poți obține online, în câteva minute,
          fără drum la ghișeu.
        </li>
        <li>
          <strong>Contracte și documente:</strong> facturile, contractele noi și site-ul trebuie să
          poarte adresa nouă; contractele în derulare se actualizează prin act adițional doar dacă
          partea cealaltă o cere.
        </li>
        <li>
          <strong>Autorizații legate de punctul de lucru:</strong> dacă sediul era și punct de lucru
          autorizat (comerț, alimentație publică), autorizațiile de funcționare se refac pe noua adresă.
        </li>
      </ul>

      <h2>Capcanele care întorc dosarul</h2>
      <ul>
        <li>
          <strong>Contract de sediu expirat la data depunerii.</strong> Registrul verifică
          valabilitatea; un comodat expirat cu o zi blochează mențiunea.
        </li>
        <li>
          <strong>Adresa incompletă în hotărâre.</strong> Bloc, scară, etaj, apartament — lipsa unui
          element față de actul de spațiu naște observații și amânări.
        </li>
        <li>
          <strong>Neconcordanțe între documente.</strong> Datele din hotărârea AGA, actul constitutiv și
          contractul de spațiu trebuie să coincidă literă cu literă.
        </li>
        <li>
          <strong>Firma are alte probleme în registru.</strong> Mandat de administrator expirat sau
          capital nevărsat pot bloca orice mențiune nouă. O verificare prealabilă în{' '}
          <Link href="/cele-4-tipuri-de-certificat-constatator-online/">certificatul constatator</Link>{' '}
          arată exact ce e înscris la zi despre firmă, înainte să pornești procedura.
        </li>
      </ul>

      <h2>Situațiile rudă: prelungirea și suspendarea</h2>
      <p>
        Dacă nu te muți, ci doar expiră contractul pe aceeași adresă, procedura e mai simplă:
        prelungirea sediului social, cu noul contract și cerere de mențiune. Iar dacă firma nu mai are
        activitate și sediul devine o povară, alternativa poate fi{' '}
        <Link href="/suspendare-activitate-firma-ghid/">suspendarea temporară a activității</Link> sau,
        definitiv, <Link href="/radiere-firma-srl-ghid/">radierea firmei</Link> — fiecare cu procedura
        ei separată.
      </p>
    </ArticleLayout>
  );
}
