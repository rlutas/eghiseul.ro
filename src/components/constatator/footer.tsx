import Link from 'next/link';
import { SUPPORT_HOURS_SHORT } from '@/config/contact';
import { CONSTATATOR_GUIDES } from '@/config/constatator-nav';
import { CookieSettingsLink } from '@/components/consent/cookie-settings-link';
import { ConstatatorLogo } from './logo';


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
 * certificat-constatator-express.ro footer: ANPC badges (SAL + EU consumer
 * redress), the non-affiliation disclosure (ONRC) and a link to the company data in the
 * T&C. Unlike the eghiseul/documentero footers it carries no company line
 * and no consumer phone line (decision Raul, 11.11.2026).
 */
export function FooterConstatator() {
  return (
    <footer className="mt-24 border-t border-d-line bg-d-bg text-d-ink">
      <div className="mx-auto max-w-[1312px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-5">
            <ConstatatorLogo size={19} />
            <p className="m-0 max-w-[360px] text-[14px] leading-relaxed text-d-muted">
              Certificat constatator pentru firme și PFA, pe email în câteva minute, fără cont pe portalul ONRC.
            </p>
            <p className="m-0 text-[14px] text-d-muted">
              <a href="/contact/" className="hover:text-d-ink">
                Formular de contact
              </a>{' '}
              · {SUPPORT_HOURS_SHORT}
            </p>
          </div>
          <div className="md:col-span-4">
            <Col
              title="Certificat constatator"
              items={[
                { label: 'Comandă certificatul constatator', href: '/comanda/certificat-constatator/' },
                { label: 'Tipuri și prețuri', href: '/#preturi' },
                { label: 'Întrebări frecvente', href: '/#intrebari' },
                ...(CONSTATATOR_GUIDES.length > 0 ? [{ label: 'Toate ghidurile', href: '/ghiduri/' }] : []),
                ...CONSTATATOR_GUIDES.map((g) => ({ label: g.label, href: g.href })),
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

        {/* Bottom bar: ANPC badges + disclosure. Company data (name, CUI, address)
            lives in /termeni-si-conditii/ and /contact/, not here (Raul, 11.11.2026):
            the footer repeats on every page and is the strongest visual tie to
            the other brands of the same company. */}
        <div className="mt-10 border-t border-d-line pt-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <span className="text-[12px] leading-relaxed text-d-muted">
              © {new Date().getFullYear()} certificat-constatator-express.ro ·{' '}
              <Link href="/termeni-si-conditii/" className="hover:text-d-ink">Datele firmei</Link>
            </span>
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
            certificat-constatator-express.ro este un serviciu privat de asistență și intermediere. Nu suntem
            instituție de stat și nu suntem afiliați Oficiului Național al Registrului Comerțului (ONRC) sau altei
            autorități. Certificatul constatator îl eliberează exclusiv ONRC și poate fi cerut și direct, pe portalul
            ONRC sau la ghișeu, plătind doar taxa oficială; tariful nostru acoperă taxa ONRC, depunerea cererii în locul
            tău și livrarea pe email.
          </p>
        </div>
      </div>
    </footer>
  );
}
