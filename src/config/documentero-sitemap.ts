/**
 * The curated sitemap of documentero.ro. Add a page HERE only when it is
 * written, reviewed and meant to be indexed — never a placeholder, never a
 * batch (max 1–2 new public pages per week, content rules §2).
 *
 * Paths are public paths on the documentero host, with trailing slash.
 */
export interface DocumenteroSitemapEntry {
  path: string;
  /** ISO date (YYYY-MM-DD) of the last real content change. */
  lastModified?: string;
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export const DOCUMENTERO_SITEMAP: DocumenteroSitemapEntry[] = [
  // Served only when DOCUMENTERO_INDEXABLE is true (src/config/documentero-nav.ts).
  { path: '/', lastModified: '2026-09-21', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/certificat-de-nastere/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/certificat-de-casatorie/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/certificat-de-celibat/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/extras-multilingv/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/ghiduri/', lastModified: '2026-09-21', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/ghiduri/certificat-de-nastere-pierdut/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ghiduri/apostila-acte-stare-civila/', lastModified: '2026-09-20', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ghiduri/acte-necesare-duplicat-certificat-de-nastere/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ghiduri/procura-din-strainatate-notar-consulat-avocat/', lastModified: '2026-09-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/despre/', lastModified: '2026-09-21', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact/', lastModified: '2026-09-19', changeFrequency: 'yearly', priority: 0.5 },
  // Legal pages (documentero's own texts, 20.09.2026).
  { path: '/termeni-si-conditii/', lastModified: '2026-09-20', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-de-confidentialitate/', lastModified: '2026-09-20', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-de-anulare/', lastModified: '2026-09-20', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/politica-cookies/', lastModified: '2026-09-20', changeFrequency: 'yearly', priority: 0.3 },
];
