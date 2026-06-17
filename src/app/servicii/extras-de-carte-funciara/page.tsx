import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Shield,
  Zap,
  FileText,
  CheckCircle,
  ChevronRight,
  Home,
  MapPin,
  Search,
  Mail,
  Landmark,
  Banknote,
  ScrollText,
  KeyRound,
  X,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { OrderButton } from '@/components/services/order-button';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { ReviewsSection } from '@/components/services/reviews-section';
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT_LABEL } from '@/config/contact';
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';

// Database slug (order pipeline identifier). URL path uses the WP slug
// (extras-DE-carte-funciara) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'extras-carte-funciara';
const PAGE_PATH = '/servicii/extras-de-carte-funciara/';
const SCHEMA_SLUG = 'extras-de-carte-funciara';
const TITLE = 'Extras Carte Funciară Online — în Câteva Minute, 89 RON';
const DESCRIPTION =
  'Extras de carte funciară online de la ANCPI, livrat pe email în câteva minute. ' +
  '89 RON, taxe incluse — fără cont ANCPI și fără taxă de urgență.';
const DATE_PUBLISHED = '2026-06-13';
const DATE_MODIFIED = '2026-06-16';

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
  ogImage: '/og/default.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Extras de Carte Funciară Online',
  description:
    'Serviciu de obținere a Extrasului de Carte Funciară (CF) de la ANCPI, eliberat automat în ' +
    'câteva minute, 24/7. Document cu situația juridică a imobilului: proprietar, suprafață, ' +
    'sarcini și ipoteci. 100% online, fără cont ANCPI, fără taxă de urgență, livrare pe email.',
  serviceType: 'Document Processing — Real Estate',
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
    { name: 'Extras de Carte Funciară', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Extras de Carte Funciară (Standard)', price: 89, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function ExtrasCarteFunciaraPage() {
  const data = await getService();
  if (!data) notFound();

  const { service } = data;
  // Defensive: hide add-ons we don't actually offer for CF (e.g. legalized
  // copies), independent of the DB/ISR cache state.
  const HIDDEN_OPTION_CODES = new Set(['copii_suplimentare']);
  const options = data.options.filter((o) => !HIDDEN_OPTION_CODES.has(o.code));

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Ways to identify the property — targets the "număr cadastral" cluster
  const identifiers = [
    { icon: KeyRound, title: 'Număr cadastral', desc: 'Identificatorul unic al imobilului (ex: 12783).' },
    { icon: ScrollText, title: 'Număr de carte funciară', desc: 'Numărul CF asociat proprietății din localitate.' },
    { icon: MapPin, title: 'Număr topografic', desc: 'Pentru imobile neintabulate cadastral.' },
    { icon: Search, title: 'Identificator electronic', desc: 'Format ANCPI (ex: 123456-C1-U2).' },
  ];

  const useCases = [
    { icon: Home, title: 'Tranzacții imobiliare', items: ['Vânzare-cumpărare', 'Antecontract', 'Autentificare notarială'] },
    { icon: Banknote, title: 'Credit & ipotecă', items: ['Credit ipotecar', 'Refinanțare', 'Garanții bancare'] },
    { icon: ScrollText, title: 'Succesiune & moștenire', items: ['Dezbatere succesorală', 'Partaj', 'Donație'] },
    { icon: Shield, title: 'Verificare proprietate', items: ['Proprietar actual', 'Sarcini și ipoteci', 'Casa Verde'] },
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
              <span className="text-white font-medium">Extras de Carte Funciară</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Eliberare în câteva minute
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Extras de Carte Funciară
                  <span className="block text-primary-500">Online</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* USP — the unique selling point vs every competitor */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Zap className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    <strong className="text-primary-500">Singurii din România</strong> care îți eliberează extrasul de
                    carte funciară <strong>în câteva minute, automat, 24/7</strong> — fără taxă de urgență, fără cont
                    ANCPI și fără drum la ghișeu.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Extrasul de Carte Funciară</strong> arată situația
                    juridică actuală a unui imobil. Îl obții rapid de la noi:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi numărul de carte funciară sau cadastral',
                      'Verificăm și depunem cererea automat la ANCPI',
                      'Plătești securizat (taxe ANCPI incluse)',
                      'Primești extrasul CF pe email în câteva minute',
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
                        TAXE ANCPI INCLUSE
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
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în câteva minute</p>
                        <p className="text-xs text-neutral-500">24/7, dacă sistemul ANCPI e operațional</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">PDF semnat electronic ANCPI</p>
                      </div>
                    </div>

                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">
                      Comandă Acum
                    </OrderButton>

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
                { icon: Zap, value: 'Câteva minute', label: 'Eliberare automată 24/7' },
                { icon: Landmark, value: 'ANCPI', label: 'Document oficial OCPI' },
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
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Despre serviciu
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Ce este Extrasul de Carte Funciară și de unde se obține
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Extrasul de Carte Funciară</strong> (sau „extras CF”) este documentul oficial eliberat de
                Oficiul de Cadastru și Publicitate Imobiliară (<strong>OCPI</strong>), parte din ANCPI, care atestă
                situația juridică a unui imobil: cine este proprietarul actual, suprafața, vecinătățile și eventualele
                <strong> sarcini, ipoteci sau interdicții</strong>. Cartea funciară este registrul public în care se
                înscriu toate drepturile asupra unei proprietăți.
              </p>
              <p>
                Prin eGhișeul obții <strong>extrasul de carte funciară online</strong>, fără drum la ghișeul OCPI.
                Ai nevoie doar de numărul cadastral sau de adresa imobilului. Noi depunem cererea, plătim taxele OCPI
                și îți trimitem extrasul CF pe email, semnat electronic și verificabil pe portalul ANCPI.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Cât costă și de unde obții extrasul de carte funciară
                </h3>
                <p className="text-sm text-neutral-700">
                  Pentru fiecare extras de carte funciară, OCPI percepe o <strong>taxă oficială</strong>, indiferent
                  de unde îl ceri. Îl poți obține personal la ghișeul OCPI sau prin portalul ANCPI (dacă ai cont și
                  semnătură electronică). Prin eGhișeul plătești <strong>{service.base_price} RON cu taxele ANCPI
                  incluse</strong>, 100% online, fără cont ANCPI și fără deplasare — primești documentul pe email.
                </p>
              </div>
            </div>

            {/* Cine poate cere + ce acte — part of the "ce este" section */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-secondary-900 mb-3">Cine poate cere extrasul de carte funciară</h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                  Extrasul de carte funciară <strong>pentru informare</strong> este public — îl poate cere
                  <strong> oricine</strong>, nu doar proprietarul, fără acordul acestuia. Cel mai des îl solicită:
                </p>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {['Cumpărători care verifică un imobil', 'Proprietari și moștenitori', 'Notari, avocați și experți', 'Bănci și instituții de creditare'].map((r) => (
                    <li key={r} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-secondary-900 mb-3">Ce acte și date îți trebuie</h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                  Pentru extrasul de informare <strong>nu ai nevoie de acte de identitate</strong> și nici de acordul
                  proprietarului. Îți trebuie doar:
                </p>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {['Numărul cadastral SAU numărul de carte funciară', 'Sau adresa imobilului (îl identificăm noi)', 'Județul și localitatea imobilului', 'O adresă de email pentru livrare'].map((r) => (
                    <li key={r} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Property identifiers — targets "număr cadastral" cluster */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Identificare imobil
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum identifici imobilul pentru extras
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ai nevoie de un singur identificator. Dacă nu îl știi, îl putem căuta după adresă sau proprietar.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {identifiers.map((it) => (
                <div key={it.title} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <it.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{it.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-primary-50 rounded-2xl border border-primary-200 max-w-3xl mx-auto flex items-start gap-3">
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-secondary-700">
                <strong>Nu știi numărul cadastral?</strong> Îl poți afla din actul de proprietate sau din extrasul
                vechi. Dacă nu îl găsești, îl <strong>aflăm noi după adresă</strong> prin serviciul de{' '}
                <Link
                  href={serviceUrl('identificare-imobil')}
                  className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Identificare Imobil
                </Link>
                , apoi îți eliberăm extrasul.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing & options — base + free urgency + add-ons */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Preț & opțiuni
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Prețuri transparente, fără surprize</h2>
              <p className="text-neutral-600 max-w-xl mx-auto">Prețul de bază include taxele ANCPI. Procesarea urgentă este gratuită.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {/* Base service — featured */}
              <div className="relative rounded-3xl border-2 border-primary-500 bg-white p-6 lg:p-7 shadow-[0_8px_28px_rgba(236,185,95,0.18)] flex flex-col">
                <span className="absolute -top-3 left-6 inline-block rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-secondary-900">
                  Serviciul de bază
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200">
                  <ScrollText className="h-6 w-6 text-primary-700" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-1.5">Extras de Carte Funciară</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">
                  Documentul oficial ANCPI cu proprietar, suprafață, sarcini și ipoteci. Livrat pe email.
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-secondary-900">{fmt(priceExVat)}</span>
                  <span className="text-sm font-bold text-neutral-400">RON</span>
                </div>
                <p className="text-xs text-neutral-500">+ TVA 21% · {fmt(priceWithVat)} RON cu TVA · taxe ANCPI incluse</p>
              </div>

              {/* Urgency — free */}
              <div className="relative rounded-3xl border-2 border-green-300 bg-green-50/50 p-6 lg:p-7 flex flex-col">
                <span className="absolute -top-3 left-6 inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                  Inclus gratuit
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                  <Zap className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-1.5">Procesare urgentă</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">
                  Sistemul nostru depune și emite cererile <strong>automat, 24/7</strong>. La alți operatori, urgența
                  costă în plus (~19 lei + TVA).
                </p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black text-green-700">0 RON</span>
                  <span className="text-sm font-semibold text-neutral-400 line-through">~19 lei</span>
                </div>
                <p className="text-xs text-neutral-500">Fără taxă de urgență, niciodată</p>
              </div>

              {/* Add-ons (dynamic) */}
              {options.map((option) => (
                <div key={option.id} className="rounded-3xl border border-neutral-200 bg-white p-6 lg:p-7 hover:border-primary-300 hover:shadow-md transition-all flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200">
                    <Home className="h-6 w-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1.5">{option.name}</h3>
                  {option.description && (
                    <p className="text-sm text-neutral-600 leading-relaxed mb-5 flex-1">{option.description}</p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-600">+{fmt(Math.round((Number(option.price) / 1.21) * 100) / 100)}</span>
                    <span className="text-sm font-bold text-neutral-400">RON</span>
                  </div>
                  <p className="text-xs text-neutral-500">+ TVA 21% · +{option.price} RON cu TVA · opțional</p>
                </div>
              ))}
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
                Când Ai Nevoie de Extras de Carte Funciară?
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
          </div>
        </section>

        <ReviewsSection />

        {/* How it works — dark connected timeline */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] py-14 lg:py-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-500/15 text-primary-400 text-sm font-semibold rounded-full mb-4 border border-primary-500/30">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">Cum Funcționează?</h2>
              <p className="text-white/70 max-w-2xl mx-auto">Obții extrasul de carte funciară în 4 pași, 100% online — fără drum la ghișeu.</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {/* connecting line (desktop) */}
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Identifici Imobilul', desc: 'Introduci numărul cadastral, numărul CF sau adresa imobilului.', icon: KeyRound },
                { step: 2, title: 'Completezi Cererea', desc: 'Confirmi județul și localitatea. Verificăm datele înainte de depunere.', icon: FileText },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Extrasul', desc: `În ${formatEstimatedDays(service)} primești extrasul CF pe email.`, icon: CheckCircle },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_8px_24px_rgba(236,185,95,0.35)]">
                    <item.icon className="h-7 w-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-secondary-900 shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Good to know — no urgency fee + verification edge case */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Bine de știut
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">Transparent, fără surprize</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-green-200 bg-green-50/60 p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-1.5">Fără taxă de urgență</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Am <strong>eliminat taxa de urgență</strong> — nu o mai percepem. Sistemul nostru depune și
                    emite cererile <strong>automat, 24/7</strong>, deci primești extrasul cât mai repede posibil,
                    fără costuri suplimentare.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-1.5">Dacă numărul nu poate fi procesat automat</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Dacă numărul de carte funciară introdus este <strong>greșit</strong> sau imobilul
                    <strong> nu este digitalizat</strong>, extrasul se eliberează în <strong>timpul programului de
                    lucru</strong> și e posibil să te contactăm pentru verificare, ca să primești documentul corect.
                  </p>
                </div>
              </div>
            </div>

            {/* Gratuit / gratis angle — targets „extras cf online gratuit" */}
            <div className="mt-6 max-w-[820px] mx-auto rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-secondary-900 mb-4">
                Se poate obține gratuit extrasul de carte funciară?
              </h3>
              <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed">
                <p>
                  Mulți caută „extras de carte funciară gratuit” sau „extras CF online gratis”. ANCPI oferă,
                  într-adevăr, o variantă fără cost prin platforma <strong>MyeTerra</strong> (myeterra.ancpi.ro) —
                  însă nu este chiar „instant”: ai nevoie de un cont <strong>ROeID</strong>, de{' '}
                  <strong>semnătură electronică calificată</strong> sau de o verificare la birou care poate dura{' '}
                  <strong>până la 72 de ore</strong>.
                </p>
                <p>
                  Pe scurt: extrasul „gratuit” cere cont, semnătură și răbdare. Prin eGhișeul plătești{' '}
                  <strong>{service.base_price} RON cu taxele ANCPI incluse</strong> și primești același document
                  oficial <strong>pe email, în câteva minute, fără cont și fără semnătură electronică</strong>.
                  Documentul este identic — plătești pentru timp și pentru lipsa pașilor tehnici.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Specimen — what the extract looks like */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Specimen
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Extrasul de Carte Funciară — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul pe care îl primești are antetul ANCPI și este semnat electronic de OCPI —
                cu autenticitate verificabilă pe portalul ANCPI.
              </p>
            </div>

            <div className="grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-14 items-center">
              {/* Specimen image — framed */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-500/10 to-secondary-900/5 rounded-[2rem] blur-xl" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl p-3 ring-1 ring-neutral-200 shadow-[0_20px_50px_rgba(6,16,31,0.16)]">
                  <Image
                    src="/images/extras-cf-specimen.webp"
                    alt="Specimen Extras de Carte Funciară emis de ANCPI / OCPI — exemplu document oficial cu proprietar, suprafață și sarcini"
                    width={1414}
                    height={2000}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <p className="text-xs text-neutral-400 mt-2 text-center italic">
                    Exemplu — date anonimizate, marcat conform GDPR.
                  </p>
                </div>
              </div>

              {/* Why it's legally valid (distinct from the "ce conține" section below) */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                  Un document oficial, valabil legal
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Extrasul pe care îl primești este <strong>identic cu cel eliberat la ghișeul OCPI</strong> — doar
                  că îl primești pe email, fără drum și fără cont ANCPI.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Landmark, title: 'Antet oficial ANCPI / OCPI', desc: 'Emis de Oficiul de Cadastru și Publicitate Imobiliară, cu seria și codul de înregistrare.' },
                    { icon: Shield, title: 'Semnătură electronică eIDAS', desc: 'Are aceeași valoare legală ca varianta cu ștampilă — îl folosești la notar, bancă sau în instanță.' },
                    { icon: Search, title: 'Cod de verificare unic', desc: 'Oricine îi poate verifica autenticitatea pe portalul ANCPI (epay.ancpi.ro).' },
                    { icon: Mail, title: 'Livrat pe email, în PDF', desc: 'Gata de printat sau trimis mai departe, în câteva minute de la plată.' },
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
                  <a
                    href="https://www.ancpi.ro/verificare/dc_index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-secondary-800 hover:border-primary-400 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Verifică autenticitatea pe ANCPI
                  </a>
                </div>
              </div>
            </div>

            {/* What it contains + validity — part of the specimen block */}
            <div className="mt-10 lg:mt-14 grid md:grid-cols-2 gap-6 max-w-[920px] mx-auto">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Ce conține extrasul CF</h3>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Partea I — descrierea imobilului (suprafață, categorie, vecinătăți)',
                    'Partea a II-a — proprietarul actual și modul de dobândire',
                    'Partea a III-a — sarcini: ipoteci, interdicții, litigii',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Cât este valabil</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Extrasul de carte funciară pentru informare</strong> nu are un termen legal de expirare, dar
                  reflectă situația din ziua eliberării. În practică, notarii și băncile cer un extras emis în
                  <strong> ultimele 30 de zile</strong>. Pentru autentificarea unei vânzări, notarul solicită un
                  <strong> extras de autentificare</strong>, valabil de regulă 10 zile lucrătoare. Vezi în detaliu{' '}
                  <Link
                    href="/valabilitate-extras-de-carte-funciara/"
                    className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    cât este valabil un extras de carte funciară
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison — eGhișeul vs ghișeu vs portal */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                De ce eGhișeul
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                eGhișeul vs alți operatori, ghișeul OCPI și portalul ANCPI
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Aceeași carte funciară oficială — diferă timpul, taxele și comoditatea. Alți operatori online
                procesează doar în programul de lucru și percep taxă de urgență.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] min-w-[800px] text-sm">
                {/* Header row */}
                <div className="bg-neutral-50 p-4 font-semibold text-secondary-900" />
                <div className="bg-primary-500 p-4 text-center font-extrabold text-secondary-900">
                  eGhișeul
                </div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Alți operatori online</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Ghișeu OCPI</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Portal ANCPI</div>

                {[
                  ['Timp de obținere', 'Câteva minute', 'În program de lucru', 'Drum + așteptare', 'Cont + semnătură'],
                  ['Taxă de urgență', '0 RON', '~19 lei', '—', '—'],
                  ['Disponibil 24/7', true, false, false, true],
                  ['Cont ANCPI necesar', false, false, '—', true],
                  ['Deplasare la ghișeu', false, false, true, false],
                  ['Taxe ANCPI incluse', true, 'Variabil', 'Separat', 'Separat'],
                  ['Livrare pe email', 'Automat', true, 'Ridici fizic', 'Manual'],
                ].map((row, i) => (
                  <div key={row[0] as string} className="contents">
                    <div className={`p-4 font-medium text-secondary-800 border-t border-neutral-100 ${i % 2 ? 'bg-neutral-50/50' : ''}`}>
                      {row[0]}
                    </div>
                    {[1, 2, 3, 4].map((col) => {
                      const v = row[col];
                      const highlight = col === 1;
                      return (
                        <div
                          key={col}
                          className={`flex items-center justify-center p-4 border-t border-neutral-100 text-center ${
                            highlight ? 'bg-primary-50' : i % 2 ? 'bg-neutral-50/50' : ''
                          }`}
                        >
                          {v === true ? (
                            <CheckCircle className={`h-5 w-5 ${highlight ? 'text-green-600' : 'text-green-500'}`} aria-label="Da" />
                          ) : v === false ? (
                            <X className="h-5 w-5 text-neutral-300" aria-label="Nu" />
                          ) : (
                            <span className={`text-xs sm:text-sm ${highlight ? 'font-bold text-secondary-900' : 'text-neutral-600'}`}>{v}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă extrasul acum</OrderButton>
            </div>
          </div>
        </section>

        {/* Cum afli nr cadastral după adresă — targets the cadastre cluster on the high-traffic CF page */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Cadastru
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Cum afli numărul cadastral după adresă
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Cel mai des, numărul cadastral apare în <strong>actul de proprietate</strong> (contract de
                vânzare-cumpărare, certificat de moștenitor), într-un <strong>extras de carte funciară mai vechi</strong>{' '}
                sau în <strong>documentația cadastrală</strong> întocmită la intabulare. Dacă ai aceste acte, vei
                găsi acolo{' '}
                <Link
                  href="/cum-aflam-numarul-carte-functionara-si-nr-cadastral/"
                  className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  cum aflu numărul cadastral și numărul de carte funciară
                </Link>{' '}
                de care ai nevoie pentru extras.
              </p>
              <p>
                Dacă <strong>nu ai numărul cadastral</strong> și cunoști doar adresa, îl poți obține în câteva moduri:
              </p>
              <ul className="space-y-2.5">
                {[
                  ['După adresă, prin noi', 'Identificăm imobilul (parcela/construcția și nr. CF) după adresă și îți eliberăm direct extrasul de carte funciară.'],
                  ['Din actul de proprietate', 'Verifică contractul, certificatul de moștenitor sau documentația de intabulare.'],
                  ['Dintr-un extras mai vechi', 'Orice extras CF anterior conține numărul cadastral al imobilului.'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span><strong>{title}.</strong> {desc}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary-700">
                  <strong>Ai doar adresa?</strong> Cu serviciul de{' '}
                  <Link
                    href={serviceUrl('identificare-imobil')}
                    className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    Identificare Imobil după Adresă
                  </Link>{' '}
                  aflăm noi numărul cadastral și de carte funciară, iar tu primești și extrasul CF — fără să cauți prin acte.
                </p>
              </div>
            </div>

            {/* Intabulare — targets „verificare intabulare" */}
            <div className="mt-12 pt-10 border-t border-neutral-200">
              <h3 className="text-2xl font-bold text-secondary-900 mb-5">
                Cum verifici dacă un imobil este intabulat
              </h3>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  A <strong>verifica intabularea</strong> unui imobil înseamnă a confirma că dreptul de proprietate
                  este înscris în cartea funciară la OCPI. Cel mai sigur mod este chiar{' '}
                  <strong>extrasul de carte funciară</strong>: dacă imobilul este intabulat, în <strong>Partea I</strong>{' '}
                  apare descrierea cadastrală (număr cadastral, suprafață), iar în <strong>Partea a II-a</strong>{' '}
                  figurează proprietarul și actul de dobândire.
                </p>
                <p>
                  Dacă imobilul <strong>nu apare în cartea funciară</strong> sau ai doar un număr topografic vechi,
                  proprietatea nu este (încă) intabulată cadastral, iar pentru tranzacții va fi nevoie de o
                  documentație cadastrală întocmită de un expert autorizat. Comandând un extras CF afli imediat dacă
                  imobilul este intabulat și situația lui juridică la zi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Extras de Carte Funciară"
          faqs={[
            { q: 'Ce este Extrasul de Carte Funciară?', a: 'Este documentul oficial OCPI care arată situația juridică a unui imobil: proprietarul actual, suprafața, sarcinile și ipotecile. Cartea funciară este registrul public al proprietăților.' },
            { q: 'Ce înseamnă extras de carte funciară?', a: 'Extras de carte funciară înseamnă documentul oficial care atestă situația juridică actuală a unui imobil — proprietar, suprafață, vecinătăți, sarcini și ipoteci — extras din cartea funciară ținută de OCPI/ANCPI.' },
            { q: 'De unde se scoate extrasul de carte funciară?', a: 'De la Oficiul de Cadastru și Publicitate Imobiliară (OCPI), parte din ANCPI. Prin eGhișeul îl scoți online, fără să mergi la ghișeu și fără cont ANCPI.' },
            { q: 'Cine poate scoate un extras de carte funciară?', a: 'Extrasul de informare este public — îl poate scoate oricine (cumpărător, notar, avocat, bancă, moștenitor), nu doar proprietarul și fără acordul acestuia.' },
            { q: 'Ce acte trebuie pentru extras de carte funciară?', a: 'Pentru extrasul de informare nu ai nevoie de acte de identitate sau de acordul proprietarului. Îți trebuie doar un identificator al imobilului (număr cadastral sau de carte funciară) ori adresa, plus județul și localitatea.' },
            { q: 'Cât costă un extras de carte funciară?', a: `La noi ${service.base_price} RON, cu taxele ANCPI incluse și procesare urgentă gratuită. OCPI percepe o taxă oficială pentru fiecare extras de carte funciară, indiferent de unde îl soliciți.` },
            { q: 'Se poate obține gratuit extrasul de carte funciară?', a: 'ANCPI oferă o variantă gratuită prin platforma MyeTerra (myeterra.ancpi.ro), dar necesită cont ROeID, semnătură electronică calificată sau verificare la birou în până la 72 de ore. Prin eGhișeul îl primești imediat, fără cont și fără deplasare.' },
            { q: 'Am nevoie de numărul cadastral?', a: 'Ai nevoie de un identificator al imobilului: număr cadastral, număr de carte funciară, număr topografic sau identificator electronic ANCPI. Dacă nu îl știi, îl putem căuta după adresă sau proprietar.' },
            { q: 'Cum aflu numărul cadastral după adresă?', a: 'Numărul cadastral apare în actul de proprietate sau într-un extras CF mai vechi. Dacă ai doar adresa, prin serviciul nostru de Identificare Imobil aflăm noi numărul cadastral și de carte funciară și îți eliberăm extrasul.' },
            { q: 'Cât este valabil extrasul de carte funciară?', a: 'Extrasul de informare reflectă situația din ziua eliberării; notarii și băncile cer de obicei unul din ultimele 30 de zile. Extrasul de autentificare (pentru vânzare) e valabil ~10 zile lucrătoare.' },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)} în mod standard. Procesarea urgentă este inclusă gratuit — sistemul depune și emite automat, 24/7. Pentru imobile nedigitalizate poate dura puțin mai mult, în programul de lucru.` },
            { q: 'Este necesar pentru vânzarea unui imobil?', a: 'Da. Notarul are nevoie de un extras de carte funciară pentru autentificare, ca să verifice proprietarul și eventualele sarcini sau ipoteci.' },
            { q: 'Cum verific dacă ipoteca a fost radiată din cartea funciară?', a: 'În Partea a III-a a extrasului (sarcini) apar ipotecile și interdicțiile. Dacă ipoteca a fost radiată, acolo este notată radierea; dacă încă figurează activă, înseamnă că nu a fost stinsă. Pentru siguranță, cere un extras emis recent.' },
            { q: 'Pentru reînnoirea cărții de identitate am nevoie de extras de carte funciară?', a: 'În anumite situații, extrasul de carte funciară poate fi cerut ca dovadă a dreptului de folosință a locuinței la schimbarea/reînnoirea actului de identitate. Verifică cerințele exacte la SPCLEP-ul local.' },
            { q: 'Ce este programul Casa Verde și ce extras îmi trebuie?', a: 'Casa Verde (Rabla pentru sisteme fotovoltaice) cere, în dosar, un extras de carte funciară recent al imobilului. Detalii în ghidul nostru dedicat: extras de carte funciară pentru Casa Verde.' },
            { q: 'Extrasul de carte funciară se actualizează automat?', a: 'Nu. Extrasul reflectă situația din ziua eliberării și nu se actualizează singur. Pentru o situație la zi, soliciți un extras nou; pentru modificări/rectificări, proprietarul se adresează biroului teritorial OCPI.' },
            { q: 'Cum primesc documentul?', a: 'Pe email, ca PDF semnat electronic de OCPI, cu autenticitate verificabilă pe portalul ANCPI.' },
            { q: 'Pot verifica intabularea unui imobil online?', a: 'Da. Cel mai simplu mod de a verifica dacă un imobil este intabulat este să soliciți un extras de carte funciară: dacă imobilul are număr cadastral și proprietar înscris, este intabulat. Prin eGhișeul primești extrasul online, în câteva minute, fără cont ANCPI.' },
            { q: 'Care e diferența dintre extrasul gratuit de la ANCPI și cel de la eGhișeul?', a: 'Documentul este identic — același extras oficial OCPI. Diferă modul de obținere: varianta gratuită prin MyeTerra cere cont ROeID și semnătură electronică calificată (sau verificare la birou, până la 72 de ore), iar prin eGhișeul îl primești pe email în câteva minute, fără cont și fără semnătură.' },
            { q: 'Pot obține extrasul pentru un imobil din alt județ?', a: 'Da. Eliberăm extrase de carte funciară pentru imobile din orice județ — ai nevoie doar de numărul cadastral sau de carte funciară și de localitate. Totul se face online.' },
            { q: 'Extrasul de carte funciară este același lucru cu cadastrul?', a: 'Nu. Cadastrul descrie tehnic imobilul (poziție, suprafață, limite), iar cartea funciară înscrie drepturile asupra lui (proprietar, sarcini, ipoteci). Extrasul CF reflectă partea juridică; ambele numere identifică același imobil.' },
          ]}
        />

        {/* CTA */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          {/* subtle dot texture */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          {/* subtle warm glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[360px] w-[760px] max-w-[90%] rounded-full bg-primary-500/10 blur-[120px]"
            aria-hidden="true"
          />
          {/* hairline accent at the top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" aria-hidden="true" />
          <div className="relative container mx-auto px-4 max-w-[760px] text-center">
            <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
              Gata să obții Extrasul de Carte Funciară?
            </h2>
            <p className="text-lg text-white/75 mb-8 max-w-xl mx-auto">
              Ai nevoie doar de numărul cadastral sau adresa imobilului. Primești documentul în {formatEstimatedDays(service)}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <OrderButton href={`/comanda/${SERVICE_SLUG}`}>Comandă Acum</OrderButton>
              <WhatsAppButton message="Bună ziua! Am o întrebare despre Extrasul de Carte Funciară." />
            </div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/60">
              <svg className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <strong className="text-white/90">{GOOGLE_RATING.toString().replace('.', ',')}</strong> din {GOOGLE_REVIEW_COUNT_LABEL} de recenzii Google
            </p>
          </div>
        </section>
      </main>

      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />

      <Footer />
    </>
  );
}
