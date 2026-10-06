import { BRANDS } from '@/lib/brand/brands';
import { AI_ASSISTANT_FETCHERS, AI_CRAWLERS } from '@/lib/seo/ai-bots';

/**
 * robots.txt for documentero.ro (served through the host rewrite in
 * next.config.ts). Same policy as eghiseul: public content open to every
 * crawler including the AI ones, private routes closed.
 */
const DISALLOW = ['/admin/', '/api/', '/comanda/', '/auth/', '/account/', '/orders/', '/completare/', '/reincarca-poza/'];

export function GET(): Response {
  // Same groups as eghiseul's robots.ts: every AI crawler explicitly allowed;
  // assistant fetchers may open the first order step (still noindex).
  const assistantDisallow = DISALLOW.filter((p) => p !== '/comanda/').concat([
    '/comanda/checkout/',
    '/comanda/success/',
    '/comanda/status/',
  ]);
  const group = (agents: string[], disallow: string[]) => [
    ...agents.map((a) => `User-agent: ${a}`),
    'Allow: /',
    ...disallow.map((p) => `Disallow: ${p}`),
    '',
  ];
  const lines = [
    ...group(['*'], DISALLOW),
    ...group([...AI_CRAWLERS], DISALLOW),
    ...group([...AI_ASSISTANT_FETCHERS], assistantDisallow),
    `Sitemap: ${BRANDS.documentero.baseUrl}/sitemap.xml`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
