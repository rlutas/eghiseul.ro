/**
 * GET  /api/admin/orders/[id]/messages — the order's message thread
 *      (`orders.view`); marks the client's replies as read.
 * POST /api/admin/orders/[id]/messages — the team writes to the client
 *      (`orders.manage`); the client gets an email with the message.
 *
 * Body (POST): `{ body: string }`. Everything posted here is visible to the
 * client — internal notes go through `/notes`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
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

async function staffUser(permission: 'orders.view' | 'orders.manage') {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 }) };
  }
  try {
    await requirePermission(user.id, permission);
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
  return { user };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await staffUser('orders.view');
  if ('error' in auth) return auth.error;

  const admin = createAdminClient();
  const messages = await listOrderMessages(id, admin);
  await markOrderMessagesRead(id, 'staff', admin);
  return NextResponse.json({ success: true, data: { messages: await withAttachmentUrls(messages) } });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await staffUser('orders.manage');
  if ('error' in auth) return auth.error;

  const payload = await request.json().catch(() => ({}));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', auth.user.id)
    .single();
  const authorName = formatPersonName(profile?.last_name, profile?.first_name) || profile?.email || 'Echipa';

  const result = await postOrderMessage({
    orderId: id,
    authorType: 'team',
    authorId: auth.user.id,
    authorName,
    body: typeof payload?.body === 'string' ? payload.body : '',
  });
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, data: { message: result.message, emailed: result.emailed } });
}
