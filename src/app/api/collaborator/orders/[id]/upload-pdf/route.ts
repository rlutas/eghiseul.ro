import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder, checkPermission } from '@/lib/admin/permissions';
import { uploadFile, generateFinalDocumentKey } from '@/lib/aws/s3';
import { compressPdf } from '@/lib/documents/pdf-compress';

/**
 * Collaborator (topograph) uploads the scanned result PDF for one of their
 * orders. The PDF is compressed (CloudConvert, with graceful fallback to the
 * original) before going to S3 to keep storage costs down. The document is
 * attached as NOT-yet-visible to the client; releasing happens in mark-ready.
 *
 * multipart/form-data: file=<pdf>, documentNumber=<optional registration nr>.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Scope: must be a collaborator assigned to this order's service.
    try {
      await requireCollaboratorForOrder(user.id, orderId);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
    if (!(await checkPermission(user.id, 'orders.pdf_upload'))) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');
    const documentNumber = (form.get('documentNumber') as string | null)?.trim() || null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'Fișier lipsă' }, { status: 400 });
    }
    const raw = Buffer.from(await file.arrayBuffer());
    if (raw.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return NextResponse.json({ success: false, error: 'Fișierul trebuie să fie un PDF valid' }, { status: 400 });
    }
    if (raw.length > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Fișier prea mare (max 20MB)' }, { status: 400 });
    }

    // Compress before storing (never blocks: falls back to the original).
    const { buffer, originalSize, finalSize, compressed } = await compressPdf(raw);

    const key = generateFinalDocumentKey(orderId, `topograf-${Date.now()}.pdf`);
    await uploadFile(key, buffer, 'application/pdf', {
      source: 'collaborator',
      uploadedBy: user.id,
    });

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insErr } = await (admin as any).from('order_documents').insert({
      order_id: orderId,
      type: 'collaborator-document',
      s3_key: key,
      file_name: (file as File).name?.replace(/[^\w.\-]+/g, '_') || 'document.pdf',
      file_size: finalSize,
      mime_type: 'application/pdf',
      document_number: documentNumber,
      visible_to_client: false,
      generated_by: user.id,
      metadata: { source: 'collaborator', original_size: originalSize, compressed },
    });
    if (insErr) {
      console.error('[collaborator] attach doc error:', insErr.message);
      return NextResponse.json({ success: false, error: 'Eroare la salvarea documentului' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { s3_key: key, originalSize, finalSize, compressed },
    });
  } catch (error) {
    console.error('[collaborator] upload-pdf error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea documentului' }, { status: 500 });
  }
}
