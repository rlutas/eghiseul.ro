import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limiter';

// The rate-limiter uses a module-level Map. We isolate tests by giving each
// case a UNIQUE identifier so they don't cross-pollute. Tests that need a
// fresh window for the same identifier use vi.useFakeTimers() to advance time.

let n = 0;
const uniqueId = () => `test-${Date.now()}-${++n}`;

describe('checkRateLimit — first request', () => {
  it('allows the first request and reports the configured remaining count', () => {
    const id = uniqueId();
    const result = checkRateLimit(id, { windowMs: 60_000, maxRequests: 5 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 5 max - 1 used
    expect(result.resetIn).toBe(60_000);
  });
});

describe('checkRateLimit — within window', () => {
  it('decrements remaining count on each call', () => {
    const id = uniqueId();
    const cfg = { windowMs: 60_000, maxRequests: 3 };

    expect(checkRateLimit(id, cfg).remaining).toBe(2);
    expect(checkRateLimit(id, cfg).remaining).toBe(1);
    expect(checkRateLimit(id, cfg).remaining).toBe(0);
  });

  it('blocks once the limit is reached', () => {
    const id = uniqueId();
    const cfg = { windowMs: 60_000, maxRequests: 2 };

    expect(checkRateLimit(id, cfg).allowed).toBe(true);
    expect(checkRateLimit(id, cfg).allowed).toBe(true);

    const blocked = checkRateLimit(id, cfg);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetIn).toBeGreaterThan(0);
    expect(blocked.resetIn).toBeLessThanOrEqual(60_000);
  });

  it('different identifiers have independent counters', () => {
    const cfg = { windowMs: 60_000, maxRequests: 1 };
    const a = uniqueId();
    const b = uniqueId();

    expect(checkRateLimit(a, cfg).allowed).toBe(true);
    expect(checkRateLimit(a, cfg).allowed).toBe(false); // a exhausted
    expect(checkRateLimit(b, cfg).allowed).toBe(true);  // b fresh
  });
});

describe('checkRateLimit — window expiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resets the counter after the window expires', () => {
    const id = uniqueId();
    const cfg = { windowMs: 1000, maxRequests: 1 };

    expect(checkRateLimit(id, cfg).allowed).toBe(true);
    expect(checkRateLimit(id, cfg).allowed).toBe(false); // exhausted

    // Advance past the window
    vi.advanceTimersByTime(1100);

    const fresh = checkRateLimit(id, cfg);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(0);
  });

  it('does NOT reset before the window expires', () => {
    const id = uniqueId();
    const cfg = { windowMs: 1000, maxRequests: 1 };

    checkRateLimit(id, cfg); // 1/1 used

    vi.advanceTimersByTime(500); // half window

    expect(checkRateLimit(id, cfg).allowed).toBe(false); // still blocked
  });
});

describe('getClientIP', () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request('http://x', { headers });
  }

  it('uses x-forwarded-for first (taking the leftmost IP)', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1, 172.16.0.1' });
    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('trims whitespace from x-forwarded-for entries', () => {
    const req = makeRequest({ 'x-forwarded-for': '  203.0.113.1  , 10.0.0.1' });
    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip', () => {
    const req = makeRequest({ 'x-real-ip': '198.51.100.5' });
    expect(getClientIP(req)).toBe('198.51.100.5');
  });

  it('falls back to x-vercel-forwarded-for as a last network header', () => {
    const req = makeRequest({ 'x-vercel-forwarded-for': '203.0.113.99, 10.0.0.1' });
    expect(getClientIP(req)).toBe('203.0.113.99');
  });

  it('returns "unknown" when no IP header present', () => {
    const req = makeRequest({});
    expect(getClientIP(req)).toBe('unknown');
  });
});

describe('RATE_LIMITS configuration', () => {
  it('OCR is more restrictive for guests than authenticated users', () => {
    expect(RATE_LIMITS.ocr.guest.maxRequests).toBeLessThan(RATE_LIMITS.ocr.authenticated.maxRequests);
  });

  it('KYC has stricter limits than OCR for guests (KYC is more sensitive)', () => {
    expect(RATE_LIMITS.kyc.guest.maxRequests).toBeLessThanOrEqual(RATE_LIMITS.ocr.guest.maxRequests);
  });

  it('Order creation has the tightest guest limit (highest cost endpoint)', () => {
    expect(RATE_LIMITS.orders.guest.maxRequests).toBeLessThanOrEqual(RATE_LIMITS.kyc.guest.maxRequests);
  });
});
