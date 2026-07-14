import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CalendarDays, RefreshCw, ArrowRight, Phone } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { Button } from '@/components/ui/button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { buildArticlePageGraph, serviceUrl, BASE_URL } from '@/lib/seo';

export interface RelatedService {
  /** DB service slug — resolved through serviceUrl(). Ignored if `href` is set. */
  slug?: string;
  /** Explicit href for non-service targets (calculators, tools, other articles). */
  href?: string;
  label: string;
  desc: string;
}

export interface ArticleLayoutProps {
  slug: string; // root-path slug (no leading slash)
  category: string; // short label shown as a badge
  title: string;
  description: string;
  datePublished: string; // ISO 8601
  dateModified?: string; // ISO 8601
  /** Human-readable dates for display (Romanian). */
  publishedLabel?: string;
  updatedLabel?: string;
  image?: string;
  /** Descriptive alt for the featured image; falls back to the title. */
  imageAlt?: string;
  relatedServices?: RelatedService[];
  faqs?: { q: string; a: string }[];
  children: React.ReactNode;
}

export function ArticleLayout({
  slug,
  category,
  title,
  description,
  datePublished,
  dateModified,
  publishedLabel,
  updatedLabel,
  image,
  imageAlt,
  relatedServices = [],
  faqs,
  children,
}: ArticleLayoutProps) {
  // Featured image: derive from slug by convention unless explicitly passed.
  const featuredImage = image ?? `/images/articole/${slug}.webp`;

  const jsonLdGraph = buildArticlePageGraph({
    slug,
    headline: title,
    description,
    datePublished,
    dateModified,
    image: featuredImage.startsWith('http') ? featuredImage : `${BASE_URL}${featuredImage}`,
    breadcrumb: [
      { name: 'Acasă', url: `${BASE_URL}/` },
      { name: 'Informații utile', url: `${BASE_URL}/blog/` },
      { name: title, url: `${BASE_URL}/${slug}/` },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-24 lg:pb-32">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">Informații utile</span>
            </nav>

            <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              {category}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              {title}
            </h1>

            <p className="text-lg text-white/85 leading-relaxed mb-6">{description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              {publishedLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Publicat: {publishedLabel}
                </span>
              )}
              {updatedLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Actualizat: {updatedLabel}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        <article className="py-10 lg:py-14 bg-white">
          <div className="container mx-auto px-4 max-w-[760px]">
            {/* Featured image — overlaps the dark hero for a polished header */}
            <div className="relative -mt-16 lg:-mt-24 mb-8 overflow-hidden rounded-2xl border border-neutral-200 shadow-lg aspect-[16/9] bg-neutral-100">
              <Image
                src={featuredImage}
                alt={imageAlt ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 760px"
                priority
              />
            </div>
            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-bold prose-headings:text-secondary-900 prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-neutral-700 prose-p:leading-relaxed
                prose-li:text-neutral-700 prose-li:marker:text-primary-500
                prose-a:text-primary-700 prose-a:font-medium prose-a:underline hover:prose-a:text-primary-800
                prose-strong:text-secondary-900
                prose-table:text-sm prose-th:bg-neutral-100 prose-th:text-secondary-900 prose-td:align-top
                prose-blockquote:border-l-primary-500 prose-blockquote:text-neutral-600"
            >
              {children}
            </div>
          </div>
        </article>

        {/* Related services CTA */}
        {relatedServices.length > 0 && (
          <section className="py-12 lg:py-16 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-[860px]">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
                Servicii eGhișeul legate de acest articol
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedServices.map((s) => (
                  <Link
                    key={s.href ?? s.slug}
                    href={s.href ?? serviceUrl(s.slug as string)}
                    className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <div>
                      <p className="font-bold text-secondary-900 group-hover:text-primary-700">{s.label}</p>
                      <p className="text-sm text-neutral-600">{s.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs && faqs.length > 0 && (
          <ServiceFAQ title="Întrebări Frecvente" faqs={faqs} />
        )}

        {/* CTA */}
        <section className="relative py-14 lg:py-20 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px] text-center">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">
              Ai nevoie de un document?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              eGhișeul îți obține documentele 100% online, fără drumuri la ghișeu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/servicii/">
                  Vezi serviciile
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl transition-all duration-200"
              >
                <a href="tel:+40757708181">
                  <Phone className="mr-2 w-5 h-5" aria-hidden="true" />
                  Sună-ne
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
