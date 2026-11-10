import Link from 'next/link';
import { CAZIERFISCAL_NAV, CAZIERFISCAL_ORDER_HREF, CAZIERFISCAL_TRACK_HREF } from '@/config/cazierfiscal-nav';
import { CazierFiscalLogo } from './logo';

/**
 * cazier-fiscal.ro header: server component, no client JS. Used by the public
 * pages and by the shared wizard/checkout/status routes on this host
 * (src/app/(order)/layout.tsx). Under 1024px the links sit in a <details>
 * menu, which works without JavaScript. The order button is always visible.
 */
export function HeaderCazierFiscal({ active }: { active?: string }) {
  const path = (active ?? '').split('#')[0];
  return (
    <header className="sticky top-0 z-40 border-b border-d-line bg-d-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1312px] items-center justify-between gap-3 px-3 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" aria-label="cazier-fiscal.ro — Acasă" className="shrink-0 hover:opacity-85">
          <span className="sm:hidden"><CazierFiscalLogo size={17} /></span>
          <span className="hidden sm:inline"><CazierFiscalLogo size={20} /></span>
        </Link>

        <nav aria-label="Meniu principal" className="hidden items-center gap-1 whitespace-nowrap text-[15px] font-medium text-d-ink lg:flex">
          {CAZIERFISCAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === path ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 transition-colors ${item.href === path ? 'bg-d-soft' : 'hover:bg-d-soft/60'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={CAZIERFISCAL_TRACK_HREF}
            className="hidden h-11 items-center whitespace-nowrap rounded-[10px] px-3 text-[15px] font-medium text-d-ink hover:bg-d-soft/60 sm:inline-flex"
          >
            Urmărește comanda
          </Link>
          <Link
            href={CAZIERFISCAL_ORDER_HREF}
            className="inline-flex h-11 items-center whitespace-nowrap rounded-[10px] bg-d-ink px-3.5 text-[15px] font-bold text-d-bg hover:opacity-90 sm:px-5"
          >
            <span className="sm:hidden">Comandă</span>
            <span className="hidden sm:inline">Comandă cazierul fiscal</span>
          </Link>
          <details className="relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-d-line text-d-ink" aria-label="Meniu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <nav aria-label="Meniu mobil" className="absolute right-0 top-[52px] z-50 flex w-[250px] flex-col rounded-2xl border border-d-line bg-d-card p-2 shadow-[0_20px_50px_rgba(42,20,56,0.14)]">
              {CAZIERFISCAL_NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-d-ink hover:bg-d-soft/60">
                  {item.label}
                </Link>
              ))}
              <Link href={CAZIERFISCAL_TRACK_HREF} className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-d-ink hover:bg-d-soft/60">
                Urmărește comanda
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
