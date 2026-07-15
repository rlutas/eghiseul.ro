/**
 * Public, token-gated document upload endpoint (no login) for the
 * "Solicită documente" flow.
 *
 * GET  /api/reupload/[token]  → the list of requested documents + which are
 *                               already uploaded (no PII).
 * POST /api/reupload/[token]  → accepts ONE document per call (base64),
 *                               uploads it to S3, replaces the document on the
 *                               order and re-flags it for manual review. When
 *                               the LAST requested document arrives the
 *                               request flips to 'completed', the order exits
 *                               standby (restored to its pre-request status,
 *                               SLA shifted by the paused days) and the team
 *                               inbox is notified.
 *
 * Security: the token is an opaque random string stored in `reupload_requests`.
 * A request is usable only while status='pending' and not past token_expires_at.
 * Accessed via the service-role admin client (the table has RLS on, no public
 * policies).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { uploadBase64, getExtensionFromContentType } from '@/lib/aws/s3';
import {
  REUPLOAD_DOC_SPECS,
  reuploadDocLabel,
} from '@/lib/reupload/doc-types';
import { finalizeReuploadRequest } from '@/lib/reupload/finalize';

export const runtime = 'nodejs';
export const maxDuration = 30;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_BASE64_LEN = 12_000_000; // ~9 MB binary — phone photos compressed client-side are far smaller

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

interface ReuploadRow {
  id: string;
  order_id: string;
  document_type: string;
  document_types: string[] | null;
  completed_documents: Array<{ type: string; s3Key: string; at: string }>;
  status: string;
  reason: string | null;
  token_expires_at: string;
  return_status: string | null;
  flow: string | null;
  require_email_confirm: boolean | null;
  signature_required: boolean | null;
  signature_completed_at: string | null;
}

function requestedTypes(req: ReuploadRow): string[] {
  return Array.isArray(req.document_types) && req.document_types.length > 0
    ? req.document_types
    : [req.document_type];
}

/** Optional companion types (e.g. ID back) offered alongside the requested set. */
function companionTypes(requested: string[]): string[] {
  return Object.entries(REUPLOAD_DOC_SPECS)
    .filter(([, spec]) => spec.companionOf && requested.includes(spec.companionOf))
    .map(([type]) => type);
}

async function loadRequest(token: string) {
  const admin = createAdminClient();
  // `reupload_requests` isn't in the generated Supabase types yet — cast the
  // builder (same pattern the rest of the admin code uses for new tables).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('reupload_requests')
    .select('id, order_id, document_type, document_types, completed_documents, status, reason, token_expires_at, return_status, flow, require_email_confirm, signature_required, signature_completed_at')
    .eq('token', token)
    .single();
  if (error || !data) return { admin, req: null as ReuploadRow | null };
  const row = data as ReuploadRow;
  if (!Array.isArray(row.completed_documents)) row.completed_documents = [];
  return { admin, req: row };
}

