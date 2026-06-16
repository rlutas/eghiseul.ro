'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface MobileStickyCTAProps {
  /** Order wizard target, e.g. `/comanda/extras-carte-funciara`. */
  href: string;
  /** Ex-VAT price already formatted (e.g. "73,55"). */
  priceLabel: string;
  /** Total-with-VAT price already formatted (e.g. "89"). */
  totalLabel: string;
  ctaLabel?: string;
}

/**
 * Mobile-only sticky bottom CTA bar — the single biggest conversion lever on
 * phones (most of our traffic). Slides up after the user scrolls past the hero
 * so it never competes with the hero CTA. Respects the iOS home-indicator safe
 * area. Hidden on lg+ (desktop keeps the in-page price card).
 */
export function MobileStickyCTA({ href, priceLabel, totalLabel, ctaLabel = 'Comandă acum' }: MobileStickyCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 motion-reduce:transition-none ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-2.5 pl-4 shadow-[0_-2px_24px_rgba(6,16,31,0.18)]">
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] text-neutral-500">de la</span>
          <span className="text-lg font-black text-secondary-900">
            {priceLabel} <span className="text-xs font-semibold text-neutral-400">+TVA</span>
          </span>
          <span className="text-[11px] text-neutral-500">{totalLabel} RON cu TVA</span>
        </div>
        <Link
          href={href}
          className="ml-auto inline-flex h-12 flex-1 max-w-[60%] items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 text-base font-bold text-secondary-900 shadow-[0_4px_14px_rgba(236,185,95,0.45)] transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
        >
          {ctaLabel}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
