import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// coupons table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Codul este obligatoriu')
    .max(50, 'Codul este prea lung')
    .transform((v) => v.toUpperCase()),
  description: z.string().trim().max(2000).optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive('Valoarea trebuie sa fie pozitiva'),
  min_amount: z.number().min(0).default(0),
  max_uses: z.number().int().positive().optional().nullable(),
  valid_from: z.string().datetime().optional().nullable(),
  valid_until: z.string().datetime().optional().nullable(),
  is_active: z.boolean().default(true),
});

// ──────────────────────────────────────────────────────────────
// GET /api/admin/coupons
// List coupons with pagination and search
// ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'settings.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    const adminClient: AnyClient = createAdminClient();
    let query = adminClient
      .from('coupons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('code', `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Failed to fetch coupons:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la incarcarea cupoanelor' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        coupons: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// POST /api/admin/coupons
// Create a new coupon
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'settings.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Date invalide',
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // Extra validation for percentage: must be integer 1-100
    if (payload.discount_type === 'percentage' && (payload.discount_value < 1 || payload.discount_value > 100)) {
      return NextResponse.json(
        { success: false, error: 'Procentul trebuie sa fie intre 1 si 100' },
        { status: 400 }
      );
    }

    const adminClient: AnyClient = createAdminClient();
    const { data, error } = await adminClient
      .from('coupons')
      .insert({
        code: payload.code,
        description: payload.description ?? null,
        discount_type: payload.discount_type,
        discount_value: payload.discount_value,
        min_amount: payload.min_amount,
        max_uses: payload.max_uses ?? null,
        valid_from: payload.valid_from ?? null,
        valid_until: payload.valid_until ?? null,
        is_active: payload.is_active,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // 23505 = unique_violation
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Acest cod de cupon exista deja' },
          { status: 400 }
        );
      }
      console.error('Coupon creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la crearea cuponului' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { coupon: data } }, { status: 201 });
  } catch (error) {
    console.error('Coupon POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
