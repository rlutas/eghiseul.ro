import { describe, it, expect, vi } from 'vitest';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));

process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-signing-key';

import { hashPassword, makeUnlockToken, verifyUnlockToken, PRIVATE_UNLOCK_TTL_MS } from '@/lib/collaborator/private-gate';

const ID = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-2222-3333-4444-555555555555';

describe('private-gate unlock token', () => {
  it('verifies a freshly signed token for the same collaborator', () => {
    const token = makeUnlockToken(ID, 1_000_000);
    expect(verifyUnlockToken(token, ID, 1_000_000 + 1000)).toBe(true);
  });

  it('rejects a token issued for another collaborator', () => {
    const token = makeUnlockToken(OTHER, 1_000_000);
    expect(verifyUnlockToken(token, ID, 1_000_000 + 1000)).toBe(false);
  });

  it('rejects an expired token', () => {
    const token = makeUnlockToken(ID, 1_000_000);
    expect(verifyUnlockToken(token, ID, 1_000_000 + PRIVATE_UNLOCK_TTL_MS + 1)).toBe(false);
  });

  it('rejects a tampered expiry', () => {
    const token = makeUnlockToken(ID, 1_000_000);
    const [id, exp, sig] = token.split('.');
    const forged = `${id}.${Number(exp) + 999_999_999}.${sig}`;
    expect(verifyUnlockToken(forged, ID, 1_000_000)).toBe(false);
  });

  it('rejects garbage and missing tokens', () => {
    expect(verifyUnlockToken(undefined, ID)).toBe(false);
    expect(verifyUnlockToken('abc', ID)).toBe(false);
    expect(verifyUnlockToken('a.b.c', ID)).toBe(false);
  });
});

describe('private-gate password hashing', () => {
  it('salts each hash differently', () => {
    const a = hashPassword('parola-mircea');
    const b = hashPassword('parola-mircea');
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
    expect(a.hash).toHaveLength(64);
  });
});
