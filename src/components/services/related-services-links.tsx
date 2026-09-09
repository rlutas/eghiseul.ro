import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serviceUrl } from '@/lib/seo';

/**
 * Linkuri CRAWLABILE către serviciile înrudite dintr-o verticală.
 *
 * De ce există, deși paginile au deja `ServiceSwitcher`: switcher-ul e un
 * `<select>` cu `router.push()` — pentru un crawler nu există niciun link acolo.
 * De-asta cele 9 pagini de serviciu cadastral aveau ≤3 linkuri interne primite,
 * deși erau „legate între ele" în interfață (audit 09.09.2026). Coeziunea
 * internă slabă e a doua cauză din analiza demotării: pagina medie primea 5
 * linkuri interne, față de 38 pe site-ul soră neafectat.
 */
export function RelatedServicesLinks({
  services,
  currentSlug,
  title = 'Alte documente pe care ți le obținem',
  intro,
}: {
  services: { slug: string; name: string }[];
  currentSlug: string;
  title?: string;
  intro?: string;
}) {
  const others = services.filter((s) => s.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <section className="py-10 bg-white border-t border-neutral-200">
      <div className="container mx-auto px-4 max-w-[900px]">
        <h2 className="text-lg lg:text-xl font-bold text-secondary-900 mb-2">{title}</h2>
        {intro ? <p className="text-sm text-neutral-600 mb-5">{intro}</p> : null}
        <div className="grid sm:grid-cols-2 gap-2">
          {others.map((s) => (
            <Link
              key={s.slug}
              href={serviceUrl(s.slug)}
              className="group inline-flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
            >
              <span>{s.name}</span>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
