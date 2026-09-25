/**
 * The loyalty coupon: minted by the warm-up campaign for contacts who used us
 * for two or more services (platform orders or requests on the old site).
 *
 * Raul, 25.09.2026: loyal customers first, and „pentru că e client fidel
 * primește cupon". One coupon per email sent, 10%, 30 days, single use. It is
 * not bound to an account (most contacts have none) — `max_uses: 1` is the
 * limit. `system_kind = 'loyalty'` (migration 188) keeps it apart from the
 * recovery cron's cleanup and labels it in /admin/coupons.
 */

import { generateCouponCode } from '@/lib/coupons/recovery-code';

export const LOYALTY_DISCOUNT_PERCENT = 10;
export const LOYALTY_VALIDITY_DAYS = 30;
const PREFIX = 'FIDEL-';

export interface LoyaltyCoupon {
  code: string;
  discountPercent: number;
  validUntil: string;
}

/** Two or more platform orders, or two or more distinct services requested. */
export function isLoyalContact(contact: { orders_count?: number | null; services?: string[] | null }): boolean {
  return (contact.orders_count ?? 0) >= 2 || (contact.services ?? []).length >= 2;
}

/** Creates the coupon; `null` on failure (the email then goes out without it). */
export async function mintLoyaltyCoupon(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  contactId: string,
  now = new Date(),
): Promise<LoyaltyCoupon | null> {
  const validUntil = new Date(now.getTime() + LOYALTY_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCouponCode(PREFIX);
    const { error } = await admin.from('coupons').insert({
      code,
      description: `Cupon client fidel (email de reactivare), contact ${contactId}`,
      discount_type: 'percentage',
      discount_value: LOYALTY_DISCOUNT_PERCENT,
      min_amount: 0,
      max_uses: 1,
      valid_from: now.toISOString(),
      valid_until: validUntil,
      is_active: true,
      system_kind: 'loyalty',
    });
    if (!error) return { code, discountPercent: LOYALTY_DISCOUNT_PERCENT, validUntil };
    // 23505 = code collision, mint again; anything else is not retryable.
    if (!String(error.code ?? '').startsWith('23505')) {
      console.error('[loyalty-coupon] insert failed:', error.message);
      return null;
    }
  }
  return null;
}
