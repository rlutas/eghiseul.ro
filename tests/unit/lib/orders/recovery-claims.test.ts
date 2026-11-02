import { describe, it, expect } from 'vitest';
import {
  buildClaimIndex,
  findClaim,
  isRecoveryQueueCandidate,
  pickVisibleIds,
} from '@/lib/orders/recovery-claims';
import { buildPaidIndex } from '@/lib/orders/phone-recovery-wins';

const named = (email: string, extra: Record<string, unknown> = {}) => ({
  contact: { email, phone: '0712345678' },
  personal: { firstName: 'Ana', lastName: 'Pop' },
  ...extra,
});

describe('buildClaimIndex / findClaim', () => {
  const index = buildClaimIndex([
    { email: 'Ana@Example.ro ', phone: '+40 712 345 678', reason: 'queue' },
    { email: 'ion@x.ro', phone: null, reason: 'called' },
    { email: 'ion@x.ro', phone: null, reason: 'queue' },
    { email: null, phone: '0799111222', reason: 'no_answer' },
  ]);

  it('matches by email, case and spaces ignored', () => {
    expect(findClaim(index, 'ana@example.ro', null)).toBe('queue');
  });

  it('matches by the last 9 phone digits when the email differs', () => {
    expect(findClaim(index, 'alt@email.ro', '0712345678')).toBe('queue');
    expect(findClaim(index, null, '+40799111222')).toBe('no_answer');
  });

  it('keeps the strongest reason for a client (called beats queue)', () => {
    expect(findClaim(index, 'ion@x.ro', null)).toBe('called');
  });

  it('returns the stronger of the email and phone matches', () => {
    expect(findClaim(index, 'ion@x.ro', '0712345678')).toBe('called');
  });

  it('null for clients outside recovery', () => {
    expect(findClaim(index, 'nimeni@x.ro', '0700000000')).toBeNull();
    expect(findClaim(index, null, null)).toBeNull();
  });
});

describe('isRecoveryQueueCandidate', () => {
  const now = '2026-11-02T10:00:00.000Z';
  const empty = buildPaidIndex([]);

  it('a named draft with data beyond the contact step is in the queue', () => {
    expect(
      isRecoveryQueueCandidate({ status: 'draft', customer_data: named('ana@gmail.com'), created_at: now }, empty)
    ).toBe(true);
  });

  it('a draft with only the contact step is not', () => {
    expect(
      isRecoveryQueueCandidate(
        { status: 'draft', customer_data: { contact: { email: 'ana@gmail.com' } }, created_at: now },
        empty
      )
    ).toBe(false);
  });

  it('an abandoned order without a name is not', () => {
    expect(
      isRecoveryQueueCandidate(
        { status: 'abandoned', customer_data: { contact: { email: 'ana@gmail.com' } }, created_at: now },
        empty
      )
    ).toBe(false);
  });

  it('a client who paid another order since is not', () => {
    const paid = buildPaidIndex([
      { email: 'ana@gmail.com', paidAt: '2026-11-02T12:00:00.000Z', totalRon: 100, ref: 'E-1', orderId: 'p1' },
    ]);
    expect(
      isRecoveryQueueCandidate({ status: 'draft', customer_data: named('ana@gmail.com'), created_at: now }, paid)
    ).toBe(false);
  });
});

describe('pickVisibleIds', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];

  it('skips hidden ids before paging', () => {
    expect(pickVisibleIds(ids, new Set(['a', 'c']), 0, 2)).toEqual(['b', 'd']);
    expect(pickVisibleIds(ids, new Set(['a', 'c']), 2, 2)).toEqual(['e', 'f']);
  });

  it('no hidden ids = plain paging', () => {
    expect(pickVisibleIds(ids, new Set(), 4, 5)).toEqual(['e', 'f']);
  });
});
