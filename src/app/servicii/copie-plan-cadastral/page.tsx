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
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';
import { getImobiliareServices } from '@/lib/services/imobiliare';
import { ServiceSwitcher } from '@/components/services/service-switcher';

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'copie-plan-cadastral';
const PAGE_PATH = '/servicii/copie-plan-cadastral/';
const SCHEMA_SLUG = 'copie-plan-cadastral';
const TITLE = 'Copie Plan Cadastral din Arhiva OCPI (ANCPI)';
const DESCRIPTION =
  'Copie certificată a planului cadastral din arhiva OCPI: planul de situație înregistrat la recepția ' +
  'cadastrală, obținut după numărul cadastral sau de carte funciară. Taxe OCPI incluse, fără cont ANCPI, ' +
  'livrare pe email.';
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
  name: 'Copie Plan Cadastral',
  description:
    'Serviciu de obținere a copiei certificate a planului cadastral din arhiva OCPI / ANCPI: planul de ' +
    'situație înregistrat la recepția cadastrală a imobilului, util pentru documentații tehnice, autorizații ' +
    'și dosare notariale. Online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  reviewedBy: {
    name: 'Departamentul Juridic eGhișeul.ro',
    jobTitle: 'Echipă de specialiști drept administrativ',
    organizationName: 'eDigitalizare SRL',
  },
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Copie Plan Cadastral', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie Plan Cadastral', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CopiePlanCadastralPage() {
  const service = await getService();
  // Schema price follows the DB (admin-editable) — hardcodat doar fallback-ul.
  const jsonLdGraph = buildJsonLd(Number(service?.base_price ?? 99));
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Ways to identify the property
  const identifiers = [
    { icon: KeyRound, title: 'Număr cadastral', desc: 'Identificatorul unic al imobilului (ex: 12783).' },
    { icon: ScrollText, title: 'Număr de carte funciară', desc: 'Numărul CF asociat proprietății din localitate.' },
  ];

  const useCases = [
    { icon: Ruler, title: 'Documentații tehnice', items: ['Plan de situație', 'Limitele recepționate', 'Suport pentru topograf'] },
    { icon: Home, title: 'Dosare & avize', items: ['Dosar notarial', 'Certificat de urbanism', 'Autorizație construire/demolare'] },
    { icon: ScrollText, title: 'Comparare cu terenul', items: ['Situația din arhivă', 'Verificare limite', 'Litigii de vecinătate'] },
    { icon: Layers, title: 'Proiectare & utilități', items: ['Date pentru proiectare', 'Racordări la utilități', 'Istoricul recepției'] },
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
              <span className="text-white font-medium">Copie Plan Cadastral</span>
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
                    Din arhiva OCPI
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie Plan Cadastral
                  <span className="block text-primary-500">din Arhiva OCPI</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Copia certificată a planului cadastral înregistrat la recepția imobilului, scoasă din arhiva
                  OCPI / ANCPI. O ceri după numărul cadastral sau de carte funciară, fără drum la ghișeu.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <ScrollText className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Primești <strong className="text-primary-500">planul de situație din dosarul de cadastru</strong>,
                    documentul de arhivă cu limitele și datele <strong>așa cum au fost recepționate</strong>. Îți este
                    de folos la documentații tehnice, dosare notariale și la verificarea limitelor față de teren.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> copia planului cadastral:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Introduci numărul de carte funciară sau cadastral',
                      'Confirmi județul și localitatea',
                      'Plătești securizat (taxe OCPI incluse)',
                      'Primești copia planului cadastral pe email',
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
                        <p className="text-xs text-neutral-500">Copie din arhiva OCPI</p>
                      </div>
                    </div>

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

        {/* Trust strip */}
        <section className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 max-w-[1100px] py-6 lg:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Landmark, value: 'ANCPI', label: 'Document OCPI' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Copie din arhivă' },
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
              Ce este copia planului cadastral și la ce folosește
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Copia planului cadastral</strong> este reproducerea certificată a{' '}
                <strong>planului de situație</strong> înregistrat la recepția cadastrală a imobilului, eliberată din{' '}
                <strong>arhiva Oficiului de Cadastru și Publicitate Imobiliară (OCPI / ANCPI)</strong>. Pe scurt, este
                copia documentului care a stat la baza înscrierii imobilului în sistemul de cadastru: conturul, limitele
                și datele tehnice <strong>așa cum au fost recepționate și arhivate</strong> de OCPI. Planul este
                întocmit la scară (de regulă 1:500 sau 1:1000 în intravilan și 1:2000 sau 1:5000 în extravilan). Vezi pe larg{' '}
                <Link href="/ce-este-planul-cadastral/" className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  ce este planul cadastral
                </Link>
                .
              </p>
              <p>
                O ceri pentru <strong>documentații tehnice</strong>, dosare notariale, certificate de urbanism,
                autorizații de construire sau demolare, racordări la utilități și proiectare, dar și ca să compari
                <strong> situația din arhivă cu situația din teren</strong>. Prin eGhișeul o obții online, fără cont
                ANCPI și fără drum la ghișeul OCPI: un operator depune cererea în numele tău, achită taxele OCPI și îți
                trimite copia pe email.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Copie plan cadastral vs. extras de plan cadastral pe ortofotoplan
                </h3>
                <p className="text-sm text-neutral-700">
                  <strong>Copia planului cadastral</strong> reproduce documentul de arhivă, adică planul de situație
                  înregistrat la recepție.{' '}
                  <strong>Extrasul de plan cadastral</strong> arată imobilul la zi, pe ortofotoplan (imagine aeriană
                  georeferențiată). Primul îți spune ce s-a depus și recepționat, al doilea îți arată poziția pe harta
                  cadastrală curentă.{' '}
                  <Link href={serviceUrl('extras-plan-cadastral')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi extrasul de plan cadastral pe ortofotoplan
                  </Link>
                  .
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce conține copia planului cadastral
              </h3>
              <p>
                Documentul reproduce <strong>planul de situație din dosarul de cadastru</strong>: conturul parcelei,
                dimensiunile și limitele recepționate, numărul cadastral, suprafața și, după caz, poziția construcțiilor.
                Harta interactivă de pe geoportalul ANCPI are doar caracter informativ. Copia din arhivă este un{' '}
                <strong>document OCPI / ANCPI</strong> certificat, livrat în format electronic pe email.
              </p>
              <p>
                Pentru multe proceduri ai nevoie atât de planul cadastral, cât și de situația juridică a imobilului. Dacă
                îți trebuie proprietarul, suprafața și sarcinile, comanzi și{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extrasul de carte funciară
                </Link>
                .
              </p>
              <p>
                Dacă nu cunoști numărul cadastral și vrei doar să <strong>identifici imobilul după adresă</strong>,
                folosește serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                , apoi îți eliberăm copia planului cadastral pentru terenul găsit.
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
                Cum identifici imobilul pentru copia planului cadastral
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ai nevoie de un singur identificator. Dacă nu îl știi, îl putem afla după adresă.
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
                <strong>Nu știi numărul cadastral?</strong> Îl putem afla după adresă prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi îți eliberăm copia planului cadastral.
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
                Când Ai Nevoie de Copia Planului Cadastral?
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții copia planului cadastral în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Identifici Imobilul', desc: 'Introduci numărul cadastral sau de carte funciară.', icon: KeyRound },
                { step: 2, title: 'Confirmi Localitatea', desc: 'Alegi județul și localitatea. Verificăm datele înainte de depunere.', icon: MapPin },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse.', icon: Shield },
                { step: 4, title: 'Primești Copia', desc: `În ${formatEstimatedDays(service)} primești copia planului cadastral pe email.`, icon: CheckCircle },
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

        {/* Related — cross-link to extras plan + CF + identificare */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Servicii pentru imobile
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href={serviceUrl('extras-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Plan Cadastral</p>
                  <p className="text-sm text-neutral-600">Imobilul la zi, pe ortofotoplan (harta cadastrală).</p>
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
                href={serviceUrl('identificare-imobil')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Identificare Imobil după Adresă</p>
                  <p className="text-sm text-neutral-600">Nu știi numărul cadastral? Îl aflăm după adresă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-plan-incadrare')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Ruler className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie după Planul de Încadrare</p>
                  <p className="text-sm text-neutral-600">Poziția imobilului în zonă, din dosarul cadastral.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Copie Plan Cadastral"
          faqs={[
            { q: 'Ce este copia planului cadastral?', a: 'Este reproducerea certificată a planului de situație înregistrat la recepția cadastrală a imobilului, eliberată din arhiva OCPI/ANCPI. Reflectă conturul, limitele și datele tehnice așa cum au fost recepționate și arhivate.' },
            { q: 'Cu ce diferă de extrasul de plan cadastral pe ortofotoplan?', a: 'Copia planului cadastral reproduce documentul de arhivă (planul de situație depus la recepție), iar extrasul de plan cadastral arată imobilul la zi, pe ortofotoplan (imagine aeriană georeferențiată). Primul îți spune ce s-a recepționat, al doilea îți arată poziția pe harta cadastrală curentă.' },
            { q: 'Ce conține documentul?', a: 'Conturul parcelei, dimensiunile și limitele recepționate, numărul cadastral, suprafața și, după caz, poziția construcțiilor. Practic, este planul de situație din dosarul de cadastru, întocmit la scară (de regulă 1:500 sau 1:1000 în intravilan și 1:2000 sau 1:5000 în extravilan).' },
            { q: 'La ce îmi folosește?', a: 'La documentații tehnice, dosare notariale, certificate de urbanism, autorizații de construire sau demolare, racordări la utilități și proiectare. Tot cu el compari situația din arhivă cu cea din teren.' },
            { q: 'Cât costă copia planului cadastral?', a: `${service.base_price} RON, cu taxele OCPI incluse. Fără costuri ascunse.` },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)}. Cererea este depusă și procesată de un operator, iar documentul ajunge la tine pe email.` },
            { q: 'Nu știu numărul cadastral. Ce fac?', a: 'Îl aflăm noi după adresă, prin serviciul de Identificare Imobil, apoi îți eliberăm copia planului cadastral pentru terenul găsit.' },
            { q: 'Am nevoie de cont ANCPI?', a: 'Nu. Ne ocupăm noi de tot procesul. Tu ne dai numărul cadastral sau de carte funciară.' },
            { q: 'Cât timp este valabilă copia?', a: 'Copia reflectă situația din arhivă la momentul eliberării. Dacă imobilul a suferit modificări (dezmembrare, alipire sau actualizări), s-ar putea să ai nevoie de un document mai recent. Pentru poziția la zi îți recomandăm extrasul de plan cadastral pe ortofotoplan.' },
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
                Gata să obții Copia Planului Cadastral?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de numărul cadastral sau de carte funciară. Primești documentul în {formatEstimatedDays(service)}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />

      <Footer />
    </>
  );
}
