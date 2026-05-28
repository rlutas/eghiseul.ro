/**
 * POST /api/admin/orders/[id]/sync-stripe
 *
 * Reconciles an order's payment state against Stripe. Used when the
 * Stripe → our webhook delivery failed (localhost dev without
 * `stripe listen`, brief production outage, signature mismatch
 * during a key rotation, etc.) and an order is sitting at
 * `pending + unpaid` even though Stripe shows the session as paid.
 *
 * Flow:
 *   1. Pulls the stripe_checkout_session_id from the order
 *   2. Retrieves the Checkout Session from Stripe
 *   3. If session.payment_status === 'paid' AND order isn't already
 *      marked paid, updates the order to processing+paid and stores
 *      the PaymentIntent id so subsequent webhook events (e.g.,
 *      charge.refunded) can correlate.
 *   4. Inserts an order_history row tagging the manual sync.
 *
 * Idempotent — re-running on an already-paid order returns the
 * current state without re-writing.
 *
 * Auth: payments.verify (same permission as bank-transfer approval).
 *
 * NOT a replacement for the webhook in production — invoice
 * generation + emails + estimated completion date computation still
 * happen via the webhook path. This endpoint exists ONLY to flip the
 * payment_status / status / paid_at fields. The webhook should still
 * fire in prod; if it doesn't, fix the webhook config — don't lean
 * on this manual button.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export const runtime = 'nodejs';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;
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
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select('id, status, payment_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at' as any)
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = order as any;
    if (!o.stripe_checkout_session_id) {
      return NextResponse.json(
        { success: false, error: 'Order has no Stripe Checkout Session ID — cannot sync (was it ever paid via Stripe?)' },
        { status: 422 }
      );
    }

    // Idempotency: if already paid, return current state without re-writing.
    if (o.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        data: {
          alreadyPaid: true,
          paymentStatus: o.payment_status,
          status: o.status,
          paidAt: o.paid_at,
        },
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(o.stripe_checkout_session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        error: `Stripe session is not paid (payment_status: ${session.payment_status}). Cannot sync.`,
        data: { stripeStatus: session.payment_status },
      }, { status: 409 });
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    const paidAtNow = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (admin as any)
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: paidAtNow,
        updated_at: paidAtNow,
        ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
      })
      .eq('id', orderId);
    if (updateErr) {
      console.error('[sync-stripe] update failed:', updateErr);
      return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }

    // Audit — use the actual admin user id so the timeline shows who clicked sync.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: orderId,
      event_type: 'payment_received',
      changed_by: user.id,
      new_value: {
        trigger: 'manual_stripe_sync',
        stripeSessionId: o.stripe_checkout_session_id,
        paymentIntentId,
      },
      notes: 'Plată sincronizată manual cu Stripe (webhook nu a ajuns sau a eșuat — verifică Stripe → Webhooks → Events dacă se repetă)',
    });

    return NextResponse.json({
      success: true,
      data: {
        alreadyPaid: false,
        paymentStatus: 'paid',
        status: 'processing',
        paidAt: paidAtNow,
        stripePaymentIntentId: paymentIntentId,
        warning: 'Webhook-ul Stripe nu a ajuns la noi. Acest sync flip-uiește doar status-ul; invoice/email-uri/estimated-completion-date NU se generează automat (webhook-ul ar fi făcut-o). Verifică Stripe Dashboard → Webhooks → Events pentru cauza eșecului.',
      },
    });
  } catch (error) {
    console.error('[sync-stripe] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
