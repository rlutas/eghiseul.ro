/**
 * GET /api/orders/[id]/messages/file?m=<messageId>&i=<index>[&token=…]
 *
 * The client downloads a file attached to a message of their order — one the
 * team / topograph sent (e.g. a photo of an unusable CF extract) or one they
 * sent themselves. Same access check as the thread (`authorizeOrderClient`):
 * the order's owner (session) or the order-client token from the status page.
 *
 * The browser never sees the S3 key: it names a message + position, the key
 * is read from that message row (scoped to THIS order) and re-checked against
 * the order's namespaces, then a 5-minute presigned URL is issued as a 302.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDownloadUrl } from '@/lib/aws/s3';
import { authorizeOrderClient } from '@/lib/orders/message-access';
import { isOrderMessageFileKey } from '@/lib/orders/message-files';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UUID_RX = /^[0-9a-f-]{36}$/i;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sp = request.nextUrl.searchParams;
    const messageId = sp.get('m') ?? '';
    const index = Number(sp.get('i'));
    if (!UUID_RX.test(messageId) || !Number.isInteger(index) || index < 0 || index > 20) {
      return NextResponse.json({ success: false, error: 'Fișier invalid' }, { status: 400 });
    }

    const auth = await authorizeOrderClient(id, sp.get('token'));
    if ('error' in auth) return auth.error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: message } = await admin
      .from('order_messages')
      .select('id, attachments')
      .eq('id', messageId)
      .eq('order_id', id)
      .maybeSingle();
    const attachment = Array.isArray(message?.attachments) ? message.attachments[index] : undefined;
    if (!attachment || !isOrderMessageFileKey(id, attachment.key)) {
      return NextResponse.json({ success: false, error: 'Fișierul nu există' }, { status: 404 });
    }

    const url = await getDownloadUrl(attachment.key, 300);
    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error('[messages/file] download error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
