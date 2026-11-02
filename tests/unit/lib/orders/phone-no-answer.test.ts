import { describe, it, expect } from 'vitest';
import {
  applyNoAnswer,
  buildNoAnswerIndex,
  isClosedByNoAnswer,
  isNoAnswerAction,
  NO_ANSWER_LIMIT,
  noAnswerClosedAt,
  parseNoAnswerAttempts,
  type NoAnswerAttempt,
} from '@/lib/orders/phone-no-answer';
import { buildPaidIndex, summarizeCalls } from '@/lib/orders/phone-recovery-wins';

const a = (at: string, caller = 'Maria'): NoAnswerAttempt => ({ at, caller });

describe('parseNoAnswerAttempts', () => {
  it('drops invalid entries and sorts oldest first', () => {
    expect(
      parseNoAnswerAttempts([
        { at: '2026-11-02T12:00:00Z', caller: 'Carla' },
        { at: 'not a date', caller: 'Maria' },
        null,
        'x',
        { at: '2026-11-01T09:00:00Z' },
      ])
    ).toEqual([a('2026-11-01T09:00:00Z', ''), a('2026-11-02T12:00:00Z', 'Carla')]);
  });
  it('non-array → empty', () => {
    expect(parseNoAnswerAttempts(null)).toEqual([]);
    expect(parseNoAnswerAttempts({})).toEqual([]);
  });
});

describe('applyNoAnswer', () => {
  it('adds up to the limit, then refuses', () => {
    const one = applyNoAnswer([], 'add', 'Maria', '2026-11-02T09:00:00Z');
    expect(one).toEqual({ ok: true, attempts: [a('2026-11-02T09:00:00Z')] });
    const two = applyNoAnswer(one.ok ? one.attempts : [], 'add', 'Carla', '2026-11-02T15:00:00Z');
    expect(two.ok && two.attempts).toHaveLength(NO_ANSWER_LIMIT);
    const three = applyNoAnswer(two.ok ? two.attempts : [], 'add', 'Maria');
    expect(three.ok).toBe(false);
  });
  it('undo removes only the last attempt; nothing to undo → error', () => {
    const r = applyNoAnswer([a('2026-11-01T09:00:00Z'), a('2026-11-02T09:00:00Z', 'Carla')], 'undo', 'Maria');
    expect(r).toEqual({ ok: true, attempts: [a('2026-11-01T09:00:00Z')] });
    expect(applyNoAnswer([], 'undo', 'Maria').ok).toBe(false);
  });
  it('validates the action', () => {
    expect(isNoAnswerAction('add')).toBe(true);
    expect(isNoAnswerAction('undo')).toBe(true);
    expect(isNoAnswerAction('remove')).toBe(false);
  });
});

describe('queue exclusion at 2 no-answers', () => {
  const closedAt = '2026-11-02T15:00:00Z';
  const idx = buildNoAnswerIndex([
    { email: 'Ana@ex.ro', phone: '0712 345 678', attempts: [a('2026-11-02T09:00:00Z'), a(closedAt)] },
    { email: 'bob@ex.ro', phone: null, attempts: [a('2026-11-02T09:00:00Z')] },
  ]);

  it('one no-answer keeps the client in the queue', () => {
    expect(noAnswerClosedAt([a('2026-11-02T09:00:00Z')])).toBeNull();
    expect(isClosedByNoAnswer(idx, 'bob@ex.ro', null, '2026-11-01T00:00:00Z')).toBe(false);
  });

  it('two no-answers close the client, on every older order (email or phone)', () => {
    expect(noAnswerClosedAt([a('2026-11-02T09:00:00Z'), a(closedAt)])).toBe(closedAt);
    expect(isClosedByNoAnswer(idx, 'ana@ex.ro', null, '2026-11-01T00:00:00Z')).toBe(true);
    expect(isClosedByNoAnswer(idx, null, '+40712345678', '2026-10-20T00:00:00Z')).toBe(true);
  });

  it('an order started after the closure comes back', () => {
    expect(isClosedByNoAnswer(idx, 'ana@ex.ro', null, '2026-11-03T08:00:00Z')).toBe(false);
  });

  it('a no-answer is not a call: it never counts as a recovery', () => {
    // Only phone_contacted_at feeds the call KPIs; a client with no-answers
    // only, who later paid, contributes nothing.
    const paid = buildPaidIndex([
      { email: 'ana@ex.ro', paidAt: '2026-11-03T10:00:00Z', totalRon: 198, ref: 'E-1', orderId: 'p1' },
    ]);
    expect(summarizeCalls([], paid)).toEqual({ calls7: 0, calls30: 0, recovered: 0, recoveredLei: 0 });
  });
});
