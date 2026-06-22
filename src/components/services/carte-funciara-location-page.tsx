import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, CheckCircle, Building2, ChevronRight, FileText, Home, Landmark, Scale, Coins } from 'lucide-react';
import { OrderButton } from '@/components/services/order-button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { Footer } from '@/components/home/footer';
import { buildLocationPageGraph } from '@/lib/seo/locations';
import type { OcpiCounty } from '@/lib/seo/locations/ocpi';

const HUB_PATH = '/servicii/extras-de-carte-funciara/';
const ORDER = '/comanda/extras-carte-funciara';
const PRICE = 89;

const BENEFITS = ['Fără drum la OCPI', 'Fără cont ANCPI', 'Livrare în câteva minute', 'Plată securizată cu cardul'];

const USE_CASES = [
  { icon: Home, title: 'Vânzare-cumpărare', desc: 'Verifici proprietarul real și eventualele sarcini înainte de a cumpăra; notarul cere extras de autentificare pentru actul de vânzare.' },
  { icon: Coins, title: 'Credit ipotecar', desc: 'Banca solicită extrasul de carte funciară pentru a constitui ipoteca pe imobil.' },
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
  'Completezi datele imobilului online (județ, localitate, număr carte funciară), în câteva minute.',
  'Plătești cu cardul — 89 RON, taxe ANCPI incluse, fără cont ANCPI.',
  'Interogăm sistemul oficial ANCPI (e-Terra) în numele tău.',
  'Primești extrasul de carte funciară oficial, pe email, în câteva minute.',
];

function faqs(judet: string, office: string) {
  return [
    { q: 'Cât durează obținerea extrasului de carte funciară online?', a: 'Prin eGhișeul.ro, de regulă câteva minute — interogăm direct sistemul oficial ANCPI și primești extrasul pe email.' },
    { q: `Trebuie să merg la ${office}?`, a: `Nu. Extrasul de carte funciară de informare se obține integral online, fără drum la ${office} și fără cont ANCPI. La ghișeu mergi doar dacă ai nevoie de servicii care necesită prezență fizică.` },
    { q: 'Ce conține extrasul de carte funciară?', a: 'Datele de identificare ale imobilului (suprafață, adresă, număr cadastral), proprietarii înscriși și cotele lor, precum și sarcinile — ipoteci, sechestre, servituți, interdicții.' },
    { q: 'Care e diferența dintre extrasul de informare și cel de autentificare?', a: 'Extrasul de informare poate fi cerut de oricine, online, și are caracter informativ. Extrasul de autentificare se obține prin notar pentru încheierea unui act (vânzare), blochează temporar cartea funciară și are valabilitate scurtă.' },
    { q: 'Documentul este oficial?', a: `Da. Extrasul provine din sistemul oficial ANCPI și este același document gestionat de ${office} (Oficiul de Cadastru și Publicitate Imobiliară ${judet}).` },
  ];
}

