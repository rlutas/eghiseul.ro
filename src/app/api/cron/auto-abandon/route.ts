/**
 * POST /api/cron/auto-abandon
 *
 * Flip `status='pending'` orders older than 30 minutes to `status='abandoned'`.
 * Inserts an `order_history` audit row per flipped order so the timeline
 * shows who/when (changed_by='system-cron'). Returns a summary count for
 * monitoring.
 *
 * Why 30 minutes:
 *   - A real customer who's actively going through checkout stays on the page
 *     until Stripe redirects back; their order moves to `paid` in seconds.
 *   - If 30 minutes have passed without a payment intent flip, the customer
 *     is gone — keep the row for analytics but stop counting it as "pending"
 *     in the admin list (it pollutes the operational view).
 *   - Recovery cron picks them up later (within 7 days) and tries to bring
 *     the customer back with a discount coupon.
 *
 * Authentication: `CRON_SECRET` in `Authorization: Bearer ...` header.
 * Scheduled: every 15 minutes via vercel.json.
 *
 * Mirror of `/api/cron/abandonment` in cazierjudiciaronline.com — same
 * 30-minute threshold, same audit-row pattern, same response shape.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ABANDON_AFTER_MINUTES = 30;

export async function POST(request: NextRequest) {
  // 1. Auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();

  // 2. Find pending orders older than the threshold. We update only the
  //    minimum set of fields needed and return enough info to write the
  //    history rows below.
  const cutoffIso = new Date(
    Date.now() - ABANDON_AFTER_MINUTES * 60 * 1000
  ).toISOString();

  const { data: candidates, error: fetchError } = await supabase
    .from('orders')
    .select('id, order_number, friendly_order_id, created_at, customer_data')
    .eq('status', 'pending')
    .lt('created_at', cutoffIso)
    .limit(500); // safety cap so a runaway cron doesn't lock the table

  if (fetchError) {
    console.error('[auto-abandon] fetch failed:', fetchError);
    return NextResponse.json(
      { success: false, error: fetchError.message },
      { status: 500 }
    );
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({
      success: true,
      data: { abandonedCount: 0, processedAt: new Date().toISOString() },
    });
  }

  // 3. Flip status in bulk.
  const ids = candidates.map((o) => o.id);
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (updateError) {
    console.error('[auto-abandon] update failed:', updateError);
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    );
  }

  // 4. Audit trail. One row per order so the order detail timeline shows the
  //    transition next to whatever the human admin will do later.
  const historyRows = candidates.map((o) => ({
    order_id: o.id,
    event_type: 'abandoned' as const,
    changed_by: 'system-cron',
    new_value: { status: 'abandoned' },
    notes: `Auto-abandonat: nicio plată confirmată în ${ABANDON_AFTER_MINUTES} min`,
  }));
  const { error: historyError } = await supabase
    .from('order_history')
    .insert(historyRows);
  if (historyError) {
    // Don't fail the cron — the status update is the important bit.
    console.warn('[auto-abandon] history insert failed:', historyError.message);
  }

  return NextResponse.json({
    success: true,
    data: {
      abandonedCount: ids.length,
      processedAt: new Date().toISOString(),
      ids,
    },
  });
}

// In production, GET runs the real job: Vercel Cron invokes cron paths with
// GET (same auth header), so a blocked GET means the schedule never fires.
// In dev, GET stays a dry-run — same auth, returns the candidate list
// WITHOUT performing the update.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return POST(request);
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ''}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  const cutoffIso = new Date(
    Date.now() - ABANDON_AFTER_MINUTES * 60 * 1000
  ).toISOString();
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at')
    .eq('status', 'pending')
    .lt('created_at', cutoffIso);
  return NextResponse.json({
    success: true,
    data: { thresholdMinutes: ABANDON_AFTER_MINUTES, cutoff: cutoffIso, candidates: data },
  });
}
