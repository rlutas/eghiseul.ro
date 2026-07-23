/**
 * Extra-payment Checkout Session — single builder for both the Modifică flow
 * and the "Generează link nou" regenerate endpoint. Stripe Checkout Sessions
 * expire after 24h; the caller persists `expiresAt` into
 * `orders.pending_extra_payment_expires_at` so admin alerts + the pre-expiry
 * reminder cron know when the link dies (incident E-260719-LS53Y: link expired
 * silently with 824.50 RON pending).
 *
 * The Oblio PROFORMA is intentionally NOT handled here — it is issued once at
 * the first Modifică and reused on regenerate (never re-issue).
 */
import { stripe } from '@/lib/stripe';

export interface ExtraPaymentSessionInput {
  orderId: string;
  orderNumber: string;
  /** Amount the customer still owes (RON). */
  amountRon: number;
  /** What the customer is paying for — Checkout line name + Stripe dashboard. */
  description: string;
  clientName?: string | null;
  customerEmail?: string | null;
  adminEmail: string;
}

export interface ExtraPaymentSessionResult {
  sessionId: string;
  url: string | null;
  /** ISO timestamp of Stripe's session expiry (24h from creation). */
  expiresAt: string | null;
}

export async function createExtraPaymentSession(
  input: ExtraPaymentSessionInput
): Promise<ExtraPaymentSessionResult> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
  const statusUrl = `${base}/comanda/status?order=${encodeURIComponent(input.orderNumber)}&email=${encodeURIComponent(input.customerEmail ?? '')}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'ron',
          product_data: {
            // Numele liniei = CE se plătește — apare la client în Checkout
            // și în Stripe dashboard (ușor de identificat în decontări).
            name: `Extra ${input.orderNumber}: ${input.description}`.slice(0, 250),
            description: `Comanda ${input.orderNumber}${input.clientName ? ` · ${input.clientName}` : ''}`.slice(0, 500),
          },
          unit_amount: Math.round(input.amountRon * 100),
        },
        quantity: 1,
      },
    ],
    success_url: statusUrl,
    cancel_url: statusUrl,
    locale: 'ro',
    payment_method_types: ['card'],
    metadata: {
      purpose: 'extra_charge',
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      adminEmail: input.adminEmail,
    },
    payment_intent_data: {
      description: `Extra ${input.orderNumber}: ${input.description}${input.clientName ? ` · ${input.clientName}` : ''}`.slice(0, 999),
      metadata: {
        purpose: 'extra_charge',
        orderId: input.orderId,
        orderNumber: input.orderNumber,
      },
      receipt_email: input.customerEmail || undefined,
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
  };
}
