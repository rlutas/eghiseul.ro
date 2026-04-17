import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// coupons table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

const updateCouponSchema = z.object({
  code: z.string().trim().min(1).max(50).transform((v) => v.toUpperCase()).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().positive().optional(),
  min_amount: z.number().min(0).optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ──────────────────────────────────────────────────────────────
// GET /api/admin/coupons/[id]
// ──────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const adminClient: AnyClient = createAdminClient();
    const { data, error } = await adminClient
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Cuponul nu a fost gasit' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { coupon: data } });
  } catch (error) {
    console.error('Coupon GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/admin/coupons/[id]
// ──────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Date invalide',
        },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nimic de actualizat' },
        { status: 400 }
      );
    }

    // Extra percentage bound check
    if (updates.discount_type === 'percentage' && updates.discount_value !== undefined) {
      if (updates.discount_value < 1 || updates.discount_value > 100) {
        return NextResponse.json(
          { success: false, error: 'Procentul trebuie sa fie intre 1 si 100' },
          { status: 400 }
        );
      }
    }

    const adminClient: AnyClient = createAdminClient();
    const { data, error } = await adminClient
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Acest cod de cupon exista deja' },
          { status: 400 }
        );
      }
      console.error('Coupon update error:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la actualizare' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Cuponul nu a fost gasit' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { coupon: data } });
  } catch (error) {
    console.error('Coupon PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// DELETE /api/admin/coupons/[id]
// ──────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const adminClient: AnyClient = createAdminClient();

    // Hard delete - historical orders keep coupon_code as text, so no FK cascade.
    const { error } = await adminClient
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Coupon delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la stergere' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupon DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
