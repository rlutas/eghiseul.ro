import Link from 'next/link';
import {
  DOCUMENTERO_NAV,
  DOCUMENTERO_SERVICES_MENU,
  DOCUMENTERO_TRACK_HREF,
  documenteroOrderHref,
  type DocumenteroServiceIcon,
} from '@/config/documentero-nav';
import { DocumenteroLogo } from './logo';

/**
 * documentero.ro header — server component, no auth state, no client JS.
 * Used by the documentero public pages AND by the shared wizard/checkout/
 * status routes when they are served on the documentero host
 * (src/app/(order)/layout.tsx). Design: docs/documentero/design.md.
 *
 * - `active` is the public path of the current page (e.g. `/certificat-de-nastere/`);
 *   a service page lights up "Servicii".
 * - "Servicii" opens a mega menu (hover / keyboard focus-within) with all five
 *   services: icon, hint, link to the page and a "Comandă" button straight to
 *   the wizard. Ghiduri, Despre, Contact are plain links.
 * - No "Contul meu": documentero sells without an account. The right-hand
 *   link is order tracking, the same `/comanda/status/` page as on eghiseul.
 * - Under 1024px: a <details> menu — works without JavaScript.
 */
export function HeaderDocumentero({ active }: { active?: string }) {
  const path = (active ?? '').split('#')[0];
  const onService = DOCUMENTERO_SERVICES_MENU.some((s) => s.href.split('#')[0] === path);

  return (
    <header className="sticky top-0 z-40 border-b border-d-line bg-d-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1312px] items-center justify-between gap-3 px-3 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" aria-label="documentero.ro — Acasă" className="shrink-0 transition-opacity hover:opacity-85">
          {/* Smaller lockup under 640px so logo + CTA + burger fit a 360px phone */}
          <span className="sm:hidden"><DocumenteroLogo size={18} /></span>
          <span className="hidden sm:inline"><DocumenteroLogo size={22} /></span>
        </Link>

        <nav aria-label="Meniu principal" className="hidden items-center gap-1 whitespace-nowrap text-[15px] font-medium text-d-ink lg:flex">
          {DOCUMENTERO_NAV.map((item) => {
            const current = item.mega ? onService : item.href === path;
            return item.mega ? (
              <MegaMenu key={item.href} label={item.label} href={item.href} current={current} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 transition-colors ${current ? 'bg-d-soft text-d-ink' : 'hover:bg-d-soft/60'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={DOCUMENTERO_TRACK_HREF}
            className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-[10px] px-3 text-[15px] font-medium text-d-ink transition-colors hover:bg-d-soft/60 sm:inline-flex"
          >
            <TrackIcon />
            Urmărește comanda
          </Link>
          <Link
            href="/#acte"
            className="inline-flex h-11 items-center whitespace-nowrap rounded-[10px] bg-d-ink px-3.5 text-[15px] font-bold text-d-bg transition-[transform,opacity] duration-200 hover:-translate-y-px hover:opacity-90 sm:px-5"
          >
            <span className="sm:hidden">Comandă</span>
            <span className="hidden sm:inline">Comandă online</span>
          </Link>
          <MobileMenu active={path} />
        </div>
      </div>
    </header>
  );
}

function MegaMenu({ label, href, current }: { label: string; href: string; current: boolean }) {
  return (
    <div className="group relative">
      <Link
        href={href}
        aria-haspopup="true"
        aria-current={current ? 'page' : undefined}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors ${current ? 'bg-d-soft text-d-ink' : 'hover:bg-d-soft/60'}`}
      >
        {label}
        <Chevron />
      </Link>
      {/* Hover on a pointer device, focus-within for the keyboard. The pt-3
          bridge keeps the panel open while the cursor travels down to it. */}
      <div className="invisible absolute left-0 top-full z-50 translate-y-1 pt-3 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-out group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="w-[840px] rounded-[20px] border border-d-line bg-d-card p-3 shadow-[0_28px_60px_rgba(15,42,34,0.16)]">
          <div className="grid grid-cols-2 gap-1">
            {DOCUMENTERO_SERVICES_MENU.map((s) => (
              <div key={s.href} className="group/item flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-d-soft/60">
                <Link href={s.href} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-d-soft text-d-ink transition-colors group-hover/item:bg-d-acc">
                    <ServiceIcon kind={s.icon} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-bold leading-tight text-d-ink">{s.label}</span>
                    <span className="truncate text-[13px] text-d-muted">{s.hint}</span>
                  </span>
                </Link>
                <Link
                  href={documenteroOrderHref(s.orderSlug)}
                  className="inline-flex h-9 shrink-0 items-center rounded-lg border border-d-line bg-d-card px-3 text-[13px] font-bold text-d-ink transition-colors hover:border-d-acc hover:bg-d-acc"
                >
                  Comandă
                </Link>
              </div>
            ))}
            <Link
              href="/#acte"
              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-d-line p-3 text-[14px] font-semibold text-d-muted transition-colors hover:border-d-acc hover:text-d-ink"
            >
              Toate actele, cu prețuri și termene
              <Arrow />
            </Link>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-d-line px-3 pt-3 text-[13px] text-d-muted">
            <span>Un avocat depune, tu semnezi pe telefon. Curier oriunde.</span>
            <Link href="/despre/" className="font-semibold text-d-ink hover:text-d-acc">Cine suntem</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ active }: { active: string }) {
  return (
    <details className="group relative lg:hidden">
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-d-line bg-d-card text-d-ink transition-colors hover:bg-d-soft/60 [&::-webkit-details-marker]:hidden"
        aria-label="Meniu"
      >
        <span className="group-open:hidden"><BurgerIcon /></span>
        <span className="hidden group-open:inline"><CloseIcon /></span>
      </summary>
      <nav
        aria-label="Meniu principal"
        className="absolute right-0 top-[calc(100%+10px)] z-50 flex w-[min(92vw,380px)] flex-col gap-1 rounded-2xl border border-d-line bg-d-card p-2 shadow-[0_24px_48px_rgba(15,42,34,0.14)]"
      >
        <span className="px-3 pb-1 pt-2 text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Servicii</span>
        {DOCUMENTERO_SERVICES_MENU.map((s) => {
          const current = s.href.split('#')[0] === active;
          return (
            <div key={s.href} className={`flex items-center gap-2 rounded-xl ${current ? 'bg-d-soft' : ''}`}>
              <Link href={s.href} aria-current={current ? 'page' : undefined} className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-d-ink hover:bg-d-soft/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-d-soft text-d-ink"><ServiceIcon kind={s.icon} size={18} /></span>
                {s.label}
              </Link>
              <Link href={documenteroOrderHref(s.orderSlug)} className="mr-2 rounded-lg bg-d-acc px-2.5 py-1.5 text-[12px] font-bold text-d-ink">
                Comandă
              </Link>
            </div>
          );
        })}
        <div className="my-1 border-t border-d-line" />
        {DOCUMENTERO_NAV.filter((i) => !i.mega).map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={i.href === active ? 'page' : undefined}
            className={`rounded-xl px-3 py-2.5 text-[15px] font-semibold ${i.href === active ? 'bg-d-soft text-d-ink' : 'text-d-ink hover:bg-d-soft/60'}`}
          >
            {i.label}
          </Link>
        ))}
        <Link
          href={DOCUMENTERO_TRACK_HREF}
          className="mt-1 flex items-center gap-2 rounded-xl border-t border-d-line px-3 py-3 text-[15px] font-semibold text-d-ink hover:bg-d-soft/60"
        >
          <TrackIcon />
          Urmărește comanda
        </Link>
      </nav>
    </details>
  );
}

/** Line icons for the five services — one per document type, drawn in the brand ink. */
function ServiceIcon({ kind, size = 20 }: { kind: DocumenteroServiceIcon; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (kind) {
    case 'nastere':
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M15 3v4h4" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case 'casatorie':
      return (
        <svg {...common}>
          <circle cx="9" cy="13" r="5" />
          <circle cx="15" cy="13" r="5" />
          <path d="M12 4l1.5 2.5h-3z" />
        </svg>
      );
    case 'celibat':
      return (
        <svg {...common}>
          <circle cx="10" cy="8" r="3.5" />
          <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
          <path d="m15 15 2 2 4-4" />
        </svg>
      );
    case 'ue':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
      );
  }
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-200 group-hover:rotate-180">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
