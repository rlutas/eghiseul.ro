/**
 * POST /api/admin/orders/[id]/emit-invoice
 *
 * Self-serve retry for a paid order that never got its Oblio invoice
 * (webhook failure, expired Oblio token, PostgREST schema-cache flap — see
 * `lib/oblio/ensure-invoice.ts`). Thin wrapper around the exact same
 * chokepoint the webhook, confirm-payment fallback and the hourly
 * invoice-health-check cron use: atomic claim, dedup-safe, fail-soft SPV
 * check. Distinct from `reissue-invoice`, which storno's an EXISTING
 * invoice — this is for the "no invoice at all yet" case.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { ensureInvoiceForPaidOrder } from '@/lib/oblio';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  const admin = createAdminClient();
  const { data: order, error: fetchErr } = await admin
    .from('orders')
    .select('id, payment_status, invoice_number, payment_method')
    .eq('id', id)
    .single();
  if (fetchErr || !order) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Comanda nu a fost găsită' } },
      { status: 404 }
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = order as any;
  if (o.invoice_number) {
    return NextResponse.json({
      success: true,
      data: { invoiceNumber: o.invoice_number, already: true },
    });
  }
  if (o.payment_status !== 'paid') {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_PAID', message: 'Comanda nu e plătită' } },
      { status: 409 }
    );
  }

  // Oblio "collect" type must match how the order was actually paid —
  // bank-transfer / cash orders (confirmed manually via fulfil-paid) store
  // 'transfer' | 'bank_transfer' | 'cash'; everything else is a Stripe card.
  const pm = String(o.payment_method ?? '').toLowerCase();
  const collect: 'Card' | 'Transfer bancar' | 'Cash' =
    pm === 'cash' ? 'Cash' : pm === 'transfer' || pm === 'bank_transfer' ? 'Transfer bancar' : 'Card';

  const adminEmail = user.email ?? 'admin';
  const res = await ensureInvoiceForPaidOrder(id, collect, {
    historyNote: `Factură emisă manual de ${adminEmail} (retry din admin — comandă rămasă nefacturată).`,
  });

  if (res.status === 'created') {
    return NextResponse.json({
      success: true,
      data: { invoiceNumber: res.invoiceNumber, invoiceUrl: res.invoiceUrl },
    });
  }
  if (res.status === 'already_exists') {
    return NextResponse.json({ success: true, data: { invoiceNumber: res.invoiceNumber, already: true } });
  }
  if (res.status === 'locked') {
    return NextResponse.json(
      { success: false, error: { code: 'LOCKED', message: 'Emitere deja în curs — reîncearcă în câteva secunde.' } },
      { status: 409 }
    );
  }
  if (res.status === 'disabled') {
    return NextResponse.json(
      { success: false, error: { code: 'DISABLED', message: 'Emiterea automată e dezactivată din Setări → Plăți.' } },
      { status: 409 }
    );
  }
  return NextResponse.json(
    { success: false, error: { code: 'FAILED', message: res.status === 'failed' ? res.error : 'Eroare necunoscută' } },
    { status: 502 }
  );
}
