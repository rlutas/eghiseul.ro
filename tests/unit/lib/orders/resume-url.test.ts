import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildResumeUrl } from '@/lib/orders/resume-url';

afterEach(() => vi.unstubAllEnvs());

describe('buildResumeUrl', () => {
  it('abandoned → checkout, cu ?coupon= doar când există', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://eghiseul.ro');
    const base = { id: 'o1', status: 'abandoned', friendly_order_id: 'E-1', serviceSlug: 'cazier-fiscal', email: 'a@b.ro' };
    expect(buildResumeUrl(base)).toBe('https://eghiseul.ro/comanda/checkout/o1');
    expect(buildResumeUrl({ ...base, couponCode: 'TEL-ABC' })).toBe('https://eghiseul.ro/comanda/checkout/o1?coupon=TEL-ABC');
  });

  it('draft → înapoi în wizard cu order+email (gardă anti-IDOR), cupon opțional', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://eghiseul.ro');
    const base = { id: 'o2', status: 'draft', friendly_order_id: 'E-2', serviceSlug: 'cazier-fiscal', email: 'a+x@b.ro' };
    expect(buildResumeUrl(base)).toBe('https://eghiseul.ro/comanda/cazier-fiscal?order=E-2&email=a%2Bx%40b.ro');
    expect(buildResumeUrl({ ...base, couponCode: 'TEL-ABC' })).toContain('&coupon=TEL-ABC');
  });

  it('draft fără slug/friendly id cade pe checkout', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://eghiseul.ro');
    expect(buildResumeUrl({ id: 'o3', status: 'draft', friendly_order_id: null, serviceSlug: null, email: 'a@b.ro' })).toBe(
      'https://eghiseul.ro/comanda/checkout/o3'
    );
  });
});
