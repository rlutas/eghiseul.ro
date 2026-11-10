import { BRANDS } from '@/lib/brand/brands';
import { CAZIERFISCAL_SITEMAP } from '@/config/cazierfiscal-sitemap';
import { CAZIERFISCAL_GUIDES, CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

/**
 * sitemap.xml for cazier-fiscal.ro: curated list (content rules §4). Guides
 * come from CAZIERFISCAL_GUIDES, so a guide is listed once its page exists.
 * Empty until launch, same as the noindex on every page.
 */
export function GET(): Response {
  const base = BRANDS.cazierfiscal.baseUrl;
  const entries = CAZIERFISCAL_INDEXABLE
    ? [...CAZIERFISCAL_SITEMAP, ...CAZIERFISCAL_GUIDES.map((g) => ({ path: g.href, lastModified: g.updated, changeFrequency: 'monthly' as const, priority: 0.7 }))]
    : [];
  const urls = entries.map(
    (e) =>
      `  <url><loc>${base}${e.path}</loc><lastmod>${e.lastModified}</lastmod><changefreq>${e.changeFrequency ?? 'monthly'}</changefreq><priority>${(e.priority ?? 0.7).toFixed(1)}</priority></url>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
