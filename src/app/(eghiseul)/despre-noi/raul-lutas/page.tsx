import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, GraduationCap, Building2, Mail, ArrowRight, Linkedin,
  Scale, PenLine, ShieldCheck,
} from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata, BASE_URL, ORGANIZATION, SITE_AUTHOR } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { authorNode } from '@/lib/seo/author';

const PAGE_PATH = SITE_AUTHOR.path;

export const metadata = buildPageMetadata({
  title: `${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle}`,
  description:
    'Cine scrie și cine răspunde de conținutul de pe eGhișeul.ro: Luțaș Raul Cătălin, fondatorul serviciului. Experiență, formare și cum verificăm informația publicată.',
  path: PAGE_PATH,
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    breadcrumbNode([
      { name: 'Acasă', url: `${BASE_URL}/` },
      { name: 'Despre noi', url: `${BASE_URL}/despre-noi/` },
      { name: SITE_AUTHOR.name, url: SITE_AUTHOR.url },
    ]),
    {
      ...authorNode(),
      description:
        'Fondatorul eGhișeul.ro, serviciu privat de obținere a documentelor oficiale în România. Absolvent de Computing Technologies, University of Roehampton.',
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'University of Roehampton',
        url: 'https://www.roehampton.ac.uk/',
      },
      knowsAbout: [
        'obținerea documentelor oficiale în România',
        'cazier judiciar și certificat de integritate',
        'carte funciară și publicitate imobiliară',
        'registrul comerțului',
      ],
      ...(SITE_AUTHOR.linkedin ? { sameAs: [SITE_AUTHOR.linkedin] } : {}),
      ...(SITE_AUTHOR.photo ? { image: `${BASE_URL}${SITE_AUTHOR.photo}` } : {}),
    },
  ],
};

const RESPONSABILITATI = [
  {
    icon: PenLine,
    title: 'Conținutul publicat',
    body: 'Ghidurile și paginile de serviciu sunt scrise și actualizate pe baza dosarelor pe care le lucrăm efectiv, nu compilate de pe alte site-uri.',
  },
  {
    icon: ShieldCheck,
    title: 'Produsul și tehnologia',
    body: 'Fluxul prin care completezi cererea, verificările de date, generarea documentelor și integrările cu instituțiile care permit depunere online.',
  },
  {
    icon: Scale,
    title: 'Relația cu partenerii',
    body: 'Coordonarea cu cabinetul de avocatură și cu topograful autorizat care depun efectiv dosarele la instituții.',
  },
];

export default function AutorPage() {
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
              <Link href="/despre-noi/" className="hover:text-primary-500 transition-colors">Despre noi</Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-white/80">{SITE_AUTHOR.name}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-none">
                {SITE_AUTHOR.photo ? (
                  <Image
                    src={SITE_AUTHOR.photo}
                    alt={SITE_AUTHOR.name}
                    width={112}
                    height={112}
                    className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover ring-2 ring-primary-500/40"
                  />
                ) : (
                  <div
                    className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-primary-500/15 ring-2 ring-primary-500/40 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-3xl font-extrabold text-primary-400">{SITE_AUTHOR.initials}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-extrabold text-white leading-tight mb-2">
                  {SITE_AUTHOR.name}
                </h1>
                <p className="text-lg text-white/85">{SITE_AUTHOR.jobTitle}</p>
                {SITE_AUTHOR.linkedin ? (
                  <a
                    href={SITE_AUTHOR.linkedin}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-white/70 hover:text-primary-400 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" aria-hidden="true" /> Profil LinkedIn
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* De ce răspund — carduri flotante */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="relative -mt-12 lg:-mt-16 grid sm:grid-cols-3 gap-5">
              {RESPONSABILITATI.map((r) => (
                <div
                  key={r.title}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <r.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="text-base font-bold text-secondary-900 mb-1.5">{r.title}</p>
                  <p className="text-sm text-neutral-600 leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-14 lg:pt-20 pb-12 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-4">Ce fac</h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Am pornit eGhișeul.ro pentru că obținerea unui act în România înseamnă, de regulă, o zi
                liberă luată de la muncă și o coadă. Conduc <strong>{ORGANIZATION.legalName}</strong>{' '}
                (CUI {ORGANIZATION.cui}, Reg. Com. {ORGANIZATION.regCom}), firma din spatele
                serviciului, cu biroul în Satu Mare, pe {ORGANIZATION.office.street}.
              </p>
              <p>
                Lucrez de ani buni în zona asta, pe obținerea de documente oficiale, și cunosc partea
                care nu se vede din afară: ce respinge un ghișeu și de ce, cât durează în realitate un
                dosar față de termenul afișat, ce se schimbă când o instituție își mută procedura
                online. Ce scriu pe site vine din dosarele pe care le lucrăm, nu din alte site-uri.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-neutral-50 border-y border-neutral-200">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-6">Formare</h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-none">
                <GraduationCap className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-secondary-900">BSc Computing Technologies</p>
                <p className="text-sm text-neutral-600">University of Roehampton, Londra</p>
              </div>
            </div>
            <p className="text-neutral-700 leading-relaxed mt-5">
              Formarea mea e în tehnologie, nu în drept, și e important să fie spus limpede. Partea
              juridică a fiecărui dosar — contractul de asistență, împuternicirea avocațială,
              reprezentarea în fața instituției — o face{' '}
              <strong>cabinetul de avocatură partener</strong>, cu numere de delegație din registrul
              Baroului Satu Mare. Documentațiile cadastrale le semnează un{' '}
              <strong>topograf autorizat ANCPI</strong>. Eu construiesc și operez sistemul care duce
              dosarul de la formular până la documentul livrat.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-6">
              Cum verificăm ce publicăm
            </h2>
            <ul className="space-y-3 text-neutral-700 leading-relaxed">
              {[
                'Taxele, termenele și actele necesare se iau din sursele oficiale ale instituției emitente și se verifică pe dosarele noastre reale.',
                'Când o instituție schimbă procedura sau un portal cade — cum a fost cu ANCPI, în iulie 2026 — actualizăm paginile afectate și scriem explicit ce s-a schimbat.',
                'Fiecare articol arată data ultimei actualizări.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 flex-none" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-5">
              Dacă găsești ceva depășit sau greșit,{' '}
              <Link href="/contact/" className="text-primary-600 font-medium hover:underline">
                scrie-ne
              </Link>{' '}
              și corectăm.
            </p>

            <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <a
                  href={`mailto:${ORGANIZATION.contactPoint.email}`}
                  className="inline-flex items-center gap-2 text-primary-700 font-medium hover:underline"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" /> {ORGANIZATION.contactPoint.email}
                </a>
                <Link
                  href="/despre-noi/"
                  className="inline-flex items-center gap-2 text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  <Building2 className="w-4 h-4" aria-hidden="true" /> Despre eGhișeul.ro
                </Link>
                <Link
                  href="/blog/"
                  className="group inline-flex items-center gap-2 text-neutral-700 hover:text-primary-700 transition-colors"
                >
                  Ghiduri și informații utile
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
