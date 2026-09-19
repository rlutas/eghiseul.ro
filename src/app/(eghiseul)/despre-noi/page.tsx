import Link from 'next/link';
import {
  ChevronRight, Building2, Scale, Ruler, Star, ShieldCheck, Mail, Phone, MapPin,
  ArrowRight, FileCheck2, CheckCircle, XCircle,
} from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata, BASE_URL, ORGANIZATION, SOCIAL_PROOF, SITE_AUTHOR } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { authorNode } from '@/lib/seo/author';

const PAGE_PATH = '/despre-noi/';

export const metadata = buildPageMetadata({
  title: 'Despre noi — cine suntem și cum funcționează eGhișeul.ro',
  description:
    'eGhișeul.ro este un serviciu privat care te ajută să obții documente oficiale fără drum la ghișeu. Cine suntem, cum lucrăm cu avocatul și topograful partener, ce facem și ce nu facem.',
  path: PAGE_PATH,
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    breadcrumbNode([
      { name: 'Acasă', url: `${BASE_URL}/` },
      { name: 'Despre noi', url: `${BASE_URL}${PAGE_PATH}` },
    ]),
    authorNode(),
  ],
};

/** Pașii reali ai unui dosar, în ordinea în care se întâmplă. */
const FLOW = [
  { title: 'Completezi cererea', body: 'Online, în câteva minute. Încarci actul de identitate și datele cerute de instituție.' },
  { title: 'Semnezi împuternicirea', body: 'Electronic, direct în formular. Fără ea nimeni nu poate ridica un document în numele tău.' },
  { title: 'Plătești o singură dată', body: 'Prețul e afișat înainte, cu tot cu taxa instituției. Fără costuri care apar pe parcurs.' },
  { title: 'Depunem și ridicăm', body: 'Avocatul sau topograful partener depune cererea la instituție și ridică documentul.' },
  { title: 'Primești documentul', body: 'Pe email sau prin curier, oriunde în lume, cum ai ales la comandă.' },
];

const DO = [
  'Depunem cererea la instituția competentă, în baza împuternicirii semnate de tine',
  'Verificăm datele înainte de depunere, ca dosarul să nu fie respins pentru o greșeală de formular',
  'Ridicăm documentul și ți-l livrăm pe email sau prin curier, inclusiv în afara țării',
  'Îți spunem când o instituție întârzie sau cere ceva în plus',
];

const DONT = [
  'Nu emitem documente. Le emit exclusiv IPJ, ANAF, ONRC, OCPI/ANCPI și oficiile de stare civilă',
  'Nu suntem instituție publică și nu suntem afiliați cu vreuna',
  'Nu suntem singura cale — poți obține fiecare document și pe cont propriu, de regulă doar cu taxa instituției',
  'Nu promitem termene care nu depind de noi',
];

