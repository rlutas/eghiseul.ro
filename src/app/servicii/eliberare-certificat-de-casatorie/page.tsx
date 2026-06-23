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
  Banknote,
  Scale,
  Globe,
  HeartHandshake,
  FileWarning,
  Users,
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

// Database slug (order pipeline identifier). URL path uses the WP slug
// (eliberare-certificat-de-casatorie) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'certificat-casatorie';
const PAGE_PATH = '/servicii/eliberare-certificat-de-casatorie/';
const SCHEMA_SLUG = 'eliberare-certificat-de-casatorie';
const TITLE = 'Certificat de Căsătorie Online — Duplicat 998 RON';
const DESCRIPTION =
  'Duplicat certificat de căsătorie online de la Starea Civilă, 998 RON, fără deplasare. ' +
  'Pentru act pierdut, din altă localitate sau diaspora. Email + curier.';
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
  ogImage: '/og/services/certificat-casatorie.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Certificat de Căsătorie Online',
  description:
    'Serviciu de obținere a unui duplicat sau a unei copii legalizate după certificatul de căsătorie ' +
    'de la Starea Civilă (Direcția de Evidență a Persoanelor). Document necesar pentru obținerea ' +
    'cetățeniei, proceduri juridice și administrative. Procesare 100% online, livrare email.',
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
    { name: 'Certificat de Căsătorie', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Certificat de Căsătorie (Duplicat)', price: 998, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatCasatoriePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // When a marriage certificate (duplicate / legalized copy) is needed
  const useCases = [
    { icon: Globe, title: 'Obținere cetățenie', items: ['Dosar cetățenie', 'Reîntregire familie', 'Recunoaștere act'] },
    { icon: Scale, title: 'Proceduri juridice', items: ['Divorț', 'Moștenire & succesiune', 'Partaj bunuri'] },
    { icon: Banknote, title: 'Administrative & bancă', items: ['Deschidere cont comun', 'Credit & ipotecă', 'Alocații & ajutoare'] },
    { icon: FileWarning, title: 'Act pierdut sau deteriorat', items: ['Certificat pierdut', 'Document deteriorat', 'Certificat furat'] },
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
              <span className="text-white font-medium">Certificat de Căsătorie</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <HeartHandshake className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Personale
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Stare Civilă
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat de Căsătorie
                  <span className="block text-primary-500">Online</span>
                </h1>
                <p className="text-lg sm:text-xl text-primary-500 font-semibold mb-5">
                  Duplicat &amp; Copie Legalizată
                </p>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Certificatul de căsătorie</strong> îl obții rapid de la
                    Starea Civilă, fără drum la primărie:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi datele soților și data/locul căsătoriei',
                      'Confirmi localitatea de înregistrare a căsătoriei',
                      'Plătești securizat (taxe incluse)',
                      `Primești certificatul pe email în ${formatEstimatedDays(service)}`,
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
                        <p className="text-xs text-neutral-500">Plus curier pentru original/legalizat</p>
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
                { icon: Landmark, value: 'Stare Civilă', label: 'Document' },
                { icon: Truck, value: 'Curier inclus', label: 'Original / copie legalizată' },
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
              Certificat de Căsătorie — Duplicat sau Copie Legalizată Online
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul de căsătorie</strong> este actul de stare civilă care atestă încheierea căsătoriei
                dintre doi soți. Dacă ai pierdut originalul, l-ai deteriorat sau ai nevoie de un exemplar suplimentar,
                poți obține un <strong>duplicat al certificatului de căsătorie</strong> sau o <strong>copie legalizată</strong>
                {' '}de la Starea Civilă a localității unde a fost înregistrată căsătoria.
              </p>
              <p>
                Prin eGhișeul obții <strong>certificat de căsătorie online</strong>, fără drum la primărie. Completezi
                datele soților și locul căsătoriei, iar noi depunem cererea la Direcția de Evidență a Persoanelor (Starea
                Civilă), plătim taxele și îți trimitem documentul. Soluția este utilă mai ales pentru proceduri de cetățenie,
                divorț, moștenire sau dosare administrative.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Personal la Starea Civilă vs. online prin eGhișeul
                </h3>
                <p className="text-sm text-neutral-700">
                  Eliberarea unui duplicat se poate face <strong>personal, gratuit (cu taxă minimă), la Starea Civilă</strong>
                  {' '}din localitatea de înregistrare a căsătoriei. Problema apare când nu poți ajunge acolo — locuiești în
                  altă localitate sau ești în <strong>diaspora</strong>. Prin noi rezolvi totul online: depunem cererea în
                  numele tău <strong>pe bază de împuternicire</strong>, plătești <strong>{service.base_price} RON cu taxele
                  incluse</strong> și primești certificatul fără deplasare.
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
                Când Ai Nevoie de Certificat de Căsătorie?
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

            {/* Situații frecvente — duplicat certificat de căsătorie */}
            <div className="mt-16 lg:mt-20 max-w-[1100px] mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                  Situații frecvente — duplicat certificat de căsătorie
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Indiferent de motiv, procedura este aceeași: completezi datele soților, noi depunem cererea la
                  Starea Civilă și primești documentul acasă, prin curier.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    icon: FileWarning,
                    title: 'Certificat de căsătorie pierdut sau deteriorat',
                    desc: 'Dacă ai pierdut certificatul de căsătorie, ți-a fost furat sau s-a deteriorat, soliciți un duplicat — un certificat nou, oficial, emis de Serviciul de Stare Civilă. Depunem cererea de duplicat în numele tău, fără să stai la coadă.',
                  },
                  {
                    icon: Landmark,
                    title: 'Din altă localitate, fără deplasare',
                    desc: 'Duplicatul se eliberează de primăria din localitatea unde a fost înregistrată căsătoria, dar nu trebuie să mergi acolo. Depunem cererea prin împuternicire la primăria competentă și îți trimitem certificatul prin curier — fără programare.',
                  },
                  {
                    icon: Users,
                    title: 'Prin împuternicire',
                    desc: 'Cererea o poate depune oricare dintre soți sau o persoană împuternicită. Ai nevoie de datele complete ale soților (nume, prenume, CNP), data și localitatea căsătoriei — împuternicirea o pregătim noi.',
                  },
                  {
                    icon: Globe,
                    title: 'Din diaspora',
                    desc: 'Românii plecați din țară pot obține duplicatul fără să revină acasă. Depunem cererea prin împuternicire la primăria de înregistrare și îți trimitem documentul prin curier — util pentru dosare de cetățenie sau acte la autoritățile străine.',
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                      <c.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-secondary-900 mb-2 leading-snug">{c.title}</h3>
                    <p className="text-sm text-neutral-700 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-neutral-600 text-center mt-6 max-w-2xl mx-auto">
                Duplicatul este un document emis de Starea Civilă și se livrează prin curier în zile
                lucrătoare — nu este un document generat instant. Ai nevoie și de un{' '}
                <Link href="/servicii/eliberare-certificat-de-nastere/" className="text-primary-600 font-medium hover:underline">
                  certificat de naștere
                </Link>{' '}
                sau de un{' '}
                <Link href="/servicii/eliberare-certificat-de-celibat/" className="text-primary-600 font-medium hover:underline">
                  certificat de celibat
                </Link>
                ? Le poți comanda la fel de simplu. Te-ai căsătorit în străinătate? Vezi ghidul de{' '}
                <Link href="/transcriere-certificat-de-casatorie/" className="text-primary-600 font-medium hover:underline">
                  transcriere a certificatului de căsătorie
                </Link>
                , iar dacă vrei să vezi{' '}
                <Link href="/model-certificat-de-casatorie/" className="text-primary-600 font-medium hover:underline">
                  cum arată modelul certificatului
                </Link>
                , avem un ghid dedicat. Vezi și{' '}
                <Link href="/cum-vor-arata-documentele-de-stare-civila-2025/" className="text-primary-600 font-medium hover:underline">
                  cum vor arăta documentele de stare civilă în 2025
                </Link>
                .
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții certificatul de căsătorie în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Datele', desc: 'Introduci datele soților, data și locul căsătoriei.', icon: Users },
                { step: 2, title: 'Confirmi Localitatea', desc: 'Confirmi localitatea de înregistrare. Verificăm datele înainte de depunere.', icon: FileText },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele de stare civilă sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești certificatul pe email și, opțional, prin curier.`, icon: CheckCircle },
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

        {/* Specimen — what the marriage certificate looks like */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Specimen
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Certificatul de Căsătorie — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Duplicatul pe care îl primești are antetul oficial al Serviciului de Stare Civilă și este
                un document original emis de primărie — nu o copie generată online.
              </p>
            </div>

            <div className="grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-14 items-center">
              {/* Specimen image — framed */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-500/10 to-secondary-900/5 rounded-[2rem] blur-xl" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl p-3 ring-1 ring-neutral-200 shadow-[0_20px_50px_rgba(6,16,31,0.16)]">
                  <Image
                    src="/images/specimens/certificat-casatorie.png"
                    alt="Specimen certificat de căsătorie emis de Starea Civilă — exemplu cu date anonimizate"
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

              {/* Why it's a real, legally valid document */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                  Un document original, valabil legal
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Duplicatul este <strong>identic cu cel eliberat la ghișeul Stării Civile</strong> — doar
                  că depunem cererea în numele tău și îți trimitem documentul prin curier, fără drum la primărie.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Landmark, title: 'Antet oficial Stare Civilă', desc: 'Emis de Serviciul de Stare Civilă din cadrul primăriei unde a fost înregistrată căsătoria.' },
                    { icon: FileText, title: 'Document original, nu copie', desc: 'Primești un certificat nou, oficial — duplicatul care înlocuiește originalul pierdut sau deteriorat.' },
                    { icon: Shield, title: 'Valabil legal', desc: 'Îl folosești la notar, bancă, instanță sau pentru dosare de cetățenie, la fel ca originalul.' },
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
                    Acceptat de notari, bănci și instituții
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* Documents needed + duration — targets "acte necesare" + "cat dureaza" */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Acte necesare</h2>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Datele soților (nume, prenume, CNP)',
                    'Data și locul (localitatea) căsătoriei',
                    'Copie act de identitate al solicitantului',
                    'Împuternicire (o pregătim noi) pentru depunerea cererii',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Cât durează</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Eliberarea duplicatului durează în mod standard <strong>{formatEstimatedDays(service)}</strong>, în
                  funcție de Starea Civilă a localității unde a fost înregistrată căsătoria. Pentru căsătorii
                  înregistrate în <strong>altă localitate</strong> sau mai vechi poate dura puțin mai mult. Avem și
                  {service.urgent_days ? ` opțiunea Urgent (${service.urgent_days} zile lucrătoare)` : ' opțiunea Urgent'}.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat de Căsătorie"
          faqs={[
            { q: 'Ce este certificatul de căsătorie?', a: 'Este actul de stare civilă care atestă încheierea căsătoriei dintre doi soți. Se eliberează de Starea Civilă (Direcția de Evidență a Persoanelor) din localitatea unde a fost înregistrată căsătoria.' },
            { q: 'Care e diferența dintre duplicat și copie legalizată?', a: 'Duplicatul este un nou exemplar oficial al certificatului, eliberat de Starea Civilă, care înlocuiește originalul pierdut sau deteriorat. Copia legalizată este o fotocopie a certificatului existent, certificată conform cu originalul de un notar — folosită când trebuie să depui mai multe exemplare.' },
            { q: 'Am pierdut certificatul de căsătorie. Ce fac?', a: 'Soliciți un duplicat la Starea Civilă din localitatea unde s-a înregistrat căsătoria. Prin eGhișeul faci asta online, fără să te deplasezi — depunem cererea pe bază de împuternicire și primești noul certificat.' },
            { q: 'Pot obține certificatul dintr-o altă localitate sau din străinătate?', a: 'Da. Nu trebuie să fii prezent. Pe baza unei împuterniciri (pe care o pregătim noi), depunem cererea la Starea Civilă din localitatea de înregistrare. Serviciul este util mai ales pentru românii din diaspora.' },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)} în mod standard, în funcție de Starea Civilă a localității. Pentru căsătorii mai vechi sau din altă localitate poate dura puțin mai mult. Există și opțiunea Urgent.` },
            { q: 'Cât este valabil certificatul de căsătorie?', a: 'Certificatul de căsătorie nu expiră — atestă un eveniment de stare civilă. Totuși, unele instituții (în special pentru proceduri de cetățenie) pot cere un duplicat recent, emis în ultimele luni.' },
            { q: 'Cine poate cere un duplicat?', a: 'Oricare dintre soți, sau o persoană împuternicită. În anumite cazuri (succesiune, deces), îl pot solicita și descendenții sau persoanele cu interes legitim, cu documente justificative.' },
            { q: 'Cum primesc documentul?', a: 'Duplicatul certificatului de căsătorie este un document fizic oficial. Îți trimitem confirmarea și o copie pe email, iar originalul / copia legalizată ajunge la tine prin curier în zile lucrătoare.' },
            { q: 'Ce este certificatul de căsătorie digital sau în format 2025?', a: 'Din 2025 actele de stare civilă se emit și în format digitalizat, cu noul model securizat. Indiferent de model, duplicatul rămâne un document emis de Starea Civilă și se livrează fizic prin curier — nu este generat instant online.' },
            { q: 'Trebuie să fac programare pentru eliberarea duplicatului?', a: 'Nu. Prin eGhișeul nu ai nevoie de programare la ghișeul Stării Civile și nu stai la coadă. Completezi cererea online, iar noi depunem documentația la primărie în numele tău, pe bază de împuternicire.' },
            { q: 'Ce acte îmi trebuie pentru un duplicat de certificat de căsătorie?', a: 'Ai nevoie de un act de identitate valabil al solicitantului și de datele căsătoriei: numele și prenumele soților, CNP-urile, data și localitatea unde a fost înregistrată căsătoria. Pentru depunerea cererii se adaugă o împuternicire, pe care o pregătim noi.' },
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
                Gata să obții Certificatul de Căsătorie?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completezi datele soților și locul căsătoriei. Primești documentul în {formatEstimatedDays(service)}, fără drum la primărie.
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
