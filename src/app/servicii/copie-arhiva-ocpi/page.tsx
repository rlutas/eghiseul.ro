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
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';
import { getImobiliareServices } from '@/lib/services/imobiliare';
import { ServiceSwitcher } from '@/components/services/service-switcher';

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'copie-arhiva-ocpi';
const PAGE_PATH = '/servicii/copie-arhiva-ocpi/';
const SCHEMA_SLUG = 'copie-arhiva-ocpi';
const TITLE = 'Copie Certificată din Arhiva OCPI — Documentație Cadastrală';
const DESCRIPTION =
  'Obții o copie certificată din arhiva teritorială OCPI/BCPI: memoriu tehnic, planuri și înscrisurile care au stat ' +
  'la baza intabulării imobilului. Cauți după numărul cadastral sau de carte funciară, cu taxele OCPI incluse. Totul online, livrare pe email.';
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
  name: 'Copie certificată din arhiva OCPI',
  description:
    'Serviciu prin care obții o copie certificată din arhiva teritorială OCPI/BCPI, adică documentația ' +
    'cadastrală depusă pentru un imobil: memoriu tehnic, planuri și piese scrise care au stat la baza ' +
    'înscrierii. Online, fără cont ANCPI, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
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
    { name: 'Copie din Arhiva OCPI', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Copie certificată din arhiva OCPI', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CopieArhivaOcpiPage() {
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
    { icon: KeyRound, title: 'Număr cadastral', desc: 'Identificatorul unic al imobilului (ex: 12783) pentru care căutăm dosarul în arhivă.' },
    { icon: ScrollText, title: 'Număr de carte funciară', desc: 'Numărul CF asociat proprietății, împreună cu județul și localitatea.' },
  ];

  const useCases = [
    { icon: ScrollText, title: 'Reconstituirea pieselor pierdute', items: ['Documentație cadastrală rătăcită', 'Memoriu tehnic lipsă', 'Piese din dosarul depus'] },
    { icon: Layers, title: 'Dosare juridice', items: ['Litigii de proprietate', 'Succesiuni și partaje', 'Probe pentru instanță'] },
    { icon: Ruler, title: 'Completarea documentațiilor', items: ['Dezmembrare sau alipire', 'Reactualizare cadastrală', 'Avize și autorizații'] },
    { icon: Search, title: 'Verificare istoric și due diligence', items: ['Istoricul înscrierilor', 'Verificare înainte de cumpărare', 'Audit imobiliar'] },
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
              <span className="text-white font-medium">Copie din Arhiva OCPI</span>
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
                    Copie certificată
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Copie Certificată
                  <span className="block text-primary-500">din Arhiva OCPI</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Îți recuperăm orice piesă din dosarul cadastral depus la OCPI/BCPI: memoriul tehnic,
                  planurile și înscrisurile care au stat la baza intabulării imobilului.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <ScrollText className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Primești o <strong className="text-primary-500">copie certificată</strong> de către OCPI a
                    documentației din arhivă — utilă pentru <strong>reconstituirea pieselor pierdute</strong>,
                    pentru dosare juridice și pentru completarea unei documentații cadastrale.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> copia din arhivă:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Introduci numărul cadastral sau de carte funciară',
                      'Confirmi județul și localitatea (opțional, ce piesă cauți)',
                      'Plătești securizat (taxe OCPI incluse)',
                      'Primești copia certificată pe email',
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
                        <p className="text-xs text-neutral-500">Copie certificată din dosarul cadastral</p>
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

        {/* Trust strip */}
        <section className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 max-w-[1100px] py-6 lg:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Landmark, value: 'OCPI', label: 'Arhivă teritorială' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Copie certificată' },
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
              Ce este copia certificată din arhiva OCPI și la ce folosește
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Copia certificată din arhiva OCPI</strong> este o reproducere conformă a unei piese din
                dosarul cadastral al unui imobil, eliberată de Oficiul de Cadastru și Publicitate Imobiliară
                (<strong>OCPI / BCPI</strong>). Atunci când un imobil este intabulat sau când se realizează o
                lucrare de cadastru, întreaga documentație depusă rămâne în <strong>arhiva teritorială</strong>:
                memoriul tehnic, planurile de amplasament și delimitare, schițele, calculul suprafeței și
                înscrisurile care au stat la baza înscrierii. Prin acest serviciu recuperăm pentru tine oricare
                dintre aceste piese, sub forma unei copii confirmate de OCPI.
              </p>
              <p>
                Spre deosebire de extrasul de carte funciară (care arată situația juridică la zi) sau de planul
                cadastral pe ortofotoplan (care arată poziția pe hartă), copia din arhivă îți pune la dispoziție
                <strong> conținutul efectiv al dosarului</strong> depus de-a lungul timpului. Este un serviciu
                general pentru recuperarea pieselor din dosarul cadastral, indiferent dacă ai nevoie de o singură
                schiță sau de întreaga documentație tehnică.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Ce piese poți recupera din dosarul cadastral
                </h3>
                <p className="text-sm text-neutral-700">
                  <strong>Memoriul tehnic</strong>, <strong>planul de amplasament și delimitare</strong>, schițele
                  și piesele desenate, calculul analitic al suprafeței, precum și înscrisurile care au stat la baza
                  intabulării (contracte, hotărâri, certificate de moștenitor). Dacă nu ești sigur ce piesă îți
                  trebuie, ne spui scopul și te ghidăm noi.
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Când ai nevoie de o copie din arhiva teritorială OCPI
              </h3>
              <p>
                Cel mai frecvent, copia din arhivă este cerută pentru <strong>reconstituirea pieselor pierdute</strong>:
                documentația cadastrală originală s-a rătăcit, iar pentru o nouă lucrare (dezmembrare, alipire,
                reactualizare) ai nevoie de memoriul tehnic sau de planul depus inițial. La fel de des, copia este
                folosită ca <strong>probă în dosare juridice</strong> — litigii de proprietate, succesiuni, partaje —
                unde instanța sau notarul solicită piesele din dosarul cadastral.
              </p>
              <p>
                Alte situații în care serviciul este util: <strong>completarea unei documentații</strong> aflate în
                lucru la un expert cadastral, <strong>verificarea istoricului</strong> unui imobil înainte de o
                tranzacție și <strong>due diligence</strong> imobiliar, atunci când vrei să vezi exact ce s-a depus
                și ce stă la baza înscrierilor existente. În toate aceste cazuri, copia confirmată de OCPI are
                valoarea necesară pentru a fi folosită în relația cu instituțiile, instanțele sau experții.
              </p>
              <p>
                Prin eGhișeul obții copia <strong>100% online</strong>, fără cont ANCPI și fără deplasare la ghișeul
                OCPI: ne ocupăm noi de identificarea dosarului în arhiva teritorială, de depunerea cererii și de
                achitarea taxelor, iar tu primești piesele solicitate direct pe email.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Copie din arhivă vs. extras de carte funciară vs. plan cadastral
                </h3>
                <p className="text-sm text-neutral-700">
                  <strong>Copia din arhivă</strong> = piesele din dosarul cadastral depus (memoriu tehnic, planuri,
                  înscrisuri). <strong>Extrasul de carte funciară</strong> = situația juridică la zi (proprietar,
                  suprafață, sarcini). <strong>Planul cadastral</strong> = reprezentarea grafică pe ortofotoplan.
                  Sunt complementare — pentru multe proceduri ai nevoie de mai multe dintre ele.{' '}
                  <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi extrasul de carte funciară
                  </Link>
                  .
                </p>
              </div>
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
                Cum identifici imobilul pentru căutarea în arhivă
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ai nevoie de un singur identificator, plus județul și localitatea. Opțional, ne spui ce piesă cauți.
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
                <strong>Nu știi numărul cadastral?</strong> Îl putem afla după adresă prin serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  Identificare Imobil
                </Link>
                , apoi căutăm dosarul în arhivă.
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
                Când Ai Nevoie de o Copie din Arhiva OCPI?
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții copia din arhivă în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Identifici Imobilul', desc: 'Introduci numărul cadastral sau de carte funciară al imobilului.', icon: KeyRound },
                { step: 2, title: 'Spui ce Piesă Cauți', desc: 'Confirmi județul și localitatea și, opțional, tipul documentului dorit.', icon: MapPin },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse.', icon: Shield },
                { step: 4, title: 'Primești Copia', desc: `În ${formatEstimatedDays(service)} primești copia certificată pe email.`, icon: CheckCircle },
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

        {/* Related — cross-link to other imobiliare copy services */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Servicii pentru imobile
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={serviceUrl('copie-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Reproducere conformă a cărții funciare a imobilului.</p>
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
                  <p className="text-sm text-neutral-600">Reprezentarea grafică a imobilului din dosarul cadastral.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-contract-vanzare')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Contract de Vânzare</p>
                  <p className="text-sm text-neutral-600">Înscrisul care a stat la baza intabulării proprietății.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Copie din Arhiva OCPI"
          faqs={[
            { q: 'Ce documente pot obține din arhiva OCPI?', a: 'Poți recupera orice piesă din dosarul cadastral depus pentru imobil: memoriul tehnic, planul de amplasament și delimitare, schițele și piesele desenate, calculul suprafeței, precum și înscrisurile care au stat la baza intabulării (contracte, hotărâri, certificate de moștenitor).' },
            { q: 'Ce este o copie certificată?', a: 'Este o reproducere conformă a unei piese din arhiva teritorială OCPI, confirmată de Oficiul de Cadastru. Are valoarea necesară pentru a fi folosită în relația cu instituțiile, instanțele și experții cadastrali.' },
            { q: 'Cu ce diferă de extrasul de carte funciară?', a: 'Extrasul de carte funciară arată situația juridică la zi (proprietar, suprafață, sarcini), iar copia din arhivă îți pune la dispoziție conținutul efectiv al dosarului depus (memoriu tehnic, planuri, înscrisuri). Sunt documente complementare.' },
            { q: 'Cât costă copia din arhiva OCPI?', a: `${service.base_price} RON, cu taxele OCPI incluse. Fără costuri ascunse.` },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)}. Cererea este procesată de un operator, iar copia este livrată pe email.` },
            { q: 'Nu știu numărul cadastral. Ce fac?', a: 'Îl putem afla după adresă prin serviciul de Identificare Imobil, apoi căutăm dosarul în arhiva teritorială OCPI.' },
            { q: 'Am nevoie de cont ANCPI?', a: 'Nu. Ne ocupăm noi de tot procesul: identificarea dosarului, depunerea cererii și achitarea taxelor. Tu ai nevoie doar de numărul cadastral sau de carte funciară.' },
            { q: 'Nu știu exact ce piesă îmi trebuie. Cum procedez?', a: 'Ne spui scopul (reconstituire, dosar juridic, completare documentație) și te ghidăm noi spre piesele necesare. Ne poți scrie pe WhatsApp pentru o recomandare rapidă înainte de comandă.' },
            { q: 'Pot folosi copia într-un dosar la instanță sau la notar?', a: 'Da. Copia certificată de OCPI este folosită ca probă în litigii de proprietate, succesiuni și partaje, la notar pentru completarea dosarelor, dar și ca document justificativ pentru intabulare, autorizație de construire, certificat de urbanism sau credit bancar.' },
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
                Gata să obții copia din arhiva OCPI?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de numărul cadastral sau de carte funciară. Primești copia certificată în {formatEstimatedDays(service)}.
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