export default function DespreNoiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-20 lg:pb-28">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white/80">Despre noi</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Ghișeul vine la tine
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Suntem un serviciu privat care se ocupă de drumul la ghișeu în locul tău. Nu emitem
              documente — le obținem de la autoritățile care le emit, legal, pe baza unei împuterniciri
              pe care o semnezi tu.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="relative -mt-12 lg:-mt-16 grid sm:grid-cols-3 gap-5">
              <a
                href={ORGANIZATION.sameAs[0]}
                target="_blank"
                rel="nofollow noopener"
                className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg hover:border-primary-300 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <p className="text-base font-bold text-secondary-900 mb-1">
                  {SOCIAL_PROOF.ratingValue.toString().replace('.', ',')} din 5
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {SOCIAL_PROOF.reviewCount} de recenzii pe profilul Google
                </p>
              </a>

              <Link
                href="/servicii/"
                className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg hover:border-primary-300 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <FileCheck2 className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <p className="text-base font-bold text-secondary-900 mb-1">31 de servicii</p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  caziere, stare civilă, ONRC, cadastru
                </p>
              </Link>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <p className="text-base font-bold text-secondary-900 mb-1">Firmă din 2023</p>
                <p className="text-sm text-neutral-600 leading-relaxed">CUI {ORGANIZATION.cui}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-14 lg:pt-20 pb-12 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-4">Cine suntem</h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                eGhișeul.ro este marca sub care operează <strong>{ORGANIZATION.legalName}</strong>,
                societate românească înregistrată în 2023 (CUI {ORGANIZATION.cui}, Reg. Com.{' '}
                {ORGANIZATION.regCom}). Biroul e în Satu Mare, pe {ORGANIZATION.office.street}.
              </p>
              <p>
                Facem un singur lucru: obținem documente oficiale pentru persoane fizice și firme, ca
                oamenii să nu piardă zile pe drumuri și la cozi. Activitatea e coordonată de{' '}
                <Link href={SITE_AUTHOR.path} className="text-primary-600 font-medium hover:underline">
                  {SITE_AUTHOR.name}
                </Link>
                , care răspunde și de conținutul publicat pe site.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-neutral-50 border-y border-neutral-200">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-3">Cu cine lucrăm</h2>
            <p className="text-neutral-600 mb-8 max-w-2xl">
              Documentele nu se ridică de oricine. Pentru fiecare tip de dosar există un profesionist
              care are dreptul legal să-l depună și să-l ridice.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">Cabinetul de avocatură partener</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Pentru caziere, certificat de integritate și actele de stare civilă. Fiecare dosar
                  are un <strong>contract de asistență juridică</strong> și o{' '}
                  <strong>împuternicire avocațială</strong>, amândouă cu numere alocate din registrul
                  Baroului Satu Mare. Le primești semnate odată cu comanda și poți verifica oricând
                  numărul delegației.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Ruler className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">Topograful colaborator</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Pentru serviciile cadastrale: extras de carte funciară, copii din arhiva OCPI, plan
                  cadastral, releveu, identificare imobil. Cererile la OCPI le depune un{' '}
                  <strong>topograf autorizat ANCPI</strong>, care semnează documentația și urmărește
                  dosarul până la eliberare.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-3">
              Cum funcționează, pas cu pas
            </h2>
            <p className="text-neutral-600 mb-8">Același drum la toate cele 31 de servicii.</p>
            <ol className="space-y-4">
              {FLOW.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex-none w-9 h-9 rounded-xl bg-secondary-900 text-white font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <p className="font-bold text-secondary-900 mb-0.5">{step.title}</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-neutral-50 border-y border-neutral-200">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-green-200 bg-green-50/60 p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">Ce facem</h3>
                <ul className="space-y-2.5">
                  {DO.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-neutral-700 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-300 bg-white p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">Ce NU facem</h3>
                <ul className="space-y-2.5">
                  {DONT.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-neutral-700 leading-relaxed">
                      <XCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-6">Unde ne găsești</h2>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <ul className="space-y-3 text-sm text-neutral-700">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-secondary-900">{ORGANIZATION.office.street}</strong>,{' '}
                    {ORGANIZATION.office.locality}, {ORGANIZATION.office.region}
                    <span className="block text-xs text-neutral-500 mt-1">
                      Sediu social: {ORGANIZATION.address.street}, {ORGANIZATION.address.locality},{' '}
                      {ORGANIZATION.address.region}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${ORGANIZATION.contactPoint.email}`} className="text-primary-700 font-medium hover:underline">
                    {ORGANIZATION.contactPoint.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
                  <a href={`tel:${ORGANIZATION.contactPoint.telephone.replace(/-/g, '')}`} className="text-primary-700 font-medium hover:underline">
                    {ORGANIZATION.contactPoint.telephone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {ORGANIZATION.legalName} · CUI {ORGANIZATION.cui} · Reg. Com. {ORGANIZATION.regCom}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { href: '/servicii/', label: 'Vezi toate serviciile' },
                { href: SITE_AUTHOR.path, label: `Despre ${SITE_AUTHOR.name}` },
                { href: '/contact/', label: 'Scrie-ne' },
                { href: '/termeni-si-conditii/', label: 'Termeni și condiții' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  {l.label}
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
