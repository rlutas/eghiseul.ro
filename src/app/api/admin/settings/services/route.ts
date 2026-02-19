import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/services - List all services + options
// ──────────────────────────────────────────────────────────────

export async function GET() {
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

    const adminClient = createAdminClient();

    const { data: services, error } = await adminClient
      .from('services')
      .select(`
        id,
        name,
        slug,
        code,
        category,
        base_price,
        description,
        short_description,
        is_active,
        is_featured,
        estimated_days,
        urgent_available,
        urgent_days,
        requires_kyc,
        display_order,
        processing_config,
        created_at,
        updated_at,
        service_options (
          id,
          code,
          name,
          description,
          price,
          is_active,
          is_required,
          display_order
        )
      `)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch services:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la incarcarea serviciilor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: services || [] });
  } catch (error) {
    console.error('Services GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/admin/settings/services - Update a service
// Body: { id: string, updates: { base_price?, description?, is_active?, ... } }
// ──────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
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
    const { id, updates } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID-ul serviciului este obligatoriu' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Datele de actualizare sunt obligatorii' },
        { status: 400 }
      );
    }

    // Whitelist allowed fields
    const ALLOWED_FIELDS = [
      'base_price',
      'description',
      'short_description',
      'is_active',
      'is_featured',
      'estimated_days',
      'urgent_available',
      'urgent_days',
      'display_order',
      'processing_config',
    ];

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_FIELDS.includes(key)) {
        sanitized[key] = value;
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Niciun camp valid de actualizat' },
        { status: 400 }
      );
    }

    // Add updated_at
    sanitized.updated_at = new Date().toISOString();

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('services')
      .update(sanitized)
      .eq('id', id)
      .select('id, name, is_active, base_price')
      .single();

    if (error) {
      console.error('Failed to update service:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la actualizarea serviciului' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Services PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
