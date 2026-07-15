import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getMissingInvoiceClientFields } from '@/lib/oblio/invoice';
import { emailDomainAcceptsMail } from '@/lib/email-mx';

/**
 * POST /api/admin/orders/create-from-draft — finalizarea unei comenzi
 * TELEFONICE completate de echipă prin wizard-ul real (?telefonic=1).
 *
 * Wizard-ul a salvat deja tot în draft (customer_data cu firmă din ANAF /
 * constatator / imobil, selected_options cu prețuri, livrare cu cotație
 * reală de curier, cupon). Aici doar: guards (billing complet + MX email) →
 * status='pending' + channel='phone' + created_by_admin. FĂRĂ /submit —
 * KYC-ul și semnătura vin prin link-ul de completare, după plată.
 *
 * Body: { orderId: string }
 * Auth: orders.manage — un vizitator cu ?telefonic=1 în URL se lovește de 401.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Autentificare de admin necesară.' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = (await request.json().catch(() => ({}))) as { orderId?: string };
    if (!body.orderId) {
      return NextResponse.json({ success: false, error: 'orderId lipsă.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order, error: fetchError } = await admin
      .from('orders')
      .select('id, friendly_order_id, status, payment_status, customer_data, total_price, services(name)')
      .eq('id', body.orderId)
      .single();
    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită.' }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = order as any;
    if (o.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: `Comanda nu mai e draft (status: ${o.status}).` },
        { status: 409 }
      );
    }

    const customerData = o.customer_data ?? {};
    const email = customerData?.contact?.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Comanda nu are email de contact.' }, { status: 400 });
    }

    // Guards — aceleași motive ca la create: factura și gate-ul de email de pe
    // link-ul de completare depind de datele astea.
    const missingBilling = getMissingInvoiceClientFields(customerData as never);
    if (missingBilling.length > 0) {
      return NextResponse.json(
        { success: false, error: `Date de facturare incomplete: ${missingBilling.join(', ')}` },
        { status: 400 }
      );
    }
    try {
      const mxOk = await emailDomainAcceptsMail(String(email));
      if (mxOk === false) {
        return NextResponse.json(
          { success: false, error: `Domeniul emailului „${email}” nu acceptă mesaje — verifică adresa cu clientul.` },
          { status: 400 }
        );
      }
    } catch {
      /* fail-open */
    }

    const now = new Date().toISOString();
    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'pending',
        submitted_at: now,
        channel: 'phone',
        created_by_admin: user.id,
        // Draft-ul creat cu sesiunea adminului se leagă de contul LUI
        // (draft route: user_id = user?.id) — comanda e a clientului, o
        // detașăm ca să nu apară în /account-ul adminului.
        user_id: null,
        customer_data: {
          ...customerData,
          manual_order: { createdBy: user.id, createdAt: now, via: 'wizard_telefonic' },
        },
        updated_at: now,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('id', body.orderId)
      .eq('status', 'draft'); // race-safe: doar dacă e încă draft

    if (updateError) {
      console.error('[create-from-draft] update failed:', updateError);
      return NextResponse.json({ success: false, error: 'Eroare la finalizarea comenzii.' }, { status: 500 });
    }

    await admin.from('order_history').insert({
      order_id: body.orderId,
      event_type: 'admin_action',
      notes: `Comandă telefonică creată prin wizard (mod telefonic) · ${o.services?.name || ''} · total ${o.total_price} RON`,
      changed_by: user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return NextResponse.json({
      success: true,
      data: { id: o.id, friendlyOrderId: o.friendly_order_id },
    });
  } catch (err) {
    console.error('[create-from-draft] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
