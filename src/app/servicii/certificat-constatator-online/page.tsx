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
  FileText,
  CheckCircle,
  ChevronRight,
  Building2,
  Search,
  Mail,
  Landmark,
  Banknote,
  Users,
  Gavel,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { Service, ServiceOption } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { SystemStatus } from '@/components/services/system-status';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { ServicePrice } from '@/components/services/service-price';

// Database slug (order pipeline identifier). URL path uses the WP slug
// (certificat-constatator-ONLINE) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'certificat-constatator';
const PAGE_PATH = '/servicii/certificat-constatator-online/';
const SCHEMA_SLUG = 'certificat-constatator-online';
const TITLE = 'Certificat Constatator ONRC Online — 119.99 RON';
const DESCRIPTION =
  'Obține Certificat Constatator online de la ONRC, cu datele actuale ale firmei: ' +
  'sediu, asociați, administratori, capital social și obiect de activitate. ' +
  '119.99 RON, necesar la licitații și due diligence, 100% online, livrare pe email.';
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
  name: 'Certificat Constatator ONRC',
  description:
    'Serviciu de obținere a Certificatului Constatator de la Oficiul Național al Registrului ' +
    'Comerțului (ONRC). Document cu datele actuale ale firmei: sediu social, asociați, ' +
    'administratori, capital social și obiect de activitate. Procesare 100% online, livrare email.',
  serviceType: 'Document Processing — Business Registry',
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
    { name: 'Certificat Constatator', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Certificat Constatator (Standard)', price: 119.99, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatConstatatorPage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // What the certificate contains — targets "ce contine certificatul constatator"
  const contents = [
    { icon: Building2, title: 'Denumire, sediu & CUI', desc: 'Datele de identificare ale firmei: denumire, formă juridică, sediu social și cod unic de înregistrare.' },
    { icon: Users, title: 'Asociați & administratori', desc: 'Structura acționariatului, asociații și persoanele cu drept de reprezentare (administratori).' },
    { icon: Banknote, title: 'Capital & obiect de activitate', desc: 'Capitalul social subscris și vărsat, obiectul principal de activitate și codurile CAEN.' },
    { icon: MapPin, title: 'Puncte de lucru & mențiuni', desc: 'Sedii secundare, puncte de lucru și mențiunile înscrise la Registrul Comerțului.' },
  ];

  const useCases = [
    { icon: Gavel, title: 'Licitații publice', items: ['Achiziții SEAP/SICAP', 'Documentație de calificare', 'Eligibilitate ofertant'] },
    { icon: Briefcase, title: 'Contracte & parteneriate', items: ['Semnare contracte', 'Parteneriate comerciale', 'Verificare partener'] },
    { icon: Search, title: 'Due diligence', items: ['Verificare firmă', 'Audit juridic', 'Tranzacții & achiziții'] },
    { icon: Landmark, title: 'Bancă & credit firmă', items: ['Credit pentru firmă', 'Deschidere cont', 'Garanții bancare'] },
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
              <span className="text-white font-medium">Certificat Constatator</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Building2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Comerciale
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    ONRC
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat Constatator Online
                  <span className="block text-primary-500">de la Registrul Comerțului (ONRC)</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Certificatul Constatator</strong> conține datele
                    actuale ale unei firme din Registrul Comerțului. Îl obții rapid de la noi:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Introduci CUI-ul firmei (preluăm automat datele ONRC)',
                      'Confirmi tipul certificatului (simplu, extins sau istoric)',
                      'Plătești securizat (taxe ONRC incluse)',
                      'Primești certificatul pe email, de obicei în câteva minute (24/7)',
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stare sistem — eliberare automată 24/7 */}
                <SystemStatus className="mt-5 max-w-[440px]" />
              </div>

              {/* Price card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        TAXE ONRC INCLUSE
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
                        <p className="font-semibold text-secondary-900 text-sm">Eliberare în câteva minute</p>
                        <p className="text-xs text-neutral-500">Automat, 24/7</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">PDF semnat electronic ONRC</p>
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

        {/* SEO Intro */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Ce este Certificatul Constatator ONRC și de unde se obține
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul constatator</strong> este documentul oficial eliberat de Oficiul Național al
                Registrului Comerțului (<strong>ONRC</strong>) care atestă datele actuale ale unei firme: denumirea,
                forma juridică, sediul social, codul unic de înregistrare (CUI), asociații, administratorii, capitalul
                social și obiectul de activitate. Este, practic, „cartea de identitate” a firmei la
                <strong> Registrul Comerțului</strong>.
              </p>
              <p>
                Prin eGhișeul obții <strong>certificatul constatator online</strong>, fără drum la ghișeul ONRC.
                Ai nevoie doar de CUI-ul firmei. Noi depunem cererea, plătim taxele ONRC și îți trimitem
                <strong> certificatul constatator</strong> pe email, semnat electronic și verificabil la ONRC. Poți
                solicita varianta simplă, <strong>certificat constatator extins</strong> sau cu istoric.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Certificat constatator de pe portalul ONRC vs. online prin eGhișeul
                </h3>
                <p className="text-sm text-neutral-700">
                  Certificatul constatator <strong>nu este gratuit</strong> — ONRC percepe o taxă oficială pentru
                  fiecare document. Îl poți obține personal la ghișeul ONRC sau prin portalul RECOM online (dacă ai
                  cont și semnătură electronică). Prin noi plătești <strong>{service.base_price} RON cu taxele ONRC
                  incluse</strong>, 100% online, fără cont RECOM și fără deplasare — primești documentul pe email.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What the certificate contains — targets "ce contine certificatul constatator" */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Conținut document
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce conține certificatul constatator
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Toate datele esențiale ale firmei, înscrise oficial la Registrul Comerțului.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {contents.map((it) => (
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
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-secondary-700">
                <strong>Nu știi CUI-ul firmei?</strong> Îl găsești pe factură, pe contract sau căutând firma
                <strong> după denumire</strong>. Noi preluăm automat datele din ONRC după ce introduci CUI-ul.
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
                Când Ai Nevoie de Certificat Constatator?
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
              <p className="text-neutral-600 max-w-2xl mx-auto">Obții certificatul constatator în 4 pași, 100% online</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { step: 1, title: 'Introduci CUI-ul', desc: 'Completezi codul unic de înregistrare al firmei. Preluăm automat datele din ONRC.', icon: Building2 },
                { step: 2, title: 'Confirmi Tipul', desc: 'Alegi tipul certificatului: simplu, extins sau cu istoric, în funcție de nevoie.', icon: FileText },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele ONRC sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: 'În câteva minute primești certificatul constatator pe email (automat, 24/7).', icon: CheckCircle },
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

        {/* Types + validity — targets "certificat constatator extins / la zi / valabilitate" */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Tipuri de certificat constatator</h2>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Simplu — datele actuale ale firmei la zi (denumire, sediu, administratori)',
                    'Extins — date complete: capital, obiect de activitate, mențiuni, puncte de lucru',
                    'Cu istoric — evoluția datelor firmei de la înființare până în prezent',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Cât este valabil</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Certificatul constatator</strong> reflectă situația firmei din ziua eliberării și este
                  considerat „la zi”. În practică, autoritățile și partenerii cer un certificat emis în
                  <strong> ultimele 30 de zile</strong>. Pentru <strong>licitații publice</strong> (SEAP/SICAP) se
                  acceptă de regulă un certificat <strong>nu mai vechi de 30 de zile</strong> la data deschiderii
                  ofertelor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat Constatator ONRC"
          faqs={[
            { q: 'Ce este certificatul constatator?', a: 'Este documentul oficial ONRC care atestă datele actuale ale unei firme: denumire, sediu, CUI, asociați, administratori, capital social și obiect de activitate. Este „cartea de identitate” a firmei la Registrul Comerțului.' },
            { q: 'Care e diferența dintre certificat simplu, extins și cu istoric?', a: 'Cel simplu conține datele de bază la zi (denumire, sediu, administratori). Cel extins include date complete: capital, obiect de activitate, mențiuni și puncte de lucru. Cel cu istoric arată evoluția datelor firmei de la înființare până în prezent.' },
            { q: 'Certificatul constatator este la zi?', a: 'Da. Certificatul reflectă situația firmei din ziua eliberării, cu toate mențiunile actualizate înscrise la ONRC până la acel moment.' },
            { q: 'Cât durează eliberarea?', a: 'De obicei câteva minute — sistemul emite automat, 24/7. În cazuri rare (procesare ONRC mai lentă) poate dura mai mult.' },
            { q: 'Pot obține certificat pentru orice firmă?', a: 'Da, pentru orice persoană juridică sau entitate înregistrată la Registrul Comerțului: SRL, SA, PFA, II sau IF. Ai nevoie doar de CUI-ul firmei.' },
            { q: 'Este valabil pentru licitații publice?', a: 'Da. Certificatul constatator este unul dintre documentele acceptate la licitațiile publice din SEAP/SICAP pentru a dovedi eligibilitatea și datele de identificare ale ofertantului.' },
            { q: 'Cât este valabil certificatul constatator?', a: 'Reflectă situația din ziua eliberării. În practică, autoritățile și partenerii cer un certificat emis în ultimele 30 de zile; la licitații se acceptă de regulă unul nu mai vechi de 30 de zile.' },
            { q: 'Cum primesc documentul?', a: 'Pe email, ca PDF semnat electronic de ONRC, cu autenticitate verificabilă la Registrul Comerțului.' },
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
                Gata să obții Certificatul Constatator?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de CUI-ul firmei. Primești documentul în câteva minute (automat, 24/7).
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
