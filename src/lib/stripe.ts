import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

/**
 * Mask CNP for privacy - show only first 4 and last 3 digits
 * Example: 2920220303478 → 2920******478
 */
function maskCnp(cnp: string): string {
  if (!cnp || cnp.length < 7) return cnp
  return `${cnp.slice(0, 4)}******${cnp.slice(-3)}`
}

export interface CustomerData {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  // For companies
  companyName?: string;
  cui?: string;
  // For individuals
  cnp?: string;
}

export interface PaymentIntentOptions {
  amount: number;
  description: string;
  metadata: Record<string, string>;
  customer?: CustomerData;
  receiptEmail?: string;
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(customerData: CustomerData): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: customerData.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    // Update existing customer with latest info
    const customer = existingCustomers.data[0];
    return stripe.customers.update(customer.id, {
      name: customerData.companyName || customerData.name,
      phone: customerData.phone,
      address: customerData.address ? {
        line1: customerData.address.line1 || '',
        line2: customerData.address.line2,
        city: customerData.address.city,
        state: customerData.address.state,
        postal_code: customerData.address.postal_code,
        country: customerData.address.country || 'RO',
      } : undefined,
      metadata: {
        ...(customerData.cui && { cui: customerData.cui }),
        ...(customerData.cnp && { cnp: maskCnp(customerData.cnp) }),
        ...(customerData.companyName && { company_name: customerData.companyName }),
      },
    });
  }

  // Create new customer
  return stripe.customers.create({
    email: customerData.email,
    name: customerData.companyName || customerData.name,
    phone: customerData.phone,
    address: customerData.address ? {
      line1: customerData.address.line1 || '',
      line2: customerData.address.line2,
      city: customerData.address.city,
      state: customerData.address.state,
      postal_code: customerData.address.postal_code,
      country: customerData.address.country || 'RO',
    } : undefined,
    metadata: {
      ...(customerData.cui && { cui: customerData.cui }),
      ...(customerData.cnp && { cnp: maskCnp(customerData.cnp) }),
      ...(customerData.companyName && { company_name: customerData.companyName }),
    },
  });
}

/**
 * Create a payment intent with full customer details
 */
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>,
  options?: {
    description?: string;
    customer?: CustomerData;
    receiptEmail?: string;
  }
): Promise<Stripe.PaymentIntent> {
  let customerId: string | undefined;

  // Create or get customer if data provided
  if (options?.customer) {
    const customer = await getOrCreateCustomer(options.customer);
    customerId = customer.id;
  }

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'ron',
    description: options?.description,
    metadata,
    customer: customerId,
    receipt_email: options?.receiptEmail || options?.customer?.email,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

// ─── Embedded Checkout Session ───────────────────────────────────────────────
//
// Replaces PaymentIntent + Elements for the customer-facing flow so the
// Stripe Dashboard shows individual line items (base service + each addon +
// delivery + coupon discount) instead of one lump-sum charge. UX stays
// inline via @stripe/react-stripe-js's `EmbeddedCheckout`.

export interface HostedCheckoutOptions {
  customer?: CustomerData;
  receiptEmail?: string;
  description?: string;
  /** Line items built via buildStripeLineItems(). */
  lineItems: Array<{
    price_data: {
      currency: 'ron';
      product_data: {
        name: string;
        description?: string;
        metadata?: Record<string, string>;
      };
      unit_amount: number;
    };
    quantity: 1;
  }>;
  /** Top-level metadata for the Session itself. */
  sessionMetadata: Record<string, string>;
  /** Metadata mirrored onto the PaymentIntent created by the Session. */
  paymentIntentMetadata: Record<string, string>;
  /** URL Stripe redirects to on successful payment.
   *  Use `{CHECKOUT_SESSION_ID}` placeholder to receive the session id. */
  successUrl: string;
  /** URL Stripe redirects to if the customer aborts checkout. */
  cancelUrl: string;
  /** Optional coupon — created on Stripe side as a one-off amount_off. */
  couponDiscount?: {
    code: string;
    amountRon: number;
  };
}

/**
 * Creates a Stripe Checkout Session in **hosted** ui_mode (default Stripe
 * Checkout — customer is redirected to checkout.stripe.com to pay and is
 * returned to `successUrl` afterwards).
 *
 * Switched from embedded → hosted on 2026-05-28 because the embedded
 * variant (iframe inline on /comanda/checkout) showed up cramped with
 * Link/email/cardholder fields all visible at once. Hosted Checkout is
 * the canonical Stripe UX, fully responsive, and matches what most
 * customers expect when paying online.
 */
export async function createHostedCheckoutSession(
  opts: HostedCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  let customerId: string | undefined;
  if (opts.customer) {
    const customer = await getOrCreateCustomer(opts.customer);
    customerId = customer.id;
  }

  // Build the one-off discount when a coupon is present. We create the
  // coupon synchronously so it carries the order's actual discount amount,
  // independent of any percent-off promo configured in the Stripe dashboard.
  let discounts: Array<{ coupon: string }> | undefined;
  if (opts.couponDiscount && opts.couponDiscount.amountRon > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: Math.round(opts.couponDiscount.amountRon * 100),
      currency: 'ron',
      duration: 'once',
      name: `Cupon ${opts.couponDiscount.code}`,
      metadata: { code: opts.couponDiscount.code },
    });
    discounts = [{ coupon: stripeCoupon.id }];
  }

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: opts.lineItems,
    customer: customerId,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    automatic_tax: { enabled: false },
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    locale: 'ro',
    metadata: opts.sessionMetadata,
    payment_intent_data: {
      description: opts.description,
      metadata: opts.paymentIntentMetadata,
      receipt_email: opts.receiptEmail ?? opts.customer?.email,
    },
    ...(discounts ? { discounts } : {}),
  });
}

