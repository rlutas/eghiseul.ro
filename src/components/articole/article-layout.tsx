import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CalendarDays, RefreshCw, ArrowRight, Phone, PenLine } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { Button } from '@/components/ui/button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { buildArticlePageGraph, BASE_URL, SITE_AUTHOR } from '@/lib/seo';
import { getServiceCards, type RelatedServiceInput } from '@/lib/articles/service-cards';
import { ArticleRailCard, ArticleServiceCards } from './article-service-cards';
import { ArticleStickyBar } from './article-sticky-bar';

export type RelatedService = RelatedServiceInput;

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
  /**
   * Autorul articolului. Implicit `SITE_AUTHOR` — până pe 09.09.2026 prop-ul
   * ăsta nu exista deloc, deci pe 243 de pagini era o singură semnătură
   * vizibilă, iar în schema `author` cădea pe Organization.
   */
  author?: { name: string; url: string };
  children: React.ReactNode;
}

export async function ArticleLayout({
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
  author = { name: SITE_AUTHOR.name, url: SITE_AUTHOR.url },
  children,
}: ArticleLayoutProps) {
  // Featured image: derive from slug by convention unless explicitly passed.
  const featuredImage = image ?? `/images/articole/${slug}.webp`;
  // Products for the bottom band, the desktop rail and the phone bar. The
  // first service in `relatedServices` is the article's main product.
  const { cards, guides } = await getServiceCards(relatedServices);
  const mainCard = cards[0] ?? null;

  const jsonLdGraph = buildArticlePageGraph({
    slug,
    headline: title,
    description,
    datePublished,
    dateModified,
    author,
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
              <span className="inline-flex items-center gap-1.5">
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Scris de{' '}
                <Link href={author.url} className="underline underline-offset-2 hover:text-white">
                  {author.name}
                </Link>
              </span>
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
          <div
            className={
              mainCard
                ? 'container mx-auto px-4 max-w-[760px] xl:max-w-[1100px] xl:grid xl:grid-cols-[minmax(0,760px)_280px] xl:justify-center xl:gap-12'
                : 'container mx-auto px-4 max-w-[760px]'
            }
          >
            <div className="min-w-0">
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
            {mainCard && (
              <aside className="hidden xl:block" aria-label="Documentul legat de acest articol">
                <ArticleRailCard card={mainCard} />
              </aside>
            )}
          </div>
        </article>

        {/* Related services as products (navy band, distinct from the FAQ) */}
        <ArticleServiceCards cards={cards} guides={guides} />

        {/* FAQ */}
        {faqs && faqs.length > 0 && (
          <ServiceFAQ title="Întrebări Frecvente" faqs={faqs} twoColumns={false} />
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

      {mainCard && <ArticleStickyBar card={mainCard} />}
      <Footer />
    </>
  );
}
