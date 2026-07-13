/**
 * GET /api/admin/contacts — paginated client/lead registry for the admin UI.
 *
 * Query params:
 *   q        — search in email / name / phone
 *   source   — filter: sources array contains (e.g. 'wpforms:cazier-judiciar')
 *   service  — filter: services array contains (e.g. 'extras-carte-funciara')
 *   customer — '1' = only confirmed customers, '0' = only leads
 *   page     — 1-based (50/page)
 *   format   — 'csv' → CSV export of the CURRENT filter (users.manage only)
 *
 * PII endpoint: requires users.manage.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    await requirePermission(user.id, 'users.manage'); // throws 403 Response

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim();
    const source = (searchParams.get('source') ?? '').trim();
    const service = (searchParams.get('service') ?? '').trim();
    const customer = searchParams.get('customer');
    const format = searchParams.get('format');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    let query = admin
      .from('contacts')
      .select('email, first_name, last_name, phone, sources, services, is_customer, marketing_status, orders_count, total_spent_ron, first_seen_at, last_activity_at', { count: 'exact' });

    if (q) {
      const like = `%${q.replace(/[%_]/g, '')}%`;
      query = query.or(`email.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},phone.ilike.${like}`);
    }
    if (source) query = query.contains('sources', [source]);
    if (service) query = query.contains('services', [service]);
    if (customer === '1') query = query.eq('is_customer', true);
    if (customer === '0') query = query.eq('is_customer', false);

    query = query.order('last_activity_at', { ascending: false, nullsFirst: false });

    if (format === 'csv') {
      // export capped at 100k rows — the whole registry fits
      const { data, error } = await query.limit(100000);
      if (error) throw error;
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = [
        ['email', 'prenume', 'nume', 'telefon', 'surse', 'servicii', 'client', 'status_marketing', 'nr_comenzi', 'total_ron', 'prima_activitate', 'ultima_activitate'].join(','),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data ?? []).map((c: any) => [
          esc(c.email), esc(c.first_name), esc(c.last_name), esc(c.phone),
          esc((c.sources ?? []).join('; ')), esc((c.services ?? []).join('; ')),
          c.is_customer ? 'da' : 'lead', esc(c.marketing_status),
          c.orders_count, c.total_spent_ron, esc(c.first_seen_at), esc(c.last_activity_at),
        ].join(',')),
      ].join('\n');
      return new NextResponse('﻿' + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="clienti-eghiseul-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { contacts: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE },
    });
  } catch (error) {
    if (error instanceof Response) return error; // requirePermission 403
    console.error('[admin] contacts error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea listei' }, { status: 500 });
  }
}
