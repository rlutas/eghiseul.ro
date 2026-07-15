import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import { ServiceOptionsSection } from '@/components/services/service-options-section';
import {
  Clock,
  Shield,
  Zap,
  CheckCircle,
  ChevronRight,
  Car,
  Mail,
  Gauge,
  AlertTriangle,
  Ban,
  FileText,
  Truck,
  Briefcase,
  Globe,
  Camera,
  Info,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays, formatUrgentDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ReviewsSection } from '@/components/services/reviews-section';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { ServicePrice } from '@/components/services/service-price';

// Database slug (order pipeline identifier). URL path uses an SEO slug
// (cazier-auto-online) targeting the primary search query.
const SERVICE_SLUG = 'cazier-auto';
const PAGE_PATH = '/servicii/cazier-auto-online/';
const SCHEMA_SLUG = 'cazier-auto-online';
const TITLE = 'Cazier Auto Online — Istoricul Sancțiunilor Rutiere, fără Drumuri';
const DESCRIPTION =
  'Obții cazierul auto (fișa de evidență a conducătorului auto) online: sancțiuni rutiere, ' +
  'puncte de penalizare, suspendări. Necesar pentru atestat profesional și angajare ca șofer.';
const DATE_PUBLISHED = '2026-06-14';
const DATE_MODIFIED = '2026-07-15';

export const revalidate = 3600;

