/**
 * POST /api/cron/payout-sync — daily Stripe payout reconciliation sync.
 *
 * Re-syncs the last 30 days of payouts (in_transit → paid transitions and
 * late Oblio invoice links get refreshed). Feeds /admin/decontari.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`.
 * Scheduled daily via vercel.json.
 */
import { NextRequest, NextResponse } from 'next/server';
import { syncPayouts } from '@/lib/accounting/payout-sync';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await syncPayouts({ sinceDays: 30 });
    console.log('[cron/payout-sync]', result);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('[cron/payout-sync] failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

// Vercel Cron invokes cron paths with GET (same auth header) — a
// production-blocked GET means the schedule NEVER runs (see
// invoice-health-check incident, fixed 2026-07-12).
export async function GET(request: NextRequest) {
  return POST(request);
}
