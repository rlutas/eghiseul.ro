/**
 * Public, token-gated re-upload endpoint (no login).
 *
 * GET  /api/reupload/[token]  → minimal info for the page (doc type, order code,
 *                               status). Leaks no PII.
 * POST /api/reupload/[token]  → accepts a new photo (base64), uploads it to S3,
 *                               replaces the document on the order, re-flags the
 *                               order for manual review, marks the request used.
 *
 * Security: the token is an opaque random string stored in `reupload_requests`.
 * A request is usable only while status='pending' and not past token_expires_at.
 * Single-use — completing it flips status to 'completed'. Accessed via the
 * service-role admin client (the table has RLS on, no public policies).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { uploadBase64, getExtensionFromContentType } from '@/lib/aws/s3';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_BASE64_LEN = 12_000_000; // ~9 MB binary — phone photos compressed client-side are far smaller
const DOC_LABELS: Record<string, string> = {
  selfie: 'selfie cu actul de identitate',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

interface ReuploadRow {
  id: string;
  order_id: string;
  document_type: string;
  status: string;
  token_expires_at: string;
}

async function loadRequest(token: string) {
  const admin = createAdminClient();
  // `reupload_requests` isn't in the generated Supabase types yet — cast the
  // builder (same pattern the rest of the admin code uses for new tables).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('reupload_requests')
    .select('id, order_id, document_type, status, token_expires_at')
    .eq('token', token)
    .single();
  if (error || !data) return { admin, req: null as ReuploadRow | null };
  return { admin, req: data as ReuploadRow };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { req } = await loadRequest(token);
  if (!req) {
    return NextResponse.json({ success: false, error: 'invalid' }, { status: 404 });
  }
  const expired = new Date(req.token_expires_at).getTime() < Date.now();
  const usable = req.status === 'pending' && !expired;
  return NextResponse.json({
    success: true,
    data: {
      documentType: req.document_type,
      documentLabel: DOC_LABELS[req.document_type] || req.document_type,
      status: expired && req.status === 'pending' ? 'expired' : req.status,
      usable,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { admin, req } = await loadRequest(token);
    if (!req) {
      return NextResponse.json({ success: false, error: 'Link invalid' }, { status: 404 });
    }
    const expired = new Date(req.token_expires_at).getTime() < Date.now();
    if (req.status !== 'pending' || expired) {
      return NextResponse.json(
        { success: false, error: expired ? 'Link expirat' : 'Link deja folosit' },
        { status: 410 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const imageBase64: string | undefined = body?.imageBase64;
    const contentType: string = (body?.contentType as string) || 'image/jpeg';
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Lipsește imaginea' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(contentType.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Format imagine neacceptat' }, { status: 400 });
    }
    if (imageBase64.length > MAX_BASE64_LEN) {
      return NextResponse.json({ success: false, error: 'Imagine prea mare' }, { status: 413 });
    }

    const docType = req.document_type;
    const ext = getExtensionFromContentType(contentType);
    // Distinct key per re-upload keeps prior versions; customer_data points at
    // the latest. Timestamp-free (Date.now is fine on the server here).
    const s3Key = `kyc/${req.order_id}/${docType}_reupload_${req.id}.${ext}`;
    await uploadBase64(s3Key, imageBase64, contentType, {
      orderId: req.order_id,
      reuploadRequestId: req.id,
      docType,
    });

    // Update the order: replace the document's s3Key + re-flag for manual review.
    const { data: order } = await admin
      .from('orders')
      .select('id, customer_data')
      .eq('id', req.order_id)
      .single();
    const customerData: AnyObj = (order?.customer_data as AnyObj) ?? {};
    const updatedCustomerData = applyReuploadToCustomerData(customerData, docType, s3Key, contentType);

    const nowIso = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('orders')
      .update({ customer_data: updatedCustomerData, kyc_verified_at: null, updated_at: nowIso })
      .eq('id', req.order_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('reupload_requests')
      .update({ status: 'completed', completed_at: nowIso, new_s3_key: s3Key, updated_at: nowIso })
      .eq('id', req.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: req.order_id,
      event_type: 'kyc_photo_resubmitted',
      new_value: { documentType: docType, s3Key, reuploadRequestId: req.id },
      notes: `Client a reîncărcat ${DOC_LABELS[docType] || docType} — necesită reverificare`,
    });

    return NextResponse.json({ success: true, data: { message: 'Poza a fost încărcată' } });
  } catch (error) {
    console.error('[reupload:POST] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Eroare necunoscută' },
      { status: 500 }
    );
  }
}

/**
 * Replace the re-uploaded document's s3Key inside customer_data (handles both
 * `personal` (PF submit shape) and `personalData` (wizard shape)), clear any
 * admin verification flag so the team re-checks, and re-flag the selfie KYC
 * entry for manual review.
 */
function applyReuploadToCustomerData(
  customerData: AnyObj,
  docType: string,
  s3Key: string,
  mimeType: string
): AnyObj {
  const out: AnyObj = { ...customerData };
  const nowIso = new Date().toISOString();

  for (const shapeKey of ['personal', 'personalData'] as const) {
    const shape = customerData[shapeKey];
    if (!shape || typeof shape !== 'object') continue;
    const next: AnyObj = { ...shape };

    // Replace (or add) the document entry.
    const docs: AnyObj[] = Array.isArray(shape.uploadedDocuments)
      ? shape.uploadedDocuments
      : [];
    let found = false;
    const newDocs = docs.map((d) => {
      if (d?.type === docType) {
        found = true;
        const { base64: _drop, ...rest } = d;
        void _drop;
        return { ...rest, s3Key, mimeType, uploaded_at: nowIso };
      }
      return d;
    });
    if (!found) {
      newDocs.push({ type: docType, s3Key, mimeType, uploaded_at: nowIso });
    }
    next.uploadedDocuments = newDocs;

    // Re-flag the selfie for manual review + drop stale admin verification.
    if (docType === 'selfie' && shape.kycValidation && typeof shape.kycValidation === 'object') {
      next.kycValidation = {
        ...shape.kycValidation,
        selfie: {
          valid: false,
          confidence: 0,
          faceMatch: false,
          faceMatchConfidence: 0,
          needsManualReview: true,
          reviewReason: 'photo_resubmitted',
        },
      };
    }
    delete next.adminVerifiedAt;
    delete next.adminVerifiedBy;

    out[shapeKey] = next;
  }

  return out;
}
