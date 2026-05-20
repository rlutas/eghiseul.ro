/**
 * POST /api/orders/[id]/coupon — apply a coupon to an existing order
 * DELETE /api/orders/[id]/coupon — remove the coupon from the order
 *
 * Both routes recompute the order total. If a Stripe PaymentIntent already
 * exists (user reached checkout), we cancel it so a new intent is generated
 * with the new amount on next /payment call. The wizard provider doesn't
 * own coupons after submit — checkout owns them.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

interface CouponRow {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_uses: number | null;
  times_used: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

interface OrderRow {
  id: string;
  base_price: number | null;
  options_price: number | null;
  delivery_price: number | null;
  total_price: number;
  payment_status: string;
  stripe_payment_intent_id: string | null;
}

const bodySchema = z.object({
  code: z.string().trim().min(1).max(50),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ──────────────────────────────────────────────────────────────────────────
// Apply coupon
// ──────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corp invalid' },
      { status: 400 }
    );
  }
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Cod cupon invalid' },
      { status: 400 }
    );
  }
  const code = parsed.data.code.toUpperCase();

  const admin: AnyClient = createAdminClient();

  // Fetch order
  const { data: orderData, error: orderErr } = await admin
    .from('orders')
    .select(
      'id, base_price, options_price, delivery_price, total_price, payment_status, stripe_payment_intent_id'
    )
    .eq('id', id)
    .maybeSingle();

  if (orderErr || !orderData) {
    return NextResponse.json(
      { success: false, error: 'Comanda nu a fost gasita' },
      { status: 404 }
    );
  }
  const order = orderData as OrderRow;

  if (order.payment_status === 'paid') {
    return NextResponse.json(
      { success: false, error: 'Comanda este deja platita' },
      { status: 400 }
    );
  }

  // Compute subtotal from server-side fields (never trust client)
  const subtotal =
    Number(order.base_price ?? 0) +
    Number(order.options_price ?? 0) +
    Number(order.delivery_price ?? 0);

  // Fetch + validate coupon
  const { data: couponData, error: couponErr } = await admin
    .from('coupons')
    .select('*')
    .ilike('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (couponErr) {
    console.error('Coupon lookup error:', couponErr);
    return NextResponse.json(
      { success: false, error: 'Eroare la validare' },
      { status: 500 }
    );
  }
  const coupon = couponData as CouponRow | null;
  if (!coupon) {
    return NextResponse.json(
      { success: false, error: 'Cupon invalid' },
      { status: 404 }
    );
  }

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return NextResponse.json(
      { success: false, error: 'Cuponul nu este inca activ' },
      { status: 400 }
    );
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return NextResponse.json(
      { success: false, error: 'Cuponul a expirat' },
      { status: 400 }
    );
  }
  if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
    return NextResponse.json(
      { success: false, error: 'Cuponul a atins limita de utilizari' },
      { status: 400 }
    );
  }
  if (subtotal < Number(coupon.min_amount || 0)) {
    return NextResponse.json(
      {
        success: false,
        error: `Suma minima pentru acest cupon este ${Number(
          coupon.min_amount
        ).toFixed(2)} RON`,
      },
      { status: 400 }
    );
  }

  // Compute discount
  let discount =
    coupon.discount_type === 'percentage'
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;
  const finalTotal = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  // Cancel any existing PaymentIntent — new amount → new intent.
  if (order.stripe_payment_intent_id) {
    try {
      const intent = await stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id
      );
      if (intent.status !== 'succeeded' && intent.status !== 'canceled') {
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
      }
    } catch (err) {
      // Non-fatal — we'll regenerate the intent regardless of cancel result.
      console.warn('Failed to cancel existing PaymentIntent:', err);
    }
  }

  // Persist
  const { error: updateErr } = await admin
    .from('orders')
    .update({
      coupon_code: coupon.code,
      discount_amount: discount,
      total_price: finalTotal,
      stripe_payment_intent_id: null, // force re-creation on next payment call
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateErr) {
    console.error('Order update error:', updateErr);
    return NextResponse.json(
      { success: false, error: 'Eroare la salvare' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      couponCode: coupon.code,
      discountAmount: discount,
      subtotal,
      totalPrice: finalTotal,
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Remove coupon
// ──────────────────────────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const admin: AnyClient = createAdminClient();

  const { data: orderData, error: orderErr } = await admin
    .from('orders')
    .select(
      'id, base_price, options_price, delivery_price, payment_status, stripe_payment_intent_id'
    )
    .eq('id', id)
    .maybeSingle();
  if (orderErr || !orderData) {
    return NextResponse.json(
      { success: false, error: 'Comanda nu a fost gasita' },
      { status: 404 }
    );
  }
  const order = orderData as OrderRow;
  if (order.payment_status === 'paid') {
    return NextResponse.json(
      { success: false, error: 'Comanda este deja platita' },
      { status: 400 }
    );
  }

  const subtotal =
    Number(order.base_price ?? 0) +
    Number(order.options_price ?? 0) +
    Number(order.delivery_price ?? 0);

  if (order.stripe_payment_intent_id) {
    try {
      const intent = await stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id
      );
      if (intent.status !== 'succeeded' && intent.status !== 'canceled') {
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
      }
    } catch (err) {
      console.warn('Failed to cancel existing PaymentIntent:', err);
    }
  }

  const { error: updateErr } = await admin
    .from('orders')
    .update({
      coupon_code: null,
      discount_amount: 0,
      total_price: subtotal,
      stripe_payment_intent_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json(
      { success: false, error: 'Eroare la salvare' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { totalPrice: subtotal },
  });
}
