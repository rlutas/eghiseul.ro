/**
 * GET /api/admin/decontari/[payoutId] — payout detail + all its transactions.
 * Auth: payments.verify.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'payments.verify');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const { payoutId } = await params;
    if (!/^po_[A-Za-z0-9]+$/.test(payoutId)) {
      return NextResponse.json({ success: false, error: 'Invalid payout id' }, { status: 400 });
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: payout, error: pErr } = await (admin as any)
      .from('stripe_payouts')
      .select('*')
      .eq('id', payoutId)
      .single();
    if (pErr || !payout) {
      return NextResponse.json({ success: false, error: 'Payout not found' }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transactions, error: tErr } = await (admin as any)
      .from('stripe_payout_transactions')
      .select('*')
      .eq('payout_id', payoutId)
      .order('type', { ascending: true })
      .order('available_on', { ascending: true });
    if (tErr) throw new Error(tErr.message);

    return NextResponse.json({ success: true, data: { payout, transactions: transactions ?? [] } });
  } catch (err) {
    console.error('[admin/decontari] detail failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
