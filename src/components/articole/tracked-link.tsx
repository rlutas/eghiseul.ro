'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

type GtagWindow = Window & { gtag?: (cmd: 'event', name: string, params: Record<string, string>) => void };

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  /** Where the click came from: band, sticky_bar, rail, inline. */
  placement: string;
  service: string;
}

/**
 * Plain <Link> (a real href for crawlers) that also reports the click to GA4,
 * so we can see which article and which placement bring orders. gtag exists
 * only after marketing/analytics consent; without it the link still works.
 */
export function TrackedLink({ placement, service, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        try {
          (window as GtagWindow).gtag?.('event', 'article_service_click', {
            placement,
            service,
            page_path: window.location.pathname,
          });
        } catch {
          /* analytics must never block navigation */
        }
        onClick?.(e);
      }}
    />
  );
}
