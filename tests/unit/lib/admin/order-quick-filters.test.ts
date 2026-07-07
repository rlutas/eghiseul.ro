import { describe, it, expect } from 'vitest';
import {
  isQuickFilter,
  isStageFilter,
  STAGE_FILTERS,
  STAGE_LABELS,
  applyQuickOrStage,
} from '@/lib/admin/order-quick-filters';

describe('quick/stage filter guards', () => {
  it('isQuickFilter accepts only the 3 quick chips', () => {
    expect(isQuickFilter('overdue')).toBe(true);
    expect(isQuickFilter('deadline_soon')).toBe(true);
    expect(isQuickFilter('with_coupon')).toBe(true);
    expect(isQuickFilter('ready')).toBe(false);
    expect(isQuickFilter(null)).toBe(false);
    expect(isQuickFilter('')).toBe(false);
  });

  it('isStageFilter accepts only the 4 pipeline stages', () => {
    expect(isStageFilter('documents_generated')).toBe(true);
    expect(isStageFilter('submitted')).toBe(true);
    expect(isStageFilter('received')).toBe(true);
    expect(isStageFilter('ready')).toBe(true);
    expect(isStageFilter('overdue')).toBe(false);
    expect(isStageFilter(null)).toBe(false);
  });

  it('every stage has a Romanian label', () => {
    for (const key of Object.keys(STAGE_FILTERS) as (keyof typeof STAGE_FILTERS)[]) {
      expect(STAGE_LABELS[key]).toBeTruthy();
    }
  });
});

describe('applyQuickOrStage — query builder chaining', () => {
  // Minimal chainable spy that records every builder call.
  function makeQuery() {
    const calls: Array<[string, unknown[]]> = [];
    const q: Record<string, (...a: unknown[]) => unknown> = {};
    for (const m of ['lt', 'gte', 'lte', 'not', 'eq']) {
      q[m] = (...args: unknown[]) => {
        calls.push([m, args]);
        return q;
      };
    }
    return { q, calls };
  }

  it('overdue → estimated_completion_date < now + excludes inactive statuses', () => {
    const { q, calls } = makeQuery();
    applyQuickOrStage(q, 'overdue');
    expect(calls.find(([m]) => m === 'lt')?.[1][0]).toBe('estimated_completion_date');
    expect(calls.some(([m, a]) => m === 'not' && a[0] === 'status')).toBe(true);
  });

  it('deadline_soon → gte now AND lte now+48h', () => {
    const { q, calls } = makeQuery();
    applyQuickOrStage(q, 'deadline_soon');
    expect(calls.some(([m, a]) => m === 'gte' && a[0] === 'estimated_completion_date')).toBe(true);
    expect(calls.some(([m, a]) => m === 'lte' && a[0] === 'estimated_completion_date')).toBe(true);
  });

  it('with_coupon → coupon_code is not null', () => {
    const { q, calls } = makeQuery();
    applyQuickOrStage(q, 'with_coupon');
    expect(calls[0]).toEqual(['not', ['coupon_code', 'is', null]]);
  });

  it('stage filter → eq status', () => {
    const { q, calls } = makeQuery();
    applyQuickOrStage(q, 'submitted');
    expect(calls[0]).toEqual(['eq', ['status', 'submitted_to_institution']]);
  });

  it('unknown value → no-op', () => {
    const { q, calls } = makeQuery();
    applyQuickOrStage(q, 'nonsense');
    expect(calls).toHaveLength(0);
  });
});