export function CarteFunciaraLocationPage({ county, others }: { county: OcpiCounty; others: { slug: string; judet: string }[] }) {
  const path = `${HUB_PATH}${county.slug}/`;
  const title = `Extras Carte Funciară Online ${county.judet}`;
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
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-24 lg:pb-32">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={HUB_PATH} className="hover:text-primary-500 transition-colors">Extras Carte Funciară</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">{county.judet}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Extras Carte Funciară Online {county.judet}
            </h1>
            <p className="text-lg text-white/85 leading-relaxed mb-6">
              Obține extrasul de carte funciară pentru un imobil din județul {county.judet} fără drum la {county.office}.
              100% online, fără cont ANCPI, livrare pe email în câteva minute. <strong className="text-white">{PRICE} RON</strong>, taxe incluse.
            </p>
            <div className="flex flex-wrap gap-3">
              <OrderButton href={ORDER}>Comandă extras CF {county.judet}</OrderButton>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-1.5 text-sm text-white/75">
                  <CheckCircle className="h-4 w-4 text-primary-400" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* OCPI office card */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20 rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-secondary-900">{county.office}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">{county.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <a href={`tel:${county.phone.replace(/[ ,].*/, '').replace(/\s/g, '')}`} className="text-neutral-700 hover:text-primary-600">{county.phone}</a>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${county.email}`} className="text-neutral-700 hover:text-primary-600">{county.email}</a>
                </div>
                {county.program && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Depunere: {county.program.depunere}{county.program.eliberare ? ` · Eliberare: ${county.program.eliberare}` : ''}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-4">
                Cu eGhișeul.ro nu trebuie să te deplasezi la {county.office} — extrasul de informare vine online, pe email.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[760px] prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-secondary-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-li:marker:text-primary-500 prose-a:text-primary-700 prose-a:font-medium prose-strong:text-secondary-900">
            <h2>Ce este extrasul de carte funciară</h2>
            <p>
              Extrasul de carte funciară este documentul oficial emis de ANCPI (Agenția Națională de Cadastru și
              Publicitate Imobiliară) care arată <strong>situația juridică a unui imobil</strong>: cine este proprietarul,
              suprafața și datele cadastrale, precum și sarcinile înscrise — ipoteci, sechestre, servituți sau interdicții.
              Pentru imobilele din județul {county.judet}, evidența este ținută de {county.office}.
            </p>

            <h2>Tipuri de extras de carte funciară</h2>
            <ul>
              <li><strong>Extras de informare</strong> — poate fi cerut de oricine, online; arată situația juridică la zi. Acesta se obține prin eGhișeul.ro, fără drum la ghișeu.</li>
              <li><strong>Extras de autentificare</strong> — se obține prin notar pentru încheierea unui act (vânzare); blochează temporar cartea funciară și are valabilitate scurtă.</li>
            </ul>

            <h2>La ce îți folosește în județul {county.judet}</h2>
            <div className="not-prose grid sm:grid-cols-2 gap-4 my-6">
              {USE_CASES.map((u) => (
                <div key={u.title} className="rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><u.icon className="h-4 w-4" /></span>
                    <span className="font-bold text-secondary-900">{u.title}</span>
                  </div>
                  <p className="text-sm text-neutral-600">{u.desc}</p>
                </div>
              ))}
            </div>

            <h2>Online vs. la ghișeu OCPI {county.judet}</h2>
            <div className="not-prose overflow-hidden rounded-xl border border-neutral-200 my-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100 text-secondary-900">
                    <th className="text-left px-4 py-2.5 font-semibold"></th>
                    <th className="text-left px-4 py-2.5 font-semibold">Online (eGhișeul)</th>
                    <th className="text-left px-4 py-2.5 font-semibold">La ghișeu OCPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {COMPARISON.map((r) => (
                    <tr key={r.label}>
                      <td className="px-4 py-2.5 text-neutral-700">{r.label}</td>
                      <td className="px-4 py-2.5 font-medium text-secondary-900">{r.online}</td>
                      <td className="px-4 py-2.5 text-neutral-600">{r.ghiseu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Cum obții extrasul online, în {county.judet}</h2>
            <ol>
              {STEPS.map((s) => (<li key={s}>{s}</li>))}
            </ol>

            <h2>Preț</h2>
            <p>
              Extrasul de carte funciară de informare costă <strong>{PRICE} RON</strong> prin eGhișeul.ro,
              <strong> taxe ANCPI incluse</strong> — fără cont ANCPI și fără taxă de urgență. Plătești o singură dată, cu
              cardul, iar documentul ajunge pe email în câteva minute.
            </p>

            <p>
              Vezi și <Link href={HUB_PATH}>pagina principală Extras Carte Funciară</Link> sau{' '}
              <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link> (util la vânzarea unui imobil
              din {county.judet}).
            </p>

            <p className="text-sm text-neutral-500">
              Informații orientative. Datele {county.office} sunt preluate din surse oficiale ANCPI; programul de lucru
              poate fi modificat — verifică pe site-ul oficial înainte de o eventuală deplasare.
            </p>
          </div>
        </article>

        <ServiceFAQ title="Întrebări frecvente" faqs={faqs(county.judet, county.office)} />

        {/* Other counties */}
        {others.length > 0 && (
          <section className="py-10 bg-neutral-50 border-t border-neutral-100">
            <div className="container mx-auto px-4 max-w-[820px]">
              <h2 className="flex items-center gap-2 text-lg font-bold text-secondary-900 mb-4">
                <Landmark className="h-5 w-5 text-primary-600" /> Extras carte funciară în alte județe
              </h2>
              <div className="flex flex-wrap gap-2">
                {others.map((o) => (
                  <Link key={o.slug} href={`${HUB_PATH}${o.slug}/`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-colors">
                    {o.judet}
                  </Link>
                ))}
              </div>
              <Link href={HUB_PATH} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                Vezi serviciul Extras Carte Funciară <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
