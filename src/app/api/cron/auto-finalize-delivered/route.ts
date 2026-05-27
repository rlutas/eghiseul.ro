/**
 * POST /api/cron/auto-finalize-delivered
 *
 * Auto-transitions `status='shipped'` orders to `status='completed'` once they
 * have been in transit longer than a per-courier threshold (see
 * `src/lib/courier/auto-finalize.ts`). The threshold is generous — it's a
 * safety net for cases where the courier's tracking API never reports
 * "delivered" and the order would otherwise sit forever in "shipped".
 *
 * Also flags "blocked in transit" cases (2× threshold passed) so we can
 * monitor stuck shipments without auto-completing them again.
 *
 * Authentication: `CRON_SECRET` in `Authorization: Bearer ...` header.
 * Schedule: once daily via vercel.json (low-frequency — thresholds are days,
 * not minutes).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  decideAutoFinalize,
  type AutoFinalizeCandidate,
} from '@/lib/courier/auto-finalize';

export async function POST(request: NextRequest) {
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
  const now = new Date();

  const { data: rows, error: fetchError } = await supabase
    .from('orders')
    .select('id, friendly_order_id, courier_provider, shipped_at, status')
    .eq('status', 'shipped')
    .not('shipped_at', 'is', null)
    .limit(500);

  if (fetchError) {
    console.error('[auto-finalize] fetch failed:', fetchError);
    return NextResponse.json(
      { success: false, error: fetchError.message },
      { status: 500 }
    );
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: { finalizedCount: 0, blockedCount: 0, processedAt: now.toISOString() },
    });
  }

  const toFinalize: Array<{ candidate: AutoFinalizeCandidate; days: number; threshold: number }> = [];
  const blocked: Array<{ candidate: AutoFinalizeCandidate; days: number; threshold: number }> = [];

  for (const r of rows) {
    const candidate: AutoFinalizeCandidate = {
      id: r.id,
      friendly_order_id: r.friendly_order_id,
      courier_provider: r.courier_provider,
      shipped_at: r.shipped_at,
    };
    const decision = decideAutoFinalize(candidate, now);
    if (decision.isBlocked) {
      blocked.push({ candidate, days: decision.daysSinceShipped, threshold: decision.thresholdDays });
    }
    if (decision.shouldFinalize) {
      toFinalize.push({ candidate, days: decision.daysSinceShipped, threshold: decision.thresholdDays });
    }
  }

  if (blocked.length > 0) {
    console.warn(
      `[auto-finalize] ${blocked.length} order(s) blocked in transit:`,
      blocked.map((b) => `${b.candidate.friendly_order_id ?? b.candidate.id} (${b.days}d / threshold ${b.threshold}d)`).join(', ')
    );
  }

  if (toFinalize.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        finalizedCount: 0,
        blockedCount: blocked.length,
        processedAt: now.toISOString(),
        blocked: blocked.map((b) => ({
          id: b.candidate.id,
          friendlyOrderId: b.candidate.friendly_order_id,
          days: b.days,
          threshold: b.threshold,
        })),
      },
    });
  }

  const ids = toFinalize.map((f) => f.candidate.id);
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'completed',
      updated_at: now.toISOString(),
    })
    .in('id', ids);

  if (updateError) {
    console.error('[auto-finalize] update failed:', updateError);
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    );
  }

  const historyRows = toFinalize.map((f) => ({
    order_id: f.candidate.id,
    event_type: 'status_change' as const,
    changed_by: 'system-cron',
    new_value: { status: 'completed', previous_status: 'shipped', reason: 'auto_finalize' },
    notes: `Auto-finalizat: ${f.days} zile de la expediere (prag ${f.threshold}z pentru ${f.candidate.courier_provider ?? 'curier necunoscut'})`,
  }));
  const { error: historyError } = await supabase
    .from('order_history')
    .insert(historyRows);
  if (historyError) {
    console.warn('[auto-finalize] history insert failed:', historyError.message);
  }

  return NextResponse.json({
    success: true,
    data: {
      finalizedCount: ids.length,
      blockedCount: blocked.length,
      processedAt: now.toISOString(),
      finalized: toFinalize.map((f) => ({
        id: f.candidate.id,
        friendlyOrderId: f.candidate.friendly_order_id,
        days: f.days,
        threshold: f.threshold,
      })),
      blocked: blocked.map((b) => ({
        id: b.candidate.id,
        friendlyOrderId: b.candidate.friendly_order_id,
        days: b.days,
        threshold: b.threshold,
      })),
    },
  });
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'GET disabled in production' },
      { status: 405 }
    );
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ''}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('id, friendly_order_id, courier_provider, shipped_at, status')
    .eq('status', 'shipped')
    .not('shipped_at', 'is', null);

  const now = new Date();
  const decisions = (data ?? []).map((r) => {
    const d = decideAutoFinalize(
      {
        id: r.id,
        friendly_order_id: r.friendly_order_id,
        courier_provider: r.courier_provider,
        shipped_at: r.shipped_at,
      },
      now
    );
    return {
      id: r.id,
      friendlyOrderId: r.friendly_order_id,
      courier: r.courier_provider,
      shippedAt: r.shipped_at,
      ...d,
    };
  });

  return NextResponse.json({ success: true, data: { now: now.toISOString(), decisions } });
}
