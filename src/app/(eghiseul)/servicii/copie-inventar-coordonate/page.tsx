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
  Ruler,
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
const SERVICE_SLUG = 'copie-inventar-coordonate';
const PAGE_PATH = '/servicii/copie-inventar-coordonate/';
const SCHEMA_SLUG = 'copie-inventar-coordonate';
const TITLE = 'Copie Inventar de Coordonate Stereo 70';
const DESCRIPTION =
  'Copie inventar de coordonate în sistem Stereo 70: lista punctelor de hotar ale imobilului, cu ' +
  'coordonate X/Y, după numărul cadastral sau de carte funciară. Taxe OCPI incluse, totul online, livrare pe email.';
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
  name: 'Copie Inventar de Coordonate Stereo 70',
  description:
    'Serviciu de obținere a copiei inventarului de coordonate în sistemul de proiecție Stereo 70. ' +
    'Cuprinde lista punctelor de contur ale imobilului cu coordonate X/Y (puncte de hotar), folosită pentru ' +
    'trasare în teren, proiectare și verificarea limitelor. Online, cu livrare pe email și taxe OCPI incluse.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Copie Inventar de Coordonate Stereo 70', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie Inventar de Coordonate Stereo 70', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function CopieInventarCoordonatePage() {
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
    { icon: KeyRound, title: 'Numărul cadastral', desc: 'Cel sub care parcela figurează în evidența de cadastru.' },
    { icon: ScrollText, title: 'Numărul de carte funciară', desc: 'Îl folosim la fel de bine, dacă cel cadastral nu îl ai la îndemână.' },
  ];

  const useCases = [
    { icon: Ruler, title: 'Se pune gardul', items: ['Trasarea hotarului pe teren', 'Țăruși în punctele reale', 'Discuție încheiată cu vecinul'] },
    { icon: MapIcon, title: 'Dezmembrare sau alipire', items: ['Se recalculează loturile', 'Coordonatele de pornire', 'Documentația nouă'] },
    { icon: ScrollText, title: 'Suprapunere cu parcela vecină', items: ['Compari contururile', 'Vezi unde se calcă', 'Ai cifre, nu impresii'] },
    { icon: Home, title: 'Proiectare pe teren', items: ['Poziționarea construcției', 'Retrageri față de limite', 'Studiu topografic'] },
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
              <span className="text-white font-medium">Copie Inventar de Coordonate</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Ruler className="h-3.5 w-3.5 mr-1" />
                    Puncte de hotar X/Y
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    Stereo 70
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie Inventar de Coordonate{' '}
                  <span className="block text-primary-500">Stereo 70</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Colțurile parcelei tale, scrise ca perechi de numere. Cu ele, un topograf regăsește hotarul
                  pe teren fără să întrebe pe nimeni unde era.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Ruler className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Un plan se poate interpreta. O pereche de coordonate, nu. De asta se cer cifrele{' '}
                    <strong className="text-primary-500">când se pune un gard</strong>, când se împarte un teren
                    sau <strong>când doi vecini nu se înțeleg</strong>.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> inventarul de coordonate:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numărul cadastral sau pe cel de CF',
                      'Adaugi județul și localitatea parcelei',
                      'Achiți suma afișată, fără alte costuri pe parcurs',
                      'Îți trimitem tabelul de coordonate, pe email',
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
                        <p className="text-xs text-neutral-500">Inventar de coordonate Stereo 70</p>
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
                { icon: Landmark, value: 'Stereo 70', label: 'Coordonate X/Y' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Puncte de hotar' },
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
              Colțurile parcelei, scrise ca numere
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Fiecare colț al unui teren măsurat are o pereche de valori, X și Y, raportate la sistemul național
                de proiecție <strong>Stereo 70</strong>. Puse una sub alta, valorile astea formează inventarul de
                coordonate: lista punctelor de hotar ale parcelei, așa cum au fost înregistrate în evidența
                OCPI / ANCPI. Documentul mai conține de obicei distanțele dintre puncte și suprafața rezultată din
                calcul, ca să poți închide conturul și verifica dacă îți iese.
              </p>
              <p>
                Diferența practică față de orice planșă e că un desen se poate citi greșit, iar o pereche de numere
                nu. Topograful încarcă valorile în stația totală sau în receptorul GPS, iese pe teren și pune
                țărușii exact acolo unde spun cifrele. Doi ingineri diferiți, cu aparate diferite, ajung în același
                punct.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Trei momente în care lumea le cere
              </h3>
              <p>
                <strong>Se pune un gard.</strong> Cel mai banal motiv și, de departe, cel mai frecvent. Nimeni nu
                mai știe pe unde trecea hotarul, iar discuția cu vecinul se termină în momentul în care apar
                țărușii puși pe coordonate.
              </p>
              <p>
                <strong>Se împarte un teren.</strong> La o dezmembrare sau la o alipire, expertul pornește de la
                conturul înregistrat și recalculează loturile. Fără coordonatele existente, lucrarea începe cu o
                măsurătoare nouă care poate să nu se potrivească cu ce e în evidență.
              </p>
              <p>
                <strong>Două parcele par să se calce.</strong> Când suspectezi o suprapunere cu vecinul, compararea
                se face pe coordonate, nu pe desen. Abia atunci se vede dacă e o problemă reală sau doar o
                impresie de pe hartă.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Coordonatele nu sunt planul de amplasament
                </h3>
                <p className="text-sm text-neutral-700">
                  Se cer adesea împreună și de aceea se amestecă. Inventarul de coordonate e un{' '}
                  <strong>tabel</strong>, folosit pentru trasare și calcul.{' '}
                  <strong>Planul de amplasament și delimitare</strong> e un <strong>desen</strong> la scară, cu
                  vecinătăți și cote, folosit ca piesă în dosare. Dacă lucrarea o face un inginer, îi trebuie
                  tabelul. Dacă documentul merge la notar sau la primărie, îi trebuie desenul.{' '}
                  <Link href={serviceUrl('plan-amplasament-delimitare')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi planul de amplasament și delimitare
                  </Link>
                  .
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu dovedesc coordonatele
              </h3>
              <p>
                Sunt valorile din evidență, nu o măsurătoare făcută azi. Dacă hotarul real diferă de cel
                înregistrat, cifrele nu îți spun asta, ci abia comparația dintre ele și teren. Trasarea propriu-zisă
                o face un expert autorizat, cu aparat; noi îți dăm datele cu care lucrează el. Iar dacă din
                comparație rezultă o eroare, corectarea cere o documentație cadastrală nouă, nu o nouă copie a
                aceluiași tabel.
              </p>
              <p>
                Nu îți spun nici cine e proprietar și nici ce sarcini apasă terenul. Alea se citesc în cartea
                funciară. Ne trebuie numărul cadastral sau cel de CF, plus localitatea; dacă nu le ai, le scoatem
                după adresă prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                .
              </p>
              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce face topograful cu ele
              </h3>
              <p>
                Dacă lucrarea o comanzi pentru altcineva, merită să știi ce urmează. Inginerul preia valorile,
                le încarcă în aparat și iese pe teren cu ele. Acolo caută punctele unul câte unul și le
                materializează, cu țăruș sau cu bornă. Când terenul e liber, treaba durează o oră. Când e plin de
                vegetație sau când există deja construcții pe limită, durează mai mult și pot apărea surprize:
                un colț cade în interiorul unui gard existent, alt colț cade pe drum. Surprizele astea nu vin din
                cifre, ci din ce s-a construit între timp fără să fie înscris.
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
                Ce ne trebuie ca să scoatem tabelul
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Un singur număr al parcelei. Coordonatele le luăm noi din evidență.
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
                <strong>Ai doar adresa terenului?</strong> Îl scoatem prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi îți obținem inventarul de coordonate.
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
                Situațiile în care cifrele închid discuția
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
              <p className="text-white/70 max-w-2xl mx-auto">Fără cont ANCPI și fără drum la biroul teritorial</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Numărul parcelei', desc: 'Ne trebuie unul singur, ca să ajungem la punctele înregistrate.', icon: KeyRound },
                { step: 2, title: 'Unde e terenul', desc: 'Județul și localitatea, ca să știm la ce birou mergem.', icon: MapPin },
                { step: 3, title: 'Plata', desc: 'Se face din browser, într-un singur pas, fără alte formalități.', icon: Shield },
                { step: 4, title: 'Tabelul pe email', desc: `Punctele de hotar îți ajung în ${formatEstimatedDays(service)}.`, icon: CheckCircle },
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

        {/* Related — cross-link to imobile services */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Ce se comandă de obicei alături de coordonate
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('plan-amplasament-delimitare')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Ruler className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Plan de Amplasament și Delimitare</p>
                  <p className="text-sm text-neutral-600">Reprezentarea grafică a parcelei, la scară, cu vecinătăți.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('extras-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Plan Cadastral</p>
                  <p className="text-sm text-neutral-600">Imobilul pe ortofotoplan, cu conturul și vecinătățile.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:col-span-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Situația juridică: proprietar, suprafață, sarcini.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări despre coordonatele punctelor de hotar"
          faqs={[
            { q: 'Ce este, de fapt, sistemul Stereo 70?', a: 'Este proiecția în care se raportează în România pozițiile din cadastru. Practic, dă fiecărui punct de pe teren o pereche de valori X și Y într-un sistem național unic, așa că două măsurători corecte, făcute de oameni diferiți, ajung la aceleași numere.' },
            { q: 'Coordonatele îmi arată unde e gardul acum?', a: 'Nu. Îți arată unde a fost înregistrat hotarul. Dacă gardul a fost pus altundeva, diferența apare abia când un topograf compară valorile cu terenul. Exact de asta se cer înainte de o trasare, nu după.' },
            { q: 'Pot să trasez singur, cu telefonul?', a: 'GPS-ul unui telefon are o eroare mult prea mare pentru un hotar. Trasarea se face cu stație totală sau cu receptor GNSS de precizie, de un expert autorizat. Noi îți dăm datele exacte cu care lucrează el.' },
            { q: 'Îmi trebuie tabelul sau planul de amplasament?', a: 'Dacă lucrarea o face un inginer, tabelul. Dacă documentul merge la notar, la primărie sau într-un dosar, desenul. Se cer des împreună, dar răspund la lucruri diferite: unul se încarcă în aparat, celălalt se depune la dosar.' },
            { q: 'Ce fac dacă suprafața calculată din coordonate nu se potrivește cu cea din acte?', a: 'Se întâmplă la lucrări vechi și înseamnă că undeva există o neconcordanță de rezolvat. Corectarea trece printr-o documentație cadastrală întocmită de un expert și înscrisă la OCPI. O copie nouă a aceluiași tabel nu schimbă nimic.' },
            { q: 'Câte puncte are un inventar?', a: 'Câte colțuri are parcela. Un teren dreptunghiular are patru, unul cu formă neregulată poate avea zeci. Toate punctele înregistrate ajung în tabel, numerotate, cu distanțele dintre ele.' },
            { q: 'Cât costă și în ce formă primesc valorile?', a: `${service.base_price} RON, oricâte puncte de hotar ar avea parcela. Le primești electronic, pe email, în ${formatEstimatedDays(service)}, și le poți trimite mai departe topografului exact așa cum îți ajung.` },
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
                Ai nevoie de punctele de hotar?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Un număr al parcelei și localitatea. Tabelul cu coordonate îți ajunge pe email în {formatEstimatedDays(service)}.
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
