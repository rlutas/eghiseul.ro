/**
 * GET /api/admin/marketing/offline-conversions?platform=constatator&days=30
 *
 * Paid orders that came from a Google ad click, for upload in Google Ads
 * (Goals → Conversions → Uploads). JSON by default; `format=csv` returns the
 * upload file with the orders the Ads tag did NOT already report
 * (`include_sent=1` adds the rest). `name` is the conversion action to
 * credit, exactly as it is spelled in the Ads account.
 *
 * One Ads account per brand, so `platform` is required: uploading
 * constatator sales into the cazier fiscal account would be wrong.
 * Permission: settings.manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { isBrandId } from '@/lib/brand/brands';
import {
  buildGoogleOfflineCsv,
  googleOfflineRows,
  type AttributionWithAdClick,
} from '@/lib/analytics/offline-conversions';

export const dynamic = 'force-dynamic';

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

  const q = request.nextUrl.searchParams;
  const platform = q.get('platform');
  if (!isBrandId(platform)) {
    return NextResponse.json({ success: false, error: 'Parametrul platform lipsește sau e necunoscut' }, { status: 400 });
  }
  const days = Math.min(90, Math.max(1, parseInt(q.get('days') ?? '30', 10) || 30));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('orders')
    .select('friendly_order_id, order_number, total_price, paid_at, attribution')
    .eq('platform', platform)
    .eq('is_test', false)
    .not('paid_at', 'is', null)
    .gte('paid_at', since)
    .order('paid_at', { ascending: true })
    .limit(5000);
  if (error) {
    console.error('[offline-conversions] query failed:', error.message);
    return NextResponse.json({ success: false, error: 'Nu am putut citi comenzile' }, { status: 500 });
  }

  const rows = googleOfflineRows(
    ((data ?? []) as Array<{
      friendly_order_id: string | null;
      order_number: string | null;
      total_price: number | null;
      paid_at: string;
      attribution: AttributionWithAdClick | null;
    }>).map((o) => ({
      orderNumber: o.friendly_order_id || o.order_number || '',
      paidAt: o.paid_at,
      totalRon: Number(o.total_price ?? 0),
      attribution: o.attribution,
    })),
  );

  if (q.get('format') === 'csv') {
    const name = (q.get('name') || 'Purchase offline').slice(0, 100);
    const selected = q.get('include_sent') === '1' ? rows : rows.filter((r) => !r.tagAlreadySent);
    return new NextResponse(buildGoogleOfflineCsv(selected, name), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="conversii-offline-${platform}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      platform,
      days,
      paidOrders: (data ?? []).length,
      fromGoogleAds: rows.length,
      notYetAtGoogle: rows.filter((r) => !r.tagAlreadySent).length,
      rows,
    },
  });
}
