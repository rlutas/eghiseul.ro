import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Clock,
  Shield,
  CheckCircle,
  ChevronRight,
  Home,
  MapPin,
  Search,
  Mail,
  Landmark,
  ScrollText,
  KeyRound,
  Map as MapIcon,
  Layers,
  Ruler,
} from 'lucide-react';
import { Service, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ReviewsSection } from '@/components/services/reviews-section';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { SystemStatus } from '@/components/services/system-status';
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';
import { getImobiliareServices } from '@/lib/services/imobiliare';
import { ServiceSwitcher } from '@/components/services/service-switcher';
import { PrivateServiceNotice } from '@/components/services/private-service-notice';
import { RelatedServicesLinks } from '@/components/services/related-services-links';

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'copie-releveu';
const PAGE_PATH = '/servicii/copie-releveu/';
const SCHEMA_SLUG = 'copie-releveu';
const TITLE = 'Copie după Releveu Apartament — Plan de Nivel OCPI';
const DESCRIPTION =
  'Copie certificată după releveul apartamentului din arhiva OCPI: planul cu dispunerea camerelor, ' +
  'suprafețele utile per încăpere și dimensiunile interioare. Taxe incluse, 100% online, livrare pe email, fără cont ANCPI.';
const DATE_PUBLISHED = '2026-06-25';
const DATE_MODIFIED = '2026-06-25';

export const revalidate = 3600;

async function getService(): Promise<Service | null> {
  const supabase = createPublicClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', SERVICE_SLUG)
    .eq('is_active', true)
    .single();

  if (error || !service) return null;

  return service as Service;
}

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/default.png',
});

