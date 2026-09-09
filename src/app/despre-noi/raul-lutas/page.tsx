import Link from 'next/link';
import { GraduationCap, Building2, Mail, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata, BASE_URL, ORGANIZATION, SITE_AUTHOR } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { authorNode } from '@/lib/seo/author';

const PAGE_PATH = SITE_AUTHOR.path;

export const metadata = buildPageMetadata({
  title: `${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle}`,
  description:
    'Cine scrie și cine răspunde de conținutul de pe eGhișeul.ro: Luțaș Raul Cătălin, fondatorul serviciului. Formare, rol și cum verificăm informația publicată.',
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
        'cazier judiciar',
        'carte funciară și publicitate imobiliară',
        'registrul comerțului',
      ],
    },
  ],
};

export default function AutorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-14 lg:pb-20">
          <div className="container mx-auto px-4 max-w-[760px]">
            <p className="text-sm text-white/60 mb-3">
              <Link href="/despre-noi/" className="hover:text-white">
                Despre noi
              </Link>{' '}
              / Autor
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">{SITE_AUTHOR.name}</h1>
            <p className="text-lg text-white/85">{SITE_AUTHOR.jobTitle}</p>
          </div>
        </header>

        <article className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[760px] prose prose-neutral max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-a:text-primary-600">
            <h2>Ce fac</h2>
            <p>
              Am pornit eGhișeul.ro pentru că obținerea unui act în România înseamnă, de regulă, o zi
              liberă luată de la muncă și o coadă. Conduc {ORGANIZATION.legalName} (CUI{' '}
              {ORGANIZATION.cui}, Reg. Com. {ORGANIZATION.regCom}), firma din spatele serviciului, și
              mă ocup de partea de produs și de tehnologie: fluxul prin care completezi cererea,
              verificările de date, generarea documentelor și integrările cu instituțiile care
              permit depunere online.
            </p>
            <p>
              Răspund de conținutul publicat pe site. Ghidurile și paginile de serviciu sunt scrise
              și actualizate pe baza dosarelor pe care le lucrăm efectiv — nu compilate de pe alte
              site-uri.
            </p>

            <h2>Formare</h2>
            <p className="flex items-start gap-2 not-prose text-neutral-700">
              <GraduationCap className="h-5 w-5 mt-0.5 text-primary-600 flex-shrink-0" aria-hidden="true" />
              <span>
                <strong>BSc Computing Technologies</strong> — University of Roehampton, Londra
              </span>
            </p>
            <p>
              Formarea mea e în tehnologie, nu în drept — și e important să fie spus limpede. Partea
              juridică a fiecărui dosar (contractul de asistență, împuternicirea avocațială,
              reprezentarea în fața instituției) o face <strong>cabinetul de avocatură partener</strong>,
              cu numere de delegație din registrul Baroului Satu Mare. Eu construiesc și operez
              sistemul care duce dosarul de la formular până la documentul livrat.
            </p>

            <h2>Cum verificăm ce publicăm</h2>
            <ul>
              <li>
                Taxele, termenele și actele necesare se iau din sursele oficiale ale instituției
                emitente și se verifică pe dosarele noastre reale.
              </li>
              <li>
                Când o instituție schimbă procedura sau un portal cade — cum a fost cu ANCPI, în
                iulie 2026 — actualizăm paginile afectate și scriem explicit ce s-a schimbat.
              </li>
              <li>
                Fiecare articol arată data ultimei actualizări. Dacă găsești ceva depășit sau greșit,{' '}
                <Link href="/contact/">scrie-ne</Link> și corectăm.
              </li>
            </ul>

            <h2>Contact</h2>
            <p className="flex items-center gap-2 not-prose text-neutral-700">
              <Mail className="h-4 w-4 text-primary-600" aria-hidden="true" />
              <a href={`mailto:${ORGANIZATION.contactPoint.email}`} className="text-primary-600 hover:underline">
                {ORGANIZATION.contactPoint.email}
              </a>
            </p>
          </div>
        </article>

        <section className="py-10 bg-neutral-50 border-t border-neutral-200">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/despre-noi/', icon: Building2, label: 'Despre eGhișeul.ro' },
                { href: '/blog/', icon: ArrowRight, label: 'Ghiduri și informații utile' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <l.icon className="h-4 w-4" aria-hidden="true" />
                    {l.label}
                  </span>
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
