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
const SERVICE_SLUG = 'extras-cf-colectiv';
const PAGE_PATH = '/servicii/extras-cf-colectiv/';
const SCHEMA_SLUG = 'extras-cf-colectiv';
const TITLE = 'Extras de Carte Funciară Colectivă (Bloc / Condominiu)';
const DESCRIPTION =
  'Cartea funciară a blocului sau condominiului: părțile comune și cotele indivize ale construcției, ' +
  'document separat de extrasul CF al apartamentului. Taxe OCPI incluse, 100% online, livrare pe email, fără cont ANCPI.';
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
  name: 'Extras de Carte Funciară Colectivă',
  description:
    'Obținerea extrasului de carte funciară colectivă de la OCPI/ANCPI, adică a cărții funciare a ' +
    'construcției-condominiu (bloc), care cuprinde părțile comune și cotele indivize aferente fiecărui apartament. ' +
    '100% online, fără cont ANCPI, livrare pe email.',
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
    { name: 'Extras de Carte Funciară Colectivă', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Extras de Carte Funciară Colectivă', price: basePrice, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function ExtrasCfColectivPage() {
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

  // Ways to identify the property (the building, not the apartment)
  const identifiers = [
    { icon: ScrollText, title: 'Număr de carte funciară colectivă', desc: 'Numărul CF al construcției-condominiu (blocul), nu cel al apartamentului tău.' },
    { icon: KeyRound, title: 'Număr cadastral al blocului', desc: 'Identificatorul unic al construcției înscrise în cadastru.' },
  ];

  const useCases = [
    { icon: Home, title: 'Tranzacții apartamente', items: ['Vânzare-cumpărare', 'Verificare cote indivize', 'Dosar notarial complet'] },
    { icon: Layers, title: 'Asociații de proprietari', items: ['Părțile comune', 'Cote din proprietate', 'Administrarea blocului'] },
    { icon: Landmark, title: 'Dosare bancare', items: ['Credit ipotecar', 'Refinanțare', 'Garanții imobiliare'] },
    { icon: ScrollText, title: 'Litigii condominiu', items: ['Spații comune', 'Cote contestate', 'Documentare juridică'] },
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
              <span className="text-white font-medium">Extras CF Colectivă</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Layers className="h-3.5 w-3.5 mr-1" />
                    Bloc / Condominiu
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Extras de Carte Funciară
                  <span className="block text-primary-500">Colectivă</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Cartea funciară a întregii construcții-condominiu, adică a blocului, cu părțile comune și
                  cotele indivize. Este un document separat de cartea funciară a apartamentului tău. O obții
                  100% online, fără cont ANCPI.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Layers className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Vezi <strong className="text-primary-500">părțile comune și cotele indivize</strong> ale
                    blocului — esențial pentru <strong>tranzacții de apartamente</strong>, asociații de
                    proprietari, dosare bancare și verificarea situației juridice a condominiului.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> extrasul CF colectivă:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Introduci numărul de carte funciară sau cadastral al blocului',
                      'Confirmi județul și localitatea',
                      'Plătești securizat (taxe OCPI incluse)',
                      'Primești extrasul CF colectivă pe email',
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
                        <p className="text-xs text-neutral-500">Extras CF colectivă</p>
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
                { icon: Landmark, value: 'OCPI', label: 'Document ANCPI' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Procesat de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Extras CF colectivă' },
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
              Ce este extrasul de carte funciară colectivă și când îți trebuie
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Extrasul de carte funciară colectivă</strong> este extrasul CF al imobilului-bloc, adică
                al întregii <strong>construcții-condominiu</strong> în care se află apartamentul tău. Spre deosebire
                de cartea funciară individuală, care descrie un singur apartament și proprietarul lui, cartea
                funciară colectivă cuprinde <strong>părțile comune</strong> ale blocului (fundație, structură,
                acoperiș, casa scării, lift, terenul de sub bloc) și <strong>cotele indivize</strong> care revin
                fiecărui apartament din aceste părți comune.
              </p>
              <p>
                Fiecare bloc de locuințe are, practic, două niveluri de înscriere în cartea funciară: o
                <strong> CF colectivă</strong> pentru construcția în ansamblu și câte o <strong>CF individuală</strong>
                {' '}pentru fiecare unitate locativă. Extrasul colectiv arată cum se împarte proprietatea comună între
                apartamente, ce cotă din teren și din părțile comune îți revine și care este situația juridică a
                blocului în ansamblu. Este eliberat de Oficiul de Cadastru și Publicitate Imobiliară
                (<strong>OCPI / ANCPI</strong>).
              </p>
              <p>
                Ai nevoie de extrasul CF colectivă în special la <strong>tranzacțiile de apartamente</strong> (notarul
                îl cere alături de extrasul individual pentru a verifica cotele indivize), în activitatea
                <strong> asociațiilor de proprietari</strong>, pentru <strong>dosarele bancare</strong> de credit
                ipotecar, precum și în <strong>litigiile de condominiu</strong> legate de spațiile comune sau de cotele
                din proprietate. Prin eGhișeul îl obții online, fără cont ANCPI și fără deplasare la ghișeul OCPI.
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  CF colectivă vs. CF individuală
                </h3>
                <p className="text-sm text-neutral-700">
                  <strong>CF colectivă</strong> = cartea funciară a întregului bloc (părțile comune și cotele
                  indivize ale construcției-condominiu). <strong>CF individuală</strong> = cartea funciară a unui
                  singur apartament (proprietar, suprafață utilă, sarcini). Sunt documente complementare — pentru
                  o tranzacție completă ai de obicei nevoie de amândouă.{' '}
                  <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    Vezi extrasul de carte funciară individuală
                  </Link>
                  .
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Ce conține extrasul de carte funciară colectivă
              </h3>
              <p>
                Documentul descrie construcția-condominiu pe cele trei părți ale cărții funciare: partea de
                <strong> descriere a imobilului</strong> (blocul, terenul aferent, numărul cadastral), partea
                referitoare la <strong>proprietate și cotele indivize</strong> (cum se împarte proprietatea comună
                între unitățile locative) și partea privind <strong>sarcinile</strong> care grevează părțile comune.
                Pe scurt, vezi <strong>cine deține ce cotă din părțile comune</strong> și care este situația juridică
                a blocului ca ansamblu.
              </p>
              <p>
                Pentru a comanda extrasul colectiv ai nevoie de <strong>numărul de carte funciară colectivă</strong> sau
                de <strong>numărul cadastral al blocului</strong>. Atenție, acestea sunt diferite de numărul CF al
                apartamentului. Dacă deții doar datele apartamentului, numărul CF colectivă apare de regulă chiar în
                extrasul individual al apartamentului, la rubrica de identificare a construcției.
              </p>
              <p>
                Dacă vrei mai întâi situația juridică a propriului apartament, comandă{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extrasul de carte funciară individuală
                </Link>
                , iar pentru tranzacție completezi cu extrasul colectiv pe care îl obții de aici.
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
                Cum identifici blocul pentru extrasul CF colectivă
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ai nevoie de un singur identificator al construcției, nu cel al apartamentului tău.
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
                <strong>Ai doar numărul CF al apartamentului?</strong> Numărul de carte funciară colectivă apare de
                obicei chiar în extrasul individual, la identificarea construcției. Dacă nu îl găsești, scrie-ne
                datele blocului și te ajutăm să îl identifici.
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
                Când ai nevoie de extrasul CF colectivă
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții extrasul CF colectivă în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Identifici Blocul', desc: 'Introduci numărul de carte funciară colectivă sau cadastral al construcției.', icon: KeyRound },
                { step: 2, title: 'Confirmi Localitatea', desc: 'Alegi județul și localitatea. Verificăm datele înainte de depunere.', icon: MapPin },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse.', icon: Shield },
                { step: 4, title: 'Primești Extrasul', desc: `În ${formatEstimatedDays(service)} primești extrasul CF colectivă pe email.`, icon: CheckCircle },
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

        {/* Related — cross-link to other CF documents */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Servicii pentru imobile
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară Individuală</p>
                  <p className="text-sm text-neutral-600">Situația juridică a apartamentului: proprietar, suprafață, sarcini.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Copia documentelor din cartea funciară a imobilului.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('copie-releveu')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Ruler className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Copie Releveu</p>
                  <p className="text-sm text-neutral-600">Planul releveu al apartamentului, cu dimensiunile încăperilor.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Extras de Carte Funciară Colectivă"
          faqs={[
            { q: 'Ce este extrasul de carte funciară colectivă?', a: 'Este extrasul CF al întregului bloc (construcția-condominiu), care cuprinde părțile comune și cotele indivize aferente fiecărui apartament. Este distinct de cartea funciară individuală a unui singur apartament și este eliberat de OCPI/ANCPI.' },
            { q: 'Cu ce diferă de extrasul de carte funciară individuală?', a: 'CF colectivă descrie întreaga construcție-condominiu (părți comune, cote indivize, terenul de sub bloc), iar CF individuală descrie un singur apartament (proprietar, suprafață utilă, sarcini). Sunt documente complementare; la o tranzacție notarul cere de obicei ambele.' },
            { q: 'Ce conține extrasul CF colectivă?', a: 'Conține descrierea construcției-condominiu și a terenului aferent, modul în care se împart proprietatea comună și cotele indivize între apartamente, precum și sarcinile care grevează părțile comune ale blocului.' },
            { q: 'Ce sunt părțile comune și cotele indivize?', a: 'Părțile comune sunt elementele blocului folosite de toți proprietarii: structura, fundația, acoperișul, casa scării, liftul, terenul de sub bloc. Cota indiviză este partea din aceste părți comune care revine fiecărui apartament, proporțional cu suprafața deținută.' },
            { q: 'De ce am nevoie de extrasul colectiv la vânzarea apartamentului?', a: 'Notarul verifică prin extrasul colectiv cota indiviză din părțile comune și terenul care se transmit odată cu apartamentul. Fără el, situația juridică a tranzacției nu este completă.' },
            { q: 'Cât costă extrasul CF colectivă?', a: `${service.base_price} RON, cu taxele OCPI incluse. Fără costuri ascunse.` },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)}. Documentul este procesat de un operator și livrat pe email.` },
            { q: 'Nu știu numărul CF colectivă. Ce fac?', a: 'Numărul de carte funciară colectivă apare de regulă chiar în extrasul individual al apartamentului, la identificarea construcției. Dacă nu îl găsești, scrie-ne datele blocului (CF sau cadastral apartament, adresă) și te ajutăm să îl identificăm.' },
            { q: 'Am nevoie de cont ANCPI?', a: 'Nu. Ne ocupăm noi de tot procesul; tu ai nevoie doar de numărul de carte funciară colectivă sau cadastral al blocului.' },
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
                Gata să obții Extrasul CF Colectivă?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de numărul de carte funciară colectivă sau cadastral al blocului. Primești documentul în {formatEstimatedDays(service)}.
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
