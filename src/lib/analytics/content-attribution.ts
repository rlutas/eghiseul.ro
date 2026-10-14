/**
 * Which content page (article, calculator, tool) brought an order, read from
 * `orders.attribution` (see `./attribution`). Pure, no I/O: runs in the admin
 * report and on the order page.
 *
 * Two strengths of evidence:
 *   - `click`   — the visitor clicked a service card on that page
 *                 (`attribution.content`, recorded since 14.10.2026);
 *   - `landing` — the visit started on that page (first or last touch), but we
 *                 do not know whether the page itself sent them to the order.
 */

import { ARTICLES } from '@/config/articles';

export type ContentKind = 'articol' | 'calculator' | 'unealtă';

export interface ContentSource {
  page: string;
  kind: ContentKind;
  via: 'click' | 'landing';
  placement?: string;
  service?: string;
}

interface AttributionWithContent {
  first?: { landing?: string } | null;
  last?: { landing?: string } | null;
  content?: { page?: string; placement?: string; service?: string } | null;
}

const ARTICLE_PATHS = new Set(ARTICLES.map((a) => `/${a.slug}/`));

/** Normalizes `/x` and `/x/` to `/x/`. */
function norm(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

export function contentKind(path: string | null | undefined): ContentKind | null {
  if (!path) return null;
  const p = norm(path);
  if (p.startsWith('/calculator/') && p !== '/calculator/') return 'calculator';
  if (p.startsWith('/tools/') && p !== '/tools/') return 'unealtă';
  if (ARTICLE_PATHS.has(p)) return 'articol';
  return null;
}

export function contentSource(attribution: AttributionWithContent | null | undefined): ContentSource | null {
  if (!attribution) return null;

  const click = attribution.content;
  if (click?.page) {
    const kind = contentKind(click.page);
    if (kind) {
      return { page: norm(click.page), kind, via: 'click', placement: click.placement, service: click.service };
    }
  }

  // No card click: credit the content page the visit started on, last touch first.
  for (const touch of [attribution.last, attribution.first]) {
    const kind = contentKind(touch?.landing);
    if (kind && touch?.landing) return { page: norm(touch.landing), kind, via: 'landing' };
  }
  return null;
}

export const PLACEMENT_LABEL: Record<string, string> = {
  band: 'banda de jos',
  rail: 'cardul din dreapta',
  sticky_bar: 'bara fixă',
  inline: 'caseta din text',
};
