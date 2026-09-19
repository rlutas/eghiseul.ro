import Link from 'next/link';
import { DOCUMENTERO_NAV } from '@/config/documentero-nav';
import { DocumenteroWordmark } from './wordmark';

/**
 * documentero.ro header — server component, no auth state, no client JS.
 * Used by the documentero public pages AND by the shared wizard/checkout/
 * account routes when they are served on the documentero host (see
 * src/app/(order)/layout.tsx).
 *
 * Visual direction is being chosen (Claude Design canvas, 19.09.2026); this
 * is the structure, restyled once A/B/C is picked.
 */
export function HeaderDocumentero() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1C1A17]/15 bg-[#F3EEE4]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="documentero.ro — Acasă" className="shrink-0">
          <DocumenteroWordmark className="h-7" />
        </Link>
        <nav aria-label="Servicii" className="hidden items-center gap-6 text-[14px] font-medium text-[#1C1A17] lg:flex">
          {DOCUMENTERO_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#C8401F]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/account/" className="hidden text-[14px] font-medium text-[#1C1A17] hover:text-[#C8401F] sm:inline">
            Contul meu
          </Link>
          <Link
            href="/comanda/certificat-nastere/"
            className="inline-flex h-11 items-center rounded-md bg-[#1C1A17] px-4 text-[14px] font-semibold text-[#F3EEE4] hover:bg-[#C8401F]"
          >
            Comandă
          </Link>
        </div>
      </div>
    </header>
  );
}
