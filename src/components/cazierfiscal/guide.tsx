import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeaderCazierFiscal } from './header';
import { Arrow, Section } from '@/components/documentero/ui';
import { fmtDateRo } from '@/lib/documentero/content';
import { CAZIERFISCAL_ORDER_HREF } from '@/config/cazierfiscal-nav';

/**
 * Shell for a cazierfiscal.com guide: breadcrumb, H1, lead, date, the body
 * (plain prose with h2/p/ul styled by the wrapper), an order box and the
 * official sources. Server component, no JS.
 */
export function CazierFiscalGuide({
  path,
  crumb,
  title,
  lead,
  updated,
  graph,
  sources,
  orderLead,
  price,
  children,
}: {
  path: string;
  crumb: string;
  title: string;
  lead: string;
  updated: string;
  graph: object;
  sources: ReadonlyArray<readonly [string, string]>;
  orderLead: string;
  price: string;
  children: ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderCazierFiscal active={path} />
      <main id="main-content">
        <Section reveal={false} className="mt-10 flex max-w-[820px] flex-col gap-5 lg:mt-16">
          <nav aria-label="breadcrumb" className="flex flex-wrap gap-2 text-[13px] text-d-muted">
            <Link href="/" className="hover:text-d-ink">Acasă</Link>
            <span>/</span>
            <Link href="/ghiduri/" className="hover:text-d-ink">Ghiduri</Link>
            <span>/</span>
            <span className="text-d-ink">{crumb}</span>
          </nav>
          <h1 className="m-0 text-[34px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">{title}</h1>
          <p className="m-0 text-[18px] leading-[1.6] text-d-muted sm:text-[20px]">{lead}</p>
          <p className="m-0 text-[13px] text-d-muted">Actualizat la {fmtDateRo(updated)} · echipa cazierfiscal.com</p>
        </Section>

        <Section
          reveal={false}
          className="mt-10 max-w-[820px] text-[17px] leading-[1.75] text-d-body [&_a]:font-semibold [&_a]:text-d-ink [&_a]:underline [&_a]:decoration-d-acc [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.03em] [&_h2]:text-d-ink sm:[&_h2]:text-[30px] [&_li]:mb-2 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
        >
          {children}
        </Section>

        <Section reveal={false} className="mt-14 max-w-[820px]">
          <aside className="relative overflow-hidden rounded-[24px] bg-d-ink p-6 text-white sm:p-8">
            <p className="m-0 text-[22px] font-bold tracking-[-0.02em] sm:text-[26px]">Nu ai SPV sau timp de ghișeu?</p>
            <p className="m-0 mt-2 text-[16px] leading-[1.6] text-white/75">{orderLead}</p>
            <Link href={CAZIERFISCAL_ORDER_HREF} className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-d-acc px-6 text-[16px] font-bold text-d-ink hover:opacity-90">
              Comandă cazierul fiscal · {price} lei <Arrow />
            </Link>
          </aside>
        </Section>

        <Section reveal={false} className="mt-12 max-w-[820px]">
          <div className="flex flex-col gap-3 border-t border-d-line pt-6">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Surse oficiale</span>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] text-d-body">
              {sources.map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="nofollow noopener" className="underline decoration-d-acc underline-offset-2">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
    </>
  );
}
