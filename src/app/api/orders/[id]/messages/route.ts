/**
 * GET  /api/orders/[id]/messages — the client's view of the order thread.
 * POST /api/orders/[id]/messages — the client replies (text + up to 5 files
 *      already uploaded through `/client-files`).
 *
 * Access: the order's owner (session) or the order-client token that the
 * public status API issues after checking order code + email. Staff names are
 * not exposed: the client sees „Echipa …” / „Topograful care lucrează comanda”.
 *
 * Query/body: `token` for guests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyOrderClientToken } from '@/lib/orders/order-client-token';
import {
  clientFacingAuthor,
  listOrderMessages,
  markOrderMessagesRead,
  postOrderMessage,
} from '@/lib/orders/messages';
import { brandForOrder } from '@/lib/brand/for-order';
import { formatPersonNameFrom } from '@/lib/format/person-name';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Client replies per order per 24h — a thread, not a chat room. */
const MAX_CLIENT_MESSAGES_PER_DAY = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function authorize(orderId: string, token: unknown): Promise<{ order: any } | { error: NextResponse }> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return { error: NextResponse.json({ success: false, error: 'Comandă invalidă' }, { status: 400 }) };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, platform, customer_data')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) {
    return { error: NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 }) };
  }
  if (verifyOrderClientToken(token, orderId)) return { order };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && order.user_id && order.user_id === user.id) return { order };
  return {
    error: NextResponse.json(
      { success: false, error: 'Sesiunea a expirat. Redeschide pagina comenzii.' },
      { status: 403 }
    ),
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await authorize(id, request.nextUrl.searchParams.get('token'));
  if ('error' in auth) return auth.error;

  const admin = createAdminClient();
  const brand = brandForOrder(auth.order);
  const messages = await listOrderMessages(id, admin);
  await markOrderMessagesRead(id, 'client', admin);
  return NextResponse.json({
    success: true,
    data: {
      messages: messages.map((m) => ({
        id: m.id,
        mine: m.author_type === 'client',
        author: clientFacingAuthor(m, brand.name),
        body: m.body,
        attachments: (m.attachments ?? []).map((a) => ({ name: a.name, mimeType: a.mimeType, size: a.size })),
        createdAt: m.created_at,
        unread: m.author_type !== 'client' && !m.read_by_client_at,
      })),
    },
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const auth = await authorize(id, payload?.token);
  if ('error' in auth) return auth.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('order_messages')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', id)
    .eq('author_type', 'client')
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_CLIENT_MESSAGES_PER_DAY) {
    return NextResponse.json(
      { success: false, error: 'Ai trimis multe mesaje azi. Pentru ceva urgent, scrie-ne pe WhatsApp.' },
      { status: 429 }
    );
  }

  const cd = auth.order.customer_data ?? {};
  const authorName = formatPersonNameFrom(cd.personal, cd.billing, cd.contact) || cd.contact?.email || 'Client';

  const result = await postOrderMessage({
    orderId: id,
    authorType: 'client',
    authorName,
    body: typeof payload?.body === 'string' ? payload.body : '',
    attachments: payload?.attachments,
  });
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, data: { id: result.message.id } });
}
