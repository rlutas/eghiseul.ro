import { describe, it, expect } from 'vitest';
import {
  INDEXNOW_KEYS,
  buildPayloads,
  canonicalHost,
  keyForRequest,
  parseSitemap,
  selectUrls,
} from '@/lib/seo/indexnow';

const EGH = INDEXNOW_KEYS['eghiseul.ro']!;
const DOC = INDEXNOW_KEYS['documentero.ro']!;

describe('IndexNow key per host', () => {
  it('maps hosts, www and local dev hosts', () => {
    expect(canonicalHost('www.eghiseul.ro')).toBe('eghiseul.ro');
    expect(canonicalHost('localhost:3000')).toBe('eghiseul.ro');
    expect(canonicalHost('documentero.localhost:3000')).toBe('documentero.ro');
    expect(canonicalHost('www.documentero.ro')).toBe('documentero.ro');
    expect(canonicalHost('evil.example')).toBeNull();
  });
  it("serves each host only its own key", () => {
    expect(keyForRequest('eghiseul.ro', EGH)).toBe(EGH);
    expect(keyForRequest('documentero.ro', DOC)).toBe(DOC);
    expect(keyForRequest('documentero.ro', EGH)).toBeNull();
    expect(keyForRequest('eghiseul.ro', DOC)).toBeNull();
    expect(keyForRequest(null, EGH)).toBeNull();
  });
  it('keys are 32 hex chars and distinct', () => {
    for (const k of Object.values(INDEXNOW_KEYS)) expect(k).toMatch(/^[0-9a-f]{32}$/);
    expect(new Set(Object.values(INDEXNOW_KEYS)).size).toBe(Object.keys(INDEXNOW_KEYS).length);
  });
});

describe('sitemap → URLs', () => {
  const xml = `<?xml version="1.0"?><urlset>
    <url><loc>https://documentero.ro/</loc><lastmod>2026-09-21</lastmod></url>
    <url><loc>https://documentero.ro/a/</loc><lastmod>2026-10-06</lastmod></url>
    <url><loc>https://documentero.ro/b/</loc></url>
    <url><loc>https://eghiseul.ro/x/</loc><lastmod>2026-10-06</lastmod></url>
  </urlset>`;
  const entries = parseSitemap(xml);

  it('parses loc and lastmod', () => {
    expect(entries).toHaveLength(4);
    expect(entries[2]).toEqual({ loc: 'https://documentero.ro/b/', lastmod: null });
  });
  it('incremental: only lastmod after since, same host', () => {
    expect(selectUrls(entries, 'documentero.ro', { since: new Date('2026-10-01') })).toEqual([
      'https://documentero.ro/a/',
    ]);
  });
  it('all: every URL of the host, including those without lastmod', () => {
    expect(selectUrls(entries, 'documentero.ro', { all: true })).toEqual([
      'https://documentero.ro/',
      'https://documentero.ro/a/',
      'https://documentero.ro/b/',
    ]);
  });
  it('batches payloads with keyLocation', () => {
    const p = buildPayloads('documentero.ro', DOC, ['https://documentero.ro/a/']);
    expect(p).toEqual([
      { host: 'documentero.ro', key: DOC, keyLocation: `https://documentero.ro/${DOC}.txt`, urlList: ['https://documentero.ro/a/'] },
    ]);
  });
});
