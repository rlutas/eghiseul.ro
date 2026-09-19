import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, Section } from '@/components/documentero/ui';
import { ContactForm } from '@/components/contact/contact-form';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroBreadcrumb, documenteroOrganizationNode, documenteroWebsiteNode } from '@/lib/seo/documentero-schema';
import { ORGANIZATION } from '@/lib/seo/constants';
import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

const PATH = '/contact/';
const brand = BRANDS.documentero;

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Contact: WhatsApp, email, telefon',
  description: 'Întreabă înainte să comanzi. Spune-ne ce act ai nevoie, pentru ce țară și până când. Răspundem în orele de program, de obicei sub o oră.',
  path: PATH,
  noindex: !DOCUMENTERO_INDEXABLE,
});

export default function ContactPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [documenteroOrganizationNode(), documenteroWebsiteNode(), documenteroBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Contact', path: PATH }], PATH)],
  };
  const wa = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent('Bună! Am o întrebare despre un act de stare civilă (documentero.ro).')}`;
  const channels = [
    { k: 'W', t: `WhatsApp · ${brand.phoneDisplay}`, d: 'L–V 9–18, răspuns de obicei sub o oră', h: wa },
    { k: '@', t: brand.contactEmail, d: 'pentru documente și întrebări detaliate', h: `mailto:${brand.contactEmail}` },
    { k: '☎', t: `Telefon · ${brand.phoneDisplay}`, d: 'L–V 9–18', h: `tel:${brand.phoneDisplay.replace(/\s/g, '')}` },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero />
      <main id="main-content">
        <Section className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[56px]">Întreabă înainte să comanzi. Răspundem în orele de program.</h1>
            <p className="m-0 text-[17px] leading-[1.6] text-d-muted">Cel mai rapid: WhatsApp. Spune-ne ce act ai nevoie, pentru ce țară și dacă ai o dată limită.</p>
            <div className="flex flex-col gap-3 pt-2">
              {channels.map((c) => (
                <a key={c.t} href={c.h} className="flex items-center gap-3.5 rounded-2xl border border-d-line bg-d-card px-5 py-4 hover:border-d-acc">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-d-soft font-extrabold text-d-ink">{c.k}</span>
                  <span className="flex flex-col"><span className="text-[16px] font-bold">{c.t}</span><span className="text-[14px] text-d-muted">{c.d}</span></span>
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-1 pt-2 text-[14px] text-d-muted">
              <span className="font-bold text-d-ink">Ai deja o comandă?</span>
              <span>Statusul e în cont și pe pagina comenzii din email. Nu trebuie să ne scrii ca să afli unde e dosarul.</span>
            </div>
          </div>
          <Card className="rounded-3xl p-7 lg:col-span-6 lg:col-start-7">
            <span className="mb-4 block text-[20px] font-bold">Scrie-ne</span>
            <ContactForm />
          </Card>
        </Section>

        <Section className="mt-20 grid gap-5 md:grid-cols-2">
          <Card className="flex flex-col gap-2.5 rounded-2xl p-7">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Biroul</span>
            <span className="text-[20px] font-bold">{ORGANIZATION.office.locality}, {ORGANIZATION.office.street}</span>
            <span className="text-[15px] text-d-muted">Vizite doar cu programare. Comenzile se fac online, nu la birou.</span>
          </Card>
          <Card className="flex flex-col gap-2.5 rounded-2xl p-7">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Firma</span>
            <span className="text-[20px] font-bold">{ORGANIZATION.legalName}</span>
            <span className="text-[15px] text-d-muted">CUI {ORGANIZATION.cui} · Reg. Com. {ORGANIZATION.regCom} · sediul social în {ORGANIZATION.address.locality}, {ORGANIZATION.address.region}</span>
          </Card>
        </Section>
      </main>
    </>
  );
}
