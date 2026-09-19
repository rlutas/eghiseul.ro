import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_SITEMAP } from '@/config/documentero-sitemap';

/**
 * sitemap.xml for documentero.ro — CURATED, not generated from routes
 * (.claude/rules/content-and-seo.md §4). A page enters the list only when its
 * content is finished and indexable; the placeholder home is not in it.
 */
export function GET(): Response {
  const base = BRANDS.documentero.baseUrl;
  const urls = DOCUMENTERO_SITEMAP.map(
    (e) =>
      `  <url><loc>${base}${e.path}</loc>${e.lastModified ? `<lastmod>${e.lastModified}</lastmod>` : ''}<changefreq>${e.changeFrequency ?? 'monthly'}</changefreq><priority>${(e.priority ?? 0.7).toFixed(1)}</priority></url>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
