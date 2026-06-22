import Link from 'next/link';
import { ChevronRight, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { organizationNode, websiteNode, breadcrumbNode } from '@/lib/seo/schema';
import { ORGANIZATION } from '@/lib/seo/constants';

const PAGE_PATH = '/contact/';
const TITLE = 'Contact — eGhișeul.ro';
const DESCRIPTION =
  'Contactează eGhișeul.ro: telefon +40 757 708 181, email contact@eghiseul.ro. ' +
  'Asistență pentru cazier, carte funciară, certificat constatator și alte documente oficiale online.';

export const metadata = buildPageMetadata({ title: TITLE, description: DESCRIPTION, path: PAGE_PATH });

const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;
const PHONE_DISPLAY = '+40 757 708 181';
const PHONE_TEL = '+40757708181';
const EMAIL = ORGANIZATION.contactPoint.email;

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationNode(),
    websiteNode(),
    {
      ...breadcrumbNode([
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Contact', url: PAGE_URL },
      ]),
      '@id': `${PAGE_URL}#breadcrumb`,
    },
    {
      '@type': 'ContactPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ro-RO',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
    },
  ],
};

const CARDS = [
  { icon: Phone, title: 'Telefon', value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}`, desc: 'Luni–Vineri, în programul de lucru.' },
  { icon: Mail, title: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, desc: 'Răspundem de regulă în aceeași zi lucrătoare.' },
  { icon: MessageCircle, title: 'WhatsApp', value: PHONE_DISPLAY, href: `https://wa.me/${PHONE_TEL.replace('+', '')}`, desc: 'Scrie-ne rapid pe WhatsApp.' },
];

export default function ContactPage() {
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
              <span className="text-white/80">Contact</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">Contact</h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Ai o întrebare despre o comandă sau despre un serviciu? Suntem aici să te ajutăm cu obținerea
              documentelor oficiale online.
            </p>
          </div>
        </header>

        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="relative -mt-12 lg:-mt-16 grid sm:grid-cols-3 gap-5">
              {CARDS.map((c) => (
                <a key={c.title} href={c.href} className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg hover:border-primary-300 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <c.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-secondary-900 mb-1">{c.title}</h2>
                  <p className="text-sm font-semibold text-primary-700 break-words">{c.value}</p>
                  <p className="text-sm text-neutral-600 leading-relaxed mt-1.5">{c.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-2 mb-3"><Clock className="w-5 h-5 text-primary-600" aria-hidden="true" /><h2 className="text-lg font-bold text-secondary-900">Program de lucru</h2></div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>Luni – Joi: 08:00 – 16:00</li>
                  <li>Vineri: 08:00 – 15:00</li>
                  <li>Sâmbătă, Duminică: închis</li>
                </ul>
                <p className="text-xs text-neutral-500 mt-3">Termenele de livrare se calculează pe baza programului de lucru.</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-2 mb-3"><MapPin className="w-5 h-5 text-primary-600" aria-hidden="true" /><h2 className="text-lg font-bold text-secondary-900">Date firmă</h2></div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li><strong>{ORGANIZATION.legalName}</strong></li>
                  <li>CUI: {ORGANIZATION.cui}</li>
                  <li>Reg. Com.: {ORGANIZATION.regCom}</li>
                  <li>{ORGANIZATION.address.street}, {ORGANIZATION.address.locality}, {ORGANIZATION.address.region}</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm text-amber-800">
                <strong>eGhișeul.ro este un serviciu privat</strong> de asistență pentru obținerea documentelor oficiale —
                nu suntem o instituție de stat și nu suntem afiliați cu portalul guvernamental ghiseul.ro. Documentele
                sunt emise de instituțiile abilitate; noi depunem cererile în numele tău și ți le livrăm.
              </p>
            </div>

            <p className="text-center text-neutral-600 mt-8">
              Vrei să începi o comandă? Vezi <Link href="/servicii/" className="text-primary-700 font-medium underline">toate serviciile</Link> sau
              verifică <Link href="/comanda/status" className="text-primary-700 font-medium underline">statusul unei comenzi</Link>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
