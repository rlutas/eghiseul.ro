import Link from 'next/link';
import { ChevronRight, ShieldCheck, Zap, Mail, CheckCircle, Search } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { RovinietaPurchaseForm } from '@/components/rovinieta/rovinieta-purchase-form';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { PrivateServiceNotice } from '@/components/services/private-service-notice';

const PAGE_PATH = '/servicii/rovinieta-online/';
const TITLE = 'Rovinieta Online 2026 — Cumpără și Plătește în 2 Minute';
const DESCRIPTION =
  'Cumpără rovinieta online rapid și sigur, de pe telefon sau PC. Plata rovinietei online cu ' +
  'activare imediată, fără drumuri la ghișeu. Vezi tarifele 2026 pe categorii și perioade.';

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/default.png',
});

const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    {
      ...breadcrumbNode([
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Servicii', url: `${BASE_URL}/servicii/` },
        { name: 'Rovinieta Online', url: PAGE_URL },
      ]),
      '@id': `${PAGE_URL}#breadcrumb`,
    },
    {
      '@type': 'Service',
      '@id': `${PAGE_URL}#service`,
      name: 'Rovinieta Online',
      serviceType: 'Cumpărare rovinietă (vinietă) online',
      url: PAGE_URL,
      areaServed: { '@type': 'Country', name: 'România' },
      description: DESCRIPTION,
      provider: { '@id': `${BASE_URL}/#organization` },
    },
  ],
};

const BADGES = [
  { icon: ShieldCheck, label: 'Plată securizată' },
  { icon: Zap, label: 'Activare instant' },
  { icon: Mail, label: 'Confirmare pe email' },
];

// Categorii de la 1.10.2026 (Ordinul MTI nr. 888/2026). Marfa peste 3,5 t nu mai
// plătește rovinietă (taxă pe km, TollRo); motocicletele sunt scutite.
const CATEGORII = [
  { cod: 'A', desc: 'Autoturisme: transport persoane cu cel mult 8 locuri plus șoferul — categoria celor mai mulți șoferi.' },
  { cod: 'B', desc: 'Vehicule de transport marfă cu masa totală maximă autorizată ≤ 3,5 tone.' },
  { cod: 'C', desc: 'Microbuze și autocare cu 10-23 de locuri (inclusiv șoferul).' },
  { cod: 'D', desc: 'Autobuze și autocare cu peste 23 de locuri.' },
];

// Tarife CNAIR autoturisme (categoria A) de la 1.10.2026, lei cu TVA, după norma de
// poluare (Ordinul MTI nr. 888/2026). Fără comisionul de serviciu.
const TARIFE_A = [
  { perioada: '1 zi', min: '20 lei', e6: '22 lei', max: '29 lei' },
  { perioada: '10 zile', min: '27 lei', e6: '30 lei', max: '39 lei' },
  { perioada: '30 zile', min: '43 lei', e6: '48 lei', max: '62 lei' },
  { perioada: '60 zile', min: '68 lei', e6: '76 lei', max: '99 lei' },
  { perioada: '12 luni', min: '228 lei', e6: '254 lei', max: '330 lei' },
];

const FAQS = [
  { q: 'Cum cumpăr rovinieta online?', a: 'Alegi categoria vehiculului și perioada de valabilitate, introduci numărul de înmatriculare și continui către plata securizată. Rovinieta se activează imediat după plată și primești confirmarea pe email.' },
  { q: 'Plata rovinietei online este sigură?', a: 'Da. Plata se face securizat, cu cardul, pe platforma de checkout. Rovinieta cumpărată este înregistrată oficial în sistemul CNAIR.' },
  { q: 'Cât durează până se activează rovinieta?', a: 'Activarea este imediată după confirmarea plății. Poți alege și o dată de început în viitor, în funcție de când ai nevoie de ea.' },
  { q: 'Ce categorie de rovinietă îmi trebuie?', a: 'Pentru un autoturism obișnuit (sub 3,5 tone) alegi categoria A. Pentru marfă până la 3,5 tone alegi categoria B, iar pentru microbuze și autocare C sau D. Din 1 octombrie 2026 prețul depinde și de norma Euro a mașinii.' },
  { q: 'Pot verifica dacă rovinieta este validă?', a: 'Da. Poți verifica gratuit valabilitatea rovinietei după numărul de înmatriculare cu instrumentul nostru de verificare rovinietă.' },
  { q: 'Ce risc dacă circul fără rovinietă validă?', a: 'Circulația pe drumurile naționale fără rovinietă validă se sancționează cu amendă. De aceea e important să o cumperi din timp și să verifici data de expirare.' },
];

