'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { SERVICES_NAV } from '@/config/services-nav';

/**
 * Desktop "Servicii" mega-menu. The trigger is a real link to the /servicii/
 * index (keyboard + no-JS fallback); the panel reveals on hover/focus-within.
 * Pure CSS — no state, hydration-safe. The `pt-3` on the panel wrapper is a
 * hover bridge so moving the cursor from trigger to panel doesn't close it.
 */
export function ServicesMegaMenu() {
  return (
    <div className="relative group">
      <Link
        href="/servicii/"
        className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50 transition-all duration-200 group-hover:text-secondary-900 group-hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-haspopup="true"
      >
        Servicii
        <ChevronDown className="h-4 w-4 transition-transform duration-200 motion-reduce:transition-none group-hover:rotate-180" />
      </Link>

      {/* Panel */}
      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 motion-reduce:transition-none absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
        <div className="w-[680px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(6,16,31,0.16)] border border-neutral-100 p-6">
          <div className="grid grid-cols-3 gap-x-6 gap-y-6">
            {SERVICES_NAV.map((group) => (
              <div key={group.category}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700 mb-3">
                  {group.category}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <item.icon className="h-4 w-4" />
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <Link
              href="/servicii/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
            >
              Vezi toate serviciile
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
