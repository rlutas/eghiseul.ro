import Link from 'next/link';
import { BRANDS } from '@/lib/brand/brands';
import { ORGANIZATION } from '@/lib/seo/constants';
import { DOCUMENTERO_NAV } from '@/config/documentero-nav';
import { CookieSettingsLink } from '@/components/consent/cookie-settings-link';
import { DocumenteroWordmark } from './wordmark';

const brand = BRANDS.documentero;

/**
 * documentero.ro footer: services, guides, company, and the disclosure the
 * content rules require on every public page (private service, company data,
 * ANPC, declared link to the parent brand).
 */
export function FooterDocumentero() {
  return (
    <footer className="mt-24 border-t border-[#1C1A17]/15 bg-[#F3EEE4] text-[#1C1A17]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-5">
            <DocumenteroWordmark className="h-7" />
            <p className="max-w-[360px] text-[14px] leading-relaxed text-[#4A4640]">
              Acte de stare civilă obținute prin avocat și livrate prin curier, în România și în
              străinătate. Parte din grupul{' '}
              <a href={BRANDS.eghiseul.baseUrl} className="underline underline-offset-2">
                eghiseul.ro
              </a>
              .
            </p>
            <p className="text-[14px] text-[#4A4640]">
              <a href={`mailto:${brand.contactEmail}`} className="hover:text-[#C8401F]">
                {brand.contactEmail}
              </a>{' '}
              · {brand.phoneDisplay} · L–V 9–18
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[14px] md:col-span-3">
            <span className="font-semibold">Certificate</span>
            {DOCUMENTERO_NAV.filter((i) => i.orderSlug).map((i) => (
              <Link key={i.href} href={i.href} className="text-[#4A4640] hover:text-[#C8401F]">
                {i.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-[14px] md:col-span-2">
            <span className="font-semibold">Ghiduri</span>
            <Link href="/ghiduri/" className="text-[#4A4640] hover:text-[#C8401F]">
              Toate ghidurile
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-[14px] md:col-span-2">
            <span className="font-semibold">Companie</span>
            <Link href="/despre/" className="text-[#4A4640] hover:text-[#C8401F]">Despre noi</Link>
            <Link href="/contact/" className="text-[#4A4640] hover:text-[#C8401F]">Contact</Link>
            <Link href="/termeni-si-conditii/" className="text-[#4A4640] hover:text-[#C8401F]">Termeni și condiții</Link>
            <Link href="/politica-de-confidentialitate/" className="text-[#4A4640] hover:text-[#C8401F]">Confidențialitate</Link>
            <Link href="/politica-de-anulare/" className="text-[#4A4640] hover:text-[#C8401F]">Politica de anulare</Link>
            <CookieSettingsLink />
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener" className="text-[#4A4640] hover:text-[#C8401F]">
              ANPC — SAL
            </a>
            <a href="https://anpc.ro/" target="_blank" rel="nofollow noopener" className="text-[#4A4640] hover:text-[#C8401F]">
              PROTECȚIA CONSUMATORILOR - A.N.P.C.
            </a>
          </div>
        </div>
        <p className="mt-10 border-t border-[#1C1A17]/15 pt-6 text-[12px] leading-relaxed text-[#6E6A62]">
          documentero.ro este un serviciu privat de asistență și intermediere al {ORGANIZATION.legalName},
          CUI {ORGANIZATION.cui}, Reg. Com. {ORGANIZATION.regCom}, {ORGANIZATION.address.region},{' '}
          {ORGANIZATION.address.locality}, {ORGANIZATION.address.street}. Nu suntem instituție de stat și nu
          suntem afiliați autorităților. Documentele sunt emise exclusiv de oficiile de stare civilă și pot fi
          solicitate și direct, la ghișeu.
        </p>
      </div>
    </footer>
  );
}
