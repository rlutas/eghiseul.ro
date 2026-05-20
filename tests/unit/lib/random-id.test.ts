import { afterEach, describe, expect, it, vi } from 'vitest';
import { randomId } from '@/lib/random-id';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('randomId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a valid UUID v4 (default crypto path)', () => {
    const id = randomId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('returns unique ids across calls', () => {
    const a = randomId();
    const b = randomId();
    expect(a).not.toBe(b);
  });

  it('falls back to getRandomValues when randomUUID is unavailable (HTTP/mobile case)', () => {
    // Simulate the failing case: page served over HTTP from a phone via
    // local IP — `crypto.randomUUID` is undefined but `getRandomValues` works.
    const fakeCrypto = {
      // randomUUID intentionally omitted
      getRandomValues: <T extends ArrayBufferView>(buf: T) => {
        const view = buf as unknown as Uint8Array;
        for (let i = 0; i < view.length; i++) {
          view[i] = (i * 17 + 11) & 0xff; // deterministic for assertion
        }
        return buf;
      },
    };
    vi.stubGlobal('crypto', fakeCrypto);
    const id = randomId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('falls back to Math.random when no crypto is available', () => {
    vi.stubGlobal('crypto', undefined);
    const id = randomId();
    expect(id).toMatch(UUID_V4_REGEX);
  });
});
