import Link from 'next/link';
import { HeaderCazierFiscal } from '@/components/cazierfiscal/header';
import { Card, Eyebrow, Section } from '@/components/documentero/ui';
import { ContactFormDocumentero } from '@/components/documentero/contact-form';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalBreadcrumb, cazierFiscalOrganizationNode, cazierFiscalWebsiteNode } from '@/lib/seo/cazierfiscal-schema';
import { ORGANIZATION } from '@/lib/seo/constants';
import { BRANDS } from '@/lib/brand/brands';
import { SUPPORT_HOURS_SHORT } from '@/config/contact';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

const PATH = '/contact/';
const brand = BRANDS.cazierfiscal;

export const metadata = buildPageMetadata({
  brand: 'cazierfiscal',
  title: 'Contact: WhatsApp, email, telefon',
  description: 'Întreabă înainte să comanzi. Spune-ne pentru ce dosar îți trebuie cazierul fiscal și până când. WhatsApp, email, telefon, luni–vineri 8–16; răspuns de obicei sub o oră.',
  path: PATH,
  noindex: !CAZIERFISCAL_INDEXABLE,
});

export default function ContactPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [cazierFiscalOrganizationNode(), cazierFiscalWebsiteNode(), cazierFiscalBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Contact', path: PATH }], PATH)],
  };
  const wa = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent('Bună! Am o întrebare despre cazierul fiscal (cazierfiscal.com).')}`;
  const channels = [
    { k: 'W', t: `WhatsApp · ${brand.phoneDisplay}`, d: `${SUPPORT_HOURS_SHORT} · răspuns de obicei sub o oră · poți trimite poze cu ce ți se cere`, h: wa, primary: true },
    { k: '@', t: brand.contactEmail, d: 'pentru întrebări detaliate; răspundem în aceeași zi lucrătoare', h: `mailto:${brand.contactEmail}`, primary: false },
    { k: '☎', t: `Telefon · ${brand.phoneDisplay}`, d: SUPPORT_HOURS_SHORT, h: `tel:${brand.phoneDisplay.replace(/\s/g, '')}`, primary: false },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderCazierFiscal />
      <main id="main-content">
        <Section className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[52px]">Întreabă înainte să comanzi.</h1>
            <p className="m-0 text-[17px] leading-[1.6] text-d-muted">Spune-ne pentru ce dosar îți trebuie cazierul fiscal și până când. Îți spunem dacă te ajută varianta gratuită din SPV sau de la ghișeu, înainte să plătești ceva.</p>
            <div className="flex flex-col gap-3 pt-2">
              {channels.map((c) => (
                <a
                  key={c.t}
                  href={c.h}
                  className={`flex items-center gap-3.5 rounded-2xl border px-5 py-4 transition-colors ${c.primary ? 'border-[1.5px] border-d-acc bg-d-soft' : 'border-d-line bg-d-card hover:border-d-acc'}`}
                >
                  <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-extrabold ${c.primary ? 'bg-d-acc text-d-ink' : 'bg-d-soft text-d-ink'}`}>{c.k}</span>
                  <span className="flex flex-col"><span className="text-[16px] font-bold">{c.t}</span><span className="text-[14px] leading-[1.45] text-d-muted">{c.d}</span></span>
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-d-line bg-d-card p-5 text-[14px] text-d-muted">
              <span className="font-bold text-d-ink">Ai deja o comandă?</span>
              <span>Statusul e pe <Link href="/comanda/status/" className="font-semibold text-d-ink underline underline-offset-2 hover:text-d-acc">pagina comenzii</Link>, cu codul din email. Nu trebuie să ne scrii ca să afli unde e dosarul.</span>
            </div>
          </div>
          <Card className="rounded-3xl p-6 sm:p-8 lg:col-span-7">
            <div className="mb-5 flex flex-col gap-1">
              <span className="text-[22px] font-bold tracking-[-0.02em]">Scrie-ne</span>
              <span className="text-[14px] text-d-muted">Trei rânduri ajung. Răspundem pe email, în orele de program.</span>
            </div>
            <ContactFormDocumentero
              whatsappHref={wa}
              copy={{
                topics: [
                  ['pf', 'Cazier fiscal pentru mine (persoană fizică)'],
                  ['firma', 'Îmi trebuie pentru o firmă'],
                  ['strainatate', 'Sunt în străinătate'],
                  ['altceva', 'Altă întrebare'],
                ],
                topicLabel: 'Despre ce e vorba?',
                contextLabel: 'Pentru ce dosar sau instituție?',
                contextPlaceholder: 'angajare, licitație, bancă…',
                messagePlaceholder: 'Ex.: îmi trebuie pentru o licitație până vineri, nu am cont SPV. Se poate?',
              }}
            />
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
