/**
 * Server-side order pricing, applied at /submit before the customer pays.
 *
 * The draft stores base/options/delivery/discount/total exactly as the wizard
 * computed them, and the draft payload is client-writable. Stripe line items
 * and the bank-transfer amount are built from these stored values, so they
 * must be recomputed from trusted sources here: the service config, the
 * `service_options` rows, the translation price list and the delivery floor.
 * Mirrors `priceBreakdown` in `providers/modular-wizard-provider.tsx`.
 */
import { hasForeignDrivingLicense } from '@/lib/orders/order-estimate';

/** Minimum domestic delivery price (VAT incl.) — same floor as the delivery step. */
export const MIN_DOMESTIC_DELIVERY_RON = 25;
const DOMESTIC_COURIERS = new Set(['fancourier', 'sameday']);

export interface StoredOption {
  option_id?: string | null;
  code?: string | null;
  quantity?: number | null;
  price_modifier?: number | null;
  metadata?: { language?: string | null; [k: string]: unknown } | null;
  [k: string]: unknown;
}

export interface OptionRow {
  id: string;
  code: string | null;
  price: number;
  max_quantity: number | null;
}

export interface PricingInput {
  serviceBasePrice: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verificationConfig: any;
  customerData: unknown;
  selectedOptions: StoredOption[];
  /** Every option row the order may reference (own service + bundled ones). */
  optionsById: Map<string, OptionRow>;
  /** The order's own service options, by code (fallback when option_id is missing). */
  ownOptionsByCode: Map<string, OptionRow>;
  translationPrices: Map<string, number>;
  translationApostilaExtras: Map<string, number>;
  deliveryMethod: { type?: string | null; provider?: string | null } | null;
  deliveryPrice: number;
  /** The `coupons` row for the order's code (active only), or null. */
  coupon: CouponRow | null;
  orderUserId: string | null;
  now?: Date;
}

export interface CouponRow {
  discount_type: string;
  discount_value: number;
  owner_user_id?: string | null;
  max_uses?: number | null;
  times_used?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  min_amount?: number | null;
}

/** Same rules as the coupon re-validation in /api/orders/[id]/payment. */
export function couponDiscount(
  coupon: CouponRow | null,
  subtotal: number,
  orderUserId: string | null,
  now: Date = new Date()
): number {
  if (!coupon) return 0;
  const valid =
    (!coupon.owner_user_id || coupon.owner_user_id === orderUserId) &&
    (coupon.max_uses == null || num(coupon.times_used) < coupon.max_uses) &&
    (!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
    (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
    subtotal >= num(coupon.min_amount);
  if (!valid) return 0;
  const raw =
    coupon.discount_type === 'percentage'
      ? (subtotal * num(coupon.discount_value)) / 100
      : num(coupon.discount_value);
  return round2(Math.min(raw, subtotal));
}

export interface PricingResult {
  basePrice: number;
  optionsPrice: number;
  deliveryPrice: number;
  discountAmount: number;
  totalPrice: number;
  selectedOptions: StoredOption[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

export function computeServerPricing(input: PricingInput): PricingResult {
  const cfg = input.verificationConfig ?? {};

  // Base: foreign driving licence tariff, then constatator document type, then service.
  const fl = cfg.vehicleVerification?.foreignLicense;
  const cd = (input.customerData ?? {}) as { constatator?: { documentType?: string } };
  const docTypePrice = (cfg.constatator?.documentTypes as Array<{ value?: string; price?: number }> | undefined)
    ?.find((t) => t.value === cd.constatator?.documentType)?.price;
  const basePrice =
    fl?.enabled && typeof fl.price === 'number' && fl.price > 0 && hasForeignDrivingLicense(input.customerData)
      ? fl.price
      : typeof docTypePrice === 'number'
        ? docTypePrice
        : num(input.serviceBasePrice);

  // Options: unit price from the trusted row; translation follows the language list.
  const hasHaga = input.selectedOptions.some((o) => o?.code === 'apostila_haga');
  const selectedOptions = input.selectedOptions.map((opt) => {
    const row =
      (opt.option_id ? input.optionsById.get(opt.option_id) : undefined) ??
      (opt.code ? input.ownOptionsByCode.get(opt.code) : undefined);
    let unit = row ? num(row.price) : 0;
    if (opt.code === 'traducere') {
      const lang = opt.metadata?.language ?? '';
      const langPrice = lang ? input.translationPrices.get(lang) : undefined;
      if (langPrice != null) {
        unit = langPrice + (hasHaga ? input.translationApostilaExtras.get(lang) ?? 0 : 0);
      }
    }
    let quantity = Math.max(1, Math.floor(num(opt.quantity) || 1));
    if (row?.max_quantity && row.max_quantity > 0) quantity = Math.min(quantity, row.max_quantity);
    return { ...opt, quantity, price_modifier: round2(unit) };
  });
  const optionsPrice = selectedOptions.reduce((s, o) => s + num(o.price_modifier) * num(o.quantity), 0);

  // Delivery: domestic couriers never go under the floor the wizard applies.
  let deliveryPrice = Math.max(0, num(input.deliveryPrice));
  const provider = input.deliveryMethod?.provider ?? '';
  if (provider && DOMESTIC_COURIERS.has(provider)) {
    deliveryPrice = Math.max(deliveryPrice, MIN_DOMESTIC_DELIVERY_RON);
  }

  // Discount only from a valid coupon, computed here (bank transfer charges
  // total_price as stored; /payment re-validates again for Stripe).
  const subtotal = basePrice + optionsPrice + deliveryPrice;
  const discountAmount = couponDiscount(input.coupon, subtotal, input.orderUserId, input.now);

  return {
    basePrice: round2(basePrice),
    optionsPrice: round2(optionsPrice),
    deliveryPrice: round2(deliveryPrice),
    discountAmount: round2(discountAmount),
    totalPrice: round2(Math.max(0, subtotal - discountAmount)),
    selectedOptions,
  };
}
