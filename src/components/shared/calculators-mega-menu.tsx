'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Calculator } from 'lucide-react';
import { CALCULATORS_NAV } from '@/config/calculators-nav';
import { cn } from '@/lib/utils';

/**
 * Desktop "Calculatoare" mega-menu — same accessible disclosure pattern as
 * ServicesMegaMenu (hover + click/keyboard, Escape/outside/blur close,
 * hydration-safe). Grupat pe categorii din CALCULATORS_NAV.
 */
export function CalculatorsMegaMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="calculators-megamenu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 aria-expanded:text-secondary-900 aria-expanded:bg-neutral-50"
      >
        Calculatoare
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Panel — pt-3 is a hover bridge between trigger and panel */}
      <div
        id="calculators-megamenu"
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 transition-all duration-200 motion-reduce:transition-none',
          open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-1'
        )}
      >
        <nav
          aria-label="Toate calculatoarele"
          className="w-[680px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(6,16,31,0.16)] border border-neutral-100 p-6"
        >
          <div className="grid grid-cols-3 gap-x-6 gap-y-6">
            {CALCULATORS_NAV.map((group) => (
              <div key={group.category}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700 mb-3">
                  {group.category}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/calculator/"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              Vezi toate calculatoarele
              <ChevronDown className="h-4 w-4 -rotate-90" aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
              <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
              Gratuite, actualizate 2026
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
}
