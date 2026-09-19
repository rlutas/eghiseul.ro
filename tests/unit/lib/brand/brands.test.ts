import { afterEach, describe, expect, it } from 'vitest';
import {
  BRANDS,
  brandFromHost,
  brandSellsService,
  normalizeHost,
  parseHostOverrides,
} from '@/lib/brand/brands';
import { appBaseForOrder, brandForOrder } from '@/lib/brand/for-order';

describe('normalizeHost', () => {
  it('strips scheme, www, path, trailing dot and lower-cases', () => {
    expect(normalizeHost('HTTPS://WWW.Documentero.ro/servicii/')).toBe('documentero.ro');
    expect(normalizeHost('documentero.ro.')).toBe('documentero.ro');
    expect(normalizeHost('localhost:3000')).toBe('localhost:3000');
    expect(normalizeHost(null)).toBe('');
  });
});

describe('brandFromHost', () => {
  const originalEnv = process.env.BRAND_HOST_OVERRIDES;
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.BRAND_HOST_OVERRIDES;
    else process.env.BRAND_HOST_OVERRIDES = originalEnv;
  });

  it('maps the apex and www to documentero, with or without a port', () => {
    expect(brandFromHost('documentero.ro').id).toBe('documentero');
    expect(brandFromHost('www.documentero.ro').id).toBe('documentero');
    expect(brandFromHost('documentero.ro:443').id).toBe('documentero');
  });

  it('is eghiseul for eghiseul.ro, previews, localhost and nothing', () => {
    expect(brandFromHost('eghiseul.ro').id).toBe('eghiseul');
    expect(brandFromHost('eghiseul-ro-git-main.vercel.app').id).toBe('eghiseul');
    expect(brandFromHost('localhost:3000').id).toBe('eghiseul');
    expect(brandFromHost(undefined).id).toBe('eghiseul');
    expect(brandFromHost('').id).toBe('eghiseul');
  });

  it('honours BRAND_HOST_OVERRIDES for previews and local dev', () => {
    process.env.BRAND_HOST_OVERRIDES = 'documentero=documentero.local:3000,documentero-preview.vercel.app';
    expect(brandFromHost('documentero.local:3000').id).toBe('documentero');
    expect(brandFromHost('DOCUMENTERO-PREVIEW.vercel.app').id).toBe('documentero');
    expect(brandFromHost('eghiseul.ro').id).toBe('eghiseul');
  });

  it('never lets a look-alike host through', () => {
    expect(brandFromHost('documentero.ro.evil.com').id).toBe('eghiseul');
    expect(brandFromHost('notdocumentero.ro').id).toBe('eghiseul');
  });
});

describe('parseHostOverrides', () => {
  it('ignores malformed groups and unknown brands', () => {
    const map = parseHostOverrides('bogus=a.b;documentero=x.local;=y');
    expect(map.get('x.local')).toBe('documentero');
    expect(map.size).toBe(1);
  });
});

describe('brandSellsService', () => {
  it('eghiseul sells every slug, documentero only civil status', () => {
    expect(brandSellsService(BRANDS.eghiseul, 'cazier-judiciar')).toBe(true);
    expect(brandSellsService(BRANDS.documentero, 'cazier-judiciar')).toBe(false);
    expect(brandSellsService(BRANDS.documentero, 'certificat-nastere')).toBe(true);
    expect(brandSellsService(BRANDS.documentero, null)).toBe(false);
  });
});

describe('brandForOrder / appBaseForOrder', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it('reads orders.platform and falls back to eghiseul', () => {
    expect(brandForOrder({ platform: 'documentero' }).id).toBe('documentero');
    expect(brandForOrder({ platform: null }).id).toBe('eghiseul');
    expect(brandForOrder({ platform: 'cjo' }).id).toBe('eghiseul');
    expect(brandForOrder(null).id).toBe('eghiseul');
  });

  it('keeps the NEXT_PUBLIC_APP_URL override only for eghiseul', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    expect(appBaseForOrder({ platform: 'eghiseul' })).toBe('http://localhost:3000');
    expect(appBaseForOrder({ platform: 'documentero' })).toBe('https://documentero.ro');
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(appBaseForOrder({ platform: null })).toBe('https://eghiseul.ro');
  });
});
