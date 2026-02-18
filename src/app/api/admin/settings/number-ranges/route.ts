import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// number_ranges table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/number-ranges
// List all number ranges with computed stats
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!, 10)
      : new Date().getFullYear();
    const type = searchParams.get('type'); // 'contract' | 'delegation' | null
    const status = searchParams.get('status'); // 'active' | 'exhausted' | 'archived' | null

    const adminClient: AnyClient = createAdminClient();

    // Build query
    let query = adminClient
      .from('number_ranges')
      .select('*')
      .eq('year', year)
      .order('type', { ascending: true })
      .order('range_start', { ascending: true });

    if (type && (type === 'contract' || type === 'delegation')) {
      query = query.eq('type', type);
    }

    if (status && ['active', 'exhausted', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch number ranges:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la incarcarea intervalelor de numere' },
        { status: 500 }
      );
    }

    // Compute stats for each range
    const rangesWithStats = (data || []).map((range: AnyClient) => {
      const total = range.range_end - range.range_start + 1;
      const used = range.next_number - range.range_start;
      const available = Math.max(0, range.range_end - range.next_number + 1);
      const usage_percent = Math.round((used / total) * 1000) / 10;

      return {
        ...range,
        total,
        used,
        available,
        usage_percent,
      };
    });

    return NextResponse.json({ success: true, data: rangesWithStats });
  } catch (error) {
    console.error('Number ranges GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// POST /api/admin/settings/number-ranges
// Create a new number range
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
    const { type, year, range_start, range_end, series, notes } = body;

    // ── Validation ──

    if (!type || (type !== 'contract' && type !== 'delegation')) {
      return NextResponse.json(
        { success: false, error: 'Tipul trebuie sa fie "contract" sau "delegation"' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(range_start) || range_start <= 0) {
      return NextResponse.json(
        { success: false, error: 'Numarul de start trebuie sa fie un numar intreg pozitiv' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(range_end) || range_end < range_start) {
      return NextResponse.json(
        { success: false, error: 'Numarul de sfarsit trebuie sa fie mai mare sau egal cu numarul de start' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < currentYear - 1) {
      return NextResponse.json(
        { success: false, error: `Anul trebuie sa fie cel putin ${currentYear - 1}` },
        { status: 400 }
      );
    }

    if (type === 'delegation' && (!series || typeof series !== 'string' || series.trim() === '')) {
      return NextResponse.json(
        { success: false, error: 'Seria este obligatorie pentru imputerniciri' },
        { status: 400 }
      );
    }

    const adminClient: AnyClient = createAdminClient();

    // ── Check for overlapping ranges ──

    const { data: existingRanges, error: overlapError } = await adminClient
      .from('number_ranges')
      .select('id, range_start, range_end')
      .eq('type', type)
      .eq('year', year)
      .neq('status', 'archived');

    if (overlapError) {
      console.error('Failed to check overlapping ranges:', overlapError);
      return NextResponse.json(
        { success: false, error: 'Eroare la verificarea intervalelor existente' },
        { status: 500 }
      );
    }

    const overlapping = (existingRanges || []).find(
      (existing: AnyClient) =>
        range_start <= existing.range_end && range_end >= existing.range_start
    );

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          error: `Intervalul se suprapune cu un interval existent (${overlapping.range_start} - ${overlapping.range_end})`,
        },
        { status: 400 }
      );
    }

    // ── Insert ──

    const { data: insertedRange, error: insertError } = await adminClient
      .from('number_ranges')
      .insert({
        type,
        year,
        range_start,
        range_end,
        next_number: range_start,
        series: type === 'delegation' ? (series?.trim() || null) : null,
        status: 'active',
        notes: notes?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create number range:', insertError);
      return NextResponse.json(
        { success: false, error: 'Eroare la crearea intervalului de numere' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: insertedRange }, { status: 201 });
  } catch (error) {
    console.error('Number ranges POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
