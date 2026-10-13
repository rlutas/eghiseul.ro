import { describe, it, expect } from 'vitest';
import {
  REENGAGE_DAILY_CAP,
  REENGAGE_MAX_PER_RUN,
  newestIso,
  reengageBudget,
  reengageReason,
  selectReengage,
  type ReengageContext,
  type ReengageOrder,
} from '@/lib/orders/reengage';

const NOW = new Date('2026-10-13T10:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

const order = (id: string, email: string | null, ageDays: number, extra: Partial<ReengageOrder> = {}): ReengageOrder => ({
  id,
  email,
  status: 'abandoned',
  platform: 'eghiseul',
  isTest: false,
  createdAt: daysAgo(ageDays),
  paidAt: null,
  hasProgress: true,
  ...extra,
});

const ctx = (extra: Partial<ReengageContext> = {}): ReengageContext => ({
  now: NOW,
  suppressed: new Set(),
  alreadyReengaged: new Set(),
  newestOrderByEmail: new Map(),
  paidByEmail: new Map(),
  lastContactByEmail: new Map(),
  ...extra,
});

describe('reengageReason', () => {
  it('accepts an unpaid eghiseul order 7–60 days old', () => {
    expect(reengageReason(order('1', 'ana@x.ro', 10), ctx())).toBeNull();
  });

  it('keeps the 7–60 day window', () => {
    expect(reengageReason(order('1', 'ana@x.ro', 6), ctx())).toBe('too fresh');
    expect(reengageReason(order('1', 'ana@x.ro', 61), ctx())).toBe('too old');
  });

  it('skips documentero, test orders, paid and non-unpaid statuses', () => {
    expect(reengageReason(order('1', 'ana@x.ro', 10, { platform: 'documentero' }), ctx())).toBe('not eghiseul');
    expect(reengageReason(order('1', 'ana@x.ro', 10, { isTest: true }), ctx())).toBe('test order');
    expect(reengageReason(order('1', 'ana@x.ro', 10, { paidAt: daysAgo(9) }), ctx())).toBe('paid');
    expect(reengageReason(order('1', 'ana@x.ro', 10, { status: 'cancelled' }), ctx())).toBe('not unpaid');
  });

  it('skips drafts that stopped at the contact step', () => {
    expect(reengageReason(order('1', 'ana@x.ro', 10, { status: 'draft', hasProgress: false }), ctx())).toBe('contact-only draft');
    expect(reengageReason(order('1', 'ana@x.ro', 10, { status: 'draft', hasProgress: true }), ctx())).toBeNull();
  });

  it('skips bad addresses and suppressed contacts', () => {
    expect(reengageReason(order('1', null, 10), ctx())).toBe('no valid email');
    expect(reengageReason(order('1', 'ana@gmail.con', 10), ctx())).toBe('typo domain');
    expect(reengageReason(order('1', 'Ana@x.ro', 10), ctx({ suppressed: new Set(['ana@x.ro']) }))).toBe('suppressed');
  });

  it('sends once per address, ever', () => {
    expect(reengageReason(order('1', 'ANA@x.ro ', 10), ctx({ alreadyReengaged: new Set(['ana@x.ro']) }))).toBe('already reengaged');
  });

  it('writes only about the newest order of an address', () => {
    const c = ctx({ newestOrderByEmail: new Map([['ana@x.ro', daysAgo(2)]]) });
    expect(reengageReason(order('1', 'ana@x.ro', 10), c)).toBe('newer order exists');
  });

  it('skips clients called or emailed in the last 7 days', () => {
    expect(reengageReason(order('1', 'ana@x.ro', 20), ctx({ lastContactByEmail: new Map([['ana@x.ro', daysAgo(3)]]) }))).toBe('contacted recently');
    expect(reengageReason(order('1', 'ana@x.ro', 20), ctx({ lastContactByEmail: new Map([['ana@x.ro', daysAgo(8)]]) }))).toBeNull();
  });

  it('skips clients who paid another order since, or shortly before', () => {
    expect(reengageReason(order('1', 'ana@x.ro', 20), ctx({ paidByEmail: new Map([['ana@x.ro', [daysAgo(5)]]]) }))).toBe('already paid');
    expect(reengageReason(order('1', 'ana@x.ro', 20), ctx({ paidByEmail: new Map([['ana@x.ro', [daysAgo(50)]]]) }))).toBe('already paid');
    expect(reengageReason(order('1', 'ana@x.ro', 20), ctx({ paidByEmail: new Map([['ana@x.ro', [daysAgo(200)]]]) }))).toBeNull();
  });
});

describe('selectReengage', () => {
  it('picks newest first, one per address, capped', () => {
    const list = [
      order('old', 'ana@x.ro', 30),
      order('new', 'Ana@x.ro', 12),
      order('bob', 'bob@x.ro', 20),
      order('cid', 'cid@x.ro', 40),
    ];
    expect(selectReengage(list, ctx(), 10).map((o) => o.id)).toEqual(['new', 'bob', 'cid']);
    expect(selectReengage(list, ctx(), 2).map((o) => o.id)).toEqual(['new', 'bob']);
  });
});

describe('reengageBudget', () => {
  it('respects the per-run, daily and total caps', () => {
    expect(reengageBudget(0, 0)).toBe(REENGAGE_MAX_PER_RUN);
    expect(reengageBudget(REENGAGE_DAILY_CAP - 4, 100)).toBe(4);
    expect(reengageBudget(0, 495)).toBe(5);
    expect(reengageBudget(0, 600)).toBe(0);
  });
});

describe('newestIso', () => {
  it('ignores nulls', () => {
    expect(newestIso(null, daysAgo(3), undefined, daysAgo(1))).toBe(daysAgo(1));
    expect(newestIso(null, undefined)).toBeNull();
  });
});
