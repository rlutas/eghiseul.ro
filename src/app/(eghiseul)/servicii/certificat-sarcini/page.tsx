import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Clock,
  Shield,
  CheckCircle,
  ChevronRight,
  Home,
  MapPin,
  Search,
  Mail,
  Landmark,
  ScrollText,
  KeyRound,
  Layers,
} from 'lucide-react';
import { Service, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ReviewsSection } from '@/components/services/reviews-section';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { SystemStatus } from '@/components/services/system-status';
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';
import { getImobiliareServices } from '@/lib/services/imobiliare';
import { ServiceSwitcher } from '@/components/services/service-switcher';
import { PrivateServiceNotice } from '@/components/services/private-service-notice';
import { RelatedServicesLinks } from '@/components/services/related-services-links';

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'certificat-sarcini';
const PAGE_PATH = '/servicii/certificat-sarcini/';
const SCHEMA_SLUG = 'certificat-sarcini';
const TITLE = 'Certificat de Sarcini — Verifică Grevările unui Imobil | OCPI';
const DESCRIPTION =
  'Certificat de sarcini OCPI/ANCPI — verifici ipoteci, privilegii, servituți, interdicții și litigii notate ' +
  'asupra unui imobil, după numărul cadastral sau de carte funciară. Taxe incluse, 100% online, livrare pe email.';
const DATE_PUBLISHED = '2026-06-25';
const DATE_MODIFIED = '2026-06-25';

export const revalidate = 3600;

async function getService(): Promise<Service | null> {
  const supabase = createPublicClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', SERVICE_SLUG)
    .eq('is_active', true)
    .single();

  if (error || !service) return null;

  return service as Service;
}

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/default.png',
});

