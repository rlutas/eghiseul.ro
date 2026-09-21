import Link from 'next/link';
import type { ReactNode } from 'react';
import { fmtDateRo, LAWYER } from '@/lib/documentero/content';

/**
 * Small building blocks for documentero.ro pages. Same names and roles as in
 * the design generator, so a page reads like its artboard. Colors come from the
 * `d-*` theme tokens (globals.css), never from hex in components.
 */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[13px] font-bold uppercase tracking-[0.1em] text-d-acc">{children}</p>;
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`m-0 text-[32px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[40px] ${className}`}>
      {children}
    </h2>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-d-line bg-d-card transition-[transform,box-shadow,border-color] duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
}

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Check({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Btn({
  href,
  children,
  primary = true,
  className = '',
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  className?: string;
}) {
  const base = 'inline-flex h-14 items-center gap-2.5 rounded-xl px-6 text-[17px] font-bold transition-[transform,opacity,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_10px_24px_rgba(15,42,34,0.12)] active:translate-y-0';
  const look = primary ? 'bg-d-acc text-d-ink' : 'border-[1.5px] border-d-line bg-d-card text-d-ink font-semibold';
  return (
    <Link href={href} className={`${base} ${look} ${className}`}>
      {children}
      {primary && <Arrow />}
    </Link>
  );
}

/**
 * Page section: the content column plus the scroll-reveal hook (`data-reveal`,
 * see reveal.tsx). `reveal={false}` for a hero that animates on its own.
 * Vertical rhythm lives in `className` — the scale is 24/32 (96/128 px)
 * between sections, 20/28 for sub-sections, 10 for a strip glued to the
 * block above it.
 */
export function Section({
  children,
  className = '',
  id,
  reveal = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  reveal?: boolean;
}) {
  return (
    <section id={id} data-reveal={reveal ? '' : undefined} className={`mx-auto w-full max-w-[1312px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

export function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="flex flex-col">
      {items.map(({ q, a }) => (
        <details key={q} className="group border-t border-d-line py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[18px] font-bold">
            <span>{q}</span>
            <span className="mt-1 text-d-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p className="m-0 mt-2 text-[15px] leading-relaxed text-d-muted">{a}</p>
        </details>
      ))}
      <div className="border-t border-d-line" />
    </div>
  );
}

export function Prose({ paras }: { paras: string[] }) {
  return (
    <>
      {paras.map((t) => (
        <p key={t.slice(0, 40)} className="m-0 text-[17px] leading-[1.7] text-d-body">
          {t}
        </p>
      ))}
    </>
  );
}

export function ActeList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <Check className="mt-0.5 shrink-0 text-d-acc" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** "La ghișeu, singur / Prin documentero.ro" — honest comparison. */
export function CompareTable({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <Card className="pb-1.5 pt-5">
      <div className="hidden grid-cols-[1.4fr_1fr_1fr] px-5 pb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-d-muted sm:grid">
        <span />
        <span>La ghișeu, singur</span>
        <span className="text-d-acc">Prin documentero.ro</span>
      </div>
      {rows.map(([a, b, c]) => (
        <div key={a} className="grid grid-cols-1 gap-1 border-t border-d-line px-5 py-3.5 text-[15px] sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-0">
          <span className="font-semibold">{a}</span>
          <span className="text-d-muted">
            <span className="sm:hidden">La ghișeu: </span>
            {b}
          </span>
          <span>
            <span className="sm:hidden">Prin noi: </span>
            {c}
          </span>
        </div>
      ))}
    </Card>
  );
}

export function Initials({ text, tone = 0, size = 44 }: { text: string; tone?: 0 | 1 | 2; size?: number }) {
  const bg = ['bg-d-soft', 'bg-[#CFEDE0]', 'bg-[#BFE6D3]'][tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-d-ink ${bg}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {text}
    </span>
  );
}

/** Placeholder for a REAL photo we do not have yet (team, lawyer). Never a generated face. */
export function PhotoSlot({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-end rounded-2xl p-3.5 ${className}`}
      style={{
        background:
          'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 12px, rgba(0,0,0,0.02) 12px 24px), #E9E4DB',
      }}
      role="img"
      aria-label={`Fotografie: ${label}`}
    >
      <span className="rounded-md bg-white/85 px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5A554C]">
        Foto · {label}
      </span>
    </div>
  );
}

/** The step-1 illustration: a phone with the signature pad, drawn, no image. */
export function PhoneSignatureMock() {
  return (
    <div className="flex h-[200px] w-full items-end justify-center overflow-hidden bg-d-soft">
      <div className="flex h-[170px] w-[200px] flex-col gap-2.5 rounded-t-[28px] border-x-[6px] border-t-[6px] border-d-ink bg-d-card px-4 pt-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-d-muted">Pasul 6 · Semnătură</span>
        <div className="relative h-16 rounded-[10px] border-[1.5px] border-dashed border-d-line">
          <svg width="150" height="50" viewBox="0 0 150 50" fill="none" className="absolute left-2.5 top-1.5" aria-hidden="true">
            <path d="M6 36c14-30 22-28 26-6s6 22 18-4 16-24 24-2 14 20 22-6 12-12 26 4 18 8 22 0" stroke="var(--d-ink)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex h-[34px] items-center justify-center rounded-lg bg-d-acc text-[12px] font-bold text-d-ink">Semnez și continui</div>
      </div>
    </div>
  );
}

/** A civil-status certificate drawn as a paper object; no real data on it. */
export function CertificateMock() {
  return (
    <div className="flex h-[240px] w-full items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,var(--d-soft),#EEF6F1)]">
      <div className="flex h-[200px] w-[300px] -rotate-[4deg] flex-col gap-2.5 border border-[#D9D2C3] bg-[#FFFDF8] p-[18px_20px] shadow-[0_16px_40px_rgba(15,42,34,0.18)]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.14em] text-[#6E6A62]">România · Stare civilă</span>
          <span className="h-[26px] w-[26px] rounded-full border-2 border-[#C8401F] opacity-70" />
        </div>
        <span className="text-[15px] font-bold text-[#1C1A17]">CERTIFICAT DE NAȘTERE</span>
        <div className="flex flex-col gap-1.5">
          {[
            [60, 120],
            [70, 90],
            [50, 140],
            [64, 100],
          ].map(([a, b]) => (
            <div key={`${a}-${b}`} className="flex items-center gap-2">
              <span className="h-1.5 rounded-[3px] bg-[#E4DFD4]" style={{ width: a }} />
              <span className="h-1.5 rounded-[3px] bg-[#CFC8B8]" style={{ width: b }} />
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between">
          <span className="h-1.5 w-[90px] rounded-[3px] bg-[#E4DFD4]" />
          <svg width="70" height="26" viewBox="0 0 70 26" fill="none" aria-hidden="true">
            <path d="M3 18c8-16 12-14 14-3s4 12 10-2 8-12 12-1 6 10 10-2 6-6 12 2 8 4 8 0" stroke="#1C1A17" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * "Pe scurt": the 40–60 word answer right under the hero, written the way a
 * search engine or an AI summary would quote it (who issues, who may request,
 * legal basis, term, state fee). One per service page.
 */
export function QuickAnswer({ children, updated }: { children: ReactNode; updated: string }) {
  return (
    <Section className="mt-14 lg:mt-20">
      <Card className="flex flex-col gap-3 border-l-4 border-l-d-acc p-6 sm:p-7">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
        <p className="m-0 text-[17px] leading-[1.6] text-d-body sm:text-[18px]">{children}</p>
        <UpdatedLine date={updated} />
      </Card>
    </Section>
  );
}

/** "Actualizat la 21 septembrie 2026 · cererile le depune av. …" — the same date feeds dateModified in the schema. */
export function UpdatedLine({ date }: { date: string }) {
  return (
    <p className="m-0 text-[13px] text-d-muted">
      Actualizat la {fmtDateRo(date)} · cererile le depune{' '}
      <Link href="/despre/" className="font-semibold text-d-ink underline underline-offset-2 hover:text-d-acc">
        av. {LAWYER.name}, Baroul Satu Mare
      </Link>
    </p>
  );
}

/** "Ai nevoie și de": three cards to the sister services and guides. */
export function RelatedServices({ items, title = 'Ai nevoie și de' }: { items: Array<[string, string, string]>; title?: string }) {
  return (
    <Section className="mt-24 flex flex-col gap-5 lg:mt-32">
      <H2 className="sm:text-[28px]">{title}</H2>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map(([t, d, h]) => (
          <Link key={t} href={h} className="flex flex-col gap-2 rounded-2xl border border-d-line bg-d-card p-6 hover:border-d-acc">
            <span className="text-[17px] font-bold">{t}</span>
            <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
            <span className="text-[15px] font-bold text-d-acc">Vezi →</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/** A plain data table (countries, sectors): header row + rows, stacked on phones. */
export function InfoTable({ head, rows }: { head: string[]; rows: string[][] }) {
  const cols = { gridTemplateColumns: `1.3fr repeat(${head.length - 1}, 1fr)` };
  return (
    <Card className="overflow-hidden">
      <div className="hidden gap-4 px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-d-muted sm:grid" style={cols}>
        {head.map((h) => <span key={h}>{h}</span>)}
      </div>
      {rows.map((r) => (
        <div key={r[0]} className="flex flex-col gap-1 border-t border-d-line px-5 py-3.5 text-[15px] sm:grid sm:gap-4" style={cols}>
          {r.map((c, i) => (
            <span key={`${r[0]}-${i}`} className={i === 0 ? 'font-semibold' : 'text-d-body'}>
              {i > 0 && <span className="text-d-muted sm:hidden">{head[i]}: </span>}
              {c}
            </span>
          ))}
        </div>
      ))}
    </Card>
  );
}

/** The long content block shared by the service pages (intro + acte + table + diaspora + guides). */
export function SeoBlock({
  title,
  intro,
  acte,
  rows,
  diasporaTitle,
  diaspora,
  guides,
}: {
  title: string;
  intro: string[];
  acte: string[];
  rows: Array<[string, string, string]>;
  diasporaTitle: string;
  diaspora: string[];
  /** A guide without `href` is in the writing queue: rendered as text, never linked to the index. */
  guides: Array<{ title: string; desc: string; href?: string }>;
}) {
  return (
    <>
      <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <H2 className="sm:text-[36px]">{title}</H2>
          <Prose paras={intro} />
        </div>
        <Card className="flex flex-col gap-3.5 self-start p-6 lg:col-span-4 lg:col-start-9">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Acte necesare</span>
          <ActeList items={acte} />
          <span className="text-[13px] text-d-muted">Nu ai nevoie de programare și nici de certificatul vechi.</span>
        </Card>
      </Section>
      <Section className="mt-20 flex flex-col gap-5 lg:mt-28">
        <H2 className="sm:text-[32px]">La ghișeu sau prin noi: ce diferă</H2>
        <CompareTable rows={rows} />
        <p className="m-0 text-[14px] text-d-muted">
          Îl poți obține și singur, gratuit sau cu o taxă locală de câțiva lei. Noi vindem drumul, dosarul și
          urmărirea, făcute de un avocat.
        </p>
      </Section>
      <Section className="mt-20 grid gap-6 lg:mt-28 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-4">
          <Eyebrow>Diaspora</Eyebrow>
          <H2 className="sm:text-[32px]">{diasporaTitle}</H2>
        </div>
        <div className="flex flex-col gap-3.5 lg:col-span-8">
          <Prose paras={diaspora} />
        </div>
      </Section>
      <Section className="mt-20 flex flex-col gap-4 lg:mt-28">
        <H2 className="sm:text-[28px]">Ghiduri pe subiect</H2>
        <div className="grid gap-4 sm:grid-cols-3">
          {guides.map((g) =>
            g.href ? (
              <Link key={g.title} href={g.href} className="flex flex-col gap-1.5 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
                <span className="text-[16px] font-bold leading-[1.3]">{g.title}</span>
                <span className="text-[13px] text-d-muted">{g.desc}</span>
              </Link>
            ) : (
              <div key={g.title} className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-d-line p-5 opacity-80">
                <span className="text-[16px] font-bold leading-[1.3]">{g.title}</span>
                <span className="text-[13px] text-d-muted">{g.desc} · în lucru</span>
              </div>
            ),
          )}
        </div>
      </Section>
    </>
  );
}
