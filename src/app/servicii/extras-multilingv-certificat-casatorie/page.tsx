import Link from 'next/link';
import { ChevronRight, Globe, CheckCircle, FileText, Plane } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';

const PAGE_PATH = '/servicii/extras-multilingv-certificat-casatorie/';
const TITLE = 'Extras Multilingv Certificat de Căsătorie 2026 — pentru UE, Fără Traducere';
const DESCRIPTION =
  'Extrasul multilingv de pe certificatul de căsătorie (formular standard UE) e recunoscut în ' +
  'Uniunea Europeană fără traducere și fără apostilă. Vezi când îți trebuie și cum îl obții.';

export const metadata = buildPageMetadata({ title: TITLE, description: DESCRIPTION, path: PAGE_PATH, ogImage: '/og/services/certificat-casatorie.png' });

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
        { name: 'Extras Multilingv Certificat de Căsătorie', url: PAGE_URL },
      ]),
      '@id': `${PAGE_URL}#breadcrumb`,
    },
    {
      '@type': 'Service',
      '@id': `${PAGE_URL}#service`,
      name: 'Extras Multilingv Certificat de Căsătorie',
      serviceType: 'Document de stare civilă pentru uz în străinătate',
      url: PAGE_URL,
      areaServed: { '@type': 'Country', name: 'România' },
      description: DESCRIPTION,
      provider: { '@id': `${BASE_URL}/#organization` },
    },
  ],
};

const FAQS = [
  { q: 'Ce este extrasul multilingv de pe certificatul de căsătorie?', a: 'Este un formular standard multilingv (introdus prin Regulamentul UE 2016/1191) care însoțește certificatul de căsătorie și redă datele în mai multe limbi oficiale ale UE, pentru a fi folosit în alt stat membru fără traducere.' },
  { q: 'Înlocuiește traducerea și apostila?', a: 'În interiorul Uniunii Europene, formularul standard multilingv elimină nevoia de traducere și de apostilă pentru certificatul de căsătorie. Pentru țări din afara UE rămâne necesară apostila de la Haga + traducerea legalizată.' },
  { q: 'Când am nevoie de el?', a: 'Când prezinți certificatul de căsătorie unei autorități dintr-un alt stat UE: permis de ședere, regim matrimonial, dosare administrative, recunoașterea căsătoriei în altă țară.' },
  { q: 'De unde se obține?', a: 'De la serviciul de stare civilă al primăriei care deține actul de căsătorie, eliberat împreună cu certificatul/duplicatul. Prin eGhișeul.ro depunem cererea în numele tău și îți livrăm documentul, fără drum la ghișeu.' },
  { q: 'Cât costă și cât durează?', a: 'Taxa de stare civilă este mică (sau gratuită la prima eliberare). Termenul depinde de primărie; îți comunicăm estimarea la plasarea comenzii.' },
];

export default function ExtrasMultilingvCasatoriePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-20 lg:pb-28">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link href="/servicii/" className="hover:text-primary-500 transition-colors">Servicii</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white/80">Extras Multilingv Certificat de Căsătorie</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" /> Recunoscut în UE
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-white leading-tight mb-5">
              Extras Multilingv de pe Certificatul de Căsătorie
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Formularul standard multilingv care însoțește certificatul de căsătorie și îl face valabil în Uniunea
              Europeană <strong className="text-white">fără traducere și fără apostilă</strong>.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/comanda/certificat-casatorie/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-colors hover:bg-primary-600"
              >
                Comandă acum
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/80">
                În formular, bifează opțiunea „Extras Multilingv” (+399 RON)
              </span>
            </div>
          </div>
        </header>

        <article className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[760px] prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-secondary-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-li:marker:text-primary-500 prose-a:text-primary-700 prose-a:font-medium prose-strong:text-secondary-900">
            <h2>Ce este extrasul multilingv</h2>
            <p>
              Extrasul multilingv este un <strong>formular standard multilingv</strong> introdus prin
              <strong> Regulamentul (UE) 2016/1191</strong>, care se atașează certificatului de căsătorie și redă
              datele în limbile oficiale ale statelor membre, pentru a fi folosit într-un alt stat UE fără traducere.
            </p>

            <h2>Când îți trebuie</h2>
            <ul>
              <li>Permis de ședere sau dosar de muncă pentru familie într-o țară UE</li>
              <li>Recunoașterea căsătoriei și regimul matrimonial în străinătate</li>
              <li>Dosare administrative (alocații, asigurări, acte) în UE</li>
              <li>Schimbarea numelui după căsătorie în actele dintr-un alt stat membru</li>
            </ul>

            <div className="not-prose grid sm:grid-cols-3 gap-4 my-6">
              {[
                { icon: Globe, t: 'Valabil în UE', d: 'Recunoscut în toate statele membre.' },
                { icon: CheckCircle, t: 'Fără traducere', d: 'Formularul redă datele multilingv.' },
                { icon: Plane, t: 'Fără apostilă (în UE)', d: 'Scutit de apostilă între statele UE.' },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-neutral-200 p-4">
                  <c.icon className="h-5 w-5 text-primary-600 mb-2" aria-hidden="true" />
                  <p className="font-bold text-secondary-900 text-sm">{c.t}</p>
                  <p className="text-sm text-neutral-600">{c.d}</p>
                </div>
              ))}
            </div>

            <div className="not-prose my-8 rounded-2xl border border-primary-200 bg-primary-50/60 p-6">
              <p className="font-bold text-secondary-900">Cum comanzi extrasul multilingv</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-700">
                <li>Pornește comanda pentru <strong>certificatul de căsătorie</strong> (butonul de mai jos).</li>
                <li>La pasul „Opțiuni”, bifează <strong>„Extras Multilingv” (+399 RON)</strong>.</li>
                <li>Primești certificatul împreună cu extrasul multilingv.</li>
              </ol>
              <Link
                href="/comanda/certificat-casatorie/"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-bold text-secondary-900 no-underline shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-colors hover:bg-primary-600"
              >
                Comandă certificat + extras multilingv
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <h2>Înlocuiește traducerea și apostila?</h2>
            <p>
              <strong>Da, în interiorul Uniunii Europene.</strong> Formularul standard multilingv elimină nevoia de
              traducere autorizată și de apostilă pentru certificatul de căsătorie folosit în alt stat UE. Pentru
              țările din <strong>afara UE</strong>, rămâne necesară apostila de la Haga + traducerea legalizată.
            </p>

            <h2>Cum îl obții</h2>
            <p>
              Extrasul multilingv se eliberează de <strong>serviciul de stare civilă al primăriei</strong> care
              deține actul de căsătorie, împreună cu certificatul sau cu un{' '}
              <Link href="/duplicat-certificat-de-casatorie/">duplicat de certificat de căsătorie</Link>. Prin
              eGhișeul.ro depunem cererea în numele tău și îți livrăm documentul, fără drum la ghișeu.
            </p>

            <div className="not-prose rounded-2xl border border-primary-200 bg-primary-50/60 p-5 flex items-start gap-3 mt-6">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-secondary-800">
                Ai nevoie întâi de certificat? Vezi serviciul{' '}
                <Link href="/servicii/eliberare-certificat-de-casatorie/" className="font-semibold text-primary-700 underline">eliberare certificat de căsătorie</Link>{' '}
                — apoi solicităm și extrasul multilingv pentru uz în străinătate.
              </p>
            </div>
          </div>
        </article>

        <ServiceFAQ title="Întrebări Frecvente — Extras Multilingv" faqs={FAQS} />
      </main>

      <Footer />
    </>
  );
}
