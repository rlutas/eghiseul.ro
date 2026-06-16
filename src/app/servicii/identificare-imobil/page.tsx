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
  AlertTriangle,
  UserSearch,
} from 'lucide-react';
import { Service, formatEstimatedDays } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { OrderButton } from '@/components/services/order-button';
import { buildPageMetadata, buildServicePageGraph, BASE_URL, serviceUrl } from '@/lib/seo';

// New service — no WP legacy URL, so the folder name matches the DB slug and
// serviceUrl() resolves to this page with no redirect/override needed.
const SERVICE_SLUG = 'identificare-imobil';
const PAGE_PATH = '/servicii/identificare-imobil/';
const SCHEMA_SLUG = 'identificare-imobil';
const TITLE = 'Identificare Imobil după Adresă — Află Numărul Cadastral';
const DESCRIPTION =
  'Nu știi numărul cadastral sau de carte funciară? Îți identificăm imobilul după adresă ' +
  '(parcelă/construcție + nr. CF) direct de la ANCPI și primești și extrasul de carte funciară. ' +
  '198 RON, taxe incluse. 100% online, fără cont ANCPI.';
const DATE_PUBLISHED = '2026-06-16';
const DATE_MODIFIED = '2026-06-16';

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
  name: 'Identificare Imobil după Adresă',
  description:
    'Serviciu de identificare a unui imobil (parcelă/construcție și număr de carte funciară) pornind ' +
    'de la adresă, atunci când nu cunoști numărul cadastral. După identificare primești și extrasul de ' +
    'carte funciară de la ANCPI. 100% online, fără cont ANCPI, livrare pe email.',
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
    { name: 'Identificare Imobil după Adresă', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    { name: 'Identificare Imobil după Adresă', price: 198, url: `${BASE_URL}${PAGE_PATH}` },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 450 },
});

