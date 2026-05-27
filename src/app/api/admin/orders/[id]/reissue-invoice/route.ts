/**
 * POST /api/admin/orders/[id]/reissue-invoice
 *
 * Storno + reemitere factură Oblio. Folosit după ce admin a modificat o
 * comandă via dialog-ul „Modifică" și factura veche nu mai reflectă
 * liniile actuale. Operațiunea face DOUĂ acțiuni atomic la nivel UX:
 *
 *   1. Cancel (storno) factura curentă — Oblio creează automat un document
 *      de stornare (credit note) care anulează factura originală. Se
 *      transmite în SPV ca document separat.
 *   2. Emite o factură nouă cu liniile actualizate din comandă (preluând
 *      add-on-urile + cuponul + livrarea în starea curentă).
 *
 * Audit trail păstrează ambele numere (vechi → nou) într-un singur
 * `order_history` row.
 *
 * Mirror al `cazierjudiciaronline.com/api/admin/orders/[id]/reissue-invoice`
 * adaptat la modelul nostru (Oblio vs SmartBill — Oblio are un endpoint
 * `/docs/cancel` care emite storno automat, deci flow-ul e cu un pas mai
 * scurt decât la sister).
 *
 * Anti-double-click: refuză dacă invoice_issued_at este sub 60 secunde —
 * cel mai probabil dublu-click admin.
 *
 * Feature flag: `OBLIO_REISSUE_ENABLED=true` în env. Cât timp flag-ul nu
 * e setat, endpoint-ul returnează 503 (admin face manual din Oblio UI).
 * Vezi `docs/admin/modify-order.md` și `cazierjudiciaronline.com/docs/admin/modifica-comanda.md`
 * pentru contextul „de ce stornare + reemitere, nu cancel".
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { cancelInvoice, createInvoiceFromOrder } from '@/lib/oblio';
import { parseInvoiceNumber } from '@/lib/oblio/parse-number';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ANTI_DOUBLE_CLICK_MS = 60_000;

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // ── Auth ───────────────────────────────────────────────────────────────────
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

  // ── Feature flag ──────────────────────────────────────────────────────────
  if (process.env.OBLIO_REISSUE_ENABLED !== 'true') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message:
            'Funcția Storno + Reemitere Oblio este dezactivată din feature flag. ' +
            'Pentru moment, fă manual din Oblio UI: storno factură veche + emite una nouă, apoi update invoice_number aici.',
        },
      },
      { status: 503 }
    );
  }

  let body: { note?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body optional
  }
  const note = (body.note ?? '').trim().slice(0, 500);

  // ── Fetch order ────────────────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data: order, error: fetchErr } = await admin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchErr || !order) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
      { status: 404 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = order as any;
  if (o.payment_status !== 'paid') {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_PAID', message: 'Comanda nu e plătită' } },
      { status: 409 }
    );
  }
  const oldInvoiceNumber = o.invoice_number as string | null;
  if (!oldInvoiceNumber) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NO_INVOICE',
          message:
            'Comanda nu are factură emisă. ' +
            'Folosește emiterea inițială din webhook-ul Stripe / verify-payment, nu reemiterea.',
        },
      },
      { status: 409 }
    );
  }

  // Anti-double-click: dacă factura curentă a fost emisă în ultimele 60 sec
  if (o.invoice_issued_at) {
    const issuedAt = new Date(o.invoice_issued_at).getTime();
    if (Date.now() - issuedAt < ANTI_DOUBLE_CLICK_MS) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_SOON',
            message: 'Factura a fost reemisă acum mai puțin de 60 secunde. Așteaptă înainte să încerci din nou.',
          },
        },
        { status: 429 }
      );
    }
  }

  // Parse "EGH-0001" → { seriesName: "EGH", number: "0001" }
  const parsed = parseInvoiceNumber(oldInvoiceNumber);
  if (!parsed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INVOICE_FORMAT',
          message: `Nu am putut parsa "${oldInvoiceNumber}" în format <SERIES>-<NUMBER>. Verifică manual.`,
        },
      },
      { status: 500 }
    );
  }

  const adminEmail = user.email ?? 'admin';

  // ── STEP 1: Storno (Oblio cancel) ─────────────────────────────────────────
  let stornoDoc: unknown = null;
  try {
    stornoDoc = await cancelInvoice(parsed.seriesName, parsed.number);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Oblio cancel failed';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('order_history') as any).insert({
      order_id: id,
      event_type: 'admin_action',
      changed_by: adminEmail,
      notes:
        `Reemitere ÎNCEPUTĂ dar storno-ul facturii ${oldInvoiceNumber} a eșuat: ${msg}. ` +
        `Factura veche e încă activă, nimic n-a fost modificat în DB. ` +
        `Acțiune recomandată: storno + emitere manuală din Oblio UI.`,
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OBLIO_STORNO_FAILED',
          message:
            `Storno-ul facturii ${oldInvoiceNumber} a eșuat: ${msg}. ` +
            `Factura veche e încă activă. Emite stornare manuală din Oblio UI.`,
        },
      },
      { status: 502 }
    );
  }

  // ── STEP 2: Emite factură nouă corectivă ──────────────────────────────────
  let newInvoice: { invoiceNumber: string; invoiceUrl?: string; seriesName: string; number: string; createdAt: string };
  try {
    const fetched = await createInvoiceFromOrder(
      {
        id: o.id,
        order_number: o.order_number ?? undefined,
        friendly_order_id: o.friendly_order_id ?? undefined,
        service_name: o.services?.name ?? 'Serviciu eGhiseul',
        base_price: o.base_price ?? undefined,
        total_price: o.total_price,
        selected_options: o.selected_options ?? undefined,
        delivery_method: o.delivery_method ?? undefined,
        delivery_price: o.delivery_price ?? undefined,
        coupon_code: o.coupon_code ?? null,
        discount_amount: o.discount_amount ?? null,
        customer_data: o.customer_data ?? undefined,
      },
      'Card'
    );
    newInvoice = fetched;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Oblio create failed';
    // Storno a reușit dar emiterea facturii corective a eșuat. Audit reține
    // ambele numere ca operatorul să poată emite manual fără să mai facă
    // încă o stornare din greșeală.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('order_history') as any).insert({
      order_id: id,
      event_type: 'admin_action',
      changed_by: adminEmail,
      notes:
        `Storno OK pentru factura ${oldInvoiceNumber}. ` +
        `DAR emiterea facturii corective a eșuat: ${msg}. ` +
        `Acțiune recomandată: emite manual factura nouă în Oblio UI, ` +
        `actualizează invoice_number aici și verifică că storno-ul anulează factura corect.`,
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OBLIO_CREATE_FAILED',
          message:
            `Storno OK dar emiterea facturii corective a eșuat: ${msg}. ` +
            `Emite factura nouă manual în Oblio UI și actualizează invoice_number.`,
        },
        data: { stornoIssued: true, oldInvoice: oldInvoiceNumber },
      },
      { status: 502 }
    );
  }

  // ── STEP 3: Persist new invoice ───────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('orders') as any)
    .update({
      invoice_number: newInvoice.invoiceNumber,
      invoice_url: newInvoice.invoiceUrl ?? null,
      invoice_issued_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  // ── STEP 4: Audit log ─────────────────────────────────────────────────────
  const auditParts = [
    `Reemis factură de ${adminEmail}`,
    `factură veche: ${oldInvoiceNumber}`,
    `stornare emisă (Oblio)`,
    `factură nouă: ${newInvoice.invoiceNumber}`,
    note ? `notă: ${note}` : null,
  ].filter(Boolean) as string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('order_history') as any).insert({
    order_id: id,
    event_type: 'admin_action',
    changed_by: adminEmail,
    new_value: {
      old_invoice: oldInvoiceNumber,
      new_invoice: newInvoice.invoiceNumber,
      new_invoice_url: newInvoice.invoiceUrl ?? null,
    },
    notes: auditParts.join(' · '),
  });

  return NextResponse.json({
    success: true,
    data: {
      oldInvoice: oldInvoiceNumber,
      newInvoice: {
        invoiceNumber: newInvoice.invoiceNumber,
        invoiceUrl: newInvoice.invoiceUrl ?? null,
      },
      stornoDoc, // raw Oblio response for debugging
    },
  });
}