const buildJsonLd = (basePrice: number) => buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Certificat de Sarcini',
  description:
    'Serviciu de obținere a certificatului de sarcini de la OCPI/ANCPI — situația grevărilor înscrise asupra ' +
    'unui imobil (ipoteci, privilegii, servituți, interdicții, litigii notate), util înainte de vânzare-cumpărare ' +
    'sau credit ipotecar. 100% online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Certificat de Sarcini', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Certificat de Sarcini', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function CertificatSarciniPage() {
  const service = await getService();
  // Schema price follows the DB (admin-editable) — hardcodat doar fallback-ul.
  const jsonLdGraph = buildJsonLd(Number(service?.base_price ?? 99));
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Ways to identify the property
  const identifiers = [
    { icon: KeyRound, title: 'Numărul cadastral', desc: 'Al imobilului pe care vrei să îl verifici, nu neapărat al tău.' },
    { icon: ScrollText, title: 'Numărul de carte funciară', desc: 'Îl găsești pe orice extras al imobilului, oricât de vechi.' },
  ];

  const useCases = [
    { icon: Home, title: 'Dai un avans pe o casă', items: ['Verifici înainte, nu după', 'Vezi ipoteca băncii', 'Negociezi știind ce cumperi'] },
    { icon: Landmark, title: 'Banca cere garanția curată', items: ['Interdicții de înstrăinare', 'Ipoteci anterioare', 'Dosar de finanțare'] },
    { icon: Shield, title: 'Suspectezi un proces', items: ['Notări de litigiu', 'Sechestre', 'Popriri înscrise'] },
    { icon: ScrollText, title: 'Închei un act la notar', items: ['Autentificare', 'Dezmembrare sau alipire', 'Dosar de succesiune'] },
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
              <span className="text-white font-medium">Certificat de Sarcini</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    Verifici grevările
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat de Sarcini{' '}
                  <span className="block text-primary-500">pentru un imobil</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Documentul care răspunde la o singură întrebare: ce apasă imobilul ăsta. Ipoteci, interdicții,
                  servituți, sechestre, procese notate.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Shield className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Îl poate cere oricine, nu doar proprietarul. Practic, e verificarea pe care o faci{' '}
                    <strong className="text-primary-500">înainte să dai un avans</strong>, nu după ce ai ajuns la
                    notar și <strong>afli că imobilul are ipotecă</strong>.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> certificatul de sarcini:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numărul de CF sau pe cel cadastral',
                      'Ne spui județul și localitatea imobilului',
                      'Achiți online, fără sume adăugate pe parcurs',
                      'Îți trimitem certificatul pe email',
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
                        TAXE OCPI INCLUSE
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl lg:text-6xl font-black text-white">{fmt(priceExVat)}</span>
                        <span className="text-xl font-bold text-white/70">RON</span>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        + TVA 21% · <span className="font-semibold text-white">{fmt(priceWithVat)} RON</span> cu TVA
                      </p>
                      <p className="text-white/50 text-xs mt-1">Fără taxe ascunse</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Procesat de un operator</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Certificat de sarcini OCPI</p>
                      </div>
                    </div>

                    {/* Lucrarea trece prin e-Terra — în timpul unei căderi ANCPI clientul
                        trebuie să vadă asta înainte să plătească. */}
                    <SystemStatus service="ancpi" autoIssued={false} compact className="mb-3" />
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

        <PrivateServiceNotice
          institutionLabel="direct la OCPI/ANCPI"
          institutionUrl="https://www.ancpi.ro/"
        />


        {/* Trust strip */}
        <section className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 max-w-[1100px] py-6 lg:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Landmark, value: 'OCPI / ANCPI', label: 'Document OCPI' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Situația sarcinilor' },
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

        {/* Service switcher — jump between cadastral services (cfunciara-style) */}
        {switcherServices.length > 1 && (
          <section className="bg-white border-b border-neutral-200">
            <div className="container mx-auto px-4 max-w-[820px] py-6">
              <ServiceSwitcher services={switcherServices} currentSlug={SERVICE_SLUG} mode="page" className="max-w-md" />
            </div>
          </section>
        )}

        {/* SEO Intro */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Ce apasă imobilul, pe scurt și fără restul poveștii
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Partea C a cărții funciare adună tot ce limitează dreptul proprietarului. Certificatul de sarcini
                scoate exact acea parte, eliberată de Oficiul de Cadastru și Publicitate Imobiliară pe baza a ce e
                înscris în registru. Dacă nu e nimic, certificatul spune și asta, iar propoziția „liber de sarcini”
                cântărește mult într-o negociere.
              </p>
              <p>
                Ce poate să apară acolo: <strong>ipoteci</strong>, de obicei în favoarea unei bănci;{' '}
                <strong>privilegii imobiliare</strong>; <strong>sechestre sau popriri</strong> puse de un
                executor; <strong>servituți</strong>, cum e dreptul de trecere al vecinului;{' '}
                <strong>uzufruct</strong> sau drept de abitație, care lasă pe altcineva să folosească imobilul;{' '}
                <strong>interdicții</strong> de înstrăinare sau de grevare; și <strong>notări de litigiu</strong>,
                adică procese în curs care privesc proprietatea.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Momentul potrivit e înainte de avans
              </h3>
              <p>
                Cele mai neplăcute discuții apar la notar, când cineva descoperă atunci că imobilul are ipotecă sau
                interdicție de înstrăinare, iar avansul e deja dat. Certificatul se poate cere de{' '}
                <strong>orice persoană interesată</strong>, nu doar de proprietar, tocmai fiindcă e menit să fie
                verificat de partea care riscă bani. Îl cer cumpărătorii înainte de antecontract, băncile când
                evaluează o garanție, notarii în dosare și, uneori, chiar proprietarii care vor să confirme că o
                ipotecă veche a fost radiată.
              </p>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Datoriile la asociație și impozitul nu sunt sarcini
                </h3>
                <p className="text-sm text-neutral-700">
                  E cea mai costisitoare neînțelegere legată de documentul ăsta. Cartea funciară ține evidența
                  drepturilor asupra imobilului, nu a facturilor. <strong>Restanțele la întreținere</strong>, la
                  gaze, la curent sau <strong>impozitul neplătit</strong> nu apar în certificatul de sarcini, decât
                  în situația rară în care s-a ajuns la un sechestru înscris. Pentru datoriile curente ceri
                  adeverință de la asociația de proprietari și de la direcția de taxe a primăriei.
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Certificat de sarcini sau extras de informare
              </h3>
              <p>
                Extrasul de informare îți dă toată situația imobilului: cine e proprietar, ce suprafață are, ce
                sarcini sunt. Certificatul de sarcini se uită doar la ultima parte. Alegi extrasul când ai nevoie
                de imaginea completă și certificatul când întrebarea ta e strict „e curat sau nu”.{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Vezi extrasul de carte funciară
                </Link>
                .
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu prinde certificatul
              </h3>
              <p>
                Tot ce nu a ajuns în registru. Un contract de închiriere nenotat, o promisiune de vânzare făcută
                altcuiva și nenotată, o înțelegere verbală între moștenitori rămân invizibile. La fel, certificatul
                reflectă situația din ziua în care a fost emis: o ipotecă înscrisă a doua zi nu are cum să apară în
                el, motiv pentru care notarii lucrează cu documente cât mai proaspete.
              </p>
              <p>
                Ne trebuie numărul cadastral sau cel de carte funciară și localitatea. Dacă vrei să verifici un
                imobil pentru care ai doar adresa, îl identificăm întâi prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                .
              </p>
              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Când merită repetată verificarea
              </h3>
              <p>
                Un certificat scos cu două luni înainte de semnare nu mai spune mare lucru. Între timp se poate
                înscrie o ipotecă, se poate nota un litigiu, se poate pune un sechestru. Practica rezonabilă e să
                verifici o dată la început, ca să știi dacă merită să continui, și încă o dată cât mai aproape de
                momentul în care dai bani. Prima verificare te scutește de pierdut timpul pe un imobil imposibil.
                A doua te scutește de surprize apărute exact în perioada în care negociai. Între cele două,
                schimbă-ți atitudinea doar dacă vânzătorul devine grăbit fără motiv.
              </p>
            </div>
          </div>
        </section>

        {/* Identifiers */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Ce îți trebuie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce ne trebuie ca să facem verificarea
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Un număr al imobilului. Nu trebuie să fii proprietarul lui.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {identifiers.map((it) => (
                <div key={it.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <it.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{it.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-primary-50 rounded-2xl border border-primary-200 max-w-2xl mx-auto flex items-start gap-3">
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-secondary-700">
                <strong>Verifici o casă pe care vrei să o cumperi?</strong> Dacă ai doar adresa, o identificăm cu serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi îți obținem certificatul de sarcini.
              </p>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Când ai nevoie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Când merită să verifici înainte
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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
              <p className="text-white/70 max-w-2xl mx-auto">Verificarea se face la biroul care ține cartea funciară</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Numărul imobilului', desc: 'Al celui pe care îl verifici, chiar dacă nu e al tău.', icon: KeyRound },
                { step: 2, title: 'Județ și localitate', desc: 'Ne spun unde se ține cartea funciară a imobilului.', icon: MapPin },
                { step: 3, title: 'Plata', desc: 'Se achită online; tariful instituției e cuprins în sumă.', icon: Shield },
                { step: 4, title: 'Răspunsul pe email', desc: `Afli ce e înscris, sau că nu e nimic, în ${formatEstimatedDays(service)}.`, icon: CheckCircle },
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

        {/* Related — cross-link to CF + copie CF + identificare */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Ce se mai verifică înainte de o tranzacție
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Situația juridică completă: proprietar, suprafață, sarcini.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Mail className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Copia documentelor din cartea funciară a imobilului.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('identificare-imobil')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Identificare Imobil după Adresă</p>
                  <p className="text-sm text-neutral-600">Nu știi numărul cadastral? Îl aflăm după adresă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări despre verificarea sarcinilor"
          faqs={[
            { q: 'Apar în certificat datoriile la întreținere sau impozitul neplătit?', a: 'Nu. Cartea funciară ține evidența drepturilor asupra imobilului, nu a facturilor. Restanțele la asociație, la utilități sau impozitul se cer separat, cu adeverință de la asociația de proprietari și de la direcția de taxe a primăriei. Excepția rară e când s-a ajuns deja la un sechestru înscris.' },
            { q: 'Pot verifica un imobil care nu este al meu?', a: 'Da. Certificatul poate fi cerut de orice persoană interesată de situația proprietății, tocmai fiindcă rostul lui e să fie verificat de cine riscă bani. Nu ai nevoie de acordul proprietarului.' },
            { q: 'Ce înseamnă „liber de sarcini”?', a: 'Că în partea C a cărții funciare nu e înscris nimic la data emiterii: nici ipotecă, nici interdicție, nici litigiu notat. Este un argument bun la negociere, dar se raportează la ziua aceea, nu la viitor.' },
            { q: 'Certificat de sarcini sau extras de carte funciară?', a: 'Extrasul îți dă toată situația imobilului, inclusiv proprietarul și suprafața. Certificatul se uită doar la sarcini. Dacă întrebarea ta este strict dacă imobilul e grevat, certificatul e mai direct; dacă vrei imaginea completă, ia extrasul.' },
            { q: 'Ce este o notare de litigiu?', a: 'Este mențiunea că asupra imobilului există un proces în curs. Nu înseamnă că proprietarul a pierdut, dar înseamnă că dreptul e contestat, iar cine cumpără intră peste o dispută deschisă. Merită citită cu un avocat înainte de orice avans.' },
            { q: 'O chirie sau o promisiune de vânzare apar în certificat?', a: 'Doar dacă au fost notate în cartea funciară. Un contract de închiriere nenotat sau o promisiune făcută altcuiva și nenotată nu se văd. De aceea verificarea din registru nu înlocuiește complet întrebările puse direct vânzătorului.' },
            { q: 'Cât costă verificarea și cât de repede am răspunsul?', a: `${service.base_price} RON, tarif de instituție cuprins, iar răspunsul vine pe email în ${formatEstimatedDays(service)}, în forma eliberată de instituție.` },
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
                Vrei să știi dacă imobilul e curat?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Un număr al imobilului și localitatea. Răspunsul îți vine pe email în {formatEstimatedDays(service)}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </section>
        <RelatedServicesLinks services={switcherServices} currentSlug={SERVICE_SLUG} />

      </main>

      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />

      <Footer />
    </>
  );
}
