import Link from 'next/link';
import { LegalLayoutConstatator } from '@/components/constatator/legal-layout';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorBreadcrumb, constatatorOrganizationNode, constatatorWebsiteNode } from '@/lib/seo/constatator-schema';
import { CONSTATATOR_INDEXABLE } from '@/config/constatator-nav';

const PATH = '/politica-de-anulare/';

export const metadata = buildPageMetadata({
  brand: 'constatator',
  title: 'Politica de anulare și rambursare',
  description:
    'Cererea de certificat constatator se depune la ONRC imediat după plată, deci comanda nu se mai poate anula. Când primești banii înapoi sau un credit.',
  path: PATH,
  noindex: !CONSTATATOR_INDEXABLE,
});

export const revalidate = 86400;

/**
 * The certificat-constatator service has `processing_config.allow_self_cancel
 * = false` in the DB (checked 11.11.2026), the same rule eghiseul applies
 * (src/app/(eghiseul)/termeni-si-conditii/page.tsx §6, §8). The site sells
 * only this service, so the page states the rule directly instead of reading
 * the cancellable/excluded lists the multi-service sites need.
 */
export default function Page() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      constatatorBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Politica de anulare', path: PATH }], PATH),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <LegalLayoutConstatator title="Politica de anulare și rambursare" path={PATH}>
        <p>
          Pe scurt: cererea către ONRC se depune imediat după plată, deci{' '}
          <strong>comanda nu se mai poate anula după ce ai plătit</strong>. Primești banii înapoi dacă greșeala e a
          noastră și un credit dacă ONRC nu poate emite certificatul pentru datele din comandă.
        </p>

        <h2>De ce nu există o fereastră de anulare</h2>
        <p>
          Cererea către ONRC se depune imediat după confirmarea plății: automat, în câteva minute, la certificatul de
          bază, și de echipa noastră, în programul de lucru, la celelalte variante. La depunere plătim taxa ONRC, care
          nu se mai recuperează. Conform OUG 34/2014 art. 16 lit. m), dreptul legal de retragere nu se aplică după
          începerea efectivă a prestării serviciului. De aceea pagina comenzii nu are buton de anulare.
        </p>
        <p>
          Înainte de plată nu ai nicio obligație. Poți închide pagina oricând, iar o comandă neplătită nu se
          procesează. La transfer bancar, cererea pleacă abia după ce confirmăm încasarea; până atunci scrie-ne și
          închidem comanda.
        </p>

        <h2>Rambursare integrală (100%)</h2>
        <p>
          Dacă serviciul <strong>nu poate fi prestat din culpa noastră</strong>, primești toți banii înapoi, fără să
          trebuiască să ceri anularea într-un anumit termen.
        </p>

        <h2>Credit pentru un alt certificat</h2>
        <p>
          ONRC nu emite un document de respingere atunci când entitatea nu este înregistrată la Registrul Comerțului
          (de exemplu un cabinet medical individual, o asociație sau o fundație) sau când CUI-ul din comandă nu e
          corect. În aceste cazuri te anunțăm pe email și primești un <strong>credit</strong> pentru eliberarea
          certificatului, pe care îl poți folosi pe alt CUI.
        </p>

        <h2>Când nu se acordă rambursare</h2>
        <ul>
          <li>certificatul a fost emis pentru datele trecute în comandă, dar ai vrut altă firmă, alt tip sau alt scop;</li>
          <li>instituția la care depui certificatul cere un document mai nou sau o altă variantă;</li>
          <li>datele din certificat nu îți convin: ele reflectă evidența ONRC, iar o corectură se cere doar de la ONRC.</li>
        </ul>
        <p>Verifică CUI-ul, tipul certificatului și scopul înainte de plată.</p>

        <h2>Cum primești banii</h2>
        <p>
          Rambursările se fac pe aceeași metodă de plată (cardul folosit sau, la transfer bancar, contul din care ai
          plătit), în <strong>5–10 zile lucrătoare</strong>. Te anunțăm pe email când rambursarea a fost procesată.
        </p>

        <h2>Ai o situație specială?</h2>
        <p>
          Scrie-ne prin <a href="/contact/">formularul de contact</a>, cu numărul comenzii. Analizăm fiecare caz.
        </p>

        <p>
          Politica face parte din{' '}
          <Link href="/termeni-si-conditii/#anulare">Termenii și condițiile</Link> Constatator Express (secțiunea 8).
        </p>
      </LegalLayoutConstatator>
    </>
  );
}
