/**
 * POST /api/admin/decontari/sync — manual "Sincronizează cu Stripe" button.
 *
 * Body (optional): { sinceDays?: number } — default 30; use e.g. 60 for a
 * deeper backfill. Auth: payments.verify.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { syncPayouts } from '@/lib/accounting/payout-sync';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
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

    let sinceDays = 30;
    try {
      const body = await request.json();
      if (typeof body?.sinceDays === 'number' && body.sinceDays > 0 && body.sinceDays <= 400) {
        sinceDays = body.sinceDays;
      }
    } catch {
      /* empty body is fine */
    }

    const result = await syncPayouts({ sinceDays });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[admin/decontari] sync failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
