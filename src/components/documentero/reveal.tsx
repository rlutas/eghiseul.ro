'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll-reveal for documentero pages: every `[data-reveal]` element (each
 * `<Section>`) fades and rises 16px into place the first time it enters the
 * viewport. One observer for the whole page; no per-section client
 * components, no layout shift.
 *
 * Progressive: the CSS that hides elements lives behind
 * `@media (scripting: enabled)` in globals.css, so a crawler or a user
 * without JavaScript sees everything at once (content never depends on this
 * file running). `prefers-reduced-motion` gets the fade without the rise.
 * Sections already on screen at load are marked in place, without the
 * transition, so the hero never blinks.
 *
 * Client-side navigation: the layout (and this component) stays mounted
 * while the page swaps, so the effect re-runs on every `pathname` change AND
 * a MutationObserver picks up sections that React inserts later (Suspense,
 * streaming). Without this, sections on the second page visited stayed at
 * opacity 0 until a hard refresh (Raul, 20.09.2026).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const seen = new WeakSet<Element>();
    const attach = (el: HTMLElement, instant: boolean) => {
      if (seen.has(el) || el.classList.contains('is-in')) return;
      seen.add(el);
      if (instant && el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add('is-in', 'no-anim');
      } else {
        io.observe(el);
      }
    };
    // What is already on screen when the page appears shows at once.
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => attach(el, true));
    // Anything React adds afterwards (streamed sections, next page) animates in.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          if (n.matches('[data-reveal]')) attach(n, false);
          n.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => attach(el, false));
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
