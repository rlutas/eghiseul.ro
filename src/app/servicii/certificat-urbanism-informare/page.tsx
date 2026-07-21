import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Shield,
  Zap,
  FileText,
  CheckCircle,
  ChevronRight,
  Mail,
  Landmark,
  Home,
  MapPin,
  Building2,
  Search,
  Scale,
  ClipboardList,
} from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ReviewsSection } from '@/components/services/reviews-section';
import { ServiceOptionsSection } from '@/components/services/service-options-section';
import { ServicePrice } from '@/components/services/service-price';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';

// Slug DB = segmentul URL (7 pagini interne + footer-ul leagă deja aici).
const SERVICE_SLUG = 'certificat-urbanism-informare';
const PAGE_PATH = '/servicii/certificat-urbanism-informare/';
const SCHEMA_SLUG = 'certificat-urbanism-informare';
const TITLE = 'Certificat de Urbanism Online — Îl Obținem Noi de la Primărie';
const DESCRIPTION =
  'Obținem certificatul de urbanism pentru informare de la orice primărie din România: regim juridic, POT/CUT, restricții de construire. Comanzi online, primești pe email.';
const DATE_PUBLISHED = '2026-07-21';
const DATE_MODIFIED = '2026-07-21';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
});

const buildJsonLd = (basePrice: number) =>
  buildServicePageGraph({
    slug: SCHEMA_SLUG,
    name: 'Certificat de Urbanism Online (Informare)',
    description:
      'Obținerea certificatului de urbanism în scop de informare de la primăria localității unde se află imobilul: regim juridic, economic și tehnic, POT/CUT, restricții și interdicții de construire. Depunem cererea, plătim taxa locală și livrăm documentul pe email.',
    serviceType: 'Document Processing — Urbanism',
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
      { name: 'Certificat de Urbanism', url: `${BASE_URL}${PAGE_PATH}` },
    ],
    offers: [
      {
        name: 'Certificat de Urbanism pentru Informare (Standard)',
        price: basePrice,
        url: `${BASE_URL}${PAGE_PATH}`,
      },
    ],
    aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
  });

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

