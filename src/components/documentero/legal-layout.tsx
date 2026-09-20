import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeaderDocumentero } from './header';
import { Eyebrow, Section } from './ui';

/**
 * Shared frame for the documentero.ro legal pages (termeni, confidențialitate,
 * anulare, cookies): header lit on the page's path, a small breadcrumb, the
 * title with the last-updated date, then one prose column. Same obligations
 * as src/components/legal/legal-layout.tsx (eghiseul), documentero's look:
 * colors only from the `d-*` tokens, headings in ink, body in `d-body`,
 * links underlined. No `prose` plugin here — the selectors below are the
 * whole style, so a legal page reads the same wherever it is rendered.
 */
const PROSE =
  'max-w-[760px] text-[17px] leading-[1.7] text-d-body ' +
  '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:leading-[1.2] [&_h2]:tracking-[-0.02em] [&_h2]:text-d-ink ' +
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:text-d-ink ' +
  '[&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_li]:pl-1 [&_li]:marker:text-d-acc ' +
  '[&_a]:text-d-ink [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-d-acc hover:[&_a]:decoration-d-ink ' +
  '[&_strong]:font-bold [&_strong]:text-d-ink ' +
  '[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[15px] ' +
  '[&_th]:border-b [&_th]:border-d-line [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-d-ink ' +
  '[&_td]:border-b [&_td]:border-d-line [&_td]:px-3 [&_td]:py-2 [&_td]:align-top ' +
  '[&_code]:rounded [&_code]:bg-d-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[14px] [&_code]:text-d-ink';

export function LegalLayoutDocumentero({
  title,
  path,
  updated = '20 septembrie 2026',
  children,
}: {
  title: string;
  /** Public path of the page, with trailing slash (lights the header, breadcrumb). */
  path: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <HeaderDocumentero active={path} />
      <main id="main-content">
        <Section reveal={false} className="mt-12 lg:mt-20">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[14px] text-d-muted">
            <Link href="/" className="hover:text-d-ink">Acasă</Link>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-d-ink">{title}</span>
          </nav>
          <Eyebrow>Documente legale</Eyebrow>
          <h1 className="m-0 mt-3 max-w-[760px] text-[36px] font-bold leading-[1.05] tracking-[-0.035em] text-d-ink sm:text-[48px]">
            {title}
          </h1>
          <p className="m-0 mt-4 text-[15px] text-d-muted">Actualizat la {updated}</p>
        </Section>
        <Section reveal={false} className="mt-10 lg:mt-14">
          <article className={PROSE}>{children}</article>
        </Section>
      </main>
    </>
  );
}
