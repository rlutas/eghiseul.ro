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
  /**
   * Data reală a ultimei actualizări a ACESTUI calculator (`YYYY-MM-DD`).
   * Fără ea, toate cele 41 de calculatoare raportau aceeași dată în schema —
   * corect în iunie, tot mai fals cu fiecare lună (audit 09.09.2026).
   */
  dateModified?: string;
}

// Verificarea de bază a tuturor calculatoarelor (rate 2026). Fiecare calculator
// atins ulterior își trece data lui prin prop-ul `dateModified`.
const DATE_MODIFIED_DEFAULT = '2026-06-22';

const LUNI_RO = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
] as const;

/** „2026-07-31" → „iulie 2026", pentru textul vizibil din pagină. */
function lunaAnul(iso: string): string {
  const [an, luna] = iso.split('-');
  return `${LUNI_RO[Number(luna) - 1] ?? ''} ${an}`.trim();
}

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
  casatorie: { href: '/servicii/eliberare-certificat-de-casatorie/', label: 'Certificat de căsătorie online', desc: 'Duplicat de la Starea Civilă — cerut la dosarul de pensie când numele diferă de cel din acte.' },
  multilingvNastere: { href: '/servicii/extras-multilingv-certificat-nastere/', label: 'Extras multilingv de naștere', desc: 'Valabil direct în UE, fără traducere și fără apostilă — pentru dosare depuse în străinătate.' },
  identificareImobil: { href: '/servicii/identificare-imobil/', label: 'Identificare imobil', desc: 'Afli numărul de CF și cadastral când ai doar date vechi.' },
  copieCF: { href: '/servicii/copie-carte-funciara/', label: 'Copie carte funciară', desc: 'Copia CF-ului vechi, cu istoricul înscrierilor.' },
  urbanism: { href: '/servicii/certificat-urbanism-informare/', label: 'Certificat de urbanism pentru informare', desc: 'Afli ce se poate construi pe teren ÎNAINTE să cumperi — restricții, POT/CUT, interdicții.' },
  // Tool gratuit, nu serviciu — dar e pagina cu cele mai multe clicuri de pe site
  // (32.589 pe trei luni) și avea DOUĂ linkuri interne. Poziția i-a căzut de la
  // 5,95 la 31,92 după update (audit 09.09.2026).
  rovinietaTool: { href: '/tools/verificare-rovinieta-online/', label: 'Verificare rovinietă', desc: 'Vezi gratuit dacă mașina are rovinieta valabilă și până când.' },
  rovinieta: { href: '/servicii/rovinieta-online/', label: 'Rovinietă online', desc: 'Cumperi rovinieta în câteva minute, cu confirmare pe email.' },
} satisfies Record<string, RelatedService>;

const DEFAULT_RELATED: RelatedService[] = [SVC.cazier, SVC.extrasCF, SVC.constatator];

/**
 * Calculatoare înrudite — coeziune internă, unde e traficul.
 *
 * Calculatoarele aduc 54% din clicurile site-ului, dar erau aproape izolate în
 * graful de linkuri: `/calculator/pensie-invaliditate/` are 7.201 clicuri pe trei
 * luni și DOUĂ linkuri interne, `/calculator/calculator-indemnizatie-crestere-copil/`
 * are 8.877 de clicuri și trei. Autoritatea intra în site și se oprea acolo.
 * (Audit 09.09.2026 — coeziunea internă e a doua cauză din analiza demotării.)
 *
 * Grupate pe intenția reală a utilizatorului, nu pe categorie administrativă:
 * cine calculează vârsta de pensionare vrea și estimarea pensiei, nu TVA.
 */