export default function RovinietaOnlinePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero + form */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-32 pb-16 lg:pb-24">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link href="/servicii/" className="hover:text-primary-500 transition-colors">Servicii</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white font-medium">Rovinieta Online</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-extrabold text-white leading-tight mb-5">
                  <span className="text-primary-500">Rovinieta Online</span> 2026 — Cumpără și Plătește în 2 Minute
                </h1>
                <p className="text-lg text-white/85 leading-relaxed mb-7">
                  Cumpără rovinieta online rapid și sigur, direct de pe telefon sau PC. Plata rovinietei online
                  cu valabilitate imediată, fără drumuri la ghișeu și fără timp pierdut.
                </p>
                <ul className="flex flex-wrap gap-3">
                  {BADGES.map((b) => (
                    <li key={b.label} className="flex items-center gap-2 rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2.5 text-sm font-medium text-white">
                      <b.icon className="h-4 w-4 text-primary-400" /> {b.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-auto">
                <RovinietaPurchaseForm />
              </div>
            </div>
          </div>
        </section>

        <PrivateServiceNotice
          institutionLabel="direct pe roviniete.ro, site-ul CNAIR"
          institutionUrl="https://www.roviniete.ro/"
        />


        {/* De ce de aici */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 text-center mb-8">De ce să cumperi rovinieta online de aici?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Zap, title: 'Valabilă Instant', desc: 'Rovinieta devine activă imediat după finalizarea plății. Fără timp de așteptare.' },
                { icon: ShieldCheck, title: 'Plată 100% Securizată', desc: 'Plata prin sisteme bancare certificate, cu autentificare 3D Secure.' },
                { icon: CheckCircle, title: 'De pe Orice Dispozitiv', desc: 'Cumperi rovinieta online de pe telefon, tabletă sau PC. Funcționează oriunde.' },
                { icon: Mail, title: 'Confirmare pe Email', desc: 'Primești dovada plății pe email — document pentru verificarea rovinietei.' },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <c.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{c.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO content + categorii */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-5">Ce este rovinieta și de ce ai nevoie de ea?</h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>Rovinieta</strong> (taxa de drum) este obligatorie pentru toate vehiculele care circulă pe
                drumurile naționale și autostrăzile din România, administrată de <strong>CNAIR</strong>. Este un
                document electronic care atestă plata tarifului de utilizare a drumurilor.
              </p>
              <ul className="space-y-2 list-none pl-0">
                {[
                  'Document electronic din 2010 — nu mai există autocolant pe parbriz.',
                  'Verificarea se face automat, prin camerele CNAIR de pe drumuri.',
                  'Fără rovinietă validă, amenda pornește de la 500 lei pentru autoturisme (250 lei dacă o plătești în 15 zile).',
                  'O cumperi online în 2 minute, cu activare imediată.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900 mt-10 mb-5">Categorii de rovinietă</h2>
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100 text-secondary-900">
                    <th className="text-left px-4 py-2.5 font-semibold w-20">Categorie</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Tip vehicul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {CATEGORII.map((c) => (
                    <tr key={c.cod}>
                      <td className="px-4 py-2.5 font-bold text-secondary-900">{c.cod}</td>
                      <td className="px-4 py-2.5 text-neutral-700">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-neutral-500 mt-3">
              Motocicletele sunt <strong>scutite</strong> de rovinietă. Vehiculele de marfă peste 3,5 tone nu mai
              plătesc rovinietă din 1 octombrie 2026 (taxă pe kilometru, TollRo). Perioadele disponibile sunt
              1 zi, 10 zile, 30 zile, 60 zile și 12 luni.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 mt-10 mb-2">Cât costă rovinieta în 2026 (autoturisme)</h2>
            <p className="text-neutral-700 mb-5">
              De la 1 octombrie 2026 (Ordinul MTI nr. 888/2026) tarifele sunt în lei și depind de norma de poluare
              a mașinii: electric (cel mai mic), Euro 6, Euro 4-5 și Euro 0-3 (cel mai mare). Dacă norma nu se
              poate stabili, vehiculul e încadrat la Euro 0. Tarifele CNAIR pentru categoria A:
            </p>
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100 text-secondary-900">
                    <th className="text-left px-4 py-2.5 font-semibold">Perioadă</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Electric</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Euro 6</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Euro 0-3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {TARIFE_A.map((t) => (
                    <tr key={t.perioada}>
                      <td className="px-4 py-2.5 font-medium text-secondary-900">{t.perioada}</td>
                      <td className="px-4 py-2.5 text-neutral-700">{t.min}</td>
                      <td className="px-4 py-2.5 text-neutral-700">{t.e6}</td>
                      <td className="px-4 py-2.5 text-neutral-700">{t.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-neutral-500 mt-3">
              Euro 4-5 e între Euro 6 și Euro 0-3 (de exemplu 292 lei pe 12 luni). Prețul exact, după norma
              mașinii tale, îl vezi la finalizarea comenzii.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900 mt-10 mb-4">Când începe valabilitatea</h2>
            <p className="text-neutral-700 leading-relaxed">
              Dacă alegi ziua de azi, rovinieta este <strong>activă imediat</strong>, din momentul plății, și
              expiră la ora 24:00 a ultimei zile. Poți alege și o dată de început din viitor (până la 30 de zile în
              avans) — atunci valabilitatea pornește la ora 00:00 a zilei alese.
            </p>

            <div className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 flex items-start gap-3">
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-secondary-800">
                Nu ești sigur dacă mai ai rovinietă validă? <Link href="/tools/verificare-rovinieta-online/" className="font-semibold text-primary-700 underline">Verifică gratuit valabilitatea rovinietei</Link> după
                numărul de înmatriculare, înainte să cumperi una nouă.
              </p>
            </div>
          </div>
        </section>

        <ServiceFAQ title="Întrebări Frecvente — Rovinieta Online" faqs={FAQS} />
      </main>

      <Footer />
    </>
  );
}
