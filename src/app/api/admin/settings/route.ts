import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// admin_settings table exists in DB (migration 023) but is not yet
// in the generated Supabase types. We cast through `any` for now.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings - Fetch all admin settings
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

    const adminClient: AnyClient = createAdminClient();

    const { data, error } = await adminClient
      .from('admin_settings')
      .select('key, value, updated_at');

    if (error) {
      console.error('Failed to fetch settings:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la incarcarea setarilor' },
        { status: 500 }
      );
    }

    // Transform array of { key, value } into a flat object
    const settings: Record<string, unknown> = {};
    for (const row of (data || []) as { key: string; value: unknown }[]) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/admin/settings - Update a setting
// Body: { key: string, value: any }
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
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Cheia setarii este obligatorie' },
        { status: 400 }
      );
    }

    // Allowed keys to prevent arbitrary data
    const ALLOWED_KEYS = [
      'sender_address',
      'bank_details',
      'maintenance_mode',
      'notifications',
      'company_data',
      'lawyer_data',
      'document_counters',
      'document_templates',
    ];

    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json(
        { success: false, error: `Cheie invalida: ${key}` },
        { status: 400 }
      );
    }

    const adminClient: AnyClient = createAdminClient();

    // Upsert the setting
    const { error } = await adminClient
      .from('admin_settings')
      .upsert(
        {
          key,
          value,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Failed to update setting:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la salvarea setarii' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
