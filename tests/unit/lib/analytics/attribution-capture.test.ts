import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureAttribution, resetReferrerForTests } from '@/lib/analytics/attribution';

// The capture runs on every route change. `document.referrer` does not change
// on client-side navigation, so the second page view of an ad visitor used to
// look like a new visit from google.com and replaced the ad click.

const store = new Map<string, string>();

function page(url: string, referrer: string) {
  const u = new URL(url);
  vi.stubGlobal('window', { location: { search: u.search, host: u.host, pathname: u.pathname } });
  vi.stubGlobal('document', { referrer });
}

function stored() {
  const raw = [...store.values()][0];
  return JSON.parse(raw) as { first: Record<string, string>; last: Record<string, string> };
}

beforeEach(() => {
  store.clear();
  resetReferrerForTests();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('captureAttribution', () => {
  it('keeps the ad click when the visitor moves to the order form in the same tab', () => {
    page('https://certificat-constatator-express.ro/?gclid=abc123', 'https://www.google.com/');
    captureAttribution();
    // Client-side navigation: new path, no gclid, same document referrer.
    page('https://certificat-constatator-express.ro/comanda/certificat-constatator/', 'https://www.google.com/');
    captureAttribution();

    const a = stored();
    expect(a.first.click_id).toBe('abc123');
    expect(a.last.click_id).toBe('abc123');
    expect(a.last.landing).toBe('/');
  });

  it('still records the referrer on the first page view of a document', () => {
    page('https://eghiseul.ro/servicii/certificat-constatator-online/', 'https://www.google.com/');
    captureAttribution();
    expect(stored().last.referrer).toBe('https://www.google.com/');
  });

  it('a new document load with a new source replaces the last touch', () => {
    page('https://eghiseul.ro/?gclid=abc123', 'https://www.google.com/');
    captureAttribution();
    resetReferrerForTests(); // the visitor comes back later: new document
    page('https://eghiseul.ro/comanda/cazier-fiscal/?utm_source=email&utm_medium=warmup', '');
    captureAttribution();

    const a = stored();
    expect(a.first.click_id).toBe('abc123');
    expect(a.last.utm_medium).toBe('warmup');
  });

  it('keeps the paid click apart, even after an email link replaces the last touch', () => {
    page('https://cazierfiscal.com/?gclid=abc123', 'https://www.google.com/');
    captureAttribution();
    resetReferrerForTests();
    page('https://cazierfiscal.com/comanda/cazier-fiscal/?utm_source=email&utm_medium=recovery', '');
    captureAttribution();

    const a = stored() as unknown as { last: Record<string, string>; ad_click: Record<string, string> };
    expect(a.last.utm_medium).toBe('recovery');
    expect(a.ad_click).toMatchObject({ id: 'abc123', param: 'gclid', platform: 'google', landing: '/' });
  });

  it('does not invent a paid click for a social click id', () => {
    page('https://eghiseul.ro/?fbclid=xyz', 'https://m.facebook.com/');
    captureAttribution();
    expect((stored() as unknown as { ad_click?: unknown }).ad_click).toBeUndefined();
  });
});
