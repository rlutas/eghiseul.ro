import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/marketing/subscribers
 * Newsletter subscribers list for the admin Marketing section.
 * Query: status=active|unsubscribed|all (default active), search, format=csv
 * Permission: settings.manage
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'active';
  const search = (searchParams.get('search') || '').trim();
  const format = searchParams.get('format') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  let query = admin
    .from('newsletter_subscribers')
    .select('id, email, name, source, consent_text, created_at, unsubscribed_at')
    .order('created_at', { ascending: false })
    .limit(2000);

  if (status === 'active') query = query.is('unsubscribed_at', null);
  if (status === 'unsubscribed') query = query.not('unsubscribed_at', 'is', null);
  if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  type Row = {
    email: string; name: string | null; source: string | null;
    created_at: string | null; unsubscribed_at: string | null;
  };
  const rows = (data || []) as Row[];

  if (format === 'csv') {
    const esc = (v: string | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      'Email,Nume,Sursa,Abonat la,Status',
      ...rows.map((r) =>
        [esc(r.email), esc(r.name), esc(r.source), esc(r.created_at?.slice(0, 10) ?? ''), r.unsubscribed_at ? 'Dezabonat' : 'Activ'].join(',')
      ),
    ].join('\n');
    return new NextResponse('﻿' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="abonati-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ success: true, data: rows });
}
