'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, CornerDownLeft, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { SERVICES_NAV } from '@/config/services-nav';
import { normalizeText } from '@/lib/services/service-search';
import { cn } from '@/lib/utils';

interface FlatService {
  name: string;
  href: string;
  category: string;
  icon: LucideIcon;
  /** Diacritic-stripped searchable text (name + category). */
  haystack: string;
}

// Flatten the curated menu (groups → items → children) into one searchable list.
const FLAT_SERVICES: FlatService[] = SERVICES_NAV.flatMap((group) =>
  group.items.flatMap((item) => {
    const entries: FlatService[] = [
      {
        name: item.name,
        href: item.href,
        category: group.category,
        icon: item.icon,
        haystack: normalizeText(`${item.name} ${group.category}`),
      },
    ];
    for (const child of item.children ?? []) {
      // Skip children that just re-point to the parent href (e.g. Constatator
      // Firmă/PF/Istoric all open the same page) — they add noise, not targets.
      if (child.href === item.href) continue;
      entries.push({
        name: `${item.name} — ${child.name}`,
        href: child.href,
        category: group.category,
        icon: child.icon,
        haystack: normalizeText(`${item.name} ${child.name} ${group.category}`),
      });
    }
    return entries;
  })
);

/**
 * Header search: a button that opens a lightweight command-palette dialog for
 * jumping straight to a service. Works on every page; especially handy on
 * mobile. `className` styles the trigger for its placement (desktop / mobile).
 */
export function HeaderServiceSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return FLAT_SERVICES;
    return FLAT_SERVICES.filter((s) => tokens.every((t) => s.haystack.includes(t)));
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery('');
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Caută serviciu"
          className={cn(
            'flex items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-neutral-100 hover:text-secondary-900',
            className
          )}
        >
          <Search className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="top-[12%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0 sm:top-[15%]">
        <DialogTitle className="sr-only">Caută serviciu</DialogTitle>

        <div className="flex items-center gap-3 border-b border-neutral-100 px-4">
          <Search className="h-5 w-5 shrink-0 text-neutral-400" />
          <input
            autoFocus
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) go(results[0].href);
            }}
            placeholder="Caută un serviciu…"
            aria-label="Caută un serviciu"
            className="h-14 w-full bg-transparent text-[15px] text-secondary-900 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="max-h-[min(60vh,380px)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-neutral-500">
              Niciun serviciu găsit.{' '}
              <Link href="/servicii/" onClick={() => go('/servicii/')} className="font-semibold text-primary-700">
                Vezi toate serviciile
              </Link>
            </p>
          ) : (
            results.map((s) => (
              <button
                key={`${s.href}-${s.name}`}
                type="button"
                onClick={() => go(s.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-secondary-900">{s.name}</span>
                  <span className="block text-xs text-neutral-400">{s.category}</span>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="hidden items-center gap-2 border-t border-neutral-100 px-4 py-2 text-xs text-neutral-400 sm:flex">
          <CornerDownLeft className="h-3.5 w-3.5" />
          <span>Enter pentru primul rezultat</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
