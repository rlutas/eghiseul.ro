import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * Operator "Reîncearcă" for a FAILED / NEEDS_OPERATOR ANCPI job: resets it to
 * PENDING so the worker picks it up again. SAFE: only resets jobs that never
 * placed an ePay order (ancpi_order_id IS NULL) — a job that already placed an
 * order must NOT be re-submitted (anti-double-pay); use retrieve/manual instead.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
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

    // Atomic, safe reset — only when no ePay order was placed.
    const { data, error } = await admin
      .from('ancpi_jobs')
      .update({
        status: 'PENDING',
        retry_count: 0,
        error_message: null,
        locked_at: null,
        last_attempt_at: null,
        updated_at: now,
      })
      .eq('order_id', orderId)
      .is('ancpi_order_id', null)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Job inexistent sau deja are comandă ePay plasată (nu se poate re-depune — folosește upload manual).' },
        { status: 409 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await admin.from('ancpi_job_events').insert({ job_id: data.id, order_id: orderId, type: 'retry', message: 'Reîncercare manuală din admin.' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ancpi] manual retry error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la reîncercare' }, { status: 500 });
  }
}
