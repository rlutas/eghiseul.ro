import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'informatii-cazier-auto-online';
const TITLE = 'Cazier Auto Online: Tot Ce Trebuie Să Știi';
const DESCRIPTION =
  'Ce este cazierul auto, ce fapte conține, cât se păstrează în evidență și cum îl obții online. ' +
  'Diferența față de cazierul judiciar, impactul asupra asigurărilor și pașii de solicitare.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE} | eGhișeul`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Auto"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="16 iunie 2026"
      relatedServices={[
        { slug: 'cazier-auto', label: 'Cazier Auto Online', desc: 'Istoricul oficial al vehiculului, online.' },
      ]}
      faqs={[
        {
          q: 'Care este diferența dintre cazierul auto și cazierul judiciar?',
          a: 'Cazierul auto include contravențiile și infracțiunile legate exclusiv de abaterile de circulație ale unui șofer pe drumurile publice din România. Cazierul judiciar acoperă toate faptele penale, indiferent de natura lor (furt, violență, infracțiuni economice etc.). De exemplu, o amendă pentru viteză apare în cazierul auto, nu în cel judiciar, cu excepția cazului în care este clasificată ca faptă gravă.',
        },
        {
          q: 'Cât timp se păstrează faptele în cazierul auto?',
          a: 'Contravențiile rutiere se șterg automat după 6-12 luni, dacă nu apar noi abateri. Infracțiunile rutiere pot rămâne în evidență între 1 și 5 ani, în funcție de gravitate și de recidivă.',
        },
        {
          q: 'Influențează cazierul auto prima de asigurare?',
          a: 'Da. Cazierul auto influențează direct costul asigurării. Șoferii cu mai multe abateri sunt clasificați drept „risc ridicat" și plătesc prime mai mari, în timp ce un istoric curat poate aduce reduceri.',
        },
        {
          q: 'Pot solicita cazierul auto dacă am permisul suspendat?',
          a: 'Da. Poți solicita cazierul auto chiar dacă permisul tău este suspendat.',
        },
        {
          q: 'Cât durează pentru titularii de permise străine?',
          a: 'Conducătorii cu permise emise în străinătate pot solicita un cazier care reflectă abaterile comise pe drumurile din România. Aceste verificări pot dura până la 7 zile lucrătoare, în funcție de viteza schimbului de informații între state.',
        },
      ]}
    >
      <p>
        <strong>Cazierul auto</strong> este un document oficial care reflectă istoricul sancțiunilor rutiere ale unui
        conducător auto. Este emis de autoritățile competente, în principal de <strong>Poliția Rutieră</strong>, și
        consemnează abaterile de circulație ale șoferului pe drumurile publice din România.
      </p>

      <h2>Diferența dintre cazierul auto și cazierul judiciar</h2>
      <p>Cazierul auto este distinct de cazierul judiciar:</p>
      <ul>
        <li>
          <strong>Cazierul auto</strong> include contravențiile și infracțiunile legate exclusiv de abaterile de
          circulație aplicate unui șofer pe drumurile publice din România.
        </li>
        <li>
          <strong>Cazierul judiciar</strong> acoperă toate faptele penale, indiferent de natura lor (furt, violență,
          infracțiuni economice etc.).
        </li>
      </ul>
      <p>
        Astfel, dacă primești o amendă pentru depășirea vitezei, aceasta apare în cazierul auto, nu în cel judiciar, cu
        excepția cazului în care este clasificată ca faptă gravă.
      </p>

      <h2>Ce tipuri de fapte se consemnează</h2>
      <p>În cazierul auto se înregistrează mai multe categorii de fapte:</p>
      <h3>Contravenții</h3>
      <ul>
        <li>Depășirea limitei de viteză</li>
        <li>Neacordarea priorității</li>
        <li>Conducerea sub influența alcoolului (sub 0,8 g/l)</li>
        <li>Puncte de penalizare și avertismente</li>
      </ul>
      <h3>Infracțiuni</h3>
      <ul>
        <li>Conducerea fără permis valabil</li>
        <li>Conducerea sub influența alcoolului (peste 0,8 g/l)</li>
        <li>Părăsirea locului accidentului</li>
      </ul>

      <h2>Cât timp se păstrează în evidență</h2>
      <ul>
        <li>
          <strong>Contravențiile rutiere:</strong> se șterg automat după 6-12 luni, dacă nu apar noi abateri.
        </li>
        <li>
          <strong>Infracțiunile rutiere:</strong> rămân în evidență între 1 și 5 ani, în funcție de gravitate și de
          recidivă.
        </li>
      </ul>

      <h2>Impactul asupra asigurării auto</h2>
      <p>
        Cazierul auto influențează direct prima de asigurare. Șoferii cu mai multe abateri sunt clasificați drept
        „risc ridicat&rdquo; și plătesc prime mai mari, în timp ce un istoric curat poate aduce reduceri.
      </p>

      <h2>Când ai nevoie de cazier auto</h2>
      <ol>
        <li>La <strong>angajare</strong>, pe posturi care presupun conducerea frecventă a unui autovehicul</li>
        <li>La încheierea unei <strong>polițe de asigurare</strong></li>
        <li>La <strong>înscrierea în competiții</strong></li>
        <li>La <strong>înscrierea la cursuri</strong></li>
        <li>Pentru <strong>certificări profesionale</strong> în domeniul transporturilor</li>
      </ol>

      <h2>Cum obții cazierul auto online</h2>
      <p>Procesul de obținere online constă în șapte pași:</p>
      <ol>
        <li>Accesezi pagina serviciului</li>
        <li>Completezi informațiile de bază (email, nume, telefon)</li>
        <li>Alegi tipul de serviciu (standard sau urgent)</li>
        <li>Încarci documentele de identitate și fotografiile permisului de conducere</li>
        <li>Semnezi contractul de prestări servicii</li>
        <li>Alegi tipul de factură (persoană fizică sau juridică)</li>
        <li>Efectuezi plata</li>
      </ol>
      <p>
        Documentul poate fi livrat electronic (PDF pe email sau WhatsApp) sau fizic, prin curier. Poți solicita un{' '}
        <Link href={serviceUrl('cazier-auto')}>cazier auto online</Link> direct de pe platformă, fără deplasare la
        ghișeu.
      </p>

      <h2>Titularii de permise străine</h2>
      <p>
        Conducătorii cu permise emise în străinătate pot solicita un cazier care reflectă abaterile comise pe
        drumurile din România. Aceste verificări pot dura până la 7 zile lucrătoare, în funcție de viteza schimbului de
        informații între state.
      </p>

      <h2>Sfaturi pentru un cazier auto curat</h2>
      <ul>
        <li>Respectă regulile de circulație</li>
        <li>Evită distragerile (telefonul mobil)</li>
        <li>Nu conduce niciodată sub influența alcoolului</li>
        <li>Participă la cursuri de conducere defensivă</li>
      </ul>

      <h2>Întrebări utile</h2>
      <p>
        <strong>Perioada de valabilitate:</strong> cazierul auto nu are o expirare fixă; informațiile se actualizează
        periodic.
      </p>
      <p>
        <strong>Cine poate solicita:</strong> orice titular de permis sau angajatorii ori autoritățile autorizate.
      </p>
      <p>
        <strong>Permis suspendat:</strong> poți solicita cazierul auto chiar dacă permisul tău este suspendat.
      </p>
    </ArticleLayout>
  );
}
