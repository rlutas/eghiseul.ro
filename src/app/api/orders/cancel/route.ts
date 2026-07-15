import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  evaluateSelfCancel,
  computeCancelRefundAmount,
  CANCEL_RATE_MAX,
  CANCEL_RATE_WINDOW_MS,
} from '@/lib/orders/self-cancel';
import { sendEmail } from '@/lib/email/resend';
import { renderCancellationRequestEmail } from '@/lib/email/templates/cancellation-request';

/**
 * POST /api/orders/cancel
 *
 * Customer-facing self-cancel endpoint. Validates email + order_number,
 * checks the 30-min window from paid_at, flips status to
 * cancellation_requested, and dispatches a confirmation email.
 *
 * The actual Stripe refund (70%) is initiated by admin from the order
 * detail page — gives ops a chance to review borderline cases.
 *
 * Rate-limited 5 attempts / 15 min per IP via in-memory Map.
 */

const cancelAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = cancelAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    cancelAttempts.set(ip, { count: 1, resetAt: now + CANCEL_RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > CANCEL_RATE_MAX;
}

let requestCount = 0;
function gcRateLimiter() {
  requestCount += 1;
  if (requestCount % 100 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of cancelAttempts) {
    if (now > entry.resetAt) cancelAttempts.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    gcRateLimiter();

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prea multe încercări. Te rugăm să încerci din nou în 15 minute.',
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { order_number?: string; email?: string };
    const orderNumber = body.order_number?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Numărul comenzii și emailul sunt obligatorii.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Locate order — match on friendly_order_id (visible to client) first,
    // fall back to UUID. Email match is via JSONB customer_data.contact.email
    // since we don't denormalize email to a column.
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select(
        'id, friendly_order_id, order_number, status, paid_at, total_price, customer_data, stripe_payment_intent_id, service:services(processing_config)'
      )
      .or(`friendly_order_id.eq.${orderNumber},order_number.eq.${orderNumber}`)
      .limit(1);

    const order = orders?.[0];
    if (fetchError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comanda nu a fost găsită. Verifică numărul comenzii și emailul.',
        },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = order.customer_data as any;
    const orderEmail = (cd?.contact?.email || '').toLowerCase();
    if (orderEmail !== email) {
      // Same generic message — never confirm which half failed (email
      // enumeration prevention).
      return NextResponse.json(
        {
          success: false,
          error: 'Comanda nu a fost găsită. Verifică numărul comenzii și emailul.',
        },
        { status: 404 }
      );
    }

    // Per-service gate: self-cancel must be enabled for this service.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allowSelfCancel = ((order as any).service?.processing_config?.allow_self_cancel) !== false;
    if (!allowSelfCancel) {
      return NextResponse.json(
        { success: false, error: 'Acest serviciu nu poate fi anulat online. Contactează-ne pe WhatsApp sau telefon.', code: 'not_allowed' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paidAt = (order as any).paid_at as string | null;
    const decision = evaluateSelfCancel({ status: order.status, paid_at: paidAt });
    if (!decision.canCancel) {
      return NextResponse.json(
        { success: false, error: decision.reason, code: decision.code },
        { status: 400 }
      );
    }

    // Flip status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancellation_requested' })
      .eq('id', order.id);

    if (updateError) {
      console.error('[orders/cancel] update failed:', updateError);
      return NextResponse.json(
        { success: false, error: 'Eroare la procesarea cererii. Te rugăm să încerci din nou.' },
        { status: 500 }
      );
    }

    // Audit trail
    await supabase.from('order_history').insert({
      order_id: order.id,
      event_type: 'cancellation_requested',
      from_status: order.status,
      to_status: 'cancellation_requested',
      changed_by: 'client',
      notes: 'Anulare solicitată de client (în termen de 30 minute)',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Confirmation email (fire-and-forget)
    const firstName = cd?.contact?.firstName || cd?.personal?.firstName || cd?.personalData?.firstName || '';
    const lastName = cd?.contact?.lastName || cd?.personal?.lastName || cd?.personalData?.lastName || '';
    const companyName = cd?.companyData?.companyName || cd?.company?.companyName || cd?.billing?.companyName;
    const clientName = companyName || `${firstName} ${lastName}`.trim() || 'Client';
    const totalRon = order.total_price || 0;
    const refundAmountRon = computeCancelRefundAmount(totalRon);

    const { subject, html, text } = renderCancellationRequestEmail({
      clientName,
      orderNumber: order.friendly_order_id || order.order_number,
      amountTotalRon: totalRon,
      refundAmountRon,
    });

    sendEmail({
      to: email,
      subject,
      html,
      text,
      idempotencyKey: `cancel-request-${order.id}`,
    }).catch((err) => console.error('[orders/cancel] email send failed:', err));

    return NextResponse.json({
      success: true,
      message:
        'Cererea de anulare a fost înregistrată. Vei primi rambursarea de 70% în 5–10 zile lucrătoare.',
      refundAmountRon,
    });
  } catch (err) {
    console.error('[orders/cancel] failed:', err);
    return NextResponse.json(
      { success: false, error: 'Eroare internă. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}
