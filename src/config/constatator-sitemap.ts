/**
 * Curated sitemap of certificat-constatator-express.ro. A page goes here only when it is
 * written, reviewed and meant to be indexed (content rules §2 and §4).
 * Public paths on the constatator host, with trailing slash.
 */
export interface ConstatatorSitemapEntry {
  path: string;
  /** ISO date (YYYY-MM-DD) of the last real content change. */
  lastModified: string;
  changeFrequency?: 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export const CONSTATATOR_SITEMAP: ConstatatorSitemapEntry[] = [
  // Served only when CONSTATATOR_INDEXABLE is true (src/config/constatator-nav.ts).
  { path: '/', lastModified: '2026-11-11', changeFrequency: 'weekly', priority: 1.0 },
  // /ghiduri/ joins when the first guide is live (it is noindex while empty).
  { path: '/despre/', lastModified: '2026-11-11', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact/', lastModified: '2026-11-11', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/termeni-si-conditii/', lastModified: '2026-11-11', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-de-confidentialitate/', lastModified: '2026-11-11', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-de-anulare/', lastModified: '2026-11-11', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-cookies/', lastModified: '2026-11-11', changeFrequency: 'yearly', priority: 0.3 },
];
