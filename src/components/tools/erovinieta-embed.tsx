'use client';

import { useEffect, useRef } from 'react';

/**
 * Embedded rovinietă verification widget (erovinieta.net).
 * The widget posts its content height via window.postMessage; we listen and
 * resize the iframe (clamped 360-1100px) so there is no inner scrollbar.
 * Mirrors the embed used on the current WordPress site.
 */
const EMBED_SRC = 'https://erovinieta.net/embed/verificare-rovinieta';
const EMBED_ORIGIN = 'https://erovinieta.net';

export function ErovinietaEmbed() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== EMBED_ORIGIN) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (!data || data.type !== 'erovinieta-embed' || !data.height) return;
      const h = Math.min(Math.max(data.height, 360), 1100);
      if (ref.current) ref.current.style.height = `${h}px`;
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={EMBED_SRC}
      title="Verificare rovinietă online"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="block w-full rounded-2xl border border-neutral-200 bg-white shadow-sm"
      style={{ height: 420, border: 0 }}
    />
  );
}
