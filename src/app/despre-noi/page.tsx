import Link from 'next/link';
import { Building2, ShieldCheck, Scale, Star, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata, BASE_URL, ORGANIZATION, SOCIAL_PROOF, SITE_AUTHOR } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { authorNode } from '@/lib/seo/author';

const PAGE_PATH = '/despre-noi/';

export const metadata = buildPageMetadata({
  title: 'Despre noi — cine suntem și cum funcționează eGhișeul.ro',
  description:
    'eGhișeul.ro este un serviciu privat care te ajută să obții documente oficiale fără drum la ghișeu. Cine suntem, cum lucrăm cu avocatul partener, ce facem și ce nu facem.',
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

export default function DespreNoiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-14 lg:pb-20">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Despre noi</h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Suntem un serviciu privat care se ocupă de drumul la ghișeu în locul tău. Nu suntem
              instituție de stat și nu emitem documente — le obținem de la autoritățile care le emit,
              legal, pe baza unei împuterniciri pe care o semnezi tu.
            </p>
          </div>
        </header>

        <article className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px] prose prose-neutral max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-a:text-primary-600">
            <h2>Cine suntem</h2>
            <p>
              eGhișeul.ro este marca sub care operează <strong>{ORGANIZATION.legalName}</strong>,
              societate înregistrată în România (CUI {ORGANIZATION.cui}, Reg. Com.{' '}
              {ORGANIZATION.regCom}), cu sediul în {ORGANIZATION.address.locality},{' '}
              {ORGANIZATION.address.region}. Firma a fost înființată în 2023 și de atunci se ocupă cu
              un singur lucru: obținerea de documente oficiale pentru persoane fizice și firme, fără
              ca oamenii să piardă zile pe drumuri și la cozi.
            </p>
            <p>
              Activitatea e coordonată de{' '}
              <Link href={SITE_AUTHOR.path}>{SITE_AUTHOR.name}</Link>, care răspunde și de conținutul
              publicat pe site.
            </p>

            <h2>Ce facem, concret</h2>
            <p>
              Astăzi acoperim <strong>31 de servicii</strong> — caziere (judiciar, auto, fiscal),
              certificat de integritate comportamentală, acte de stare civilă (naștere, căsătorie,
              celibat, extrase multilingve), certificat constatator de la ONRC și 18 servicii
              imobiliare (extras de carte funciară, copii din arhiva OCPI, plan cadastral, releveu,
              identificare imobil).
            </p>
            <p>Fluxul e același la toate:</p>
            <ol>
              <li>completezi cererea online și încarci actul de identitate;</li>
              <li>
                semnezi electronic împuternicirea avocațială — fără ea, nimeni nu poate ridica un
                document în numele tău;
              </li>
              <li>plătești o singură dată, cu prețul afișat înainte;</li>
              <li>
                avocatul partener depune cererea la instituție și ridică documentul, cu număr de
                delegație din registrul Baroului;
              </li>
              <li>primești documentul pe email sau prin curier, cum ai ales.</li>
            </ol>

            <h2>Ce NU facem</h2>
            <ul>
              <li>
                <strong>Nu emitem documente.</strong> Le emit exclusiv autoritățile competente —
                IPJ, ANAF, ONRC, OCPI/ANCPI, oficiile de stare civilă. Noi depunem cererea și ridicăm
                actul.
              </li>
              <li>
                <strong>Nu suntem instituție publică și nu suntem afiliați cu vreuna.</strong> Numele
                „eGhișeul.ro" descrie ce facem — ghișeul vine la tine — nu o legătură cu vreun portal
                de stat.
              </li>
              <li>
                <strong>Nu suntem singura cale.</strong> Poți obține fiecare document și direct, pe
                cont propriu, de regulă doar cu taxa instituției. Tarifele noastre acoperă asistența,
                împuternicirea, depunerea, ridicarea și livrarea — nu documentul în sine.
              </li>
              <li>
                <strong>Nu promitem ce nu depinde de noi.</strong> Termenele instituțiilor se pot
                prelungi, iar când se întâmplă, îți spunem.
              </li>
            </ul>

            <h2>Avocatul partener</h2>
            <p>
              Documentele care cer reprezentare — caziere, certificat de integritate, acte de stare
              civilă — se obțin prin <strong>cabinetul de avocatură partener</strong>, pe baza unui
              contract de asistență juridică și a unei împuterniciri avocațiale, ambele cu numere
              alocate din registrul Baroului Satu Mare. Le primești pe amândouă odată cu comanda,
              semnate; poți verifica oricând numărul delegației.
            </p>

            <h2>Ce spun clienții</h2>
            <p>
              Avem <strong>{SOCIAL_PROOF.ratingValue} din 5</strong>, din{' '}
              <strong>{SOCIAL_PROOF.reviewCount} de recenzii</strong> pe profilul nostru Google. Sunt
              recenzii publice, lăsate de oameni care au folosit serviciul — le poți citi integral{' '}
              <a href={ORGANIZATION.sameAs[0]} target="_blank" rel="nofollow noopener">
                pe profilul Google
              </a>
              .
            </p>

            <h2>Cum ne găsești</h2>
            <p>
              {ORGANIZATION.legalName} · CUI {ORGANIZATION.cui} · Reg. Com. {ORGANIZATION.regCom}
              <br />
              {ORGANIZATION.address.street}, {ORGANIZATION.address.locality},{' '}
              {ORGANIZATION.address.region}
              <br />
              <a href={`mailto:${ORGANIZATION.contactPoint.email}`}>
                {ORGANIZATION.contactPoint.email}
              </a>{' '}
              · <a href={`tel:${ORGANIZATION.contactPoint.telephone}`}>
                {ORGANIZATION.contactPoint.telephone}
              </a>
            </p>
            <p>
              Pentru reclamații: <Link href="/contact/">formularul de contact</Link>,{' '}
              <Link href="/termeni-si-conditii/">termenii și condițiile</Link> sau{' '}
              <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener">
                ANPC — SAL
              </a>
              .
            </p>
          </div>
        </article>

        <section className="py-10 bg-neutral-50 border-t border-neutral-200">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/servicii/', icon: Building2, label: 'Vezi toate serviciile' },
                { href: SITE_AUTHOR.path, icon: Star, label: `Despre ${SITE_AUTHOR.name}` },
                { href: '/termeni-si-conditii/', icon: Scale, label: 'Termeni și condiții' },
                { href: '/politica-de-confidentialitate/', icon: ShieldCheck, label: 'Confidențialitate' },
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
            <p className="mt-5 text-xs text-neutral-500 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {ORGANIZATION.address.region}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {ORGANIZATION.contactPoint.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {ORGANIZATION.contactPoint.telephone}
              </span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
