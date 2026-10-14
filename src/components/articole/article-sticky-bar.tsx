'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight, FileText, X } from 'lucide-react';
import type { ServiceCard } from '@/lib/articles/service-cards';
import { fmtPrice } from '@/lib/articles/service-cards';
import { TrackedLink } from './tracked-link';

const DISMISS_KEY = 'article_sticky_dismissed_until';
const DISMISS_MS = 24 * 60 * 60 * 1000;

/**
 * Phone/tablet bar (below xl, where articles have the rail; calculators pass
 * `allWidths` because they have no rail). Shows after ~30% of the
 * page, hides again near the bottom band (which already shows the same
 * product) and can be closed for a day. Small and closable on purpose: Google
 * penalizes overlays that cover the content on mobile, not a slim bottom bar.
 */
export function ArticleStickyBar({ card, allWidths = false }: { card: ServiceCard; allWidths?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Read once on mount (server render has no localStorage, so it starts hidden).
    const readDismissed = () => {
      try {
        setDismissed(Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now());
      } catch {
        setDismissed(false);
      }
    };
    readDismissed();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const band = document.getElementById('servicii-legate');
      const bandTop = band ? band.getBoundingClientRect().top : Infinity;
      setVisible(window.scrollY > max * 0.3 && bandTop > window.innerHeight);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tell the WhatsApp button to move up while the bar is on screen.
  const shown = visible && !dismissed;
  useEffect(() => {
    const root = document.documentElement;
    if (shown) root.dataset.stickyBar = allWidths ? 'all' : 'mobile';
    else delete root.dataset.stickyBar;
    return () => {
      delete root.dataset.stickyBar;
    };
  }, [shown, allWidths]);

  if (dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
    } catch {
      /* private mode: closes for this page view only */
    }
  };

  return (
    <div
      className={`${allWidths ? '' : 'xl:hidden '}fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 motion-reduce:transition-none ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden={!visible}
    >
      <div className="relative mx-3 mb-3 flex items-center sm:mx-auto sm:max-w-xl gap-3 rounded-2xl bg-secondary-900 p-2.5 shadow-[0_-4px_24px_rgba(6,16,31,0.3)]">
        <button
          type="button"
          onClick={close}
          aria-label="Închide"
          tabIndex={visible ? 0 : -1}
          className="absolute -top-2.5 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-900 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <div className="relative aspect-[1/1.414] w-10 flex-shrink-0 overflow-hidden rounded bg-white">
          {card.image ? (
            <Image src={card.image.src} alt="" fill sizes="40px" className={card.image.illustration ? 'object-cover' : 'object-contain'} />
          ) : (
            <FileText className="absolute inset-0 m-auto h-5 w-5 text-primary-700" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="line-clamp-2 text-[13px] font-bold text-white">{card.label}</p>
          <p className="mt-0.5 text-xs text-white/70">
            <span className="font-semibold text-primary-500">{fmtPrice(card.priceExVat)} lei</span> + TVA
          </p>
        </div>
        <TrackedLink
          href={card.href}
          placement="sticky_bar"
          service={card.slug}
          tabIndex={visible ? 0 : -1}
          className="inline-flex h-11 flex-shrink-0 items-center gap-1 rounded-xl bg-primary-500 px-3.5 text-sm font-bold text-secondary-900 transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Comandă
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </TrackedLink>
      </div>
    </div>
  );
}
