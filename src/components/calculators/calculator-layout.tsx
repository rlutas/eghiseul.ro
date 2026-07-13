import Link from 'next/link';
import { ChevronRight, Calculator, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { Footer } from '@/components/home/footer';
import { NewsletterPopup } from '@/components/calculators/newsletter-popup';
import { WebMcpTools } from '@/components/calculators/webmcp-tools';
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
  /** Răspuns direct, 1-2 propoziții (TL;DR) — afișat sub widget, pentru AI Overviews. */
  tldr?: string;
}

// Toate calculatoarele au fost verificate/actualizate în iunie 2026 (rate 2026).
const DATE_MODIFIED = '2026-06-22';
const ACTUALIZAT = 'iunie 2026';

/**
 * Internal linking calculatoare → pagini de servicii (money pages).
 * Calculatoarele aduc ~80% din clicurile organice; blocul de mai jos pasează
 * autoritate + trafic spre servicii cu ancore exact-match, contextual pe
 * subiectul calculatorului. Mapare per slug, cu fallback pe setul default.
 */
interface RelatedService {
  href: string;
  label: string;
  desc: string;
}

const SVC = {
  cazier: { href: '/servicii/cazier-judiciar-online/', label: 'Cazier judiciar online', desc: 'Eliberat rapid, 100% online — pentru angajare, licitații sau străinătate.' },
  cazierAuto: { href: '/servicii/cazier-auto-online/', label: 'Cazier auto online', desc: 'Istoricul sancțiunilor rutiere, fără drum la poliție.' },
  cazierFiscal: { href: '/servicii/cazier-fiscal-online/', label: 'Cazier fiscal online', desc: 'De la ANAF, necesar la înființare firmă sau licitații.' },
  extrasCF: { href: '/servicii/extras-de-carte-funciara/', label: 'Extras de carte funciară online', desc: 'Automat, în câteva minute, 24/7 — fără cont ANCPI.' },
  constatator: { href: '/servicii/certificat-constatator-online/', label: 'Certificat constatator online', desc: 'De la ONRC, doar cu CUI-ul firmei — eliberare instant, 24/7.' },
  nastere: { href: '/servicii/eliberare-certificat-de-nastere/', label: 'Certificat de naștere online', desc: 'Duplicat eliberat oficial, livrat oriunde.' },
} satisfies Record<string, RelatedService>;

const DEFAULT_RELATED: RelatedService[] = [SVC.cazier, SVC.extrasCF, SVC.constatator];

const RELATED_BY_SLUG: Record<string, RelatedService[]> = {
  // Imobiliare & credit → extras CF
  'taxe-notariale': [SVC.extrasCF, SVC.cazier, SVC.constatator],
  'credit-ipotecar': [SVC.extrasCF, SVC.cazier],
  'impozit-casa': [SVC.extrasCF, SVC.constatator],
  'impozit-chirie': [SVC.extrasCF, SVC.constatator],
  'rambursare-anticipata': [SVC.extrasCF, SVC.cazier],
  'grad-indatorare': [SVC.extrasCF, SVC.cazier],
  // Firmă & fiscal → constatator + cazier fiscal
  'taxe-srl': [SVC.constatator, SVC.cazierFiscal],
  'dividende': [SVC.constatator, SVC.cazierFiscal],
  'tva': [SVC.constatator, SVC.cazierFiscal],
  'contributii-pfa': [SVC.constatator, SVC.cazierFiscal],
  'penalitati-anaf': [SVC.cazierFiscal, SVC.constatator],
  'diurna': [SVC.constatator, SVC.cazier],
  // Juridic → cazier
  'reabilitare': [SVC.cazier, SVC.cazierAuto],
  'termene-judiciare': [SVC.cazier, SVC.extrasCF],
  'taxa-judiciara-de-timbru': [SVC.cazier, SVC.extrasCF],
  // Auto
  'amenda-circulatie': [SVC.cazierAuto, SVC.cazier],
  'calculator-impozit-auto': [SVC.cazierAuto, SVC.constatator],
  // Muncă / angajare → cazier
  'salariu': [SVC.cazier, SVC.cazierFiscal],
  'spor-salarial': [SVC.cazier, SVC.constatator],
  'vechime-in-munca': [SVC.cazier, SVC.extrasCF],
  'zile-concediu-odihna': [SVC.cazier, SVC.constatator],
  'indemnizatie-somaj': [SVC.cazier, SVC.cazierFiscal],
  // Familie → certificat naștere
  'concediu-maternitate': [SVC.nastere, SVC.cazier],
  'concediu-paternal': [SVC.nastere, SVC.cazier],
  'calculator-indemnizatie-crestere-copil': [SVC.nastere, SVC.cazier],
  'pensie-alimentara': [SVC.nastere, SVC.cazier],
};

export function CalculatorLayout({
  slug,
  title,
  heading,
  description,
  widget,
  children,
  faqs,
  tldr,
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
        inLanguage: 'ro-RO',
        isAccessibleForFree: true,
        description,
        dateModified: DATE_MODIFIED,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'RON' },
        provider: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        inLanguage: 'ro-RO',
        dateModified: DATE_MODIFIED,
        lastReviewed: DATE_MODIFIED,
        reviewedBy: { '@id': `${BASE_URL}/#organization` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        publisher: { '@id': `${BASE_URL}/#organization` },
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
              <Link href="/calculator/" className="hover:text-primary-500 transition-colors">Calculatoare</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">{heading}</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Calculator className="w-3.5 h-3.5" /> Calculator gratuit
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              {heading}
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">{description}</p>
            <p className="mt-3 text-sm text-white/55">Verificat de Echipa eGhișeul.ro · actualizat {ACTUALIZAT} · rate și praguri 2026</p>
          </div>
        </header>

        {/* Widget — overlaps hero */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20 rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8 shadow-lg">
              {widget}
            </div>
            {tldr && (
              <div className="mt-5 rounded-2xl border-l-4 border-primary-500 bg-primary-50/60 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">Pe scurt</p>
                <p className="text-[15px] leading-relaxed text-secondary-800">{tldr}</p>
              </div>
            )}
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

        {/* Related services — internal linking calculatoare → money pages */}
        <section className="py-12 bg-neutral-50 border-t border-neutral-200">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-xl lg:text-2xl font-extrabold text-secondary-900 mb-6">
              Documente utile, 100% online
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(RELATED_BY_SLUG[slug] ?? DEFAULT_RELATED).map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all"
                >
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700 transition-colors mb-1.5 flex items-center gap-1.5">
                    {s.label}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </p>
                  <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

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
      <NewsletterPopup />
      <WebMcpTools />
    </>
  );
}