export default async function CertificatUrbanismPage() {
  const data = await getService();
  if (!data) notFound();
  const { service, options } = data;

  const jsonLdGraph = buildJsonLd(Number(service.base_price ?? 780));
  const termen = formatEstimatedDays(service);

  const useCases = [
    {
      icon: Search,
      title: 'Înainte să cumperi un teren',
      items: [
        'Afli dacă terenul e construibil sau agricol',
        'Vezi restricții și interdicții de construire',
        'Eviți să plătești pe un teren pe care nu poți construi',
      ],
    },
    {
      icon: Scale,
      title: 'Vânzare la notar',
      items: [
        'Cerut la vânzarea terenurilor din extravilan',
        'Unii notari îl cer și pentru intravilan',
        'Certifică regimul juridic al imobilului',
      ],
    },
    {
      icon: Home,
      title: 'Vrei să construiești',
      items: [
        'Afli POT și CUT — cât poți construi pe teren',
        'Vezi regimul de înălțime permis în zonă',
        'Primul pas înainte de proiect și autorizație',
      ],
    },
    {
      icon: Building2,
      title: 'Dezmembrare sau alipire',
      items: [
        'Necesar la dezmembrarea unui teren în loturi',
        'Necesar la alipirea mai multor parcele',
        'Arată condițiile impuse de primărie',
      ],
    },
  ];

  const steps = [
    {
      step: 1,
      title: 'Completezi cererea online',
      desc: 'Ne dai datele imobilului: județ, localitate, număr cadastral sau adresă. Durează câteva minute.',
      icon: ClipboardList,
    },
    {
      step: 2,
      title: 'Pregătim dosarul',
      desc: 'Întocmim cererea către primărie și anexăm planurile cadastrale necesare. Dacă lipsește ceva, te anunțăm.',
      icon: FileText,
    },
    {
      step: 3,
      title: 'Depunem la primărie',
      desc: 'Depunem dosarul la primăria localității unde se află imobilul și plătim taxa locală. Taxa e inclusă în preț.',
      icon: Landmark,
    },
    {
      step: 4,
      title: 'Primești certificatul',
      desc: `Primăria eliberează certificatul în termenul legal. Ți-l trimitem pe email — în total ${termen}.`,
      icon: Mail,
    },
  ];

  const faqs = [
    {
      q: 'Ce este certificatul de urbanism?',
      a: 'Este documentul emis de primărie care spune ce ai voie să faci cu un teren sau o clădire: regimul juridic (cine îl deține, ce sarcini are), regimul economic (categoria de folosință) și regimul tehnic (ce și cât se poate construi — POT, CUT, înălțime maximă, retrageri). Este reglementat de Legea 50/1991.',
    },
    {
      q: 'Cât costă obținerea certificatului de urbanism prin eGhișeul?',
      a: `${Number(service.base_price)} lei, totul inclus: întocmirea dosarului, depunerea la primărie, taxa locală de eliberare și livrarea pe email. Nu mai apar costuri pe parcurs.`,
    },
    {
      q: 'Cât durează până primesc certificatul?',
      a: `Primăria are prin lege până la 30 de zile lucrătoare să îl elibereze de la depunerea dosarului complet. În practică, unele primării răspund în 2-3 săptămâni, altele folosesc tot termenul. Estimarea noastră totală: ${termen}.`,
    },
    {
      q: 'Cât timp este valabil certificatul de urbanism?',
      a: 'De regulă 12 luni de la emitere. Se poate prelungi o singură dată, cu cel mult 12 luni, dacă depui cererea de prelungire înainte să expire.',
    },
    {
      q: 'Certificatul de urbanism ține loc de autorizație de construire?',
      a: 'Nu. Certificatul de urbanism este un act de informare — îți spune ce se poate construi și în ce condiții, dar nu îți dă dreptul să construiești. Pentru lucrări ai nevoie de autorizația de construire, care se obține ulterior, pe baza lui.',
    },
    {
      q: 'Care e diferența dintre certificatul pentru informare și cel pentru construire?',
      a: 'Conținutul este același. Diferă scopul declarat în cerere: cel pentru informare îl folosești la vânzare-cumpărare, la notar sau ca să afli ce poți construi; cel cerut în vederea autorizării listează și avizele necesare pentru autorizația de construire. Noi obținem certificatul în scop de informare.',
    },
    {
      q: 'Ce acte îmi trebuie ca să comand?',
      a: 'Doar datele imobilului: județul, localitatea și numărul cadastral sau numărul de carte funciară (merge și adresa exactă). Restul dosarului — cererea tip, planurile cadastrale, extrasul de carte funciară dacă e cerut — îl pregătim noi.',
    },
    {
      q: 'Este obligatoriu certificatul de urbanism la vânzarea unui teren?',
      a: 'La terenurile din extravilan, da — notarul îl cere la autentificarea vânzării. La intravilan practica diferă de la notar la notar, dar cumpărătorii serioși îl cer oricum, ca să știe ce cumpără.',
    },
    {
      q: 'Ce înseamnă POT și CUT?',
      a: 'POT (procentul de ocupare a terenului) spune ce suprafață din teren poate fi acoperită de construcție — de exemplu, POT 35% pe un teren de 500 m² înseamnă amprentă maximă de 175 m². CUT (coeficientul de utilizare a terenului) limitează suprafața totală desfășurată, pe toate nivelurile. Ambele apar în certificat.',
    },
    {
      q: 'Funcționează pentru orice localitate din România?',
      a: 'Da. Depunem cereri la orice primărie din țară — comună, oraș sau municipiu. Multe primării nu au depunere online, așa că trimitem dosarul prin poștă sau curier, cu confirmare.',
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
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="container mx-auto px-4 max-w-[1280px] relative">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1.5 text-sm text-white/60">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Acasă
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </li>
                <li>
                  <Link href="/servicii/" className="hover:text-white transition-colors">
                    Servicii
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </li>
                <li className="text-white/90">Certificat de Urbanism</li>
              </ol>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-5">
                  <Badge className="bg-primary-500 text-secondary-900 hover:bg-primary-500">
                    Imobiliare
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30">
                    Emis de primăria imobilului
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat de Urbanism
                  <span className="block text-primary-500">Online</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/85 mb-6">
                  Îl obținem noi de la primărie, oriunde în România. Tu comanzi online cu datele
                  imobilului; noi întocmim dosarul, plătim taxa și îți trimitem certificatul pe
                  email.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <p className="text-white font-semibold mb-3">Cum funcționează:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-white/85 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Completezi cererea cu județul, localitatea și nr. cadastral sau adresa
                    </li>
                    <li className="flex items-start gap-2 text-white/85 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Întocmim dosarul și îl depunem la primăria localității imobilului
                    </li>
                    <li className="flex items-start gap-2 text-white/85 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Plătim taxa locală de eliberare — e inclusă în preț
                    </li>
                    <li className="flex items-start gap-2 text-white/85 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Primești certificatul pe email în {termen}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Price card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
                  <div className="bg-gradient-to-b from-secondary-900 to-[#12233C] p-5 text-center">
                    <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                      TAXE INCLUSE
                    </span>
                    <ServicePrice basePrice={service.base_price} />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-secondary-900">
                          Livrare în {termen}
                        </p>
                        <p className="text-xs text-neutral-500">termenul legal al primăriei</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-secondary-900">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">documentul scanat, imediat ce e emis</p>
                      </div>
                    </div>
                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">
                      Comandă Acum
                    </OrderButton>
                    <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" aria-hidden="true" /> Plată securizată
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Document oficial
                      </span>
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
                { icon: Landmark, value: 'Orice primărie', label: 'din România' },
                { icon: Zap, value: '100% online', label: 'fără drumuri la ghișeu' },
                { icon: Clock, value: termen, label: 'termen de livrare' },
                { icon: CheckCircle, value: '4.9/5', label: 'Peste 450 recenzii' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="text-base lg:text-lg font-extrabold text-secondary-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-neutral-500 -mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ce este */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Pe scurt
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
              Ce este certificatul de urbanism?
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul de urbanism</strong> este actul prin care primăria îți spune ce
                ai voie să faci cu un teren sau o clădire. Conține trei lucruri:{' '}
                <strong>regimul juridic</strong> (situația proprietății, sarcini, servituți),{' '}
                <strong>regimul economic</strong> (categoria de folosință — curți-construcții,
                arabil, pășune) și <strong>regimul tehnic</strong> — partea care interesează pe
                toată lumea: cât se poate construi (POT, CUT), ce înălțime e permisă și ce
                restricții există în zonă.
              </p>
              <p>
                Îl ceri de la primăria localității unde se află imobilul. Aici apare bătaia de cap:
                multe primării nu au depunere online, cer planuri cadastrale anexate la cerere și
                lucrează în termenul legal de 30 de zile. Dacă imobilul e în alt județ decât tine,
                aduni drumuri, telefoane și timp pierdut.
              </p>
              <p>
                Serviciul nostru scurtează tot procesul: trimiți datele imobilului online, iar noi
                întocmim cererea, anexăm planurile, depunem dosarul la primăria competentă și
                plătim taxa de eliberare. Certificatul emis ajunge la tine pe email.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 mt-6">
              <p className="text-neutral-700 leading-relaxed">
                <strong>Cât costă?</strong> {Number(service.base_price)} lei, totul inclus — dosar,
                depunere, taxa primăriei și livrarea pe email. Dacă vrei să îl obții singur, taxa
                primăriei e mică (de la câțiva zeci de lei, în funcție de suprafață), dar dosarul,
                planurile cadastrale și depunerea rămân la tine. Noi le facem pe toate.
              </p>
            </div>
          </div>
        </section>

        {/* Când ai nevoie */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Situații frecvente
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">
                Când ai nevoie de certificat de urbanism
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <uc.icon className="w-6 h-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-secondary-900 mb-3">{uc.title}</h3>
                  <ul className="space-y-2">
                    {uc.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
                        <CheckCircle
                          className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection />

        {options.length > 0 && <ServiceOptionsSection options={options} />}

        {/* Cum funcționează */}
        <section className="relative py-14 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="container mx-auto px-4 max-w-[1100px] relative">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-500/15 text-primary-400 border border-primary-500/30 text-sm font-semibold rounded-full mb-4">
                Pas cu pas
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                Cum obținem certificatul pentru tine
              </h2>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" />
              {steps.map((s) => (
                <div key={s.step} className="relative text-center">
                  <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_8px_24px_rgba(236,185,95,0.35)] mb-4">
                    <s.icon className="w-7 h-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-secondary-900">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Acte + ce primești */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Ce ne trimiți tu</h2>
                </div>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    Județul și localitatea imobilului
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    Numărul cadastral sau numărul de carte funciară (merge și adresa exactă)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    Datele tale de contact
                  </li>
                </ul>
                <p className="text-sm text-neutral-600 mt-4">
                  Atât. Cererea tip, planurile cadastrale și restul dosarului le pregătim noi. Nu
                  știi numărul cadastral? Îl găsim cu serviciul de{' '}
                  <Link
                    href="/servicii/identificare-imobil/"
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    identificare imobil după adresă
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Ce primești</h2>
                </div>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    Certificatul de urbanism emis de primărie, scanat, pe email
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    Regimul juridic, economic și tehnic al imobilului
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    POT, CUT, regim de înălțime, restricții și interdicții
                  </li>
                </ul>
                <p className="text-sm text-neutral-600 mt-4">
                  Cumperi terenul? Verifică și proprietarul cu un{' '}
                  <Link
                    href="/servicii/extras-de-carte-funciara/"
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    extras de carte funciară
                  </Link>{' '}
                  — cele două documente împreună îți arată exact ce cumperi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ServiceFAQ title="Întrebări Frecvente — Certificat de Urbanism" faqs={faqs} />

        {/* Final CTA */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="container mx-auto px-4 max-w-[900px] relative text-center">
            <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
              Scapă de drumurile la primărie
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Comanzi în câteva minute, cu datele imobilului. Noi depunem dosarul și îți trimitem
              certificatul pe email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
              <WhatsAppButton message="Bună ziua! Am o întrebare despre certificatul de urbanism." />
            </div>
          </div>
        </section>
      </main>
      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />
      <Footer />
    </>
  );
}
