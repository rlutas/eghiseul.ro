import { serviceUrl } from '@/lib/seo/constants';
import { formatLei, type PublicServiceFacts } from '@/lib/services/public-facts';

/**
 * „Serviciile, pe scurt": one plain `<a href>` per main service page, with the
 * exact-match anchor (the query the service page should rank for), the
 * institution that issues the document and the price + term from the
 * `services` row.
 *
 * Why it exists (SEO audit 02.11.2026, C1): Google ranked the homepage, not the
 * service page, on „cazier judiciar online" (474 vs 20 impressions). The
 * homepage is the brand hub; it points each topic to its page instead of
 * competing with it. Plain anchors, not a `<select>` (content-and-seo rule 5).
 *
 * Only services with a live dedicated page belong here. Rovinieta is left out
 * on purpose: it is an affiliate link, not our product.
 */
const SERVICE_LINKS: { slug: string; anchor: string; issuer: string }[] = [
  { slug: 'cazier-judiciar', anchor: 'Cazier judiciar online', issuer: 'eliberat de Poliția Română' },
  { slug: 'certificat-integritate', anchor: 'Certificat de integritate comportamentală', issuer: 'eliberat de Poliția Română' },
  { slug: 'cazier-auto', anchor: 'Cazier auto online', issuer: 'eliberat de Poliția Română' },
  { slug: 'cazier-fiscal', anchor: 'Cazier fiscal online', issuer: 'eliberat de ANAF' },
  { slug: 'extras-carte-funciara', anchor: 'Extras de carte funciară', issuer: 'eliberat de ANCPI (OCPI)' },
  { slug: 'certificat-constatator', anchor: 'Certificat constatator online', issuer: 'eliberat de Registrul Comerțului (ONRC)' },
  { slug: 'certificat-nastere', anchor: 'Certificat de naștere', issuer: 'duplicat eliberat de starea civilă' },
  { slug: 'certificat-casatorie', anchor: 'Certificat de căsătorie', issuer: 'duplicat eliberat de starea civilă' },
  { slug: 'certificat-celibat', anchor: 'Certificat de celibat', issuer: 'eliberat de starea civilă' },
  { slug: 'extras-multilingv-certificat-nastere', anchor: 'Extras multilingv de naștere', issuer: 'eliberat de starea civilă' },
];

export function ServiceLinksSection({ facts }: { facts: PublicServiceFacts }) {
  return (
    <section id="servicii-pe-scurt" aria-labelledby="servicii-pe-scurt-titlu" className="bg-white py-12 lg:py-14">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <h2 id="servicii-pe-scurt-titlu" className="text-2xl lg:text-3xl font-extrabold text-secondary-900 leading-tight mb-2">
          Ce documente obținem pentru tine
        </h2>
        <p className="text-base text-neutral-600 mb-6 max-w-[720px]">
          Noi depunem cererea; documentul îl eliberează instituția. Prețul și termenul sunt cele de pe pagina
          fiecărui serviciu.
        </p>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {SERVICE_LINKS.map((s) => {
            const f = facts[s.slug];
            return (
              <li key={s.slug} className="border-b border-neutral-100 pb-3">
                <a
                  href={serviceUrl(s.slug)}
                  className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-600"
                >
                  {s.anchor}
                </a>
                <span className="block text-sm text-neutral-600">
                  {s.issuer}
                  {f ? `, ${formatLei(f.priceWithVat)} lei cu TVA, ${f.term}` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
