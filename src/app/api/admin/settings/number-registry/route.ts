import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// number_registry table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/number-registry
// List registry entries with filtering and pagination
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
    const type = searchParams.get('type');
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!, 10)
      : new Date().getFullYear();
    const source = searchParams.get('source');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search');
    const orderId = searchParams.get('order_id');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.min(200, Math.max(1, parseInt(searchParams.get('per_page') || '50', 10)));

    const adminClient: AnyClient = createAdminClient();

    // Get total count with same filters
    let countQuery = adminClient
      .from('number_registry')
      .select('*', { count: 'exact', head: true })
      .eq('year', year);

    // Build data query
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let dataQuery = adminClient
      .from('number_registry')
      .select('*')
      .eq('year', year)
      .order('number', { ascending: false })
      .range(from, to);

    // Apply filters to both queries
    if (type && (type === 'contract' || type === 'delegation')) {
      countQuery = countQuery.eq('type', type);
      dataQuery = dataQuery.eq('type', type);
    }

    if (source && ['platform', 'manual', 'reserved', 'voided'].includes(source)) {
      countQuery = countQuery.eq('source', source);
      dataQuery = dataQuery.eq('source', source);
    }

    if (dateFrom) {
      countQuery = countQuery.gte('date', dateFrom);
      dataQuery = dataQuery.gte('date', dateFrom);
    }

    if (dateTo) {
      countQuery = countQuery.lte('date', dateTo);
      dataQuery = dataQuery.lte('date', dateTo);
    }

    if (orderId) {
      countQuery = countQuery.eq('order_id', orderId);
      dataQuery = dataQuery.eq('order_id', orderId);
    }

    if (search) {
      const searchFilter = `client_name.ilike.%${search}%,client_email.ilike.%${search}%,client_cnp.ilike.%${search}%,client_cui.ilike.%${search}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    // Execute both queries
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) {
      console.error('Failed to count number registry entries:', countResult.error);
      return NextResponse.json(
        { success: false, error: 'Eroare la numararea inregistrarilor din registru' },
        { status: 500 }
      );
    }

    if (dataResult.error) {
      console.error('Failed to fetch number registry entries:', dataResult.error);
      return NextResponse.json(
        { success: false, error: 'Eroare la incarcarea inregistrarilor din registru' },
        { status: 500 }
      );
    }

    const total = countResult.count || 0;
    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      success: true,
      data: dataResult.data || [],
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Number registry GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// POST /api/admin/settings/number-registry
// Create manual registry entry
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

    // ── Validation ──

    if (!body.type || (body.type !== 'contract' && body.type !== 'delegation')) {
      return NextResponse.json(
        { success: false, error: 'Tipul trebuie sa fie "contract" sau "delegation"' },
        { status: 400 }
      );
    }

    if (!body.client_name || typeof body.client_name !== 'string' || body.client_name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Numele clientului este obligatoriu' },
        { status: 400 }
      );
    }

    const adminClient: AnyClient = createAdminClient();

    // ── Allocate number via RPC ──

    const { data, error } = await (adminClient as AnyClient).rpc('allocate_number', {
      p_type: body.type,
      p_client_name: body.client_name.trim(),
      p_client_email: body.client_email || null,
      p_client_cnp: body.client_cnp || null,
      p_client_cui: body.client_cui || null,
      p_service_type: body.service_type || null,
      p_description: body.description || null,
      p_amount: body.amount || null,
      p_source: 'manual',
      p_date: body.date || new Date().toISOString().split('T')[0],
      p_created_by: user.id,
    });

    if (error) {
      console.error('Failed to allocate number:', error);

      // P0002 = no active range available
      if (error.code === 'P0002') {
        return NextResponse.json(
          { success: false, error: 'Nu exista un interval activ de numere pentru acest tip. Creati un interval in setarile de numere.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Eroare la alocarea numarului din registru' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Number registry POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
