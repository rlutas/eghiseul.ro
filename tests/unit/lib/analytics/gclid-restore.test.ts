import { describe, expect, it } from 'vitest';
import { buildGclAwCookie } from '@/lib/analytics/gclid-restore';
import type { Attribution, TouchPoint } from '@/lib/analytics/attribution';

const NOW = Date.parse('2026-11-16T10:00:00Z');
const GCLID = 'Cj0KCQiA_test-1234567890';

function attr(last: Partial<TouchPoint>, first?: Partial<TouchPoint>): Attribution {
  const l = { at: '2026-11-16T09:00:00Z', ...last } as TouchPoint;
  const f = { at: '2026-11-10T09:00:00Z', ...(first ?? last) } as TouchPoint;
  return { first: f, last: l, updated: l.at };
}
const adTouch = { click_id: GCLID, click_platform: 'google', click_param: 'gclid' };

describe('buildGclAwCookie', () => {
  it('restores the click id when consent comes on a later page', () => {
    const c = buildGclAwCookie(attr(adTouch), '', '', NOW);
    const ts = Date.parse('2026-11-16T09:00:00Z') / 1000;
    expect(c).toBe(`_gcl_aw=GCL.${ts}.${GCLID}; path=/; max-age=${90 * 86400 - 3600}; SameSite=Lax; Secure`);
  });

  it('falls back to the first touch when the last one is not an ad click', () => {
    const c = buildGclAwCookie(attr({ referrer: 'https://www.google.com/' }, adTouch), '', '', NOW);
    expect(c).toContain(`.${GCLID};`);
  });

  it('does nothing when gtag can read the URL or already set its cookie', () => {
    expect(buildGclAwCookie(attr(adTouch), '', '?gclid=abc', NOW)).toBeNull();
    expect(buildGclAwCookie(attr(adTouch), 'a=1; _gcl_aw=GCL.1.x', '', NOW)).toBeNull();
  });

  it('ignores other click ids, old entries without click_param, and other platforms', () => {
    expect(buildGclAwCookie(attr({ ...adTouch, click_param: 'gbraid' }), '', '', NOW)).toBeNull();
    expect(buildGclAwCookie(attr({ click_id: GCLID, click_platform: 'google' }), '', '', NOW)).toBeNull();
    expect(buildGclAwCookie(attr({ click_id: GCLID, click_platform: 'meta', click_param: 'fbclid' }), '', '', NOW)).toBeNull();
    expect(buildGclAwCookie(null, '', '', NOW)).toBeNull();
  });

  it('rejects a click id that could break out of the cookie, and clicks older than 90 days', () => {
    expect(buildGclAwCookie(attr({ ...adTouch, click_id: 'abcdefghij; domain=evil.com' }), '', '', NOW)).toBeNull();
    expect(buildGclAwCookie(attr({ ...adTouch, at: '2026-08-01T00:00:00Z' }), '', '', NOW)).toBeNull();
  });
});
