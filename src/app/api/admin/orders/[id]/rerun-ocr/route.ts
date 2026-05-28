/**
 * POST /api/admin/orders/[id]/rerun-ocr
 *
 * Re-runs Gemini OCR on a previously-uploaded document and updates the
 * order's `customer_data.personal.ocrResults[]` with the fresh result.
 *
 * Why: Gemini prompts evolve. When we tighten/refine an extractor (e.g.,
 * 2026-05-28 fix to stop demanding address on eCI back), older orders
 * already in flight still carry the stale OCR. Admin can hit this
 * endpoint to refresh without forcing the client to re-upload.
 *
 * Request body:
 *   { docType: 'ci_front' | 'ci_nou_back' | 'passport_opened' | 'ro_cei_reader_pdf' }
 *
 * Returns the new OCR result. UI replaces the existing row in
 * personalKyc.ocrResults indexed by `documentType`.
 *
 * Auth: requires permission `orders.manage`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { downloadFile } from '@/lib/aws/s3';
import {
  extractFromCIFront,
  extractFromCIBack,
  extractFromCINouBack,
  extractFromPassport,
  extractFromPassportOpened,
  extractFromROCEIReaderPDF,
  type OCRResult,
} from '@/lib/services/document-ocr';

export const runtime = 'nodejs';
export const maxDuration = 60;

const VALID_DOC_TYPES = [
  'ci_front',
  'ci_back',
  'ci_nou_back',
  'passport',
  'passport_opened',
  'ro_cei_reader_pdf',
] as const;
type RerunDocType = (typeof VALID_DOC_TYPES)[number];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { id: orderId } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    // ── Validate body ───────────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const docType = body.docType as RerunDocType | undefined;
    if (!docType || !VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json(
        { success: false, error: `docType must be one of: ${VALID_DOC_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Load order + find the uploaded document ─────────────────────────────
    const admin = createAdminClient();
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('id, customer_data')
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = order.customer_data as any;
    const personal = customerData?.personalData || customerData?.personal;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadedDocs: Array<any> = personal?.uploadedDocuments || [];
    const doc = uploadedDocs.find((d) => d.type === docType);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: `No uploaded document of type "${docType}" found on order` },
        { status: 404 }
      );
    }

    // ── Pull bytes from S3 (preferred) or base64 (legacy drafts) ────────────
    let imageBase64: string;
    let mimeType: string = doc.mimeType ?? 'image/jpeg';
    if (doc.s3Key) {
      const buf = await downloadFile(doc.s3Key);
      imageBase64 = buf.toString('base64');
    } else if (doc.base64) {
      imageBase64 = doc.base64;
    } else {
      return NextResponse.json(
        { success: false, error: 'Uploaded document has no s3Key and no base64 payload — cannot re-run OCR' },
        { status: 422 }
      );
    }

    // ── Dispatch to the right extractor ─────────────────────────────────────
    let ocr: OCRResult;
    switch (docType) {
      case 'ci_front':
        ocr = await extractFromCIFront(imageBase64, mimeType);
        break;
      case 'ci_back':
        ocr = await extractFromCIBack(imageBase64, mimeType);
        break;
      case 'ci_nou_back':
        ocr = await extractFromCINouBack(imageBase64, mimeType);
        break;
      case 'passport':
        ocr = await extractFromPassport(imageBase64, mimeType);
        break;
      case 'passport_opened':
        ocr = await extractFromPassportOpened(imageBase64, mimeType);
        break;
      case 'ro_cei_reader_pdf':
        // PDF goes through Gemini with application/pdf mime type inside
        // the extractor itself; mimeType arg ignored for this branch.
        ocr = await extractFromROCEIReaderPDF(imageBase64);
        mimeType = 'application/pdf';
        break;
    }

    // ── Patch the order: replace the result row for this docType ────────────
    const existingResults = Array.isArray(personal?.ocrResults) ? personal.ocrResults : [];
    const newResults = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...existingResults.filter((r: any) => r.documentType !== docType),
      {
        documentType: docType,
        success: ocr.success,
        confidence: ocr.confidence,
        extractedData: ocr.extractedData,
        issues: ocr.issues,
        processedAt: new Date().toISOString(),
        rerunBy: user.id,
        rerunAt: new Date().toISOString(),
      },
    ];

    const updatedCustomerData = {
      ...customerData,
      ...(customerData.personalData
        ? { personalData: { ...customerData.personalData, ocrResults: newResults } }
        : { personal: { ...customerData.personal, ocrResults: newResults } }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (admin as any)
      .from('orders')
      .update({ customer_data: updatedCustomerData, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (updateErr) {
      console.error('[rerun-ocr] update failed:', updateErr);
      return NextResponse.json(
        { success: false, error: 'Failed to save OCR result' },
        { status: 500 }
      );
    }

    // ── Audit trail in order_history ────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: orderId,
      event_type: 'ocr_rerun',
      changed_by: user.id,
      new_value: {
        docType,
        confidence: ocr.confidence,
        success: ocr.success,
      },
      notes: `OCR re-rulat manual de admin pentru ${docType} (confidence: ${ocr.confidence}%)`,
    });

    return NextResponse.json({
      success: true,
      data: { ocr, docType },
    });
  } catch (error) {
    console.error('[rerun-ocr] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