export default async function IdentificareImobilPage() {
  const service = await getService();
  if (!service) notFound();

  // Price display: base_price is VAT-inclusive (total). Show the ex-VAT number as
  // the headline (looks smaller / more attractive) + VAT + total cu TVA.
  const priceWithVat = Number(service.base_price);
  const priceExVat = Math.round((priceWithVat / 1.21) * 100) / 100;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

  // Why you might not know the cadastral number — targets the long-tail intent
  const reasons = [
    { icon: Home, title: 'Casă moștenită', desc: 'Imobil primit prin succesiune, fără actele cadastrale la îndemână.' },
    { icon: Building2, title: 'Apartament', desc: 'Cunoști adresa, dar nu numărul cadastral sau de carte funciară.' },
    { icon: ScrollText, title: 'Act vechi', desc: 'Proprietate cu documente vechi, fără număr cadastral atribuit clar.' },
    { icon: MapPin, title: 'Teren', desc: 'Parcelă pe care vrei să o localizezi și să o verifici juridic.' },
  ];

  const useCases = [
    { icon: Search, title: 'Vrei extrasul CF', items: ['Dar nu știi nr. cadastral', 'Pornind doar de la adresă', 'Verificare proprietar'] },
    { icon: Home, title: 'Tranzacție imobiliară', items: ['Verifici un imobil înainte de cumpărare', 'Confirmi proprietarul', 'Identifici sarcini'] },
    { icon: ScrollText, title: 'Succesiune', items: ['Imobil moștenit', 'Acte incomplete', 'Pregătire dosar notarial'] },
    { icon: Shield, title: 'Verificare proprietate', items: ['Localizezi parcela', 'Afli situația juridică', 'Confirmi datele'] },
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
              <span className="text-white font-medium">Identificare Imobil după Adresă</span>
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
                    Aflăm noi numărul cadastral
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Landmark className="h-3.5 w-3.5 mr-1" />
                    ANCPI
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Identificare Imobil
                  <span className="block text-primary-500">după Adresă</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Nu știi numărul cadastral sau de carte funciară? Îți identificăm imobilul pornind doar
                  de la adresă și primești și extrasul de carte funciară.
                </p>

                {/* USP */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <UserSearch className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Dai <strong className="text-primary-500">adresa</strong>, noi căutăm parcela/construcția
                    în sistemul ANCPI, îți <strong>aflăm numărul cadastral și de carte funciară</strong> și
                    îți livrăm extrasul CF — fără cont ANCPI și fără drum la OCPI.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Cum decurge</strong> identificarea imobilului:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Ne dai adresa completă a imobilului',
                      'Localizăm parcela/construcția în sistemul ANCPI',
                      'Identificăm numărul cadastral și de carte funciară',
                      'Primești extrasul CF pe email',
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
                        EXTRAS CF INCLUS
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl lg:text-6xl font-black text-white">{fmt(priceExVat)}</span>
                        <span className="text-xl font-bold text-white/70">RON</span>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        + TVA 21% · <span className="font-semibold text-white">{fmt(priceWithVat)} RON</span> cu TVA
                      </p>
                      <p className="text-white/50 text-xs mt-1">Identificare + extras CF, taxe incluse</p>
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
                        <p className="text-xs text-neutral-500">Nr. cadastral/CF + extras CF</p>
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

        {/* SEO Intro */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">
              Cum afli numărul cadastral după adresă
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Pentru a obține un <strong>extras de carte funciară</strong> ai nevoie de un identificator al
                imobilului — <strong>numărul cadastral</strong> sau <strong>numărul de carte funciară</strong>.
                Problema apare des: cunoști adresa, dar nu ai numărul cadastral la îndemână. Acolo intervenim noi:
                <strong> identificăm imobilul după adresă</strong> și îți spunem numărul cadastral și de carte funciară.
              </p>
              <p>
                Folosim datele oficiale ale ANCPI (geoportalul și sistemul de cadastru) pentru a localiza
                <strong> parcela sau construcția</strong> la adresa indicată. După ce identificăm imobilul, obținem
                și <strong>extrasul de carte funciară</strong> și îți trimitem totul pe email, fără cont ANCPI și
                fără deplasare la Oficiul de Cadastru (OCPI).
              </p>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-secondary-900 mb-1">Important — când identificarea poate să nu reușească</h3>
                  <p className="text-sm text-neutral-700">
                    Dacă imobilul <strong>nu este înscris în cartea funciară</strong> (neintabulat / fără cadastru),
                    identificarea poate să nu reușească — în acest caz căutăm date utile prin alte surse oficiale.
                    <strong> Apartamentele</strong> pot necesita verificări suplimentare (bloc, scară, etaj). Te ținem
                    la curent pe tot parcursul și îți comunicăm rezultatul.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reasons you might not know the number */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Pentru cine
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Când ai nevoie de identificarea imobilului
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ai doar adresa și vrei să afli numărul cadastral, numărul de carte funciară sau proprietarul.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {reasons.map((it) => (
                <div key={it.title} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <it.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{it.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Situații frecvente
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                În ce situații te ajută
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
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
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Cum Funcționează?</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">Identificăm imobilul în 4 pași, 100% online</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { step: 1, title: 'Ne dai adresa', desc: 'Completezi adresa imobilului (județ, localitate, stradă, număr).', icon: MapPin },
                { step: 2, title: 'Căutăm imobilul', desc: 'Localizăm parcela/construcția în sistemul ANCPI și identificăm nr. cadastral/CF.', icon: Search },
                { step: 3, title: 'Plătești Securizat', desc: 'Card, Apple Pay, Google Pay — taxele ANCPI sunt incluse în preț.', icon: Shield },
                { step: 4, title: 'Primești rezultatul', desc: `În ${formatEstimatedDays(service)} primești nr. cadastral/CF și extrasul CF pe email.`, icon: CheckCircle },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="bg-neutral-50 rounded-2xl p-6 h-full border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all group">
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

        {/* Related — cross-link to CF + plan cadastral */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 text-center">
              Servicii pentru imobile
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href={serviceUrl('extras-carte-funciara')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ScrollText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Carte Funciară</p>
                  <p className="text-sm text-neutral-600">Dacă știi deja numărul cadastral sau de CF.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
              <Link
                href={serviceUrl('extras-plan-cadastral')}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-secondary-900 group-hover:text-primary-700">Extras de Plan Cadastral</p>
                  <p className="text-sm text-neutral-600">Localizezi terenul pe ortofotoplan după nr. cadastral.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <ServiceFAQ
          title="Întrebări Frecvente — Identificare Imobil după Adresă"
          faqs={[
            { q: 'Cum aflu numărul cadastral după adresă?', a: 'Ne dai adresa completă a imobilului, iar noi localizăm parcela/construcția în sistemul ANCPI și identificăm numărul cadastral și de carte funciară. Primești rezultatul pe email, împreună cu extrasul CF.' },
            { q: 'Ce primesc concret?', a: 'Numărul cadastral și/sau de carte funciară al imobilului identificat și extrasul de carte funciară aferent, livrate pe email.' },
            { q: 'Cât costă identificarea imobilului?', a: `${service.base_price} RON, cu taxele ANCPI și extrasul CF incluse. Fără costuri ascunse.` },
            { q: 'Cât durează?', a: `${formatEstimatedDays(service)}. Verificarea este făcută de un operator, pentru că presupune căutarea imobilului după adresă.` },
            { q: 'Funcționează pentru apartamente?', a: 'Da, dar apartamentele pot necesita verificări suplimentare (bloc, scară, etaj) și uneori date din actul de proprietate. Te ținem la curent.' },
            { q: 'Ce se întâmplă dacă imobilul nu poate fi identificat?', a: 'Dacă imobilul nu este înscris în cartea funciară (neintabulat / fără cadastru), identificarea poate să nu reușească. În acest caz căutăm date utile prin alte surse oficiale și îți comunicăm rezultatul.' },
            { q: 'Am nevoie de cont ANCPI?', a: 'Nu. Ne ocupăm noi de tot procesul; tu trebuie doar să ne dai adresa imobilului.' },
            { q: 'Pot identifica imobilul și după proprietar?', a: 'Căutarea standard este după adresă. Dacă ai doar numele proprietarului, contactează-ne și verificăm ce opțiuni sunt disponibile pentru cazul tău.' },
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
                Nu știi numărul cadastral? Îl aflăm noi.
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Ai nevoie doar de adresa imobilului. Primești numărul cadastral/CF și extrasul de carte funciară în {formatEstimatedDays(service)}.
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
