'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { recordContentClick } from '@/lib/analytics/attribution';

type GtagWindow = Window & { gtag?: (cmd: 'event', name: string, params: Record<string, string>) => void };

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  /** Where the click came from: band, sticky_bar, rail, inline. */
  placement: string;
  service: string;
}

/**
 * Plain <Link> (a real href for crawlers) that remembers the click in the
 * order attribution (`attribution.content`, shown in /admin/marketing) and
 * reports it to GA4. gtag exists only after analytics consent; without it the
 * link and our own record still work.
 */
export function TrackedLink({ placement, service, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        // Our own record (saved on the order, visible in admin, no consent
        // needed), then GA4 when the visitor allowed analytics.
        recordContentClick({ placement, service });
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
