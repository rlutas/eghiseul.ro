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
  Home,
  MapPin,
  Search,
  Mail,
  Phone,
  Landmark,
  Banknote,
  ScrollText,
  KeyRound,
} from 'lucide-react';
import { Service, ServiceOption, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';

// Database slug (order pipeline identifier). URL path uses the WP slug
// (extras-DE-carte-funciara) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'extras-carte-funciara';
const PAGE_PATH = '/servicii/extras-de-carte-funciara/';
const SCHEMA_SLUG = 'extras-de-carte-funciara';
const TITLE = 'Extras de Carte Funciară Online — 79.99 RON, OCPI | eGhișeul';
const DESCRIPTION =
  'Obține Extras de Carte Funciară online de la OCPI/ANCPI, fără drum la ghișeu. ' +
  '79.99 RON, livrare pe email. Document complet cu proprietar, suprafață, sarcini și ipoteci — ' +
  'necesar la tranzacții imobiliare, credite ipotecare și succesiuni.';
const DATE_PUBLISHED = '2026-06-13';
const DATE_MODIFIED = '2026-06-13';

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
    'Serviciu de obținere a Extrasului de Carte Funciară (CF) de la Oficiul de Cadastru și ' +
    'Publicitate Imobiliară (OCPI/ANCPI). Document cu situația juridică a imobilului: proprietar, ' +
    'suprafață, sarcini și ipoteci. Procesare 100% online, livrare email.',
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
    { name: 'Extras de Carte Funciară (Standard)', price: 79.99, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function ExtrasCarteFunciaraPage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

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
                  Extras CF gratuit / oficial vs. online prin eGhișeul
                </h3>
                <p className="text-sm text-neutral-700">
                  Extrasul CF <strong>nu este gratuit</strong> — OCPI percepe o taxă oficială pentru fiecare extras,
                  indiferent de unde îl ceri. Îl poți obține personal la ghișeul OCPI sau prin portalul ANCPI (dacă ai
                  cont și semnătură). Prin noi plătești <strong>{service.base_price} RON cu taxele OCPI incluse</strong>,
                  100% online, fără cont ANCPI și fără deplasare — primești documentul pe email.
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
                <div key={it.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
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
                <strong>Nu știi numărul cadastral?</strong> Îl poți afla din actul de proprietate, din extrasul vechi
                sau căutând <strong>după adresă</strong> ori <strong>după proprietar</strong>. Te ajutăm noi la depunere.
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

        {/* How it works */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Cum Funcționează?</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">Obții extrasul de carte funciară în 4 pași, 100% online</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { step: 1, title: 'Identifici Imobilul', desc: 'Introduci numărul cadastral, numărul CF sau adresa imobilului.', icon: KeyRound },
                { step: 2, title: 'Completezi Cererea', desc: 'Confirmi județul și localitatea. Verificăm datele înainte de depunere.', icon: FileText },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești Extrasul', desc: `În ${formatEstimatedDays(service)} primești extrasul CF pe email.`, icon: CheckCircle },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="bg-white rounded-2xl p-6 h-full border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all group">
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

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Extras de Carte Funciară"
          faqs={[
            { q: 'Ce este Extrasul de Carte Funciară?', a: 'Este documentul oficial OCPI care arată situația juridică a unui imobil: proprietarul actual, suprafața, sarcinile și ipotecile. Cartea funciară este registrul public al proprietăților.' },
            { q: 'De unde se obține extrasul de carte funciară?', a: 'De la Oficiul de Cadastru și Publicitate Imobiliară (OCPI), parte din ANCPI. Prin eGhișeul îl obții online, fără să mergi la ghișeu și fără cont ANCPI.' },
            { q: 'Cât costă un extras de carte funciară?', a: `La noi ${service.base_price} RON, cu taxele OCPI incluse. Nu există extras CF gratuit — OCPI percepe o taxă oficială pentru fiecare extras.` },
            { q: 'Am nevoie de numărul cadastral?', a: 'Ai nevoie de un identificator al imobilului: număr cadastral, număr de carte funciară, număr topografic sau identificator electronic ANCPI. Dacă nu îl știi, îl putem căuta după adresă sau proprietar.' },
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

      <Footer />
    </>
  );
}
