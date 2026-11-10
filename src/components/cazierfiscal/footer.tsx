import Link from 'next/link';
import { BRANDS } from '@/lib/brand/brands';
import { SUPPORT_HOURS_SHORT } from '@/config/contact';
import { ORGANIZATION } from '@/lib/seo/constants';
import { CAZIERFISCAL_GUIDES } from '@/config/cazierfiscal-nav';
import { CookieSettingsLink } from '@/components/consent/cookie-settings-link';
import { CazierFiscalLogo } from './logo';

const brand = BRANDS.cazierfiscal;

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
 * cazierfiscal.com footer. Same legal obligations as the documentero and
 * eghiseul footers: company data, ANPC badges (SAL + EU consumer redress),
 * the consumer phone line and the non-affiliation disclosure (ANAF).
 */
export function FooterCazierFiscal() {
  return (
    <footer className="mt-24 border-t border-d-line bg-d-bg text-d-ink">
      <div className="mx-auto max-w-[1312px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-5">
            <CazierFiscalLogo size={19} />
            <p className="m-0 max-w-[360px] text-[14px] leading-relaxed text-d-muted">
              Cazier fiscal pentru persoane fizice, obținut prin avocat, fără cont SPV și fără drum la ANAF.
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
              · {brand.phoneDisplay} · {SUPPORT_HOURS_SHORT}
            </p>
          </div>
          <div className="md:col-span-4">
            <Col
              title="Cazier fiscal"
              items={[
                { label: 'Comandă cazierul fiscal', href: '/comanda/cazier-fiscal/' },
                { label: 'Toate ghidurile', href: '/ghiduri/' },
                ...CAZIERFISCAL_GUIDES.map((g) => ({ label: g.label, href: g.href })),
              ]}
            />
          </div>
          <div className="flex flex-col gap-2.5 text-[14px] md:col-span-3">
            <span className="font-bold">Companie</span>
            <Link href="/despre/" className="text-d-muted hover:text-d-ink">Despre noi</Link>
            <Link href="/contact/" className="text-d-muted hover:text-d-ink">Contact</Link>
            <Link href="/termeni-si-conditii/" className="text-d-muted hover:text-d-ink">Termeni și condiții</Link>
            <Link href="/politica-de-confidentialitate/" className="text-d-muted hover:text-d-ink">Confidențialitate</Link>
            <Link href="/politica-de-anulare/" className="text-d-muted hover:text-d-ink">Politica de anulare</Link>
            <Link href="/politica-cookies/" className="text-d-muted hover:text-d-ink">Politica de cookie-uri</Link>
            <CookieSettingsLink className="text-left text-d-muted hover:text-d-ink" />
          </div>
        </div>

        {/* Bottom bar: company on the left, ANPC badges on the right, disclosure under both */}
        <div className="mt-10 border-t border-d-line pt-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1 text-[12px] leading-relaxed text-d-muted">
              <span>© {new Date().getFullYear()} cazierfiscal.com · {ORGANIZATION.legalName}</span>
              <span>
                CUI {ORGANIZATION.cui} · Reg. Com. {ORGANIZATION.regCom} · {ORGANIZATION.address.region},{' '}
                {ORGANIZATION.address.locality}, {ORGANIZATION.address.street}
              </span>
              {/* Ordinul ANPC 72/2010 art. 1: „Telefonul Consumatorului" și adresa site-ului ANPC. */}
              <span>
                Telefonul Consumatorului:{' '}
                <a href="tel:0219551" className="hover:text-d-ink">021 9551</a> ·{' '}
                <a href="https://anpc.ro/" target="_blank" rel="nofollow noopener" className="hover:text-d-ink">anpc.ro</a>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener" aria-label="ANPC — Soluționarea Alternativă a Litigiilor">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/footer/anpc-sal.svg" alt="ANPC SAL — Soluționarea Alternativă a Litigiilor" width={250} height={50} className="h-9 w-auto rounded" loading="lazy" />
              </a>
              {/* The EU ODR platform is closed; the EU consumer-redress page is the working destination (see the eghiseul footer). */}
              <a href="https://consumer-redress.ec.europa.eu/" target="_blank" rel="nofollow noopener" aria-label="Soluționarea litigiilor de consum în UE">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/footer/anpc-sol.svg" alt="ANPC SOL — Soluționarea Online a Litigiilor" width={250} height={50} className="h-9 w-auto rounded" loading="lazy" />
              </a>
            </div>
          </div>
          <p className="m-0 mt-5 text-[12px] leading-relaxed text-d-muted">
            cazierfiscal.com este un serviciu privat de asistență și intermediere al {ORGANIZATION.legalName}. Nu suntem
            instituție de stat și nu suntem afiliați ANAF sau altei autorități. Certificatul de cazier fiscal îl eliberează
            exclusiv ANAF și poate fi obținut și direct, gratuit, la ghișeu sau din SPV; tariful nostru acoperă asistența,
            reprezentarea prin avocat înscris în Barou și livrarea.
          </p>
        </div>
      </div>
    </footer>
  );
}
