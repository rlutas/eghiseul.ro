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
const SERVICE_SLUG = 'plan-amplasament-delimitare';
const PAGE_PATH = '/servicii/plan-amplasament-delimitare/';
const SCHEMA_SLUG = 'plan-amplasament-delimitare';
const TITLE = 'Plan de Amplasament și Delimitare (PAD) din Arhiva OCPI';
const DESCRIPTION =
  'Obții planul de amplasament și delimitare (PAD) din arhiva OCPI după numărul cadastral sau de carte funciară: ' +
  'conturul parcelei, lungimile laturilor, suprafața măsurată și vecinătățile. Taxe OCPI incluse, ' +
  'totul online, livrare pe email, fără cont ANCPI.';
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
  name: 'Plan de Amplasament și Delimitare',
  description:
    'Serviciu prin care primești planul de amplasament și delimitare (PAD) din arhiva OCPI — planul întocmit ' +
    'la recepția cadastrală, cu conturul parcelei, lungimile laturilor, suprafața măsurată și vecinătățile. ' +
    'Totul online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Plan de Amplasament și Delimitare', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Plan de Amplasament și Delimitare', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
});

export default async function PlanAmplasamentDelimitarePage() {
  const service = await getService();
  // Schema price follows the DB (admin-editable) — hardcodat doar fallback-ul.
  const jsonLdGraph = buildJsonLd(Number(service?.base_price ?? 149));
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Ways to identify the property
  const identifiers = [
    { icon: KeyRound, title: 'Numărul cadastral', desc: 'Cel al parcelei pentru care vrei planul, așa cum apare în evidență.' },
    { icon: ScrollText, title: 'Numărul de carte funciară', desc: 'Funcționează la fel, dacă numărul cadastral nu ți-a rămas nicăieri.' },
  ];

  const useCases = [
    { icon: ScrollText, title: 'Vinzi un teren', items: ['Cumpărătorul vrea conturul', 'Suprafața măsurată', 'Anexă la dosarul notarial'] },
    { icon: Layers, title: 'Împarți sau unești parcele', items: ['Punctul de pornire al expertului', 'Loturi recalculate', 'Documentația nouă'] },
    { icon: Ruler, title: 'Nu mai știi pe unde e hotarul', items: ['Lungimile laturilor', 'Vecinul de pe fiecare latură', 'Cifre de comparat cu terenul'] },
    { icon: Home, title: 'Pregătești o construcție', items: ['Retrageri față de limite', 'Anexă la dosarul de autorizare', 'Suport pentru proiectant'] },
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
              <span className="text-white font-medium">Plan de Amplasament și Delimitare</span>
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
                    Cu suprafață și laturi
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    Arhiva OCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Plan de Amplasament{' '}
                  <span className="block text-primary-500">și Delimitare (PAD)</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Planșa care spune cât are fiecare latură și cine e vecinul pe fiecare dintre ele. Copie din
                  dosarul de la OCPI, așa cum a fost recepționată.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Ruler className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    E singurul document care scrie{' '}
                    <strong className="text-primary-500">vecinul de pe fiecare latură</strong>. De asta îl cer
                    cumpărătorii, <strong>expertii care împart un teren</strong> și cine are o discuție de hotar.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> planul de amplasament:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numărul cadastral sau pe cel de CF',
                      'Ne spui județul și localitatea parcelei',
                      'Achiți o dată; la depunere nu mai adaugi nimic',
                      'Îți trimitem planșa scanată, pe email',
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
                        <p className="text-xs text-neutral-500">Plan de amplasament și delimitare</p>
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
                { icon: Landmark, value: 'OCPI', label: 'Document OCPI' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Plan din arhiva OCPI' },
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
              Planșa care spune cât are fiecare latură și cine e vecinul
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Când un teren a fost măsurat și înscris în cadastru, inginerul a desenat conturul lui la scară
                mare și a trecut pe fiecare latură lungimea și numele sau numărul cadastral al vecinului. Desenul
                acela, <strong>planul de amplasament și delimitare</strong>, a trecut prin recepție la Oficiul de
                Cadastru și Publicitate Imobiliară și a rămas în dosarul imobilului. Copia lui e ce îți aducem noi.
              </p>
              <p>
                Ce se citește pe el: forma parcelei, lungimile laturilor, suprafața rezultată din măsurătoare,
                vecinătățile pe fiecare latură, numărul cadastral și datele de identificare ale imobilului. Nicio
                altă piesă din dosar nu le adună pe toate la un loc, și de asta ajunge cel mai des cerut dintre
                planuri.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Aici apare discuția despre suprafață
              </h3>
              <p>
                Suprafața de pe planșă este cea <strong>măsurată</strong>. Suprafața din actul vechi de proprietate
                este cea <strong>din acte</strong>, moștenită uneori din titluri făcute cu decenii în urmă. Cele
                două nu coincid aproape niciodată, iar diferența poate ajunge la zeci de metri pătrați. Nu e o
                greșeală a nimănui: o măsurătoare făcută cu aparat modern nu are cum să dea exact ce scria într-un
                titlu de proprietate din anii nouăzeci. Când vinzi, cumpărătorul se uită la cifra măsurată, fiindcă
                aia corespunde cu terenul.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Cine îl cere
              </h3>
              <p>
                Cumpărătorii, înaintea unei tranzacții cu teren, ca să vadă forma și vecinii. Experții cadastrali,
                când urmează o dezmembrare sau o alipire și au nevoie de conturul de la care pornesc. Proprietarii
                aflați într-o discuție de hotar, fiindcă vecinătățile scrise pe planșă sunt un punct de referință
                greu de contestat. Și proiectanții, care calculează retragerile față de limite pornind de la ce
                arată planul.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Nu e același lucru cu „a face cadastru”
                </h3>
                <p className="text-sm text-neutral-700">
                  Oamenii sună des cerând plan de amplasament când, de fapt, terenul lor nu e încă înscris în
                  cadastru. Dacă imobilul nu are număr cadastral, nu există nicio planșă de copiat: trebuie
                  întocmită o documentație nouă, de un expert autorizat care iese pe teren și măsoară. Ce facem noi
                  e să scoatem din arhivă planul unei lucrări deja recepționate.
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce nu îți rezolvă planul
              </h3>
              <p>
                Nu stabilește hotarul în caz de conflict. Arată ce s-a măsurat și ce s-a recepționat atunci; dacă
                vecinul contestă, discuția se mută în altă parte, cu expertiză și, la nevoie, cu instanță. Nu
                autorizează nicio construcție, ci e doar o piesă din dosarul cu care ceri autorizația. Și nu ține
                cont de ce s-a schimbat după recepție: dacă parcela a fost între timp dezmembrată, fiecare lot nou
                are propriul plan.
              </p>
              <p>
                Dacă vrei doar să localizezi terenul pe hartă, îți ajunge{' '}
                <Link href={serviceUrl('extras-plan-cadastral')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extrasul de plan cadastral pe ortofotoplan
                </Link>
                . Dacă îți trebuie valorile numerice ale colțurilor, pentru trasare, ceri separat{' '}
                <Link href={serviceUrl('copie-inventar-coordonate')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  inventarul de coordonate
                </Link>
                . Iar dacă nu cunoști numărul cadastral, îl aflăm după adresă cu serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil
                </Link>
                .
              </p>
              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce merită comparat când îl primești
              </h3>
              <p>
                Trei lucruri, în ordinea asta. Întâi suprafața de pe planșă față de cea din actul de proprietate,
                fiindcă acolo apar cele mai multe surprize. Apoi vecinătățile: dacă pe o latură scrie un nume care
                nu îți spune nimic, înseamnă că proprietarul de acolo s-a schimbat de la recepție încoace, ceea ce
                e normal, dar bine de știut înainte de o discuție. La final, forma parcelei față de cum arată pe
                teren. Dacă gardul taie un colț sau dacă o latură pare mai scurtă decât scrie, ai un motiv concret
                să chemi un topograf, nu doar o bănuială.
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
                Ce ne trebuie ca să scoatem planșa
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Un număr al parcelei și localitatea în care se află.
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
                <strong>Nu găsești numărul nicăieri?</strong> Îl scoatem după adresă, cu serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi îți obținem planul de amplasament și delimitare.
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
                Cine se uită pe planșă și de ce
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
              <p className="text-white/70 max-w-2xl mx-auto">Mergem noi la biroul teritorial unde e dosarul</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Numărul parcelei', desc: 'Cu el găsim planșa recepționată pentru terenul tău.', icon: KeyRound },
                { step: 2, title: 'Județ și localitate', desc: 'Ne arată la ce birou teritorial se află dosarul.', icon: MapPin },
                { step: 3, title: 'Plata', desc: 'Un singur pas. Tariful pe care îl achită operatorul e deja acoperit.', icon: Shield },
                { step: 4, title: 'Planșa scanată', desc: `Cu laturi, suprafață și vecini, pe email în ${formatEstimatedDays(service)}.`, icon: CheckCircle },
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

        {/* Related — cross-link to plan cadastral + inventar coordonate + CF */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Ce se mai scoate pentru aceeași parcelă
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('extras-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Plan Cadastral</p>
                  <p className="text-sm text-neutral-600">Imobilul pe ortofotoplan: poziția și conturul pe hartă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-inventar-coordonate')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Inventar de Coordonate</p>
                  <p className="text-sm text-neutral-600">Coordonatele Stereo 70 ale punctelor de contur.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Situația juridică: proprietar, suprafață, sarcini.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-plan-incadrare')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie după Planul de Încadrare</p>
                  <p className="text-sm text-neutral-600">Poziția imobilului în zonă, din dosarul cadastral.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări despre planul de amplasament și delimitare"
          faqs={[
            { q: 'Suprafața de pe planșă diferă de cea din actul meu. Care e bună?', a: 'Planșa arată suprafața măsurată, actul vechi arată suprafața din titlu. Diferența e obișnuită și vine din faptul că măsurătorile moderne sunt mult mai precise decât cele pe baza cărora s-au întocmit titlurile vechi. La o vânzare, cumpărătorul se raportează la cifra măsurată, fiindcă ea corespunde cu terenul.' },
            { q: 'Terenul meu nu are număr cadastral. Îmi puteți da planul?', a: 'Nu, fiindcă nu există. Dacă imobilul nu e înscris în cadastru, nu s-a depus niciodată o planșă care să poată fi copiată. Îți trebuie o documentație cadastrală nouă, întocmită de un expert autorizat care iese pe teren și măsoară.' },
            { q: 'Vecinul spune că gardul e pe terenul lui. Planul rezolvă?', a: 'Ajută, dar nu tranșează. Pe planșă scrie ce s-a măsurat și cine era vecinul pe fiecare latură la data recepției. Dacă el contestă, urmează o expertiză și, dacă nu vă înțelegeți, instanța. Planul e piesa de la care pleacă discuția, nu decizia finală.' },
            { q: 'Ce înseamnă vecinătățile trecute pe laturi?', a: 'Pe fiecare latură a parcelei este notat cu ce se învecinează: un nume, un număr cadastral, un drum, un canal. E singurul document din dosar care le scrie explicit, motiv pentru care se cere în discuțiile de hotar.' },
            { q: 'Îmi ține loc de autorizație de construire?', a: 'Nu. Este una dintre piesele pe care le depui ca să obții autorizația. Ce ai voie să construiești rezultă din certificatul de urbanism și din avizele cerute de primărie, nu din planșă.' },
            { q: 'Am dezmembrat terenul anul trecut. Ce primesc?', a: 'Primești planul care corespunde numărului cadastral pe care ni-l dai. După dezmembrare, fiecare lot nou are propriul număr și propria planșă. Spune-ne toate numerele pe care le ai și verificăm care e activ.' },
            { q: 'Cât costă și cât se așteaptă?', a: `${service.base_price} RON, sumă care acoperă și tariful instituției. Un operator identifică planul în arhiva biroului teritorial și ți-l trimite scanat, pe email, în ${formatEstimatedDays(service)}.` },
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
                Vrei laturile, suprafața și vecinii, negru pe alb?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Un număr al parcelei și localitatea. Planșa îți vine pe email în {formatEstimatedDays(service)}.
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
