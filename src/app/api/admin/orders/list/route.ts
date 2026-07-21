import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission, getUserPermissions } from '@/lib/admin/permissions';
import { parseTestFilter, resolveStatusFilter } from '@/lib/admin/orders-tabs';
import { NO_LAWYER_SERVICE_SLUGS } from '@/lib/documents/no-lawyer-services';
import { applyQuickOrStage } from '@/lib/admin/order-quick-filters';

/**
 * GET /api/admin/orders/list - List all orders (for admin)
 * Query params:
 * - status: filter by status (default: all non-draft)
 * - search: search by order number, email, name, AWB
 * - page: page number (0-indexed, default 0)
 * - limit: number of results per page (default 25)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
    // Rolul decide scoparea listei: avocatul vede DOAR comenzile serviciilor
    // cu avocat (cele fără avocat — constatator/CF/cadastru — nu o privesc),
    // același principiu ca scoparea colaboratorului pe serviciile asignate.
    const { role: userRole } = await getUserPermissions(user.id);

    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const service = searchParams.get('service') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    // Sandbox/test filter (parity with cazierjudiciaronline.com):
    //   ?test=only → only test orders (Stripe test-mode)
    //   ?test=all  → both test + live
    //   anything else (default = "hide") → live only (is_test=false)
    const testFilter = parseTestFilter(searchParams.get('test'));

    // Build query
    let query = adminClient
      .from('orders')
      .select(
        `
        id,
        friendly_order_id,
        order_number,
        status,
        current_step,
        total_price,
        payment_status,
        payment_method,
        courier_provider,
        courier_service,
        delivery_tracking_number,
        delivery_method,
        is_test,
        customer_data,
        selected_options,
        created_at,
        estimated_completion_date,
        invoice_number,
        invoice_url,
        coupon_code,
        admin_notes,
        services(name, slug)
      `,
        { count: 'estimated' }
      )
      // paid_at first: o comandă creată ca draft ieri și plătită azi trebuie
      // să apară în top AZI (echipa se uită la capul listei) — sortarea pe
      // created_at o îngropa printre comenzile de ieri (caz real E-260714-773QA).
      // Neplătitele (paid_at null) cad pe created_at.
      .order('paid_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Apply status filter via the shared resolver — supports tab values
    // (paid/processing/shipped/completed/abandoned) plus the all + debug
    // statuses (draft/pending/etc).
    const statusShape = resolveStatusFilter(status);
    if (statusShape.eq) {
      query = query.eq('status', statusShape.eq);
    } else if (statusShape.in) {
      query = query.filter('status', 'in', `(${statusShape.in.map((s) => `"${s}"`).join(',')})`);
    } else if (statusShape.notIn) {
      query = query.not('status', 'in', `(${statusShape.notIn.map((s) => `"${s}"`).join(',')})`);
    }

    // Sandbox/test filter — three-state chip group: hide | only | all.
    if (testFilter === 'only') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).eq('is_test', true);
    } else if (testFilter === 'hide') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).eq('is_test', false);
    }
    // 'all' → no filter

    // Service filter — exact match on service_id (UUID). The UI passes the
    // service id from the services dropdown.
    if (service) {
      query = query.eq('service_id', service);
    }

    // Scopare avocat: exclude serviciile FĂRĂ avocat (nu o privesc).
    if (userRole === 'avocat') {
      const { data: noLawyerServices } = await adminClient
        .from('services')
        .select('id')
        .in('slug', [...NO_LAWYER_SERVICE_SLUGS]);
      const excludeIds = (noLawyerServices ?? []).map((s) => s.id);
      if (excludeIds.length > 0) {
        query = query.not('service_id', 'in', `(${excludeIds.join(',')})`);
      }
    }

    // Quick-filter / workflow-stage chip (overdue | deadline_soon | with_coupon
    // | documents_generated | submitted | received | ready).
    const quick = searchParams.get('quick') || '';
    if (quick) {
      query = applyQuickOrStage(query, quick);
    }

    // Apply search filter (server-side). Parity with sister: also match client
    // name (first/last), phone and billing name — the team looks people up by name.
    if (search) {
      // PostgREST uses -> for JSON traversal, ->> for text extraction.
      query = query.or(
        [
          `order_number.ilike.%${search}%`,
          `friendly_order_id.ilike.%${search}%`,
          `delivery_tracking_number.ilike.%${search}%`,
          `customer_data->contact->>email.ilike.%${search}%`,
          `customer_data->contact->>phone.ilike.%${search}%`,
          `customer_data->personal->>firstName.ilike.%${search}%`,
          `customer_data->personal->>lastName.ilike.%${search}%`,
          `customer_data->billing->>name.ilike.%${search}%`,
        ].join(',')
      );
    }

    const { data: orders, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Team-note counts per order (sister parity: StickyNote icon + count in
    // the list). Counts human-authored order_history notes (non-empty, not
    // system-*) for just the current page of orders — one cheap query.
    const noteCounts: Record<string, number> = {};
    const orderRows = (orders || []) as unknown as Array<Record<string, unknown> & { id: string }>;
    const ids = orderRows.map((o) => o.id);
    if (ids.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: noteRows } = await (adminClient as any)
        .from('order_history')
        .select('order_id, changed_by, notes')
        .in('order_id', ids)
        .eq('event_type', 'note_added')
        .not('notes', 'is', null)
        .not('changed_by', 'is', null);
      for (const r of (noteRows || []) as Array<{ order_id: string; changed_by: string | null; notes: string | null }>) {
        // Team-added notes only: real author (auto-generated rows have
        // changed_by NULL) and not a system job.
        const by = (r.changed_by || '').toLowerCase();
        if (!by || by.startsWith('system')) continue;
        if (!(r.notes || '').trim()) continue;
        noteCounts[r.order_id] = (noteCounts[r.order_id] || 0) + 1;
      }
    }

    // Nr. contract asistență + delegație per comandă (order_documents) —
    // afișate sub numărul comenzii, paritate cu admin-ul CJO.
    const barouByOrder: Record<string, { contract: string | null; delegation: string | null }> = {};
    if (orderRows.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: docNumbers } = await (adminClient as any)
        .from('order_documents')
        .select('order_id, type, document_number')
        .in('order_id', orderRows.map((o) => o.id))
        .in('type', ['contract_asistenta', 'imputernicire'])
        .not('document_number', 'is', null);
      for (const d of (docNumbers ?? []) as { order_id: string; type: string; document_number: string }[]) {
        const entry = (barouByOrder[d.order_id] ??= { contract: null, delegation: null });
        if (d.type === 'contract_asistenta') entry.contract = d.document_number;
        else entry.delegation = d.document_number;
      }
    }

    return NextResponse.json({
      success: true,
      data: orderRows.map((o) => ({
        ...o,
        note_count: noteCounts[o.id] || 0,
        barou: barouByOrder[o.id] ?? null,
      })),
      total: count || 0,
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
