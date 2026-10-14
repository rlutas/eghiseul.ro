import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Percent,
  Search,
  ShieldCheck,
  Tags,
  XCircle,
} from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { FirmCheck } from '@/components/tools/firm-check';
import { buildPageMetadata, BASE_URL, serviceUrl } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { getServiceCards } from '@/lib/articles/service-cards';
import { ArticleServiceCards } from '@/components/articole/article-service-cards';

const PAGE_PATH = '/tools/verificare-firma-cui/';

const DESCRIPTION =
  'Verifică gratuit o firmă după CUI: dacă e activă, inactivă sau radiată, dacă plătește TVA ' +
  'și ce cifră de afaceri, profit și angajați a declarat. Date ANAF, fără cont.';
const DATE_PUBLISHED = '2026-10-14';
const DATE_MODIFIED = '2026-10-14';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'Verificare firmă după CUI, gratuit: stare, TVA, bilanț',
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/default.png',
});

const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

const FAQS = [
  {
    q: 'De unde vin datele?',
    a: 'Din două servicii publice ale ANAF: registrul plătitorilor de TVA (stare, TVA, TVA la încasare, adresă, cod CAEN) și bilanțurile depuse de firme (cifră de afaceri, profit sau pierdere, număr mediu de angajați). Le citim în momentul verificării, nu dintr-o copie veche.',
  },
  {
    q: 'De ce nu văd asociații și administratorii?',
    a: 'Pentru că ANAF nu îi publică. Asociații, administratorii, capitalul social și punctele de lucru sunt în Registrul Comerțului, iar documentul oficial care le arată este certificatul constatator emis de ONRC.',
  },
  {
    q: 'Ce înseamnă „inactivă fiscal”?',
    a: 'Că ANAF a declarat firma inactivă, de regulă pentru că nu și-a depus declarațiile sau nu funcționează la sediul declarat. Facturile primite de la o firmă inactivă pot avea probleme la deducerea TVA și a cheltuielilor, așa că merită verificat înainte de a lucra cu ea.',
  },
  {
    q: 'De ce nu apare bilanțul?',
    a: 'Bilanțul pe anul trecut se depune până la sfârșitul lui mai, deci firmele înființate de curând nu au încă unul. PFA-urile și întreprinderile individuale nu depun bilanț. Lipsește și când firma nu și-a depus situațiile financiare.',
  },
  {
    q: 'Verificarea e gratuită?',
    a: 'Da, fără cont și fără limită pentru uz normal. Plătești doar dacă ai nevoie de certificatul constatator, documentul ONRC pe care îl cer băncile, notarii și autoritățile.',
  },
];

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    {
      ...breadcrumbNode([
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Instrumente', url: `${BASE_URL}/tools/` },
        { name: 'Verificare firmă după CUI', url: PAGE_URL },
      ]),
      '@id': `${PAGE_URL}#breadcrumb`,
    },
    {
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#tool`,
      name: 'Verificare firmă după CUI',
      url: PAGE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'ro-RO',
      isAccessibleForFree: true,
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      isPartOf: { '@id': `${BASE_URL}/#website` },
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'RON' },
      description: DESCRIPTION,
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

