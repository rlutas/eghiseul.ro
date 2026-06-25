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
  Building2,
  Layers,
  UserSearch,
  KeyRound,
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
const SERVICE_SLUG = 'certificat-detineri-imobile';
const PAGE_PATH = '/servicii/certificat-detineri-imobile/';
const SCHEMA_SLUG = 'certificat-detineri-imobile';
const TITLE = 'Certificat privind Deținerea de Imobile — Adeverință OCPI';
const DESCRIPTION =
  'Certificat privind deținerea sau nedeținerea de imobile, eliberat de OCPI/ANCPI după persoană ' +
  '(nume + CNP/CUI + județ). Util pentru dosare de locuință, ajutoare și succesiuni. 198 RON, taxe incluse, pe email.';
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
  name: 'Certificat privind Deținerea de Imobile',
  description:
    'Serviciu de obținere a certificatului privind deținerea sau nedeținerea de imobile, eliberat de ' +
    'OCPI/ANCPI. Atestă dacă o persoană deține sau nu proprietăți imobiliare înscrise în evidențe, la ' +
    'nivel de localitate sau județ. Căutare după persoană (nume + CNP/CUI). 100% online, fără cont ANCPI, livrare pe email.',
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
    { name: 'Certificat privind Deținerea de Imobile', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Certificat privind Deținerea de Imobile', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function CertificatDetineriImobilePage() {
  const service = await getService();
  const switcherServices = await getImobiliareServices();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // What we need to identify the PERSON (search is by person, not by cadastral number)
  const identifiers = [
    { icon: UserSearch, title: 'Nume complet', desc: 'Numele și prenumele persoanei pentru care se face verificarea.' },
    { icon: KeyRound, title: 'CNP sau CUI', desc: 'Codul numeric personal (persoană fizică) ori CUI-ul (persoană juridică).' },
    { icon: MapPin, title: 'Județul / localitatea', desc: 'Unitatea administrativ-teritorială pe care vrei să fie acoperită verificarea.' },
  ];

  const useCases = [
    { icon: Home, title: 'Dosare de locuință', items: ['Locuință ANL', 'Locuință socială', 'Dovada că nu deții o altă locuință'] },
    { icon: ScrollText, title: 'Ajutoare & subvenții', items: ['Dosare de ajutor social', 'Burse pentru elevi/studenți', 'Sprijin financiar'] },
    { icon: Building2, title: 'Succesiuni & notariat', items: ['Dosar de succesiune', 'Masă succesorală', 'Acte la notar'] },
    { icon: Shield, title: 'Dovada (ne)deținerii', items: ['Confirmi că deții imobile', 'Sau că nu deții niciunul', 'Acceptat la instituții'] },
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
              <span className="text-white font-medium">Certificat privind Deținerea de Imobile</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Imobiliare
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <UserSearch className="h-3.5 w-3.5 mr-1" />
                    Căutare după persoană
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    OCPI / ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Certificat privind
                  <span className="block text-primary-500">Deținerea de Imobile</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Documentul OCPI/ANCPI care atestă dacă o persoană <strong>deține sau nu deține</strong> proprietăți
                  imobiliare înscrise în evidențe, la nivel de localitate sau județ.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <UserSearch className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Verificarea se face <strong className="text-primary-500">după persoană</strong> (nume + CNP/CUI),
                    nu după numărul cadastral. Primești <strong>dovada deținerii sau a nedeținerii</strong> de imobile,
                    cu taxele OCPI incluse — fără cont ANCPI și fără drum la ghișeu.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum obții</strong> certificatul:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Completezi datele persoanei (nume + CNP/CUI)',
                      'Alegi județul/localitatea pentru verificare',
                      'Plătești securizat (taxe OCPI incluse)',
                      'Primești certificatul pe email',
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
                        <p className="text-xs text-neutral-500">Verificare făcută de un operator</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Certificat de (ne)deținere</p>
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
                { icon: Landmark, value: 'OCPI / ANCPI', label: 'Document de cadastru' },
                { icon: Clock, value: formatEstimatedDays(service), label: 'Verificare de un operator' },
                { icon: Mail, value: 'Livrare pe email', label: 'Certificat de (ne)deținere' },
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
              Ce este certificatul privind deținerea de imobile
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Certificatul privind deținerea (sau nedeținerea) de imobile</strong> este documentul eliberat
                de Oficiul de Cadastru și Publicitate Imobiliară (<strong>OCPI / ANCPI</strong>) care atestă dacă o
                anumită persoană <strong>deține sau nu deține proprietăți imobiliare</strong> înscrise în evidențele de
                cadastru și carte funciară. Verificarea se face pe o unitate administrativ-teritorială (localitate sau
                județ), iar rezultatul confirmă fie că persoana figurează cu imobile, fie că nu figurează cu niciunul.
              </p>
              <p>
                Spre deosebire de extrasul de carte funciară, care descrie un singur imobil identificat printr-un număr
                cadastral, acest certificat pornește de la <strong>persoană</strong> și răspunde la o întrebare diferită:
                „are sau nu are această persoană proprietăți pe raza UAT-ului verificat?”. De aceea este cerut frecvent
                ca <strong>dovadă a deținerii ori a nedeținerii unei locuințe</strong>, mai ales în dosarele unde
                eligibilitatea depinde de patrimoniul imobiliar al solicitantului.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Căutare după persoană, nu după numărul cadastral
                </h3>
                <p className="text-sm text-neutral-700">
                  Pentru a elibera certificatul avem nevoie de <strong>datele persoanei</strong> — nume complet și
                  <strong> CNP</strong> (pentru persoane fizice) sau <strong>CUI</strong> (pentru persoane juridice) —
                  plus <strong>județul sau localitatea</strong> unde vrei să fie făcută verificarea. Nu este nevoie de
                  niciun număr cadastral sau de carte funciară: tocmai ce încercăm să aflăm este dacă persoana deține
                  imobile, nu detaliile unui imobil deja cunoscut.
                </p>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                Deținere vs. nedeținere: ce poate să arate certificatul
              </h3>
              <p>
                Rezultatul poate fi de două feluri. Dacă persoana <strong>deține imobile</strong> înscrise în evidențe,
                certificatul confirmă deținerea (în funcție de tipul documentului, poate include și o listă a imobilelor
                pe raza UAT-ului verificat). Dacă persoana <strong>nu deține niciun imobil</strong>, certificatul atestă
                nedeținerea — adică exact „adeverința că nu am casă/teren” cerută în multe dosare de locuință și ajutoare.
              </p>
              <p>
                Important de reținut: certificatul reflectă <strong>evidențele de cadastru și carte funciară</strong> la
                nivelul UAT-ului verificat. Proprietățile neînscrise (neintabulate) sau cele aflate pe raza altor
                localități/județe nu apar automat — de aceea îți confirmăm înainte exact ce acoperire teritorială alegi,
                ca certificatul să corespundă cerinței din dosarul tău.
              </p>

              <h3 className="text-xl font-bold text-secondary-900 pt-2">
                La ce dosare îți este cerut
              </h3>
              <p>
                Cel mai des, certificatul este solicitat în <strong>dosarele de locuință</strong> (locuințe ANL,
                locuințe sociale sau de necesitate), unde trebuie să dovedești că nu deții deja o locuință în
                proprietate. Apare și în <strong>dosarele de ajutoare și subvenții</strong>, la acordarea unor burse,
                în <strong>dosarele notariale și de succesiune</strong>, precum și ori de câte ori o instituție îți cere
                o dovadă privind patrimoniul imobiliar. Prin eGhișeul îl obții 100% online: tu ne dai datele persoanei,
                noi facem verificarea la OCPI și îți trimitem certificatul pe email.
              </p>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Ai nevoie de un imobil anume, nu de un certificat pe persoană?
                </h3>
                <p className="text-sm text-neutral-700">
                  Dacă vrei situația juridică a unui imobil identificat (proprietar, suprafață, sarcini), comandă{' '}
                  <Link href={serviceUrl('extras-carte-funciara')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    extrasul de carte funciară
                  </Link>
                  . Dacă ai doar adresa și vrei să afli numărul cadastral, folosește serviciul de{' '}
                  <Link href={serviceUrl('identificare-imobil')} className="font-semibold text-primary-700 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    identificare imobil
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Identifiers — search by person */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Ce îți trebuie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce date sunt necesare pentru verificare
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Verificarea pornește de la persoană. Ai nevoie de datele de identificare și de zona de verificat.
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
                <strong>Nu ești sigur de acoperirea teritorială?</strong> Verificarea se face pe localitate sau județ.
                Spune-ne unde a locuit sau a deținut proprietăți persoana și îți confirmăm zona potrivită pentru dosarul tău.
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
                Când Ai Nevoie de Certificatul de (Ne)deținere?
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
              <p className="text-white/70 max-w-2xl mx-auto">Obții certificatul în 4 pași, 100% online</p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, title: 'Datele persoanei', desc: 'Completezi numele și CNP-ul (sau CUI-ul) persoanei verificate.', icon: UserSearch },
                { step: 2, title: 'Alegi zona', desc: 'Selectezi județul/localitatea. Un operator face verificarea la OCPI.', icon: MapPin },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele OCPI sunt incluse.', icon: Shield },
                { step: 4, title: 'Primești certificatul', desc: `În ${formatEstimatedDays(service)} primești certificatul de (ne)deținere pe email.`, icon: CheckCircle },
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
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href={serviceUrl('identificare-imobile-proprietar')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <UserSearch className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Identificare Imobile după Proprietar</p>
                  <p className="text-sm text-neutral-600">Afli ce imobile deține o persoană, pornind de la datele ei.</p>
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
                  <p className="text-sm text-neutral-600">Situația juridică a unui imobil: proprietar, suprafață, sarcini.</p>
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
                  <p className="text-sm text-neutral-600">Nu știi numărul cadastral? Îl aflăm după adresă.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Certificat privind Deținerea de Imobile"
          faqs={[
            { q: 'Ce atestă certificatul privind deținerea de imobile?', a: 'Atestă dacă o anumită persoană deține sau nu deține proprietăți imobiliare înscrise în evidențele de cadastru și carte funciară, pe raza unității administrativ-teritoriale verificate (localitate sau județ).' },
            { q: 'Care e diferența dintre certificatul de deținere și cel de nedeținere?', a: 'Este același tip de document; rezultatul diferă. Dacă persoana are imobile, certificatul confirmă deținerea (uneori cu lista imobilelor). Dacă nu are niciun imobil, atestă nedeținerea — adică dovada că persoana nu deține casă sau teren în zona verificată.' },
            { q: 'Ce date îmi trebuie pentru a comanda?', a: 'Numele complet al persoanei și CNP-ul (pentru persoană fizică) sau CUI-ul (pentru persoană juridică), plus județul sau localitatea unde vrei să fie făcută verificarea. Nu ai nevoie de niciun număr cadastral.' },
            { q: 'Pe ce zonă se face verificarea?', a: 'Verificarea se face la nivel de unitate administrativ-teritorială — o localitate sau un județ. Proprietățile de pe raza altor localități/județe nu apar automat, așa că îți confirmăm acoperirea înainte de a face verificarea.' },
            { q: 'Apar și imobilele neintabulate?', a: 'Nu. Certificatul reflectă evidențele de cadastru și carte funciară. Proprietățile neînscrise (neintabulate) nu figurează în aceste evidențe și, prin urmare, nu pot fi confirmate prin acest document.' },
            { q: 'Cât costă?', a: `${service.base_price} RON, cu taxele OCPI incluse. Fără costuri ascunse.` },
            { q: 'Cât durează eliberarea?', a: `${formatEstimatedDays(service)}. Verificarea este făcută de un operator, deoarece presupune o căutare la OCPI după datele persoanei.` },
            { q: 'La ce dosare este acceptat?', a: 'Este cerut frecvent la dosarele de locuință (ANL, locuință socială), la ajutoare și subvenții, la acordarea unor burse, în dosarele de succesiune și notariale, precum și ori de câte ori o instituție cere o dovadă privind patrimoniul imobiliar.' },
            { q: 'Am nevoie de cont ANCPI?', a: 'Nu. Ne ocupăm noi de tot procesul; tu trebuie doar să ne dai datele persoanei și zona de verificat, iar certificatul îl primești pe email.' },
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
                Ai nevoie de dovada că deții (sau nu) imobile?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de datele persoanei și de zona de verificat. Primești certificatul în {formatEstimatedDays(service)}.
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
