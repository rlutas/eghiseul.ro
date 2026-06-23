import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Building2,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Plane,
  GraduationCap,
  Gavel,
  Heart,
  Landmark,
  Globe,
  FileText,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { Footer } from '@/components/home/footer';
import { buildLocationPageGraph, type CityData } from '@/lib/seo/locations';

const HUB_PATH = '/servicii/cazier-judiciar-online/';
const ORDER_PF = '/comanda/cazier-judiciar-persoana-fizica/';
const ORDER_PJ = '/comanda/cazier-judiciar-persoana-juridica/';
const PF_PAGE = '/servicii/cazier-judiciar-online/persoana-fizica/';
const PJ_PAGE = '/servicii/cazier-judiciar-online/persoana-juridica/';
const RELATED_SERVICES = [
  { href: '/servicii/cazier-auto-online/', label: 'Cazier auto online' },
  { href: '/servicii/cazier-fiscal-online/', label: 'Cazier fiscal online' },
  { href: '/servicii/certificat-de-integritate-comportamentala/', label: 'Certificat de integritate' },
];
const PRICE = 198;

interface OtherCity {
  slug: string;
  name: string;
}

const STEPS = [
  'Completezi datele online, în 2-3 minute (fără cont).',
  'Semnezi împuternicirea direct în aplicație și plătești cu cardul.',
  'Depunem cererea la IPJ în numele tău, pe bază de împuternicire.',
  'Primești cazierul prin curier sau pe email, în 2-4 zile lucrătoare.',
];

const BENEFITS = ['Fără drum la IPJ', 'Fără cozi sau programare', 'Livrare 2-4 zile', 'Plată securizată cu cardul'];

const USE_CASES = [
  { icon: Briefcase, title: 'Angajare', desc: 'Tot mai mulți angajatori cer cazierul la angajare, mai ales în pază, transport, educație, sănătate sau în sistemul financiar-bancar.' },
  { icon: Plane, title: 'Emigrare și viză', desc: 'Necesar pentru viză, permis de ședere sau dosar de muncă în străinătate — de regulă cu apostilă de la Haga și traducere autorizată.' },
  { icon: GraduationCap, title: 'Studii și Erasmus', desc: 'Universitățile și programele de mobilitate îl pot cere la înscriere sau pentru stagii și voluntariat.' },
  { icon: Gavel, title: 'Licitații publice', desc: 'Administratorii de firme îl prezintă în dosarele de participare la licitații publice.' },
  { icon: Heart, title: 'Adopție și tutelă', desc: 'Obligatoriu în dosarele de adopție, plasament familial sau tutelă.' },
  { icon: Landmark, title: 'Funcție publică', desc: 'Cerut la concursurile pentru posturi în administrația publică și instituțiile statului.' },
];

const ACTE_PF = [
  'Act de identitate valabil (CI sau pașaport)',
  'O fotografie/scan pentru verificarea identității',
  'Semnarea împuternicirii online (o generăm noi)',
];
const ACTE_PJ = [
  'Datele firmei (denumire, CUI, reprezentant legal)',
  'Actul de identitate al reprezentantului',
  'Împuternicire / mandat pentru depunerea cererii',
];

const COMPARISON: { label: string; online: string; ghiseu: string }[] = [
  { label: 'Deplasare la sediu', online: 'Nu', ghiseu: 'Da, la IPJ' },
  { label: 'Disponibilitate', online: '24/7, online', ghiseu: 'Doar în program' },
  { label: 'Cozi / așteptare', online: 'Nu', ghiseu: 'Frecvent' },
  { label: 'Livrare', online: 'Email + curier', ghiseu: 'Pe loc, dar te deplasezi' },
  { label: 'Traducere & apostilă', online: 'Opțional, le gestionăm noi', ghiseu: 'Le obții separat' },
  { label: 'Plată', online: 'Card, online', ghiseu: 'La ghișeu' },
];

