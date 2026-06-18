import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Shield,
  Zap,
  FileText,
  CheckCircle,
  ChevronRight,
  User,
  Scale,
  Phone,
  Mail,
  Briefcase,
  Plane,
  Baby,
  Gavel,
  Landmark,
  Star,
  X,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ServicePrice } from '@/components/services/service-price';
import { ReviewsSection } from '@/components/services/reviews-section';

// Database slug for this service (order pipeline identifier)
const SERVICE_SLUG = 'cazier-judiciar-persoana-fizica';

// SEO routing constants — URL path is nested under the hub, NOT the DB slug
const PAGE_PATH = '/servicii/cazier-judiciar-online/persoana-fizica/';
const SCHEMA_SLUG = 'cazier-judiciar-online/persoana-fizica';
const TITLE = 'Cazier Judiciar Persoană Fizică Online — 198 RON';
const DESCRIPTION =
  'Obține cazierul judiciar pentru persoană fizică 100% online, fără drum la ghișeu. ' +
  '198 RON, livrare în 2-4 zile pe email. Document oficial de la Poliția Română, ' +
  'valabil pentru angajare, emigrare, adopție și proceduri legale.';
const DATE_PUBLISHED = '2026-04-16';
const DATE_MODIFIED = '2026-06-13';

// Enable ISR with 1-hour revalidation
export const revalidate = 3600;

// Fetch service data
async function getService(): Promise<{ service: Service; options: ServiceOption[] } | null> {
  const supabase = createPublicClient();

  // Get service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', SERVICE_SLUG)
    .eq('is_active', true)
    .single();

  if (serviceError || !service) {
    return null;
  }

  // Get service options
  const { data: options } = await supabase
    .from('service_options')
    .select('*')
    .eq('service_id', service.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return {
    service: service as Service,
    options: (options as ServiceOption[]) || [],
  };
}

// Hand-tuned SEO metadata (hub pattern) — differentiated from hub + PJ to avoid
// internal cannibalization. PF owns "cazier judiciar persoană fizică" long-tail.
export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/services/cazier-judiciar.png',
});

