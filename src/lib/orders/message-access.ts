/**
 * Who may read / write the CLIENT side of an order's message thread (and
 * download its attachments): the order's owner (session) or the order-client
 * token the public status API issues after checking order code + email.
 *
 * Shared by `/api/orders/[id]/messages` and `/api/orders/[id]/messages/file`,
 * so the thread and its files can never drift to different access rules.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyOrderClientToken } from '@/lib/orders/order-client-token';

export async function authorizeOrderClient(
  orderId: string,
  token: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ order: any } | { error: NextResponse }> {
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
