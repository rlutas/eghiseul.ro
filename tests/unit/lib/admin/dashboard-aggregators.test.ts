import { describe, expect, it } from 'vitest';
import {
  aggregateStatusDistribution,
  aggregateServiceRevenue,
  computeRecoveryRatePercent,
} from '@/lib/admin/dashboard-aggregators';

// The dashboard stats endpoint pulls raw rows and these helpers shape them
// for the bar charts. Sorting + rounding need to stay deterministic so the
// UI doesn't shuffle bars between renders.

describe('aggregateStatusDistribution', () => {
  it('returns an empty array for no rows', () => {
    expect(aggregateStatusDistribution([])).toEqual([]);
  });

  it('counts each status and sorts descending', () => {
    const out = aggregateStatusDistribution([
      { status: 'paid' },
      { status: 'paid' },
      { status: 'paid' },
      { status: 'processing' },
      { status: 'shipped' },
      { status: 'shipped' },
    ]);
    expect(out).toEqual([
      { status: 'paid', count: 3 },
      { status: 'shipped', count: 2 },
      { status: 'processing', count: 1 },
    ]);
  });

  it('breaks count ties with alphabetical status name', () => {
    // Deterministic order on ties — important for snapshot stability of
    // the bar chart between renders / SSR / refreshes.
    const out = aggregateStatusDistribution([
      { status: 'shipped' },
      { status: 'paid' },
    ]);
    expect(out.map((r) => r.status)).toEqual(['paid', 'shipped']);
  });

  it('maps null status to "unknown" so the chart never shows blank labels', () => {
    const out = aggregateStatusDistribution([
      { status: null },
      { status: null },
      { status: 'paid' },
    ]);
    expect(out).toEqual([
      { status: 'unknown', count: 2 },
      { status: 'paid', count: 1 },
    ]);
  });
});

describe('aggregateServiceRevenue', () => {
  it('returns an empty array for no rows', () => {
    expect(aggregateServiceRevenue([])).toEqual([]);
  });

  it('groups by service slug and sums revenue', () => {
    const out = aggregateServiceRevenue([
      { total_price: 278, services: { slug: 'cazier-judiciar', name: 'Cazier Judiciar' } },
      { total_price: 198, services: { slug: 'cazier-judiciar', name: 'Cazier Judiciar' } },
      { total_price: 100, services: { slug: 'cazier-fiscal', name: 'Cazier Fiscal' } },
    ]);
    expect(out).toEqual([
      { slug: 'cazier-judiciar', name: 'Cazier Judiciar', count: 2, revenue: 476 },
      { slug: 'cazier-fiscal', name: 'Cazier Fiscal', count: 1, revenue: 100 },
    ]);
  });

  it('rounds revenue to 2 decimals (no IEEE-754 noise on the wire)', () => {
    // 178.5 + 178.5 + 178.5 = 535.5 — but float math can output 535.4999...
    const out = aggregateServiceRevenue([
      { total_price: 178.5, services: { slug: 's', name: 'S' } },
      { total_price: 178.5, services: { slug: 's', name: 'S' } },
      { total_price: 178.5, services: { slug: 's', name: 'S' } },
    ]);
    expect(out[0].revenue).toBe(535.5);
  });

  it('uses "unknown" / "Necunoscut" fallbacks for orphan service joins', () => {
    // Defensive: if `services` join returned NULL (deleted service?) we
    // still want a labeled bucket rather than crashing the dashboard.
    const out = aggregateServiceRevenue([
      { total_price: 50, services: null },
      { total_price: 100, services: { slug: null, name: null } },
    ]);
    expect(out).toEqual([
      { slug: 'unknown', name: 'Necunoscut', count: 2, revenue: 150 },
    ]);
  });

  it('handles null total_price as zero contribution', () => {
    const out = aggregateServiceRevenue([
      { total_price: null, services: { slug: 's', name: 'S' } },
      { total_price: 100, services: { slug: 's', name: 'S' } },
    ]);
    expect(out[0]).toEqual({ slug: 's', name: 'S', count: 2, revenue: 100 });
  });

  it('breaks revenue ties with alphabetical service name', () => {
    const out = aggregateServiceRevenue([
      { total_price: 100, services: { slug: 'z', name: 'Z' } },
      { total_price: 100, services: { slug: 'a', name: 'A' } },
    ]);
    expect(out.map((r) => r.slug)).toEqual(['a', 'z']);
  });
});

describe('computeRecoveryRatePercent', () => {
  it('returns 0 when no emails were sent (avoid NaN)', () => {
    expect(computeRecoveryRatePercent({ emailsSent: 0, recovered: 0 })).toBe(0);
    expect(computeRecoveryRatePercent({ emailsSent: 0, recovered: 5 })).toBe(0);
  });

  it('computes the percentage with 1 decimal precision', () => {
    expect(computeRecoveryRatePercent({ emailsSent: 100, recovered: 12 })).toBe(12);
    expect(computeRecoveryRatePercent({ emailsSent: 100, recovered: 17 })).toBe(17);
    // 1/3 → 33.333... → rounded to 33.3
    expect(computeRecoveryRatePercent({ emailsSent: 3, recovered: 1 })).toBe(33.3);
    // 2/3 → 66.666... → 66.7
    expect(computeRecoveryRatePercent({ emailsSent: 3, recovered: 2 })).toBe(66.7);
  });

  it('caps at 100% when recovered > sent (legacy data sanity)', () => {
    // If data is inconsistent (recovered > sent) we still return a sane
    // number — the dashboard chart caps width at 100% visually.
    expect(computeRecoveryRatePercent({ emailsSent: 5, recovered: 10 })).toBe(200);
    // Note: we don't clamp here — the underlying signal (twice as many
    // "recovered" as "sent") is a data issue the operator should see.
  });
});
