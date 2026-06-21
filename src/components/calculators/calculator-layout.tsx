import Link from 'next/link';
import { ChevronRight, Calculator, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { Footer } from '@/components/home/footer';
import { BASE_URL } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';

export interface CalculatorLayoutProps {
  /** Slug sub /calculator/<slug>/ */
  slug: string;
  title: string;
  /** H1 (poate diferi de title-ul din <title>). */
  heading: string;
  description: string;
  /** Widget-ul interactiv (client component). */
  widget: React.ReactNode;
  /** Conținut SEO sub calculator (prose). */
  children: React.ReactNode;
  faqs?: { q: string; a: string }[];
}

export function CalculatorLayout({
  slug,
  title,
  heading,
  description,
  widget,
  children,
  faqs,
}: CalculatorLayoutProps) {
  const url = `${BASE_URL}/calculator/${slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode(),
      {
        ...breadcrumbNode([
          { name: 'Acasă', url: `${BASE_URL}/` },
          { name: 'Calculatoare', url: `${BASE_URL}/calculator/` },
          { name: title, url },
        ]),
        '@id': `${url}#breadcrumb`,
      },
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: title,
        url,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'RON' },
        provider: { '@id': `${BASE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
              <span className="text-white/80">Calculatoare</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Calculator className="w-3.5 h-3.5" /> Calculator gratuit
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              {heading}
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">{description}</p>
          </div>
        </header>

        {/* Widget — overlaps hero */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20 rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8 shadow-lg">
              {widget}
            </div>
          </div>
        </section>

        {/* SEO content */}
        <article className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-bold prose-headings:text-secondary-900 prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-neutral-700 prose-p:leading-relaxed
                prose-li:text-neutral-700 prose-li:marker:text-primary-500
                prose-a:text-primary-700 prose-a:font-medium prose-a:underline hover:prose-a:text-primary-800
                prose-strong:text-secondary-900
                prose-table:text-sm prose-th:bg-neutral-100 prose-th:text-secondary-900 prose-td:align-top"
            >
              {children}
            </div>
          </div>
        </article>

        {/* FAQ */}
        {faqs && faqs.length > 0 && <ServiceFAQ title="Întrebări frecvente" faqs={faqs} />}

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
              Ai nevoie de un document oficial?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              eGhișeul îți obține documentele oficiale 100% online, fără drumuri la ghișeu.
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
