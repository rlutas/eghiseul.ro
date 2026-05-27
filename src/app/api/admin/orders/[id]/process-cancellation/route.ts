import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { createRefund } from '@/lib/stripe';
import { computeCancelRefundAmount } from '@/lib/orders/self-cancel';

/**
 * POST /api/admin/orders/[id]/process-cancellation
 *
 * Processes a self-cancellation request: refunds 70% via Stripe, flips
 * status to 'refunded', writes audit. Only valid when status is currently
 * 'cancellation_requested' (set by the customer-facing self-cancel route
 * or by an admin via the status override).
 *
 * 30% retention is non-configurable per policy — it covers Stripe fees
 * and the work already kicked off (document drafting, KYC review).
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'payments.verify');
    } catch (err) {
      if (err instanceof Response) return err;
      throw err;
    }

    const { id: orderId } = await context.params;
    const adminClient = createAdminClient();

    const { data: orderRow, error: fetchError } = await adminClient
      .from('orders')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select('id, status, total_price, stripe_payment_intent_id, refunded_amount' as any)
      .eq('id', orderId)
      .single();

    if (fetchError || !orderRow) {
      return NextResponse.json(
        { success: false, error: 'Comanda nu a fost găsită' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = orderRow as any;

    if (order.status !== 'cancellation_requested') {
      return NextResponse.json(
        {
          success: false,
          error: `Comanda nu este în 'cancellation_requested' (este '${order.status}').`,
        },
        { status: 400 }
      );
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comanda nu are PaymentIntent — nu pot procesa refund automat. Refundă manual.',
        },
        { status: 400 }
      );
    }

    const totalRon = order.total_price || 0;
    const refundAmountRon = computeCancelRefundAmount(totalRon);

    // Process Stripe refund first — only flip status if it succeeds. If the
    // refund call fails, we leave the order in cancellation_requested so the
    // admin can retry without double-refunding.
    let refundId: string;
    try {
      const refund = await createRefund({
        paymentIntentId: order.stripe_payment_intent_id,
        amountRon: refundAmountRon,
        reason: 'requested_by_customer',
        metadata: {
          order_id: order.id,
          policy: 'self_cancel_70pct',
        },
      });
      refundId = refund.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stripe refund failed';
      console.error('[process-cancellation] Stripe refund failed:', err);
      return NextResponse.json(
        { success: false, error: `Refund Stripe eșuat: ${msg}` },
        { status: 502 }
      );
    }

    // Persist new state. Track cumulative refunded_amount in case admin
    // already partial-refunded via Modify.
    const currentRefunded = Number(order.refunded_amount ?? 0);
    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        status: 'refunded',
        refunded_amount: Math.round((currentRefunded + refundAmountRon) * 100) / 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('id', orderId);

    if (updateError) {
      console.error('[process-cancellation] update failed:', updateError);
      // Don't unwind the refund — log so ops can reconcile manually.
      return NextResponse.json(
        {
          success: false,
          error: `Refund Stripe OK (${refundId}) dar update DB eșuat. Setează manual status='refunded'.`,
        },
        { status: 500 }
      );
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    await adminClient.from('order_history').insert({
      order_id: orderId,
      event_type: 'refunded',
      from_status: 'cancellation_requested',
      to_status: 'refunded',
      changed_by: profile?.email || user.id,
      notes: `Refund 70% procesat. Stripe refund: ${refundId}. Sumă: ${refundAmountRon.toFixed(2)} RON din ${totalRon.toFixed(2)} RON.`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return NextResponse.json({
      success: true,
      refundId,
      refundAmountRon,
    });
  } catch (err) {
    console.error('[process-cancellation] failed:', err);
    return NextResponse.json(
      { success: false, error: 'Eroare internă.' },
      { status: 500 }
    );
  }
}
