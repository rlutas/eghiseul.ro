import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Button } from '@/components/ui/button';
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
  Mail,
  Phone,
  Landmark,
  User,
  Heart,
  Globe,
  Scale,
  IdCard,
  CalendarDays,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';

// Database slug (order pipeline identifier). URL path uses the descriptive
// SEO slug (eliberare-certificat-DE-nastere) to target the search intent.
const SERVICE_SLUG = 'certificat-nastere';
const PAGE_PATH = '/servicii/eliberare-certificat-de-nastere/';
const SCHEMA_SLUG = 'eliberare-certificat-de-nastere';
const TITLE = 'Certificat de Naștere Online — Duplicat 179 RON | eGhișeul';
const DESCRIPTION =
  'Obține online duplicatul sau copia certificatului de naștere de la Starea Civilă, ' +
  '179 RON, fără deplasare. Util pentru certificat pierdut, din diaspora sau pentru ' +
  'dosar de cetățenie — îl primești pe email și prin curier.';
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
  ogImage: '/og/certificat-nastere.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Certificat de Naștere Online',
  description:
    'Serviciu de obținere a duplicatului sau copiei legalizate a certificatului de naștere de la ' +
    'Serviciul de Stare Civilă. Procesare 100% online, fără deplasare, util în caz de act pierdut, ' +
    'din diaspora sau pentru dosare de cetățenie — livrare pe email și prin curier.',
  serviceType: 'Document Processing — Civil Status',
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
    { name: 'Certificat de Naștere', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Certificat de Naștere (Duplicat)', price: 179, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatNasterePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // When you need a birth certificate duplicate — covers the main search intents
  const useCases = [
    { icon: FileText, title: 'Act pierdut sau deteriorat', items: ['Certificat pierdut', 'Document deteriorat', 'Furt sau distrugere'] },
    { icon: Heart, title: 'Căsătorie', items: ['Dosar de căsătorie', 'Acte la ofițerul stării civile', 'Schimbare de nume'] },
    { icon: Globe, title: 'Cetățenie & pașaport', items: ['Dosar de cetățenie', 'Pașaport românesc', 'Acte din diaspora'] },
    { icon: Scale, title: 'Proceduri juridice', items: ['Dezbatere succesorală', 'Moștenire', 'Acte notariale'] },
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
              <span className="text-white font-medium">Certificat de Naștere</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Personale
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    Stare Civilă
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat de Naștere
                  <span className="block text-primary-500">Duplicat & Copie Legalizată</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Duplicatul certificatului de naștere</strong> îl obții
                    rapid de la noi, fără drum la Starea Civilă:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi datele (nume, CNP, data și localitatea nașterii)',
                      'Verificăm și depunem cererea la Starea Civilă',
                      'Plătești securizat (taxe incluse)',
                      `Primești certificatul în ${formatEstimatedDays(service)}`,
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
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
                        TAXE INCLUSE
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl lg:text-6xl font-black text-white">{service.base_price}</span>
                        <span className="text-xl font-bold text-white/70">RON</span>
                      </div>
                      <p className="text-white/60 text-sm mt-2">Fără taxe ascunse</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Zile lucrătoare</p>
                      </div>
                    </div>

                    {service.urgent_days && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-secondary-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary-900 text-sm">Urgent: {service.urgent_days} zile lucrătoare</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Plus original prin curier</p>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold text-lg rounded-xl shadow-[0_4px_14px_rgba(236,185,95,0.4)] hover:shadow-[0_6px_20px_rgba(236,185,95,0.5)] hover:-translate-y-0.5 transition-all mt-4"
                      size="lg"
                    >
                      <Link href={`/comanda/${SERVICE_SLUG}`}>
                        Comandă Acum
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>

                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Document oficial</span>
                      </div>
                    </div>
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
              Certificat de Naștere — Duplicat sau Copie Legalizată Online
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul de naștere</strong> este actul oficial care atestă identitatea, data și locul
                nașterii unei persoane. Dacă ai pierdut documentul original, ai nevoie de un <strong>duplicat
                certificat de naștere</strong> sau de o copie legalizată pentru un dosar, le poți obține rapid
                prin eGhișeul. Solicitarea de <strong>certificat de naștere online</strong> înseamnă că nu mai
                stai la coadă la ghișeul Stării Civile.
              </p>
              <p>
                <strong>Eliberarea certificatului de naștere</strong> (duplicat) se face de către Serviciul de
                Stare Civilă al primăriei din localitatea unde a fost înregistrată nașterea. Indiferent dacă ai
                un <strong>certificat de naștere pierdut</strong>, deteriorat sau furat, noi depunem cererea în
                numele tău, plătim taxele și îți trimitem documentul pe email și prin curier, fără să te deplasezi.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Important: poți cere certificatul și personal la Starea Civilă
                </h3>
                <p className="text-sm text-neutral-700">
                  Duplicatul certificatului de naștere îl poți solicita <strong>direct la ghișeul Stării Civile</strong>,
                  unde plătești doar taxa de timbru. Prin noi plătești <strong>{service.base_price} RON</strong> pentru
                  un serviciu <strong>100% online, fără deplasare</strong> — util mai ales <strong>din diaspora</strong> sau
                  când nu poți ajunge la primăria din localitatea de naștere, depunând cererea <strong>prin împuternicire</strong>.
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
                Când Ai Nevoie de Certificat de Naștere?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
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

        {/* How it works */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Cum Funcționează?</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">Obții certificatul de naștere în 4 pași, 100% online</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { step: 1, title: 'Completezi Datele', desc: 'Introduci numele, CNP-ul, data nașterii și numele părinților titularului.', icon: User },
                { step: 2, title: 'Confirmi Localitatea', desc: 'Confirmi localitatea de naștere unde a fost înregistrat actul. Verificăm datele.', icon: Landmark },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele Stării Civile sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești certificatul pe email și prin curier.`, icon: CheckCircle },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="bg-neutral-50 rounded-2xl p-6 h-full border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-secondary-900 font-bold text-lg group-hover:scale-110 transition-transform">
                        {item.step}
                      </div>
                      <item.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-primary-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Needs + timing — targets "acte necesare" + "cat dureaza eliberarea" */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <IdCard className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-secondary-900">Acte necesare</h2>
                </div>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Act de identitate valabil (CI sau pașaport)',
                    'Datele de naștere ale titularului (nume, CNP, dată, localitate)',
                    'Numele părinților, așa cum apar în actul de naștere',
                    'Împuternicire (când ceri pentru altcineva sau din diaspora)',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-secondary-900">Cât durează</h2>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  În mod standard, eliberarea certificatului de naștere durează
                  <strong> {formatEstimatedDays(service)}</strong>, în funcție de localitatea de naștere și de
                  timpul de procesare al primăriei. {service.urgent_available && service.urgent_days ? (
                    <>Există și opțiunea <strong>Urgent</strong> — în doar {service.urgent_days} zile lucrătoare. </>
                  ) : null}
                  Pentru cereri <strong>din diaspora</strong> sau prin împuternicire termenul poate fi puțin mai
                  lung, în funcție de curier și de arhiva primăriei.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat de Naștere"
          faqs={[
            { q: 'Ce este certificatul de naștere?', a: 'Este actul oficial de stare civilă care atestă identitatea, data și locul nașterii unei persoane, precum și numele părinților. Se eliberează de Serviciul de Stare Civilă din localitatea unde a fost înregistrată nașterea.' },
            { q: 'Care e diferența dintre duplicat și copie legalizată?', a: 'Duplicatul este un certificat de naștere nou, original, emis de Starea Civilă atunci când ai pierdut sau ai deteriorat documentul. Copia legalizată este o fotocopie certificată conform cu originalul de un notar. Pentru cele mai multe dosare se cere duplicatul (originalul).' },
            { q: 'Cum obțin un certificat de naștere pierdut?', a: 'Soliciți un duplicat de la Starea Civilă din localitatea de naștere. Prin eGhișeul completezi datele online, noi depunem cererea și plătim taxele, iar tu primești noul certificat fără să te deplasezi.' },
            { q: 'Pot obține certificatul din altă localitate sau din străinătate?', a: 'Da. Certificatul se eliberează de primăria din localitatea de naștere, dar nu trebuie să mergi acolo. Depunem cererea prin împuternicire în numele tău, util mai ales pentru românii din diaspora.' },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)} în mod standard, în funcție de primăria din localitatea de naștere. Pentru cereri din diaspora termenul poate fi puțin mai lung. Există și opțiunea Urgent.` },
            { q: 'Cât timp este valabil certificatul de naștere?', a: 'Certificatul de naștere nu expiră — este valabil pe toată durata vieții. Unele instituții pot cere însă o copie legalizată recentă, emisă în ultimele luni, pentru anumite dosare.' },
            { q: 'Cum primesc documentul?', a: 'Documentul original îl primești prin curier la adresa indicată, iar confirmarea și datele de tracking pe email. Te ținem la curent pe tot parcursul procesării.' },
            { q: 'Pot cere certificatul pentru altcineva?', a: 'Da, pe baza unei împuterniciri. Poți solicita certificatul de naștere pentru un membru al familiei sau o altă persoană, atâta timp cât ai acordul și împuternicirea necesară pentru depunerea cererii.' },
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
                Gata să obții Certificatul de Naștere?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completezi datele online, fără drum la Starea Civilă. Primești documentul în {formatEstimatedDays(service)}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Link href={`/comanda/${SERVICE_SLUG}`}>
                    Comandă Acum
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl transition-all duration-200"
                >
                  <a href="tel:+40312299399">
                    <Phone className="mr-2 w-5 h-5" />
                    Sună-ne
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
