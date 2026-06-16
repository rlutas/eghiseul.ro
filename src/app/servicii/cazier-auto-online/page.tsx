import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  ChevronRight,
  Car,
  Search,
  Mail,
  Gauge,
  Users,
  AlertTriangle,
  ShoppingCart,
  Banknote,
  Tag,
  Info,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { ServicePrice } from '@/components/services/service-price';

// Database slug (order pipeline identifier). URL path uses an SEO slug
// (cazier-auto-online) targeting the primary search query.
const SERVICE_SLUG = 'cazier-auto';
const PAGE_PATH = '/servicii/cazier-auto-online/';
const SCHEMA_SLUG = 'cazier-auto-online';
const TITLE = 'Cazier Auto Online — Istoric Vehicul, 198 RON';
const DESCRIPTION =
  'Cazier Auto online — istoricul complet al vehiculului: accidente, daune, ' +
  'kilometraj real și proprietari anteriori. 198 RON, rapid, livrat pe email. ' +
  'Verifică orice mașină second-hand înainte să o cumperi.';
const DATE_PUBLISHED = '2026-06-14';
const DATE_MODIFIED = '2026-06-14';

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
  ogImage: '/og/default.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Cazier Auto Online',
  description:
    'Serviciu de obținere a istoricului complet al unui vehicul (cazier auto): accidente, daune, ' +
    'kilometraj real, proprietari anteriori și verificări de furt, leasing sau gajuri. Procesare ' +
    '100% online, livrare rapidă pe email.',
  serviceType: 'Document Processing — Auto',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  reviewedBy: {
    name: 'Departamentul Juridic eGhișeul.ro',
    jobTitle: 'Echipă de specialiști drept administrativ',
    organizationName: 'RapidCert SRL',
  },
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Cazier Auto', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Cazier Auto (Standard)', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CazierAutoOnlinePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // What you verify with a vehicle history report
  const checks = [
    { icon: AlertTriangle, title: 'Accidente & daune', desc: 'Istoric de accidente, daune totale și reparații majore raportate.' },
    { icon: Gauge, title: 'Kilometraj real', desc: 'Verifică kilometrajul declarat și depistează frauda de km (rulaj dat înapoi).' },
    { icon: Users, title: 'Proprietari anteriori', desc: 'Numărul și succesiunea proprietarilor de-a lungul timpului.' },
    { icon: Shield, title: 'Furt, leasing & gajuri', desc: 'Status de furt, contracte de leasing active sau gajuri și sarcini.' },
  ];

  const useCases = [
    { icon: ShoppingCart, title: 'Cumperi mașină second-hand', items: ['Verificare înainte de ofertă', 'Confirmi declarațiile vânzătorului', 'Eviți capcanele'] },
    { icon: Banknote, title: 'Verifici înainte de plată', items: ['Înainte de avans', 'Înainte de transfer', 'Negociere informată'] },
    { icon: Shield, title: 'Evaluare asigurare', items: ['Istoric daune', 'Risc real', 'Dosar complet'] },
    { icon: Tag, title: 'Vânzare transparentă', items: ['Dovedești istoricul curat', 'Crești încrederea', 'Vinzi mai repede'] },
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
                    <Search className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Istoric Vehicul
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Cazier Auto Online
                  <span className="block text-primary-500">Istoric Complet Vehicul</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cazierul auto</strong> îți arată istoricul real al unei
                    mașini înainte să o cumperi. Îl obții rapid de la noi:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Introduci numărul de înmatriculare sau seria de șasiu (VIN)',
                      'Verificăm bazele de date cu istoricul vehiculului',
                      'Plătești securizat, fără taxe ascunse',
                      `Primești raportul pe email în ${formatEstimatedDays(service)}`,
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg">
                  <span className="text-xs sm:text-sm font-semibold text-secondary-900">Google Reviews</span>
                  <div className="w-px h-5 sm:h-6 bg-neutral-200" />
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-secondary-900">4.9</span>
                  <span className="text-[10px] sm:text-xs text-neutral-500">• 450+ recenzii</span>
                </div>
              </div>

              {/* Price card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        ISTORIC COMPLET
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
                        <p className="text-xs text-neutral-500">Rapid pe email</p>
                      </div>
                    </div>

                    {service.urgent_days && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-secondary-900" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary-900 text-sm">Urgent: {service.urgent_days} zile lucrătoare</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Raport PDF complet</p>
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
                        <span className="text-xs">Raport detaliat</span>
                      </div>
                    </div>

                    <GoogleReviewsBadge variant="bar" className="mt-3" />
                  </div>
                </div>
              </div>
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
                <strong>Cazierul auto</strong> (sau „istoricul auto”) este un raport care adună tot ce s-a întâmplat
                cu un vehicul de-a lungul timpului: <strong>accidente și daune</strong>, evoluția
                <strong> kilometrajului</strong>, numărul de <strong>proprietari anteriori</strong> și eventuale
                probleme juridice precum furt, leasing sau gajuri. Pe scurt, îți arată adevăratul istoric al unei
                mașini, dincolo de ce spune vânzătorul.
              </p>
              <p>
                Prin eGhișeul obții <strong>cazierul auto online</strong>, fără drumuri și fără cont. Ai nevoie doar
                de <strong>numărul de înmatriculare</strong> sau de <strong>seria de șasiu (VIN)</strong>. Verificăm
                bazele de date relevante și îți trimitem raportul complet pe email, ca să poți decide în cunoștință
                de cauză înainte de a cumpăra o mașină second-hand.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                  Cazier auto (vehicul) vs. cazier rutier / cazier permis auto (șofer)
                </h3>
                <p className="text-sm text-neutral-700">
                  Acest serviciu este <strong>cazierul vehiculului</strong> — istoricul mașinii (accidente, km,
                  proprietari). El este diferit de <strong>cazierul rutier</strong> (numit și „cazier permis auto”),
                  care este <strong>cazierul șoferului</strong>: punctele de penalizare, sancțiunile și abaterile
                  înregistrate la <strong>DRPCIV / Poliția Rutieră</strong> pe numele unei persoane. Dacă vrei
                  istoricul unei <em>mașini</em>, ești în locul potrivit. Dacă vrei situația de pe
                  <em> permisul tău de conducere</em>, acela este un alt document, obținut de la autoritățile rutiere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What you verify — feature cards */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Ce verifici
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce verifici cu cazierul auto
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Raportul îți arată într-un singur loc datele care contează cel mai mult la o mașină second-hand.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {checks.map((it) => (
                <div key={it.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
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
                <strong>Frauda de kilometraj</strong> este una dintre cele mai frecvente capcane la mașinile
                second-hand. Cazierul auto compară kilometrajul raportat în timp și semnalează inconsistențele.
              </p>
            </div>
          </div>
        </section>

        {/* Service options (dynamic) */}
        {options.length > 0 && (
          <section className="py-12 lg:py-20 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-[1400px]">
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                  Personalizare
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Opțiuni Disponibile</h2>
                <p className="text-neutral-600 max-w-xl mx-auto">Adaugă servicii extra pentru comanda ta</p>
              </div>
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
            </div>
          </section>
        )}

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-white">
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
                <div key={uc.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
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

        {/* How it works */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Cum Funcționează?</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">Obții cazierul auto în 4 pași, 100% online</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { step: 1, title: 'Introduci Datele Mașinii', desc: 'Completezi numărul de înmatriculare sau seria de șasiu (VIN).', icon: Car },
                { step: 2, title: 'Verificăm Bazele de Date', desc: 'Interogăm sursele cu istoricul vehiculului și consolidăm raportul.', icon: Search },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay sau Google Pay — fără taxe ascunse.', icon: Shield },
                { step: 4, title: 'Primești Raportul', desc: `În ${formatEstimatedDays(service)} primești raportul complet pe email.`, icon: CheckCircle },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="bg-white rounded-2xl p-6 h-full border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-secondary-900 font-bold text-lg group-hover:scale-110 transition-transform">
                        {item.step}
                      </div>
                      <item.icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-primary-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content + clarification — targets "ce contine" + driver-record intent */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Ce conține raportul auto</h2>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Istoric de accidente, daune și reparații majore',
                    'Evoluția kilometrajului și alerte de fraudă km',
                    'Numărul și succesiunea proprietarilor anteriori',
                    'Status furt, leasing activ, gajuri și sarcini',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Cauți cazierul șoferului?</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Dacă te interesează <strong>cazierul rutier</strong> sau „<strong>cazierul permis auto</strong>” —
                  adică punctele de penalizare și abaterile de pe <strong>permisul de conducere</strong> al unei
                  persoane (date gestionate de <strong>DRPCIV / Poliția Rutieră</strong>) — acela este un document
                  despre <strong>șofer</strong>, nu despre mașină. Serviciul de pe această pagină acoperă
                  <strong> istoricul vehiculului</strong>, nu situația permisului.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Cazier Auto"
          faqs={[
            { q: 'Ce este cazierul auto?', a: 'Este un raport cu istoricul complet al unui vehicul: accidente, daune, evoluția kilometrajului, proprietari anteriori și verificări de furt, leasing sau gajuri. Te ajută să cunoști starea reală a unei mașini înainte să o cumperi.' },
            { q: 'Ce conține cazierul auto?', a: 'Conține istoricul de accidente și daune, kilometrajul raportat în timp (cu alerte de fraudă km), numărul de proprietari anteriori și statusul juridic al mașinii (furt, leasing activ, gajuri și sarcini).' },
            { q: 'Care e diferența dintre cazier auto și cazier rutier / cazier permis auto?', a: 'Cazierul auto se referă la mașină (istoricul vehiculului). Cazierul rutier sau „cazierul permis auto” se referă la șofer — punctele de penalizare și abaterile de pe permisul de conducere, gestionate de DRPCIV / Poliția Rutieră. Acest serviciu acoperă istoricul vehiculului, nu situația permisului.' },
            { q: 'Ce date îmi trebuie pentru a comanda?', a: 'Ai nevoie de numărul de înmatriculare sau de seria de șasiu (VIN) a mașinii. VIN-ul (17 caractere) oferă cea mai precisă identificare a vehiculului.' },
            { q: 'Cât durează să primesc raportul?', a: `${formatEstimatedDays(service)} în mod standard. Există și opțiunea de procesare urgentă pentru livrare și mai rapidă.` },
            { q: 'Este valabil pentru orice mașină?', a: 'Funcționează pentru majoritatea autovehiculelor înmatriculate. Cantitatea de informații disponibile poate varia în funcție de istoricul și sursele de date asociate vehiculului respectiv.' },
            { q: 'Cum primesc cazierul auto?', a: 'Îl primești pe email, ca raport PDF complet. Nu trebuie să te deplasezi și nu ai nevoie de niciun cont.' },
            { q: 'Este legal să verific istoricul unei mașini?', a: 'Da. Verificarea istoricului unui vehicul pe baza numărului de înmatriculare sau a VIN-ului este o practică uzuală și legală înainte de o tranzacție auto.' },
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
                Gata să afli istoricul real al mașinii?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de numărul de înmatriculare sau seria de șasiu. Primești raportul în {formatEstimatedDays(service)}.
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
