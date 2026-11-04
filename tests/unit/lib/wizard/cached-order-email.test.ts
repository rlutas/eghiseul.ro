import { describe, expect, it } from 'vitest';
import { cachedEmailForOrder } from '@/lib/wizard/cached-order-email';

function storageWith(entries: Record<string, string>): Storage {
  const keys = Object.keys(entries);
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null,
    getItem: (key: string) => entries[key] ?? null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

describe('cachedEmailForOrder', () => {
  it('returns the email of the matching draft only', () => {
    const storage = storageWith({
      order_draft_a: JSON.stringify({ friendlyOrderId: 'E-1', data: { contact: { email: 'a@b.ro' } } }),
      order_draft_b: JSON.stringify({ friendlyOrderId: 'E-2', data: { contact: { email: 'c@d.ro' } } }),
    });
    expect(cachedEmailForOrder('E-2', storage)).toBe('c@d.ro');
    expect(cachedEmailForOrder('E-3', storage)).toBeNull();
  });

  it('survives a damaged copy and ignores other keys', () => {
    const storage = storageWith({ other: '{bad', order_draft_a: '{bad' });
    expect(cachedEmailForOrder('E-1', storage)).toBeNull();
  });
});
