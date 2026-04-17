import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';

// coupons table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_uses: number | null;
  times_used: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

const bodySchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.number().min(0),
});

// ──────────────────────────────────────────────────────────────
// POST /api/coupons/validate
// Public endpoint: validates a coupon against a subtotal and returns
// the computed discount + final amount.
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting (per IP, 30 req/min)
  const ip = getClientIP(request);
  const rate = checkRateLimit(`coupons:validate:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 30,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Prea multe incercari. Te rugam sa astepti.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rate.resetIn / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corp invalid' },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Cod sau subtotal invalid' },
      { status: 400 }
    );
  }

  const { code, subtotal } = parsed.data;
  const normalizedCode = code.toUpperCase();

  try {
    const adminClient: AnyClient = createAdminClient();

    const { data, error } = await adminClient
      .from('coupons')
      .select('*')
      .ilike('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Coupon validate lookup error:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la validare' },
        { status: 500 }
      );
    }

    const coupon = data as CouponRow | null;

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Cupon invalid' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check time window
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

    // Usage limit
    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json(
        { success: false, error: 'Cuponul a atins limita de utilizari' },
        { status: 400 }
      );
    }

    // Minimum subtotal
    if (subtotal < Number(coupon.min_amount || 0)) {
      return NextResponse.json(
        {
          success: false,
          error: `Suma minima pentru acest cupon este ${Number(coupon.min_amount).toFixed(2)} RON`,
        },
        { status: 400 }
      );
    }

    // Compute discount (RON)
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * Number(coupon.discount_value)) / 100;
    } else {
      discount = Number(coupon.discount_value);
    }

    // Cap at subtotal (never negative total)
    discount = Math.min(discount, subtotal);
    // Round to 2 decimals (RON)
    discount = Math.round(discount * 100) / 100;

    const final = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: Number(coupon.discount_value),
        },
        discount,
        final,
      },
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare interna' },
      { status: 500 }
    );
  }
}
