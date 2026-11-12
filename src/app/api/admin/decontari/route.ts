/**
 * GET /api/admin/decontari — list Stripe payouts (Decontări).
 *
 * Query: ?month=YYYY-MM (optional filter on arrival_date).
 * Auth: payments.verify (contabil, manager, super_admin).
 */
import { loadPayoutsByAccountingDate } from '@/lib/accounting/payout-month';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export async function GET(request: NextRequest) {
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

    const admin = createAdminClient();
    const month = new URL(request.url).searchParams.get('month'); // YYYY-MM
    // The month is the BANK month (statement date), not Stripe's estimate —
    // see src/lib/accounting/payout-month.ts.
    const data = await loadPayoutsByAccountingDate(admin, { month, limit: 200 });

    return NextResponse.json({ success: true, data: { payouts: data ?? [] } });
  } catch (err) {
    console.error('[admin/decontari] list failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
