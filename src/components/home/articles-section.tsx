import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { ARTICLES } from '@/config/articles';

/**
 * Homepage "Ghiduri și articole recente" — surfaces the top guides (ordered by
 * organic traffic in ARTICLES) on the landing page. Mirrors the WordPress site's
 * recent-articles block; good for engagement + internal linking (SEO).
 */
export function ArticlesSection() {
  const articles = ARTICLES.slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-[1100px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Resurse utile
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900">
              Ghiduri și articole recente
            </h2>
            <p className="text-neutral-600 mt-2 max-w-xl">
              Răspunsuri clare la întrebările frecvente despre documentele și procedurile administrative.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded self-start sm:self-auto"
          >
            Vezi toate ghidurile
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.slug}/`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-primary-300 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                <Image
                  src={a.image ?? `/images/articole/${a.slug}.webp`}
                  alt={a.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300 motion-reduce:transition-none"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="inline-block w-fit px-2.5 py-0.5 bg-primary-50 text-primary-700 text-[11px] font-semibold rounded-full mb-2.5">
                  {a.category}
                </span>
                <h3 className="text-base font-bold text-secondary-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-3">{a.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                  Citește
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
