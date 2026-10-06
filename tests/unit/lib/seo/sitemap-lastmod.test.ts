/**
 * Every sitemap URL must carry a real `<lastmod>` (audit 06.10.2026: 86 of 112
 * eghiseul URLs had none, so Google and IndexNow never saw the changes).
 *
 * "Real" means: taken from the hardcoded registries, never the build time. A
 * date that moves with every deploy teaches Google to ignore the signal.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: async () => ({
    from: () => ({ select: () => ({ eq: async () => ({ data: [] }) }) }),
  }),
}));

import sitemap from '@/app/sitemap';
import { DOCUMENTERO_SITEMAP } from '@/config/documentero-sitemap';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('eghiseul sitemap lastmod', () => {
  // Freeze "now" far in the future: if any entry used new Date() at render,
  // its lastmod would equal this value and the test fails.
  const FAKE_NOW = new Date('2031-01-01T12:00:00Z');
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('gives every URL a lastmod that is not the build time', async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(50);
    const missing = entries.filter((e) => !e.lastModified).map((e) => e.url);
    expect(missing).toEqual([]);
    for (const e of entries) {
      const d = new Date(e.lastModified as Date | string);
      expect(Number.isNaN(d.getTime())).toBe(false);
      expect(d.getTime()).toBeLessThan(FAKE_NOW.getTime() - 24 * 3600 * 1000);
    }
  });

  it('covers all service (money) pages', async () => {
    const entries = await sitemap();
    const services = entries.filter((e) => e.url.includes('/servicii/'));
    expect(services.length).toBeGreaterThan(20);
    expect(services.every((e) => e.lastModified)).toBe(true);
  });

  it('does not stamp the whole sitemap with one date', async () => {
    const entries = await sitemap();
    const dates = new Set(entries.map((e) => new Date(e.lastModified as Date).toISOString().slice(0, 10)));
    expect(dates.size).toBeGreaterThan(5);
  });
});

describe('documentero sitemap lastmod', () => {
  it('gives every curated URL a valid ISO date', () => {
    for (const e of DOCUMENTERO_SITEMAP) {
      expect(e.lastModified, e.path).toMatch(ISO);
    }
  });
});
