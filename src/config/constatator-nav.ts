/**
 * Navigation + indexing switch for certificat-constatator-express.ro (fourth
 * brand, 2026-11-11). One service, so no mega menu: the order button goes
 * straight to the wizard.
 */

/**
 * false until the live page is checked by hand (copy, prices, the wizard on
 * this host) and the similarity check against the eghiseul constatator pages
 * passes (content rule §1). Then true + sitemap + IndexNow.
 */
export const CONSTATATOR_INDEXABLE = true;

export const CONSTATATOR_ORDER_HREF = '/comanda/certificat-constatator/';
export const CONSTATATOR_TRACK_HREF = '/comanda/status/';

export const CONSTATATOR_NAV = [
  { label: 'Cum funcționează', href: '/#cum-functioneaza' },
  { label: 'Tipuri și prețuri', href: '/#preturi' },
  { label: 'Întrebări', href: '/#intrebari' },
  { label: 'Despre', href: '/despre/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export interface ConstatatorGuideEntry {
  href: string;
  label: string;
  hint: string;
  updated: string;
  /**
   * false = written and reviewed, but not live yet: the page answers 404 in
   * production and the guide is left out of the menu, footer, hub, sitemap,
   * llms.txt and "Citește și". Content rule §2: at most one new guide per
   * week, so drafts wait here and go live by flipping this to true (and
   * setting `updated` to the publish date).
   */
  published: boolean;
  /** Planned publish date, for the weekly queue (docs/certificat-constatator/README.md). */
  planned?: string;
}

/**
 * Every guide, live or queued. Empty at launch: guides come one per week
 * after the money page is indexed (docs/certificat-constatator/README.md,
 * Faza 4).
 */
export const CONSTATATOR_ALL_GUIDES: ReadonlyArray<ConstatatorGuideEntry> = [];

/** Live guides only: the footer, /ghiduri/, the sitemap and "Citește și" read this list. */
export const CONSTATATOR_GUIDES = CONSTATATOR_ALL_GUIDES.filter((g) => g.published);

/**
 * Whether a guide page may render. Queued guides render in `next dev` so they
 * can be reviewed locally, and 404 everywhere else.
 */
export function constatatorGuideVisible(href: string): boolean {
  const g = CONSTATATOR_ALL_GUIDES.find((x) => x.href === href);
  if (!g) return false;
  return g.published || process.env.NODE_ENV === 'development';
}
