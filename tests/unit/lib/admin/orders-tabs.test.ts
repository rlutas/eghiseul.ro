import { describe, expect, it } from 'vitest';
import {
  parseTestFilter,
  resolveStatusFilter,
  STATUS_TABS,
  HIDDEN_FROM_DEFAULT,
  PROCESSING_GROUP,
  SHIPPED_GROUP,
} from '@/lib/admin/orders-tabs';

// These pure functions back the /admin/orders tab strip + sandbox chips +
// list endpoint. Get them wrong and the visible list drifts from the badges.

describe('parseTestFilter', () => {
  it('defaults to hide when input missing or unknown', () => {
    expect(parseTestFilter(null)).toBe('hide');
    expect(parseTestFilter(undefined)).toBe('hide');
    expect(parseTestFilter('')).toBe('hide');
    expect(parseTestFilter('something-else')).toBe('hide');
  });

  it('accepts only/all verbatim, case-insensitive', () => {
    expect(parseTestFilter('only')).toBe('only');
    expect(parseTestFilter('ONLY')).toBe('only');
    expect(parseTestFilter('all')).toBe('all');
    expect(parseTestFilter('All')).toBe('all');
  });

  it('treats explicit hide as hide', () => {
    expect(parseTestFilter('hide')).toBe('hide');
    expect(parseTestFilter('HIDE')).toBe('hide');
  });
});

describe('resolveStatusFilter', () => {
  it('all → notIn HIDDEN_FROM_DEFAULT', () => {
    const f = resolveStatusFilter('all');
    expect(f.notIn).toEqual(HIDDEN_FROM_DEFAULT);
    expect(f.eq).toBeUndefined();
    expect(f.in).toBeUndefined();
  });

  it('null/empty/undefined collapse to all', () => {
    expect(resolveStatusFilter(null).notIn).toEqual(HIDDEN_FROM_DEFAULT);
    expect(resolveStatusFilter(undefined).notIn).toEqual(HIDDEN_FROM_DEFAULT);
    expect(resolveStatusFilter('').notIn).toEqual(HIDDEN_FROM_DEFAULT);
  });

  it('processing tab → in PROCESSING_GROUP', () => {
    const f = resolveStatusFilter('processing');
    expect(f.in).toEqual(PROCESSING_GROUP);
  });

  it('shipped tab → in SHIPPED_GROUP', () => {
    const f = resolveStatusFilter('shipped');
    expect(f.in).toEqual(SHIPPED_GROUP);
  });

  it('paid/completed → eq', () => {
    expect(resolveStatusFilter('paid').eq).toBe('paid');
    expect(resolveStatusFilter('completed').eq).toBe('completed');
  });

  it('abandoned ("Neplătite") tab → in draft+pending+abandoned', () => {
    // The tab surfaces every incomplete/unpaid order (draft, pending, and
    // explicit abandons) so failed-payment orders are visible for follow-up.
    expect(resolveStatusFilter('abandoned').in).toEqual(HIDDEN_FROM_DEFAULT);
    expect(resolveStatusFilter('abandoned').eq).toBeUndefined();
  });

  it('debug statuses pass through as eq', () => {
    expect(resolveStatusFilter('draft').eq).toBe('draft');
    expect(resolveStatusFilter('pending').eq).toBe('pending');
    expect(resolveStatusFilter('cancelled').eq).toBe('cancelled');
    expect(resolveStatusFilter('refunded').eq).toBe('refunded');
  });

  it('unknown value falls back to all (defensive)', () => {
    // Prevents a typo in a URL from accidentally widening the search to every
    // row including drafts/pendings.
    expect(resolveStatusFilter('not-a-real-tab').notIn).toEqual(HIDDEN_FROM_DEFAULT);
  });
});

describe('STATUS_TABS', () => {
  it('exposes the 7 tabs in the canonical order', () => {
    expect(STATUS_TABS.map((t) => t.value)).toEqual([
      'all',
      'paid',
      'processing',
      'shipped',
      'completed',
      'abandoned',
      'standby',
    ]);
  });

  it('every tab has a Romanian label + a countKey', () => {
    for (const tab of STATUS_TABS) {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(typeof tab.countKey).toBe('string');
    }
  });
});

describe('group invariants', () => {
  it('HIDDEN_FROM_DEFAULT does not overlap PROCESSING/SHIPPED', () => {
    for (const hidden of HIDDEN_FROM_DEFAULT) {
      expect(PROCESSING_GROUP).not.toContain(hidden);
      expect(SHIPPED_GROUP).not.toContain(hidden);
    }
  });

  it('PROCESSING_GROUP and SHIPPED_GROUP are disjoint', () => {
    for (const p of PROCESSING_GROUP) {
      expect(SHIPPED_GROUP).not.toContain(p);
    }
  });
});
