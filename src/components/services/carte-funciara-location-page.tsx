import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Building2,
  ChevronRight,
  FileText,
  Home,
  Landmark,
  Scale,
  Shield,
  Search,
  ClipboardList,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { WhatsAppButton } from '@/components/services/whatsapp-button';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { Footer } from '@/components/home/footer';
import { buildLocationPageGraph } from '@/lib/seo/locations';
import type { OcpiCounty } from '@/lib/seo/locations/ocpi';

const HUB_PATH = '/servicii/extras-de-carte-funciara/';
const ORDER = '/comanda/extras-carte-funciara';
const PRICE = 89;

const BENEFITS = ['Fără drum la OCPI', 'Fără cont ANCPI', 'Livrare în câteva minute', 'Plată securizată cu cardul'];

const USE_CASES = [
  { icon: Home, title: 'Vânzare-cumpărare', desc: 'Verifici proprietarul real și eventualele sarcini înainte de a cumpăra; notarul cere extras de autentificare pentru actul de vânzare.' },
  { icon: Landmark, title: 'Credit ipotecar', desc: 'Banca solicită extrasul de carte funciară pentru a constitui ipoteca pe imobil.' },
  { icon: Scale, title: 'Moștenire / succesiune', desc: 'Necesar la dezbaterea succesorală la notar, pentru a stabili masa succesorală.' },
  { icon: FileText, title: 'Verificare sarcini', desc: 'Afli dacă imobilul are ipoteci, sechestre, servituți sau alte sarcini înscrise.' },
];

const COMPARISON: { label: string; online: string; ghiseu: string }[] = [
  { label: 'Deplasare la OCPI', online: 'Nu', ghiseu: 'Da' },
  { label: 'Cont ANCPI necesar', online: 'Nu', ghiseu: 'Da' },
  { label: 'Disponibilitate', online: '24/7, online', ghiseu: 'Doar în program' },
  { label: 'Timp de obținere', online: 'Câteva minute', ghiseu: 'În funcție de coadă/program' },
  { label: 'Plată', online: 'Card, online', ghiseu: 'La ghișeu / online ANCPI' },
];

const STEPS = [
  { icon: ClipboardList, text: 'Completezi datele imobilului online (județ, localitate, număr carte funciară), în câteva minute.' },
  { icon: Shield, text: 'Plătești cu cardul — 89 RON, taxe ANCPI incluse, fără cont ANCPI.' },
  { icon: Search, text: 'Interogăm sistemul oficial ANCPI (e-Terra) în numele tău.' },
  { icon: Mail, text: 'Primești extrasul de carte funciară oficial, pe email, în câteva minute.' },
];

function faqs(county: OcpiCounty) {
  const { judet, office } = county;
  const generic = [
    { q: 'Cât durează obținerea extrasului de carte funciară online?', a: 'Prin eGhișeul.ro, de regulă câteva minute — interogăm direct sistemul oficial ANCPI și primești extrasul pe email.' },
    { q: `Trebuie să merg la ${office}?`, a: `Nu. Extrasul de carte funciară de informare se obține integral online, fără drum la ${office} și fără cont ANCPI. La ghișeu mergi doar dacă ai nevoie de servicii care necesită prezență fizică.` },
    { q: 'Ce conține extrasul de carte funciară?', a: 'Datele de identificare ale imobilului (suprafață, adresă, număr cadastral), proprietarii înscriși și cotele lor, precum și sarcinile — ipoteci, sechestre, servituți, interdicții.' },
    { q: 'Care e diferența dintre extrasul de informare și cel de autentificare?', a: 'Extrasul de informare poate fi cerut de oricine, online, și are caracter informativ. Extrasul de autentificare se obține prin notar pentru încheierea unui act (vânzare), blochează temporar cartea funciară și are valabilitate scurtă.' },
    { q: 'Documentul este oficial?', a: `Da. Extrasul provine din sistemul oficial ANCPI și este același document gestionat de ${office} (Oficiul de Cadastru și Publicitate Imobiliară ${judet}).` },
  ];
  // FAQ-urile specifice județului intră după primele două întrebări generale.
  const local = county.localFaq ?? [];
  return [...generic.slice(0, 2), ...local, ...generic.slice(2)];
}

