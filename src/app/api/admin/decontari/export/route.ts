/**
 * GET /api/admin/decontari/export?month=YYYY-MM[&payout=po_...] — CSV export
 * for accounting: every payout transaction with order, platform, client,
 * Oblio invoice, gross/fee/net. UTF-8 BOM so Excel opens diacritics
 * correctly (same pattern as number-registry export).
 * Auth: payments.verify.
 */
import { loadPayoutsByAccountingDate } from '@/lib/accounting/payout-month';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const HEADERS = [
  'Data payout',
  'Payout ID',
  'Status payout',
  'Tip',
  'Comandă',
  'Platformă',
  'Client',
  'Email',
  'Serviciu',
  'Factură Oblio',
  'Brut (RON)',
  'Fee Stripe (RON)',
  'Net (RON)',
  'Descriere',
];

function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const ron = (bani: number | null) => ((bani ?? 0) / 100).toFixed(2);

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
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const payoutId = url.searchParams.get('payout');

    if (!payoutId && !(month && /^\d{4}-\d{2}$/.test(month))) {
      return NextResponse.json({ success: false, error: 'month=YYYY-MM sau payout=po_... obligatoriu' }, { status: 400 });
    }
    // Month = the bank month (statement date), oldest first for the accountant.
    const payouts = (await loadPayoutsByAccountingDate(admin, { month, payoutId })).reverse();

    const ids = (payouts ?? []).map((p: { id: string }) => p.id);
    const byId = new Map((payouts ?? []).map((p: { id: string }) => [p.id, p]));
    let rows: Record<string, unknown>[] = [];
    if (ids.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (admin as any)
        .from('stripe_payout_transactions')
        .select('*')
        .in('payout_id', ids)
        .order('payout_id')
        .order('type');
      if (error) throw new Error(error.message);
      rows = data ?? [];
    }

    const lines = [HEADERS.join(',')];
    for (const r of rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = byId.get(r.payout_id as string) as any;
      lines.push(
        [
          esc(p?.accounting_date ?? p?.arrival_date),
          esc(r.payout_id),
          esc(p?.status),
          esc(['charge', 'payment'].includes(r.type as string) ? 'Încasare' : ['refund', 'payment_refund'].includes(r.type as string) ? 'Rambursare' : r.type),
          esc(r.order_number),
          esc(r.platform === 'cjo' ? 'cazierjudiciaronline.com' : r.platform === 'eghiseul' ? 'eghiseul.ro' : 'necunoscut'),
          esc(r.client_name),
          esc(r.client_email),
          esc(r.service_name),
          esc(r.invoice_number),
          ron(r.gross_bani as number),
          ron(-(r.fee_bani as number)),
          ron(r.net_bani as number),
          esc(r.description),
        ].join(',')
      );
    }
    // Totals row
    const totGross = rows.reduce((a, r) => a + ((r.gross_bani as number) ?? 0), 0);
    const totFee = rows.reduce((a, r) => a + ((r.fee_bani as number) ?? 0), 0);
    const totNet = rows.reduce((a, r) => a + ((r.net_bani as number) ?? 0), 0);
    lines.push(['TOTAL', '', '', '', '', '', '', '', '', '', ron(totGross), ron(-totFee), ron(totNet), ''].join(','));

    const filename = payoutId ? `decontare-${payoutId}.csv` : `decontari-${month}.csv`;
    return new NextResponse('﻿' + lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('[admin/decontari] export failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
