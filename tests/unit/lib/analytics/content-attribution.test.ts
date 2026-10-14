import { describe, expect, it } from 'vitest';
import { contentKind, contentSource } from '@/lib/analytics/content-attribution';

describe('contentKind', () => {
  it('recognizes articles, calculators and tools', () => {
    expect(contentKind('/cadastru-sistematic/')).toBe('articol');
    expect(contentKind('/cadastru-sistematic')).toBe('articol');
    expect(contentKind('/calculator/dividende/')).toBe('calculator');
    expect(contentKind('/tools/verificare-rovinieta-online/')).toBe('unealtă');
  });

  it('ignores service pages, indexes and the home page', () => {
    expect(contentKind('/servicii/extras-de-carte-funciara/')).toBeNull();
    expect(contentKind('/calculator/')).toBeNull();
    expect(contentKind('/')).toBeNull();
    expect(contentKind(undefined)).toBeNull();
  });
});

describe('contentSource', () => {
  it('prefers a card click over the landing page', () => {
    expect(
      contentSource({
        first: { landing: '/calculator/dividende/' },
        last: { landing: '/calculator/dividende/' },
        content: { page: '/cadastru-sistematic/', placement: 'sticky_bar', service: 'extras-carte-funciara' },
      }),
    ).toEqual({
      page: '/cadastru-sistematic/',
      kind: 'articol',
      via: 'click',
      placement: 'sticky_bar',
      service: 'extras-carte-funciara',
    });
  });

  it('falls back to the last, then the first landing page', () => {
    expect(contentSource({ first: { landing: '/calculator/tva/' }, last: { landing: '/' } })).toEqual({
      page: '/calculator/tva/',
      kind: 'calculator',
      via: 'landing',
    });
    expect(
      contentSource({ first: { landing: '/calculator/tva/' }, last: { landing: '/verificare-proprietar-imobil/' } })?.page,
    ).toBe('/verificare-proprietar-imobil/');
  });

  it('returns null when nothing points to content', () => {
    expect(contentSource({ first: { landing: '/servicii/cazier-judiciar-online/' } })).toBeNull();
    expect(contentSource(null)).toBeNull();
  });
});
