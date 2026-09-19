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
  // Empty until the hub (home) ships — see docs/technical/specs/multi-brand.md.
];