const CALC_CLUSTERS: string[][] = [
  // Pensii
  ['varsta-pensionare', 'estimare-pensie', 'pensie-invaliditate', 'impozit-pensie', 'vechime-in-munca'],
  // Familie, concedii, indemnizații
  ['calculator-indemnizatie-crestere-copil', 'concediu-maternitate', 'concediu-paternal',
   'concediu-medical', 'zile-concediu-odihna', 'indemnizatie-somaj', 'pensie-alimentara'],
  // Salariu și venituri
  ['salariu', 'spor-salarial', 'diurna', 'contributii-pfa', 'dividende', 'taxe-srl'],
  // Auto
  ['calculator-impozit-auto', 'amenda-circulatie'],
  // Imobiliare și construcții
  ['cost-cadastru-intabulare', 'cat-pot-construi', 'impozit-casa', 'impozit-chirie',
   'jugar-stanjen-in-mp', 'taxe-notariale'],
  // Bani, credite, taxe
  ['credit-ipotecar', 'grad-indatorare', 'rambursare-anticipata', 'dobanda-legala',
   'inflatie', 'tva', 'penalitati-anaf'],
  // Juridic și termene
  ['termene-judiciare', 'taxa-judiciara-de-timbru', 'reabilitare', 'valabilitate-documente',
   'zile-lucratoare', 'calculator-data'],
];

const CALC_LABELS: Record<string, string> = {
  'amenda-circulatie': 'Calculator amendă de circulație',
  'calculator-data': 'Calculator de date',
  'calculator-impozit-auto': 'Calculator impozit auto',
  'calculator-indemnizatie-crestere-copil': 'Calculator indemnizație creștere copil',
  'calculator-procente': 'Calculator de procente',
  'cat-pot-construi': 'Cât pot construi (POT și CUT)',
  'concediu-maternitate': 'Calculator concediu de maternitate',
  'concediu-medical': 'Calculator concediu medical',
  'concediu-paternal': 'Calculator concediu paternal',
  'contributii-pfa': 'Calculator contribuții PFA',
  'cost-cadastru-intabulare': 'Calculator cost cadastru și intabulare',
  'credit-ipotecar': 'Calculator credit ipotecar',
  diurna: 'Calculator diurnă',
  dividende: 'Calculator impozit pe dividende',
  'dobanda-legala': 'Calculator dobândă legală',
  'estimare-pensie': 'Calculator estimare pensie',
  'grad-indatorare': 'Calculator grad de îndatorare',
  'impozit-casa': 'Calculator impozit pe casă',
  'impozit-chirie': 'Calculator impozit pe chirie',
  'impozit-pensie': 'Calculator impozit pe pensie',
  'indemnizatie-somaj': 'Calculator indemnizație de șomaj',
  inflatie: 'Calculator inflație',
  'jugar-stanjen-in-mp': 'Convertor jugăr și stânjen în m²',
  'penalitati-anaf': 'Calculator penalități ANAF',
  'pensie-alimentara': 'Calculator pensie alimentară',
  'pensie-invaliditate': 'Calculator pensie de invaliditate',
  'rambursare-anticipata': 'Calculator rambursare anticipată',
  reabilitare: 'Calculator reabilitare judiciară',
  salariu: 'Calculator salariu net',
  'spor-salarial': 'Calculator spor salarial',
  'taxa-judiciara-de-timbru': 'Calculator taxă judiciară de timbru',
  'taxe-notariale': 'Calculator taxe notariale',
  'taxe-srl': 'Calculator taxe SRL',
  'termene-judiciare': 'Calculator termene judiciare',
  tva: 'Calculator TVA',
  'valabilitate-documente': 'Calculator valabilitate documente',
  'varsta-pensionare': 'Calculator vârstă de pensionare',
  'vechime-in-munca': 'Calculator vechime în muncă',
  'zile-concediu-odihna': 'Calculator zile de concediu de odihnă',
  'zile-lucratoare': 'Calculator zile lucrătoare',
};

/** Până la 5 calculatoare din același cluster, fără cel curent. */
function relatedCalculators(slug: string): { href: string; label: string }[] {
  const cluster = CALC_CLUSTERS.find((c) => c.includes(slug));
  if (!cluster) return [];
  return cluster
    .filter((s) => s !== slug && CALC_LABELS[s])
    .slice(0, 5)
    .map((s) => ({ href: `/calculator/${s}/`, label: CALC_LABELS[s] }));
}