export async function retrieveCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

// ─── Refunds + extra payments for "Modifică comandă" ─────────────────────────

export interface CreateRefundInput {
  /** The original PaymentIntent id captured for the order. */
  paymentIntentId: string;
  /** Amount to refund in RON (helper converts to bani). */
  amountRon: number;
  /** Optional reason — surfaces on the Stripe dashboard + receipt email. */
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  /** Anything you want carried into the Stripe refund metadata: order ref,
   *  admin email, free-form admin reason, etc. */
  metadata?: Record<string, string>;
}

/**
 * Create a partial or full refund against an existing PaymentIntent. Used
 * by the admin "Modifică" dialog when the new total is lower than what the
 * customer originally paid.
 */
export async function createRefund(input: CreateRefundInput): Promise<Stripe.Refund> {
  const amountBani = Math.round(input.amountRon * 100);
  if (amountBani <= 0) {
    throw new Error('Refund amount must be positive');
  }
  return stripe.refunds.create({
    payment_intent: input.paymentIntentId,
    amount: amountBani,
    reason: input.reason ?? 'requested_by_customer',
    metadata: input.metadata,
  });
}

export interface CreateExtraPaymentInput {
  /** Extra amount the customer owes after modification (RON). */
  amountRon: number;
  /** Order id — used both for metadata + the receipt description. */
  orderId: string;
  /** Friendly order code (e.g. E-260527-A2XJ9) shown in receipt. */
  orderNumber: string;
  /** Human-readable summary of what's being added (used in description). */
  changesDescription: string;
  /** Optional Stripe customer id from the original purchase — reuse so
   *  the customer sees saved cards on the Elements form. */
  stripeCustomerId?: string | null;
  /** Customer email for the receipt fallback. */
  receiptEmail?: string;
  /** Carried into the Stripe metadata so the webhook can apply
   *  additional_paid_amount when this PaymentIntent settles. */
  metadata?: Record<string, string>;
}

/**
 * Create a NEW PaymentIntent for the extra amount owed after an admin
 * modification. The admin copies the client_secret-derived URL and shares
 * it with the customer (email + WhatsApp). The webhook later increments
 * `orders.additional_paid_amount` when this intent settles.
 */
export async function createExtraPaymentIntent(
  input: CreateExtraPaymentInput
): Promise<Stripe.PaymentIntent> {
  const amountBani = Math.round(input.amountRon * 100);
  if (amountBani <= 0) {
    throw new Error('Extra payment amount must be positive');
  }
  const description =
    `Plată suplimentară comanda ${input.orderNumber} — ${input.changesDescription}`.slice(0, 999);

  const metadata: Record<string, string> = {
    purpose: 'extra_charge',
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    ...(input.metadata ?? {}),
  };

  return stripe.paymentIntents.create({
    amount: amountBani,
    currency: 'ron',
    description,
    metadata,
    customer: input.stripeCustomerId ?? undefined,
    receipt_email: input.receiptEmail,
    automatic_payment_methods: { enabled: true },
  });
}
