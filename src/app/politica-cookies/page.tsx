import { buildPageMetadata } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'Politica de Cookies',
  description: 'Ce cookie-uri folosește eGhișeul.ro, în ce scop și cum le poți gestiona.',
  path: '/politica-cookies/',
});

export const revalidate = 86400;

export default function Page() {
  return (
    <LegalLayout title="Politica de Cookies" updated="16 iunie 2026">
      <p>
        Platforma <strong>eGhișeul.ro</strong> (eDigitalizare SRL) folosește cookie-uri pentru a funcționa corect și pentru a
        îmbunătăți experiența ta. Această politică explică ce sunt cookie-urile și cum le poți controla.
      </p>

      <h2>Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere text mici stocate în browser-ul tău, care ne ajută să reținem preferințe și să asigurăm
        funcționarea site-ului.
      </p>

      <h2>Tipuri de cookie-uri folosite</h2>
      <ul>
        <li><strong>Strict necesare</strong> — pentru funcționarea site-ului, comandă și autentificare. Nu pot fi dezactivate.</li>
        <li><strong>De performanță/analiză</strong> — ne ajută să înțelegem cum este folosit site-ul, pentru a-l îmbunătăți.</li>
        <li><strong>De funcționalitate</strong> — rețin preferințe (ex. date precompletate).</li>
      </ul>

      <h2>Cum gestionezi cookie-urile</h2>
      <p>
        Poți accepta sau refuza cookie-urile non-esențiale din banner-ul de consimțământ și poți șterge oricând
        cookie-urile din setările browser-ului. Dezactivarea unor cookie-uri poate afecta funcționarea site-ului.
      </p>

      <h2>Contact</h2>
      <p>
        Pentru întrebări: <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>. Vezi și
        <a href="/politica-de-confidentialitate/"> Politica de Confidențialitate</a>.
      </p>
    </LegalLayout>
  );
}
