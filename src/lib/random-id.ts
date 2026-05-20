/**
 * Cross-environment random UUID generator.
 *
 * `crypto.randomUUID()` is only available in secure contexts (HTTPS or
 * localhost). When the dev site is opened from a phone via a local network IP
 * (e.g. http://192.168.1.5:3000), `crypto.randomUUID` is undefined and throws.
 *
 * Tries, in order:
 *  1. `globalThis.crypto.randomUUID()` (preferred)
 *  2. RFC 4122 v4 manually composed from `crypto.getRandomValues`
 *  3. `Math.random()` fallback (last resort, never in production secure ctx)
 */
export function randomId(): string {
  const g = globalThis as typeof globalThis & {
    crypto?: {
      randomUUID?: () => string;
      getRandomValues?: <T extends ArrayBufferView>(buf: T) => T;
    };
  };

  if (typeof g.crypto?.randomUUID === 'function') {
    try {
      return g.crypto.randomUUID();
    } catch {
      // fall through
    }
  }

  if (typeof g.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    g.crypto.getRandomValues(bytes);
    // Per RFC 4122 §4.4 — set version (4) and variant (10xx) bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex: string[] = [];
    for (let i = 0; i < 16; i++) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }
    return (
      `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-` +
      `${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-` +
      `${hex.slice(10, 16).join('')}`
    );
  }

  // Last-resort Math.random fallback. Only triggered in environments without
  // any crypto implementation (extremely rare, never in prod browsers).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
