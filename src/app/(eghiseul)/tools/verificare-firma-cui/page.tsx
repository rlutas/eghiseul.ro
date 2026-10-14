import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';
import { FirmCheck } from '@/components/tools/firm-check';
import { buildPageMetadata, BASE_URL, serviceUrl } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { createPublicClient } from '@/lib/supabase/public';

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

async function constatatorPrice(): Promise<string> {
  try {
    const { data } = await createPublicClient()
      .from('services')
      .select('base_price')
      .eq('slug', 'certificat-constatator')
      .single();
    const p = Number(data?.base_price);
    return p > 0 ? `${Number.isInteger(p) ? p : p.toFixed(2).replace('.', ',')} lei cu TVA` : '89 lei cu TVA';
  } catch {
    return '89 lei cu TVA';
  }
}

export default async function VerificareFirmaPage() {
  const price = await constatatorPrice();
  const constatatorHref = serviceUrl('certificat-constatator');

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
          </div>
        </header>

        <section className="bg-white pb-12">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20">
              <FirmCheck constatatorHref={constatatorHref} constatatorPrice={price} />
            </div>
          </div>
        </section>

        <article className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-secondary-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-700 prose-p:leading-relaxed prose-li:text-neutral-700 prose-li:marker:text-primary-500 prose-a:text-primary-700 prose-a:font-medium prose-strong:text-secondary-900">
              <h2>Ce verifici înainte să lucrezi cu o firmă</h2>
              <p>
                Prima întrebare e dacă firma mai există pentru fisc. „Activă” înseamnă că e înregistrată și nu e
                în registrul contribuabililor inactivi. „Inactivă fiscal” e semnalul cel mai important: ANAF a
                scos-o din circuit, de obicei pentru declarații nedepuse sau pentru că nu funcționează la sediu,
                iar facturile ei îți pot crea probleme la deducerea TVA. „Radiată” înseamnă că firma nu mai
                există.
              </p>
              <p>
                Apoi TVA-ul. Dacă firma e plătitoare de TVA, factura ei trebuie să conțină TVA; dacă aplică TVA la
                încasare, dreptul tău de deducere apare abia când plătești.
              </p>
              <p>
                Bilanțul spune cât de mare e firma de fapt: cifra de afaceri, profitul sau pierderea și numărul
                mediu de angajați, așa cum le-a declarat. O firmă cu cifră de afaceri zero și fără angajați care
                îți promite o livrare mare merită întrebată în plus.
              </p>

              <h2>Ce nu arată verificarea și unde găsești</h2>
              <p>
                ANAF nu publică asociații, administratorii, capitalul social sau istoricul modificărilor. Toate
                sunt în Registrul Comerțului, iar documentul care le dovedește este{' '}
                <Link href={constatatorHref}>certificatul constatator</Link>, emis de ONRC. Pe el se uită banca la
                deschiderea contului, notarul la tranzacții și autoritatea contractantă la licitații. Diferența
                dintre tipurile de certificat (pe firmă, cu istoric, pentru fonduri, insolvență) e explicată în{' '}
                <Link href="/cele-4-tipuri-de-certificat-constatator-online/">ghidul despre cele 4 tipuri</Link>.
              </p>
              <p>
                Pentru procese, verificarea se face separat, pe portalul instanțelor, după numele firmei. Pentru o
                imagine completă a unui partener, combini cele trei: datele fiscale de aici, certificatul
                constatator și dosarele din instanță.
              </p>
            </div>
          </div>
        </article>

        <ServiceFAQ title="Întrebări frecvente" faqs={FAQS} twoColumns={false} />
      </main>

      <Footer />
    </>
  );
}
