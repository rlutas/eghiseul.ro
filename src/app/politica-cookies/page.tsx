import Link from 'next/link';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'Politica de Cookies',
  description: 'Ce cookie-uri folosește eGhișeul.ro, în ce scop și cum le poți gestiona.',
  path: '/politica-cookies/',
});

export const revalidate = 86400;

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Acasă', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Politica de Cookies', item: `${BASE_URL}/politica-cookies/` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LegalLayout title="Politica de Cookies" updated="27 iunie 2026">
        <p>
          Platforma <strong>eGhișeul.ro</strong> (eDigitalizare SRL) folosește cookie-uri pentru a funcționa corect și
          pentru a îmbunătăți experiența ta. Această politică explică ce sunt cookie-urile și cum le poți controla.
        </p>

        <h2>Ce sunt cookie-urile</h2>
        <p>
          Cookie-urile sunt fișiere text mici stocate în browser-ul tău, care ne ajută să reținem preferințe și să
          asigurăm funcționarea site-ului.
        </p>

        <h2>Tipuri de cookie-uri folosite</h2>
        <ul>
          <li><strong>Strict necesare</strong> — pentru funcționarea site-ului, comandă și autentificare. Nu pot fi dezactivate și nu necesită consimțământ.</li>
          <li><strong>De performanță/analiză</strong> — ne ajută să înțelegem cum este folosit site-ul, pentru a-l îmbunătăți. Se activează doar cu acordul tău.</li>
          <li><strong>De funcționalitate</strong> — rețin preferințe (ex. date precompletate).</li>
        </ul>

        <h2>Cum gestionezi cookie-urile</h2>
        <p>
          Poți accepta sau refuza cookie-urile neesențiale din banner-ul de consimțământ și poți șterge oricând
          cookie-urile din setările browser-ului. Dezactivarea unor cookie-uri poate afecta funcționarea site-ului.
        </p>

        <h2>Cookie-uri și date personale</h2>
        <p>
          Unele cookie-uri pot prelucra date cu caracter personal (de ex. identificatori tehnici). Modul în care
          tratăm aceste date este descris în{' '}
          <Link href="/politica-de-confidentialitate/">Politica de Confidențialitate</Link> și pagina{' '}
          <Link href="/gdpr/">GDPR</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Pentru întrebări: <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>.
        </p>
      </LegalLayout>
    </>
  );
}
