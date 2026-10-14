/**
 * GET /api/admin/marketing/content?days=30
 *
 * Which content pages (articles, calculators, tools) bring orders. Orders
 * created in the window, grouped by `contentSource(orders.attribution)`:
 * started (draft created) vs paid, revenue, and how strong the evidence is
 * (click on a service card vs. only the landing page).
 *
 * Permission: settings.manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { contentSource, type ContentKind } from '@/lib/analytics/content-attribution';

export const dynamic = 'force-dynamic';

interface Row {
  page: string;
  kind: ContentKind;
  started: number;
  paid: number;
  revenueRon: number;
  /** Orders where the visitor clicked a service card on the page. */
  clickStarted: number;
  clickPaid: number;
  placements: Record<string, number>;
  services: Record<string, number>;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }

  const days = Math.min(365, Math.max(1, parseInt(request.nextUrl.searchParams.get('days') ?? '30', 10) || 30));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data, error } = await admin
    .from('orders')
    .select('total_price, attribution, paid_at')
    .gte('created_at', since)
    .eq('is_test', false)
    .not('attribution', 'is', null)
    .limit(20000);
  if (error) {
    console.error('marketing/content: orders query failed', error.message);
    return NextResponse.json({ success: false, error: 'Nu am putut citi comenzile.' }, { status: 500 });
  }

  const orders: Array<{ total_price: number | null; attribution: Parameters<typeof contentSource>[0]; paid_at: string | null }> =
    data ?? [];
  const byPage = new Map<string, Row>();
  let started = 0;
  let paid = 0;

  for (const o of orders) {
    const src = contentSource(o.attribution);
    if (!src) continue;
    const isPaid = !!o.paid_at;
    const row =
      byPage.get(src.page) ??
      ({ page: src.page, kind: src.kind, started: 0, paid: 0, revenueRon: 0, clickStarted: 0, clickPaid: 0, placements: {}, services: {} } as Row);
    row.started += 1;
    started += 1;
    if (isPaid) {
      row.paid += 1;
      paid += 1;
      row.revenueRon = Math.round((row.revenueRon + Number(o.total_price ?? 0)) * 100) / 100;
    }
    if (src.via === 'click') {
      row.clickStarted += 1;
      if (isPaid) row.clickPaid += 1;
      if (src.placement) row.placements[src.placement] = (row.placements[src.placement] ?? 0) + 1;
      if (src.service) row.services[src.service] = (row.services[src.service] ?? 0) + 1;
    }
    byPage.set(src.page, row);
  }

  const rows = [...byPage.values()].sort((a, b) => b.revenueRon - a.revenueRon || b.started - a.started);
  return NextResponse.json({
    success: true,
    data: { days, ordersWithAttribution: orders.length, started, paid, rows },
  });
}
