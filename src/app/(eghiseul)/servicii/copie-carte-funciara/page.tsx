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
  Map as MapIcon,
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
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';
import { getImobiliareServices } from '@/lib/services/imobiliare';
import { ServiceSwitcher } from '@/components/services/service-switcher';
import { PrivateServiceNotice } from '@/components/services/private-service-notice';
import { RelatedServicesLinks } from '@/components/services/related-services-links';

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'copie-carte-funciara';
const PAGE_PATH = '/servicii/copie-carte-funciara/';
const SCHEMA_SLUG = 'copie-carte-funciara';
const TITLE = 'Copie Carte Funciară in extenso (integrală) — OCPI / ANCPI';
const DESCRIPTION =
  'Copie carte funciară in extenso — reproducerea integrală a CF (părțile A, B și C) din arhiva OCPI. ' +
  'Util pentru litigii, succesiuni și verificarea istoricului proprietății. Taxe OCPI incluse, online, livrare pe email.';
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
  name: 'Copie Carte Funciară (in extenso)',
  description:
    'Serviciu de obținere a copiei cărții funciare in extenso de la OCPI / ANCPI — reproducerea integrală a ' +
    'cărții funciare (părțile A, B și C), inclusiv istoricul înscrierilor. Util pentru litigii, succesiuni și ' +
    'verificarea istoricului proprietății. 100% online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Copie Carte Funciară in extenso', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie Carte Funciară (in extenso)', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function CopieCarteFunciaraPage() {
  const service = await getService();
  // Schema price follows the DB (admin-editable) — hardcodat doar fallback-ul.
  const jsonLdGraph = buildJsonLd(Number(service?.base_price ?? 119));
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Ways to identify the property
  const identifiers = [
    { icon: ScrollText, title: 'Număr de carte funciară', desc: 'Numărul sub care este deschis registrul imobilului, în localitatea respectivă.' },
    { icon: KeyRound, title: 'Număr cadastral', desc: 'Numărul de sub care imobilul apare în evidența de cadastru (de exemplu 12783).' },
  ];

  const useCases = [
    { icon: ScrollText, title: 'Dosar aflat pe rolul instanței', items: ['Lanțul de transmisiuni', 'Înscrieri radiate', 'Probă depusă la dosar'] },
    { icon: Home, title: 'Succesiune cu mai mulți moștenitori', items: ['De unde vine fiecare cotă', 'Actele de dobândire', 'Partajul bunului'] },
    { icon: Search, title: 'Verificare înainte de o cumpărare mare', items: ['Ipoteci stinse', 'Interdicții ridicate', 'Cine a radiat și pe ce temei'] },
    { icon: Layers, title: 'Titlu de refăcut', items: ['Acte pierdute', 'File scrise de mână', 'Numere de CF închise'] },
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
              <span className="text-white font-medium">Copie Carte Funciară in extenso</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <ScrollText className="h-3.5 w-3.5 mr-1" />
                    Reproducere integrală
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie Carte Funciară{' '}
                  <span className="block text-primary-500">in extenso (integrală)</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Registrul întreg al imobilului, reprodus din arhiva OCPI: părțile A, B și C, cu toate înscrierile
                  făcute de-a lungul anilor, inclusiv cele radiate între timp. Documentul cu care lucrează avocații
                  într-un litigiu de proprietate.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <ScrollText className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Un extras îți spune cine e proprietarul azi. Copia in extenso îți spune{' '}
                    <strong className="text-primary-500">cine a fost înaintea lui</strong>, ce ipoteci au apăsat
                    imobilul și <strong>cine le-a radiat, pe ce temei</strong>.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> copia in extenso:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numărul cărții funciare sau pe cel cadastral',
                      'Adaugi județul și localitatea imobilului',
                      'Achiți o singură sumă, în care intră și taxa instituției',
                      'Copia integrală a registrului ajunge pe email',
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
                        <p className="text-xs text-neutral-500">Copie integrală a cărții funciare</p>
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
                { icon: Mail, value: 'Livrare pe email', label: 'Reproducere integrală CF' },
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
              Cartea funciară in extenso: tot registrul, nu doar pagina de astăzi
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Cartea funciară a unui imobil se ține la Oficiul de Cadastru și Publicitate Imobiliară
                (<strong>OCPI / ANCPI</strong>) și crește în timp. Fiecare vânzare, ipotecă, moștenire sau radiere
                lasă o urmă în registru.{' '}
                <strong>Copia in extenso</strong> reproduce registrul acela întreg, certificat de OCPI, de la prima
                înscriere până la ultima.
              </p>
              <p>
                Registrul are trei părți. Partea A ține descrierea imobilului: numărul cadastral, suprafața,
                categoria de folosință, vecinătățile. Partea B ține proprietarii și actele prin care fiecare a
                dobândit dreptul. Partea C ține sarcinile, adică ipotecile, servituțile, interdicțiile, sechestrele
                și procesele notate. Un extras îți arată ce este valabil azi în cele trei părți. Copia integrală îți
                arată și ce a fost și s-a radiat între timp, cu trimitere la actul care a produs fiecare înscriere.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Cine ajunge de fapt să o ceară
              </h3>
              <p>
                Cel mai des, avocații. Cine pregătește o acțiune în revendicare sau în anularea unui act are nevoie
                de lanțul complet de transmisiuni, nu de proprietarul de azi. Notarul o cere într-o succesiune care
                trece prin două sau trei generații, ca să vadă de unde vine fiecare cotă. Într-un partaj, copia
                arată cum s-a fragmentat proprietatea. Iar cumpărătorul care face o verificare serioasă înaintea
                unei achiziții mari se uită la ipotecile care au existat cândva: cine le-a constituit, cine le-a
                stins și în baza cărui act.
              </p>
              <p>
                Un al doilea motiv, mai puțin juridic: recuperarea propriei documentații. Dacă ți-ai pierdut actele
                și nu mai știi nici de la cine ai cumpărat, registrul păstrează informația. La imobilele cu carte
                funciară deschisă încă din perioada austro-ungară, primele file pot fi scrise de mână; copia le
                reproduce așa cum sunt în arhivă.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu îți spune copia integrală
              </h3>
              <p>
                Reproduce registrul, nu îl interpretează. Nu îți garantează că situația rămâne aceeași după data la
                care a fost scoasă din arhivă, fiindcă o înscriere nouă se poate face a doua zi. Nu ține locul
                extrasului pe care notarul îl solicită la autentificarea unui act, care are alt regim. Și nu conține
                ce nu a ajuns niciodată în cartea funciară: o înțelegere verbală între vecini, o construcție
                neînscrisă sau o chirie nenotată rămân invizibile acolo, oricât de vechi ar fi registrul.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Se confundă cel mai des cu extrasul de informare
                </h3>
                <p className="text-sm text-neutral-700">
                  Sunt două documente diferite scoase din același registru.{' '}
                  <strong>Extrasul de informare</strong> este o fotografie a situației de azi: proprietar actual,
                  suprafață, sarcini în vigoare. Ipoteca radiată acum cinci ani nu apare în el deloc.{' '}
                  <strong>Copia in extenso</strong> o păstrează, cu mențiunea radierii și cu încheierea care a
                  dispus-o. Dacă vrei să verifici rapid cum stau lucrurile acum, extrasul îți ajunge. Dacă îți
                  trebuie istoricul, ceri copia.{' '}
                  <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi extrasul de carte funciară
                  </Link>
                  .
                </p>
              </div>

              <p>
                Ca să găsim registrul în evidență ne trebuie numărul cărții funciare sau numărul cadastral, plus
                localitatea. Dacă ai doar adresa, pornim de la ea prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                {' '}și abia apoi cerem copia. Se întâmplă des ca imobilul să fi trecut prin dezmembrări sau
                alipiri, iar numărul vechi de CF să fie închis: spune-ne ce numere ai, chiar dacă par să nu se
                potrivească, și verificăm noi care este cel activ.
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
                Ce ne trebuie ca să găsim registrul
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Un singur număr ne ajunge. Restul căutăm noi în evidența OCPI.
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
                <strong>Ai doar adresa?</strong> Pornim de acolo, prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , și abia apoi cerem registrul.
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
                Situațiile în care nu îți ajunge situația de azi
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
              <p className="text-white/70 max-w-2xl mx-auto">De la un număr de CF până la registrul întreg, pe email</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Ne dai numărul', desc: 'Numărul cărții funciare sau cel cadastral al imobilului.', icon: KeyRound },
                { step: 2, title: 'Spui unde este', desc: 'Județul și localitatea. Verificăm potrivirea înainte să depunem cererea.', icon: MapPin },
                { step: 3, title: 'Plătești o dată', desc: 'Suma afișată acoperă și taxa pe care o achită operatorul la registru.', icon: Shield },
                { step: 4, title: 'Primești registrul', desc: `Copia integrală ajunge pe email în ${formatEstimatedDays(service)}.`, icon: CheckCircle },
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

        {/* Related — cross-link to CF + sarcini + plan cadastral */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Alte documente despre același imobil
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Sumar la zi: proprietar, suprafață, sarcini în vigoare.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('certificat-sarcini')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Certificat de Sarcini</p>
                  <p className="text-sm text-neutral-600">Verifici ipoteci, servituți și interdicții pe imobil.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Plan Cadastral</p>
                  <p className="text-sm text-neutral-600">Reprezentarea grafică a imobilului din arhiva OCPI.</p>
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
                  <p className="text-sm text-neutral-600">Nu știi numărul de CF? Îl aflăm după adresă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('extras-cf-colectiv')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Landmark className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras CF Colectiv</p>
                  <p className="text-sm text-neutral-600">Cartea funciară colectivă a întregului imobil bloc.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('actualizare-adresa-cf')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Actualizare Adresă în CF</p>
                  <p className="text-sm text-neutral-600">Corectezi sau actualizezi adresa imobilului în cartea funciară.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări despre copia integrală a cărții funciare"
          faqs={[
            { q: 'Copia îmi arată și proprietarii dinainte de 1990?', a: 'Arată tot ce este înscris în cartea funciară a imobilului, indiferent de an. Cât de departe merge înapoi ține de cât de veche este cartea funciară, nu de document. La imobilele cu CF deschisă în perioada austro-ungară, primele file pot fi scrise de mână, iar copia le reproduce așa cum sunt în registru.' },
            { q: 'Cum apare în copie o ipotecă radiată?', a: 'Rămâne scrisă în partea C, cu mențiunea radierii și cu încheierea care a dispus-o. Într-un extras la zi ipoteca aceea nu mai apare deloc. Exact de asta cere avocatul copia integrală: îl interesează că a existat, cine a constituit-o și cine a stins-o.' },
            { q: 'Îmi ține locul extrasului cerut de notar la semnarea actului?', a: 'Nu. Extrasul folosit la autentificare are alt regim și se obține prin notar. Copia in extenso este un document de documentare și de probă: o depui la dosar, o dai avocatului, o folosești în verificare, dar nu se semnează un act pe baza ei.' },
            { q: 'Pot cere copia pentru un imobil care nu este al meu?', a: 'Cartea funciară este un registru public, iar informarea asupra conținutului ei nu este rezervată proprietarului. Practic, poți cere copia și pentru un imobil pe care doar îl verifici, înainte de o cumpărare sau într-un litigiu.' },
            { q: 'Imobilul are două numere de carte funciară. Care este cel bun?', a: 'Se întâmplă des după dezmembrări și alipiri: numărul vechi s-a închis, iar imobilul a trecut într-unul nou. Trimite-ne toate numerele pe care le ai, chiar dacă par să nu se potrivească. Operatorul verifică în evidență care este CF-ul activ și din ce provine.' },
            { q: 'Copia are un termen de valabilitate?', a: 'Nu are un termen scris pe ea. Contează data la care a fost scoasă din arhivă, pentru că orice înscriere făcută după acea dată nu are cum să apară în ea. Instanțele și notarii se uită la cât de recentă este, nu la un termen.' },
            { q: 'Cât plătesc și în cât timp o primesc?', a: `${service.base_price} RON, indiferent de câte file are registrul. Un operator depune cererea la OCPI, achită taxa și îți trimite copia pe email, în format electronic, în ${formatEstimatedDays(service)}.` },
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
                Ai nevoie de istoricul complet al cărții funciare?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ne trebuie doar numărul cărții funciare sau cel cadastral, plus localitatea. Registrul întreg ajunge pe email în {formatEstimatedDays(service)}.
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
