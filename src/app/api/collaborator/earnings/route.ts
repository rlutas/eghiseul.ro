import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCollaboratorServices } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import {
  computeSettlementBreakdown,
  sumAncpiCosts,
  SETTLEMENT_PERIOD_START,
  LAST_SETTLEMENT,
} from '@/lib/collaborator/settlement';

/**
 * Settlement view for the authenticated collaborator (topograph).
 *
 * The money model is the 50/50 PROFIT SPLIT from
 * `@/lib/collaborator/settlement` (single source of truth — same math as the
 * signed 26.08 settlement): collected revenue net of VAT, minus OCPI fees,
 * minus company taxes, halved. NOT a per-order fee.
 *
 * Same scope rule as the orders list: payment_status=paid, not cancelled, not
 * refunded; test orders visible but not counted. NO client personal data.
 *
 * Query: month=YYYY-MM (default current month) or month=all (whole
 * collaboration, from SETTLEMENT_PERIOD_START).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    let collaboratorId: string;
    try {
      ({ collaboratorId } = await resolveCollaboratorContext(user.id, searchParams.get('as')));
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const serviceIds = await getCollaboratorServices(collaboratorId);

    const now = new Date();
    const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const monthParam = searchParams.get('month') || '';
    const month = monthParam === 'all'
      ? 'all'
      : /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : defaultMonth;

    let start = SETTLEMENT_PERIOD_START;
    let end: string | null = null;
    if (month !== 'all') {
      const [y, m] = month.split('-').map(Number);
      start = new Date(Date.UTC(y!, m! - 1, 1)).toISOString();
      end = new Date(Date.UTC(y!, m!, 1)).toISOString();
    }

    // Same scope as the orders list: own services OR orders assigned directly.
    const scopeFilter = serviceIds.length > 0
      ? `service_id.in.(${serviceIds.join(',')}),assigned_collaborator_id.eq.${collaboratorId}`
      : `assigned_collaborator_id.eq.${collaboratorId}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    let query = admin
      .from('orders')
      .select('id, friendly_order_id, status, paid_at, is_test, total_price, customer_data, services:service_id(name)')
      .or(scopeFilter)
      .eq('payment_status', 'paid')
      .neq('status', 'cancelled')
      .is('refunded_at', null)
      .gte('paid_at', start)
      .order('paid_at', { ascending: false });
    if (end) query = query.lt('paid_at', end);

    const { data, error } = await query;
    if (error) {
      console.error('[collaborator] earnings error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea decontului' }, { status: 500 });
    }

    // Taxele OCPI plătite pe comenzile din perioadă — partea de cost a
    // profitului. Chunked: .in() cu mii de id-uri ar depăși limita de URL.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderIds = (data ?? []).map((o: any) => o.id);
    const costsByOrder = new Map<string, number>();
    for (let i = 0; i < orderIds.length; i += 200) {
      const chunk = orderIds.slice(i, i + 200);
      const { data: costRows, error: costErr } = await admin
        .from('order_supplier_costs')
        .select('order_id, supplier, category, amount_ron')
        .in('order_id', chunk);
      if (costErr) {
        console.error('[collaborator] earnings costs error:', costErr.message);
        return NextResponse.json({ success: false, error: 'Eroare la încărcarea decontului' }, { status: 500 });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const row of (costRows ?? []) as any[]) {
        const amount = sumAncpiCosts([row]);
        if (amount > 0) {
          costsByOrder.set(row.order_id, (costsByOrder.get(row.order_id) ?? 0) + amount);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (data ?? []).map((o: any) => {
      const p = o.customer_data?.property ?? {};
      return {
        id: o.id,
        friendlyOrderId: o.friendly_order_id || o.id.slice(0, 8),
        service: o.services?.name || '—',
        locality: [p.locality, p.county].filter(Boolean).join(', ') || '—',
        status: o.status,
        paidAt: o.paid_at,
        // Prețul plătit de client (TVA inclus) — baza veniturilor.
        clientTotal: Number(o.total_price) || 0,
        // Taxa OCPI plătită pe comanda asta (0 = încă neînregistrată).
        ocpiCost: Math.round((costsByOrder.get(o.id) ?? 0) * 100) / 100,
        isTest: !!o.is_test,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const billable = orders.filter((o: any) => !o.isTest);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collected = billable.reduce((s: number, o: any) => s + o.clientTotal, 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ocpiTotal = billable.reduce((s: number, o: any) => s + o.ocpiCost, 0);

    const breakdown = computeSettlementBreakdown(collected, ocpiTotal);

    return NextResponse.json({
      success: true,
      data: {
        month,
        orders,
        summary: {
          count: billable.length,
          totalCollected: breakdown.collectedWithVat,
        },
        breakdown,
        lastSettlement: LAST_SETTLEMENT,
      },
    });
  } catch (error) {
    console.error('[collaborator] earnings error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
