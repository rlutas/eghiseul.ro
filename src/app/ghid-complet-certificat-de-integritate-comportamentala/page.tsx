import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'ghid-complet-certificat-de-integritate-comportamentala';
const TITLE = 'Certificat de Integritate Comportamentală: Ghid Complet';
const DESCRIPTION =
  'Ce este certificatul de integritate comportamentală, în ce diferă de cazierul judiciar, cine are nevoie de el ' +
  '(inclusiv pentru lucrul cu minori) și cum îl obții online. Ghid complet + perioada de valabilitate.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE} | eGhișeul`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
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
        {
          slug: 'certificat-integritate',
          label: 'Certificat de Integritate Comportamentală',
          desc: 'Obține certificatul online, fără drum la ghișeu.',
        },
        {
          slug: 'cazier-judiciar',
          label: 'Cazier Judiciar Online',
          desc: 'Document oficial IGPR, livrat rapid.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este certificatul de integritate comportamentală?',
          a: 'Este un document emis de autoritățile competente care atestă integritatea comportamentală a unei persoane fizice în diverse contexte, profesionale sau personale. Spre deosebire de cazierul judiciar, acoperă și aspecte de conduită care nu reprezintă neapărat infracțiuni, dar pot afecta siguranța în domenii sensibile.',
        },
        {
          q: 'Care este diferența față de cazierul judiciar?',
          a: 'Cele două documente sunt complementare. Cazierul judiciar se concentrează exclusiv pe infracțiunile penale, în timp ce certificatul de integritate comportamentală cuprinde și abateri suplimentare, care nu sunt neapărat infracțiuni, dar reprezintă riscuri în anumite medii profesionale.',
        },
        {
          q: 'Cine are nevoie de acest certificat?',
          a: 'Documentul este necesar în special pentru persoanele care lucrează în educație, domeniul medical, servicii de securitate, servicii sociale, îngrijirea copiilor și a persoanelor vârstnice, precum și în ONG-uri care lucrează cu categorii vulnerabile.',
        },
        {
          q: 'Cât timp este valabil certificatul de integritate comportamentală?',
          a: 'Certificatul de integritate comportamentală este valabil 6 luni de la data eliberării, asigurând astfel informații actuale, aspect deosebit de important în protecția copilului și în domeniul sănătății.',
        },
        {
          q: 'Cum obțin certificatul online?',
          a: 'Prin eGhișeul.ro completezi formularul de cerere, încarci actul de identitate și un selfie, alegi eventualele servicii suplimentare (cazier judiciar, traduceri, apostilă de la Haga) și plătești online. Certificatul îți este livrat pe WhatsApp și email.',
        },
      ]}
    >
      <p>
        <strong>Certificatul de integritate comportamentală</strong> a devenit un document tot mai important pentru
        persoanele care lucrează în domenii sensibile, mai ales acolo unde este implicat contactul direct cu minori
        sau cu alte categorii vulnerabile. În acest ghid îți explicăm ce este, cu ce diferă de cazierul judiciar,
        cine are nevoie de el și cum îl poți obține online.
      </p>

      <h2>Ce este certificatul de integritate comportamentală?</h2>
      <p>
        Certificatul de integritate comportamentală reprezintă un document emis de autoritățile competente care
        atestă <strong>integritatea comportamentală a unei persoane fizice</strong> în diverse contexte, fie
        profesionale, fie personale.
      </p>
      <p>
        Spre deosebire de cazierul judiciar, acest document acoperă preocupări mai largi legate de conduită,
        inclusiv comportamente neadecvate care nu constituie neapărat infracțiuni propriu-zise, dar care pot afecta
        siguranța la locul de muncă în sectoare sensibile.
      </p>

      <h2>Diferențele față de cazierul judiciar</h2>
      <p>
        Certificatul de integritate comportamentală și <Link href={serviceUrl('cazier-judiciar')}>cazierul
        judiciar</Link> sunt documente <strong>complementare</strong>. În timp ce cazierul judiciar se concentrează
        exclusiv pe infracțiunile penale, certificatul de integritate comportamentală cuprinde abateri suplimentare,
        care nu sunt neapărat infracțiuni, dar reprezintă riscuri în anumite medii profesionale.
      </p>

      <h2>Cine are nevoie de acest certificat?</h2>
      <p>Documentul este necesar pentru persoanele care lucrează în:</p>
      <ul>
        <li>Domeniul educației</li>
        <li>Domeniul medical</li>
        <li>Servicii de securitate</li>
        <li>Servicii sociale</li>
        <li>Roluri de îngrijire și educare a copiilor</li>
        <li>Posturi de îngrijire a persoanelor vârstnice</li>
        <li>Angajări în ONG-uri care lucrează cu categorii vulnerabile</li>
      </ul>

      <h2>Cum îl obții online</h2>
      <p>
        Procesul prin <Link href={serviceUrl('certificat-integritate')}>eGhișeul.ro</Link> presupune următorii pași:
      </p>
      <ol>
        <li>Accesarea platformei</li>
        <li>Completarea formularului de cerere</li>
        <li>Încărcarea actelor de identitate și a unui selfie</li>
        <li>Selectarea serviciilor opționale (cazier judiciar, traduceri, apostilă de la Haga)</li>
        <li>Efectuarea plății online</li>
        <li>Primirea certificatului pe WhatsApp și email</li>
      </ol>

      <h2>Perioada de valabilitate</h2>
      <p>
        Certificatul de integritate comportamentală este <strong>valabil 6 luni de la data eliberării</strong>,
        ceea ce asigură informații actuale — un aspect deosebit de important în protecția copilului și în domeniul
        sănătății.
      </p>

      <h2>Concluzii</h2>
      <p>
        Certificatul de integritate comportamentală este un instrument esențial pentru protejarea categoriilor
        vulnerabile, în special a minorilor, în mediile profesionale sensibile. Prin{' '}
        <Link href={serviceUrl('certificat-integritate')}>serviciul nostru online</Link> obții documentul rapid,
        fără drumuri la ghișeu, iar dacă ai nevoie poți adăuga și{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar</Link>, traduceri sau apostila de la Haga.
      </p>
    </ArticleLayout>
  );
}
