import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  Shield,
  Zap,
  FileText,
  CheckCircle,
  ChevronRight,
  Mail,
  Landmark,
  Scale,
  GraduationCap,
  Baby,
  HeartHandshake,
  Stethoscope,
  CreditCard,
  ScanFace,
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

// Database slug (order pipeline identifier). URL path uses the WP-parity slug
// (certificat-DE-integritate-comportamentala) to preserve indexed URL + backlinks.
const SERVICE_SLUG = 'certificat-integritate';
const PAGE_PATH = '/servicii/certificat-de-integritate-comportamentala/';
const SCHEMA_SLUG = 'certificat-de-integritate-comportamentala';
const TITLE = 'Certificat Integritate Comportamentală Online IGPR';
const DESCRIPTION =
  'Obții certificatul de integritate comportamentală online, fără drum la Poliție. ' +
  'Taxe IGPR incluse, livrare pe email în zile lucrătoare. Comandă acum.';
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
  ogImage: '/og/services/certificat-integritate.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Certificat de Integritate Comportamentală',
  description:
    'Serviciu de obținere a Certificatului de Integritate Comportamentală de la Inspectoratul ' +
    'General al Poliției Române (IGPR), conform Legii 118/2019. Document care atestă că persoana ' +
    'nu a fost sancționată pentru infracțiuni împotriva unor categorii vulnerabile, în special ' +
    'minori. Procesare 100% online, livrare email.',
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
    { name: 'Certificat de Integritate Comportamentală', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    {
      name: 'Certificat de Integritate Comportamentală (Standard)',
      price: 250,
      url: `${BASE_URL}${PAGE_PATH}`,
    },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatIntegritatePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // Targets the "cand ai nevoie de certificat de integritate comportamentala" cluster
  const useCases = [
    {
      icon: GraduationCap,
      title: 'Lucru cu minori',
      items: ['Școli și grădinițe', 'Creșe', 'Programe after-school'],
    },
    {
      icon: Baby,
      title: 'Sport & cluburi copii',
      items: ['Antrenori', 'Cluburi sportive', 'Tabere pentru copii'],
    },
    {
      icon: HeartHandshake,
      title: 'Voluntariat',
      items: ['ONG-uri cu minori', 'Programe educaționale', 'Activități sociale'],
    },
    {
      icon: Stethoscope,
      title: 'Medii sensibile',
      items: ['Personal medical', 'Asistență socială', 'Îngrijire persoane vulnerabile'],
    },
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
              <span className="text-white font-medium">Certificat de Integritate Comportamentală</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Scale className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Juridice
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    IGPR / Poliție
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat de Integritate Comportamentală
                  <span className="block text-primary-500">Online</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Certificatul de Integritate Comportamentală</strong> se
                    obține de la IGPR. Îl primești rapid prin noi, fără deplasare:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi formularul cu datele tale personale',
                      'Încarci actul de identitate și faci verificarea KYC',
                      'Plătești securizat (taxe oficiale incluse)',
                      `Primești certificatul pe email în ${formatEstimatedDays(service)}`,
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
                        TAXE OFICIALE INCLUSE
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
                        <p className="text-xs text-neutral-500">Zile lucrătoare</p>
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
                        <p className="text-xs text-neutral-500">PDF semnat electronic IGPR</p>
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
                        <span className="text-xs">Document oficial</span>
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
                { icon: Landmark, value: 'IGPR', label: 'Document oficial al Poliției' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Livrare estimată' },
                { icon: Mail, value: 'Pe email', label: 'PDF semnat electronic' },
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
              Ce este Certificatul de Integritate Comportamentală
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul de integritate comportamentala</strong> este documentul oficial eliberat de
                Inspectoratul General al Poliției Române (<strong>IGPR</strong>), introdus prin
                <strong> Legea 118/2019</strong>. El atestă faptul că persoana <strong>nu a fost condamnată sau
                sancționată</strong> pentru infracțiuni săvârșite asupra unor categorii de persoane vulnerabile,
                în special <strong>minori</strong>. Documentul este cerut tot mai des la angajarea în roluri care
                presupun contact direct cu copiii sau cu persoane aflate în situații de risc.
              </p>
              <p>
                Prin eGhișeul obții <strong>certificatul de integritate comportamentala online</strong>, fără drum
                la ghișeul Poliției. Procesul de <strong>eliberare certificat de integritate comportamentala
                online</strong> este complet digital: completezi datele, faci verificarea de identitate, plătești,
                iar noi depunem cererea și îți trimitem documentul pe email.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Îl poți obține și direct — dar prin noi e online, fără deplasare
                </h3>
                <p className="text-sm text-neutral-700">
                  Poți solicita <strong>certificat integritate comportamentala</strong> și personal, la ghișeul
                  IGPR sau prin platforma oficială (dacă ai cont și mijloacele de autentificare). Prin noi plătești
                  <strong> {service.base_price} RON cu taxele oficiale incluse</strong>, 100% online, fără cont la
                  Poliție și fără deplasare — primești documentul pe email.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Cât costă certificatul de integritate comportamentală? Este gratuit?
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Mulți caută „certificat de integritate comportamentala online gratuit”. În realitate, eliberarea{' '}
                  <strong>nu este gratuită</strong>: IGPR percepe o <strong>taxă oficială</strong> pentru fiecare
                  certificat. Diferența este cum o plătești. La ghișeul Poliției achiți taxa și te deplasezi personal;
                  prin eGhișeul plătești <strong>{service.base_price} RON cu taxa IGPR inclusă</strong>, completezi
                  totul online și primești documentul pe email — fără cont pe platforma oficială și fără drum la sediu.
                  Nu există costuri ascunse.
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed mt-3">
                  <Link
                    href="/ghid-complet-certificat-de-integritate-comportamentala/"
                    className="text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Vezi ghidul complet despre certificatul de integritate comportamentală
                  </Link>
                  .
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
                Când Ai Nevoie de Certificat de Integritate Comportamentală?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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

        <ReviewsSection />

        {/* Service options (dynamic) */}
        {options.length > 0 && (
          <section className="py-12 lg:py-20 bg-white">
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
                  <Card key={option.id} className="bg-neutral-50 border-2 border-neutral-200 hover:border-primary-400 transition-all hover:shadow-md">
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

        {/* How it works */}
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții certificatul de integritate comportamentală în 4 pași, 100% online — fără drum la Poliție.</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Formularul', desc: 'Introduci datele personale necesare pentru cererea la IGPR.', icon: FileText },
                { step: 2, title: 'Verificare Identitate', desc: 'Încarci actul de identitate și faci un selfie pentru verificarea KYC.', icon: ScanFace },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele oficiale sunt incluse în preț.', icon: CreditCard },
                { step: 4, title: 'Primești Certificatul', desc: `În ${formatEstimatedDays(service)} primești documentul pe email sau prin curier.`, icon: CheckCircle },
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

        {/* Specimen — what the certificate looks like */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Specimen
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Certificatul de Integritate Comportamentală — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul pe care îl primești este emis de IGPR (Poliția Română) conform Legii 118/2019,
                semnat electronic și livrat pe email.
              </p>
            </div>

            <div className="grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-14 items-center">
              {/* Specimen image — framed */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-500/10 to-secondary-900/5 rounded-[2rem] blur-xl" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl p-3 ring-1 ring-neutral-200 shadow-[0_20px_50px_rgba(6,16,31,0.16)]">
                  <Image
                    src="/images/specimens/certificat-integritate.png"
                    alt="Specimen certificat de integritate comportamentală emis de IGPR — exemplu cu date anonimizate"
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

              {/* Why it's official + legally valid */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                  Un document oficial, valabil legal
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Certificatul pe care îl primești este <strong>identic cu cel eliberat la ghișeul IGPR</strong> —
                  doar că îl primești pe email, fără drum și fără cont pe platforma oficială.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Landmark, title: 'Emis de IGPR (Poliția Română)', desc: 'Eliberat de Inspectoratul General al Poliției Române, conform Legii 118/2019.' },
                    { icon: Shield, title: 'Semnătură electronică', desc: 'Are aceeași valoare legală ca varianta cu ștampilă — îl folosești la angajator sau în dosar.' },
                    { icon: Scale, title: 'Atestă integritatea comportamentală', desc: 'Confirmă lipsa sancțiunilor pentru infracțiuni asupra minorilor și a persoanelor vulnerabile.' },
                    { icon: Mail, title: 'Livrat pe email, în PDF', desc: 'Gata de printat sau trimis mai departe, în zile lucrătoare de la plată.' },
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
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                    Acceptat de angajatori și instituții
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Difference vs cazier judiciar + validity — neutral-50 so the white
            Specimen section above alternates cleanly; inner cards → bg-white. */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Diferența față de cazierul judiciar</h2>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                  Certificatul de integritate comportamentală <strong>nu este același lucru</strong> cu cazierul
                  judiciar. Cazierul judiciar prezintă toate condamnările penale ale unei persoane, în timp ce
                  acest certificat are un <strong>scop mult mai restrâns</strong>: atestă strict că persoana nu a
                  fost sancționată pentru infracțiuni împotriva minorilor sau a altor categorii vulnerabile.
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                  Vrei comparația detaliată?{' '}
                  <Link href="/cazier-judiciar-vs-certificat-integritate-comportamentala/" className="text-primary-600 font-semibold hover:text-primary-700">
                    cazier judiciar vs. certificat de integritate comportamentală
                  </Link>
                  .
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Ai nevoie și de cazierul judiciar?{' '}
                  <Link href="/servicii/cazier-judiciar-online/" className="text-primary-600 font-semibold hover:text-primary-700">
                    Obține cazierul judiciar online
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Cât este valabil</h2>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Certificatul de integritate comportamentală este valabil, de regulă, <strong>aproximativ 6
                  luni</strong> de la data eliberării. În practică, valabilitatea efectivă depinde de cerințele
                  instituției sau ale angajatorului care îl solicită — unii acceptă doar un certificat emis recent.
                  Îți recomandăm să verifici termenul cerut înainte de a depune dosarul.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Online indiferent de oraș — white, keeps the pre-FAQ section bg-white */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">
                Obții certificatul online, indiferent de oraș
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                Serviciul este <strong>100% online</strong>, așa că nu contează în ce localitate te afli: poți obține
                certificatul de integritate comportamentală din <strong>București, Cluj, Iași, Timișoara, Constanța
                sau orice alt județ</strong>, fără să te prezinți la un ghișeu IGPR local. Cererea se depune electronic
                la Inspectoratul General al Poliției Române, iar documentul îți este livrat pe email.
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Unele instituții sau angajatori folosesc denumirea de{' '}
                <strong>„adeverință de integritate comportamentală”</strong> — este vorba despre <strong>același
                document oficial</strong> emis de IGPR conform Legii 118/2019. Indiferent de denumirea cerută în
                dosar, certificatul obținut prin eGhișeul este documentul valabil legal.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat de Integritate Comportamentală"
          faqs={[
            { q: 'Ce este certificatul de integritate comportamentală?', a: 'Este documentul oficial eliberat de IGPR (Poliția Română) care atestă că persoana nu a fost sancționată pentru infracțiuni împotriva unor categorii vulnerabile, în special minori. A fost introdus prin Legea 118/2019.' },
            { q: 'Care este diferența față de cazierul judiciar?', a: 'Nu sunt același document. Cazierul judiciar arată toate condamnările penale, pe când certificatul de integritate comportamentală are un scop mult mai restrâns — atestă strict lipsa sancțiunilor pentru infracțiuni asupra minorilor și a persoanelor vulnerabile.' },
            { q: 'Când este obligatoriu?', a: 'Conform Legii 118/2019, este cerut la angajarea în roluri care presupun contact direct cu minori sau cu persoane vulnerabile: școli, creșe, after-school, cluburi sportive de copii, voluntariat și medii sensibile precum cel medical sau social.' },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)} în mod standard. Există și opțiunea Urgent, în ${formatUrgentDays(service)}.` },
            { q: 'Cât este valabil certificatul?', a: 'De regulă aproximativ 6 luni de la eliberare, însă valabilitatea efectivă depinde de cerințele instituției sau angajatorului care îl solicită. Verifică termenul cerut înainte de depunere.' },
            { q: 'De ce aveți nevoie de datele mele personale?', a: 'Datele personale și actul de identitate sunt necesare pentru a depune cererea la IGPR în numele tău și pentru verificarea de identitate (KYC), cerută de procedura oficială. Datele sunt prelucrate securizat.' },
            { q: 'Pot obține certificatul de integritate comportamentală online, fără să merg la Poliție?', a: 'Da. Întregul proces este online: completezi formularul, faci verificarea de identitate și plătești, iar noi depunem cererea la IGPR. Primești certificatul pe email, fără deplasare și fără cont pe platforma oficială.' },
            { q: 'Certificatul de integritate comportamentală este gratuit?', a: 'Nu. IGPR percepe o taxă oficială pentru eliberare. Prin eGhișeul plătești prețul afișat, cu taxa oficială inclusă, fără costuri suplimentare.' },
            { q: 'Pot obține certificatul în Cluj, București sau alt oraș?', a: 'Da. Pentru că serviciul este 100% online, îl poți obține din orice județ — București, Cluj, Iași, Timișoara, Constanța sau oriunde te afli — fără să te deplasezi la un sediu IGPR local.' },
            { q: '„Adeverința de integritate comportamentală” este același lucru cu certificatul?', a: 'Da. Unele instituții folosesc denumirea de adeverință, dar se referă la același document oficial emis de IGPR conform Legii 118/2019.' },
            { q: 'Cum primesc documentul?', a: 'Pe email, ca PDF semnat electronic de IGPR. La cerere, certificatul poate fi livrat și prin curier.' },
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
                Gata să obții Certificatul de Integritate Comportamentală?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completezi formularul, faci verificarea de identitate și primești documentul în {formatEstimatedDays(service)}.
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
