import Link from 'next/link';
import { ChevronRight, Ticket, Calculator, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';

const PAGE_PATH = '/tools/';
const TITLE = 'Instrumente Online Gratuite — eGhișeul.ro';
const DESCRIPTION =
  'Instrumente online gratuite de la eGhișeul.ro: verificare rovinietă după număr și ' +
  'calculatoare fiscale, salariale și juridice actualizate pentru 2026.';

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
});

const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

const TOOLS = [
  {
    icon: Ticket,
    title: 'Verificare Rovinietă Online',
    desc: 'Verifică gratuit, după numărul de înmatriculare, dacă o mașină are rovinietă validă și până când expiră.',
    href: '/tools/verificare-rovinieta-online/',
    cta: 'Verifică rovinieta',
  },
  {
    icon: Calculator,
    title: 'Calculatoare 2026',
    desc: '36 de calculatoare gratuite — salariu net, impozit auto, vârstă de pensionare, TVA, taxe notariale și altele, actualizate pentru 2026.',
    href: '/calculator/',
    cta: 'Vezi calculatoarele',
  },
];

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    {
      ...breadcrumbNode([
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Instrumente', url: PAGE_URL },
      ]),
      '@id': `${PAGE_URL}#breadcrumb`,
    },
    {
      '@type': 'CollectionPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ro-RO',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
    },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-20 lg:pb-28">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white/80">Instrumente</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Ticket className="w-3.5 h-3.5" aria-hidden="true" /> Gratuite
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Instrumente online gratuite
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Verifică rapid informații oficiale și fă calcule corecte, gratuit — fără cont și fără drumuri la ghișeu.
            </p>
          </div>
        </header>

        {/* Tools grid */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="relative -mt-12 lg:-mt-16 grid sm:grid-cols-2 gap-5">
              {TOOLS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg hover:border-primary-300 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <t.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold text-secondary-900 mb-2">{t.title}</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">{t.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:gap-2.5 transition-all">
                    {t.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Intro content */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[760px]">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Ce instrumente găsești aici</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              eGhișeul.ro pune la dispoziție instrumente online gratuite care te ajută să economisești timp. Poți
              <strong> verifica gratuit valabilitatea rovinietei</strong> după numărul de înmatriculare, fără serie de
              șasiu, sau poți folosi <strong>calculatoarele actualizate pentru 2026</strong> ca să afli rapid salariul
              net, impozitul auto, vârsta de pensionare, taxele notariale și multe altele.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              Toate instrumentele sunt gratuite, nu necesită cont și folosesc date oficiale și formule la zi. Dacă ai
              nevoie să obții un <Link href="/servicii/" className="text-primary-700 font-medium underline">document oficial</Link>,
              îți gestionăm întreaga procedură 100% online.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