function genericFaq(cityName: string) {
  return [
    { q: 'Cât durează eliberarea cazierului judiciar?', a: 'Prin eGhișeul.ro, în mod standard 2-4 zile lucrătoare; există și opțiunea Urgent. La ghișeu se eliberează de regulă pe loc, în limita programului.' },
    { q: 'Cât este valabil cazierul judiciar?', a: 'De regulă 6 luni de la data emiterii, însă unele instituții pot cere un document mai recent (uneori emis în ultimele 30 de zile). Verifică cerința instituției la care îl depui.' },
    { q: 'Documentul este oficial și acceptat?', a: `Da. Primești cazierul judiciar oficial emis de Poliția Română (IPJ), valabil pentru orice instituție din țară sau, cu apostilă și traducere, din străinătate. Este același document ca cel obținut la ghișeu în ${cityName}.` },
    { q: 'Plata și datele mele sunt în siguranță?', a: 'Da. Plata se face securizat cu cardul, iar datele sunt protejate conform GDPR. Folosim împuternicirea semnată online pentru a depune cererea în numele tău.' },
  ];
}

export function CazierLocationPage({ city, otherCities }: { city: CityData; otherCities: OtherCity[] }) {
  const path = `${HUB_PATH}${city.slug}/`;
  const title = `Cazier Judiciar Online ${city.name}`;
  const description = `Obține cazierul judiciar în ${city.name} fără drum la IPJ ${city.judet}. Comandă online, livrare în 2-4 zile pe email sau curier.`;
  const anchors = city.localAnchors?.length ? city.localAnchors.join(', ') : null;

  const jsonLd = buildLocationPageGraph({
    serviceName: `${title} — eGhișeul.ro`,
    description,
    path,
    cityName: city.name,
    price: PRICE,
    breadcrumb: [
      { name: 'Acasă', url: 'https://eghiseul.ro/' },
      { name: 'Cazier Judiciar Online', url: `https://eghiseul.ro${HUB_PATH}` },
      { name: city.name, url: `https://eghiseul.ro${path}` },
    ],
  });

  const scheduleRows = city.ipj?.schedule ? Object.entries(city.ipj.schedule) : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-24 lg:pb-32">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={HUB_PATH} className="hover:text-primary-500 transition-colors">Cazier Judiciar Online</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">{city.name}</span>
            </nav>

            <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              Cazier judiciar {city.judet}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Cazier Judiciar Online {city.name} — Rapid, Fără Drum la Ghișeu
            </h1>

            <p className="text-lg text-white/85 leading-relaxed mb-8">
              {city.localContext} Prin eGhișeul.ro obții cazierul judiciar din {city.name} fără să stai
              la coadă: depunem cererea la IPJ {city.judet} în numele tău și primești documentul prin
              curier sau pe email.
            </p>

            <p className="text-sm font-medium text-white/70 mb-3">Comandă direct cazierul tău — de la {PRICE} RON:</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href={ORDER_PF}>
                  <Users className="mr-2 w-5 h-5" aria-hidden="true" />
                  Persoană fizică
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href={ORDER_PJ}>
                  <Building2 className="mr-2 w-5 h-5" aria-hidden="true" />
                  Persoană juridică (firmă)
                </Link>
              </Button>
            </div>
            <Link href={HUB_PATH} className="inline-block mt-4 text-sm text-white/70 hover:text-primary-500 transition-colors">
              Vezi toate detaliile serviciului →
            </Link>
          </div>
        </header>

        {/* Local IPJ office — anti-thin anchor, overlaps the hero */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20 rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-1">
                Cazier judiciar {city.name} la ghișeu{city.ipj ? ` — sediul IPJ ${city.judet}` : ''}
              </h2>
              {city.ipj ? (
              <>
              <p className="text-sm text-neutral-600 mb-6">
                La ghișeu, cazierul se obține de la biroul de specialitate din cadrul IPJ {city.judet}.
                Mai jos găsești datele oficiale — sau eviți complet drumul comandând online.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-secondary-900">{city.ipj.name}</h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-neutral-700">
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                      {city.ipj.address}
                    </li>
                    {city.ipj.phone && (
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <a href={`tel:${city.ipj.phone.replace(/\s/g, '')}`} className="hover:text-primary-700">
                          {city.ipj.phone}
                        </a>
                      </li>
                    )}
                    {city.ipj.website && (
                      <li className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <a
                          href={city.ipj.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-700 font-medium hover:text-primary-800"
                        >
                          Pagina oficială IPJ {city.judet}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                {scheduleRows.length > 0 && (
                  <div className="md:border-l md:border-neutral-200 md:pl-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-secondary-900">Program cu publicul</h3>
                    </div>
                    <table className="w-full text-sm text-neutral-700">
                      <tbody>
                        {scheduleRows.map(([day, hours]) => (
                          <tr key={day} className="border-b border-neutral-100 last:border-0">
                            <td className="py-1.5 pr-4 font-medium">{day}</td>
                            <td className="py-1.5 text-right tabular-nums">{hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-5">
                Date publice, preluate de pe pagina oficială a IPJ {city.judet}. Programul se poate
                modifica — verifică pe site-ul instituției înainte de deplasare. Cu eGhișeul.ro nu mai
                depinzi de program.
              </p>
              </>
              ) : (
                <p className="text-neutral-700 leading-relaxed">{city.officeNote}</p>
              )}
            </div>
          </div>
        </section>

        {/* Ce este + valabilitate */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
              Ce este cazierul judiciar și de ce ai nevoie de el în {city.name}
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Cazierul judiciar este documentul care atestă dacă o persoană are sau nu
                antecedente penale. Este eliberat de <strong>Poliția Română</strong> (Inspectoratul de
                Poliție Județean — IPJ {city.judet}, parte din IGPR) și are aceeași valoare legală
                indiferent dacă îl obții la ghișeu sau online prin împuternicire.
              </p>
              <p>
                <strong>Valabilitate:</strong> de regulă <strong>6 luni</strong> de la data emiterii.
                Unele instituții pot cere însă un certificat mai recent (uneori emis în ultimele 30 de
                zile), așa că merită să verifici cerința exactă a celui care ți-l solicită.
              </p>
              <p>
                Cazierul judiciar nu trebuie confundat cu <strong>certificatul de integritate
                comportamentală</strong> (necesar pentru lucrul cu minorii) — sunt documente diferite,
                cu scopuri diferite.
              </p>
            </div>
          </div>
        </section>

        {/* Situații în care ai nevoie */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
              Când ai nevoie de cazier judiciar în {city.name}
            </h2>
            {anchors && (
              <p className="text-neutral-700 leading-relaxed mb-6">
                În {city.name}, cazierul judiciar este cerut frecvent pentru angajare la{' '}
                {anchors} și pentru dosarele descrise mai jos.
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {USE_CASES.map((u) => (
                <div key={u.title} className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <u.icon className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-secondary-900">{u.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Acte necesare */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">
              Acte necesare pentru cazier judiciar online în {city.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-secondary-900">Persoane fizice</h3>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {ACTE_PF.map((a) => (
                    <li key={a} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {a}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <Link href={ORDER_PF} className="text-primary-700 font-semibold hover:underline">Comandă pentru persoană fizică →</Link>
                  <Link href={PF_PAGE} className="text-neutral-500 hover:text-primary-700">detalii PF</Link>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-secondary-900">Persoane juridice</h3>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {ACTE_PJ.map((a) => (
                    <li key={a} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {a}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <Link href={ORDER_PJ} className="text-primary-700 font-semibold hover:underline">Comandă pentru firmă →</Link>
                  <Link href={PJ_PAGE} className="text-neutral-500 hover:text-primary-700">detalii PJ</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preț și livrare */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
              Preț și timp de livrare în {city.name}
            </h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Cazierul judiciar pentru persoane fizice pornește de la <strong>{PRICE} RON</strong>, cu
              livrare standard în <strong>2-4 zile lucrătoare</strong>. Pentru situații urgente există
              opțiunea de procesare prioritară. Costul acoperă întocmirea și depunerea cererii prin
              împuternicire, taxele și livrarea documentului.
            </p>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="font-bold text-secondary-900 mb-2">Servicii suplimentare disponibile</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-neutral-700">
                {['Certificat de integritate comportamentală', 'Traducere autorizată', 'Apostilă de la Haga', 'Livrare prin curier rapid'].map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Online vs ghișeu */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">
              Online vs. ghișeu — cum e mai simplu în {city.name}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100 text-secondary-900">
                    <th className="text-left font-bold p-3"></th>
                    <th className="text-left font-bold p-3">Online (eGhișeul.ro)</th>
                    <th className="text-left font-bold p-3">La ghișeu (IPJ)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="border-t border-neutral-200">
                      <td className="p-3 font-medium text-secondary-900">{row.label}</td>
                      <td className="p-3 text-neutral-700">{row.online}</td>
                      <td className="p-3 text-neutral-600">{row.ghiseu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cum obții — pași */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">
              Cum obții cazierul online în {city.name}
            </h2>
            <ol className="grid sm:grid-cols-2 gap-4">
              {STEPS.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 text-secondary-900 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-neutral-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
              {BENEFITS.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" /> {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Reabilitare / ștergere cazier */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
              Reabilitare și ștergere cazier judiciar
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Dacă figurezi cu o mențiune în cazier, aceasta poate fi ștearsă prin{' '}
                <strong>reabilitare</strong>. Există două forme: <strong>reabilitarea de drept</strong>,
                care operează automat după trecerea unui anumit termen de la executarea pedepsei, și{' '}
                <strong>reabilitarea judecătorească</strong>, obținută printr-o cerere la instanță.
              </p>
              <p>
                După reabilitare, mențiunile nu mai apar în cazierul judiciar obișnuit (cel cerut de
                angajatori). Termenele și condițiile diferă în funcție de tipul și durata pedepsei,
                așa că, dacă nu ești sigur de situația ta, primul pas este să obții cazierul și să
                verifici ce mențiuni există.
              </p>
              <p>
                Te putem ajuta să obții cazierul judiciar din {city.name} pentru a verifica situația
                ta actuală, rapid și fără drum la ghișeu.
              </p>
            </div>
          </div>
        </section>

        {/* Diaspora */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">
                Cazier judiciar pentru românii din diaspora
              </h2>
            </div>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Dacă ești plecat din {city.name} la muncă sau la studii în străinătate, nu trebuie să
                te întorci în țară pentru un cazier judiciar. Depunem cererea la IPJ {city.judet} în
                numele tău, pe bază de împuternicire semnată online, și îți trimitem documentul oriunde
                te afli — prin curier internațional sau în format electronic.
              </p>
              <p>
                Pentru folosirea cazierului în fața autorităților străine, ai de obicei nevoie de{' '}
                <strong>apostilă de la Haga</strong> și de o <strong>traducere autorizată</strong> — pe
                amândouă le putem gestiona pentru tine, ca să primești un dosar complet, acceptat la
                ambasade, angajatori și instituții din străinătate.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ — generic + local */}
        <ServiceFAQ
          title={`Întrebări frecvente — cazier judiciar ${city.name}`}
          faqs={[...genericFaq(city.name), ...city.localFaq]}
        />

        {/* Other cities */}
        {otherCities.length > 0 && (
          <section className="py-12 lg:py-16 bg-white">
            <div className="container mx-auto px-4 max-w-[820px]">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-4">
                Cazier judiciar și în alte orașe
              </h2>
              <div className="flex flex-wrap gap-3">
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`${HUB_PATH}${c.slug}/`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary-600" /> Cazier judiciar {c.name}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-neutral-600 mt-5">
                Indiferent de localitate, comanzi online prin{' '}
                <Link href={HUB_PATH} className="text-primary-700 font-medium hover:underline">
                  serviciul de cazier judiciar
                </Link>{' '}
                — depunem cererea la IPJ-ul competent în numele tău.
              </p>

              <h3 className="text-base font-bold text-secondary-900 mt-8 mb-3">Alte documente utile</h3>
              <div className="flex flex-wrap gap-3">
                {RELATED_SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary-600" /> {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Surse oficiale */}
        <section className="py-8 bg-neutral-50 border-t border-neutral-200">
          <div className="container mx-auto px-4 max-w-[820px]">
            <p className="text-xs text-neutral-500">
              Surse oficiale:{' '}
              <a href="https://www.politiaromana.ro/" target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">Poliția Română</a>
              {city.ipj?.website && (
                <>
                  {' · '}
                  <a href={city.ipj.website} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">IPJ {city.judet} — cazier judiciar</a>
                </>
              )}
              . Informațiile despre ghișeu sunt date publice și se pot modifica; verifică pe site-ul
              instituției înainte de deplasare.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-14 lg:py-20 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px] text-center">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">
              Comandă cazierul judiciar din {city.name} acum
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Fără drum la IPJ {city.judet}, fără cozi. Completezi în câteva minute și primești
              documentul prin curier sau pe email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <Button
                asChild
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href={ORDER_PF}>
                  <Users className="mr-2 w-5 h-5" aria-hidden="true" />
                  Persoană fizică
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href={ORDER_PJ}>
                  <Building2 className="mr-2 w-5 h-5" aria-hidden="true" />
                  Persoană juridică (firmă)
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