const RELATED_BY_SLUG: Record<string, RelatedService[]> = {
  // Imobiliare & credit → extras CF
  'taxe-notariale': [SVC.extrasCF, SVC.cazier, SVC.constatator],
  'credit-ipotecar': [SVC.extrasCF, SVC.urbanism, SVC.cazier],
  'impozit-casa': [SVC.extrasCF, SVC.constatator],
  'impozit-chirie': [SVC.extrasCF, SVC.constatator],
  'rambursare-anticipata': [SVC.extrasCF, SVC.cazier],
  'grad-indatorare': [SVC.extrasCF, SVC.cazier],
  'jugar-stanjen-in-mp': [SVC.extrasCF, SVC.identificareImobil, SVC.copieCF],
  'cat-pot-construi': [SVC.urbanism, SVC.extrasCF, SVC.identificareImobil],
  'valabilitate-documente': [SVC.cazier, SVC.extrasCF, SVC.constatator],
  'cost-cadastru-intabulare': [SVC.extrasCF, SVC.copieCF, SVC.identificareImobil],
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
  'amenda-circulatie': [SVC.rovinietaTool, SVC.cazierAuto, SVC.cazier],
  'calculator-impozit-auto': [SVC.rovinietaTool, SVC.rovinieta, SVC.cazierAuto],
  // Muncă / angajare → cazier
  'salariu': [SVC.cazier, SVC.cazierFiscal],
  'spor-salarial': [SVC.cazier, SVC.constatator],
  'vechime-in-munca': [SVC.cazier, SVC.extrasCF],
  'zile-concediu-odihna': [SVC.cazier, SVC.constatator],
  'indemnizatie-somaj': [SVC.cazier, SVC.cazierFiscal],
  // Pensii → acte de stare civilă. Calculatoarele de pensie sunt al treilea bloc
  // de trafic al site-ului (~32k clicuri/3 luni în GSC) și cădeau pe setul
  // DEFAULT (cazier / extras CF / constatator), irelevant pentru publicul lor.
  // Dosarul de pensie cere certificat de naștere, plus cel de căsătorie când
  // numele diferă; pentru stagiul lucrat în UE se cere extrasul multilingv.
  'varsta-pensionare': [SVC.nastere, SVC.casatorie, SVC.multilingvNastere],
  'pensie-invaliditate': [SVC.nastere, SVC.casatorie, SVC.multilingvNastere],
  'estimare-pensie': [SVC.nastere, SVC.casatorie, SVC.multilingvNastere],
  'impozit-pensie': [SVC.nastere, SVC.casatorie],
  'concediu-medical': [SVC.nastere, SVC.cazier],
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
  dateModified,
}: CalculatorLayoutProps) {
  const url = `${BASE_URL}/calculator/${slug}/`;
  const dataActualizarii = dateModified ?? DATE_MODIFIED_DEFAULT;
  const relatedCalcs = relatedCalculators(slug);
  const actualizat = lunaAnul(dataActualizarii);
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
        dateModified: dataActualizarii,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'RON' },
        provider: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        inLanguage: 'ro-RO',
        dateModified: dataActualizarii,
        lastReviewed: dataActualizarii,
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
            <p className="mt-3 text-sm text-white/55">Verificat de Echipa eGhișeul.ro · actualizat {actualizat} · rate și praguri 2026</p>
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

        {/* Calculatoare înrudite — vezi nota de la CALC_CLUSTERS. */}
        {relatedCalcs.length > 0 && (
          <section className="py-10 bg-white border-t border-neutral-200">
            <div className="container mx-auto px-4 max-w-[820px]">
              <h2 className="text-lg lg:text-xl font-bold text-secondary-900 mb-4">
                Calculatoare înrudite
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedCalcs.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
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
      <NewsletterPopup />
      <WebMcpTools />
    </>
  );
}
