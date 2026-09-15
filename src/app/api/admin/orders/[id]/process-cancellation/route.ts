import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { createRefund, stripe } from '@/lib/stripe';
import { computeCancelRefundAmount } from '@/lib/orders/self-cancel';
import { settleCancellationInvoicing, type CancellationFiscalResult } from '@/lib/orders/cancellation-fiscal';

/**
 * POST /api/admin/orders/[id]/process-cancellation
 *
 * Anularea în 30 de minute (refund 70%, 30% reținut). Trei moduri, în body:
 *
 *   { mode: 'auto' }      (implicit) — refund prin Stripe. La succes: status
 *                         `refunded`, id-ul refundului salvat pe comandă,
 *                         apoi fiscalul (storno + factura taxei de anulare).
 *                         La eșec: comanda RĂMÂNE `cancellation_requested`,
 *                         cu `refund_status='failed'` + mesajul Stripe, ca
 *                         echipa să vadă că trebuie refundat manual.
 *   { mode: 'manual', refundId? } — echipa a dat banii din dashboardul
 *                         Stripe (Stripe refuzase automat / comandă fără
 *                         PaymentIntent). Fără apel Stripe; restul identic.
 *   { mode: 'reconcile' } — pe o comandă deja `refunded`: caută refundul în
 *                         Stripe dacă lipsește id-ul și emite ce lipsește
 *                         din fiscal (storno / factura de 30%). Idempotent.
 *
 * Permisiune: payments.verify. Fiscalul nu blochează niciodată refundul —
 * erorile lui se întorc în răspuns și în istoricul comenzii.
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

type Mode = 'auto' | 'manual' | 'reconcile';

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    try {
      await requirePermission(user.id, 'payments.verify');
    } catch (err) {
      if (err instanceof Response) return err;
      throw err;
    }

    let body: { mode?: Mode; refundId?: string } = {};
    try {
      body = await request.json();
    } catch {
      /* body optional */
    }
    const mode: Mode = body.mode === 'manual' || body.mode === 'reconcile' ? body.mode : 'auto';

    const { id: orderId } = await context.params;
    const adminClient = createAdminClient();

    const { data: orderRow, error: fetchError } = await adminClient
      .from('orders')
      .select(
        'id, friendly_order_id, status, total_price, stripe_payment_intent_id, refunded_amount, refund_stripe_id, refund_status' as never
      )
      .eq('id', orderId)
      .single();

    if (fetchError || !orderRow) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = orderRow as any;
    const changedBy = user.email || user.id;
    const totalRon = Number(order.total_price || 0);
    const refundAmountRon = computeCancelRefundAmount(totalRon);
    const orderLabel = order.friendly_order_id || order.id;

    // ── reconcile: comandă deja refundată ───────────────────────────────────
    if (mode === 'reconcile') {
      if (order.status !== 'refunded') {
        return NextResponse.json(
          { success: false, error: `Reconcilierea merge doar pe comenzi 'refunded' (este '${order.status}').` },
          { status: 400 }
        );
      }
      let refundId: string | null = order.refund_stripe_id ?? null;
      let refundLookup: string | null = null;
      if (!refundId && order.stripe_payment_intent_id) {
        try {
          const refunds = await stripe.refunds.list({ payment_intent: order.stripe_payment_intent_id, limit: 10 });
          const ok = refunds.data.filter((r) => r.status === 'succeeded' || r.status === 'pending');
          if (ok.length > 0) {
            refundId = ok[0].id;
            const refundedRon = Math.round(ok.reduce((s, r) => s + r.amount, 0)) / 100;
            await adminClient
              .from('orders')
              .update({
                refund_stripe_id: refundId,
                refund_status: order.refund_status === 'manual' ? 'manual' : 'succeeded',
                refund_error: null,
                refunded_amount: refundedRon,
                refund_processed_at: new Date(ok[0].created * 1000).toISOString(),
              } as never)
              .eq('id', orderId);
            await adminClient.from('order_history').insert({
              order_id: orderId,
              event_type: 'admin_action',
              changed_by: changedBy,
              notes: `Reconciliere: refund găsit în Stripe (${refundId}, ${refundedRon.toFixed(2)} RON) și legat de comandă.`,
            });
          } else {
            refundLookup = 'Niciun refund găsit în Stripe pentru această plată.';
          }
        } catch (err) {
          refundLookup = `Căutarea în Stripe a eșuat: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
      const fiscal = await safeSettle(adminClient, orderId, changedBy);
      return NextResponse.json({
        success: true,
        mode,
        refundId,
        refundLookup,
        fiscal,
      });
    }

    // ── auto / manual: comandă cu cerere de anulare ─────────────────────────
    if (order.status !== 'cancellation_requested') {
      return NextResponse.json(
        { success: false, error: `Comanda nu este în 'cancellation_requested' (este '${order.status}').` },
        { status: 400 }
      );
    }

    let refundId: string | null = null;
    let refundStatus: 'succeeded' | 'manual' = 'succeeded';

    if (mode === 'manual') {
      refundStatus = 'manual';
      refundId = (body.refundId || '').trim() || null;
    } else {
      if (!order.stripe_payment_intent_id) {
        await adminClient
          .from('orders')
          .update({
            refund_status: 'failed',
            refund_error: 'Comanda nu are PaymentIntent Stripe (plată prin transfer sau comandă telefonică).',
          } as never)
          .eq('id', orderId);
        return NextResponse.json(
          {
            success: false,
            error:
              'Comanda nu are PaymentIntent — nu pot refunda automat. Dă banii înapoi manual (transfer bancar), apoi apasă „Am refundat manual".',
          },
          { status: 400 }
        );
      }

      // Refundul Stripe întâi — statusul se schimbă DOAR dacă reușește.
      // La eșec comanda rămâne cancellation_requested, cu eroarea la vedere,
      // ca echipa să refundeze manual fără risc de dublare.
      try {
        const refund = await createRefund({
          paymentIntentId: order.stripe_payment_intent_id,
          amountRon: refundAmountRon,
          reason: 'requested_by_customer',
          metadata: {
            order_id: order.id,
            order_number: orderLabel,
            policy: 'self_cancel_70pct',
            admin: changedBy,
          },
        });
        refundId = refund.id;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stripe refund failed';
        console.error('[process-cancellation] Stripe refund failed:', err);
        await adminClient
          .from('orders')
          .update({ refund_status: 'failed', refund_error: msg.slice(0, 500) } as never)
          .eq('id', orderId);
        await adminClient.from('order_history').insert({
          order_id: orderId,
          event_type: 'admin_action',
          changed_by: changedBy,
          notes: `⚠️ Refund automat Stripe EȘUAT (${refundAmountRon.toFixed(2)} RON): ${msg.slice(0, 400)}. Refundă manual din Stripe, apoi „Am refundat manual".`,
        });
        return NextResponse.json({ success: false, error: `Refund Stripe eșuat: ${msg}`, refundFailed: true }, { status: 502 });
      }
    }

    const now = new Date().toISOString();
    const currentRefunded = Number(order.refunded_amount ?? 0);
    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        status: 'refunded',
        payment_status: 'refunded',
        refunded_amount: Math.round((currentRefunded + refundAmountRon) * 100) / 100,
        refunded_at: now,
        refund_stripe_id: refundId,
        refund_status: refundStatus,
        refund_error: null,
        refund_processed_at: now,
      } as never)
      .eq('id', orderId);

    if (updateError) {
      console.error('[process-cancellation] update failed:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: `Refund ${refundStatus === 'manual' ? 'manual notat' : `Stripe OK (${refundId})`} dar update DB eșuat: ${updateError.message}. Setează manual status='refunded'.`,
        },
        { status: 500 }
      );
    }

    await adminClient.from('order_history').insert({
      order_id: orderId,
      event_type: 'refunded',
      changed_by: changedBy,
      old_value: { status: 'cancellation_requested' },
      new_value: { status: 'refunded', refund_id: refundId, refund_status: refundStatus, amount_ron: refundAmountRon },
      notes:
        refundStatus === 'manual'
          ? `Refund 70% dat MANUAL din Stripe${refundId ? ` (${refundId})` : ''}: ${refundAmountRon.toFixed(2)} RON din ${totalRon.toFixed(2)} RON.`
          : `Refund 70% procesat automat prin Stripe (${refundId}): ${refundAmountRon.toFixed(2)} RON din ${totalRon.toFixed(2)} RON.`,
    });

    const fiscal = await safeSettle(adminClient, orderId, changedBy);

    return NextResponse.json({
      success: true,
      mode,
      refundId,
      refundStatus,
      refundAmountRon,
      fiscal,
    });
  } catch (err) {
    console.error('[process-cancellation] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}

async function safeSettle(
  adminClient: ReturnType<typeof createAdminClient>,
  orderId: string,
  changedBy: string
): Promise<CancellationFiscalResult | { error: string }> {
  try {
    return await settleCancellationInvoicing(adminClient, orderId, changedBy);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[process-cancellation] fiscal settle failed:', err);
    return { error: msg };
  }
}
