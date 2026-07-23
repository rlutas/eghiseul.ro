/**
 * POST /api/admin/orders/[id]/regenerate-extra-payment
 *
 * "Generează link nou" for a pending extra payment whose Stripe Checkout
 * Session expired (24h lifetime) or is about to. Creates a fresh session for
 * the SAME pending amount, expires the old session first (so the customer
 * can't end up with two payable links), reuses the already-issued Oblio
 * proforma (never re-issues), emails the customer the new link, and logs an
 * order_history event.
 *
 * Auth: orders.manage.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { stripe } from '@/lib/stripe';
import { createExtraPaymentSession } from '@/lib/orders/extra-payment-link';
import { sendEmail } from '@/lib/email/resend';
import {
  buildExtraPaymentSubject,
  buildExtraPaymentHtml,
  buildExtraPaymentText,
} from '@/lib/email/templates/extra-payment';

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
  const anyOrder = order as any;
  const amountRon = Number(anyOrder.pending_extra_payment_amount ?? 0);
  const oldSessionId = anyOrder.pending_extra_payment_intent_id as string | null;
  if (!amountRon || amountRon <= 0 || !anyOrder.pending_extra_payment_url) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NO_PENDING_EXTRA', message: 'Comanda nu are o plată extra în așteptare.' },
      },
      { status: 409 }
    );
  }

  // Expire the old session first — if it's somehow still open, two payable
  // links would risk a double payment. Best-effort: already-expired sessions
  // throw and that's fine.
  if (oldSessionId?.startsWith('cs_')) {
    try {
      await stripe.checkout.sessions.expire(oldSessionId);
    } catch {
      /* already expired/completed — nothing to do */
    }
  }

  const cd = (anyOrder.customer_data ?? {}) as {
    contact?: { email?: string; firstName?: string };
    personal?: { firstName?: string; lastName?: string };
  };
  const orderNum = (anyOrder.friendly_order_id ?? anyOrder.order_number ?? '') as string;
  const clientName = [cd.personal?.firstName, cd.personal?.lastName].filter(Boolean).join(' ');
  const description = `Servicii suplimentare comanda ${orderNum}`;

  let session;
  try {
    session = await createExtraPaymentSession({
      orderId: order.id,
      orderNumber: orderNum,
      amountRon,
      description,
      clientName,
      customerEmail: cd.contact?.email ?? null,
      adminEmail: user.email ?? 'admin',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe session creation failed';
    return NextResponse.json(
      { success: false, error: { code: 'STRIPE_SESSION_FAILED', message: msg } },
      { status: 502 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin.from('orders') as any)
    .update({
      pending_extra_payment_intent_id: session.sessionId,
      pending_extra_payment_url: session.url,
      pending_extra_payment_expires_at: session.expiresAt,
      // Fresh link → its own reminder may fire again before the new expiry.
      pending_extra_reminder_sent_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (updateErr) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_UPDATE_FAILED', message: updateErr.message } },
      { status: 500 }
    );
  }

  // Email the customer the fresh link (best-effort — admin still gets the URL
  // back and can share it manually).
  let emailSent = false;
  const customerEmail = cd.contact?.email?.trim();
  if (customerEmail && session.url) {
    try {
      const emailInput = {
        orderNumber: orderNum,
        amountRon,
        customerFirstName: cd.personal?.firstName ?? cd.contact?.firstName ?? null,
        changesDescription: description,
        paymentUrl: session.url,
      };
      const result = await sendEmail({
        to: customerEmail,
        subject: buildExtraPaymentSubject(emailInput),
        html: buildExtraPaymentHtml(emailInput),
        text: buildExtraPaymentText(emailInput),
        idempotencyKey: `extra-payment-${session.sessionId}`,
      });
      emailSent = !result.skipped;
    } catch (emailErr) {
      console.warn('[regenerate-extra-payment] email failed:', emailErr);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('order_history') as any).insert({
    order_id: id,
    event_type: 'extra_payment_sent',
    changed_by: user.email ?? 'admin',
    new_value: { diff: amountRon, regenerated: true },
    notes: `Link plată extra REGENERAT (${amountRon.toFixed(2)} RON) — vechiul link ${oldSessionId ?? 'necunoscut'} expirat/invalidat · sesiune nouă ${session.sessionId}${emailSent ? ' · email trimis clientului' : ' · EMAIL NETRIMIS — partajează manual link-ul'}`,
  });

  return NextResponse.json({
    success: true,
    data: {
      url: session.url,
      expiresAt: session.expiresAt,
      emailSent,
    },
  });
}
