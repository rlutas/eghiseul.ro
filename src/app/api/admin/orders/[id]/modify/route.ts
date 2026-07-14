/**
 * POST /api/admin/orders/[id]/modify
 *
 * The "Modifică comandă plătită" feature — admin can change a paid order's
 * options and the system reconciles money:
 *   - Two modes via `action`: `'preview'` returns the diff without mutating;
 *     `'apply'` performs the refund / extra-payment / field update.
 *   - When new total < paid: Stripe refund of the difference, mirrored to
 *     `orders.refunded_amount`. Customer gets a Stripe receipt automatically.
 *   - When new total > paid: a new PaymentIntent for the difference. We
 *     persist `pending_extra_payment_url` so admin can re-share if the
 *     customer misses the email. The webhook for that PaymentIntent will
 *     later increment `orders.additional_paid_amount` on capture.
 *   - When new total === paid: only the field update + audit row.
 *
 * Authentication: requires `orders.manage` permission.
 * Mirrors `cazierjudiciaronline.com/api/admin/orders/[id]/modify` (527 lines
 * adapted to our JSONB selected_options model — see modify-diff.ts for the
 * pure-function math).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { createRefund, stripe } from '@/lib/stripe';
import { createProformaForExtra } from '@/lib/oblio/proforma';
import {
  computeModifyDiff,
  describeChanges,
  type OrderForDiff,
  type OrderOptionForDiff,
} from '@/lib/orders/modify-diff';
import { sendEmail } from '@/lib/email/resend';
import {
  buildExtraPaymentSubject,
  buildExtraPaymentHtml,
  buildExtraPaymentText,
} from '@/lib/email/templates/extra-payment';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ModifyBody {
  action: 'preview' | 'apply';
  selectedOptions: OrderOptionForDiff[];
  deliveryPrice?: number;
  note?: string;
  refundReason?: string;
}

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

  // ── Body parse ─────────────────────────────────────────────────────────────
  let body: ModifyBody;
  try {
    body = (await request.json()) as ModifyBody;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }
  if (body.action !== 'preview' && body.action !== 'apply') {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_ACTION', message: '`action` must be "preview" or "apply"' } },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.selectedOptions)) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_OPTIONS', message: '`selectedOptions` must be an array' } },
      { status: 400 }
    );
  }

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

  // Modify only makes sense on paid orders. Drafts/pending/abandoned have
  // no payment to refund and the customer can still finish checkout.
  if (order.payment_status !== 'paid') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_PAID',
          message: 'Order is not paid — modifications only allowed after payment',
        },
      },
      { status: 409 }
    );
  }

  // ── Diff math ─────────────────────────────────────────────────────────────
  // Cast once via `unknown` — Supabase's generated types don't carry the
  // refunded_amount / additional_paid_amount columns added by migration 042.
  const orderRow = order as unknown as Record<string, unknown>;
  const orderForDiff: OrderForDiff = {
    total_price: Number(orderRow.total_price ?? 0),
    base_price: Number(orderRow.base_price ?? 0),
    delivery_price: Number(orderRow.delivery_price ?? 0),
    refunded_amount: Number(orderRow.refunded_amount ?? 0),
    additional_paid_amount: Number(orderRow.additional_paid_amount ?? 0),
    selected_options: (orderRow.selected_options as OrderForDiff['selected_options']) ?? [],
  };
  const diff = computeModifyDiff(orderForDiff, {
    selectedOptions: body.selectedOptions,
    deliveryPrice: body.deliveryPrice,
  });

  // ── Preview mode ──────────────────────────────────────────────────────────
  if (body.action === 'preview') {
    return NextResponse.json({
      success: true,
      data: {
        preview: true,
        diff,
        summary: describeChanges({
          oldOptions: (orderForDiff.selected_options ?? []) as OrderOptionForDiff[],
          newOptions: body.selectedOptions,
          oldDeliveryPrice: orderForDiff.delivery_price,
          newDeliveryPrice: body.deliveryPrice ?? orderForDiff.delivery_price,
        }),
      },
    });
  }

  // ── Apply mode ────────────────────────────────────────────────────────────
  const adminEmail = user.email ?? 'admin';
  const changesSummary = describeChanges({
    oldOptions: (orderForDiff.selected_options ?? []) as OrderOptionForDiff[],
    newOptions: body.selectedOptions,
    oldDeliveryPrice: orderForDiff.delivery_price,
    newDeliveryPrice: body.deliveryPrice ?? orderForDiff.delivery_price,
  });

  let stripeRefundId: string | null = null;
  let pendingPaymentClientSecret: string | null = null;
  let pendingPaymentIntentId: string | null = null;

  // Diff < 0 → refund the difference.
  if (diff.action === 'refund') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIntentId = (order as any).stripe_payment_intent_id as string | null;
    if (!paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_PAYMENT_INTENT',
            message: 'Order has no Stripe PaymentIntent — cannot refund automatically',
          },
        },
        { status: 409 }
      );
    }
    try {
      const refund = await createRefund({
        paymentIntentId,
        amountRon: Math.abs(diff.diff),
        reason: 'requested_by_customer',
        metadata: {
          orderId: order.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderNumber: ((order as any).friendly_order_id ?? (order as any).order_number ?? '') as string,
          adminEmail,
          adminReason: body.refundReason ?? '(no reason provided)',
        },
      });
      stripeRefundId = refund.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stripe refund failed';
      return NextResponse.json(
        { success: false, error: { code: 'STRIPE_REFUND_FAILED', message: msg } },
        { status: 502 }
      );
    }
  }

  // Diff > 0 → Hosted Checkout Session for the extra amount + Oblio PROFORMA
  // + email the customer the Stripe payment link. (Session, not raw
  // PaymentIntent — the old PI flow pointed customers at /comanda/plata-extra
  // which never existed, so extra payments could never be completed.)
  // The fiscal invoice is issued by the webhook AFTER payment, referencing
  // the proforma. Email is best-effort — the admin still gets the URL back
  // and can re-share it manually.
  let extraPaymentEmailSent = false;
  let extraProforma: { seriesName: string; number: string; link: string | null } | null = null;
  if (diff.action === 'extra_payment') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cd = ((order as any).customer_data ?? {}) as {
        contact?: { email?: string; firstName?: string };
        personal?: { firstName?: string };
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderNum = ((order as any).friendly_order_id ?? (order as any).order_number ?? '') as string;
      const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'ron',
              product_data: {
                name: `Plată suplimentară comanda ${orderNum}`,
                description: changesSummary.slice(0, 500) || undefined,
              },
              unit_amount: Math.round(diff.diff * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${base}/comanda/status?order=${encodeURIComponent(orderNum)}&email=${encodeURIComponent(cd.contact?.email ?? '')}`,
        cancel_url: `${base}/comanda/status?order=${encodeURIComponent(orderNum)}&email=${encodeURIComponent(cd.contact?.email ?? '')}`,
        locale: 'ro',
        payment_method_types: ['card'],
        metadata: {
          purpose: 'extra_charge',
          orderId: order.id,
          orderNumber: orderNum,
          adminEmail,
        },
        payment_intent_data: {
          description: `Plată suplimentară comanda ${orderNum} — ${changesSummary}`.slice(0, 999),
          metadata: {
            purpose: 'extra_charge',
            orderId: order.id,
            orderNumber: orderNum,
          },
          receipt_email: cd.contact?.email ?? undefined,
        },
      });
      pendingPaymentIntentId = session.id;
      pendingPaymentClientSecret = session.url;

      // Oblio proforma for the extra amount (best-effort: a missing proforma
      // series must not block the payment link; the webhook issues the fiscal
      // invoice regardless, with referenceDocument only when we have one).
      try {
        extraProforma = await createProformaForExtra({
          orderNumber: orderNum,
          amountRon: diff.diff,
          description: changesSummary,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          customerData: ((order as any).customer_data ?? {}),
        });
      } catch (proformaErr) {
        console.warn('[modify] proforma emission failed (continuing):', proformaErr instanceof Error ? proformaErr.message : proformaErr);
      }

      const customerEmail = cd.contact?.email?.trim();
      if (customerEmail && session.url) {
        const paymentUrl = session.url;
        const firstName = cd.personal?.firstName ?? cd.contact?.firstName ?? null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderNum = ((order as any).friendly_order_id ?? (order as any).order_number ?? '') as string;
        try {
          const result = await sendEmail({
            to: customerEmail,
            subject: buildExtraPaymentSubject({
              orderNumber: orderNum,
              amountRon: diff.diff,
              customerFirstName: firstName,
              changesDescription: changesSummary,
              paymentUrl,
            }),
            html: buildExtraPaymentHtml({
              orderNumber: orderNum,
              amountRon: diff.diff,
              customerFirstName: firstName,
              changesDescription: changesSummary,
              paymentUrl,
            }),
            text: buildExtraPaymentText({
              orderNumber: orderNum,
              amountRon: diff.diff,
              customerFirstName: firstName,
              changesDescription: changesSummary,
              paymentUrl,
            }),
            idempotencyKey: `extra-payment-${session.id}`,
          });
          extraPaymentEmailSent = !result.skipped;
        } catch (emailErr) {
          // Don't fail the whole flow on email error — admin can re-share
          // from `pending_extra_payment_url`. Log for ops visibility.
          console.warn('[modify] extra-payment email failed:', emailErr);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stripe extra-payment intent failed';
      return NextResponse.json(
        { success: false, error: { code: 'STRIPE_EXTRA_PAYMENT_FAILED', message: msg } },
        { status: 502 }
      );
    }
  }

  // ── Apply field changes ───────────────────────────────────────────────────
  // We deliberately keep `total_price` at the original capture value so the
  // receipt + accounting reconciles. The `refunded_amount` /
  // `additional_paid_amount` columns track the deltas. New options sum
  // is reflected via `options_price` for display in the admin list.
  const newOptionsTotal = body.selectedOptions.reduce(
    (sum, o) => sum + (o.priceModifier ?? o.price_modifier ?? 0) * (o.quantity ?? 1),
    0
  );
  const updatePayload: Record<string, unknown> = {
    selected_options: body.selectedOptions,
    options_price: Math.round(newOptionsTotal * 100) / 100,
    last_modified_at: new Date().toISOString(),
    last_modified_by: adminEmail,
  };
  if (typeof body.deliveryPrice === 'number') {
    updatePayload.delivery_price = body.deliveryPrice;
  }
  if (diff.action === 'refund') {
    updatePayload.refunded_amount = diff.refunded + Math.abs(diff.diff);
  }
  if (diff.action === 'extra_payment') {
    // We don't credit additional_paid_amount until the customer actually pays
    // (webhook does that on checkout.session.completed / purpose=extra_charge).
    updatePayload.pending_extra_payment_intent_id = pendingPaymentIntentId; // cs_... session id
    updatePayload.pending_extra_payment_amount = diff.diff;
    // Hosted Checkout URL — shareable directly with the customer.
    updatePayload.pending_extra_payment_url = pendingPaymentClientSecret;
    if (extraProforma) {
      updatePayload.pending_extra_proforma = { ...extraProforma, amount: diff.diff };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin.from('orders') as any)
    .update(updatePayload)
    .eq('id', id);
  if (updateErr) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_UPDATE_FAILED', message: updateErr.message } },
      { status: 500 }
    );
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  const auditParts = [
    `Modificat de ${adminEmail}`,
    diff.action === 'refund'
      ? `refund ${Math.abs(diff.diff).toFixed(2)} RON (Stripe ${stripeRefundId})`
      : diff.action === 'extra_payment'
        ? `creat link plată extra ${diff.diff.toFixed(2)} RON (PI ${pendingPaymentIntentId})`
        : 'fără diferență de bani',
    body.note ? `notă: ${body.note}` : null,
    `modificări: ${changesSummary}`,
  ].filter(Boolean) as string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('order_history') as any).insert({
    order_id: id,
    event_type:
      diff.action === 'refund'
        ? 'refunded'
        : diff.action === 'extra_payment'
          ? 'extra_payment_sent'
          : 'modified',
    changed_by: adminEmail,
    new_value: {
      diff: diff.diff,
      newTotal: diff.newTotal,
      refundId: stripeRefundId,
      pendingExtraPaymentIntentId: pendingPaymentIntentId,
    },
    notes: auditParts.join(' · '),
  });

  return NextResponse.json({
    success: true,
    data: {
      diff,
      summary: changesSummary,
      stripeRefundId,
      pendingPaymentIntentId,
      pendingPaymentClientSecret,
      extraPaymentEmailSent,
    },
  });
}