export function CarteFunciaraLocationPage({ county, others }: { county: OcpiCounty; others: { slug: string; judet: string }[] }) {
  const path = `${HUB_PATH}${county.slug}/`;
  const title = `Extras de Carte Funciară Online ${county.judet}`;
  const description = `Obține extrasul de carte funciară pentru un imobil din județul ${county.judet}, online, fără drum la ${county.office}. 89 RON, taxe incluse, livrare în câteva minute.`;

  const jsonLd = buildLocationPageGraph({
    serviceName: `${title} — eGhișeul.ro`,
    description,
    path,
    cityName: county.judet,
    price: PRICE,
    breadcrumb: [
      { name: 'Acasă', url: 'https://eghiseul.ro/' },
      { name: 'Extras Carte Funciară', url: `https://eghiseul.ro${HUB_PATH}` },
      { name: county.judet, url: `https://eghiseul.ro${path}` },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
              <Link href={HUB_PATH} className="hover:text-primary-500 transition-colors">Extras Carte Funciară</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white font-medium">{county.judet}</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Home className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Imobiliare
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Building2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    {county.office}
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Extras de Carte Funciară Online
                  <span className="block text-primary-500">{county.judet}</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Obține extrasul de carte funciară pentru un imobil din județul {county.judet} fără drum la {county.office}.
                  100% online, fără cont ANCPI, livrare pe email în câteva minute. <strong className="text-white">{PRICE} RON</strong>, taxe incluse.
                </p>

                <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" /> {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* OCPI + price card */}
              <div className="lg:w-[380px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        TAXE ANCPI INCLUSE
                      </span>
                      <p className="text-4xl font-extrabold text-white leading-none">{PRICE} RON</p>
                      <p className="text-white/60 text-sm mt-2">Fără taxe ascunse, fără cont ANCPI</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în câteva minute</p>
                        <p className="text-xs text-neutral-500">Interogare directă e-Terra (ANCPI)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">Extras de informare, PDF</p>
                      </div>
                    </div>

                    {/* OCPI office info */}
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2.5">
                      <p className="flex items-center gap-2 text-sm font-bold text-secondary-900">
                        <Building2 className="h-4 w-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
                        {county.office}
                      </p>
                      <p className="flex items-start gap-2 text-xs text-neutral-600">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        {county.address}
                      </p>
                      <p className="flex items-start gap-2 text-xs text-neutral-600">
                        <Phone className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <a href={`tel:${county.phone.replace(/[ ,].*/, '').replace(/\s/g, '')}`} className="hover:text-primary-600">{county.phone}</a>
                      </p>
                      <p className="flex items-start gap-2 text-xs text-neutral-600">
                        <Mail className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <a href={`mailto:${county.email}`} className="hover:text-primary-600 break-all">{county.email}</a>
                      </p>
                      {county.program && (
                        <p className="flex items-start gap-2 text-xs text-neutral-600">
                          <Clock className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span>Depunere: {county.program.depunere}{county.program.eliberare ? ` · Eliberare: ${county.program.eliberare}` : ''}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Cu eGhișeul.ro nu trebuie să te deplasezi la {county.office} — extrasul de informare vine online, pe email.
                      </p>
                    </div>

                    <OrderButton href={ORDER} className="w-full mt-1">Comandă extras CF {county.judet}</OrderButton>

                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        <span className="text-xs">Document ANCPI</span>
                      </div>
                    </div>

                    <GoogleReviewsBadge variant="bar" className="mt-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ce este extrasul */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Despre document
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
              Ce este extrasul de carte funciară
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Extrasul de carte funciară este documentul emis de ANCPI (Agenția Națională de Cadastru și
                Publicitate Imobiliară) care arată <strong className="text-secondary-900">situația juridică a unui imobil</strong>: cine este proprietarul,
                suprafața și datele cadastrale, precum și sarcinile înscrise — ipoteci, sechestre, servituți sau interdicții.
                Pentru imobilele din județul {county.judet}, evidența este ținută de {county.office}.
              </p>

              {county.highlight && <p>{county.highlight}</p>}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mt-10 mb-5">
              Tipuri de extras de carte funciară
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">Extras de informare</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Poate fi cerut de oricine, online; arată situația juridică la zi. Acesta se obține prin eGhișeul.ro, fără drum la ghișeu.
                </p>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">Extras de autentificare</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Se obține prin notar pentru încheierea unui act (vânzare); blochează temporar cartea funciară și are valabilitate scurtă.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Când ai nevoie
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                La ce îți folosește în județul {county.judet}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {USE_CASES.map((u) => (
                <div key={u.title} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <u.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">{u.title}</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Online vs ghiseu */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Comparație
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Online vs. la ghișeu OCPI {county.judet}
              </h2>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100 text-secondary-900">
                    <th className="text-left px-4 py-3 font-semibold"></th>
                    <th className="text-left px-4 py-3 font-semibold">Online (eGhișeul)</th>
                    <th className="text-left px-4 py-3 font-semibold">La ghișeu OCPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {COMPARISON.map((r) => (
                    <tr key={r.label}>
                      <td className="px-4 py-3 text-neutral-700">{r.label}</td>
                      <td className="px-4 py-3 font-medium text-secondary-900">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                          {r.online}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{r.ghiseu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Localitati */}
        {county.localities && county.localities.length > 0 && (
          <section className="py-12 lg:py-20 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-[820px]">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Acoperire
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce localități acoperim în {county.judet}
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Toate. Interogarea se face în e-Terra, sistemul electronic național al ANCPI, așa că{' '}
                {county.slug === 'bucuresti'
                  ? 'nu contează sectorul — cărțile funciare din toate cele 6 sectoare sunt în același sistem.'
                  : `nu contează unde se află imobilul în județ: în ${county.resedinta}, într-un oraș mic sau într-o comună.`}
                {county.bcpi && county.slug !== 'bucuresti'
                  ? ` La ghișeu, evidența locală este administrată de ${county.office} prin ${county.bcpi} birouri teritoriale de carte funciară — online nu depinzi de niciunul dintre ele.`
                  : ''}
              </p>
              <div className="flex flex-wrap gap-2 my-5">
                {county.localities.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-200 px-3 py-1 text-sm text-neutral-700">
                    <MapPin className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" aria-hidden="true" />
                    {l}
                  </span>
                ))}
              </div>
              <p className="text-sm text-neutral-500">
                Lista de mai sus este orientativă — comanda funcționează pentru orice localitate din {county.judet}.
              </p>
            </div>
          </section>
        )}

        {/* Pasii — dark connected timeline */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] py-14 lg:py-24">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-500/15 text-primary-400 text-sm font-semibold rounded-full mb-4 border border-primary-500/30">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">
                Cum obții extrasul online, în {county.judet}
              </h2>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <div key={s.text} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_8px_24px_rgba(236,185,95,0.35)]">
                    <s.icon className="h-7 w-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-secondary-900 shadow-md">{i + 1}</span>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed max-w-[240px] mx-auto">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pret + linkuri utile */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Preț
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Preț</h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Extrasul de carte funciară de informare costă <strong className="text-secondary-900">{PRICE} RON</strong> prin eGhișeul.ro,
                <strong className="text-secondary-900"> taxe ANCPI incluse</strong> — fără cont ANCPI și fără taxă de urgență. Plătești o singură dată, cu
                cardul, iar documentul ajunge pe email în câteva minute.
              </p>

              <p>
                Nu cunoști numărul cărții funciare? Cu{' '}
                <Link href="/servicii/identificare-imobil/" className="text-primary-600 font-semibold hover:underline">identificarea imobilului</Link>{' '}
                afli numărul CF pornind de la adresă. Vezi și{' '}
                <Link href={HUB_PATH} className="text-primary-600 font-semibold hover:underline">pagina principală Extras Carte Funciară</Link> sau{' '}
                <Link href="/calculator/taxe-notariale/" className="text-primary-600 font-semibold hover:underline">calculatorul de taxe notariale</Link>{' '}
                (util la vânzarea unui imobil din {county.judet}).
              </p>

              <p className="text-sm text-neutral-500">
                Informații orientative. Datele {county.office} sunt preluate din surse oficiale ANCPI; programul de lucru
                poate fi modificat — verifică pe site-ul oficial înainte de o eventuală deplasare.
              </p>
            </div>
          </div>
        </section>

        <ServiceFAQ title="Întrebări frecvente" faqs={faqs(county)} />

        {/* Other counties */}
        {others.length > 0 && (
          <section className="py-12 lg:py-16 bg-neutral-50 border-t border-neutral-100">
            <div className="container mx-auto px-4 max-w-[820px]">
              <h2 className="flex items-center gap-2 text-xl font-bold text-secondary-900 mb-5">
                <Landmark className="h-5 w-5 text-primary-600" aria-hidden="true" /> Extras carte funciară în alte județe
              </h2>
              <div className="flex flex-wrap gap-2">
                {others.map((o) => (
                  <Link key={o.slug} href={`${HUB_PATH}${o.slug}/`} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm transition-all">
                    {o.judet}
                  </Link>
                ))}
              </div>
              <Link href={HUB_PATH} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline">
                Vezi serviciul Extras Carte Funciară <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        {/* CTA final */}
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
                Gata să obții extrasul de carte funciară {county.judet}?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completezi datele imobilului în câteva minute, fără drum la {county.office}. Primești extrasul pe email — {PRICE} RON, taxe incluse.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <OrderButton href={ORDER}>Comandă extras CF {county.judet}</OrderButton>
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileStickyCTA href={ORDER} basePrice={PRICE} />

      <Footer />
    </>
  );
}
