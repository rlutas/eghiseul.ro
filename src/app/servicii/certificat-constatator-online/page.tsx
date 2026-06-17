import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import {
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
  X,
} from 'lucide-react';
import { Service, ServiceOption } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { SystemStatus } from '@/components/services/system-status';
import { ReviewsSection } from '@/components/services/reviews-section';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { ServicePrice } from '@/components/services/service-price';
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT_LABEL } from '@/config/contact';

// Database slug (order pipeline identifier). URL path uses the WP slug
// (certificat-constatator-ONLINE) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'certificat-constatator';
const PAGE_PATH = '/servicii/certificat-constatator-online/';
const SCHEMA_SLUG = 'certificat-constatator-online';
const TITLE = 'Certificat Constatator ONRC Online — de la 79 RON';
const DESCRIPTION =
  'Obține Certificat Constatator online de la ONRC, cu datele actuale ale firmei: ' +
  'sediu, asociați, administratori, capital social și obiect de activitate. ' +
  'De la 79 RON, pe firmă, persoană fizică sau cu istoric. 100% online, livrare pe email.';
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
    { name: 'Certificat Constatator pe Firmă', price: 79, url: `${BASE_URL}${PAGE_PATH}` },
    { name: 'Certificat Constatator Persoană Fizică', price: 79, url: `${BASE_URL}${PAGE_PATH}` },
    { name: 'Certificat Constatator cu Istoric', price: 487, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatConstatatorPage() {
  const data = await getService();
  if (!data) notFound();

  const { service } = data;

  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));
  const exVat = (v: number) => Math.round((v / 1.21) * 100) / 100;

  // The 3 real document types issued via ONRC (prices = VAT-inclusive total).
  const docTypes = [
    {
      icon: Building2,
      title: 'Certificat Constatator pe Firmă',
      desc: 'Situația la zi a unei societăți: date de identificare, sediu social, coduri CAEN, administratori și asociați. Cel mai cerut (bănci, ANAF, licitații).',
      price: 79,
      featured: true,
    },
    {
      icon: Users,
      title: 'Certificat Constatator Persoană Fizică',
      desc: 'Verifică dacă o persoană fizică deține calitatea de asociat sau administrator în firme înregistrate la Registrul Comerțului.',
      price: 79,
      featured: false,
    },
    {
      icon: Clock,
      title: 'Certificat Constatator cu Istoric',
      desc: 'Evoluția completă a firmei — toate modificările de la înființare până în prezent. Util în litigii, due diligence și verificări amănunțite.',
      price: 487,
      featured: false,
    },
  ];

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
                      'Alegi tipul: pe firmă, persoană fizică sau cu istoric',
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

        {/* Trust strip */}
        <section className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 max-w-[1100px] py-6 lg:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Zap, value: 'Câteva minute', label: 'Eliberare automată 24/7' },
                { icon: Landmark, value: 'ONRC', label: 'Document oficial semnat' },
                { icon: Building2, value: 'Doar CUI-ul', label: 'Fără cont RECOM' },
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
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Despre serviciu
            </span>
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
                <strong> certificatul constatator</strong> pe email, semnat electronic și verificabil la ONRC. Îl poți
                solicita <strong>pe firmă</strong>, <strong>pe persoană fizică</strong> sau <strong>cu istoric</strong>.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Cât costă și de unde obții certificatul constatator
                </h3>
                <p className="text-sm text-neutral-700">
                  Pentru fiecare certificat constatator, ONRC percepe o <strong>taxă oficială</strong>. Îl poți obține
                  personal la ghișeul ONRC sau prin portalul RECOM online (dacă ai cont și semnătură electronică). Prin
                  eGhișeul plătești <strong>de la {service.base_price} RON cu taxele ONRC incluse</strong>, 100% online,
                  fără cont RECOM și fără deplasare — primești documentul pe email.
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

        {/* The 3 document types — highlighted */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Tipuri disponibile
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">3 tipuri de certificat constatator</h2>
              <p className="text-neutral-600 max-w-xl mx-auto">Alegi tipul de care ai nevoie direct în formularul de comandă.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {docTypes.map((t) => (
                <div
                  key={t.title}
                  className={`relative rounded-3xl border-2 bg-white p-6 lg:p-7 flex flex-col ${t.featured ? 'border-primary-500 shadow-[0_8px_28px_rgba(236,185,95,0.18)]' : 'border-neutral-200'}`}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-6 inline-block rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-secondary-900">
                      Cel mai cerut
                    </span>
                  )}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200">
                    <t.icon className="h-6 w-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1.5">{t.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">{t.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-secondary-900">{fmt(exVat(t.price))}</span>
                    <span className="text-sm font-bold text-neutral-400">RON</span>
                  </div>
                  <p className="text-xs text-neutral-500">+ TVA 21% · {fmt(t.price)} RON cu TVA · taxe ONRC incluse</p>
                </div>
              ))}
            </div>

            <div className="mt-8 max-w-3xl mx-auto rounded-2xl border border-neutral-200 bg-white p-5 text-center">
              <p className="text-sm text-neutral-700">
                <strong>Cât este valabil:</strong> certificatul reflectă situația din ziua eliberării. În practică,
                autoritățile și partenerii cer un certificat emis în <strong>ultimele 30 de zile</strong>; la licitațiile
                publice (SEAP/SICAP) se acceptă de regulă unul nu mai vechi de 30 de zile.
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Nu ești sigur ce tip îți trebuie?{' '}
                <Link href="/cele-4-tipuri-de-certificat-constatator-online/" className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Vezi ghidul cu toate tipurile de certificat constatator
                </Link>
                .
              </p>
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții certificatul constatator în 4 pași, 100% online — fără drum la ghișeu.</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Introduci CUI-ul', desc: 'Completezi codul unic de înregistrare. Preluăm automat datele din ONRC.', icon: Building2 },
                { step: 2, title: 'Alegi Tipul', desc: 'Pe firmă, pe persoană fizică sau cu istoric, în funcție de nevoie.', icon: FileText },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele ONRC sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: 'În câteva minute primești certificatul pe email (automat, 24/7).', icon: CheckCircle },
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

        {/* Bine de știut — fără taxă de urgență + edge case */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Bine de știut
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">Transparent, fără surprize</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-green-200 bg-green-50/60 p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-1.5">Fără taxă de urgență</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Sistemul nostru depune și emite cererile <strong>automat, 24/7</strong> — primești certificatul în
                    câteva minute, <strong>fără taxă de urgență</strong>. La alți operatori, urgența costă în plus.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-1.5">Dacă apare o întârziere</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Dacă <strong>CUI-ul introdus este greșit</strong> sau sistemul ONRC este în mentenanță, certificatul
                    se eliberează în <strong>timpul programului de lucru</strong> și e posibil să te contactăm pentru
                    verificare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison — eGhișeul vs alți operatori vs ghișeu vs portal (CF parity) */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                De ce eGhișeul
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                eGhișeul vs alți operatori, ghișeul ONRC și portalul RECOM
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Același certificat oficial ONRC — diferă timpul, taxele și comoditatea.
              </p>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] min-w-[800px] text-sm">
                <div className="bg-neutral-50 p-4 font-semibold text-secondary-900" />
                <div className="bg-primary-500 p-4 text-center font-extrabold text-secondary-900">eGhișeul</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Alți operatori</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Ghișeu ONRC</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Portal RECOM</div>
                {[
                  ['Timp de obținere', 'Câteva minute', 'În program de lucru', 'Drum + așteptare', 'Cont + semnătură'],
                  ['Taxă de urgență', '0 RON', '~19 lei', '—', '—'],
                  ['Disponibil 24/7', true, false, false, true],
                  ['Cont/semnătură necesare', false, false, '—', true],
                  ['Deplasare la ghișeu', false, false, true, false],
                  ['Taxe ONRC incluse', true, 'Variabil', 'Separat', 'Separat'],
                  ['Livrare pe email', 'Automat', true, 'Ridici fizic', 'Manual'],
                ].map((row, i) => (
                  <div key={row[0] as string} className="contents">
                    <div className={`p-4 font-medium text-secondary-800 border-t border-neutral-100 ${i % 2 ? 'bg-neutral-50/50' : ''}`}>{row[0]}</div>
                    {[1, 2, 3, 4].map((col) => {
                      const v = row[col];
                      const highlight = col === 1;
                      return (
                        <div key={col} className={`flex items-center justify-center p-4 border-t border-neutral-100 text-center ${highlight ? 'bg-primary-50' : i % 2 ? 'bg-neutral-50/50' : ''}`}>
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
              <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă certificatul acum</OrderButton>
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat Constatator ONRC"
          faqs={[
            { q: 'Ce este certificatul constatator?', a: 'Este documentul oficial ONRC care atestă datele actuale ale unei firme: denumire, sediu, CUI, asociați, administratori, capital social și obiect de activitate. Este „cartea de identitate” a firmei la Registrul Comerțului.' },
            { q: 'Ce tipuri de certificat constatator pot comanda?', a: 'Trei: pe firmă (situația la zi a societății), pe persoană fizică (dacă o persoană deține calitatea de asociat/administrator în firme) și cu istoric (toate modificările firmei de la înființare până în prezent).' },
            { q: 'Certificatul constatator este la zi?', a: 'Da. Certificatul reflectă situația firmei din ziua eliberării, cu toate mențiunile actualizate înscrise la ONRC până la acel moment.' },
            { q: 'Cât durează eliberarea?', a: 'De obicei câteva minute — sistemul emite automat, 24/7. În cazuri rare (procesare ONRC mai lentă) poate dura mai mult.' },
            { q: 'Cât costă un certificat constatator?', a: `De la ${service.base_price} RON cu taxele ONRC incluse (pe firmă sau pe persoană fizică); varianta cu istoric este 487 RON cu TVA. Fără costuri ascunse.` },
            { q: 'De unde obțin certificatul constatator?', a: 'De la Oficiul Național al Registrului Comerțului (ONRC). Prin eGhișeul îl obții 100% online, fără cont RECOM și fără drum la ghișeu — îl primești pe email.' },
            { q: 'Care e diferența dintre certificatul de bază și cel extins?', a: 'Sunt denumiri folosite uzual pentru certificatul pe firmă: „de bază" = situația la zi a societății, iar „extins" = aceleași date plus mențiuni și detalii suplimentare. La noi îl comanzi ca certificat constatator pe firmă, care include datele complete.' },
            { q: 'Se poate obține gratuit certificatul constatator?', a: 'Anumite informații sunt disponibile gratuit prin portalul RECOM al ONRC, dar certificatul constatator oficial (semnat electronic) presupune o taxă ONRC și, de regulă, cont și semnătură electronică. Prin eGhișeul îl primești fără cont și fără deplasare.' },
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
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[360px] w-[760px] max-w-[90%] rounded-full bg-primary-500/10 blur-[120px]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" aria-hidden="true" />
          <div className="relative container mx-auto px-4 max-w-[760px] text-center">
            <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
              Gata să obții Certificatul Constatator?
            </h2>
            <p className="text-lg text-white/75 mb-8 max-w-xl mx-auto">
              Ai nevoie doar de CUI-ul firmei. Primești documentul în câteva minute (automat, 24/7).
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
              <WhatsAppButton message="Bună ziua! Am o întrebare despre Certificatul Constatator." />
            </div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/60">
              <svg className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <strong className="text-white/90">{GOOGLE_RATING.toString().replace('.', ',')}</strong> din {GOOGLE_REVIEW_COUNT_LABEL} de recenzii Google
            </p>
          </div>
        </section>
      </main>

      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />

      <Footer />
    </>
  );
}