function docsPayload(req: ReuploadRow) {
  const done = new Set(req.completed_documents.map((d) => d.type));
  const requested = requestedTypes(req);
  const entry = (type: string, optional: boolean) => {
    const spec = REUPLOAD_DOC_SPECS[type];
    return {
      type,
      label: reuploadDocLabel(type),
      hint: spec?.hint ?? '',
      acceptsPdf: spec?.acceptsPdf ?? false,
      uploaded: done.has(type),
      optional,
    };
  };
  // Interleave each companion right after its parent so the page shows
  // "Act — față" and "Act — verso (opțional)" together.
  const out: ReturnType<typeof entry>[] = [];
  for (const type of requested) {
    out.push(entry(type, false));
    for (const companion of companionTypes([type])) {
      out.push(entry(companion, true));
    }
  }
  return out;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { admin, req } = await loadRequest(token);
  if (!req) {
    return NextResponse.json({ success: false, error: 'invalid' }, { status: 404 });
  }
  const expired = new Date(req.token_expires_at).getTime() < Date.now();
  const usable = req.status === 'pending' && !expired;

  // Completion flow: NOTHING is revealed before the email-confirm gate — the
  // full payload comes from POST /verify with the order email (anti-forwarding,
  // per the draft-hijack lesson E-260710-2S5EH).
  if (req.require_email_confirm) {
    return NextResponse.json({
      success: true,
      data: {
        usable,
        status: expired && req.status === 'pending' ? 'expired' : req.status,
        requiresEmailConfirm: true,
        expiresAt: req.token_expires_at,
      },
    });
  }

  // Friendly order code for page context (not PII — the token holder got it
  // in the request email anyway).
  let orderCode: string | null = null;
  try {
    const { data: order } = await admin
      .from('orders')
      .select('friendly_order_id, order_number')
      .eq('id', req.order_id)
      .single();
    orderCode = order?.friendly_order_id || order?.order_number || null;
  } catch {
    // non-blocking
  }

  return NextResponse.json({
    success: true,
    data: {
      documents: docsPayload(req),
      status: expired && req.status === 'pending' ? 'expired' : req.status,
      usable,
      reason: req.reason,
      orderCode,
      expiresAt: req.token_expires_at,
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

    // Completion flow: uploads require the email-confirm proof from /verify.
    if (req.require_email_confirm) {
      const { data: orderForGate } = await admin
        .from('orders')
        .select('customer_data')
        .eq('id', req.order_id)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gateEmail = ((orderForGate?.customer_data as any)?.contact?.email as string) || null;
      const { checkProofHeaders } = await import('@/lib/reupload/completion-proof');
      if (!checkProofHeaders(request.headers, token, gateEmail)) {
        return NextResponse.json(
          { success: false, error: 'Confirmă mai întâi emailul comenzii.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const imageBase64: string | undefined = body?.imageBase64;
    const contentType: string = ((body?.contentType as string) || 'image/jpeg').toLowerCase();

    const types = requestedTypes(req);
    const allowedTypes = [...types, ...companionTypes(types)];
    // Single-doc legacy links may omit documentType — default to the only doc.
    const docType: string =
      typeof body?.documentType === 'string' && body.documentType
        ? body.documentType
        : types.length === 1
          ? types[0]
          : '';
    if (!allowedTypes.includes(docType)) {
      return NextResponse.json(
        { success: false, error: 'Documentul nu face parte din această cerere' },
        { status: 400 }
      );
    }

    const spec = REUPLOAD_DOC_SPECS[docType];
    const allowed = new Set(IMAGE_TYPES);
    if (spec?.acceptsPdf) allowed.add('application/pdf');

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Lipsește fișierul' }, { status: 400 });
    }
    if (!allowed.has(contentType)) {
      return NextResponse.json({ success: false, error: 'Format fișier neacceptat' }, { status: 400 });
    }
    if (imageBase64.length > MAX_BASE64_LEN) {
      return NextResponse.json({ success: false, error: 'Fișier prea mare' }, { status: 413 });
    }

    const ext = getExtensionFromContentType(contentType);
    // Distinct key per re-upload keeps prior versions; customer_data points at
    // the latest.
    const s3Key = `kyc/${req.order_id}/${docType}_reupload_${req.id}.${ext}`;
    await uploadBase64(s3Key, imageBase64, contentType, {
      orderId: req.order_id,
      reuploadRequestId: req.id,
      docType,
    });

    // Update the order: replace the document's s3Key + re-flag for manual review.
    // (`standby_*` columns aren't in the generated types yet — cast the builder.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (admin as any)
      .from('orders')
      .select('id, friendly_order_id, order_number, status, customer_data, standby_started_at, standby_total_seconds, estimated_completion_date')
      .eq('id', req.order_id)
      .single();
    const customerData: AnyObj = (order?.customer_data as AnyObj) ?? {};
    const updatedCustomerData =
      spec?.target === 'company'
        ? applyCompanyDocToCustomerData(customerData, docType, s3Key, contentType)
        : applyPersonalDocToCustomerData(customerData, docType, s3Key, contentType);

    const nowIso = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('orders')
      .update({ customer_data: updatedCustomerData, kyc_verified_at: null, updated_at: nowIso })
      .eq('id', req.order_id);

    // Progress bookkeeping on the request row.
    const completed = [
      ...req.completed_documents.filter((d) => d.type !== docType),
      { type: docType, s3Key, at: nowIso },
    ];
    const doneTypes = new Set(completed.map((d) => d.type));
    // Completion flow: the signature is part of the completion condition —
    // the request finishes only after docs AND signature.
    const signaturePending = !!req.signature_required && !req.signature_completed_at;
    const allDone = types.every((t) => doneTypes.has(t)) && !signaturePending;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('reupload_requests')
      .update({
        completed_documents: completed,
        ...(allDone
          ? { status: 'completed', completed_at: nowIso, new_s3_key: s3Key }
          : {}),
        updated_at: nowIso,
      })
      .eq('id', req.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: req.order_id,
      event_type: 'kyc_photo_resubmitted',
      new_value: { documentType: docType, s3Key, reuploadRequestId: req.id, allDone },
      notes: `Client a încărcat ${reuploadDocLabel(docType)} (${doneTypes.size}/${types.length}) — necesită reverificare`,
    });

    // Last document (+ signature, on completion flow): bring the order back
    // from standby, regenerate signed documents (completion), tell the team.
    if (allDone) {
      await finalizeReuploadRequest(admin, req, order as AnyObj | null, types, nowIso);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Document încărcat',
        documents: docsPayload({ ...req, completed_documents: completed }),
        allDone,
      },
    });
  } catch (error) {
    console.error('[reupload:POST] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Eroare necunoscută' },
      { status: 500 }
    );
  }
}

/**
 * Replace the re-uploaded PERSONAL document's s3Key inside customer_data
 * (handles both `personal` (PF submit shape) and `personalData` (wizard
 * shape)), clear any admin verification flag so the team re-checks, and
 * re-flag the selfie KYC entry for manual review.
 */
function applyPersonalDocToCustomerData(
  customerData: AnyObj,
  docType: string,
  s3Key: string,
  mimeType: string
): AnyObj {
  const out: AnyObj = { ...customerData };
  const nowIso = new Date().toISOString();

  // Orders that never had a personal shape (e.g. PJ orders placed before the
  // personal-KYC config fix) still need somewhere to put the document.
  const shapeKeys = ['personal', 'personalData'].filter(
    (k) => customerData[k] && typeof customerData[k] === 'object'
  );
  if (shapeKeys.length === 0) shapeKeys.push('personal');

  for (const shapeKey of shapeKeys) {
    const shape: AnyObj = customerData[shapeKey] ?? {};
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

/**
 * Replace (or add) a COMPANY document inside customer_data.company
 * .uploadedDocuments — the shape the PJ wizard writes ({id, type, s3Key,
 * fileName, fileSize, mimeType, uploadedAt}).
 */
function applyCompanyDocToCustomerData(
  customerData: AnyObj,
  docType: string,
  s3Key: string,
  mimeType: string
): AnyObj {
  const nowIso = new Date().toISOString();
  const company: AnyObj =
    customerData.company && typeof customerData.company === 'object'
      ? { ...customerData.company }
      : {};
  const docs: AnyObj[] = Array.isArray(company.uploadedDocuments)
    ? company.uploadedDocuments
    : [];
  let found = false;
  const newDocs = docs.map((d) => {
    if (d?.type === docType) {
      found = true;
      return { ...d, s3Key, mimeType, uploadedAt: nowIso };
    }
    return d;
  });
  if (!found) {
    newDocs.push({
      id: s3Key,
      type: docType,
      s3Key,
      fileName: `${docType}_reupload`,
      mimeType,
      uploadedAt: nowIso,
    });
  }
  company.uploadedDocuments = newDocs;
  return { ...customerData, company };
}
