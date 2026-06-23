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
  Heart,
  Globe,
  Mail,
  Landmark,
  Scale,
  ScrollText,
  Stamp,
  IdCard,
  Truck,
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

// Database slug (order pipeline identifier). URL path uses the SEO-friendly
// slug (eliberare-certificat-DE-celibat) to capture the search-intent phrasing.
const SERVICE_SLUG = 'certificat-celibat';
const PAGE_PATH = '/servicii/eliberare-certificat-de-celibat/';
const SCHEMA_SLUG = 'eliberare-certificat-de-celibat';
const TITLE = 'Certificat de Celibat Online România — 179 RON';
const DESCRIPTION =
  "Certificat de celibat online de la Starea Civilă, 179 RON, fără drum la ghișeu. Pentru căsătorie în străinătate, cetățenie sau altă localitate. Email + curier.";
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
  ogImage: '/og/services/certificat-celibat.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Certificat de Celibat Online',
  description:
    'Serviciu de obținere a Certificatului de Celibat (dovada că persoana nu este căsătorită), ' +
    'document de stare civilă necesar la căsătoria în străinătate, obținerea cetățeniei și alte ' +
    'proceduri juridice. Procesare 100% online, livrare email și curier.',
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
    { name: 'Certificat de Celibat', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Certificat de Celibat (Standard)', price: 179, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatCelibatPage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // Situations where a certificat de celibat is required
  const useCases = [
    { icon: Heart, title: 'Căsătorie în străinătate', items: ['Dosar de căsătorie', 'Cerut de primării străine', 'Dovadă stare civilă'] },
    { icon: Globe, title: 'Obținere cetățenie', items: ['Dosar de cetățenie', 'Naturalizare', 'Reședință permanentă'] },
    { icon: Scale, title: 'Proceduri juridice', items: ['Acte notariale', 'Litigii de familie', 'Recunoaștere drepturi'] },
    { icon: Landmark, title: 'Autorități străine', items: ['Dovadă stare civilă', 'Dosare administrative', 'Solicitări consulare'] },
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
              <span className="text-white font-medium">Certificat de Celibat</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <IdCard className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Personale
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Heart className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Stare Civilă
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat de Celibat
                  <span className="block text-primary-500">Online</span>
                </h1>

                <p className="text-base sm:text-lg text-primary-500/90 font-semibold mb-4">
                  Dovada că nu ești căsătorit(ă)
                </p>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Certificatul de Celibat</strong> atestă că nu
                    ești căsătorit(ă). Îl obții rapid de la noi:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi datele personale și starea civilă',
                      'Confirmi localitatea de domiciliu',
                      'Plătești securizat (fără cont sau deplasare)',
                      `Primești certificatul de celibat în ${formatEstimatedDays(service)}`,
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                        {step}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-white/75 text-xs sm:text-sm leading-relaxed">
                    Avocatul nostru colaborator, înscris în Barou, depune cererea prin împuternicire la
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
                        TAXE INCLUSE
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
                        <p className="text-xs text-neutral-500">Plus original prin curier</p>
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
                { icon: Clock, value: formatEstimatedDays(service), label: 'Livrare estimată' },
                { icon: Mail, value: 'Email + curier', label: 'Original livrat acasă' },
                { icon: Shield, value: 'Taxe incluse', label: 'Fără cont, fără cozi' },
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
              Ce este Certificatul de Celibat
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul de celibat</strong> (numit și <strong>certificat de stare civilă</strong> sau
                <strong> adeverință de celibat</strong>) este documentul de Stare Civilă care atestă că o
                persoană <strong>nu este căsătorită</strong>. Practic, este dovada legală a faptului că ești
                necăsătorit(ă) la data eliberării, eliberată pe baza datelor din registrele de stare civilă.
              </p>
              <p>
                Prin eGhișeul obții <strong>certificat de celibat online</strong>, fără drum la ghișeul de stare
                civilă. Documentul este folosit cel mai des pentru <strong>căsătoria în străinătate</strong>, dar și
                pentru dosare de cetățenie sau alte proceduri juridice. În România îl cunoști sub mai multe nume —
                <strong> certificat de celibat romania</strong>, certificat de stare civilă sau adeverință de celibat —
                dar se referă la același document.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  La ghișeu vs. online prin eGhișeul
                </h3>
                <p className="text-sm text-neutral-700">
                  În mod normal, certificatul de celibat se solicită personal la Serviciul de Stare Civilă din
                  localitatea de domiciliu, cu deplasare și timp de așteptare. Prin noi îl obții <strong>100% online</strong>,
                  fără cont și fără drum la ghișeu — completezi datele, confirmi localitatea de domiciliu, plătești
                  <strong> {service.base_price} RON</strong> și primești documentul pe email și prin curier. Util în
                  special când ai nevoie de el pentru <strong>căsătoria în străinătate</strong> și nu te poți deplasa.
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
                Când Ai Nevoie de Certificat de Celibat?
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
                  <Card key={option.id} className="bg-neutral-50 border-2 border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții certificatul de celibat în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Datele', desc: 'Introduci datele personale și starea civilă pentru cerere.', icon: FileText },
                { step: 2, title: 'Confirmi Localitatea', desc: 'Confirmi localitatea de domiciliu — acolo se eliberează certificatul.', icon: Landmark },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești certificatul pe email și prin curier.`, icon: CheckCircle },
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

        {/* Specimen — what the certificat de celibat looks like */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Specimen
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Certificatul de Celibat — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Adeverința pe care o primești are antetul oficial al Serviciului de Stare Civilă și atestă
                statutul de necăsătorit(ă) — un document emis de primărie, nu o copie generată online.
              </p>
            </div>

            <div className="grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-14 items-center">
              {/* Specimen image — framed */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-500/10 to-secondary-900/5 rounded-[2rem] blur-xl" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl p-3 ring-1 ring-neutral-200 shadow-[0_20px_50px_rgba(6,16,31,0.16)]">
                  <Image
                    src="/images/specimens/certificat-celibat.png"
                    alt="Specimen certificat de celibat (adeverință de stare civilă) emis de Starea Civilă — exemplu cu date anonimizate"
                    width={707}
                    height={1000}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <p className="text-xs text-neutral-400 mt-2 text-center italic">
                    Exemplu — date anonimizate.
                  </p>
                </div>
              </div>

              {/* Why it's a real, legally valid document */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                  Un document, valabil legal
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Certificatul de celibat este <strong>eliberat de Serviciul de Stare Civilă</strong> și atestă
                  că nu ești căsătorit(ă) — îl depunem în numele tău și ți-l trimitem fără drum la ghișeu.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Landmark, title: 'Antet oficial Stare Civilă', desc: 'Emis de Serviciul de Stare Civilă din cadrul primăriei localității tale de domiciliu.' },
                    { icon: Heart, title: 'Atestă statutul de necăsătorit', desc: 'Confirmă oficial că nu ești căsătorit(ă) la data eliberării, pe baza registrelor de stare civilă.' },
                    { icon: Shield, title: 'Valabil legal', desc: 'Îl folosești intern și pentru căsătoria în străinătate (cu apostilă) sau pentru dosare de cetățenie.' },
                    { icon: Truck, title: 'Livrat prin curier', desc: 'Documentul fizic ajunge la tine prin curier, în zile lucrătoare — nu este generat instant.' },
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
                    Acceptat de notari, primării și autorități
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Acte necesare + Apostilă & traducere */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ScrollText className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Acte necesare</h2>
                </div>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Datele tale de identificare (CNP, nume complet)',
                    'Copie după actul de identitate (carte de identitate)',
                    'Localitatea de domiciliu (unde se eliberează certificatul)',
                    'Scopul solicitării (ex: căsătorie în străinătate)',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Stamp className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Apostilă & traducere</h2>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Dacă folosești certificatul de celibat <strong>în străinătate</strong>, de cele mai multe ori ai
                  nevoie și de <strong>apostila de la Haga</strong> (sau supralegalizare) și de o
                  <strong> traducere legalizată</strong> în limba țării unde îl depui. Acestea pot fi adăugate la
                  comandă ca servicii suplimentare — spune-ne în ce țară îl folosești și pregătim documentul complet,
                  gata de depus.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-primary-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900">
                  Certificat de celibat din altă localitate sau din diaspora
                </h2>
              </div>
              <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
                <p>
                  Certificatul de celibat se eliberează la Serviciul de Stare Civilă din{' '}
                  <strong>localitatea de domiciliu</strong>, indiferent unde te afli acum. Dacă ești plecat în alt
                  oraș sau în <strong>diaspora</strong>, nu trebuie să te întorci în România: completezi datele
                  online, noi depunem cererea în localitatea ta de domiciliu, iar documentul îl primești pe email
                  și prin curier la adresa indicată.
                </p>
                <p>
                  Astfel obții <strong>certificat de celibat în România</strong> chiar dacă locuiești în
                  străinătate — exact varianta de care ai nevoie când pregătești dosarul de{' '}
                  <strong>căsătorie în străinătate</strong> și nu te poți deplasa la ghișeu.
                </p>
                <p className="text-neutral-600">
                  Ai nevoie și de alte documente de stare civilă? Vezi și{' '}
                  <Link href="/servicii/eliberare-certificat-de-nastere/" className="text-primary-600 font-semibold hover:underline">
                    certificatul de naștere
                  </Link>{' '}
                  sau{' '}
                  <Link href="/servicii/eliberare-certificat-de-casatorie/" className="text-primary-600 font-semibold hover:underline">
                    certificatul de căsătorie
                  </Link>
                  , pe care le poți obține tot online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat de Celibat"
          faqs={[
            { q: 'Ce este certificatul de celibat?', a: 'Este documentul de stare civilă care atestă că o persoană nu este căsătorită la data eliberării. Se eliberează pe baza datelor din registrele de stare civilă din localitatea de domiciliu.' },
            { q: 'Certificatul de celibat este același cu adeverința de celibat?', a: 'Da. Certificatul de celibat, adeverința de celibat și certificatul de stare civilă se referă la același document — dovada că nu ești căsătorit(ă). Diferă doar denumirea folosită de diverse instituții.' },
            { q: 'Pot folosi certificatul de celibat pentru căsătoria în străinătate?', a: 'Da, acesta este cel mai frecvent motiv. Multe primării din străinătate cer dovada că ești necăsătorit(ă) pentru a întocmi dosarul de căsătorie. De obicei mai e nevoie de apostilă și traducere legalizată.' },
            { q: 'Am nevoie de apostilă pe certificatul de celibat?', a: 'Dacă îl folosești în străinătate, de regulă da — apostila de la Haga (sau supralegalizarea) confirmă autenticitatea documentului pentru autoritățile străine. Putem adăuga apostila și traducerea legalizată la comandă.' },
            { q: 'Cât durează eliberarea certificatului de celibat?', a: `${formatEstimatedDays(service)} în mod standard. Dacă ai nevoie mai repede, există și opțiunea Urgent. Apostila și traducerea pot adăuga câteva zile.` },
            { q: 'Cât este valabil certificatul de celibat?', a: 'Reflectă situația din ziua eliberării. În practică, autoritățile (mai ales cele străine) cer un certificat emis recent — de obicei în ultimele 3-6 luni. Verifică termenul cerut de instituția unde îl depui.' },
            { q: 'Cine poate cere certificatul de celibat?', a: 'Persoana în cauză, pe baza datelor proprii de stare civilă. Prin eGhișeul completezi datele tale și noi depunem cererea în localitatea ta de domiciliu, fără să te deplasezi.' },
            { q: 'Pot obține certificatul de celibat din altă localitate sau din diaspora?', a: 'Da. Certificatul se eliberează la Starea Civilă din localitatea ta de domiciliu, dar nu trebuie să te deplasezi acolo. Completezi datele online, noi depunem cererea, iar documentul ajunge la tine pe email și prin curier, oriunde te-ai afla în țară sau în străinătate.' },
            { q: 'Cât costă certificatul de celibat în România?', a: 'Prin eGhișeul costă 179 RON, cu taxele incluse, fără cont și fără drum la ghișeu. Apostila de la Haga și traducerea legalizată, dacă îl folosești în străinătate, se pot adăuga separat la comandă.' },
            { q: 'Cum primesc documentul?', a: 'Îl primești pe email și, în plus, originalul prin curier la adresa indicată. Astfel ai și varianta digitală rapidă, și documentul fizic oficial pentru dosar.' },
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
                Gata să obții Certificatul de Celibat?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completezi datele în câteva minute, fără drum la ghișeu. Primești documentul în {formatEstimatedDays(service)}, pe email și prin curier.
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
