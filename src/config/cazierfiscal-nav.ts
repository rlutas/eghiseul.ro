/**
 * Navigation + indexing switch for cazierfiscal.com (third brand, 2026-11-10).
 * One service, so no mega menu: the order button goes straight to the wizard.
 */

/** Launched 10.11.2026: pages indexable, sitemap served. */
export const CAZIERFISCAL_INDEXABLE = true;

export const CAZIERFISCAL_ORDER_HREF = '/comanda/cazier-fiscal/';
export const CAZIERFISCAL_TRACK_HREF = '/comanda/status/';

export const CAZIERFISCAL_NAV = [
  { label: 'Cum funcționează', href: '/#cum-functioneaza' },
  { label: 'Preț', href: '/#pret' },
  { label: 'Ghiduri', href: '/ghiduri/' },
  { label: 'Despre', href: '/despre/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export interface CazierFiscalGuideEntry {
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
  /** Planned publish date, for the weekly queue (docs/cazier-fiscal/README.md). */
  planned?: string;
}

/** Every guide, live or queued. Read the live ones through CAZIERFISCAL_GUIDES. */
export const CAZIERFISCAL_ALL_GUIDES: ReadonlyArray<CazierFiscalGuideEntry> = [
  {
    href: '/ghiduri/cazier-fiscal-din-spv/',
    label: 'Cazier fiscal din SPV',
    hint: 'Cum îl ceri singur, gratuit, din Spațiul Privat Virtual, și ce faci dacă nu ai cont.',
    updated: '2026-11-11',
    published: true,
  },
  {
    href: '/ghiduri/cazier-fiscal-din-strainatate/',
    label: 'Cazier fiscal din străinătate',
    hint: 'SPV, împuternicit sau avocat; valabilitatea de 30 de zile, traducerea și apostila.',
    updated: '2026-11-11',
    published: true,
  },
];

/** Live guides only: the footer, /ghiduri/, the sitemap and "Citește și" read this list. */
export const CAZIERFISCAL_GUIDES = CAZIERFISCAL_ALL_GUIDES.filter((g) => g.published);

/**
 * Whether a guide page may render. Queued guides render in `next dev` so they
 * can be reviewed locally, and 404 everywhere else.
 */
export function cazierFiscalGuideVisible(href: string): boolean {
  const g = CAZIERFISCAL_ALL_GUIDES.find((x) => x.href === href);
  if (!g) return false;
  return g.published || process.env.NODE_ENV === 'development';
}
