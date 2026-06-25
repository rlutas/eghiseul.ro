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
  AlertTriangle,
  Users,
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

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'identificare-imobile-proprietar';
const PAGE_PATH = '/servicii/identificare-imobile-proprietar/';
const SCHEMA_SLUG = 'identificare-imobile-proprietar';
const TITLE = 'Identificare Imobile după Proprietar — Lista Bunurilor';
const DESCRIPTION =
  'Identificăm imobilele înscrise pe numele unei persoane (fizice sau juridice) în evidențele de ' +
  'cadastru și carte funciară, după nume și localitate. 198 RON, taxe OCPI incluse, livrare pe email.';
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

const jsonLdGraph = buildServicePageGraph({
  slug: SCHEMA_SLUG,
  name: 'Identificare Imobile după Proprietar',
  description:
    'Serviciu de identificare a imobilelor (terenuri și construcții) deținute de o persoană fizică ' +
    'sau juridică, prin căutare în evidențele de cadastru și carte funciară după numele proprietarului ' +
    '(și, unde e cazul, CNP/CUI), la nivel de localitate și județ. Rezultatul este lista imobilelor ' +
    'înscrise pe acel proprietar. 100% online, fără cont ANCPI, livrare pe email.',
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
    { name: 'Identificare Imobile după Proprietar', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Identificare Imobile după Proprietar', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function IdentificareImobileProprietarPage() {
  const service = await getService();
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // What you give us — search is by OWNER, not by cadastral number
  const identifiers = [
    { icon: Users, title: 'Nume / denumire proprietar', desc: 'Numele complet al persoanei fizice sau denumirea persoanei juridice (firmă).' },
    { icon: ScrollText, title: 'CNP / CUI (opțional)', desc: 'Codul numeric personal sau codul fiscal, dacă îl ai — crește precizia căutării.' },
    { icon: MapPin, title: 'Județ + localitate', desc: 'Zona în care căutăm imobilele înscrise pe numele proprietarului.' },
  ];

  const useCases = [
    { icon: ScrollText, title: 'Succesiuni', items: ['Masa succesorală', 'Imobile moștenite', 'Dosar notarial'] },
    { icon: Search, title: 'Due diligence', items: ['Verificare patrimoniu', 'Înainte de o tranzacție', 'Confirmare proprietar'] },
    { icon: Landmark, title: 'Executări & creanțe', items: ['Bunuri urmăribile', 'Recuperare creanțe', 'Dosar de executare'] },
    { icon: Shield, title: 'Litigii & partaj', items: ['Proces civil', 'Partaj de bunuri', 'Verificare dețineri'] },
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
              <span className="text-white font-medium">Identificare Imobile după Proprietar</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Căutare după proprietar
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    Cadastru & CF
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Identificare Imobile
                  <span className="block text-primary-500">după Proprietar</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Afli ce imobile deține o persoană fizică sau juridică. Căutăm în evidențele de cadastru
                  și carte funciară după numele proprietarului și îți livrăm lista imobilelor înscrise pe el.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Users className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Aici <strong className="text-primary-500">nu căutăm după numărul cadastral</strong>, ci
                    după <strong>proprietar</strong>: ne dai numele (și, dacă îl ai, CNP/CUI) plus județul și
                    localitatea, iar noi îți spunem ce imobile sunt înscrise pe numele lui.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum decurge</strong> identificarea după proprietar:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai numele proprietarului și județul/localitatea',
                      'Verificăm eligibilitatea cererii și interesul legitim',
                      'Plătești securizat (taxele OCPI sunt incluse)',
                      'Primești lista imobilelor pe email',
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
                      <p className="text-white/50 text-xs mt-1">Căutare după proprietar, taxe incluse</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {formatEstimatedDays(service)}</p>
                        <p className="text-xs text-neutral-500">Verificare făcută de un operator</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Lista imobilelor proprietarului</p>
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
                { icon: Users, value: 'După proprietar', label: 'Nume / denumire firmă' },
                { icon: Landmark, value: 'Cadastru & CF', label: 'Evidențe OCPI / ANCPI' },
                { icon: Shield, value: 'Eligibilitate', label: 'Verificăm interesul legitim' },
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
              Ce înseamnă identificarea imobilelor după proprietar
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Identificarea imobilelor după proprietar</strong> înseamnă să afli ce terenuri și
                construcții deține o anumită persoană — fizică sau juridică — pornind de la{' '}
                <strong>numele proprietarului</strong>, nu de la numărul cadastral sau de la adresă. Căutăm în
                evidențele de <strong>cadastru și carte funciară</strong>, la nivel de localitate și județ, și
                îți întocmim lista imobilelor înscrise pe numele indicat.
              </p>
              <p>
                Spre deosebire de un extras de carte funciară clasic — unde pornești de la un imobil cunoscut și
                afli cine este proprietarul — aici procesul este invers: pornești de la o{' '}
                <strong>persoană</strong> și afli ce imobile are. Este o căutare pe care o pot face proprietarii,
                moștenitorii, creditorii, avocații sau cumpărătorii care vor să verifice patrimoniul cuiva
                înainte de o decizie importantă.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Căutare după proprietar, nu după număr cadastral
                </h3>
                <p className="text-sm text-neutral-700">
                  Important: pentru acest serviciu <strong>nu ai nevoie de numărul cadastral</strong> sau de
                  numărul de carte funciară. Câmpurile de care avem nevoie sunt:{' '}
                  <strong>numele / denumirea proprietarului</strong>, opțional <strong>CNP-ul</strong> (persoană
                  fizică) sau <strong>CUI-ul</strong> (persoană juridică), plus <strong>județul și
                  localitatea</strong> în care vrei să căutăm. Cu cât datele sunt mai precise, cu atât lista
                  rezultată este mai exactă.
                </p>
              </div>

              <p>
                După verificare, primești pe email <strong>lista imobilelor</strong> înscrise pe numele
                proprietarului în zona indicată, cu informațiile disponibile pentru fiecare poziție (localizare,
                tip de imobil și, unde se poate, numărul cadastral sau de carte funciară). Pe baza acestei liste
                poți comanda apoi un{' '}
                <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  extras de carte funciară
                </Link>
                {' '}pentru fiecare imobil care te interesează.
              </p>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-secondary-900 mb-1">Eligibilitate & protecția datelor (GDPR)</h3>
                  <p className="text-sm text-neutral-700">
                    Căutarea după proprietar prelucrează date cu caracter personal și este supusă verificării
                    <strong> interesului legitim</strong>. Înainte de procesare, echipa noastră{' '}
                    <strong>verifică eligibilitatea cererii</strong> (de exemplu: calitatea de moștenitor,
                    creditor, parte într-un litigiu sau alt temei legal). Dacă cererea nu îndeplinește condițiile,
                    îți comunicăm acest lucru și nu se efectuează căutarea.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Acoperire la nivel de localitate și județ
              </h3>
              <p>
                Evidențele de cadastru și carte funciară sunt organizate pe <strong>localități și unități
                administrativ-teritoriale</strong>. De aceea, căutarea după proprietar se face pe zona pe care o
                indici (o localitate sau un județ), nu automat pe toată țara. Dacă bănuiești că o persoană deține
                imobile în mai multe județe, ne poți indica fiecare zonă și extindem căutarea corespunzător.
              </p>
              <p>
                Dacă, în schimb, cunoști deja adresa unui imobil și vrei să afli numărul cadastral sau
                proprietarul lui, folosește serviciul de{' '}
                <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  identificare imobil după adresă
                </Link>
                . Serviciul de față este pentru situația inversă: pleci de la o persoană și afli imobilele ei.
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
                Ce date ne dai pentru căutarea după proprietar
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Nu ai nevoie de numărul cadastral. Pornim de la datele proprietarului și de la localitate.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
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

            <div className="mt-6 p-5 bg-primary-50 rounded-2xl border border-primary-200 max-w-3xl mx-auto flex items-start gap-3">
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-secondary-700">
                <strong>Cauți o firmă?</strong> Pentru persoane juridice ne dai denumirea și, ideal,{' '}
                <strong>CUI-ul</strong>. Pentru persoane fizice, numele complet și, dacă îl ai,{' '}
                <strong>CNP-ul</strong> ajută la diferențierea persoanelor cu nume identice.
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
                Când Ai Nevoie de Identificarea Imobilelor după Proprietar?
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
              <p className="text-white/70 max-w-2xl mx-auto">Identificăm imobilele proprietarului în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Ne dai datele', desc: 'Numele / denumirea proprietarului, opțional CNP/CUI, plus județul și localitatea.', icon: Users },
                { step: 2, title: 'Verificăm eligibilitatea', desc: 'Confirmăm interesul legitim al cererii, conform regulilor de protecție a datelor.', icon: Search },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești lista', desc: `În ${formatEstimatedDays(service)} primești pe email lista imobilelor înscrise pe proprietar.`, icon: CheckCircle },
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

        {/* Related — cross-link to imobiliare services */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Servicii pentru imobile
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={serviceUrl('certificat-detineri-imobile')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Layers className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Certificat de Dețineri Imobile</p>
                  <p className="text-sm text-neutral-600">Atestarea imobilelor deținute de o persoană.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('identificare-imobil')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Identificare Imobil după Adresă</p>
                  <p className="text-sm text-neutral-600">Pornești de la adresă și afli numărul cadastral.</p>
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
                  <p className="text-sm text-neutral-600">Situația juridică a unui imobil din listă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Identificare Imobile după Proprietar"
          faqs={[
            { q: 'Cum căutați imobilele după numele proprietarului?', a: 'Pornim de la numele persoanei fizice sau de la denumirea firmei și căutăm în evidențele de cadastru și carte funciară, la nivel de localitate și județ. Întocmim lista imobilelor înscrise pe numele indicat și ți-o trimitem pe email.' },
            { q: 'Ce date îmi trebuie pentru căutare?', a: 'Ai nevoie de numele / denumirea proprietarului și de zona în care căutăm (județ și localitate). Numărul cadastral nu este necesar. CNP-ul (persoană fizică) sau CUI-ul (persoană juridică) sunt opționale, dar cresc precizia rezultatului.' },
            { q: 'Ce primesc concret?', a: 'Primești lista imobilelor înscrise pe numele proprietarului în zona indicată, cu informațiile disponibile pentru fiecare poziție (localizare, tip de imobil și, unde se poate, numărul cadastral sau de carte funciară). Apoi poți comanda separat extrasul de carte funciară pentru fiecare imobil.' },
            { q: 'Căutarea acoperă tot județul sau toată țara?', a: 'Evidențele sunt organizate pe localități și județe, așa că facem căutarea pe zona pe care o indici. Dacă o persoană poate deține imobile în mai multe județe, ne spui fiecare zonă și extindem căutarea corespunzător.' },
            { q: 'Pot căuta și o firmă (persoană juridică)?', a: 'Da. Pentru persoane juridice ne dai denumirea și, ideal, CUI-ul. Procedura este aceeași: identificăm imobilele înscrise pe firma respectivă în zona indicată.' },
            { q: 'Cât durează?', a: `${formatEstimatedDays(service)}. Căutarea este făcută de un operator, pentru că presupune verificarea eligibilității și identificarea imobilelor după proprietar.` },
            { q: 'Cât costă serviciul?', a: `${service.base_price} RON, cu taxele OCPI incluse. Fără costuri ascunse.` },
            { q: 'Este legal? Cum respectați protecția datelor (GDPR)?', a: 'Căutarea după proprietar prelucrează date cu caracter personal și este permisă doar pe baza unui interes legitim (de exemplu calitatea de moștenitor, creditor sau parte într-un litigiu). Înainte de procesare verificăm eligibilitatea cererii; dacă nu sunt îndeplinite condițiile, nu efectuăm căutarea.' },
            { q: 'Am nevoie de cont ANCPI?', a: 'Nu. Ne ocupăm noi de tot procesul; tu trebuie doar să ne dai numele proprietarului și zona în care să căutăm.' },
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
                Află ce imobile deține un proprietar
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de numele proprietarului și de localitate. Primești lista imobilelor în {formatEstimatedDays(service)}.
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
