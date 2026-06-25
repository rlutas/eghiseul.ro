'use client';

import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { serviceUrl } from '@/lib/seo';
import { cn } from '@/lib/utils';
import type { SwitcherService } from '@/lib/services/imobiliare';

interface ServiceSwitcherProps {
  services: SwitcherService[];
  currentSlug: string;
  /** 'order' → navigate to /comanda/<slug>; 'page' → navigate to the service page. */
  mode: 'order' | 'page';
  /** Inline (label + select on one row, stacks on mobile) vs stacked card. */
  inline?: boolean;
  className?: string;
}

/**
 * Dropdown that lets the user switch between cadastral (imobiliare) services
 * without losing context — mirrors cfunciara.ro's service-type selector.
 * 'order' mode jumps between order wizards; 'page' mode between service pages.
 */
export function ServiceSwitcher({ services, currentSlug, mode, inline, className }: ServiceSwitcherProps) {
  const router = useRouter();

  if (!services || services.length < 2) return null;

  const handleChange = (slug: string) => {
    if (slug === currentSlug) return;
    const href = mode === 'order' ? `/comanda/${slug}` : serviceUrl(slug);
    router.push(href);
  };

  const select = (
    <div className={cn('relative', inline ? 'w-full sm:max-w-xs' : 'w-full')}>
      <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600" />
      <select
        id="service-switcher"
        aria-label="Alt document cadastral"
        value={currentSlug}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-neutral-300 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-secondary-900 shadow-sm transition-colors hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      >
        {services.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  );

  if (inline) {
    return (
      <div className={cn('flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3', className)}>
        <label htmlFor="service-switcher" className="text-sm font-medium text-secondary-900 sm:shrink-0">
          Alt document cadastral?
        </label>
        {select}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor="service-switcher" className="mb-1.5 block text-sm font-medium text-secondary-900">
        Alt document cadastral?
      </label>
      {select}
    </div>
  );
}
