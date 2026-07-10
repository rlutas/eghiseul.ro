import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission, getCollaboratorServices } from '@/lib/admin/permissions';

/**
 * Orders handled by a collaborator (across all their assigned services), with a
 * monthly summary (count, revenue, fees). Supports ?format=tsv for CSV/TSV
 * download. Admin-only (orders.view).
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
      return NextResponse.json({ success: true, data: { orders: [], summary: { count: 0, revenue: 0, fees: 0 } } });
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (data || []).map((o: any) => {
      const c = o.customer_data?.contact || {};
      const fee = Number(o.services?.lawyer_fee_ron) || 0;
      return {
        id: o.id,
        friendlyOrderId: o.friendly_order_id || o.id.slice(0, 8),
        service: o.services?.name || '—',
        client: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || '—',
        email: c.email || '',
        status: o.status,
        total: Number(o.total_price) || 0,
        fee,
        isTest: !!o.is_test,
        createdAt: o.created_at,
        paidAt: o.paid_at,
      };
    });

    // Test orders stay visible in the list (flagged) but owe no fee.
    const billable = orders.filter((o: { isTest: boolean }) => !o.isTest);
    const summary = {
      count: billable.length,
      revenue: Math.round(billable.reduce((s: number, o: { total: number }) => s + o.total, 0) * 100) / 100,
      fees: Math.round(billable.reduce((s: number, o: { fee: number }) => s + o.fee, 0) * 100) / 100,
    };

    if (format === 'tsv') {
      const COLUMNS = ['Comandă', 'Serviciu', 'Client', 'Email', 'Status', 'Preț (RON)', 'Onorariu (RON)', 'Test', 'Dată'];
      const lines = [COLUMNS.join('\t')];
      for (const o of orders) {
        lines.push([
          tsvCell(o.friendlyOrderId), tsvCell(o.service), tsvCell(o.client), tsvCell(o.email),
          tsvCell(o.status), tsvCell(o.total.toFixed(2)), tsvCell(o.fee.toFixed(2)),
          o.isTest ? 'da' : 'nu', tsvCell(new Date(o.paidAt || o.createdAt).toLocaleDateString('ro-RO')),
        ].join('\t'));
      }
      lines.push('');
      lines.push(['TOTAL', '', '', '', String(summary.count), summary.revenue.toFixed(2), summary.fees.toFixed(2), '', ''].join('\t'));
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
