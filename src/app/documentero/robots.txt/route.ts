import { BRANDS } from '@/lib/brand/brands';

/**
 * robots.txt for documentero.ro (served through the host rewrite in
 * next.config.ts). Same policy as eghiseul: public content open to every
 * crawler including the AI ones, private routes closed.
 */
const DISALLOW = ['/admin/', '/api/', '/comanda/', '/auth/', '/account/', '/orders/', '/completare/', '/reincarca-poza/'];

export function GET(): Response {
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...DISALLOW.map((p) => `Disallow: ${p}`),
    '',
    `Sitemap: ${BRANDS.documentero.baseUrl}/sitemap.xml`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
