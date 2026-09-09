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
const SERVICE_SLUG = 'copie-intabulare';
const PAGE_PATH = '/servicii/copie-intabulare/';
const SCHEMA_SLUG = 'copie-intabulare';
const TITLE = 'Copie Act de Intabulare din Cartea Funciară (OCPI)';
const DESCRIPTION =
  'Copie certificată a încheierii de intabulare din arhiva OCPI, care dovedește înscrierea dreptului ' +
  'de proprietate în cartea funciară. Taxe OCPI incluse, totul online, livrare pe email.';
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
  name: 'Copie Intabulare',
  description:
    'Serviciu prin care obții copia certificată a încheierii de intabulare din arhiva OCPI, ' +
    'documentul care arată că dreptul de proprietate a fost înscris în cartea funciară. ' +
    'Totul online, fără cont ANCPI, cu livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Copie Intabulare', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie Intabulare', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function CopieIntabularePage() {
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
    { icon: ScrollText, title: 'Numărul cărții funciare', desc: 'Cel din care s-a făcut înscrierea. Îl vezi pe orice extras mai vechi.' },
    { icon: KeyRound, title: 'Numărul cadastral', desc: 'Merge și el, dacă CF-ul nu îl mai găsești prin acte.' },
    { icon: Layers, title: 'Numărul încheierii, dacă îl ai', desc: 'Nu e obligatoriu, dar cu el operatorul nimerește direct fila căutată.' },
  ];

  const useCases = [
    { icon: Landmark, title: 'Banca cere dovada înscrierii', items: ['Constituirea ipotecii', 'Tragerea creditului', 'Verificarea garanției'] },
    { icon: Search, title: 'Ai pierdut actele', items: ['Nu mai știi ce ai semnat', 'Nu mai știi când', 'Registrul păstrează amândouă'] },
    { icon: Shield, title: 'Dispută pe proprietate', items: ['Când s-a înscris dreptul', 'În baza cărui titlu', 'În ce cotă'] },
    { icon: ScrollText, title: 'Dosar de succesiune', items: ['Cum a dobândit defunctul', 'Actul din spatele înscrierii', 'Transmiterea către moștenitori'] },
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
              <span className="text-white font-medium">Copie Intabulare</span>
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
                    Cu încheierea de intabulare
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie Intabulare{' '}
                  <span className="block text-primary-500">din Cartea Funciară</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Actul prin care registratorul de carte funciară a hotărât că dreptul tău intră în registru.
                  Îl scoatem din arhiva OCPI, cu număr, dată și soluție cu tot.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <ScrollText className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Un extras spune cine e proprietar acum. Încheierea spune{' '}
                    <strong className="text-primary-500">când și pe ce temei</strong> a devenit. Diferența contează
                    la bancă, în instanță și <strong>când nu mai ai actele</strong>.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> copia de intabulare:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai CF-ul, numărul cadastral sau pe cel al încheierii',
                      'Precizezi județul și localitatea',
                      'Achiți suma afișată, fără costuri adăugate ulterior',
                      'Îți trimitem încheierea scanată, pe email',
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
                        <p className="text-xs text-neutral-500">Copie cu încheierea de intabulare</p>
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
                { icon: Landmark, value: 'OCPI', label: 'Document din arhivă' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Cu încheierea de intabulare' },
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
              Încheierea de intabulare: decizia care a băgat dreptul în registru
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Un contract semnat la notar nu te face automat proprietar în ochii registrului. Actul se depune la
                Oficiul de Cadastru și Publicitate Imobiliară, un <strong>registrator de carte funciară</strong> îl
                analizează și, dacă totul e în regulă, dă o <strong>încheiere de intabulare</strong>. Din clipa aceea
                dreptul e înscris și devine opozabil altora. Copia de intabulare este reproducerea acelei încheieri,
                scoasă din arhiva OCPI.
              </p>
              <p>
                Pe ea găsești numărul și data de înregistrare a cererii, soluția registratorului, titularul dreptului,
                cota înscrisă și actul care a stat la baza operațiunii: contract de vânzare, donație, certificat de
                moștenitor, hotărâre judecătorească. Practic, e fișa unei singure operațiuni din viața imobilului,
                nu o privire generală asupra lui.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Când ajunge cineva să o ceară
              </h3>
              <p>
                Cel mai frecvent, la bancă. Într-un credit cu ipotecă, banca vrea negru pe alb momentul în care
                dreptul a intrat în registru, ca să știe pe ce se așază garanția ei. Al doilea caz e mult mai
                banal: oameni care și-au pierdut dosarul de la cumpărare și nu mai știu nici de la cine au luat
                imobilul, nici în ce an. Registrul le ține minte pe amândouă. Al treilea e disputa, unde întrebarea
                nu e cine e proprietar, ci <em>de când</em> și <em>în baza cărui titlu</em> — exact ce scrie în
                încheiere. Iar la succesiuni, notarul se uită la ea ca să vadă cum a dobândit defunctul.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Nu e același lucru cu contractul, deși lumea le zice la fel
                </h3>
                <p className="text-sm text-neutral-700">
                  Mulți spun „actul de intabulare” gândindu-se la contractul de vânzare. Sunt două hârtii diferite:
                  contractul e ce ai semnat la notar, încheierea e ce a decis registratorul după ce a primit
                  contractul. Dacă ai nevoie de contract, el se cere separat din arhivă.{' '}
                  <Link href={serviceUrl('copie-contract-vanzare')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi copia contractului de vânzare
                  </Link>
                  .
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu dovedește copia încheierii
              </h3>
              <p>
                Că mai ești proprietar astăzi. Încheierea îngheață un moment din trecut: la data aceea, dreptul a
                fost înscris pe numele acela. Dacă imobilul a fost vândut sau ipotecat de atunci, copia încheierii
                nu are de unde să știe. Pentru situația de acum ai nevoie de{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extrasul de carte funciară
                </Link>
                . Tot așa, încheierea nu îți spune ce sarcini apasă imobilul în prezent și nu ține loc de contract.
              </p>
              <p>
                Cererea o depune un operator de-al nostru la biroul teritorial care ține cartea funciară a
                imobilului, achită taxa și urmărește soluționarea. Tu nu ai nevoie de cont ANCPI și nici de
                semnătură electronică. Dacă nu mai ai la îndemână numărul de CF sau pe cel cadastral, îl aflăm după
                adresă prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                .
              </p>
              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce faci când imobilul are mai multe încheieri
              </h3>
              <p>
                Un imobil cu istorie strânge, în timp, mai multe încheieri: una pentru cumpărare, alta pentru
                ipotecă, alta pentru radierea ei, alta pentru o notare. Toate sunt în evidență, iar dacă ceri
                „încheierea” fără să spui care, riscăm să scoatem alta decât cea de care ai nevoie. Ajută mult
                dacă ne dai un reper: anul aproximativ, tipul operațiunii sau numele persoanei pe care s-a
                înscris dreptul. Când nu ai niciunul, spune-ne pentru ce îți trebuie documentul, fiindcă din scop
                se deduce de obicei operațiunea căutată.
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
                Cu ce date găsim încheierea în arhivă
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Oricare dintre numerele de mai jos ne pune pe drumul bun. Al treilea doar scurtează căutarea.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
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
                <strong>Nu mai ai niciun act la îndemână?</strong> Pornim de la adresă, prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi îți obținem copia de intabulare.
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
                Cine cere dovada că înscrierea s-a făcut
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
              <p className="text-white/70 max-w-2xl mx-auto">Depunem noi cererea la biroul teritorial. Tu aștepți emailul.</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Ce numere ai', desc: 'CF-ul, numărul cadastral sau numărul încheierii.', icon: KeyRound },
                { step: 2, title: 'Ce birou teritorial', desc: 'Din județ și localitate deducem unde se ține cartea funciară.', icon: MapPin },
                { step: 3, title: 'Plata', desc: 'Se face online. Ce achită operatorul la registru e deja acoperit.', icon: Shield },
                { step: 4, title: 'Încheierea scanată', desc: `Ajunge pe email în ${formatEstimatedDays(service)}, după soluționare.`, icon: CheckCircle },
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

        {/* Related — cross-link to CF + copie CF + sarcini */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Documentele care se cer alături de încheiere
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Situația juridică la zi: proprietar, suprafață, sarcini.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Copie din arhiva OCPI a întregii cărți funciare.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('certificat-sarcini')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Certificat de Sarcini</p>
                  <p className="text-sm text-neutral-600">Verifici ipoteci, interdicții și alte sarcini pe imobil.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('identificare-imobil')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Ruler className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Identificare Imobil după Adresă</p>
                  <p className="text-sm text-neutral-600">Nu știi numărul cadastral? Îl aflăm după adresă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări despre încheierea de intabulare"
          faqs={[
            { q: 'Copia încheierii dovedește că sunt proprietar astăzi?', a: 'Nu. Dovedește că la o anumită dată dreptul a fost înscris pe numele cuiva, în baza unui anumit act. Dacă imobilul a fost vândut sau grevat după aceea, încheierea nu are cum să arate. Pentru situația de acum îți trebuie extrasul de carte funciară.' },
            { q: 'Care e diferența dintre încheiere și contractul de vânzare?', a: 'Contractul este ce ai semnat la notar. Încheierea este decizia registratorului de carte funciară după ce a primit contractul și a admis cererea de înscriere. Prima creează dreptul între părți, a doua îl trece în registru. Se cer separat din arhivă.' },
            { q: 'Ce scrie, concret, pe încheiere?', a: 'Numărul și data de înregistrare a cererii, soluția registratorului, titularul dreptului, cota înscrisă și actul în temeiul căruia s-a făcut înscrierea. La imobile cu mai multe operațiuni, fiecare are încheierea ei.' },
            { q: 'Am pierdut toate actele de la cumpărare. Mă ajută?', a: 'Da, e unul dintre motivele obișnuite pentru care se cere. Din încheiere afli în ce an s-a înscris dreptul și pe baza cărui act, iar de acolo poți merge mai departe către notarul care l-a autentificat sau către copia contractului din arhivă.' },
            { q: 'Trebuie să fiu eu titularul dreptului ca să cer copia?', a: 'Nu neapărat. Încheierea face parte din evidența de carte funciară, care este publică. Dacă însă ai nevoie de actul din spatele ei, acolo intervin datele personale și regulile sunt mai stricte.' },
            { q: 'Am numărul încheierii. Ajută la ceva?', a: 'Ajută mult. Cu el operatorul merge direct la fila căutată, în loc să parcurgă toate operațiunile înscrise pe imobil. Dacă nu îl ai, ne descurcăm cu numărul de carte funciară sau cu cel cadastral.' },
            { q: 'Cât plătesc și cât aștept?', a: `${service.base_price} RON, sumă din care se achită și tariful de la registru. Operatorul depune cererea la biroul teritorial care ține cartea funciară a imobilului, iar copia îți vine pe email în ${formatEstimatedDays(service)}.` },
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
                Vrei dovada că dreptul a fost înscris?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ne ajunge un număr de CF sau unul cadastral. Încheierea îți vine pe email în {formatEstimatedDays(service)}.
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