// Full Schema.org @graph (Org + WebSite + BreadcrumbList + Service + Offers +
// AggregateRating + WebPage + reviewedBy) — same depth as the hub page.
const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Cazier Judiciar Persoană Fizică',
  description:
    'Serviciu de obținere a cazierului judiciar pentru persoane fizice, eliberat de ' +
    'Inspectoratul General al Poliției Române conform Legii 290/2004. Procesare 100% online, ' +
    'verificare identitate KYC, livrare email + curier opțional.',
  serviceType: 'Document Processing — Legal',
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
    { name: 'Cazier Judiciar Online', url: `${BASE_URL}/servicii/cazier-judiciar-online/` },
    { name: 'Persoană Fizică', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Cazier Judiciar Persoană Fizică (Standard 2-4 zile)', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
    { name: 'Cazier Judiciar Persoană Fizică (Urgent 1-2 zile)', price: 278, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CazierJudiciarPFPage() {
  const data = await getService();

  if (!data) {
    notFound();
  }

  const { service, options } = data;

  // Use cases for Cazier Judiciar PF
  const useCases = [
    {
      icon: Briefcase,
      title: 'Angajare',
      items: ['Sector public', 'Sector privat', 'Promovare profesională'],
    },
    {
      icon: Plane,
      title: 'Emigrare',
      items: ['Viză de muncă', 'Rezidență permanentă', 'Cetățenie străină'],
    },
    {
      icon: Baby,
      title: 'Familie',
      items: ['Adopție', 'Tutelă', 'Custodie copii'],
    },
    {
      icon: Gavel,
      title: 'Proceduri Legale',
      items: ['Permis port-armă', 'Notariat', 'Instanțe judecătorești'],
    },
  ];

  return (
    <>
      {/* JSON-LD Structured Data — full @graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-16 lg:pb-24">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[1280px]">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8 flex-wrap">
              <Link href="/" className="hover:text-primary-500 transition-colors">
                Acasă
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/#servicii" className="hover:text-primary-500 transition-colors">
                Servicii
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/servicii/cazier-judiciar-online" className="hover:text-primary-500 transition-colors">
                Cazier Judiciar
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Persoană Fizică</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="flex-1 max-w-[700px]">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Persoană Fizică
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Scale className="h-3.5 w-3.5 mr-1" />
                    Juridice
                  </Badge>
                </div>

                {/* H1 */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Cazier Judiciar Online
                  <span className="block text-primary-500">Persoană Fizică</span>
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* SEO Content Box */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cazierul Judiciar</strong> este documentul oficial
                    care atestă că nu ai antecedente penale. Avocatul nostru colaborator, înscris în Barou,
                    depune cererea la IGPR și coordonează procedura legală în numele tău:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Completezi formularul online (5 minute)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Încarci act identitate + selfie KYC
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Plătești securizat prin Stripe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Primești documentul în {formatEstimatedDays(service)}
                    </li>
                  </ul>
                </div>

                {/* Google Reviews Badge */}
              </div>

              {/* Price Card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  {/* Header with price */}
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        PREȚ COMPLET
                      </span>
                      <ServicePrice basePrice={service.base_price} />
                      <p className="text-white/50 text-xs mt-1">Fără taxe ascunse</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-5 space-y-3">
                    {/* Delivery time */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Zile lucrătoare</p>
                      </div>
                    </div>

                    {/* Urgent option */}
                    {service.urgent_days && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-secondary-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-secondary-900 text-sm">Urgent: 1-2 zile</p>
                            <span className="text-xs font-bold text-white bg-primary-600 px-2 py-1 rounded-lg">+80 RON</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email delivery */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">PDF + opțional curier</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">Comandă Acum</OrderButton>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Garanție</span>
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
                { icon: Clock, value: '2-4 zile lucrătoare', label: 'Urgent în 1-2 zile' },
                { icon: Landmark, value: 'IGPR', label: 'Poliția Română oficial' },
                { icon: Mail, value: 'Email + curier', label: 'PDF + livrare opțională' },
                { icon: Star, value: '4.9/5', label: 'Peste 450 recenzii' },
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

        {/* SEO Intro Content — targets "cazier judiciar persoană fizică" + "gratuit" intent */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Cazier Judiciar pentru Persoană Fizică — Online, Fără Drum la Ghișeu
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Cazierul judiciar pentru persoană fizică</strong> este documentul oficial emis de
                Inspectoratul General al Poliției Române (conform Legii 290/2004) care atestă dacă o persoană
                are sau nu antecedente penale. Este cerut frecvent la angajare în România și în străinătate,
                pentru obținerea unei vize de muncă, pentru adopție, tutelă, permis de port-armă sau alte
                proceduri legale.
              </p>
              <p>
                Prin eGhișeul obții <strong>cazierul judiciar online pentru persoane fizice</strong> în 2-4 zile
                lucrătoare, fără să te deplasezi la ghișeu și fără cont SPV. Completezi formularul în câteva minute,
                îți încarci actul de identitate și un selfie pentru verificarea identității, plătești securizat, iar
                avocatul colaborator înscris în Barou depune cererea la IGPR în numele tău, pe baza unei împuterniciri.
                Primești documentul pe email (PDF) și, opțional, prin curier.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Cazier judiciar gratuit la ghișeu vs. online prin eGhișeul
                </h3>
                <p className="text-sm text-neutral-700">
                  Cazierul judiciar se poate obține <strong>gratuit</strong> personal, la orice secție de poliție,
                  sau cu semnătură electronică prin portalul oficial <em>ghiseul.ro</em>/hub.mai.gov.ro. Dezavantajul:
                  programare, deplasare, cozi și — pentru cei din diaspora — aproape imposibil fără a fi în țară.
                  Serviciul nostru e plătit (198 RON), dar e <strong>100% online, fără deplasare, din orice oraș sau
                  din străinătate</strong>, cu asistență dedicată. Alegi comoditatea contra cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preț & opțiuni — bază featured + urgență + add-on-uri (template CF) */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Preț & opțiuni
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Prețuri transparente, fără surprize</h2>
              <p className="text-neutral-600 max-w-xl mx-auto">Prețul de bază include taxele oficiale IGPR. Opțiunile sunt complet la alegerea ta.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {/* Base service — featured */}
              <div className="relative rounded-3xl border-2 border-primary-500 bg-white p-6 lg:p-7 shadow-[0_8px_28px_rgba(236,185,95,0.18)] flex flex-col">
                <span className="absolute -top-3 left-6 inline-block rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-secondary-900">
                  Serviciul de bază
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200">
                  <FileText className="h-6 w-6 text-primary-700" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-1.5">Cazier Judiciar — Persoană Fizică</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">
                  Documentul oficial emis de IGPR (Poliția Română), semnat electronic eIDAS. Livrat pe email.
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-secondary-900">{(service.base_price / 1.21).toFixed(2)}</span>
                  <span className="text-sm font-bold text-neutral-400">RON</span>
                </div>
                <p className="text-xs text-neutral-500">+ TVA 21% · {service.base_price} RON cu TVA · taxe IGPR incluse</p>
              </div>

              {/* Urgent processing (+80 RON — la cazier NU e gratis) */}
              {options.filter((o) => o.code === 'urgenta').map((o) => (
                <div key={o.id} className="relative rounded-3xl border-2 border-primary-300 bg-primary-50/50 p-6 lg:p-7 flex flex-col">
                  <span className="absolute -top-3 left-6 inline-block rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                    Recomandat
                  </span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
                    <Zap className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1.5">Procesare urgentă</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">
                    Primești cazierul în <strong>1-2 zile lucrătoare</strong> în loc de 2-4. Procesare prioritară.
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-black text-primary-600">+{(Number(o.price) / 1.21).toFixed(2)}</span>
                    <span className="text-sm font-bold text-neutral-400">RON</span>
                  </div>
                  <p className="text-xs text-neutral-500">+ TVA 21% · +{o.price} RON cu TVA · opțional</p>
                </div>
              ))}

              {/* Add-on-uri (dinamic, fără urgență) */}
              {options.filter((o) => o.code !== 'urgenta').map((option) => (
                <div key={option.id} className="rounded-3xl border border-neutral-200 bg-white p-6 lg:p-7 hover:border-primary-300 hover:shadow-md transition-all flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200">
                    <FileText className="h-6 w-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1.5">{option.name}</h3>
                  {option.description && (
                    <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">{option.description}</p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-600">+{(Number(option.price) / 1.21).toFixed(2)}</span>
                    <span className="text-sm font-bold text-neutral-400">RON</span>
                  </div>
                  <p className="text-xs text-neutral-500">+ TVA 21% · +{option.price} RON cu TVA · opțional</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Cazuri de utilizare
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Când Ai Nevoie de Cazier Judiciar?
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul este solicitat în numeroase situații oficiale
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <useCase.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{useCase.title}</h3>
                  <div className="space-y-2">
                    {useCase.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
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

        {/* How it works — dark connected timeline */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] py-14 lg:py-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-500/15 text-primary-400 text-sm font-semibold rounded-full mb-4 border border-primary-500/30">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">Cum Funcționează?</h2>
              <p className="text-white/70 max-w-2xl mx-auto">Obții cazierul judiciar în 4 pași simpli, 100% online — fără drum la ghișeu.</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {/* connecting line (desktop) */}
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completează Formularul', desc: 'Introdu datele personale inclusiv CNP, adresă și date părinți.', icon: FileText },
                { step: 2, title: 'Încarcă Documentele', desc: 'Fotografiază CI (față + verso) și fă un selfie pentru verificare.', icon: User },
                { step: 3, title: 'Plătește Securizat', desc: 'Card, Apple Pay, Google Pay — toate prin Stripe.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești cazierul pe email + curier.`, icon: CheckCircle },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_8px_24px_rgba(236,185,95,0.35)]">
                    <item.icon className="h-7 w-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-secondary-900 shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparativ — eGhișeul vs alți operatori vs ghișeu Poliție (template CF) */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                De ce eGhișeul
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                eGhișeul vs alți operatori și ghișeul Poliției
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Același cazier judiciar oficial emis de IGPR — diferă timpul, comoditatea și asistența juridică.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] min-w-[640px] text-sm">
                {/* Header row */}
                <div className="bg-neutral-50 p-4 font-semibold text-secondary-900" />
                <div className="bg-primary-500 p-4 text-center font-extrabold text-secondary-900">eGhișeul</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Alți operatori online</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Ghișeu Poliție</div>

                {[
                  ['Timp de obținere', '2-4 zile (1-2 urgent)', '5-10 zile', 'Drum + cozi'],
                  ['Procesare 100% online', true, true, false],
                  ['Deplasare la ghișeu', false, false, true],
                  ['Disponibil din diaspora', true, 'Variabil', false],
                  ['Asistență avocat inclus', true, false, false],
                  ['Semnătură electronică eIDAS', true, 'Variabil', false],
                  ['Livrare pe email', 'Automat', true, 'Ridici fizic'],
                ].map((row, i) => (
                  <div key={row[0] as string} className="contents">
                    <div className={`p-4 font-medium text-secondary-800 border-t border-neutral-100 ${i % 2 ? 'bg-neutral-50/50' : ''}`}>
                      {row[0]}
                    </div>
                    {[1, 2, 3].map((col) => {
                      const v = row[col];
                      const highlight = col === 1;
                      return (
                        <div
                          key={col}
                          className={`flex items-center justify-center p-4 border-t border-neutral-100 text-center ${
                            highlight ? 'bg-primary-50' : i % 2 ? 'bg-neutral-50/50' : ''
                          }`}
                        >
                          {v === true ? (
                            <CheckCircle className={`h-5 w-5 ${highlight ? 'text-green-600' : 'text-green-500'}`} aria-label="Da" />
                          ) : v === false ? (
                            <X className="h-5 w-5 text-neutral-300" aria-label="Nu" />
                          ) : (
                            <span className={`text-xs sm:text-sm ${highlight ? 'font-bold text-secondary-900' : 'text-neutral-600'}`}>{v}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă cazierul acum</OrderButton>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <ReviewsSection />

        {/* Required Documents */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1280px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Documente Necesare
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Pregătește aceste documente înainte de a începe
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              {[
                'Carte de identitate (față și verso)',
                'Selfie pentru verificare KYC',
                'Date personale (CNP, adresă completă)',
                'Date părinți (prenume mamă și tată)',
              ].map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-green-200 hover:bg-green-50/50 transition-all"
                >
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-secondary-900 font-medium">{doc}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-200 max-w-3xl mx-auto">
              <h3 className="font-bold text-secondary-900 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                Important pentru cetățeni străini
              </h3>
              <p className="text-sm text-secondary-700 leading-relaxed">
                Cetățenii europeni și non-UE pot solicita cazier judiciar cu documente suplimentare:
                permis de rezidență și certificat de înregistrare. Timpul de procesare poate fi mai lung.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <ServiceFAQ
          title="Întrebări Frecvente - Cazier Judiciar"
          faqs={[
            {
              q: 'Ce este Cazierul Judiciar?',
              a: 'Cazierul Judiciar este un document oficial emis de Poliția Română care atestă dacă o persoană are sau nu antecedente penale. Arată condamnările definitive.',
            },
            {
              q: 'Care e diferența dintre Cazier Judiciar și Cazier Fiscal?',
              a: 'Cazier Judiciar = antecedente penale (emis de Poliție). Cazier Fiscal = datorii la stat (emis de ANAF). Sunt documente complet diferite.',
            },
            {
              q: 'De ce aveți nevoie de datele părinților?',
              a: 'Poliția Română cere prenumele mamei și tatălui pentru identificare corectă. Aceste date apar și pe cazierul judiciar emis.',
            },
            {
              q: 'Cât timp este valabil Cazierul Judiciar?',
              a: 'În general 6 luni, dar depinde de instituția care îl solicită. Unele cer cazier emis în ultimele 30 de zile.',
            },
            {
              q: 'Câte zile durează procesarea?',
              a: `${formatEstimatedDays(service)} în mod standard. 1-2 zile lucrătoare cu opțiunea Urgență (+80 RON).`,
            },
            {
              q: 'Pot cere cazier pentru altcineva?',
              a: 'Nu, cazierul judiciar este personal. Fiecare persoană trebuie să își ceară propriul cazier cu propriile documente.',
            },
            {
              q: 'Ce se întâmplă dacă am antecedente penale?',
              a: 'Cazierul va arăta condamnările definitive. Documentul se emite oricum - reflectă situația reală din baza de date a Poliției.',
            },
            {
              q: 'Cum primesc documentul?',
              a: 'Pe email ca PDF + opțional prin curier fizic la adresa indicată (România +25 RON, Internațional +89 RON).',
            },
          ]}
        />

        {/* CTA Section */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[900px]">
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
                Gata să obții Cazierul Judiciar?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completează formularul în 5 minute și primești documentul în {formatEstimatedDays(service)}.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
                <WhatsAppButton />
              </div>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <a
                  href="tel:+40757708181"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Telefon suport</p>
                    <p className="text-white font-semibold">+40 757 708 181</p>
                  </div>
                </a>
                <a
                  href="mailto:contact@eghiseul.ro"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-white font-semibold">contact@eghiseul.ro</p>
                  </div>
                </a>
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
