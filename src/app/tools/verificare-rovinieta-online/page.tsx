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

const TARIFE_AB = [
  { p: '1 zi', a: '3,5 € (≈18 lei)', b: '8,6 € (≈44 lei)' },
  { p: '10 zile', a: '6 € (≈31 lei)', b: '11,5 € (≈58 lei)' },
  { p: '30 zile', a: '9,5 € (≈48 lei)', b: '18,2 € (≈92 lei)' },
  { p: '60 zile', a: '15 € (≈76 lei)', b: '28,8 € (≈146 lei)' },
  { p: '12 luni', a: '50 € (≈255 lei)', b: '96 € (≈486 lei)' },
];

const FAQS = [
  { q: 'Cum verific rovinieta online?', a: 'Introdu numărul de înmatriculare al vehiculului în câmpul din instrument și apasă verifică. Rezultatul îți arată instant dacă rovinieta este validă și până când expiră.' },
  { q: 'Pot verifica rovinieta fără seria de șasiu?', a: 'Da. Verificarea se face doar după numărul de înmatriculare — nu ai nevoie de seria de șasiu.' },
  { q: 'Am fost prins fără rovinietă în România, ce fac?', a: 'Dacă ai fost prins fără rovinietă, trebuie să plătești amenda contravențională și să achiziționezi urgent o rovinietă pentru a evita alte sancțiuni. Persoanele fizice achită amenda la bugetul local, iar persoanele juridice la bugetul de stat.' },
  { q: 'Am nevoie de rovinietă pentru remorcă?', a: 'Nu. Rovinieta nu este necesară pentru remorcă. Aceasta se emite doar pentru numărul de înmatriculare al capului tractor.' },
  { q: 'În ce monedă se plătește rovinieta în România?', a: 'Suma afișată pentru rovinietă este în euro, dar plata se face în lei, la cursul Băncii Naționale a României (BNR). Străinii pot plăti în valute liber convertibile, la echivalentul în euro.' },
  { q: 'De unde pot cumpăra fizic rovinieta în România?', a: 'Deși rovinieta electronică a înlocuit autocolantul de pe parbriz, ea poate fi achiziționată și din locații fizice: CNAIR, Poșta Română, Banca Transilvania și benzinării (MOL, Lukoil, OMV, Rompetrol). Cel mai simplu rămâne însă online.' },
  { q: 'Verificarea rovinietei este gratuită?', a: 'Da, verificarea valabilității rovinietei este gratuită și nelimitată.' },
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
              Verifică <strong className="text-primary-500">gratuit</strong> și rapid valabilitatea rovinietei tale.
              Indiferent dacă ești persoană fizică sau juridică, afli instant dacă rovinieta este validă folosind
              doar numărul de înmatriculare.
            </p>
            <p className="mt-3 text-sm text-white/55">Date oficiale CNAIR · serviciu informativ gratuit · disponibil 24/7 · actualizat {ACTUALIZAT}</p>
          </div>
        </header>

        {/* Widget — overlaps hero (embed-ul e deja card alb; doar overlap, fără wrapper) */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20">
              <ErovinietaEmbed />
            </div>
            <div className="mt-5 rounded-2xl border-l-4 border-primary-500 bg-primary-50/60 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">Pe scurt</p>
              <p className="text-[15px] leading-relaxed text-secondary-800">
                Introdu numărul de înmatriculare (fără serie de șasiu) și afli instant, gratuit, dacă vehiculul are
                rovinietă validă și data exactă de expirare. Datele provin din evidența oficială CNAIR, iar serviciul
                e disponibil 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* Pași */}
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

        {/* SEO content — conținutul real de pe eghiseul.ro */}
        <article className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-secondary-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-neutral-700 prose-p:leading-relaxed prose-li:text-neutral-700 prose-li:marker:text-primary-500 prose-a:text-primary-700 prose-a:font-medium prose-strong:text-secondary-900 prose-table:text-sm prose-th:bg-neutral-100 prose-th:text-secondary-900 prose-td:align-top">
              <h2>Ce este rovinieta și cum verifici valabilitatea</h2>
              <h3>Definiția și importanța rovinietei</h3>
              <p>
                Rovinieta este un document electronic care atestă plata tarifului de utilizare a rețelei de drumuri
                naționale din România. Este obligatorie pentru toate vehiculele care circulă pe drumurile naționale
                și are rolul de a contribui la întreținerea și modernizarea infrastructurii rutiere. Neplata
                rovinietei poate atrage amenzi substanțiale și restricții de circulație.
              </p>
              <h3>Procesul de verificare a valabilității rovinietei online</h3>
              <p>
                Verificarea valabilității rovinietei online este un proces simplu și rapid. Poți verifica instant dacă
                rovinieta ta este validă, folosind doar numărul de înmatriculare. Serviciul este disponibil 24/7 și te
                ajută să eviți amenzile cauzate de expirarea rovinietei.
              </p>
              <p>
                Pașii sunt simpli: introduci numărul de înmatriculare, primești rezultatul verificării instant pe
                ecran și poți repeta procesul pentru a verifica o altă mașină.
              </p>

              <div className="not-prose rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3 my-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-amber-800">
                  <strong>Rovinieta a expirat?</strong> Circulația fără rovinietă validă se sancționează cu amendă.{' '}
                  <Link href="/servicii/rovinieta-online/" className="font-semibold text-amber-900 underline">Cumpără rovinieta online</Link>{' '}
                  la timp, în câteva minute, ca să eviți amenzile.
                </p>
              </div>

              <h2>Cum verific dacă am nevoie de rovinietă în România?</h2>
              <h3>Drumuri unde este necesară rovinieta</h3>
              <p>Ai nevoie de rovinietă atunci când părăsești orașul. Mai exact, rovinieta este necesară pe:</p>
              <ul>
                <li>Drumuri expres</li>
                <li>Drumuri naționale europene (E)</li>
                <li>Autostrăzi</li>
                <li>Drumuri naționale principale</li>
                <li>Drumuri naționale secundare</li>
              </ul>
              <p>Practic, rovinieta este echivalentul taxei de autostradă în România.</p>

              <h3>Drumuri unde NU este necesară rovinieta</h3>
              <p>Nu ai nevoie de rovinietă dacă circuli pe:</p>
              <ul>
                <li>Drumuri județene</li>
                <li>Drumuri comunale</li>
                <li>Drumuri naționale la trecerea prin municipii</li>
              </ul>

              <h3>Excepții de la plata rovinietei</h3>
              <p>Sunt scutite de plata rovinietei:</p>
              <ul>
                <li>Vehiculele cu numere provizorii</li>
                <li>Mașinile aflate în serviciile statului sau din ministere</li>
                <li>Vehiculele adaptate pentru persoanele cu handicap și îngrijitorii acestora (rovinietă gratuită)</li>
                <li><strong>Motocicletele</strong> — sunt scutite și nu necesită rovinietă</li>
              </ul>

              <h2>Cât costă rovinieta în 2026 (autoturisme și marfă ușoară)</h2>
              <p>
                Rovinieta se plătește în funcție de categoria vehiculului (A-H). Tarifele sunt stabilite în euro prin
                lege și se achită în lei, la cursul de referință (ianuarie 2026: 1 EUR ≈ 5,10 lei). Cele mai folosite
                sunt categoriile A (autoturisme) și B (marfă ≤ 3,5 t):
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Perioadă</th>
                    <th>Categoria A (autoturism)</th>
                    <th>Categoria B (marfă ≤ 3,5 t)</th>
                  </tr>
                </thead>
                <tbody>
                  {TARIFE_AB.map((t) => (
                    <tr key={t.p}>
                      <td>{t.p}</td>
                      <td>{t.a}</td>
                      <td>{t.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-neutral-500">
                Pentru categoriile de marfă și transport persoane peste 3,5 t (C-H), tariful crește în funcție de masă
                și numărul de axe. <strong>Atenție:</strong> de la 1 iulie 2026 tarifele se schimbă, diferențiate pe
                norma de poluare (Euro). Vezi prețul exact la finalizarea comenzii.
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
