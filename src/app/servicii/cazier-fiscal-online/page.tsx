import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  Landmark,
  Mail,
  Building2,
  Users,
  Trash2,
  Gavel,
  CreditCard,
  ScanFace,
  Receipt,
  CalendarClock,
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

// Database slug (order pipeline identifier). URL path uses the WP slug
// (cazier-fiscal-ONLINE) to preserve the indexed URL + backlinks.
const SERVICE_SLUG = 'cazier-fiscal';
const PAGE_PATH = '/servicii/cazier-fiscal-online/';
const SCHEMA_SLUG = 'cazier-fiscal-online';
const TITLE = 'Cazier Fiscal Online persoană fizică — ANAF, fără SPV';
const DESCRIPTION =
  'Cazier fiscal online de la ANAF pentru persoană fizică, fără cont SPV și fără drum la ' +
  'ghișeu. Atestă lipsa datoriilor fiscale, valabil 30 de zile. 198 RON.';
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
  ogImage: '/og/services/cazier-fiscal.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Cazier Fiscal Online',
  description:
    'Serviciu de obținere a Cazierului Fiscal (certificat de cazier fiscal) de la ANAF pentru ' +
    'persoană fizică. Documentul oficial care atestă lipsa datoriilor fiscale la bugetul de stat. ' +
    'Procesare 100% online, fără cont SPV, livrare email.',
  serviceType: 'Document Processing — Fiscal',
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
    { name: 'Cazier Fiscal', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Cazier Fiscal Persoană Fizică (Standard)', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CazierFiscalOnlinePage() {
  const data = await getService();
  if (!data) notFound();

  const { service, options } = data;

  // When you need a fiscal record — targets the "cazier fiscal" use-case cluster
  const useCases = [
    { icon: Building2, title: 'Înființare firmă / PFA', items: ['Constituire SRL', 'Înregistrare PFA / II', 'Dosar ONRC'] },
    { icon: Users, title: 'Asociat / administrator', items: ['Numire administrator', 'Cooptare asociat', 'Schimbare structură'] },
    { icon: Trash2, title: 'Radiere firmă', items: ['Dizolvare societate', 'Radiere PFA', 'Lichidare'] },
    { icon: Gavel, title: 'Licitații & contracte', items: ['Achiziții publice', 'Licitații SEAP', 'Contracte cu statul'] },
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
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link href="/servicii/" className="hover:text-primary-500 transition-colors">Servicii</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white font-medium">Cazier Fiscal</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Receipt className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Fiscale
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    ANAF
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Cazier Fiscal Online
                  <span className="block text-primary-500">Persoană Fizică</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cazierul Fiscal</strong> atestă că nu ai datorii
                    fiscale la bugetul de stat. Îl obții rapid de la noi, iar avocatul nostru colaborator,
                    înscris în Barou, se ocupă de procedura legală la ANAF în numele tău:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi formularul cu datele tale (CNP)',
                      'Verificăm și depunem cererea la ANAF',
                      'Plătești securizat, fără cont SPV',
                      `Primești cazierul fiscal pe email în ${formatEstimatedDays(service)}`,
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
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
                        TAXE ANAF INCLUSE
                      </span>
                      <ServicePrice basePrice={service.base_price} />
                      <p className="text-white/60 text-sm mt-2">Fără taxe ascunse</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Zile lucrătoare</p>
                      </div>
                    </div>

                    {service.urgent_days && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-secondary-900" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary-900 text-sm">Urgent: {service.urgent_days} zile lucrătoare</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">PDF semnat electronic ANAF</p>
                      </div>
                    </div>

                    <OrderButton href={`/comanda/${SERVICE_SLUG}`} className="w-full mt-4">Comandă Acum</OrderButton>

                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
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
                { icon: Landmark, value: 'ANAF', label: 'Document oficial semnat' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Livrare estimată' },
                { icon: Mail, value: 'Pe email', label: 'Fără cont SPV' },
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
              Ce este Cazierul Fiscal și de unde se obține
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Cazierul fiscal</strong> (sau „certificat de cazier fiscal”) este documentul oficial
                eliberat de <strong>ANAF</strong> care atestă <strong>lipsa datoriilor fiscale</strong> ale unei
                persoane la bugetul general consolidat al statului. Practic, certificatul confirmă că persoana
                fizică nu figurează cu obligații fiscale restante, fapte sancționate de legile fiscale, contravenții
                sau infracțiuni de natură economică. Este unul dintre cele mai cerute documente la
                <strong> înființarea unei firme</strong> sau la numirea ca asociat ori administrator.
              </p>
              <p>
                Prin eGhișeul obții <strong>cazierul fiscal online</strong>, fără drum la ghișeul ANAF. Ai nevoie
                doar de CNP și un act de identitate. Noi depunem cererea, plătim taxa și îți trimitem
                <strong> certificatul de cazier fiscal</strong> pe email, semnat electronic — o alternativă rapidă la
                procedura clasică de tip <strong>anaf cazier fiscal online</strong>.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Cazier fiscal gratuit prin SPV vs. online prin eGhișeul
                </h3>
                <p className="text-sm text-neutral-700">
                  Îți poți obține cazierul fiscal <strong>gratuit prin Spațiul Privat Virtual (SPV)</strong> al ANAF,
                  dar ai nevoie de un <strong>cont SPV activ și semnătură electronică</strong> sau de o deplasare la
                  ghișeu. Prin noi obții documentul <strong>100% online, fără cont SPV</strong> și fără deplasare:
                  plătești <strong>{service.base_price} RON</strong>, noi ne ocupăm de relația cu ANAF, iar tu
                  <strong> primești cazierul fiscal pe email</strong>.
                </p>
              </div>

              <div className="pt-2">
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  Verificare cazier fiscal: cum îți afli situația la ANAF
                </h3>
                <p>
                  Mulți contribuabili caută o <strong>verificare a cazierului fiscal</strong> înainte de un dosar la
                  ONRC, la notar sau la bancă. În realitate nu există o „verificare” separată: singurul mod oficial de
                  a afla dacă figurezi cu datorii sau fapte înscrise este să <strong>soliciți certificatul de cazier
                  fiscal de la ANAF</strong>.
                </p>
                <p>
                  Poți face verificarea prin <strong>Spațiul Privat Virtual (SPV)</strong> al ANAF (cu cont și
                  semnătură electronică) sau prin eGhișeul, complet online și fără cont SPV: completezi formularul cu
                  CNP-ul tău, noi depunem cererea la ANAF, iar tu primești cazierul fiscal pe email, semnat electronic.
                  Astfel verifici exact ce conține cazierul tău fiscal, fără drum la ghișeu.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Cazier fiscal vs. certificat de atestare fiscală
                </h3>
                <p className="text-sm text-neutral-700">
                  Sunt două documente diferite, ambele emise de <strong>ANAF</strong>.{' '}
                  <strong>Cazierul fiscal</strong> (numit și „certificat de cazier fiscal”) atestă că persoana nu
                  figurează cu fapte sancționate de legile fiscale și nu are obligații înscrise în cazier — cel cerut,
                  de regulă, la <Link href="/servicii/certificat-constatator-online/" className="text-primary-600 underline underline-offset-2 hover:text-primary-700">înființarea unei firme</Link> sau la
                  numirea ca asociat/administrator. <strong>Certificatul de atestare fiscală</strong> este alt document,
                  care prezintă situația obligațiilor de plată la un moment dat. Această pagină se referă la{' '}
                  <strong>cazierul fiscal</strong>. Pentru situația penală ai nevoie de{' '}
                  <Link href="/servicii/cazier-judiciar-online/" className="text-primary-600 underline underline-offset-2 hover:text-primary-700">cazier judiciar online</Link>, emis de Poliție.
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
                Când Ai Nevoie de Cazier Fiscal?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <uc.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{uc.title}</h3>
                  <div className="space-y-2">
                    {uc.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              <p className="text-white/70 max-w-2xl mx-auto">Eliberarea cazierului fiscal online în 4 pași, 100% online — fără cont SPV.</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Completezi Formularul', desc: 'Introduci datele tale personale, inclusiv CNP-ul, iar avocatul colaborator depune cererea la ANAF în numele tău.', icon: FileText },
                { step: 2, title: 'Verificare Identitate', desc: 'Încarci actul de identitate și un selfie pentru validarea KYC, conform cerințelor.', icon: ScanFace },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxa ANAF este inclusă în preț.', icon: CreditCard },
                { step: 4, title: 'Primești Documentul', desc: `În ${formatEstimatedDays(service)} primești cazierul fiscal pe email, opțional și prin curier.`, icon: CheckCircle },
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

        {/* Specimen — what the fiscal record looks like */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Specimen
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Arată Cazierul Fiscal — Specimen
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul pe care îl primești are antetul ANAF și este semnat electronic —
                cu aceeași valoare legală ca varianta de la ghișeu.
              </p>
            </div>

            <div className="grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-14 items-center">
              {/* Specimen image — framed */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-500/10 to-secondary-900/5 rounded-[2rem] blur-xl" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl p-3 ring-1 ring-neutral-200 shadow-[0_20px_50px_rgba(6,16,31,0.16)]">
                  <Image
                    src="/images/specimens/cazier-fiscal.png"
                    alt="Specimen cazier fiscal emis de ANAF — exemplu document oficial cu date anonimizate"
                    width={1000}
                    height={1414}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <p className="text-xs text-neutral-400 mt-2 text-center italic">
                    Exemplu — date anonimizate.
                  </p>
                </div>
              </div>

              {/* Why it's legally valid */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                  Un document oficial, valabil legal
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Cazierul fiscal pe care îl primești este <strong>identic cu cel eliberat la ghișeul ANAF</strong> —
                  doar că îl primești pe email, fără drum și fără cont SPV.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Landmark, title: 'Antet oficial ANAF', desc: 'Emis de Agenția Națională de Administrare Fiscală, cu numărul și data înregistrării.' },
                    { icon: Shield, title: 'Semnătură electronică', desc: 'Are aceeași valoare legală ca varianta cu ștampilă — îl folosești la ONRC, notar sau bancă.' },
                    { icon: Receipt, title: 'Atestă situația ta fiscală', desc: 'Confirmă lipsa datoriilor și a faptelor sancționate de legile fiscale la data emiterii.' },
                    { icon: Mail, title: 'Livrat pe email, în PDF', desc: 'Gata de printat sau trimis mai departe, fără deplasare la ghișeu.' },
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
                    Acceptat de ONRC, notari, bănci și instituții
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* Content + validity — targets "ce atesta" + "valabilitate cazier fiscal" */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Ce atestă cazierul fiscal</h2>
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    'Lipsa datoriilor fiscale la bugetul de stat',
                    'Absența faptelor sancționate de legile fiscale și contabile',
                    'Inexistența unor infracțiuni de evaziune fiscală sau spălare de bani',
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 bg-primary-50/40">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                  <CalendarClock className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Valabilitate 30 de zile</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Cazierul fiscal este valabil 30 de zile</strong> de la data emiterii. După acest termen,
                  instituțiile (notari, ONRC, bănci, autorități contractante) nu îl mai acceptă, fiindcă situația
                  fiscală a unei persoane se poate schimba rapid. De aceea îți recomandăm să soliciți
                  <strong> certificatul de cazier fiscal</strong> cât mai aproape de momentul în care îl depui.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Cazier Fiscal Online"
          faqs={[
            { q: 'Ce este cazierul fiscal?', a: 'Este documentul oficial eliberat de ANAF care atestă că o persoană nu are datorii fiscale la bugetul de stat și nu a săvârșit fapte sancționate de legile fiscale, contabile sau de evaziune fiscală.' },
            { q: 'Care este diferența dintre cazier fiscal și cazier judiciar?', a: 'Cazierul fiscal este emis de ANAF și se referă strict la situația fiscală (datorii, fapte economice). Cazierul judiciar este emis de Poliție/IGPR și conține eventualele condamnări penale. Sunt două documente diferite, cu instituții și scopuri diferite.' },
            { q: 'Cât este valabil cazierul fiscal?', a: 'Cazierul fiscal este valabil 30 de zile de la data emiterii. După expirare trebuie solicitat unul nou, deoarece situația fiscală a persoanei se poate modifica.' },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)} în mod standard. Există și opțiunea Urgent pentru livrare mai rapidă.` },
            { q: 'De ce aveți nevoie de datele mele personale?', a: 'CNP-ul și actul de identitate sunt necesare pentru a depune cererea de cazier fiscal în numele tău la ANAF și pentru validarea identității (KYC). Datele sunt prelucrate securizat și folosite exclusiv pentru emiterea documentului.' },
            { q: 'Pot cere cazier fiscal pentru o firmă?', a: 'Această pagină acoperă cazierul fiscal pentru persoană fizică. Pentru persoane juridice (firme) procedura și actele diferă — contactează-ne și te ajutăm cu varianta potrivită.' },
            { q: 'Cazierul fiscal este gratuit?', a: 'Îl poți obține gratuit prin Spațiul Privat Virtual (SPV) al ANAF dacă ai cont SPV și semnătură electronică. Prin noi plătești un tarif pentru serviciul complet 100% online, fără cont SPV și fără deplasare la ghișeu.' },
            { q: 'Cum primesc documentul?', a: 'Pe email, ca PDF semnat electronic de ANAF. Opțional, îl poți primi și fizic prin curier, dacă alegi această opțiune la comandă.' },
            { q: 'Cum verific cazierul fiscal?', a: 'Nu există o verificare separată de eliberare: singurul mod oficial de a verifica situația ta în cazierul fiscal este să soliciți certificatul de cazier fiscal de la ANAF. Îl poți obține prin SPV (cu cont și semnătură electronică) sau prin eGhișeul, complet online și fără cont SPV.' },
            { q: 'Care e diferența dintre cazierul fiscal și certificatul de atestare fiscală?', a: 'Cazierul fiscal atestă că nu figurezi cu fapte sancționate de legile fiscale și fără datorii înscrise; certificatul de atestare fiscală arată situația obligațiilor tale de plată la un moment dat. Sunt documente ANAF diferite. Această pagină se referă la cazierul fiscal.' },
            { q: 'Pot obține cazierul fiscal fără cont SPV?', a: 'Da. Prin eGhișeul depui cererea fără cont în Spațiul Privat Virtual și fără semnătură electronică proprie — ai nevoie doar de CNP și un act de identitate, iar noi ne ocupăm de relația cu ANAF.' },
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
                Gata să obții Cazierul Fiscal Online?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de CNP și un act de identitate. Primești documentul în {formatEstimatedDays(service)}.
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
