/**
 * Curated sitemap of cazier-fiscal.ro. A page goes here only when it is
 * written, reviewed and meant to be indexed (content rules §2 and §4).
 * Public paths on the cazier-fiscal host, with trailing slash.
 */
export interface CazierFiscalSitemapEntry {
  path: string;
  /** ISO date (YYYY-MM-DD) of the last real content change. */
  lastModified: string;
  changeFrequency?: 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export const CAZIERFISCAL_SITEMAP: CazierFiscalSitemapEntry[] = [
  // Served only when CAZIERFISCAL_INDEXABLE is true (src/config/cazierfiscal-nav.ts).
  { path: '/', lastModified: '2026-11-10', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/ghiduri/', lastModified: '2026-11-10', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/despre/', lastModified: '2026-11-10', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact/', lastModified: '2026-11-10', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/termeni-si-conditii/', lastModified: '2026-11-10', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-de-confidentialitate/', lastModified: '2026-11-10', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-de-anulare/', lastModified: '2026-11-10', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-cookies/', lastModified: '2026-11-10', changeFrequency: 'yearly', priority: 0.3 },
];
