import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  Search,
  CalendarClock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ErovinietaEmbed } from '@/components/tools/erovinieta-embed';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';

const PAGE_PATH = '/tools/verificare-rovinieta-online/';
const TITLE = 'Verificare Rovinietă Online — Gratuit, După Număr';
const DESCRIPTION =
  'Verifică gratuit valabilitatea rovinietei online, după numărul de înmatriculare, ' +
  'fără serie de șasiu. Afli instant dacă mașina are rovinietă validă și până când expiră.';
const DATE_MODIFIED = '2026-06-22';
const ACTUALIZAT = 'iunie 2026';

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/verificare-rovinieta.png',
});

const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    {
      ...breadcrumbNode([
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Instrumente', url: `${BASE_URL}/tools/` },
        { name: 'Verificare Rovinietă Online', url: PAGE_URL },
      ]),
      '@id': `${PAGE_URL}#breadcrumb`,
    },
    {
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#tool`,
      name: 'Verificare Rovinietă Online',
      url: PAGE_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      inLanguage: 'ro-RO',
      isAccessibleForFree: true,
      dateModified: DATE_MODIFIED,
      isPartOf: { '@id': `${BASE_URL}/#website` },
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'RON' },
      description:
        'Instrument gratuit de verificare a valabilității rovinietei (vinietei) pentru ' +
        'vehiculele înmatriculate în România, după numărul de înmatriculare.',
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      inLanguage: 'ro-RO',
      dateModified: DATE_MODIFIED,
      breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
  ],
};

const INFO_CARDS = [
  { icon: Search, title: 'Cum verifici rovinieta', desc: 'Introdu numărul de înmatriculare (ex: B 123 ABC). Nu ai nevoie de seria de șasiu.' },
  { icon: CalendarClock, title: 'Valabilitate rovinietă', desc: 'Vezi instant dacă rovinieta este validă și data exactă până la care expiră.' },
  { icon: ShieldCheck, title: 'Date oficiale CNAIR', desc: 'Rezultatul se bazează pe evidența oficială a rovinietelor din România.' },
];

const FAQS = [
  { q: 'Cum verific rovinieta online?', a: 'Introdu numărul de înmatriculare al vehiculului în câmpul din instrument și apasă verifică. Rezultatul îți arată dacă rovinieta este validă și până când expiră.' },
  { q: 'Pot verifica rovinieta fără seria de șasiu?', a: 'Da. Verificarea se face doar după numărul de înmatriculare — nu ai nevoie de seria de șasiu.' },
  { q: 'Verificarea rovinietei este gratuită?', a: 'Da, verificarea valabilității rovinietei este gratuită și nelimitată.' },
  { q: 'De unde vin datele?', a: 'Rezultatul se bazează pe evidența oficială a rovinietelor administrată de CNAIR.' },
  { q: 'Cât este valabilă rovinieta?', a: 'Rovinieta se poate cumpăra pe diferite perioade (de la o zi până la 12 luni). Verificarea îți arată data exactă de expirare pentru vehiculul căutat.' },
  { q: 'Ce risc dacă circul fără rovinietă?', a: 'Circulația pe drumurile naționale fără rovinietă validă se sancționează cu amendă. Verifică din timp și cumpără rovinieta înainte să expire.' },
];

