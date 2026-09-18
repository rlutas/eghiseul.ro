/**
 * The welcome coupon: one per account, minted the first time the account page
 * is opened, valid for a month, single use, bound to that account.
 *
 * Raul, 18.09.2026: „clienții care își fac cont să primească un cupon, mai
 * ales dacă aplică de pe cont". The account shows the code, and every service
 * link inside the account carries `?coupon=<code>`, which the wizard keeps
 * across steps and applies on the review step — so ordering from the account
 * is where the discount lands without typing anything.
 *
 * Bound to the account through `coupons.owner_user_id` (migration 174): the
 * apply route refuses it on an order that is not the owner's. `system_kind =
 * 'welcome'` keeps it apart from recovery and phone coupons in /admin/coupons
 * and out of the recovery cron's cleanup.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { generateCouponCode } from '@/lib/coupons/recovery-code';

export const WELCOME_DISCOUNT_PERCENT = 10;
export const WELCOME_VALIDITY_DAYS = 30;
const PREFIX = 'BUNVENIT-';

export interface WelcomeCoupon {
  code: string;
  discountPercent: number;
  validUntil: string;
}

interface WelcomeCouponRow {
  code: string;
  discount_value: number;
  valid_until: string | null;
  is_active: boolean;
  max_uses: number | null;
  times_used: number;
}

/** Still worth showing: active, unused, not expired. */
export function welcomeCouponIsUsable(row: WelcomeCouponRow | null | undefined, now = new Date()): boolean {
  if (!row || !row.is_active) return false;
  if (row.max_uses !== null && row.times_used >= row.max_uses) return false;
  if (row.valid_until && new Date(row.valid_until) < now) return false;
  return true;
}

/**
 * The account's welcome coupon, created on first call. `null` when the account
 * already used or outlived its coupon — there is exactly one per account, and
 * it is not re-issued.
 */
export async function ensureWelcomeCouponForUser(userId: string): Promise<WelcomeCoupon | null> {
  try {
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error } = await (admin as any)
      .from('coupons')
      .select('code, discount_value, valid_until, is_active, max_uses, times_used')
      .eq('owner_user_id', userId)
      .eq('system_kind', 'welcome')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('[welcome-coupon] lookup failed:', error.message);
      return null;
    }
    if (existing) {
      const row = existing as WelcomeCouponRow;
      return welcomeCouponIsUsable(row)
        ? { code: row.code, discountPercent: Number(row.discount_value), validUntil: row.valid_until as string }
        : null;
    }

    const now = Date.now();
    const validUntil = new Date(now + WELCOME_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    let code = generateCouponCode(PREFIX);
    for (let attempt = 0; attempt < 2; attempt++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (admin as any).from('coupons').insert({
        code,
        description: 'Cupon de bun-venit, creat automat la primul acces în cont',
        discount_type: 'percentage',
        discount_value: WELCOME_DISCOUNT_PERCENT,
        min_amount: 0,
        max_uses: 1,
        valid_from: new Date(now).toISOString(),
        valid_until: validUntil,
        is_active: true,
        system_kind: 'welcome',
        owner_user_id: userId,
      });
      if (!insertError) {
        return { code, discountPercent: WELCOME_DISCOUNT_PERCENT, validUntil };
      }
      // 23505 = unique_violation on the code: mint another and try once more.
      if (!String(insertError.code ?? '').startsWith('23505')) {
        console.error('[welcome-coupon] insert failed:', insertError.message);
        return null;
      }
      code = generateCouponCode(PREFIX);
    }
    return null;
  } catch (err) {
    console.error('[welcome-coupon] failed (non-fatal):', err instanceof Error ? err.message : err);
    return null;
  }
}
