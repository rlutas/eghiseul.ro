import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getRegistryClient } from '@/lib/registry/client';

// The registry lives in the CENTRAL Supabase project (shared by eghiseul,
// cazierjudiciaronline, ecazier). Local adminClient is kept ONLY for
// enriching eghiseul rows with their order_documents info.
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
    const orderRef = searchParams.get('order_ref');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.min(200, Math.max(1, parseInt(searchParams.get('per_page') || '50', 10)));

    const registryClient: AnyClient = getRegistryClient();
    const adminClient: AnyClient = createAdminClient();

    // Get total count with same filters
    let countQuery = registryClient
      .from('number_registry')
      .select('*', { count: 'exact', head: true })
      .eq('year', year);

    // Build data query
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let dataQuery = registryClient
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

    if (orderRef) {
      countQuery = countQuery.eq('order_ref', orderRef);
      dataQuery = dataQuery.eq('order_ref', orderRef);
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

    const data = dataResult.data || [];

    // Resolve local order UUIDs for EGHISEUL rows (order_ref = friendly_order_id)
    // so the admin UI can keep linking to /admin/orders/<uuid>.
    const eghiseulRefs = [
      ...new Set(
        data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((e: any) => e.platform === 'eghiseul' && e.order_ref)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((e: any) => e.order_ref)
      ),
    ];
    let refToUuid: Record<string, string> = {};
    if (eghiseulRefs.length > 0) {
      const { data: localOrders } = await adminClient
        .from('orders')
        .select('id, friendly_order_id')
        .in('friendly_order_id', eghiseulRefs);
      if (localOrders) {
        refToUuid = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          localOrders.map((o: any) => [o.friendly_order_id, o.id])
        );
      }
    }

    // Enrich EGHISEUL rows with local document info (order_document_ref is a
    // local order_documents.id stored as text). Rows from other platforms
    // (cazierjudiciaronline/ecazier) just display platform + order_ref.
    const docIds = data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((e: any) => e.platform === 'eghiseul' && e.order_document_ref)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => e.order_document_ref);

    let docMap = new Map<string, { s3_key: string; file_name: string; type: string }>();
    if (docIds.length > 0) {
      const uniqueDocIds = [...new Set(docIds)];
      const { data: docs } = await adminClient
        .from('order_documents')
        .select('id, s3_key, file_name, type')
        .in('id', uniqueDocIds);

      if (docs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        docMap = new Map(docs.map((d: any) => [d.id, d]));
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrichedData = data.map((entry: any) => {
      const doc =
        entry.platform === 'eghiseul' && entry.order_document_ref
          ? docMap.get(entry.order_document_ref)
          : null;
      return {
        ...entry,
        // order_ref IS the human-readable id on every platform (friendly_order_id / order_number)
        friendly_order_id: entry.order_ref || null,
        // Local UUID (eghiseul rows only) so the UI can link to /admin/orders/<uuid>
        order_id: entry.platform === 'eghiseul' ? (refToUuid[entry.order_ref] ?? null) : null,
        document_s3_key: doc?.s3_key || null,
        document_file_name: doc?.file_name || null,
        document_type: doc?.type || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedData,
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

    // Optional order link — lets the team allocate an EXTRA delegation for
    // unforeseen services on an existing order (e.g. apostilă adăugată
    // ulterior). service_type distinguishes it from the order's other numbers.
    const validPlatforms = ['eghiseul', 'cazierjudiciaronline', 'ecazier'];
    const platform = body.platform && validPlatforms.includes(body.platform) ? body.platform : null;
    const orderRef = platform && body.order_ref?.trim() ? body.order_ref.trim() : null;

    const registryClient: AnyClient = getRegistryClient();

    // ── Allocate number via CENTRAL RPC ──

    const { data, error } = await registryClient.rpc('allocate_number', {
      p_type: body.type,
      p_platform: platform,
      p_order_ref: orderRef,
      p_client_name: body.client_name.trim(),
      p_client_email: body.client_email || null,
      p_client_cnp: body.client_cnp || null,
      p_client_cui: body.client_cui || null,
      p_service_type: body.service_type || null,
      p_description: body.description || null,
      p_amount: body.amount || null,
      p_source: 'manual',
      p_date: body.date || new Date().toISOString().split('T')[0],
      p_created_by: user.email ?? user.id,
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
