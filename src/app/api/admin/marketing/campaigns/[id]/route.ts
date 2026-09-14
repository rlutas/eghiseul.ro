/**
 * /api/admin/marketing/campaigns/[id]
 *
 *   PATCH  editează câmpurile (doar în `draft`/`paused`) și/sau schimbă
 *          statusul: draft→sending, sending→paused, paused→sending.
 *          `done` e pus doar de cron.
 *   DELETE doar în `draft`.
 *
 * Permission: settings.manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { campaignSchema, CAMPAIGN_COLUMNS } from '../route';

export const dynamic = 'force-dynamic';

const patchSchema = campaignSchema.partial().extend({
  status: z.enum(['draft', 'sending', 'paused']).optional(),
});

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['sending'],
  sending: ['paused'],
  paused: ['sending'],
  done: [],
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function authorize() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { error: NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 }) };
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
  return { user };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize();
  if ('error' in auth) return auth.error;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalid' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Date invalide' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: current } = await admin.from('email_campaigns').select('id, status').eq('id', id).maybeSingle();
  if (!current) return NextResponse.json({ success: false, error: 'Campania nu există' }, { status: 404 });

  const { status: nextStatus, ...fields } = parsed.data;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (Object.keys(fields).length > 0) {
    if (current.status !== 'draft' && current.status !== 'paused') {
      return NextResponse.json({ success: false, error: 'Conținutul se editează doar în draft sau pauză' }, { status: 409 });
    }
    Object.assign(patch, fields, 'cta_url' in fields ? { cta_url: fields.cta_url || null } : {});
  }

  if (nextStatus && nextStatus !== current.status) {
    if (!ALLOWED_TRANSITIONS[current.status]?.includes(nextStatus)) {
      return NextResponse.json({ success: false, error: `Tranziție invalidă: ${current.status} → ${nextStatus}` }, { status: 409 });
    }
    patch.status = nextStatus;
    if (nextStatus === 'sending' && current.status === 'draft') patch.started_at = new Date().toISOString();
  }

  const { data, error } = await admin.from('email_campaigns').update(patch).eq('id', id).select(CAMPAIGN_COLUMNS).single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await authorize();
  if ('error' in auth) return auth.error;
  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: current } = await admin.from('email_campaigns').select('id, status').eq('id', id).maybeSingle();
  if (!current) return NextResponse.json({ success: false, error: 'Campania nu există' }, { status: 404 });
  if (current.status !== 'draft') {
    return NextResponse.json({ success: false, error: 'Se șterg doar campaniile în draft' }, { status: 409 });
  }
  const { error } = await admin.from('email_campaigns').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
