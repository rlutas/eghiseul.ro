import Link from 'next/link';
import { BRANDS } from '@/lib/brand/brands';
import { ORGANIZATION } from '@/lib/seo/constants';
import { DOCUMENTERO_FOOTER } from '@/config/documentero-nav';
import { CookieSettingsLink } from '@/components/consent/cookie-settings-link';
import { DocumenteroLogo } from './logo';

const brand = BRANDS.documentero;
/** Legal texts are the group's; until documentero gets its own pages they live on eghiseul.ro. */
const LEGAL = BRANDS.eghiseul.baseUrl;

function Col({ title, items }: { title: string; items: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <div className="flex flex-col gap-2.5 text-[14px]">
      <span className="font-bold text-d-ink">{title}</span>
      {items.map((i) => (
        <Link key={i.href + i.label} href={i.href} className="text-d-muted hover:text-d-ink">
          {i.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * documentero.ro footer: services, guides, company, and the disclosure the
 * content rules require on every public page (private service, company data,
 * ANPC, declared link to the parent brand).
 */
export function FooterDocumentero() {
  return (
    <footer className="mt-24 border-t border-d-line bg-d-bg text-d-ink">
      <div className="mx-auto max-w-[1312px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-5">
            <DocumenteroLogo size={20} />
            <p className="m-0 max-w-[360px] text-[14px] leading-relaxed text-d-muted">
              Acte de stare civilă obținute prin avocat și livrate prin curier, în România și în străinătate.
              Parte din grupul{' '}
              <a href={BRANDS.eghiseul.baseUrl} className="underline underline-offset-2">
                eghiseul.ro
              </a>
              .
            </p>
            <p className="m-0 text-[14px] text-d-muted">
              <a href={`mailto:${brand.contactEmail}`} className="hover:text-d-ink">
                {brand.contactEmail}
              </a>{' '}
              · {brand.phoneDisplay} · L–V 9–18
            </p>
          </div>
          <div className="md:col-span-3">
            <Col title="Certificate" items={DOCUMENTERO_FOOTER.certificate} />
          </div>
          <div className="md:col-span-2">
            <Col title="Ghiduri" items={DOCUMENTERO_FOOTER.ghiduri} />
          </div>
          <div className="flex flex-col gap-2.5 text-[14px] md:col-span-2">
            <span className="font-bold">Companie</span>
            {DOCUMENTERO_FOOTER.companie.map((i) => (
              <Link key={i.href} href={i.href} className="text-d-muted hover:text-d-ink">
                {i.label}
              </Link>
            ))}
            <a href={`${LEGAL}/termeni-si-conditii/`} className="text-d-muted hover:text-d-ink">Termeni și condiții</a>
            <a href={`${LEGAL}/politica-de-confidentialitate/`} className="text-d-muted hover:text-d-ink">Confidențialitate</a>
            <a href={`${LEGAL}/politica-de-anulare/`} className="text-d-muted hover:text-d-ink">Politica de anulare</a>
            <CookieSettingsLink />
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener" className="text-d-muted hover:text-d-ink">
              ANPC — SAL
            </a>
            <a href="https://anpc.ro/" target="_blank" rel="nofollow noopener" className="text-d-muted hover:text-d-ink">
              PROTECȚIA CONSUMATORILOR - A.N.P.C.
            </a>
          </div>
        </div>
        <p className="m-0 mt-10 border-t border-d-line pt-6 text-[12px] leading-relaxed text-d-muted">
          documentero.ro este un serviciu privat de asistență și intermediere al {ORGANIZATION.legalName}, CUI{' '}
          {ORGANIZATION.cui}, Reg. Com. {ORGANIZATION.regCom}, {ORGANIZATION.address.region},{' '}
          {ORGANIZATION.address.locality}, {ORGANIZATION.address.street}. Nu suntem instituție de stat și nu suntem
          afiliați autorităților. Documentele sunt emise exclusiv de oficiile de stare civilă și pot fi solicitate și
          direct, la ghișeu.
        </p>
      </div>
    </footer>
  );
}
