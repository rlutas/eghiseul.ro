import Link from 'next/link';
import { DOCUMENTERO_NAV, DOCUMENTERO_TRACK_HREF, documenteroOrderHref, type DocumenteroNavItem } from '@/config/documentero-nav';
import { DocumenteroLogo } from './logo';

/**
 * documentero.ro header — server component, no auth state, no client JS.
 * Used by the documentero public pages AND by the shared wizard/checkout/
 * status routes when they are served on the documentero host
 * (src/app/(order)/layout.tsx). Design: docs/documentero/design.md.
 *
 * - `active` is the public path of the current page (e.g. `/certificat-de-nastere/`).
 * - "Extras multilingv" opens a dropdown (hover / keyboard focus) with the
 *   two variants, each linking to its page and straight to its wizard.
 * - No "Contul meu": documentero sells without an account. The right-hand
 *   link is order tracking, the same `/comanda/status/` page as on eghiseul.
 * - Under 1280px (the five labels + tracking + CTA no longer fit on one
 *   line): a <details> menu — works without JavaScript, closes on navigation.
 */
export function HeaderDocumentero({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-d-line bg-d-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1312px] items-center justify-between gap-3 px-3 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" aria-label="documentero.ro — Acasă" className="shrink-0">
          {/* Smaller lockup under 640px so logo + CTA + burger fit a 360px phone */}
          <span className="sm:hidden"><DocumenteroLogo size={18} /></span>
          <span className="hidden sm:inline"><DocumenteroLogo size={22} /></span>
        </Link>

        <nav aria-label="Acte" className="hidden items-center gap-6 whitespace-nowrap text-[15px] font-medium text-d-ink xl:flex">
          {DOCUMENTERO_NAV.map((item) => (
            <DesktopItem key={item.href} item={item} active={active} />
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={DOCUMENTERO_TRACK_HREF}
            className="hidden items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-d-ink hover:opacity-80 sm:inline-flex"
          >
            <TrackIcon />
            Urmărește comanda
          </Link>
          <Link
            href="/#acte"
            className="inline-flex h-11 items-center whitespace-nowrap rounded-[10px] bg-d-ink px-3.5 text-[15px] font-bold text-d-bg hover:opacity-90 sm:px-5"
          >
            <span className="sm:hidden">Comandă</span>
            <span className="hidden sm:inline">Comandă online</span>
          </Link>
          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}

function isActive(item: DocumenteroNavItem, active?: string) {
  if (!active) return false;
  const path = active.split('#')[0];
  return item.href.split('#')[0] === path;
}

function DesktopItem({ item, active }: { item: DocumenteroNavItem; active?: string }) {
  const current = isActive(item, active);
  const linkClass = current ? 'border-b-2 border-d-acc pb-0.5' : 'hover:opacity-80';

  if (!item.children) {
    return (
      <Link href={item.href} className={linkClass} aria-current={current ? 'page' : undefined}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={`inline-flex items-center gap-1 ${linkClass}`}
        aria-current={current ? 'page' : undefined}
        aria-haspopup="true"
      >
        {item.label}
        <Chevron />
      </Link>
      {/* Hover on a pointer device, focus-within for the keyboard; a small
          invisible bridge keeps the menu open while the cursor travels down. */}
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="w-[340px] rounded-2xl border border-d-line bg-d-card p-2 shadow-[0_24px_48px_rgba(15,42,34,0.14)]">
          {item.children.map((c) => (
            <div key={c.href} className="flex items-center gap-3 rounded-xl p-3 hover:bg-d-soft/60">
              <Link href={c.href} className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-bold leading-tight text-d-ink">{c.label}</span>
                <span className="text-[13px] text-d-muted">{c.hint}</span>
              </Link>
              <Link
                href={documenteroOrderHref(c.orderSlug)}
                className="inline-flex h-9 shrink-0 items-center rounded-lg bg-d-acc px-3 text-[13px] font-bold text-d-ink hover:opacity-90"
              >
                Comandă
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ active }: { active?: string }) {
  return (
    <details className="group relative xl:hidden">
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-d-line bg-d-card text-d-ink [&::-webkit-details-marker]:hidden"
        aria-label="Meniu"
      >
        <span className="group-open:hidden"><BurgerIcon /></span>
        <span className="hidden group-open:inline"><CloseIcon /></span>
      </summary>
      <nav
        aria-label="Acte"
        className="absolute right-0 top-[calc(100%+10px)] z-50 flex w-[min(92vw,360px)] flex-col gap-1 rounded-2xl border border-d-line bg-d-card p-2 shadow-[0_24px_48px_rgba(15,42,34,0.14)]"
      >
        {DOCUMENTERO_NAV.map((item) => {
          const current = isActive(item, active);
          return (
            <div key={item.href} className="flex flex-col">
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`rounded-xl px-3 py-2.5 text-[15px] font-semibold ${current ? 'bg-d-soft text-d-ink' : 'text-d-ink hover:bg-d-soft/60'}`}
              >
                {item.label}
              </Link>
              {item.children?.map((c) => (
                <div key={c.href} className="ml-3 flex items-center gap-2 border-l-2 border-d-line pl-3">
                  <Link href={c.href} className="flex-1 rounded-lg px-2 py-2 text-[14px] text-d-body hover:bg-d-soft/60">
                    {c.label}
                  </Link>
                  <Link
                    href={documenteroOrderHref(c.orderSlug)}
                    className="rounded-lg bg-d-acc px-2.5 py-1.5 text-[12px] font-bold text-d-ink"
                  >
                    Comandă
                  </Link>
                </div>
              ))}
            </div>
          );
        })}
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

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:rotate-180">
      <path d="m6 9 6 6 6-6" />
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
