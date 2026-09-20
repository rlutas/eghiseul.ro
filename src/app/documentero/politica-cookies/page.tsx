import Link from 'next/link';
import { LegalLayoutDocumentero } from '@/components/documentero/legal-layout';
import { CookieSettingsLink } from '@/components/consent/cookie-settings-link';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroBreadcrumb, documenteroOrganizationNode, documenteroWebsiteNode } from '@/lib/seo/documentero-schema';
import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

const PATH = '/politica-cookies/';
const brand = BRANDS.documentero;

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Politica de cookie-uri',
  description:
    'Exact ce cookie-uri folosește documentero.ro, ce urmărim și ce NU urmărim, cât timp și cum îți schimbi opțiunea oricând.',
  path: PATH,
  noindex: !DOCUMENTERO_INDEXABLE,
});

export const revalidate = 86400;

/**
 * Same banner, same consent cookie and the same tags as eghiseul.ro
 * (src/components/consent/cookie-consent.tsx is shared by both brands), so the
 * list below mirrors src/app/(eghiseul)/politica-cookies/page.tsx.
 */
export default function Page() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      documenteroBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Politica de cookie-uri', path: PATH }], PATH),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <LegalLayoutDocumentero title="Politica de cookie-uri" path={PATH}>
        <p>
          <strong>documentero.ro</strong> (eDigitalizare SRL) folosește puține cookie-uri și le folosește
          transparent. Pe scurt: cele strict necesare rulează mereu (altfel nu funcționează comanda și
          plata), iar analiza Google Analytics pornește <strong>doar dacă apeși „Accept”</strong> în
          banner. Nimic altceva.
        </p>

        <h2>Ce urmărim</h2>
        <ul>
          <li>
            <strong>Cu acordul tău (analiză):</strong> pagini vizitate, durata vizitei, sursa
            traficului, dispozitivul, statistici agregate prin Google Analytics 4, ca să știm ce
            pagini ajută și ce trebuie îmbunătățit.
          </li>
          <li>
            <strong>Cu acordul tău (marketing):</strong> măsurarea campaniilor de publicitate (Google
            Ads, Meta (Facebook/Instagram) și OpenAI/ChatGPT Ads), dacă ai ajuns la noi dintr-o
            reclamă și ai comandat. Aceste instrumente se încarcă doar după ce accepți categoria de
            marketing. Fără acord, măsurarea se face agregat, pe server, fără cookie-uri.
          </li>
        </ul>

        <h2>Ce NU urmărim</h2>
        <ul>
          <li>NU vindem și NU închiriem date către terți.</li>
          <li>NU folosim cookie-uri de retargetare TikTok sau LinkedIn.</li>
          <li>NU stocăm datele cardului: plata se procesează integral de Stripe.</li>
          <li>NU urmărim nimic analitic înainte să apeși „Accept”: fără consimțământ, Google Analytics nici măcar nu se încarcă.</li>
        </ul>

        <h2>Lista exactă a cookie-urilor</h2>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Cine</th>
              <th>Scop</th>
              <th>Durată</th>
              <th>Categorie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>eg_cookie_consent</code></td>
              <td>documentero.ro</td>
              <td>Reține alegerea ta din bannerul de cookie-uri</td>
              <td>6 luni</td>
              <td>Strict necesar</td>
            </tr>
            <tr>
              <td><code>sb-*</code></td>
              <td>Supabase (infrastructura noastră)</td>
              <td>Autentificare, doar dacă folosești un cont de client sau de administrator</td>
              <td>sesiune / până la logout</td>
              <td>Strict necesar</td>
            </tr>
            <tr>
              <td><code>__stripe_mid</code>, <code>__stripe_sid</code></td>
              <td>Stripe</td>
              <td>Procesarea plății și prevenirea fraudei la checkout</td>
              <td>30 min – 1 an</td>
              <td>Strict necesar</td>
            </tr>
            <tr>
              <td><code>_ga</code>, <code>_ga_*</code></td>
              <td>Google Analytics</td>
              <td>Statistici de utilizare (agregate)</td>
              <td>până la 2 ani</td>
              <td>Analiză, doar cu acord</td>
            </tr>
            <tr>
              <td><code>_gcl_au</code></td>
              <td>Google Ads</td>
              <td>Măsurarea conversiilor din reclame</td>
              <td>90 de zile</td>
              <td>Marketing, doar cu acord</td>
            </tr>
            <tr>
              <td><code>_fbp</code></td>
              <td>Meta (Facebook/Instagram)</td>
              <td>Măsurarea conversiilor din reclamele Meta</td>
              <td>90 de zile</td>
              <td>Marketing, doar cu acord</td>
            </tr>
          </tbody>
        </table>
        <p>
          Dacă refuzi analiza după ce o acceptaseși, cookie-urile <code>_ga*</code> sunt șterse
          automat la salvarea noii opțiuni.
        </p>
        <p>
          Pentru a putea dovedi consimțământul (art. 7 GDPR), fiecare alegere salvată primește un
          identificator de confirmare (păstrat în cookie-ul <code>eg_cookie_consent</code>) și e
          înregistrată în registrul nostru de consimțăminte, împreună cu data și versiunea
          bannerului afișat.
        </p>

        <h2>Cum îți schimbi opțiunea</h2>
        <p>
          Oricând, dintr-un click:{' '}
          <CookieSettingsLink className="font-bold text-d-ink underline underline-offset-2 decoration-d-acc hover:decoration-d-ink" />;
          același link e permanent în subsolul fiecărei pagini. Alternativ, poți șterge cookie-urile
          din setările browserului.
        </p>

        <h2>Temeiul legal</h2>
        <p>
          Cookie-urile strict necesare: interes legitim + executarea contractului (art. 6 alin. 1
          lit. b și f GDPR). Cookie-urile de analiză și marketing: exclusiv consimțământul tău (art.
          6 alin. 1 lit. a GDPR, Directiva ePrivacy transpusă prin Legea 506/2004). Folosim Google
          Consent Mode v2: fără acord, Google nu primește identificatori.
        </p>

        <h2>Cookie-uri și date personale</h2>
        <p>
          Modul complet în care prelucrăm datele e descris în{' '}
          <Link href="/politica-de-confidentialitate/">Politica de confidențialitate</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Întrebări despre cookie-uri sau date: <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>.
        </p>
      </LegalLayoutDocumentero>
    </>
  );
}
