// Pure builders for Stripe Checkout Session line_items + discounts.
// Kept separate so we can unit-test the math + grouping without spinning
// up the Stripe SDK or DB. The route handler wires this to the actual
// stripe.checkout.sessions.create() call.

export interface OrderLineSource {
  /** Service display name (e.g. "Cazier Judiciar"). */
  serviceName: string;
  /** Base service price in RON. */
  basePrice: number;
  /** Normalized options (addons + bundled secondary services). */
  options: Array<{
    name: string;
    code?: string;
    /** Total RON for this row (price_modifier × quantity). */
    total: number;
    /** Optional — passed through to Stripe metadata. */
    optionId?: string;
  }>;
  /** Delivery price + label. Skip when free. */
  delivery: {
    label: string;
    priceRon: number;
  } | null;
}

export interface StripeLineItem {
  /** Always shown on the dashboard checkout summary. */
  price_data: {
    currency: 'ron';
    product_data: {
      name: string;
      // Stripe enforces 5000 max — we keep it short.
      description?: string;
      metadata?: Record<string, string>;
    };
    unit_amount: number; // bani
  };
  quantity: 1;
}

const MAX_LINE_ITEM_NAME = 250; // Stripe product_data.name cap
const MAX_LINE_ITEMS = 25; // Stripe checkout.sessions caps at 100, we stay well under

export function buildStripeLineItems(input: OrderLineSource): StripeLineItem[] {
  const items: StripeLineItem[] = [];

  // Base service is always the first line — Stripe shows it on top.
  items.push({
    price_data: {
      currency: 'ron',
      product_data: {
        name: input.serviceName.slice(0, MAX_LINE_ITEM_NAME),
      },
      unit_amount: ronToBani(input.basePrice),
    },
    quantity: 1,
  });

  for (const opt of input.options) {
    if (items.length >= MAX_LINE_ITEMS) break;
    // Skip free options — they pollute the summary with "0.00 RON" rows.
    if (opt.total <= 0) continue;
    items.push({
      price_data: {
        currency: 'ron',
        product_data: {
          name: opt.name.slice(0, MAX_LINE_ITEM_NAME),
          ...(opt.code
            ? {
                metadata: {
                  code: opt.code.slice(0, 100),
                  ...(opt.optionId ? { option_id: opt.optionId.slice(0, 100) } : {}),
                },
              }
            : {}),
        },
        unit_amount: ronToBani(opt.total),
      },
      quantity: 1,
    });
  }

  if (input.delivery && input.delivery.priceRon > 0 && items.length < MAX_LINE_ITEMS) {
    items.push({
      price_data: {
        currency: 'ron',
        product_data: {
          name: `Livrare: ${input.delivery.label}`.slice(0, MAX_LINE_ITEM_NAME),
        },
        unit_amount: ronToBani(input.delivery.priceRon),
      },
      quantity: 1,
    });
  }

  return items;
}

function ronToBani(ron: number): number {
  return Math.round(ron * 100);
}

// Build a short, human-readable description for the PaymentIntent that
// Checkout Session auto-creates. Kept under Stripe's 1000-char cap.
export function buildPaymentIntentDescription(input: {
  serviceName: string;
  orderNumber: string;
  options: Array<{ name: string; total: number }>;
  deliveryLabel?: string;
  deliveryPriceRon?: number;
  couponCode?: string;
  discountAmount?: number;
}): string {
  const parts: string[] = [`${input.serviceName} (${input.orderNumber})`];
  for (const opt of input.options) {
    if (opt.total <= 0) continue;
    parts.push(`+ ${opt.name}: ${opt.total.toFixed(2)} RON`);
  }
  if (input.deliveryLabel && input.deliveryPriceRon && input.deliveryPriceRon > 0) {
    parts.push(`+ Livrare ${input.deliveryLabel}: ${input.deliveryPriceRon.toFixed(2)} RON`);
  }
  if (input.couponCode && input.discountAmount && input.discountAmount > 0) {
    parts.push(`Cupon ${input.couponCode}: −${input.discountAmount.toFixed(2)} RON`);
  }
  return parts.join(' | ').slice(0, 999);
}

// Tightly-scoped helpers we want to test independently.
export const __testing = { ronToBani, MAX_LINE_ITEMS };
