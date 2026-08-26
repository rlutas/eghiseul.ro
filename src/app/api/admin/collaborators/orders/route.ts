import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission, getCollaboratorServices } from '@/lib/admin/permissions';
import { formatPersonName } from '@/lib/format/person-name';
import { computeSettlementBreakdown, sumAncpiCosts } from '@/lib/collaborator/settlement';

/**
 * Orders handled by a collaborator (across all their assigned services), with a
 * monthly summary. Supports ?format=tsv for CSV/TSV download. Admin-only
 * (orders.view).
 *
 * For service collaborators (topograf) the summary carries the 50/50 profit
 * `breakdown` from `@/lib/collaborator/settlement` — the SAME single source of
 * truth as the collaborator's own /colaborator/decont page, so the two views
 * can never disagree. The per-order `fee` (lawyer_fee_ron) stays in the
 * response for the __avocat__ path, where 15 RON/order IS the deal.
 *
 * Query: collaboratorId (required), month=YYYY-MM (optional), format=tsv (optional).
 */
function tsvCell(v: unknown): string {
  return String(v ?? '').replace(/[\t\r\n]+/g, ' ').trim();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaboratorId') || '';
    const month = searchParams.get('month') || ''; // YYYY-MM
    const format = searchParams.get('format') || '';
    if (!collaboratorId) {
      return NextResponse.json({ success: false, error: 'collaboratorId lipsă' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminEarly = createAdminClient() as any;
    let serviceIds: string[];
    if (collaboratorId === '__avocat__') {
      // Avocat: services with a lawyer fee, excluding cadastral (those are topograf).
      const { data: ls } = await adminEarly
        .from('services').select('id').gt('lawyer_fee_ron', 0).neq('category', 'imobiliare');
      serviceIds = (ls || []).map((s: { id: string }) => s.id);
    } else {
      serviceIds = await getCollaboratorServices(collaboratorId);
    }
    if (serviceIds.length === 0) {
      return NextResponse.json({ success: true, data: { orders: [], summary: { count: 0, revenue: 0, fees: 0, breakdown: null } } });
    }

    // Settlement rule (agreed 2026-07-10): a fee is owed per PAID order,
    // assigned to the month of paid_at, excluding cancelled/refunded orders.
    // (Previously counted ALL non-draft orders by created_at, which inflated
    // the totals with unpaid/abandoned/cancelled orders.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    let query = admin
      .from('orders')
      .select('id, friendly_order_id, status, total_price, customer_data, created_at, paid_at, is_test, services:service_id(name, slug, lawyer_fee_ron)')
      .in('service_id', serviceIds)
      .eq('payment_status', 'paid')
      .neq('status', 'cancelled')
      .is('refunded_at', null)
      .order('paid_at', { ascending: false });

    if (/^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
      const end = new Date(Date.UTC(y, m, 1)).toISOString();
      query = query.gte('paid_at', start).lt('paid_at', end);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[admin] collaborator orders error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea comenzilor' }, { status: 500 });
    }

    // Taxele OCPI plătite pe comenzile perioadei — partea de cost a modelului
    // 50/50 (doar la colaboratorii pe servicii; avocatul n-are taxe ANCPI).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderIds = (data || []).map((o: any) => o.id);
    const costsByOrder = new Map<string, number>();
    for (let i = 0; i < orderIds.length; i += 200) {
      const { data: costRows } = await admin
        .from('order_supplier_costs')
        .select('order_id, supplier, category, amount_ron')
        .in('order_id', orderIds.slice(i, i + 200));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const row of (costRows ?? []) as any[]) {
        const amount = sumAncpiCosts([row]);
        if (amount > 0) {
          costsByOrder.set(row.order_id, (costsByOrder.get(row.order_id) ?? 0) + amount);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (data || []).map((o: any) => {
      const c = o.customer_data?.contact || {};
      const fee = Number(o.services?.lawyer_fee_ron) || 0;
      return {
        id: o.id,
        friendlyOrderId: o.friendly_order_id || o.id.slice(0, 8),
        service: o.services?.name || '—',
        client: formatPersonName(c.lastName, c.firstName) || c.email || '—',
        email: c.email || '',
        status: o.status,
        total: Number(o.total_price) || 0,
        fee,
        ocpiCost: Math.round((costsByOrder.get(o.id) ?? 0) * 100) / 100,
        isTest: !!o.is_test,
        createdAt: o.created_at,
        paidAt: o.paid_at,
      };
    });

    // Test orders stay visible in the list (flagged) but owe no fee.
    const billable = orders.filter((o: { isTest: boolean }) => !o.isTest);
    const revenue = billable.reduce((s: number, o: { total: number }) => s + o.total, 0);
    const ocpiTotal = billable.reduce((s: number, o: { ocpiCost: number }) => s + o.ocpiCost, 0);
    const summary = {
      count: billable.length,
      revenue: Math.round(revenue * 100) / 100,
      fees: Math.round(billable.reduce((s: number, o: { fee: number }) => s + o.fee, 0) * 100) / 100,
      // The 50/50 profit model — irrelevant for __avocat__ (fee-based deal).
      breakdown: collaboratorId === '__avocat__' ? null : computeSettlementBreakdown(revenue, ocpiTotal),
    };

    if (format === 'tsv') {
      const COLUMNS = ['Comandă', 'Serviciu', 'Client', 'Email', 'Status', 'Preț (RON)', 'Taxă OCPI (RON)', 'Onorariu (RON)', 'Test', 'Dată'];
      const lines = [COLUMNS.join('\t')];
      for (const o of orders) {
        lines.push([
          tsvCell(o.friendlyOrderId), tsvCell(o.service), tsvCell(o.client), tsvCell(o.email),
          tsvCell(o.status), tsvCell(o.total.toFixed(2)), tsvCell(o.ocpiCost.toFixed(2)), tsvCell(o.fee.toFixed(2)),
          o.isTest ? 'da' : 'nu', tsvCell(new Date(o.paidAt || o.createdAt).toLocaleDateString('ro-RO')),
        ].join('\t'));
      }
      lines.push('');
      lines.push(['TOTAL', '', '', '', String(summary.count), summary.revenue.toFixed(2), summary.breakdown ? summary.breakdown.ocpiCosts.toFixed(2) : '', summary.fees.toFixed(2), '', ''].join('\t'));
      if (summary.breakdown) {
        const b = summary.breakdown;
        lines.push('');
        lines.push(['Împărțeala 50/50:', '', '', '', '', '', '', '', '', ''].join('\t'));
        lines.push(['Net fără TVA', b.netOfVat.toFixed(2)].join('\t'));
        lines.push(['Taxe OCPI', b.ocpiCosts.toFixed(2)].join('\t'));
        lines.push(['Profit brut', b.grossProfit.toFixed(2)].join('\t'));
        lines.push(['Impozit profit 16%', b.profitTax.toFixed(2)].join('\t'));
        lines.push(['Impozit dividende 16%', b.dividendTax.toFixed(2)].join('\t'));
        lines.push(['Net de distribuit', b.distributable.toFixed(2)].join('\t'));
        lines.push(['Partea fiecăruia (50%)', b.sharePerSide.toFixed(2)].join('\t'));
      }
      const fname = `colaborator-${collaboratorId.slice(0, 8)}${month ? '-' + month : ''}.tsv`;
      return new Response('﻿' + lines.join('\n'), {
        headers: {
          'Content-Type': 'text/tab-separated-values; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fname}"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: { orders, summary } });
  } catch (error) {
    console.error('[admin] collaborator orders error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
