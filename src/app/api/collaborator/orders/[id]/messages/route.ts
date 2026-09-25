/**
 * GET  /api/collaborator/orders/[id]/messages — the order's thread, for the
 *      topograph the order belongs to; marks the client's replies as read
 *      (not in admin preview).
 * POST /api/collaborator/orders/[id]/messages — the topograph writes to the
 *      client directly (a question, the list of properties found by owner…);
 *      the client gets an email. Preview is read-only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import {
  listOrderMessages,
  markOrderMessagesRead,
  postOrderMessage,
  withAttachmentUrls,
} from '@/lib/orders/messages';
import { formatPersonName } from '@/lib/format/person-name';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function collaborator(request: NextRequest, orderId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 }) };
  }
  try {
    const ctx = await resolveCollaboratorContext(user.id, request.nextUrl.searchParams.get('as'));
    await requireCollaboratorForOrder(ctx.collaboratorId, orderId);
    return { collaboratorId: ctx.collaboratorId, preview: ctx.preview };
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await collaborator(request, id);
  if ('error' in auth) return auth.error;

  const admin = createAdminClient();
  const messages = await listOrderMessages(id, admin);
  if (!auth.preview) await markOrderMessagesRead(id, 'staff', admin);
  return NextResponse.json({ success: true, data: { messages: await withAttachmentUrls(messages) } });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await collaborator(request, id);
  if ('error' in auth) return auth.error;
  if (auth.preview) {
    return NextResponse.json({ success: false, error: 'Previzualizarea e doar pentru citire' }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({}));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', auth.collaboratorId)
    .single();
  const authorName = formatPersonName(profile?.last_name, profile?.first_name) || profile?.email || 'Topograf';

  const result = await postOrderMessage({
    orderId: id,
    authorType: 'collaborator',
    authorId: auth.collaboratorId,
    authorName,
    body: typeof payload?.body === 'string' ? payload.body : '',
  });
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, data: { message: result.message, emailed: result.emailed } });
}
