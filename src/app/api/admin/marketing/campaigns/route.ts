/**
 * /api/admin/marketing/campaigns — campanii manuale de email (noutăți,
 * articole, servicii noi). Trimise treptat de `/api/cron/email-campaigns`.
 *
 *   GET   listă (cu progres)
 *   POST  creează (status `draft`)
 *
 * Permission: settings.manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export const dynamic = 'force-dynamic';

export const campaignSchema = z.object({
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(3).max(200),
  preheader: z.string().trim().max(200).optional().nullable(),
  body_text: z.string().trim().min(20).max(20_000),
  cta_label: z.string().trim().max(60).optional().nullable(),
  cta_url: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
  segment: z.enum(['customers', 'subscribed', 'all_contacts']).default('customers'),
  daily_batch_size: z.number().int().min(1).max(2000).default(100),
});

export const CAMPAIGN_COLUMNS =
  'id, name, subject, preheader, body_text, cta_label, cta_url, segment, status, daily_batch_size, sent_count, created_by, created_at, updated_at, started_at, finished_at';

async function authorize() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 }) };
  }
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
  return { user };
}

export async function GET() {
  const auth = await authorize();
  if ('error' in auth) return auth.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('email_campaigns').select(CAMPAIGN_COLUMNS).order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalid' }, { status: 400 });
  }
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Date invalide' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('email_campaigns')
    .insert({ ...parsed.data, cta_url: parsed.data.cta_url || null, created_by: auth.user.email ?? auth.user.id })
    .select(CAMPAIGN_COLUMNS)
    .single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
