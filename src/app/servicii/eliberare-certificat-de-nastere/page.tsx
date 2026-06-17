import { notFound } from 'next/navigation';
import Link from 'next/link';
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
  User,
  Heart,
  Globe,
  Scale,
  IdCard,
  CalendarDays,
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

// Database slug (order pipeline identifier). URL path uses the descriptive
// SEO slug (eliberare-certificat-DE-nastere) to target the search intent.
const SERVICE_SLUG = 'certificat-nastere';
const PAGE_PATH = '/servicii/eliberare-certificat-de-nastere/';
const SCHEMA_SLUG = 'eliberare-certificat-de-nastere';
const TITLE = 'Certificat de Naștere Online — Duplicat 998 RON';
const DESCRIPTION =
  'Duplicat certificat de naștere online de la Starea Civilă, 998 RON, fără deplasare. ' +
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
  ogImage: '/og/services/certificat-nastere.png',
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
    { name: 'Certificat de Naștere (Duplicat)', price: 998, url: `${BASE_URL}${PAGE_PATH}` },
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

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
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

                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">Comandă Acum</OrderButton>

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
                { icon: Mail, value: 'Email + curier', label: 'Primești originalul' },
                { icon: Landmark, value: 'Taxe incluse', label: 'Fără deplasare' },
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
              <p>
                Cel mai mare avantaj este că obții duplicatul fără să mergi în localitatea de naștere și fără
                programare la ghișeu. Fie că ai nevoie de eliberarea certificatului de naștere din altă localitate
                — de exemplu te-ai născut în Galați sau Timișoara, dar locuiești în altă parte — fie că ești plecat
                din țară, depunem cererea prin împuternicire la primăria competentă și îți trimitem documentul acasă.
                Nu trebuie să te deplasezi și nu aștepți la coadă.
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

            {/* Situații frecvente — duplicat certificat de naștere */}
            <div className="mt-16 lg:mt-20 max-w-[1100px] mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                  Situații frecvente — duplicat certificat de naștere
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Indiferent de motiv, procedura este aceeași: completezi datele, noi depunem cererea la Starea
                  Civilă și primești documentul acasă.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    icon: FileText,
                    title: 'Certificat de naștere pierdut sau deteriorat',
                    desc: 'Dacă ai pierdut certificatul, ți-a fost furat sau s-a deteriorat, soliciți un duplicat — un certificat nou, original, emis de Serviciul de Stare Civilă. Depunem direct cererea de duplicat în numele tău.',
                  },
                  {
                    icon: Landmark,
                    title: 'Din altă localitate, fără deplasare',
                    desc: 'Certificatul se eliberează de primăria din localitatea unde a fost înregistrată nașterea, dar nu trebuie să mergi acolo. Depunem cererea prin împuternicire la primăria competentă și îți trimitem certificatul prin curier — fără programare.',
                  },
                  {
                    icon: User,
                    title: 'Prin împuternicire (pentru altcineva)',
                    desc: 'Poți obține certificatul și pentru un membru al familiei, pe baza unei împuterniciri. Ai nevoie de datele complete ale titularului (nume, CNP, data și localitatea nașterii, numele părinților) și de acordul persoanei.',
                  },
                  {
                    icon: Heart,
                    title: 'Pentru copil',
                    desc: 'Pentru un copil minor, duplicatul se solicită de către părinte sau reprezentantul legal, cu datele de naștere ale copilului și ale părinților. Util pentru dosarul de grădiniță, școală, pașaport sau alocație.',
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                      <c.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-base font-bold text-secondary-900 mb-2 leading-snug">{c.title}</h3>
                    <p className="text-sm text-neutral-700 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-neutral-600 text-center mt-6 max-w-2xl mx-auto">
                Duplicatul este un document oficial emis de Starea Civilă și se livrează prin curier în zile
                lucrătoare — nu este un document generat instant. Pentru autoritățile din străinătate, vezi și{' '}
                <Link href="/servicii/extras-multilingv-certificat-nastere/" className="text-primary-600 font-medium hover:underline">
                  extrasul multilingv de pe certificatul de naștere
                </Link>
                , recunoscut în UE fără traducere. Ai nevoie și de un{' '}
                <Link href="/servicii/eliberare-certificat-de-casatorie/" className="text-primary-600 font-medium hover:underline">
                  certificat de căsătorie
                </Link>{' '}
                sau de un{' '}
                <Link href="/servicii/eliberare-certificat-de-celibat/" className="text-primary-600 font-medium hover:underline">
                  certificat de celibat
                </Link>
                ? Le poți comanda la fel de simplu.
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții certificatul de naștere în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Datele', desc: 'Introduci numele, CNP-ul, data nașterii și numele părinților titularului.', icon: User },
                { step: 2, title: 'Confirmi Localitatea', desc: 'Confirmi localitatea de naștere unde a fost înregistrat actul. Verificăm datele.', icon: Landmark },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele Stării Civile sunt incluse în preț.', icon: Shield },
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

        <ReviewsSection />

        {/* Needs + timing — targets "acte necesare" + "cat dureaza eliberarea" */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <IdCard className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-secondary-900">Acte necesare pentru duplicat certificat de naștere</h2>
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
            { q: 'Pot obține certificatul de naștere dintr-o altă localitate, fără să mă deplasez?', a: 'Da. Certificatul se eliberează de primăria din localitatea unde a fost înregistrată nașterea — de exemplu Galați, Timișoara sau orice alt oraș — dar nu trebuie să mergi acolo. Depunem cererea prin împuternicire la primăria competentă și îți trimitem documentul prin curier, oriunde te-ai afla.' },
            { q: 'Trebuie să fac programare pentru eliberarea duplicatului?', a: 'Nu. Prin eGhișeul nu ai nevoie de programare la ghișeul Stării Civile și nu stai la coadă. Completezi cererea online, iar noi depunem documentația la primărie în numele tău.' },
            { q: 'Ce acte îmi trebuie pentru un duplicat de certificat de naștere?', a: 'Ai nevoie de un act de identitate valabil și de datele de naștere ale titularului: nume complet, CNP, data și localitatea nașterii și numele părinților așa cum apar în actul de naștere. Pentru cereri în numele altei persoane sau din diaspora se adaugă o împuternicire.' },
            { q: 'Sunt cetățean român plecat din țară — pot cere certificatul din diaspora?', a: 'Da. Românii din diaspora pot obține duplicatul fără să revină în țară. Depunem cererea prin împuternicire la primăria de naștere și îți trimitem documentul prin curier, util pentru dosare de cetățenie, pașaport sau acte la autoritățile străine.' },
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