export default async function VerificareFirmaPage() {
  const constatatorHref = serviceUrl('certificat-constatator');
  const { cards, guides } = await getServiceCards([
    {
      slug: 'certificat-constatator',
      label: 'Certificat constatator ONRC',
      desc: 'Asociații, administratorii, capitalul și punctele de lucru ale firmei. Cerut de bănci, notari și la licitații.',
    },
    {
      href: '/cele-4-tipuri-de-certificat-constatator-online/',
      label: 'Cele 4 tipuri de certificat constatator',
      desc: 'Pe firmă, cu istoric, pentru fonduri sau insolvență: pe care îl ceri.',
    },
    { href: '/calculator/taxe-srl/', label: 'Calculator taxe SRL', desc: 'Impozit pe profit sau pe venit, contribuții și dividende.' },
    { href: '/calculator/dividende/', label: 'Calculator dividende', desc: 'Cât rămâne net după impozit și CASS.' },
  ]);
  const price = cards[0] ? `${cards[0].priceWithVat.toLocaleString('ro-RO')} lei cu TVA` : '89 lei cu TVA';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-24 lg:pb-32">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link href="/tools/" className="hover:text-primary-500 transition-colors">Instrumente</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white/80">Verificare firmă după CUI</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Search className="w-3.5 h-3.5" aria-hidden="true" /> Instrument gratuit
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Verificare firmă după CUI
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Scrii CUI-ul și vezi dacă firma e activă, dacă plătește TVA și ce cifră de afaceri, profit și angajați
              a declarat în ultimii doi ani. Gratuit, din datele ANAF.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
              {['Gratuit, fără cont', 'Date publice ANAF, citite la cerere', 'Bilanț 2024 și 2025'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary-500" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section className="bg-white pb-14 lg:pb-20">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20">
              <FirmCheck constatatorHref={constatatorHref} constatatorPrice={price} />
            </div>
          </div>
        </section>

        {/* Ce afli — tot pe alb, separat doar prin linie și spațiu */}
        <section className="bg-white border-t border-neutral-100 py-14 lg:py-20" aria-labelledby="ce-afli">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="max-w-2xl">
              <h2 id="ce-afli" className="text-2xl sm:text-3xl font-extrabold text-secondary-900 text-balance">
                Ce afli despre o firmă după CUI
              </h2>
              <p className="mt-3 text-neutral-700 leading-relaxed">
                Patru lucruri pe care le verifici înainte să semnezi un contract, să plătești un avans sau să
                accepți o factură.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Dacă firma mai funcționează',
                  text: 'Activă, inactivă fiscal sau radiată, plus data de la care s-a schimbat starea.',
                },
                {
                  icon: Percent,
                  title: 'Dacă plătește TVA',
                  text: 'De când e înregistrată în scopuri de TVA și dacă aplică TVA la încasare.',
                },
                {
                  icon: Tags,
                  title: 'Ce face firma',
                  text: 'Codul CAEN principal cu denumirea lui, forma juridică, sediul și data înregistrării.',
                },
                {
                  icon: BarChart3,
                  title: 'Cât de mare e',
                  text: 'Cifra de afaceri, profitul sau pierderea și numărul mediu de angajați, pe ultimii doi ani.',
                },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <c.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-secondary-900">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cum citești starea */}
        <section className="bg-white border-t border-neutral-100 py-14 lg:py-20" aria-labelledby="stare">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="max-w-2xl">
              <h2 id="stare" className="text-2xl sm:text-3xl font-extrabold text-secondary-900 text-balance">
                Activă, inactivă sau radiată: ce înseamnă pentru tine
              </h2>
              <p className="mt-3 text-neutral-700 leading-relaxed">
                Starea e primul lucru de verificat. Celelalte date contează doar dacă firma mai e în circuit.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: CheckCircle,
                  tone: 'border-green-200 bg-green-50',
                  iconCls: 'text-green-700',
                  title: 'Activă',
                  text: 'Firma e înregistrată și nu apare în registrul contribuabililor inactivi. Poți lucra cu ea; verifică și TVA-ul și bilanțul.',
                },
                {
                  icon: AlertTriangle,
                  tone: 'border-amber-200 bg-amber-50',
                  iconCls: 'text-amber-700',
                  title: 'Inactivă fiscal',
                  text: 'ANAF a scos-o din circuit, de obicei pentru declarații nedepuse sau pentru că nu funcționează la sediu. Facturile ei îți pot crea probleme la deducerea TVA și a cheltuielilor.',
                },
                {
                  icon: XCircle,
                  tone: 'border-red-200 bg-red-50',
                  iconCls: 'text-red-700',
                  title: 'Radiată',
                  text: 'Firma nu mai există. Nu mai poate emite facturi, semna contracte sau primi plăți în nume propriu.',
                },
              ].map((c) => (
                <div key={c.title} className={`rounded-2xl border p-5 ${c.tone}`}>
                  <div className="flex items-center gap-2">
                    <c.icon className={`h-5 w-5 ${c.iconCls}`} aria-hidden="true" />
                    <h3 className="text-base font-bold text-secondary-900">{c.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-800">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pași + ce nu arată */}
        <section className="bg-white border-t border-neutral-100 py-14 lg:py-20" aria-labelledby="pasi">
          <div className="container mx-auto px-4 max-w-[1100px] grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 id="pasi" className="text-2xl sm:text-3xl font-extrabold text-secondary-900 text-balance">
                Cum verifici un partener, pas cu pas
              </h2>
              <ol className="mt-6 space-y-5">
                {[
                  {
                    t: 'Ia CUI-ul de pe factură sau contract',
                    d: 'Codul fiscal apare lângă denumire, uneori cu „RO” în față. Îl poți scrie oricum.',
                  },
                  {
                    t: 'Verifică starea, TVA-ul și bilanțul',
                    d: 'O firmă activă, plătitoare de TVA, cu cifră de afaceri și angajați e un semn bun. Zero peste tot, la o firmă care îți promite o livrare mare, e motiv de întrebări.',
                  },
                  {
                    t: 'Pentru asociați și administratori, cere certificatul constatator',
                    d: 'Acolo vezi cine deține firma și cine o poate reprezenta legal, adică cine are voie să semneze.',
                  },
                ].map((step, i) => (
                  <li key={step.t} className="flex gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary-900 text-sm font-bold text-primary-500">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-secondary-900">{step.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-700">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-neutral-200 p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-secondary-900">Ce nu arată verificarea</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                ANAF nu publică asociații, administratorii, capitalul social sau istoricul modificărilor. Toate
                sunt în Registrul Comerțului, iar documentul care le dovedește e{' '}
                <Link href={constatatorHref} className="font-semibold text-primary-700 underline underline-offset-2">
                  certificatul constatator
                </Link>
                , emis de ONRC: pe el se uită banca la deschiderea contului, notarul la tranzacții și autoritatea
                contractantă la licitații.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                Procesele firmei se caută separat, pe portalul instanțelor, după denumire. Pentru o imagine completă
                a unui partener combini cele trei: datele fiscale de aici, certificatul constatator și dosarele din
                instanță.
              </p>
            </div>
          </div>
        </section>

        <ArticleServiceCards cards={cards} guides={guides} />

        <ServiceFAQ title="Întrebări frecvente" faqs={FAQS} twoColumns={false} />
      </main>

      <Footer />
    </>
  );
}
