/**
 * Presigned S3 upload for a file the team / topograph attaches to a message
 * for the client. Callers authorize first (admin: `orders.manage`;
 * collaborator: the order must be theirs, not in preview). The browser PUTs
 * the bytes straight to S3 (no 4.5 MB serverless body limit) and posts the
 * returned key with the message; `postOrderMessage` re-checks the namespace
 * and the real size on S3 before the message references it.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUploadUrl } from '@/lib/aws/s3';
import { buildStaffMessageFileKey, validateMessageFileUpload } from '@/lib/orders/message-files';

export async function presignStaffMessageFile(orderId: string, payload: unknown): Promise<NextResponse> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ success: false, error: 'Comandă invalidă' }, { status: 400 });
  }
  const body = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const check = validateMessageFileUpload(body.contentType, body.fileSize);
  if (!check.ok) return NextResponse.json({ success: false, error: check.error }, { status: 400 });

  const contentType = body.contentType as string;
  const fileSize = Number(body.fileSize);
  const filename = typeof body.filename === 'string' && body.filename ? body.filename.slice(0, 120) : 'document';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: order } = await admin.from('orders').select('id').eq('id', orderId).maybeSingle();
  if (!order) return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });

  try {
    const result = await getUploadUrl(buildStaffMessageFileKey(orderId, contentType), {
      contentType,
      metadata: {
        'order-id': orderId,
        'original-filename': encodeURIComponent(filename),
        'uploaded-at': new Date().toISOString(),
      },
      expiresIn: 900,
    });
    return NextResponse.json({
      success: true,
      data: { uploadUrl: result.url, key: result.key, name: filename, mimeType: contentType, size: fileSize },
    });
  } catch (error) {
    console.error('[message-files] presign error:', error);
    return NextResponse.json({ success: false, error: 'Nu am putut pregăti încărcarea' }, { status: 500 });
  }
}
