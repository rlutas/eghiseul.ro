/**
 * GET /api/admin/decontari/banca?month=YYYY-MM — extras bancă importat:
 * mișcări categorisite + sumar per categorie. Auth: payments.verify.
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
    const month = new URL(request.url).searchParams.get('month');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from('bank_statement_entries')
      .select('*')
      .order('tx_date', { ascending: false })
      .limit(1000);
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const start = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)).toISOString().slice(0, 10);
      query = query.gte('tx_date', start).lt('tx_date', end);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Comenzile legate de liniile de încasare — numărul, starea plății și
    // factura, ca operatorul să vadă din extras dacă mai are ceva de făcut
    // (10.09.2026). Fără ele, coloana „Comandă" ar fi doar un UUID.
    const entries = (data ?? []) as Array<Record<string, unknown> & { matched_order_id?: string | null }>;
    const orderIds = [...new Set(entries.map((e) => e.matched_order_id).filter(Boolean))] as string[];
    if (orderIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: orders } = await (admin as any)
        .from('orders')
        .select('id, friendly_order_id, order_number, payment_status, invoice_number, invoice_url')
        .in('id', orderIds);
      const byId = new Map<string, unknown>((orders ?? []).map((o: { id: string }) => [o.id, o]));
      for (const e of entries) {
        if (e.matched_order_id) e.matched_order = byId.get(e.matched_order_id) ?? null;
      }
    }

    return NextResponse.json({ success: true, data: { entries } });
  } catch (err) {
    console.error('[admin/decontari] banca list failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
