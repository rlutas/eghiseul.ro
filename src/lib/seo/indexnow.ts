/**
 * IndexNow (indexnow.org): tells Bing, Yandex and the other participating
 * engines which URLs changed, instead of waiting for them to recrawl.
 *
 * One key per host. Keys are public by design: each one is served as
 * `https://<host>/<key>.txt` (rewrite in next.config.ts → /api/indexnow-key/),
 * which proves we control the host. The daily cron
 * (/api/cron/indexnow/) reads each host's sitemap and submits what changed.
 *
 * Spec: docs/technical/specs/indexnow.md
 */

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Max URLs per request allowed by the protocol. */
export const INDEXNOW_MAX_URLS = 10_000;

/** Canonical host → key. The www variants and local hosts map to these. */
export const INDEXNOW_KEYS: Record<string, string> = {
  'eghiseul.ro': '5559960a430bdbd96eec4bded0919eda',
  'documentero.ro': '2f5ec717a8dbf488bd1d940efd5e7570',
};

/** Hosts the cron submits for, with their sitemap. */
export const INDEXNOW_SITES = [
  { host: 'eghiseul.ro', sitemap: 'https://eghiseul.ro/sitemap.xml' },
  { host: 'documentero.ro', sitemap: 'https://documentero.ro/sitemap.xml' },
] as const;

/**
 * Canonical host for a request host: strips the port and `www.`, and maps the
 * local dev hosts (documentero.localhost, localhost) to the real ones.
 */
export function canonicalHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  const host = rawHost.toLowerCase().split(':')[0]!.replace(/^www\./, '');
  if (host === 'documentero.ro' || host === 'documentero.localhost') return 'documentero.ro';
  if (host === 'eghiseul.ro' || host === 'localhost' || host === 'eghiseul.localhost') return 'eghiseul.ro';
  return null;
}

/** The key to serve for `/<key>.txt` on this host, or null (→ 404). */
export function keyForRequest(rawHost: string | null | undefined, requestedKey: string): string | null {
  const host = canonicalHost(rawHost);
  if (!host) return null;
  const key = INDEXNOW_KEYS[host];
  return key && key === requestedKey ? key : null;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
}

/** Minimal sitemap parser: <url><loc>…</loc><lastmod>…</lastmod></url>. */
export function parseSitemap(xml: string): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(xml))) {
    const block = m[1]!;
    const loc = /<loc>\s*([^<\s]+)\s*<\/loc>/.exec(block)?.[1];
    if (!loc) continue;
    const lastmod = /<lastmod>\s*([^<\s]+)\s*<\/lastmod>/.exec(block)?.[1] ?? null;
    out.push({ loc: loc.replace(/&amp;/g, '&'), lastmod });
  }
  return out;
}

/**
 * URLs to submit: all of them with `all`, otherwise those whose <lastmod> is
 * after `since` (entries without <lastmod> are only sent with `all`). Only
 * URLs on `host` are kept, since IndexNow rejects mixed hosts.
 */
export function selectUrls(
  entries: SitemapEntry[],
  host: string,
  opts: { all?: boolean; since?: Date | null }
): string[] {
  const urls = new Set<string>();
  for (const e of entries) {
    let u: URL;
    try {
      u = new URL(e.loc);
    } catch {
      continue;
    }
    if (u.hostname.replace(/^www\./, '') !== host) continue;
    if (!opts.all) {
      if (!e.lastmod || !opts.since) continue;
      const t = Date.parse(e.lastmod);
      if (Number.isNaN(t) || t <= opts.since.getTime()) continue;
    }
    urls.add(u.toString());
  }
  return [...urls];
}

/** Request bodies for one host, split into batches of INDEXNOW_MAX_URLS. */
export function buildPayloads(host: string, key: string, urls: string[]) {
  const out = [];
  for (let i = 0; i < urls.length; i += INDEXNOW_MAX_URLS) {
    out.push({
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: urls.slice(i, i + INDEXNOW_MAX_URLS),
    });
  }
  return out;
}

/** POST one payload. IndexNow answers 200/202 on success. */
export async function submitIndexNow(payload: ReturnType<typeof buildPayloads>[number]): Promise<number> {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return res.status;
}