async function getService(): Promise<{ service: Service; options: ServiceOption[] } | null> {
  const supabase = createPublicClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', SERVICE_SLUG)
    .eq('is_active', true)
    .single();

  if (error || !service) return null;

  const { data: options } = await supabase
    .from('service_options')
    .select('*')
    .eq('service_id', service.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return { service: service as Service, options: (options as ServiceOption[]) || [] };
}

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/services/cazier-auto.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Cazier Auto Online',
  description:
    'Serviciu de obținere a cazierului auto (fișa de evidență a conducătorului auto), eliberat de ' +
    'Poliția Rutieră: istoricul sancțiunilor rutiere, punctele de penalizare active și suspendările ' +
    'permisului de conducere. Procesare 100% online prin avocat, livrare PDF pe email.',
  serviceType: 'Document Processing — Auto',
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
    { name: 'Cazier Auto', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Cazier Auto — Fișa Conducătorului Auto (Standard)', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CazierAutoOnlinePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // What the driver record (fișa conducătorului auto) contains
  const checks = [
    { icon: AlertTriangle, title: 'Sancțiuni rutiere', desc: 'Amenzile și contravențiile rutiere înregistrate pe numele tău la Poliția Rutieră.' },
    { icon: Gauge, title: 'Puncte de penalizare active', desc: 'Punctele de penalizare în vigoare la data eliberării documentului.' },
    { icon: Ban, title: 'Suspendări ale permisului', desc: 'Perioadele în care exercitarea dreptului de a conduce a fost suspendată.' },
    { icon: FileText, title: 'Mențiuni despre abateri', desc: 'Mențiunile înregistrate în evidența conducătorilor auto despre abaterile constatate.' },
  ];

  const useCases = [
    { icon: Truck, title: 'Atestat profesional', items: ['Taxi, transport marfă sau persoane', 'Document obligatoriu la dosar', 'Cerut de ARR și angajatori'] },
    { icon: Briefcase, title: 'Angajare ca șofer', items: ['Firme de transport', 'Platforme de ride-sharing', 'Dovedești istoricul la volan'] },
    { icon: Gauge, title: 'Verifici punctele proprii', items: ['Afli punctele active', 'Vezi sancțiunile înregistrate', 'Fără drum la poliție'] },
    { icon: Globe, title: 'Permis din străinătate', items: ['Atestă faptele din România', 'Pentru instituții străine', 'Termen de procesare mai lung'] },
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
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link href="/servicii/" className="hover:text-primary-500 transition-colors">Servicii</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white font-medium">Cazier Auto</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Car className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Auto
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <FileText className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Fișa Conducătorului Auto
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Cazier Auto Online
                  <span className="block text-primary-500">Istoricul Sancțiunilor Rutiere</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cazierul auto</strong> — fișa de evidență a
                    conducătorului auto — arată istoricul tău la volan: amenzi, puncte de penalizare,
                    suspendări ale permisului. Îl obținem de la Poliția Rutieră prin avocatul nostru
                    colaborator înscris în Barou, care depune cererea în numele tău:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi formularul cu numărul permisului de conducere',
                      'Încarci actul de identitate, permisul și un selfie cu actul',
                      'Plătești securizat, fără taxe ascunse',
                      `Primești documentul PDF pe email în ${formatEstimatedDays(service)}`,
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
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
                        FIȘA CONDUCĂTORULUI AUTO
                      </span>
                      <ServicePrice basePrice={service.base_price} />
                      <p className="text-white/60 text-sm mt-2">Fără taxe ascunse</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Procesare prin avocat</p>
                      </div>
                    </div>

                    {service.urgent_days && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-secondary-900" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary-900 text-sm">Urgent: {formatUrgentDays(service)}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">PDF + opțional curier</p>
                      </div>
                    </div>

                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">Comandă Acum</OrderButton>

                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        <span className="text-xs">Eliberat de Poliția Rutieră</span>
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
                { icon: FileText, value: 'Fișa șoferului', label: 'Sancțiuni și puncte' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Livrare estimată' },
                { icon: Mail, value: 'Pe email', label: 'PDF + opțional curier' },
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

        {/* SEO Intro */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Ce este Cazierul Auto și ce conține
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Cazierul auto</strong> este denumirea uzuală pentru <strong>fișa de evidență a
                conducătorului auto</strong>, document eliberat de <strong>Poliția Rutieră</strong> despre
                șofer, nu despre mașină. El adună istoricul tău rutier: <strong>amenzile</strong> și
                contravențiile înregistrate, <strong>punctele de penalizare</strong> active și
                eventualele <strong>suspendări ale permisului</strong> de conducere.
              </p>
              <p>
                Prin eGhișeul obții <strong>cazierul auto online</strong>, fără drum la poliție și fără cont.
                Ai nevoie doar de <strong>permisul de conducere</strong> (numărul permisului), actul de
                identitate și un selfie cu actul. Avocatul nostru colaborator depune cererea la Poliția
                Rutieră în numele tău, iar tu primești documentul PDF pe email — cu livrare opțională
                și prin curier.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                  Cazier auto (șofer) vs. istoricul vehiculului (mașină)
                </h3>
                <p className="text-sm text-neutral-700">
                  Acest serviciu este <strong>cazierul conducătorului auto</strong> — situația ta de șofer
                  (sancțiuni, puncte de penalizare, suspendări). Unii caută sub același nume
                  <strong> istoricul vehiculului</strong> — un raport despre o <em>mașină</em> (accidente,
                  daune, rulaj), obținut după numărul de înmatriculare sau seria de șasiu. Acela
                  este un alt tip de verificare, pe care <strong>nu îl oferim</strong>. Iar pentru
                  infracțiuni există <strong>cazierul judiciar</strong>, un document separat — îl poți
                  comanda la{' '}
                  <Link href="/servicii/cazier-judiciar-online/" className="text-primary-600 font-semibold hover:underline">
                    cazier judiciar online
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What the document contains — feature cards */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Ce conține
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce conține cazierul auto
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Fișa de evidență arată, într-un singur document, situația ta ca șofer în evidențele Poliției Rutiere.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {checks.map((it) => (
                <div key={it.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <it.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{it.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-primary-50 rounded-2xl border border-primary-200 max-w-3xl mx-auto flex items-start gap-3">
              <Gauge className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-secondary-700">
                <strong>Punctele de penalizare</strong> se anulează la 6 luni de la data constatării, așa că
                fișa arată doar punctele active la data eliberării. Ai primit recent o amendă? Vezi{' '}
                <Link href="/calculator/amenda-circulatie/" className="text-primary-600 font-semibold hover:underline">
                  calculatorul de amenzi rutiere
                </Link>{' '}
                ca să afli cât ai de plată și câte puncte primești.
              </p>
            </div>
          </div>
        </section>

        {/* Service options (dynamic) */}
        {options.length > 0 && <ServiceOptionsSection options={options} />}

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Când ai nevoie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Când Ai Nevoie de Cazier Auto?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <uc.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{uc.title}</h3>
                  <div className="space-y-2">
                    {uc.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții cazierul auto în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Formularul', desc: 'Introduci datele tale personale și numărul permisului de conducere.', icon: FileText },
                { step: 2, title: 'Încarci Actele', desc: 'Actul de identitate, permisul de conducere și un selfie cu actul în mână.', icon: Camera },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay sau Google Pay — fără taxe ascunse.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești cazierul auto în PDF, pe email.`, icon: CheckCircle },
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

        {/* Specimen — what the document looks like */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Specimen
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Cazierul Auto — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Fișa de evidență a conducătorului auto, eliberată de Poliția Rutieră: sancțiunile rutiere,
                punctele de penalizare active și suspendările permisului, într-un singur document.
              </p>
            </div>

            <div className="grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-14 items-center">
              {/* Specimen image — framed */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-500/10 to-secondary-900/5 rounded-[2rem] blur-xl" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl p-3 ring-1 ring-neutral-200 shadow-[0_20px_50px_rgba(6,16,31,0.16)]">
                  <Image
                    src="/images/specimens/cazier-auto.png"
                    alt="Specimen cazier auto — fișa de evidență a conducătorului auto, date anonimizate"
                    width={1000}
                    height={1414}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <p className="text-xs text-neutral-400 mt-2 text-center italic">
                    Exemplu — date anonimizate.
                  </p>
                </div>
              </div>

              {/* What the document gives you */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                  Documentul de la Poliția Rutieră, la tine pe email
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Primești <strong>documentul PDF pe email</strong>, fără drumuri și fără cont — obținut de la
                  Poliția Rutieră prin avocatul nostru colaborator, pe baza permisului tău de conducere.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: AlertTriangle, title: 'Sancțiunile rutiere înregistrate', desc: 'Amenzile și contravențiile de pe numele tău, așa cum apar în evidențe.' },
                    { icon: Gauge, title: 'Punctele de penalizare active', desc: 'Punctele în vigoare la data eliberării — cele mai vechi de 6 luni nu mai apar.' },
                    { icon: Ban, title: 'Suspendări și mențiuni', desc: 'Perioadele de suspendare a permisului și mențiunile despre abaterile constatate.' },
                    { icon: Mail, title: 'Livrat pe email, în PDF', desc: 'Gata de depus la dosar sau trimis mai departe; opțional și prin curier.' },
                  ].map((f) => (
                    <li key={f.title} className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                        <f.icon className="h-5 w-5 text-primary-700" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-bold text-secondary-900 text-[15px]">{f.title}</p>
                        <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                    Eliberat de Poliția Rutieră, livrat pe email
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* Content + clarification — targets "ce contine" + vehicle-history intent */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Ce conține fișa conducătorului auto</h2>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Sancțiunile rutiere înregistrate (amenzi, contravenții)',
                    'Punctele de penalizare active la data eliberării',
                    'Perioadele de suspendare a permisului de conducere',
                    'Mențiunile despre abateri din evidența Poliției Rutiere',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Cauți istoricul mașinii?</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Dacă te interesează <strong>istoricul unui vehicul</strong> — accidente, daune, rulajul
                  real sau câți proprietari a avut, verificat după numărul de înmatriculare sau seria de
                  șasiu — acela este un alt tip de raport, despre <strong>mașină</strong>, pe care nu îl oferim.
                  Serviciul de pe această pagină este <strong>cazierul conducătorului auto</strong>: situația
                  ta de șofer în evidențele Poliției Rutiere, obținută pe baza permisului de conducere.
                </p>
              </div>
            </div>

            {/* Cost — targets "taxa cazier auto", "cat costa cazierul auto" */}
            <div className="mt-8 max-w-[820px] mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
                Cât costă cazierul auto și cum îl obții
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  Prin eGhișeul, cazierul auto costă <strong>198 RON cu TVA inclus</strong>, o singură taxă,
                  fără costuri ascunse. Prețul acoperă întreaga procedură: avocatul colaborator pregătește și
                  depune cererea la Poliția Rutieră în numele tău, iar tu primești documentul PDF pe email
                  în {formatEstimatedDays(service)} — sau în regim urgent, dacă te grăbește un termen.
                  Plătești securizat cu cardul, Apple Pay sau Google Pay.
                </p>
                <p>
                  Alternativa clasică este drumul la <strong>serviciul rutier</strong>: cerere depusă personal,
                  în timpul programului de lucru, cu așteptare la ghișeu. Dacă ești plecat din țară, lucrezi în
                  alt oraș sau pur și simplu nu ai timp de drumuri, varianta online prin avocat rezolvă totul
                  de la distanță — inclusiv pentru <strong>permise emise în străinătate</strong>, caz în care
                  documentul atestă faptele comise pe teritoriul României.
                </p>
              </div>
            </div>

            {/* Validity + guide — targets "valabilitate cazier auto" */}
            <div className="mt-8 max-w-[820px] mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
                Cât este valabil cazierul auto
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  Legea nu stabilește un termen de valabilitate, dar în practică instituțiile acceptă fișa de
                  evidență a conducătorului auto emisă în ultimele <strong>30 de zile</strong> — documentul
                  reflectă situația ta la data eliberării, iar punctele de penalizare se schimbă în timp.
                  Recomandarea noastră: comandă-l cu puțin timp înainte de depunerea dosarului. Poți verifica
                  termenele uzuale pentru mai multe acte în{' '}
                  <Link href="/calculator/valabilitate-documente/" className="text-primary-600 font-semibold hover:underline">
                    calculatorul de valabilitate a documentelor
                  </Link>
                  .
                </p>
                <p>
                  Pentru <strong>atestatul profesional</strong> (taxi, transport marfă sau persoane), fișa
                  conducătorului auto este piesă obligatorie la dosar, iar firmele de transport și platformele
                  de ride-sharing o cer tot mai des la angajare. Detalii despre document, cine îl eliberează și
                  cum îl citești găsești în ghidul nostru{' '}
                  <Link href="/informatii-cazier-auto-online/" className="text-primary-600 font-semibold hover:underline">
                    informații despre cazierul auto online
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Cazier Auto"
          faqs={[
            { q: 'Ce este cazierul auto?', a: 'Este fișa de evidență a conducătorului auto, un document eliberat de Poliția Rutieră despre șofer: istoricul sancțiunilor rutiere (amenzi, contravenții), punctele de penalizare active și suspendările permisului de conducere. Se obține pe baza permisului, nu pe numărul mașinii.' },
            { q: 'Ce acte îmi trebuie pentru a comanda?', a: 'Ai nevoie de actul de identitate, permisul de conducere (numărul permisului) și un selfie cu actul în mână, pentru verificarea identității. Totul se încarcă direct în formular, de pe telefon sau calculator.' },
            { q: 'Cât durează să primesc cazierul auto?', a: `${formatEstimatedDays(service)} în mod standard. Dacă te grăbește un termen, există și procesare urgentă, cu livrare în ${formatUrgentDays(service) ?? 'regim prioritar'}.` },
            { q: 'Am permis emis în străinătate. Pot obține cazierul auto din România?', a: 'Da. Documentul atestă faptele comise pe teritoriul României, indiferent de statul care a emis permisul. Pentru permisele emise în străinătate termenul de procesare este mai lung decât cel standard.' },
            { q: 'Care e diferența dintre cazierul auto și cazierul judiciar?', a: 'Cazierul auto (fișa conducătorului auto) arată sancțiunile rutiere: amenzi, puncte de penalizare, suspendări ale permisului. Cazierul judiciar arată infracțiunile și condamnările penale și se eliberează de poliție pe alt circuit. Sunt documente diferite, cerute în situații diferite — pe eGhișeul le poți comanda pe amândouă.' },
            { q: 'Care e diferența dintre cazierul auto și istoricul vehiculului?', a: 'Cazierul auto este despre șofer: sancțiunile și punctele de pe permisul tău. Istoricul vehiculului este despre o mașină (accidente, daune, rulaj), verificat după numărul de înmatriculare sau seria de șasiu — un alt tip de raport, pe care nu îl oferim.' },
            { q: 'Cât este valabil cazierul auto?', a: 'Legea nu fixează un termen, dar în practică instituțiile cer un document emis în ultimele 30 de zile, pentru că punctele de penalizare și sancțiunile se schimbă în timp. Comandă-l cu puțin timp înainte de depunerea dosarului.' },
            { q: 'Îmi trebuie cazier auto pentru atestatul profesional?', a: 'Da. Pentru atestatul profesional de taxi sau de transport marfă și persoane, fișa de evidență a conducătorului auto este document obligatoriu la dosar. Și angajatorii din transport sau ride-sharing o cer frecvent la angajare.' },
            { q: 'Cât costă cazierul auto?', a: 'Prin eGhișeul, cazierul auto costă 198 RON cu TVA inclus, o singură taxă, fără costuri ascunse. Prețul acoperă întreaga procedură prin avocatul colaborator și livrarea documentului PDF pe email.' },
            { q: 'Cum primesc cazierul auto?', a: 'Îl primești pe email, în format PDF, fără să te deplasezi la vreun ghișeu. Dacă ai nevoie și de exemplarul fizic, îl putem trimite opțional prin curier, oriunde în țară sau în străinătate.' },
            { q: 'Trebuie să merg personal la Poliția Rutieră?', a: 'Nu. Avocatul nostru colaborator, înscris în Barou, depune cererea în numele tău pe baza împuternicirii semnate online în formular. Tu doar completezi datele, încarci actele și primești documentul pe email.' },
            { q: 'Pot vedea punctele mele de penalizare în cazierul auto?', a: 'Da, acesta este unul dintre cele mai frecvente motive de comandă. Fișa arată punctele de penalizare active la data eliberării — punctele se anulează la 6 luni de la data constatării, deci cele expirate nu mai apar.' },
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
                Gata să obții cazierul auto fără drumuri?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de actul de identitate, permisul de conducere și un selfie. Primești documentul în {formatEstimatedDays(service)}.
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
