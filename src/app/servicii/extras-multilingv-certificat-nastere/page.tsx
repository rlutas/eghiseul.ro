import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  Shield,
  FileText,
  CheckCircle,
  ChevronRight,
  Mail,
  Landmark,
  User,
  Heart,
  Globe,
  IdCard,
  CalendarDays,
  Plane,
  GraduationCap,
  Package,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ReviewsSection } from '@/components/services/reviews-section';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { ServicePrice } from '@/components/services/service-price';

const SERVICE_SLUG = 'extras-multilingv-certificat-nastere';
const PAGE_PATH = '/servicii/extras-multilingv-certificat-nastere/';
const TITLE = 'Extras Multilingv Certificat de Naștere 2026 — pentru UE, Fără Traducere';
const DESCRIPTION =
  'Extrasul multilingv de pe certificatul de naștere (formular standard UE) e recunoscut în ' +
  'Uniunea Europeană fără traducere și fără apostilă. 798 RON totul inclus, fără deplasare.';
const DATE_PUBLISHED = '2026-06-25';
const DATE_MODIFIED = '2026-07-08';

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
  ogImage: '/og/services/certificat-nastere.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SERVICE_SLUG,
  name: 'Extras Multilingv Certificat de Naștere',
  description:
    'Serviciu de obținere a extrasului multilingv de pe certificatul de naștere (formular standard ' +
    'multilingv conform Regulamentului (UE) 2016/1191), recunoscut în toate statele UE fără traducere ' +
    'autorizată și fără apostilă. Procesare 100% online, depunere prin avocat partener, livrare ' +
    'electronică și prin curier, inclusiv internațional.',
  serviceType: 'Document Processing — Civil Status',
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
    { name: 'Extras Multilingv Certificat de Naștere', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Extras Multilingv Certificat de Naștere', price: 798, url: `${BASE_URL}${PAGE_PATH}` },
    {
      name: 'Pachet: Extras Multilingv + Certificat de Naștere (duplicat)',
      price: 1296,
      url: `${BASE_URL}${PAGE_PATH}`,
    },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function ExtrasMultilingvNasterePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // When you need the multilingual extract — main EU use cases
  const useCases = [
    { icon: Heart, title: 'Căsătorie în străinătate', items: ['Dosar de căsătorie în UE', 'Acte la ofițerul stării civile străin', 'Împreună cu dovada de celibat'] },
    { icon: Plane, title: 'Ședere & muncă în UE', items: ['Permis de ședere', 'Dosar de angajare', 'Înregistrare rezidență'] },
    { icon: GraduationCap, title: 'Școală & familie', items: ['Înscrierea copilului la școală', 'Grădiniță în străinătate', 'Dosare de familie'] },
    { icon: Landmark, title: 'Dosare administrative UE', items: ['Alocații și asigurări sociale', 'Acte de identitate străine', 'Alte proceduri administrative'] },
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
              <span className="text-white font-medium">Extras Multilingv Certificat de Naștere</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    Recunoscut în UE
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Fără traducere
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    Stare Civilă
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Extras Multilingv
                  <span className="block text-primary-500">Certificat de Naștere — pentru UE</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Formularul standard multilingv (Regulamentul UE 2016/1191) care însoțește certificatul
                  de naștere și îl face valabil în toate statele Uniunii Europene, fără traducere
                  autorizată și fără apostilă.
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Extrasul multilingv</strong> îl obții de la noi,
                    fără drum la Starea Civilă:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi online datele actului de naștere (dată, locul înregistrării, părinți)',
                      'Semnezi electronic împuternicirea, direct în formular',
                      'Avocatul partener depune cererea la Starea Civilă care deține actul',
                      'Primești extrasul electronic și/sau prin curier, oriunde în lume',
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-white/75 text-xs sm:text-sm leading-relaxed">
                    Avocatul nostru partener, înscris în Barou, depune cererea prin împuternicire la
                    <strong className="text-white/90"> Starea Civilă</strong> și coordonează procedura în numele tău.
                  </p>
                </div>
              </div>

              {/* Price card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        TOTUL INCLUS
                      </span>
                      <ServicePrice basePrice={service.base_price} />
                      <p className="text-white/60 text-sm mt-2">Onorariu avocat inclus</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">În funcție de oficiul stării civile</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                      <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-secondary-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-secondary-900 text-sm">Pachet cu certificatul: +498 RON</p>
                        <p className="text-xs text-neutral-600">În loc de 998 RON separat</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Plus original prin curier, inclusiv internațional</p>
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
                { icon: CalendarDays, value: formatEstimatedDays(service), label: 'Livrare estimată' },
                { icon: Globe, value: 'Valabil în UE', label: 'Fără traducere, fără apostilă' },
                { icon: Mail, value: 'Email + curier', label: 'Inclusiv internațional (DHL)' },
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
              Extras Multilingv de pe Certificatul de Naștere — Online
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Extrasul multilingv de pe certificatul de naștere</strong> este un formular standard
                multilingv introdus prin <strong>Regulamentul (UE) 2016/1191</strong>. El însoțește
                certificatul de naștere și redă datele acestuia în limbile oficiale ale statelor membre,
                astfel încât actul tău este acceptat de autoritățile din <strong>toate statele Uniunii
                Europene fără traducere autorizată și fără apostilă</strong>.
              </p>
              <p>
                Documentul se eliberează de <strong>serviciul de stare civilă al primăriei care deține actul
                de naștere</strong>. Prin eGhișeul nu trebuie să te deplasezi: completezi datele online,
                semnezi electronic împuternicirea direct în formular, iar <strong>avocatul nostru
                partener</strong> depune cererea la primăria competentă. Primești extrasul electronic și/sau
                prin curier, inclusiv internațional prin DHL — util mai ales dacă ești deja plecat din țară.
              </p>
              <p>
                Dacă nu mai ai certificatul de naștere sau ai nevoie și de un exemplar nou, poți comanda în
                aceeași cerere și{' '}
                <Link href="/servicii/eliberare-certificat-de-nastere/" className="text-primary-600 font-medium hover:underline">
                  duplicatul certificatului de naștere
                </Link>{' '}
                — la pachet costă doar +498 RON, față de 998 RON comandat separat. Pentru dosarul de
                căsătorie în străinătate, extrasul multilingv merge de obicei împreună cu{' '}
                <Link href="/servicii/eliberare-certificat-de-celibat/" className="text-primary-600 font-medium hover:underline">
                  certificatul de celibat
                </Link>
                . Vezi și{' '}
                <Link href="/servicii/extras-multilingv-certificat-casatorie/" className="text-primary-600 font-medium hover:underline">
                  extrasul multilingv de pe certificatul de căsătorie
                </Link>{' '}
                sau toate{' '}
                <Link href="/servicii/" className="text-primary-600 font-medium hover:underline">
                  serviciile eGhișeul
                </Link>
                .
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Important: doar pentru statele Uniunii Europene
                </h3>
                <p className="text-sm text-neutral-700">
                  Formularul standard multilingv este recunoscut <strong>numai între statele membre UE</strong>.
                  Pentru țări din afara Uniunii Europene (Marea Britanie, SUA, Canada etc.) rămâne necesară{' '}
                  <strong>apostila de la Haga</strong> și, de regulă, o <strong>traducere legalizată</strong> a
                  certificatului. Dacă nu ești sigur ce îți cere autoritatea străină, scrie-ne pe WhatsApp
                  înainte de comandă.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Când ai nevoie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Când Ai Nevoie de Extrasul Multilingv?
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ori de câte ori prezinți certificatul de naștere unei autorități dintr-un alt stat membru UE.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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

            {/* UE vs non-UE — ce înlocuiește extrasul multilingv */}
            <div className="mt-16 lg:mt-20 max-w-[1100px] mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                  Înlocuiește traducerea și apostila?
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Da — dar numai în interiorul Uniunii Europene. Iată exact ce acoperă formularul standard multilingv.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-secondary-900">În statele membre UE</h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-neutral-700">
                    {[
                      'Certificatul + extrasul multilingv sunt acceptate direct',
                      'NU ai nevoie de traducere autorizată',
                      'NU ai nevoie de apostilă',
                      'Formularul redă datele în limbile oficiale ale statelor membre',
                    ].map((row) => (
                      <li key={row} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {row}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-6 h-6 text-neutral-500" />
                    <h3 className="text-lg font-bold text-secondary-900">În afara UE</h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-neutral-700">
                    {[
                      'Extrasul multilingv NU este suficient',
                      'Rămâne necesară apostila de la Haga pe certificat',
                      'De regulă se cere și traducere legalizată',
                      'Verifică cerințele exacte ale autorității străine înainte de comandă',
                    ].map((row) => (
                      <li key={row} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                        {row}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-sm text-neutral-600 text-center mt-6 max-w-2xl mx-auto">
                Extrasul multilingv nu circulă singur — el <strong>însoțește certificatul de naștere</strong>.
                Dacă actul tău e pierdut sau deteriorat, vezi ghidul despre{' '}
                <Link href="/duplicat-certificat-de-nastere/" className="text-primary-600 font-medium hover:underline">
                  duplicatul certificatului de naștere
                </Link>
                , iar dacă te-ai născut în străinătate și actul nu e încă înregistrat în România, citește despre{' '}
                <Link href="/transcriere-certificat-de-nastere/" className="text-primary-600 font-medium hover:underline">
                  transcrierea certificatului de naștere
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Pachet + service options (dynamic) */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Personalizare
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Extras Singur sau la Pachet cu Certificatul</h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Dacă îți trebuie și un certificat de naștere nou (duplicat), pachetul e varianta mai avantajoasă.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
                <h3 className="font-bold text-secondary-900 mb-1">Extras multilingv</h3>
                <p className="text-sm text-neutral-600 mb-3">Formularul standard UE, pentru certificatul pe care îl ai deja.</p>
                <p className="text-3xl font-extrabold text-secondary-900">{service.base_price} <span className="text-base font-semibold text-neutral-500">RON</span></p>
                <p className="text-xs text-neutral-500 mt-1">Totul inclus — onorariu avocat + depunere</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-primary-400 relative">
                <span className="absolute -top-3 left-6 px-3 py-0.5 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full">
                  ECONOMISEȘTI 500 RON
                </span>
                <h3 className="font-bold text-secondary-900 mb-1">Pachet: extras + certificat (duplicat)</h3>
                <p className="text-sm text-neutral-600 mb-3">Primești și un certificat de naștere nou, în aceeași cerere.</p>
                <p className="text-3xl font-extrabold text-secondary-900">{Number(service.base_price) + 498} <span className="text-base font-semibold text-neutral-500">RON</span></p>
                <p className="text-xs text-neutral-500 mt-1">Certificatul la pachet: +498 RON, în loc de 998 RON separat</p>
              </div>
            </div>

            {options.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {options.map((option) => (
                  <Card key={option.id} className="border-2 border-neutral-200 hover:border-primary-400 transition-all hover:shadow-md">
                    <CardContent className="p-4 lg:p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-secondary-900 text-sm lg:text-base">{option.name}</h3>
                          {option.is_required && (
                            <Badge className="bg-secondary-900 text-white text-[10px] flex-shrink-0">Obligatoriu</Badge>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-xs lg:text-sm text-neutral-600 mb-3 flex-1">{option.description}</p>
                        )}
                        <span className="font-bold text-primary-600 text-base lg:text-lg mt-auto">+{option.price} RON</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How it works — dark connected timeline */}
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții extrasul multilingv în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Datele', desc: 'Introduci datele actului de naștere: data, locul înregistrării și numele părinților.', icon: User },
                { step: 2, title: 'Semnezi Împuternicirea', desc: 'Încarci actul de identitate, faci un selfie de verificare și semnezi electronic împuternicirea.', icon: FileText },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — onorariul avocatului partener e inclus în preț.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești extrasul electronic și/sau prin curier.`, icon: CheckCircle },
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

        {/* Needs + timing */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <IdCard className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-secondary-900">Acte necesare pentru extrasul multilingv</h2>
                </div>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Act de identitate valabil (CI sau pașaport) — îl scanezi direct în formular',
                    'Selfie cu actul de identitate, pentru verificarea identității',
                    'Datele actului de naștere: data, locul înregistrării, numele părinților',
                    'Atât — împuternicirea o semnezi electronic, direct în wizard',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {row}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-neutral-600 mt-4">
                  Formularul online te ghidează pas cu pas — nu trebuie să pregătești nimic în avans.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-secondary-900">Cât durează</h2>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  În mod standard, eliberarea extrasului multilingv durează
                  <strong> {formatEstimatedDays(service)}</strong>, în funcție de oficiul stării civile
                  care deține actul de naștere și de timpul de procesare al primăriei. Livrarea electronică
                  ajunge imediat ce documentul e eliberat, iar originalul vine prin curier — inclusiv{' '}
                  <strong>internațional, prin DHL</strong>, dacă ești în străinătate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Extras Multilingv Certificat de Naștere"
          faqs={[
            { q: 'Ce este extrasul multilingv de pe certificatul de naștere?', a: 'Este un formular standard multilingv, introdus prin Regulamentul (UE) 2016/1191, care însoțește certificatul de naștere și redă datele acestuia în limbile oficiale ale statelor membre. Rolul lui este să facă actul acceptat în alt stat UE fără traducere.' },
            { q: 'Înlocuiește traducerea și apostila?', a: 'Da, în interiorul Uniunii Europene: formularul standard multilingv elimină nevoia de traducere autorizată și de apostilă pentru certificatul de naștere. Pentru țări din afara UE rămâne necesară apostila de la Haga plus traducerea legalizată.' },
            { q: 'Cât costă extrasul multilingv?', a: 'Serviciul complet costă 798 RON — totul inclus: onorariul avocatului partener, depunerea cererii prin împuternicire și livrarea. Nu există taxe ascunse.' },
            { q: 'Pot comanda și certificatul de naștere împreună cu extrasul?', a: 'Da, și e varianta cea mai avantajoasă: adaugi certificatul (duplicat) la pachet pentru doar +498 RON, față de 998 RON cât costă comandat separat — economisești 500 RON. Există și calea inversă: comanzi certificatul de naștere la 998 RON și adaugi extrasul multilingv ca opțiune, la +398 RON.' },
            { q: 'Când am nevoie de extrasul multilingv?', a: 'Când prezinți certificatul de naștere unei autorități dintr-un alt stat UE: căsătorie în străinătate, permis de ședere sau dosar de muncă, înscrierea copilului la școală, alocații și asigurări sociale sau alte dosare administrative.' },
            { q: 'De unde se eliberează și cine depune cererea?', a: 'Se eliberează de serviciul de stare civilă al primăriei care deține actul de naștere. Prin eGhișeul, avocatul nostru partener depune cererea prin împuternicire — pe care o semnezi electronic direct în formular — fără să te deplasezi la ghișeu.' },
            { q: 'Cât durează și cum primesc documentul?', a: `Termenul standard este de ${formatEstimatedDays(service)}, în funcție de oficiul stării civile care deține actul. Primești extrasul electronic pe email și/sau în original prin curier, inclusiv internațional prin DHL, oriunde în lume.` },
            { q: 'Ce acte îmi trebuie ca să comand?', a: 'Doar actul de identitate (îl scanezi în formular), un selfie cu actul pentru verificarea identității și datele actului de naștere: data, locul înregistrării și numele părinților. Wizard-ul online te ghidează pas cu pas.' },
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
                Gata să obții Extrasul Multilingv?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completezi datele online, fără drum la Starea Civilă. Primești documentul în {formatEstimatedDays(service)},
                valabil în toată Uniunea Europeană.
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