const buildJsonLd = (basePrice: number) => buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Copie după Releveu',
  description:
    'Serviciu de obținere a copiei certificate după releveul imobilului din arhiva OCPI: planul cu dispunerea ' +
    'camerelor unui apartament sau spațiu, suprafețele utile per încăpere și dimensiunile interioare. ' +
    '100% online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Copie după Releveu', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie după Releveu', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function CopieReleveuPage() {
  const service = await getService();
  // Schema price follows the DB (admin-editable) — hardcodat doar fallback-ul.
  const jsonLdGraph = buildJsonLd(Number(service?.base_price ?? 119));
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Ways to identify the property
  const identifiers = [
    { icon: KeyRound, title: 'Numărul unității individuale', desc: 'La apartamente are formă compusă, de tipul 12783-C1-U4: teren, construcție, unitate.' },
    { icon: ScrollText, title: 'Numărul de carte funciară', desc: 'CF-ul apartamentului, nu cel al blocului. Îl găsești pe extrasul tău sau în contract.' },
  ];

  const useCases = [
    { icon: Landmark, title: 'Credit ipotecar', items: ['Cerut de bancă la dosar', 'Baza raportului de evaluare', 'Locuința adusă în garanție'] },
    { icon: Ruler, title: 'Recompartimentare', items: ['Arhitectul pleacă de la el', 'Pereți portanți și despărțitori', 'Situația de dinainte de lucrări'] },
    { icon: Home, title: 'Vânzare de apartament', items: ['Anexă la dosarul notarial', 'Suprafața utilă, pe camere', 'Cumpărătorul vede structura'] },
    { icon: Layers, title: 'Partaj sau ieșire din indiviziune', items: ['Împărțeală între moștenitori', 'Separare după divorț', 'Discuție pe camere, nu pe vorbe'] },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-16 lg:pb-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[1280px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/servicii/" className="hover:text-primary-500 transition-colors">Servicii</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Copie după Releveu</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Layers className="h-3.5 w-3.5 mr-1" />
                    Plan de nivel
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie după Releveu{' '}
                  <span className="block text-primary-500">Plan de Nivel Apartament</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Singurul plan care intră în apartament: pereții, camerele și câți metri pătrați are fiecare.
                  Îl scoatem pentru tine din dosarul depus la OCPI, fără să te deplasezi.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Ruler className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Banca și evaluatorul cer releveul aproape de fiecare dată la un credit ipotecar. Tot pe el
                    lucrează arhitectul înainte de o recompartimentare și tot el arată{' '}
                    <strong className="text-primary-500">suprafața utilă reală</strong> a locuinței.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> copia după releveu:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numărul unității individuale sau numărul de CF',
                      'Spui în ce localitate se află blocul',
                      'Plătești din browser sau direct din telefon',
                      'Planșa îți vine pe email, în format electronic',
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        TAXE OCPI INCLUSE
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl lg:text-6xl font-black text-white">{fmt(priceExVat)}</span>
                        <span className="text-xl font-bold text-white/70">RON</span>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        + TVA 21% · <span className="font-semibold text-white">{fmt(priceWithVat)} RON</span> cu TVA
                      </p>
                      <p className="text-white/50 text-xs mt-1">Fără taxe ascunse</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Procesat de un operator</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Releveu — plan de nivel</p>
                      </div>
                    </div>

                    {/* Lucrarea trece prin e-Terra — în timpul unei căderi ANCPI clientul
                        trebuie să vadă asta înainte să plătească. */}
                    <SystemStatus service="ancpi" autoIssued={false} compact className="mb-3" />
                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">Comandă Acum</OrderButton>

                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Document</span>
                      </div>
                    </div>

                    <GoogleReviewsBadge variant="bar" className="mt-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PrivateServiceNotice
          institutionLabel="direct la OCPI/ANCPI"
          institutionUrl="https://www.ancpi.ro/"
        />


        {/* Trust strip */}
        <section className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 max-w-[1100px] py-6 lg:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Landmark, value: 'OCPI', label: 'Plan de nivel' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Releveu apartament' },
                { icon: CheckCircle, value: '4.9/5', label: 'Peste 450 recenzii' },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center">
                    <t.icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="text-base lg:text-lg font-extrabold text-secondary-900 leading-tight">{t.value}</p>
                  <p className="text-xs text-neutral-500 leading-tight">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service switcher — jump between cadastral services (cfunciara-style) */}
        {switcherServices.length > 1 && (
          <section className="bg-white border-b border-neutral-200">
            <div className="container mx-auto px-4 max-w-[820px] py-6">
              <ServiceSwitcher services={switcherServices} currentSlug={SERVICE_SLUG} mode="page" className="max-w-md" />
            </div>
          </section>
        )}

        {/* SEO Intro */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Releveul e singurul plan care intră în apartament
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Toate celelalte planșe cadastrale se opresc la conturul exterior al imobilului. Releveul trece de el
                și desenează interiorul unei unități individuale: apartament, spațiu comercial, mansardă. Vezi pereții,
                camerele și câți metri pătrați are fiecare. Planșa a fost măsurată de inginerul cadastral la
                întocmirea documentației și a rămas în dosarul de la Oficiul de Cadastru și Publicitate Imobiliară
                (<strong>OCPI / ANCPI</strong>). Noi îți aducem o copie a ei.
              </p>
              <p>
                Pe planșă apar conturul fiecărei încăperi cu denumirea ei, suprafața utilă în metri pătrați pentru
                fiecare, dimensiunile interioare și, la final, un tabel cu recapitulația suprafețelor. Sus sunt
                adresa imobilului, numărul de carte funciară și numărul unității. Mulți proprietari îi spun pur și
                simplu schița apartamentului.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Cine îl cere, în ordinea în care ni se cere nouă
              </h3>
              <p>
                Prima poziție o ocupă <strong>banca</strong>. La un credit ipotecar, evaluatorul lucrează pe releveu
                ca să confirme structura și suprafața locuinței aduse în garanție, iar dosarul stă în loc până apare.
                Pe locul doi vine <strong>arhitectul sau proiectantul</strong>, înainte de o recompartimentare: are
                nevoie să vadă cum arăta apartamentul în forma lui înregistrată. Apoi{' '}
                <strong>notarul</strong>, ca anexă la un dosar de vânzare, și{' '}
                <strong>partajele</strong> — moștenitori care împart un apartament sau foști soți care ies din
                indiviziune, unde discuția devine mult mai scurtă când există un desen cu camerele pe el.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Confuzia numărul unu: releveu sau plan cadastral
                </h3>
                <p className="text-sm text-neutral-700">
                  Sunt planșe din același dosar, dar răspund la întrebări diferite.{' '}
                  <strong>Planul cadastral</strong> arată unde stă imobilul pe hartă și ce contur exterior are.{' '}
                  <strong>Releveul</strong> arată cum e împărțit pe dinăuntru. Pentru un apartament de bloc, planul
                  cadastral îți dă poziția blocului și a terenului de sub el, ceea ce în general nu ajută pe nimeni
                  la un credit; releveul e cel cerut.{' '}
                  <Link href={serviceUrl('copie-plan-cadastral')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi copia planului cadastral
                  </Link>
                  .
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu dovedește releveul
              </h3>
              <p>
                Nu spune cine este proprietarul și nu ține loc de act de proprietate. Nu autorizează nicio lucrare:
                dacă vrei să muți un perete, releveul e punctul de plecare al proiectului, nu aprobarea lui. Și,
                cel mai important, arată apartamentul <strong>așa cum a fost măsurat atunci</strong>. Dacă ai
                desființat o debara acum patru ani, planșa din arhivă nu știe. Ca desenul să prindă modificarea, ea
                trebuie mai întâi înscrisă printr-o documentație cadastrală nouă.
              </p>
              <p>
                Merită știut și de ce cifrele nu se potrivesc cu anunțul imobiliar. Releveul lucrează cu{' '}
                <strong>suprafața utilă</strong>, măsurată între pereți, în timp ce anunțurile folosesc de obicei
                suprafața construită, care include pereții și cotele din părțile comune. Diferența de câțiva metri
                pătrați între cele două nu este o greșeală, ci două convenții de măsurare diferite.
              </p>
              <p>
                Mai există și cazul în care planșa lipsește. La imobile înscrise în cărți funciare vechi, deschise
                încă din perioada austro-ungară, dosarul poate să nu conțină un releveu avizat. Când dăm de o
                asemenea situație îți spunem ce am găsit în dosar înainte să mergem mai departe cu comanda.
              </p>
              <p>
                Ne trebuie numărul unității individuale sau numărul de carte funciară al apartamentului, plus
                localitatea. Dacă ai numai adresa, îl scoatem întâi prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                . Iar dacă ai nevoie și de situația juridică a locuinței, ea vine separat, prin{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extrasul de carte funciară
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Identifiers */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Ce îți trebuie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Datele apartamentului de care avem nevoie
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ne interesează unitatea, nu blocul. Un singur număr ne este de ajuns.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {identifiers.map((it) => (
                <div key={it.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <it.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{it.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-primary-50 rounded-2xl border border-primary-200 max-w-2xl mx-auto flex items-start gap-3">
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-secondary-700">
                <strong>Ai numai adresa și etajul?</strong> Scoatem întâi numărul unității prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi cerem planșa.
              </p>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Când ai nevoie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Patru dosare în care planșa e cerută explicit
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <uc.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{uc.title}</h3>
                  <div className="space-y-2">
                    {uc.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — dark connected timeline (CF parity) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] py-14 lg:py-24">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-500/15 text-primary-400 text-sm font-semibold rounded-full mb-4 border border-primary-500/30">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">Cum Funcționează?</h2>
              <p className="text-white/70 max-w-2xl mx-auto">Patru pași, fără drum la ghișeul OCPI</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Numărul unității', desc: 'Numărul apartamentului din evidență sau CF-ul lui.', icon: KeyRound },
                { step: 2, title: 'Unde e blocul', desc: 'Județul și localitatea. Le potrivim cu evidența înainte de depunere.', icon: MapPin },
                { step: 3, title: 'Plata', desc: 'Card sau plată din telefon, totul într-o singură tranșă.', icon: Shield },
                { step: 4, title: 'Planșa pe email', desc: `Îți ajunge în ${formatEstimatedDays(service)}, în format electronic.`, icon: CheckCircle },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_8px_24px_rgba(236,185,95,0.35)]">
                    <item.icon className="h-7 w-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-secondary-900 shadow-md">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* Related — cross-link to imobiliare services */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Ce se mai cere împreună cu releveul
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={serviceUrl('copie-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie după Planul Cadastral</p>
                  <p className="text-sm text-neutral-600">Planul imobilului din dosarul cadastral OCPI.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Situația juridică: proprietar, suprafață, sarcini.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('plan-amplasament-delimitare')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Ruler className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Plan de Amplasament și Delimitare</p>
                  <p className="text-sm text-neutral-600">Conturul și limitele imobilului, cu coordonate.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Ce ne întreabă lumea despre releveu"
          faqs={[
            { q: 'De ce îmi cere banca releveul la creditul ipotecar?', a: 'Pentru că evaluatorul are nevoie de compartimentarea și de suprafața utilă a locuinței pe care o iei în garanție, iar releveul este singura planșă din dosarul cadastral care le arată. Fără el, raportul de evaluare nu se poate încheia, și dosarul stă.' },
            { q: 'Suprafața din releveu nu se potrivește cu cea din anunț. Care e greșită?', a: 'Niciuna. Releveul măsoară suprafața utilă, adică ce este între pereți. Anunțurile imobiliare folosesc de obicei suprafața construită, care include grosimea pereților și cotele din părțile comune. De aici diferența de câțiva metri pătrați.' },
            { q: 'Am scos un perete acum câțiva ani. Releveul din arhivă arată situația de acum?', a: 'Nu. Planșa arată apartamentul așa cum a fost măsurat la data documentației. Modificările intră în evidență doar dacă au fost înscrise printr-o documentație cadastrală nouă. Dacă nu s-a făcut, primești desenul dinaintea lucrărilor.' },
            { q: 'Îmi trebuie releveu sau plan cadastral?', a: 'Dacă întrebarea ta este cum arată apartamentul pe dinăuntru, releveu. Dacă întrebarea este unde se află imobilul pe hartă și ce contur are, plan cadastral. Pentru un apartament de bloc, planul cadastral îți dă poziția blocului, ceea ce rareori ajută la un dosar de credit.' },
            { q: 'Numărul apartamentului arată 12783-C1-U4. E corect scris așa?', a: 'Da, așa se identifică o unitate individuală: numărul terenului, apoi construcția (C1), apoi unitatea (U4). Trimite-l exact în forma în care apare pe extras sau în contract, cu tot cu liniuțe.' },
            { q: 'Ce se întâmplă dacă în arhivă nu există releveu pentru apartament?', a: 'Se întâmplă la imobile din cărți funciare vechi, unde dosarul nu conține o planșă avizată. În cazul ăsta îți spunem exact ce am găsit în dosarul cadastral înainte să continuăm, ca să decizi tu dacă mai are rost comanda.' },
            { q: 'Cât costă și sub ce formă îmi ajunge?', a: `${service.base_price} RON, cu tot cu ce achită operatorul la instituție. Planșa vine electronic, pe email, în ${formatEstimatedDays(service)}, gata de tipărit pentru dosarul de la bancă sau pentru cel notarial.` },
          ]}
        />

        {/* CTA */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[900px]">
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
                Ai nevoie de planul apartamentului?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ne trebuie numărul unității sau CF-ul ei, plus localitatea. Planșa ajunge pe email în {formatEstimatedDays(service)}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </section>
        <RelatedServicesLinks services={switcherServices} currentSlug={SERVICE_SLUG} />

      </main>

      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />

      <Footer />
    </>
  );
}
