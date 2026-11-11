import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { HeaderCazierFiscal } from './header';
import { Arrow, Section } from '@/components/documentero/ui';
import { fmtDateRo } from '@/lib/documentero/content';
import { CAZIERFISCAL_GUIDES, CAZIERFISCAL_ORDER_HREF, cazierFiscalGuideVisible } from '@/config/cazierfiscal-nav';

/**
 * In-body link to another guide. Renders plain text while the target is still
 * queued (published: false), so a live guide never links to a 404; the link
 * appears by itself on the day the target is published.
 */
export function GuideLink({ href, children }: { href: string; children: ReactNode }) {
  return cazierFiscalGuideVisible(href) ? <Link href={href}>{children}</Link> : <>{children}</>;
}

/**
 * Shell for a cazierfiscal.com guide: breadcrumb, H1, lead, date and reading
 * time, a "Pe scurt" box (answers, not teasers) with the table of contents,
 * the body (plain prose with h2/p/ul styled by the wrapper; each h2 carries the
 * `id` listed in `toc`), an order box and the official sources.
 * Server component, no JS.
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
  summary,
  toc,
  readMinutes,
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
  /** 3–5 self-contained answers, one sentence each. */
  summary: ReadonlyArray<ReactNode>;
  /** [h2 id, label] in body order. */
  toc: ReadonlyArray<readonly [string, string]>;
  readMinutes: number;
  children: ReactNode;
}) {
  // Queued guides (published: false in cazierfiscal-nav.ts) 404 in production.
  if (!cazierFiscalGuideVisible(path)) notFound();
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
          <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-d-muted">
            <span>Actualizat la <time dateTime={updated}>{fmtDateRo(updated)}</time></span>
            <span aria-hidden="true">·</span>
            <span>{readMinutes} minute de citit</span>
            <span aria-hidden="true">·</span>
            <span>echipa cazierfiscal.com</span>
          </p>
        </Section>

        <Section reveal={false} className="mt-8 max-w-[820px]">
          <div className="overflow-hidden rounded-[20px] border-[1.5px] border-d-acc bg-d-soft">
            <div className="p-5 sm:p-7">
              <p className="m-0 text-[13px] font-bold uppercase tracking-[0.08em] text-d-ink">Pe scurt</p>
              <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
                {summary.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[16px] leading-[1.55] text-d-ink">
                    <span aria-hidden="true" className="mt-[3px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-d-acc text-d-ink">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    <span className="[&_strong]:font-bold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {toc.length > 0 && (
              <nav aria-label="Cuprins" className="border-t border-d-acc/40 bg-d-card/60 px-5 py-4 sm:px-7">
                <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">În acest ghid</p>
                <ol className="m-0 mt-2 grid list-none gap-x-6 gap-y-1.5 p-0 text-[15px] sm:grid-cols-2">
                  {toc.map(([id, label], i) => (
                    <li key={id}>
                      <a href={`#${id}`} className="text-d-ink underline decoration-d-line underline-offset-4 hover:decoration-d-acc">
                        <span className="text-d-muted">{i + 1}.</span> {label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </Section>

        <Section
          reveal={false}
          className="mt-4 max-w-[820px] text-[17px] leading-[1.75] text-d-body [&_a]:font-semibold [&_a]:text-d-ink [&_a]:underline [&_a]:decoration-d-acc [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.03em] [&_h2]:text-d-ink sm:[&_h2]:text-[30px] [&_li]:mb-2 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_table]:my-4 [&_table]:w-full [&_table]:min-w-[560px] [&_table]:border-collapse [&_table]:text-[15px] [&_td]:border-b [&_td]:border-d-line [&_td]:p-2 [&_td]:align-top [&_th]:border-b-2 [&_th]:border-d-line [&_th]:p-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-d-ink [&_td:first-child]:font-semibold [&_td:first-child]:text-d-ink"
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

        {/* Every guide links to every other guide and back to the money page
            (rule 5 in content-and-seo.md): new guides join automatically via
            CAZIERFISCAL_GUIDES. */}
        <Section reveal={false} className="mt-12 max-w-[820px]">
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Citește și</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link href="/" className="flex flex-col gap-1 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
              <span className="text-[16px] font-bold text-d-ink">Cazier fiscal online, prin avocat</span>
              <span className="text-[14px] leading-[1.5] text-d-muted">Ce primești, cât costă și cum comanzi, fără cont SPV.</span>
            </Link>
            {CAZIERFISCAL_GUIDES.filter((g) => g.href !== path).map((g) => (
              <Link key={g.href} href={g.href} className="flex flex-col gap-1 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
                <span className="text-[16px] font-bold text-d-ink">{g.label}</span>
                <span className="text-[14px] leading-[1.5] text-d-muted">{g.hint}</span>
              </Link>
            ))}
          </div>
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
