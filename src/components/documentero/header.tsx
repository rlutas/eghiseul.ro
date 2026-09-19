import Link from 'next/link';
import { DOCUMENTERO_NAV } from '@/config/documentero-nav';
import { DocumenteroLogo } from './logo';

/**
 * documentero.ro header — server component, no auth state, no client JS.
 * Used by the documentero public pages AND by the shared wizard/checkout/
 * account routes when they are served on the documentero host
 * (src/app/(order)/layout.tsx). Design: docs/documentero/design.md.
 */
export function HeaderDocumentero({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-d-line bg-d-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1312px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="documentero.ro — Acasă" className="shrink-0">
          <DocumenteroLogo size={22} />
        </Link>
        <nav aria-label="Servicii" className="hidden items-center gap-7 text-[15px] font-medium text-d-ink lg:flex">
          {DOCUMENTERO_NAV.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'border-b-2 border-d-acc pb-0.5' : 'hover:opacity-80'}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/account/" className="hidden text-[15px] font-medium text-d-ink hover:opacity-80 sm:inline">
            Contul meu
          </Link>
          <Link
            href="/comanda/certificat-nastere/"
            className="inline-flex h-11 items-center rounded-[10px] bg-d-ink px-5 text-[15px] font-bold text-d-bg hover:opacity-90"
          >
            Comandă online
          </Link>
        </div>
      </div>
    </header>
  );
}
