/**
 * POST /api/orders/[id]/client-files
 *
 * Presigned S3 upload for a file the CLIENT gives us about an order:
 *  - in the wizard, the acts that help identify a property (old CF extract,
 *    title deed, sale contract) — the order is still a draft;
 *  - after payment, an attachment to a reply in the order's message thread.
 *
 * The browser PUTs the file straight to S3 (no 4.5 MB serverless body limit,
 * no base64 in the draft JSON) and then keeps the returned key: the wizard in
 * `property.supportingDocuments`, the message form in the post body. Every
 * consumer re-checks the key against the order namespace (`client-files.ts`).
 *
 * Who may upload:
 *  - draft: the same gate as the draft route (session owner, resume token, or
 *    the draft's contact email) — and the draft must already HAVE an email,
 *    so a fresh draft is not an open bucket;
 *  - any later status: the order's owner (session) or the order-client token
 *    from the status page (order code + email verified there).
 *
 * Body: { contentType, fileSize, filename?, email?, resumeToken?, token? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUploadUrl, isAllowedFileType } from '@/lib/aws/s3';
import { canUpdateDraft } from '@/lib/orders/draft-access';
import { verifyOrderClientToken } from '@/lib/orders/order-client-token';
import {
  CLIENT_FILE_MAX_BYTES,
  CLIENT_FILE_TYPES,
  buildClientFileKey,
} from '@/lib/orders/client-files';

/** Presigns per order per hour — shared counter with payment proofs. */
const MAX_PRESIGNS_PER_HOUR = 20;

const DEAD_STATUSES = ['cancelled', 'refunded', 'abandoned'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ success: false, error: 'Comandă invalidă' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const contentType = typeof body?.contentType === 'string' ? body.contentType : '';
    const fileSize = Number(body?.fileSize);
    const filename = typeof body?.filename === 'string' ? body.filename.slice(0, 120) : 'document';

    if (!isAllowedFileType(contentType, [...CLIENT_FILE_TYPES])) {
      return NextResponse.json(
        { success: false, error: 'Acceptăm poze (JPG, PNG, WebP) sau PDF' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { success: false, error: 'Fișierul este gol (0 KB). Dacă l-ai ales din galerie, fă poza direct cu camera.' },
        { status: 400 }
      );
    }
    if (fileSize > CLIENT_FILE_MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Fișierul are peste 10 MB. Trimite o poză sau un PDF mai mic.' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: order } = await admin
      .from('orders')
      .select('id, status, user_id, customer_data, resume_token, resume_token_expires_at')
      .eq('id', orderId)
      .maybeSingle();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }
    if (DEAD_STATUSES.includes(order.status)) {
      return NextResponse.json({ success: false, error: 'Comanda este închisă' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let authorized = false;
    if (user && order.user_id && order.user_id === user.id) {
      authorized = true;
    } else if (verifyOrderClientToken(body?.token, orderId)) {
      authorized = true;
    } else if (order.status === 'draft') {
      const storedEmail = ((order.customer_data?.contact?.email as string | undefined) || '').toLowerCase();
      const requestEmail = typeof body?.email === 'string' ? body.email.toLowerCase() : undefined;
      authorized =
        !!storedEmail &&
        canUpdateDraft(
          user ? { id: user.id, email: user.email ?? undefined } : null,
          order,
          requestEmail,
          typeof body?.resumeToken === 'string' ? body.resumeToken : undefined
        );
    }
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Nu ai acces la această comandă' }, { status: 403 });
    }

    const { data: withinBudget } = await admin.rpc('count_proof_presign', {
      p_order_id: orderId,
      p_max: MAX_PRESIGNS_PER_HOUR,
    });
    if (withinBudget !== true) {
      return NextResponse.json(
        { success: false, error: 'Prea multe fișiere într-o oră. Încearcă din nou mai târziu.' },
        { status: 429 }
      );
    }

    const key = buildClientFileKey(orderId, contentType);
    const result = await getUploadUrl(key, {
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
    console.error('[client-files] presign error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
