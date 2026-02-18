import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// number_registry table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/number-registry/export
// Export registry entries as CSV
// ──────────────────────────────────────────────────────────────

// Mapping helpers
const SOURCE_LABELS: Record<string, string> = {
  platform: 'Platforma',
  manual: 'Manual',
  reserved: 'Rezervat',
  voided: 'Anulat',
};

const TYPE_LABELS: Record<string, string> = {
  contract: 'Contract',
  delegation: 'Delegatie',
};

function formatDateRO(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape fields containing commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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

    // Parse query params (same filters as list endpoint, minus pagination)
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

    const adminClient: AnyClient = createAdminClient();

    // Build query - fetch ALL matching entries (no pagination)
    let query = adminClient
      .from('number_registry')
      .select('*')
      .eq('year', year)
      .order('number', { ascending: true });

    if (type && (type === 'contract' || type === 'delegation')) {
      query = query.eq('type', type);
    }

    if (source && ['platform', 'manual', 'reserved', 'voided'].includes(source)) {
      query = query.eq('source', source);
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    if (search) {
      const searchFilter = `client_name.ilike.%${search}%,client_email.ilike.%${search}%,client_cnp.ilike.%${search}%,client_cui.ilike.%${search}%`;
      query = query.or(searchFilter);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('Failed to fetch registry entries for export:', error);
      return NextResponse.json(
        { success: false, error: 'Eroare la exportul registrului de numere' },
        { status: 500 }
      );
    }

    // Enrich entries with friendly_order_id from orders table
    const orderIds = (entries || [])
      .filter((e: AnyClient) => e.order_id)
      .map((e: AnyClient) => e.order_id);

    let orderMap: Record<string, string> = {};
    if (orderIds.length > 0) {
      const { data: orders } = await adminClient
        .from('orders')
        .select('id, friendly_order_id')
        .in('id', orderIds);
      if (orders) {
        orderMap = Object.fromEntries(
          orders.map((o: AnyClient) => [o.id, o.friendly_order_id])
        );
      }
    }

    // Generate CSV
    const CSV_HEADERS = [
      'Nr',
      'Tip',
      'Serie',
      'Data',
      'Client',
      'Email',
      'CNP',
      'CUI',
      'Serviciu',
      'Descriere',
      'Suma',
      'Sursa',
      'Comanda',
      'Anulat',
      'Motiv Anulare',
    ];

    const rows = (entries || []).map((entry: AnyClient) => [
      escapeCsvField(entry.number),
      escapeCsvField(TYPE_LABELS[entry.type] || entry.type),
      escapeCsvField(entry.series),
      escapeCsvField(formatDateRO(entry.date)),
      escapeCsvField(entry.client_name),
      escapeCsvField(entry.client_email),
      escapeCsvField(entry.client_cnp),
      escapeCsvField(entry.client_cui),
      escapeCsvField(entry.service_type),
      escapeCsvField(entry.description),
      escapeCsvField(entry.amount),
      escapeCsvField(SOURCE_LABELS[entry.source] || entry.source),
      escapeCsvField(entry.order_id ? (orderMap[entry.order_id] || '') : ''),
      escapeCsvField(entry.voided_at ? 'Da' : ''),
      escapeCsvField(entry.void_reason),
    ]);

    // UTF-8 BOM for Excel compatibility + header + data rows
    const csvContent =
      '\uFEFF' +
      CSV_HEADERS.join(',') +
      '\n' +
      rows.map((row: string[]) => row.join(',')).join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="registru-numere-${year}.csv"`,
      },
    });
  } catch (error) {
    console.error('Number registry export error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
