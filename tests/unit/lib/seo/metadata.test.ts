import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { BASE_URL } from '@/lib/seo/constants';

describe('buildPageMetadata', () => {
  it('builds canonical URL from path', () => {
    const meta = buildPageMetadata({
      title: 'Cazier Judiciar Online',
      description: 'd',
      path: '/servicii/cazier-judiciar-online/',
    });
    expect(meta.alternates?.canonical).toBe(`${BASE_URL}/servicii/cazier-judiciar-online/`);
  });

  it('builds OpenGraph with absolute image URL', () => {
    const meta = buildPageMetadata({
      title: 't',
      description: 'd',
      path: '/x/',
      ogImage: '/og/x.png',
    });
    const og = meta.openGraph as { images: Array<{ url: string; width: number; height: number }> };
    expect(og.images[0].url).toBe(`${BASE_URL}/og/x.png`);
    expect(og.images[0].width).toBe(1200);
    expect(og.images[0].height).toBe(630);
  });

  it('omits OG/Twitter images when ogImage not provided', () => {
    const meta = buildPageMetadata({
      title: 't',
      description: 'd',
      path: '/x/',
    });
    const og = meta.openGraph as { images?: unknown };
    expect(og.images).toBeUndefined();
  });

  it('sets noindex when requested', () => {
    const meta = buildPageMetadata({
      title: 't',
      description: 'd',
      path: '/x/',
      noindex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('sets aggressive googleBot directives by default', () => {
    const meta = buildPageMetadata({ title: 't', description: 'd', path: '/x/' });
    const robots = meta.robots as { index: boolean; googleBot: { 'max-snippet': number } };
    expect(robots.index).toBe(true);
    expect(robots.googleBot['max-snippet']).toBe(-1);
  });

  it('locale is ro_RO', () => {
    const meta = buildPageMetadata({ title: 't', description: 'd', path: '/x/' });
    const og = meta.openGraph as { locale: string };
    expect(og.locale).toBe('ro_RO');
  });
});
