/**
 * Dynamic XML sitemap.
 *
 * Sources:
 *   1. Static pages (homepage, /servicii/ index, /contact, etc.)
 *   2. Hardcoded SEO-optimized service pages (lib/seo/constants.ts)
 *   3. Hardcoded calculators + tools (when built)
 *   4. Hardcoded blog articles (when built)
 *   5. Dynamic DB services (fallback for any not in the hardcoded list)
 *
 * The hardcoded lists are the single source of truth — add a new slug there
 * BEFORE adding the actual page.tsx file, sitemap regenerates on next build.
 */

import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import {
  BASE_URL,
  HARDCODED_SERVICE_SLUGS,
  HARDCODED_SERVICE_SUBROUTE_PATHS,
  DB_SLUGS_WITH_HARDCODED_PAGE,
  HARDCODED_CALCULATOR_SLUGS,
  HARDCODED_TOOL_SLUGS,
  HARDCODED_ARTICLE_SLUGS,
} from '@/lib/seo/constants';
import { allCitySlugs } from '@/lib/seo/locations';

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_PAGES: SitemapEntry[] = [
  { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
  { url: `${BASE_URL}/servicii/`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/blog/`, changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/curs-valutar/`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${BASE_URL}/contact/`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/termeni-si-conditii/`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/politica-de-confidentialitate/`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/gdpr/`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/politica-cookies/`, changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [...STATIC_PAGES];

  // 1. Hardcoded service pages — high priority (manual SEO content)
  for (const slug of HARDCODED_SERVICE_SLUGS) {
    entries.push({
      url: `${BASE_URL}/servicii/${slug}/`,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // 1b. Hardcoded sub-route pages (PF / PJ under cazier-judiciar-online)
  for (const path of HARDCODED_SERVICE_SUBROUTE_PATHS) {
    entries.push({
      url: `${BASE_URL}/${path}/`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // 2. Hardcoded calculators
  for (const slug of HARDCODED_CALCULATOR_SLUGS) {
    entries.push({
      url: `${BASE_URL}/calculator/${slug}/`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 3. Hardcoded tools
  for (const slug of HARDCODED_TOOL_SLUGS) {
    entries.push({
      url: `${BASE_URL}/tools/${slug}/`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 4. Hardcoded blog articles (WP convention: at root, no /articole/ prefix)
  for (const slug of HARDCODED_ARTICLE_SLUGS) {
    entries.push({
      url: `${BASE_URL}/${slug}/`,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 4b. Location pages (cazier judiciar pe oraș) — segmentate ca să poți
  // diagnostica indexarea per-tip în GSC. Vezi src/lib/seo/locations.
  for (const oras of allCitySlugs()) {
    entries.push({
      url: `${BASE_URL}/servicii/cazier-judiciar-online/${oras}/`,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 5. Dynamic DB services (skip any already hardcoded above)
  // We map DB slugs to WP-style URLs via a lookup. For now we only include
  // slugs NOT in HARDCODED_SERVICE_SLUGS (so we don't double-list them).
  try {
    const supabase = await createPublicClient();
    const { data: dbServices } = await supabase
      .from('services')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (dbServices) {
      const hardcodedSet = new Set<string>(HARDCODED_SERVICE_SLUGS);
      const redirectedSet = new Set<string>(DB_SLUGS_WITH_HARDCODED_PAGE);
      for (const svc of dbServices) {
        if (hardcodedSet.has(svc.slug)) continue;
        // DB slugs that 301 → hardcoded SEO URLs must not appear in sitemap.
        if (redirectedSet.has(svc.slug)) continue;
        entries.push({
          url: `${BASE_URL}/servicii/${svc.slug}/`,
          lastModified: svc.updated_at ? new Date(svc.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    // Sitemap must always succeed at build time — fail soft on DB errors.
    console.error('[sitemap] DB service fetch failed:', err);
  }

  return entries;
}
