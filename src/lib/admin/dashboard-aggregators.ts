/**
 * Pure-function aggregators for `/api/admin/dashboard/stats`. Pulled into
 * their own module so the grouping/sorting/rounding logic is unit-testable
 * without spinning up a Supabase client.
 *
 * Each helper takes the raw rows the query returns and produces the shape
 * the dashboard UI consumes — bar charts (sorted desc) for status +
 * services, plus a flat recovery-rate percent.
 */

export interface StatusRow {
  status: string | null;
}

export interface StatusBucket {
  status: string;
  count: number;
}

/**
 * Collapse a list of `{status}` rows into `[{status, count}]` sorted
 * descending by count. Used by the dashboard's "Distribuție pe status"
 * bar chart.
 */
export function aggregateStatusDistribution(rows: StatusRow[]): StatusBucket[] {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const s = row.status ?? 'unknown';
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status));
}

export interface ServiceRevenueRow {
  total_price: number | null;
  services: { slug?: string | null; name?: string | null } | null;
}

export interface ServiceBucket {
  slug: string;
  name: string;
  count: number;
  /** Cumulative revenue in RON, rounded to 2 decimals. */
  revenue: number;
}

/**
 * Group paid orders by service slug and aggregate count + revenue.
 * Returns buckets sorted descending by revenue. Used by the dashboard's
 * "Servicii (luna curentă)" bar chart.
 */
export function aggregateServiceRevenue(rows: ServiceRevenueRow[]): ServiceBucket[] {
  const map = new Map<string, ServiceBucket>();
  for (const row of rows) {
    const slug = row.services?.slug ?? 'unknown';
    const name = row.services?.name ?? 'Necunoscut';
    const entry = map.get(slug) ?? { slug, name, count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += Number(row.total_price ?? 0);
    map.set(slug, entry);
  }
  return Array.from(map.values())
    .map((s) => ({ ...s, revenue: Math.round(s.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
}

/**
 * Recovery rate = recovered / emails_sent × 100, rounded to 1 decimal.
 * Returns 0 when no emails went out (avoids NaN in the UI).
 */
export function computeRecoveryRatePercent(args: {
  emailsSent: number;
  recovered: number;
}): number {
  if (args.emailsSent <= 0) return 0;
  return Math.round((args.recovered / args.emailsSent) * 1000) / 10;
}
