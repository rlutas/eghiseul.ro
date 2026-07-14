/**
 * GET /api/admin/decontari — list Stripe payouts (Decontări).
 *
 * Query: ?month=YYYY-MM (optional filter on arrival_date).
 * Auth: payments.verify (contabil, manager, super_admin).
 */
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from('stripe_payouts')
      .select('*')
      .order('arrival_date', { ascending: false })
      .limit(200);
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const start = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)).toISOString().slice(0, 10);
      query = query.gte('arrival_date', start).lt('arrival_date', end);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data: { payouts: data ?? [] } });
  } catch (err) {
    console.error('[admin/decontari] list failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
