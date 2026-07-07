import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { enterStandby, exitStandby } from '@/lib/orders/standby';

/**
 * PATCH /api/admin/orders/[id]/status
 *
 * Free-form status override — the escape hatch alongside the rigid
 * /process state machine. Use when:
 *   - You need to move backwards or sideways (e.g., back to processing
 *     after a mistaken "completed")
 *   - You need to set 'standby' to pause SLA
 *   - You need to set 'cancellation_requested' / 'refunded' / 'cancelled'
 *     outside the customer self-cancel flow
 *
 * Always requires a note (we're bypassing the state machine — the audit
 * log must capture WHY).
 *
 * Side effects:
 *   - Enter standby: stamps standby_started_at
 *   - Exit standby (any other status): accumulates standby_total_seconds,
 *     shifts estimated_completion_date forward by paused business days
 */

// Statuses an admin may set via this route. Keep in sync with migration 043
// orders_status_check.
const VALID_STATUSES = new Set([
  'draft',
  'pending',
  'abandoned',
  'paid',
  'processing',
  'documents_generated',
  'submitted_to_institution',
  'document_received',
  'extras_in_progress',
  'la_tradus',
  'la_legalizat',
  'la_apostila_notari',
  'eliberat_apostila_haga',
  'kyc_pending',
  'kyc_approved',
  'kyc_rejected',
  'in_progress',
  'document_ready',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'cancellation_requested',
  'refunded',
  'standby',
]);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const { id: orderId } = await context.params;
    const body = (await request.json()) as { status?: string; note?: string };
    const newStatus = body.status?.trim();
    const note = body.note?.trim() || '';

    if (!newStatus || !VALID_STATUSES.has(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'Status invalid' },
        { status: 400 }
      );
    }

    // Note is optional — when set we record it on the audit row. Empty
    // note is fine for routine transitions; the admin email + timestamp
    // already provide the basic audit signal.

    const adminClient = createAdminClient();

    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select('id, status, standby_started_at, standby_total_seconds, estimated_completion_date' as any)
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Comanda nu a fost găsită' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderData = order as any;
    const prevStatus = orderData.status;
    if (prevStatus === newStatus) {
      return NextResponse.json(
        { success: false, error: 'Comanda este deja în acest status.' },
        { status: 400 }
      );
    }

    // Build the column patch. Standby transitions touch extra columns.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { status: newStatus };
    let auditEventType: string = 'status_changed';
    let standbyInfo: { pausedSeconds: number; pausedBusinessDays: number } | null = null;

    if (newStatus === 'standby' && prevStatus !== 'standby') {
      const r = enterStandby();
      updates.standby_started_at = r.standby_started_at;
      auditEventType = 'standby_started';
    } else if (prevStatus === 'standby' && newStatus !== 'standby') {
      const o = orderData;
      if (o.standby_started_at) {
        const result = exitStandby({
          standby_started_at: o.standby_started_at,
          standby_total_seconds: o.standby_total_seconds || 0,
          estimated_completion_date: o.estimated_completion_date || null,
        });
        updates.standby_started_at = null;
        updates.standby_total_seconds = result.standby_total_seconds;
        if (result.estimated_completion_date !== o.estimated_completion_date) {
          updates.estimated_completion_date = result.estimated_completion_date;
        }
        standbyInfo = {
          pausedSeconds: result.pausedSeconds,
          pausedBusinessDays: result.pausedBusinessDays,
        };
      }
      auditEventType = 'standby_ended';
    } else if (newStatus === 'cancellation_requested') {
      auditEventType = 'cancellation_requested';
    } else if (newStatus === 'cancelled') {
      auditEventType = 'cancelled';
    } else if (newStatus === 'refunded') {
      auditEventType = 'refunded';
    }

    if (newStatus === 'shipped' && prevStatus !== 'shipped') {
      updates.shipped_at = new Date().toISOString();
    }

    const { error: updateError } = await adminClient
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (updateError) {
      console.error('[admin/orders/status] update failed:', updateError);
      return NextResponse.json(
        { success: false, error: 'Eroare la actualizare.' },
        { status: 500 }
      );
    }

    // Append audit row. We carry the admin email/id so the timeline shows
    // who flipped what.
    const { data: profile } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    const auditNote = standbyInfo
      ? `${note}${note ? '\n' : ''}[standby: ${standbyInfo.pausedSeconds}s, +${standbyInfo.pausedBusinessDays} zile lucrătoare]`
      : note || null;

    await adminClient.from('order_history').insert({
      order_id: orderId,
      event_type: auditEventType,
      // order_history has old_value/new_value jsonb (NOT from_status/to_status
      // columns — inserting those silently failed and status changes never
      // logged). The GET route derives from_status/to_status from these.
      old_value: { status: prevStatus },
      new_value: { status: newStatus },
      changed_by: profile?.email || user.id,
      notes: auditNote,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return NextResponse.json({
      success: true,
      status: newStatus,
      ...(standbyInfo ? { standby: standbyInfo } : {}),
    });
  } catch (err) {
    console.error('[admin/orders/status] failed:', err);
    return NextResponse.json(
      { success: false, error: 'Eroare internă.' },
      { status: 500 }
    );
  }
}
