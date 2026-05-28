/**
 * GET /api/admin/orders/export
 *
 * Returns the current filtered orders list as a TSV (tab-separated values)
 * blob that pastes cleanly into Google Sheets or Excel. Used by the
 * "Export" button on /admin/orders.
 *
 * Why TSV (not CSV):
 *  - Google Sheets parses TSV pasted into a cell perfectly out of the box.
 *  - No quoting headache when values contain commas (which they will for
 *    customer addresses, service names, etc.).
 *  - The trade-off (tab character inside a field) doesn't apply here —
 *    none of our exportable fields contain literal tabs.
 *
 * Filter params mirror /api/admin/orders/list — status, search, service,
 * test. We deliberately skip pagination (no `limit`/`page`) and cap at
 * 10,000 rows so an admin can't accidentally pull the entire DB in one
 * shot. If you genuinely need more, narrow the filters.
 *
 * Response: Content-Type: text/tab-separated-values with a
 * Content-Disposition: attachment header so the browser downloads it as
 * a .tsv file named `orders-YYYY-MM-DD.tsv`.
 *
 * Auth: orders.view permission (same as list).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { parseTestFilter, resolveStatusFilter } from '@/lib/admin/orders-tabs';

const MAX_EXPORT_ROWS = 10_000;

const COLUMNS = [
  'Nr. Comandă',
  'Status',
  'Plată',
  'Serviciu',
  'Client',
  'Email',
  'Telefon',
  'Tip act',
  'Documente urcate (N)',
  'KYC verificat manual',
  'Curier',
  'AWB',
  'Total RON',
  'Cupon',
  'Discount RON',
  'Creat la',
  'Plătit la',
  'Test',
] as const;

function tsvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  // Strip tabs, newlines, carriage returns — they break TSV row delimiters.
  return s.replace(/[\t\r\n]+/g, ' ').trim();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const service = searchParams.get('service') || '';
    const testFilter = parseTestFilter(searchParams.get('test'));

    // Build the same query as /list but without pagination, capped at MAX
    let query = admin
      .from('orders')
      .select(`
        id,
        friendly_order_id,
        order_number,
        status,
        total_price,
        discount_amount,
        coupon_code,
        payment_status,
        payment_method,
        is_test,
        courier_provider,
        delivery_tracking_number,
        customer_data,
        created_at,
        paid_at,
        services:service_id (name, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(MAX_EXPORT_ROWS);

    if (service) query = query.eq('service_id', service);
    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).or(
        `order_number.ilike.%${search}%,friendly_order_id.ilike.%${search}%,delivery_tracking_number.ilike.%${search}%,customer_data->contact->>email.ilike.%${search}%`
      );
    }
    const statusFilter = resolveStatusFilter(statusParam);
    if (statusFilter.eq) {
      query = query.eq('status', statusFilter.eq);
    } else if (statusFilter.in) {
      query = query.in('status', statusFilter.in as string[]);
    } else if (statusFilter.notIn) {
      query = query.not('status', 'in', `(${statusFilter.notIn.join(',')})`);
    }
    if (testFilter === 'only') {
      query = query.eq('is_test', true);
    } else if (testFilter === 'hide') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).or('is_test.is.null,is_test.eq.false');
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error('[orders/export] query failed:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Cast through unknown — Supabase generated types lag behind actual
    // schema for `coupon_code` and `discount_amount` (added in 042/041).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderRows = (rows ?? []) as Array<any>;

    // Build TSV body
    const lines: string[] = [];
    lines.push(COLUMNS.join('\t'));
    for (const row of orderRows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cd = (row.customer_data as any) ?? {};
      const contact = cd.contact ?? {};
      const personal = cd.personalData ?? cd.personal ?? {};
      const company = cd.companyData ?? cd.company ?? {};
      const billing = cd.billing ?? {};
      const isPJ = billing.type === 'company' || !!company.companyName;
      const clientName = isPJ
        ? company.companyName
        : (personal.firstName || personal.lastName)
          ? `${personal.lastName ?? ''} ${personal.firstName ?? ''}`.trim()
          : contact.name || `${contact.lastName ?? ''} ${contact.firstName ?? ''}`.trim();
      const idType =
        personal.idDocumentType === 'ci_vechi' ? 'CI vechi' :
        personal.idDocumentType === 'ci_nou' ? 'CI nou eCI' :
        personal.idDocumentType === 'passport' ? 'Pașaport' :
        '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uploadedDocs: Array<any> = personal.uploadedDocuments ?? [];
      const idDocsCount = uploadedDocs.filter((d) =>
        d.type && ['ci_front', 'ci_back', 'ci_vechi', 'ci_nou_front', 'ci_nou_back', 'passport', 'passport_opened', 'ro_cei_reader_pdf'].includes(d.type)
      ).length;
      const verified = !!personal.adminVerifiedAt;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const services = row.services as any;
      const serviceName = Array.isArray(services) ? services[0]?.name : services?.name;

      lines.push([
        row.friendly_order_id || row.order_number,
        row.status ?? '',
        row.payment_status ?? '',
        serviceName ?? '',
        clientName,
        contact.email ?? '',
        contact.phone ?? '',
        idType,
        idDocsCount,
        verified ? 'da' : '',
        row.courier_provider ?? '',
        row.delivery_tracking_number ?? '',
        Number(row.total_price ?? 0).toFixed(2),
        row.coupon_code ?? '',
        row.discount_amount ? Number(row.discount_amount).toFixed(2) : '',
        row.created_at ?? '',
        row.paid_at ?? '',
        row.is_test ? 'test' : '',
      ].map(tsvEscape).join('\t'));
    }

    const tsv = lines.join('\n') + '\n';
    const yyyyMmDd = new Date().toISOString().slice(0, 10);

    return new Response(tsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${yyyyMmDd}.tsv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[orders/export] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
