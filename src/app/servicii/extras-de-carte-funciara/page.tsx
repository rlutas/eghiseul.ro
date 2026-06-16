import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  Home,
  MapPin,
  Search,
  Mail,
  Phone,
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
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';

// Database slug (order pipeline identifier). URL path uses the WP slug
// (extras-DE-carte-funciara) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'extras-carte-funciara';
const PAGE_PATH = '/servicii/extras-de-carte-funciara/';
const SCHEMA_SLUG = 'extras-de-carte-funciara';
const TITLE = 'Extras de Carte Funciară Online în Câteva Minute — 89 RON | eGhișeul';
const DESCRIPTION =
  'Extras de Carte Funciară online de la ANCPI, livrat pe email în câteva minute — ' +
  'singurii din România cu eliberare automată 24/7, fără taxă de urgență și fără cont ANCPI. ' +
  '89 RON, taxe incluse. Document oficial cu proprietar, suprafață, sarcini și ipoteci.';
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
  ogImage: '/og/extras-carte-funciara.png',
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

  const { service, options } = data;

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

            <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
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
                Bun de știut
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
          </div>
        </section>

        {/* Specimen — what the extract looks like */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Extrasul de Carte Funciară — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul pe care îl primești are antetul ANCPI și este semnat electronic de OCPI —
                cu autenticitate verificabilă pe portalul ANCPI.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Specimen image */}
              <div className="relative bg-neutral-50 rounded-2xl p-4 border border-neutral-200 shadow-sm">
                <Image
                  src="/images/extras-cf-specimen.webp"
                  alt="Specimen Extras de Carte Funciară emis de ANCPI / OCPI — exemplu document oficial cu proprietar, suprafață și sarcini"
                  width={1414}
                  height={2000}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
                <p className="text-xs text-neutral-500 mt-3 text-center italic">
                  Exemplu document — date anonimizate. Specimen marcat conform GDPR.
                </p>
              </div>

              {/* What it contains */}
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Ce vezi în extrasul CF</h3>
                <ul className="space-y-3 text-sm text-neutral-700">
                  {[
                    ['Partea I — Imobilul', 'Suprafața, categoria de folosință, vecinătățile și numărul cadastral.'],
                    ['Partea a II-a — Proprietarul', 'Proprietarul actual și modul de dobândire a dreptului de proprietate.'],
                    ['Partea a III-a — Sarcini', 'Ipoteci, interdicții, litigii sau alte sarcini înscrise asupra imobilului.'],
                    ['Antet și semnătură ANCPI', 'Document semnat electronic de OCPI, verificabil online pe portalul ANCPI.'],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>{title}.</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
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
                eGhișeul vs ghișeul OCPI vs portalul ANCPI
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Aceeași carte funciară oficială — diferă doar timpul, efortul și comoditatea.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] min-w-[640px] sm:min-w-0 text-sm">
                {/* Header row */}
                <div className="bg-neutral-50 p-4 font-semibold text-secondary-900" />
                <div className="bg-primary-500 p-4 text-center font-extrabold text-secondary-900">
                  eGhișeul
                </div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Ghișeu OCPI</div>
                <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-600">Portal ANCPI</div>

                {[
                  ['Timp de obținere', 'Câteva minute', 'Drum + așteptare', 'Cont + semnătură'],
                  ['Cont ANCPI necesar', false, '—', true],
                  ['Deplasare la ghișeu', false, true, false],
                  ['Taxe ANCPI incluse', true, 'Separat', 'Separat'],
                  ['Disponibil 24/7', true, false, true],
                  ['Livrare pe email', 'Automat', 'Ridici fizic', 'Manual'],
                ].map((row, i) => (
                  <div key={row[0] as string} className="contents">
                    <div className={`p-4 font-medium text-secondary-800 border-t border-neutral-100 ${i % 2 ? 'bg-neutral-50/50' : ''}`}>
                      {row[0]}
                    </div>
                    {[1, 2, 3].map((col) => {
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
              <Button
                asChild
                className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href={`/comanda/${SERVICE_SLUG}`}>
                  Comandă extrasul acum
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Content + validity — targets "ce contine" + "valabilitate extras de carte funciara" */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Ce conține extrasul CF</h2>
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
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Cât este valabil</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Extrasul de carte funciară pentru informare</strong> nu are un termen legal de expirare, dar
                  reflectă situația din ziua eliberării. În practică, notarii și băncile cer un extras emis în
                  <strong> ultimele 30 de zile</strong>. Pentru autentificarea unei vânzări, notarul solicită un
                  <strong> extras de autentificare</strong>, valabil de regulă 10 zile lucrătoare.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cum afli nr cadastral după adresă — targets the cadastre cluster on the high-traffic CF page */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Cum afli numărul cadastral după adresă
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Cel mai des, numărul cadastral apare în <strong>actul de proprietate</strong> (contract de
                vânzare-cumpărare, certificat de moștenitor), într-un <strong>extras de carte funciară mai vechi</strong>{' '}
                sau în <strong>documentația cadastrală</strong> întocmită la intabulare. Dacă ai aceste acte, vei
                găsi acolo numărul cadastral și numărul de carte funciară de care ai nevoie pentru extras.
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
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Extras de Carte Funciară"
          faqs={[
            { q: 'Ce este Extrasul de Carte Funciară?', a: 'Este documentul oficial OCPI care arată situația juridică a unui imobil: proprietarul actual, suprafața, sarcinile și ipotecile. Cartea funciară este registrul public al proprietăților.' },
            { q: 'De unde se obține extrasul de carte funciară?', a: 'De la Oficiul de Cadastru și Publicitate Imobiliară (OCPI), parte din ANCPI. Prin eGhișeul îl obții online, fără să mergi la ghișeu și fără cont ANCPI.' },
            { q: 'Cât costă un extras de carte funciară?', a: `La noi ${service.base_price} RON, cu taxele ANCPI incluse. OCPI percepe o taxă oficială pentru fiecare extras de carte funciară, indiferent de unde îl soliciți.` },
            { q: 'Am nevoie de numărul cadastral?', a: 'Ai nevoie de un identificator al imobilului: număr cadastral, număr de carte funciară, număr topografic sau identificator electronic ANCPI. Dacă nu îl știi, îl putem căuta după adresă sau proprietar.' },
            { q: 'Cum aflu numărul cadastral după adresă?', a: 'Numărul cadastral apare în actul de proprietate sau într-un extras CF mai vechi. Dacă ai doar adresa, prin serviciul nostru de Identificare Imobil aflăm noi numărul cadastral și de carte funciară și îți eliberăm extrasul.' },
            { q: 'Cât este valabil extrasul de carte funciară?', a: 'Extrasul de informare reflectă situația din ziua eliberării; notarii și băncile cer de obicei unul din ultimele 30 de zile. Extrasul de autentificare (pentru vânzare) e valabil ~10 zile lucrătoare.' },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)} în mod standard. Pentru imobile nedigitalizate poate dura puțin mai mult. Există și opțiunea Urgent.` },
            { q: 'Este necesar pentru vânzarea unui imobil?', a: 'Da. Notarul are nevoie de un extras de carte funciară pentru autentificare, ca să verifice proprietarul și eventualele sarcini sau ipoteci.' },
            { q: 'Cum primesc documentul?', a: 'Pe email, ca PDF semnat electronic de OCPI, cu autenticitate verificabilă pe portalul ANCPI.' },
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
                Gata să obții Extrasul de Carte Funciară?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de numărul cadastral sau adresa imobilului. Primești documentul în {formatEstimatedDays(service)}.
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

      <MobileStickyCTA href={`/comanda/${SERVICE_SLUG}`} basePrice={service.base_price} />

      <Footer />
    </>
  );
}
