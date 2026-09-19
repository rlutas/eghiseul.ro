'use client';

import { useEffect } from 'react';

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
 */
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (els.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const threshold = window.innerHeight * 0.92;
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
    for (const el of els) {
      if (el.getBoundingClientRect().top < threshold) {
        el.classList.add('is-in', 'no-anim');
      } else {
        io.observe(el);
      }
    }
    return () => io.disconnect();
  }, []);
  return null;
}