export default function VerificareRovinietaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-24 lg:pb-32">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link href="/tools/" className="hover:text-primary-500 transition-colors">Instrumente</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white/80">Verificare Rovinietă</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Search className="w-3.5 h-3.5" /> Instrument gratuit
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Verificare Rovinietă Online
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Verifică <strong className="text-primary-500">gratuit</strong> dacă o mașină are rovinietă validă
              și până când expiră — după numărul de înmatriculare, fără serie de șasiu.
            </p>
            <p className="mt-3 text-sm text-white/55">Date oficiale CNAIR · serviciu informativ gratuit · actualizat {ACTUALIZAT}</p>
          </div>
        </header>

        {/* Widget — overlaps hero (ca la calculatoare) */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            {/* Embed-ul erovinieta vine deja ca un card alb — NU îl mai învelim într-un
                al doilea card; păstrăm doar overlap-ul peste hero (ca la calculatoare). */}
            <div className="relative -mt-16 lg:-mt-20">
              <ErovinietaEmbed />
            </div>
            <div className="mt-5 rounded-2xl border-l-4 border-primary-500 bg-primary-50/60 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">Pe scurt</p>
              <p className="text-[15px] leading-relaxed text-secondary-800">
                Introdu numărul de înmatriculare (fără serie de șasiu) și afli instant, gratuit, dacă vehiculul are
                rovinietă validă și data exactă de expirare. Datele provin din evidența oficială CNAIR.
              </p>
            </div>
          </div>
        </section>

        {/* Info cards */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="grid sm:grid-cols-3 gap-5">
              {INFO_CARDS.map((c) => (
                <div key={c.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <c.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-secondary-900 mb-2">{c.title}</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO content — prose, ca la calculatoare */}
        <article className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-secondary-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-700 prose-p:leading-relaxed prose-li:text-neutral-700 prose-li:marker:text-primary-500 prose-a:text-primary-700 prose-a:font-medium prose-strong:text-secondary-900">
              <h2>Ce este rovinieta și de ce o verifici</h2>
              <p>
                <strong>Rovinieta</strong> (vinieta de drum) este taxa obligatorie de utilizare a rețelei de
                drumuri naționale din România, administrată de CNAIR. Verificarea rovinietei îți arată dacă un
                vehicul are taxa de drum plătită și valabilă — util înainte de a cumpăra o mașină second-hand,
                înainte de un drum lung sau pur și simplu ca să eviți o <strong>amendă pentru lipsa rovinietei</strong>.
              </p>
              <p>
                Poți face <strong>verificarea rovinietei după numărul de înmatriculare</strong>, fără să ai nevoie
                de seria de șasiu. Sistemul compară numărul introdus cu evidența oficială CNAIR și îți spune dacă
                rovinieta este validă și până când.
              </p>

              <div className="not-prose rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3 my-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-amber-800">
                  <strong>Rovinieta a expirat?</strong> Circulația fără rovinietă validă se sancționează cu amendă.{' '}
                  <Link href="/servicii/rovinieta-online/" className="font-semibold text-amber-900 underline">Cumpără rovinieta online</Link>{' '}
                  la timp, în câteva minute, ca să eviți amenzile.
                </p>
              </div>

              <h2>Ce afli din verificare</h2>
              <ul>
                <li>Dacă vehiculul are <strong>rovinietă validă</strong> în acest moment.</li>
                <li><strong>Data exactă de expirare</strong> a rovinietei.</li>
                <li>Verificarea se face doar după <strong>numărul de înmatriculare</strong>, fără serie de șasiu.</li>
                <li>Este <strong>gratuită, instant și nelimitată</strong>.</li>
              </ul>

              <h2>Când merită să verifici rovinieta</h2>
              <p>
                Verifică rovinieta <strong>înainte de a cumpăra o mașină second-hand</strong> (ca să știi dacă mai
                are taxa de drum plătită), <strong>înainte de un drum lung pe autostradă sau drum național</strong>,
                sau pur și simplu dacă <strong>nu mai știi când îți expiră</strong> rovinieta. Dacă a expirat sau e
                pe cale să expire, o poți cumpăra online în câteva minute.
              </p>
            </div>
          </div>
        </article>

        {/* FAQ */}
        <ServiceFAQ title="Întrebări Frecvente — Verificare Rovinietă" faqs={FAQS} />

        {/* CTA */}
        <section className="relative py-14 lg:py-20 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px] text-center">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">Rovinieta a expirat sau e pe cale să expire?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Cumpără rovinieta online în câteva minute, cu activare imediată — fără drumuri la ghișeu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200">
                <Link href="/servicii/rovinieta-online/">Cumpără rovinieta online <ChevronRight className="w-5 h-5 ml-1" /></Link>
              </Button>
            </div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/55">
              <CheckCircle className="w-4 h-4 text-primary-400" /> Verificarea rămâne gratuită oricând ai nevoie.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
