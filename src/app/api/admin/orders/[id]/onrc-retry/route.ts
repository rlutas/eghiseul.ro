/**
 * POST /api/admin/orders/[id]/onrc-retry
 *
 * Operator "Reîncearcă" for a FAILED / NEEDS_OPERATOR ONRC job: resets it to
 * PENDING (retry_count 0) so the worker picks it up again on the next tick.
 * Needed because the worker's own auto-retry stops after 4 attempts — after
 * the team fixes the cause (e.g. the ONRC account password, 14.09.2026) the
 * job would otherwise stay FAILED forever.
 *
 * SAFE: only resets jobs that never created an ONRC draft (onrc_draft_id IS
 * NULL). A job with a draft may already be PAID at ONRC and must NOT be
 * re-submitted (anti-double-pay) — use manual upload instead.
 *
 * Permission: orders.manage
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { logOnrcEvent } from '@/lib/onrc/log-event';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const now = new Date().toISOString();
    const { data, error } = await admin
      .from('onrc_jobs')
      .update({
        status: 'PENDING',
        retry_count: 0,
        error_message: null,
        locked_at: null,
        last_attempt_at: null,
        updated_at: now,
      })
      .eq('order_id', orderId)
      .in('status', ['FAILED', 'NEEDS_OPERATOR'])
      .is('onrc_draft_id', null)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Job inexistent, nu e eșuat, sau are deja cerere creată la ONRC (posibil plătită) — nu se re-depune; folosește „Încarcă PDF manual".',
        },
        { status: 409 }
      );
    }
    await logOnrcEvent(admin, data.id, 'retry', `Reîncercare manuală din admin (${user.email ?? 'admin'}).`, orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[onrc] manual retry error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la reîncercare' }, { status: 500 });
  }
}
