import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import {
  buildPaymentLinkSubject,
  buildPaymentLinkHtml,
  buildPaymentLinkText,
} from '@/lib/email/templates/payment-link';

/**
 * POST /api/admin/orders/[id]/send-payment-link — comenzi telefonice.
 *
 * Link-ul de plată = pagina noastră /comanda/checkout/[orderId] (mintează o
 * sesiune Stripe nouă la fiecare vizită → nu expiră; webhook-ul existent face
 * paid + factură + numere Barou + confirmare — zero modificări acolo).
 * Trimite emailul clientului și întoarce URL-ul pentru copy/WhatsApp.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();
    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('id, friendly_order_id, order_number, payment_status, total_price, customer_data, services(name)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită.' }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = order as any;
    if (o.payment_status === 'paid') {
      return NextResponse.json({ success: false, error: 'Comanda este deja plătită.' }, { status: 409 });
    }

    const email = o.customer_data?.contact?.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Comanda nu are email de contact.' }, { status: 400 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const paymentUrl = `${base}/comanda/checkout/${orderId}`;
    const input = {
      customerFirstName: o.customer_data?.contact?.firstName || null,
      orderNumber: o.friendly_order_id || o.order_number,
      serviceName: o.services?.name || 'Serviciu eGhișeul',
      amountRon: Number(o.total_price) || 0,
      paymentUrl,
    };

    await sendEmail({
      to: email,
      subject: buildPaymentLinkSubject(input),
      html: buildPaymentLinkHtml(input),
      text: buildPaymentLinkText(input),
      idempotencyKey: `payment-link-${orderId}-${Date.now()}`,
    });

    await adminClient.from('order_history').insert({
      order_id: orderId,
      event_type: 'admin_action',
      notes: `Link de plată trimis clientului (${email}) — ${input.amountRon.toFixed(2)} RON`,
      changed_by: user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return NextResponse.json({ success: true, data: { paymentUrl, emailSent: true } });
  } catch (err) {
    console.error('[send-payment-link] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
