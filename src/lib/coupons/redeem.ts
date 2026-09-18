/**
 * Consume an order's coupon exactly once, whatever the payment path.
 *
 * `redeem_coupon` (migration 177) locks the order and the coupon, bumps
 * `times_used` and stamps `orders.coupon_redeemed_at`; a second call for the
 * same order is a no-op. Before this only the Stripe webhook counted a use,
 * with a read-then-write, so a single-use welcome coupon paid by bank
 * transfer stayed reusable. Never throws: counting a use must not touch the
 * payment itself.
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type RedeemOutcome = 'redeemed' | 'redeemed_over_cap' | 'already_redeemed' | 'no_coupon' | 'coupon_not_found' | 'order_not_found' | 'error';

export async function redeemCouponForOrder(orderId: string): Promise<RedeemOutcome> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createAdminClient() as any).rpc('redeem_coupon', { p_order_id: orderId });
    if (error) {
      console.error(`[coupon] redeem failed for ${orderId}:`, error.message);
      return 'error';
    }
    const outcome = (data as RedeemOutcome) ?? 'error';
    if (outcome === 'redeemed_over_cap') {
      // Two orders were granted the last use before either paid (eligibility
      // is checked before payment, without a reservation). The discount was
      // already taken; counted truthfully, flagged for the team.
      console.warn(`[coupon] ${orderId}: coupon redeemed past its max_uses (race between two checkouts)`);
    }
    return outcome;
  } catch (err) {
    console.error(`[coupon] redeem threw for ${orderId}:`, err instanceof Error ? err.message : err);
    return 'error';
  }
}
