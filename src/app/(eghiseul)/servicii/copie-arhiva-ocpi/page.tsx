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
const SERVICE_SLUG = 'copie-arhiva-ocpi';
const PAGE_PATH = '/servicii/copie-arhiva-ocpi/';
const SCHEMA_SLUG = 'copie-arhiva-ocpi';
const TITLE = 'Copie Certificată din Arhiva OCPI — Documentație Cadastrală';
const DESCRIPTION =
  'Obții o copie certificată din arhiva teritorială OCPI/BCPI: memoriu tehnic, planuri și înscrisurile care au stat ' +
  'la baza intabulării imobilului. Cauți după numărul cadastral sau de carte funciară, cu taxele OCPI incluse. Totul online, livrare pe email.';
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
  name: 'Copie certificată din arhiva OCPI',
  description:
    'Serviciu prin care obții o copie certificată din arhiva teritorială OCPI/BCPI, adică documentația ' +
    'cadastrală depusă pentru un imobil: memoriu tehnic, planuri și piese scrise care au stat la baza ' +
    'înscrierii. Online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Copie din Arhiva OCPI', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie certificată din arhiva OCPI', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function CopieArhivaOcpiPage() {
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
    { icon: KeyRound, title: 'Numărul cadastral', desc: 'Cheia după care biroul teritorial scoate dosarul de pe raft.' },
    { icon: ScrollText, title: 'Numărul de carte funciară', desc: 'Duce în același loc, dacă numărul cadastral nu îl mai ai.' },
  ];

  const useCases = [
    { icon: Ruler, title: 'Un expert are nevoie de dosarul vechi', items: ['Memoriul tehnic depus atunci', 'Calculul suprafeței', 'Baza pentru lucrarea nouă'] },
    { icon: Search, title: 'Nu știi ce piesă îți trebuie', items: ['Ai o listă de la altcineva', 'Ne spui scopul', 'Îți spunem ce se poate scoate'] },
    { icon: Layers, title: 'Instanța cere piese din dosar', items: ['Litigiu de hotar', 'Partaj', 'Expertiză tehnică judiciară'] },
    { icon: ScrollText, title: 'Verifici ce s-a depus, nu ce s-a înscris', items: ['Înscrisurile din spatele intabulării', 'Piese desenate', 'Ce a văzut registratorul'] },
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
              <span className="text-white font-medium">Copie din Arhiva OCPI</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <ScrollText className="h-3.5 w-3.5 mr-1" />
                    Copie certificată
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie Certificată{' '}
                  <span className="block text-primary-500">din Arhiva OCPI</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Serviciul pentru situațiile în care nu îți trebuie un document anume, ci ceva din dosarul
                  imobilului: memoriul tehnic, o schiță, un înscris depus la intabulare.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <ScrollText className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Dacă ai primit o listă de la un expert sau de la instanță și nu știi ce înseamnă,{' '}
                    <strong className="text-primary-500">spune-ne pentru ce îți trebuie</strong>. Ne uităm ce
                    conține dosarul și <strong>îți spunem ce se poate scoate</strong> din el.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> copia din arhivă:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numărul cadastral sau pe cel de carte funciară',
                      'Ne spui, dacă știi, ce piesă cauți și pentru ce',
                      'Achiți abia după ce știm ce se poate scoate',
                      'Îți trimitem piesele scanate, pe email',
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
                        <p className="text-xs text-neutral-500">Copie certificată din dosarul cadastral</p>
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
                { icon: Landmark, value: 'OCPI', label: 'Arhivă teritorială' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Copie certificată' },
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
              Când îți trebuie ceva din dosar, dar nu știi cum se numește
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Fiecare imobil intabulat are la biroul teritorial de cadastru un dosar fizic, în care a rămas tot
                ce s-a depus la lucrarea de cadastru: memoriul tehnic, piesele desenate, calculul analitic al
                suprafeței și înscrisurile care au stat la baza înscrierii. Celelalte servicii de pe site scot din
                dosarul acesta câte o piesă anume. Serviciul de față e pentru restul, adică pentru ce nu are un nume
                pe care să îl cauți pe internet.
              </p>
              <p>
                Situația tipică arată așa: un expert, un avocat sau o instanță ți-a cerut ceva, tu ai notat pe un
                bilețel, iar acum te uiți la o listă de servicii și niciunul nu se potrivește exact. Scrie-ne ce ai
                notat și pentru ce îți trebuie. Ne uităm ce conține dosarul imobilului și îți spunem ce se poate
                scoate din el, înainte să plătești ceva.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Ce se găsește, de obicei, în dosar
                </h3>
                <p className="text-sm text-neutral-700">
                  Memoriul tehnic al lucrării, piesele desenate depuse la recepție, calculul analitic al suprafeței
                  și înscrisurile pe baza cărora s-a făcut intabularea: contracte, hotărâri judecătorești,
                  certificate de moștenitor, acte administrative. Ce anume există concret ține de vechimea lucrării
                  și de cine a întocmit-o, așa că verificarea se face de la caz la caz.
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Cine cere piese din dosar
              </h3>
              <p>
                În primul rând, <strong>experții cadastrali</strong>. Când începe o dezmembrare, o alipire sau o
                reactualizare, expertul vrea să vadă ce s-a măsurat și ce s-a depus prima dată, ca să nu pornească
                de la zero. În al doilea rând, <strong>instanțele și experții judiciari</strong>, într-un litigiu
                de hotar sau într-un partaj, unde conteaza ce piese a avut în față registratorul. Și, destul de
                des, <strong>proprietarii care și-au pierdut documentația</strong> și au nevoie de ea ca să poată
                merge mai departe cu o lucrare nouă.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu îți dă serviciul
              </h3>
              <p>
                Nu îți dă situația juridică la zi. Dosarul conține ce s-a depus, nu ce s-a înscris ulterior în
                registru, așa că nu îl folosi ca să afli cine e proprietar acum sau ce ipoteci există. Pentru asta
                există{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extrasul de carte funciară
                </Link>
                . Și nu îți garantează că piesa de care ai tu nevoie chiar există: la lucrări vechi, dosarele sunt
                subțiri. Când nu găsim ce ai cerut, îți spunem înainte, nu după.
              </p>
              <p>
                Dacă știi deja ce vrei, comanzi direct piesa respectivă și de obicei iese mai simplu: planul
                cadastral, planul de amplasament, releveul, încheierea de intabulare sau contractul au fiecare
                pagina lor. Iar dacă nu cunoști numărul cadastral, îl aflăm după adresă prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                .
              </p>
              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce să scrii când ne ceri ceva din dosar
              </h3>
              <p>
                Cele mai bune cereri arată așa: „mi-a cerut expertul memoriul tehnic al lucrării din 2009” sau
                „instanța vrea piesele pe baza cărora s-a intabulat”. Adică cine cere și pentru ce. Cele mai grele
                sunt cele de tipul „vreau tot dosarul”, fiindcă nici noi, nici biroul teritorial nu știm ce
                înseamnă „tot” în cazul tău, iar costul crește fără rost. Dacă ai primit o listă scrisă de
                altcineva, trimite-o ca atare, chiar dacă ție nu îți spune nimic. De obicei termenii de acolo sunt
                exact denumirile pieselor din dosar.
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
                Cu ce scoatem dosarul de pe raft
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Un număr și localitatea. Ce piesă cauți ne poți spune și pe parcurs.
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
                <strong>Ai doar adresa imobilului?</strong> Îl aflăm prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi căutăm dosarul în arhivă.
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
                Cine ne cere piese din dosarul cadastral
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
              <p className="text-white/70 max-w-2xl mx-auto">Cu o discuție înainte, dacă nu ești sigur ce cauți</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Numărul imobilului', desc: 'Cheia cu care se scoate dosarul fizic de pe raft.', icon: KeyRound },
                { step: 2, title: 'Pentru ce îți trebuie', desc: 'Ne spui scopul, ca să știm ce piesă să căutăm în dosar.', icon: MapPin },
                { step: 3, title: 'Plata', desc: 'O sumă unică, din care se achită și tariful instituției.', icon: Shield },
                { step: 4, title: 'Piesele scanate', desc: `Ajung pe email în ${formatEstimatedDays(service)}.`, icon: CheckCircle },
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

        {/* Related — cross-link to other imobiliare copy services */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Dacă știi exact ce piesă vrei
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={serviceUrl('copie-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Reproducere conformă a cărții funciare a imobilului.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Plan Cadastral</p>
                  <p className="text-sm text-neutral-600">Reprezentarea grafică a imobilului din dosarul cadastral.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-contract-vanzare')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Contract de Vânzare</p>
                  <p className="text-sm text-neutral-600">Înscrisul care a stat la baza intabulării proprietății.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări despre piesele din dosarul cadastral"
          faqs={[
            { q: 'Nu știu cum se numește ce mi s-a cerut. Ce fac?', a: 'Scrie-ne exact cuvintele pe care le-ai notat și pentru ce îți trebuie: o expertiză, o dezmembrare, un dosar la instanță. De cele mai multe ori din scop se deduce piesa. Ne uităm ce conține dosarul imobilului și îți spunem ce se poate scoate, înainte să plătești.' },
            { q: 'Ce se găsește într-un dosar cadastral?', a: 'Memoriul tehnic al lucrării, piesele desenate depuse la recepție, calculul analitic al suprafeței și înscrisurile pe baza cărora s-a intabulat: contracte, hotărâri, certificate de moștenitor. Cât de complet e dosarul ține de vechimea lucrării și de cine a întocmit-o.' },
            { q: 'Ce se întâmplă dacă piesa cerută nu există în dosar?', a: 'Se întâmplă, mai ales la lucrări vechi. Îți spunem ce am găsit înainte să mergem mai departe, ca să decizi tu dacă mai are rost comanda. Nu trimitem altceva în loc.' },
            { q: 'Nu e mai simplu să comand direct planul sau releveul?', a: 'Ba da, dacă știi exact ce vrei. Planul cadastral, planul de amplasament, releveul, încheierea de intabulare și contractul au fiecare pagina lor și un traseu mai scurt. Serviciul acesta e pentru ce nu intră în categoriile alea.' },
            { q: 'Din dosar aflu cine e proprietarul acum?', a: 'Nu. Dosarul conține ce s-a depus la lucrare, nu ce s-a înscris ulterior în registru. Proprietarul curent și sarcinile se citesc în cartea funciară, deci ai nevoie de extrasul de carte funciară.' },
            { q: 'Pot folosi piesele într-un dosar la instanță?', a: 'Da. Copiile scoase din arhivă sunt confirmate de OCPI și se depun ca atare la dosar, la expertiză sau în relația cu alte instituții. Ce greutate au în cauză rămâne o chestiune de apreciere a instanței.' },
            { q: 'Cât costă o piesă și de când se numără termenul?', a: `${service.base_price} RON pentru o piesă din dosar, cu tariful instituției acoperit. Termenul de ${formatEstimatedDays(service)} se numără din momentul în care am stabilit împreună ce anume căutăm, nu de la plasarea comenzii.` },
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
                Nu ești sigur ce document ți se cere?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Scrie-ne ce ți s-a cerut și pentru ce. Ne uităm în dosar și îți spunem ce se poate scoate, în {formatEstimatedDays(service)}.
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
