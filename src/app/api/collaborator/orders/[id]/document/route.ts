/**
 * GET /api/collaborator/orders/[id]/document?docId=<uuid>[&format=docx]
 *
 * Descărcarea unui document al comenzii de către colaboratorul (topograful)
 * căruia îi este asignată lucrarea.
 *
 * Ce poate lua colaboratorul:
 *   - convenția („angajament de execuție documentație") — e contractul dintre
 *     CLIENT și EL, semnat de client în wizard; fără exemplarul semnat nu poate
 *     cere date din arhiva BCPI și nu poate depune documentația;
 *   - propriile lui încărcări (`metadata.source = 'collaborator'`).
 *
 * Orice alt document al comenzii (contract de prestări, cereri, KYC) rămâne
 * INACCESIBIL — conține date ale clientului care nu-l privesc.
 *
 * Implicit servește PDF (convertit din DOCX și cache-uit lângă el în S3, ca la
 * preview-ul din admin); `?format=docx` întoarce originalul.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { downloadFile, uploadFile, fileExists, getDownloadUrl } from '@/lib/aws/s3';
import { convertDocxToPdf } from '@/lib/documents/docx-to-pdf';

/** Tipurile pe care colaboratorul are voie să le descarce. */
const COLLABORATOR_READABLE_TYPES = ['conventie'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const docId = request.nextUrl.searchParams.get('docId');
    const format = request.nextUrl.searchParams.get('format');

    if (!docId) {
      return NextResponse.json({ success: false, error: 'docId lipsește' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
    }

    try {
      const { collaboratorId } = await resolveCollaboratorContext(
        user.id,
        request.nextUrl.searchParams.get('as')
      );
      await requireCollaboratorForOrder(collaboratorId, orderId);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await (admin as any)
      .from('order_documents')
      .select('id, order_id, type, s3_key, file_name, metadata')
      .eq('id', docId)
      .eq('order_id', orderId)
      .maybeSingle();

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document inexistent' }, { status: 404 });
    }

    const isOwnUpload = doc.metadata?.source === 'collaborator';
    if (!isOwnUpload && !COLLABORATOR_READABLE_TYPES.includes(doc.type)) {
      return NextResponse.json(
        { success: false, error: 'Documentul nu îți este accesibil' },
        { status: 403 }
      );
    }

    const isWord = /\.docx?$/i.test(doc.s3_key || '');

    // Non-Word (PDF-urile încărcate de el) sau original cerut explicit →
    // link semnat direct către obiectul din S3.
    if (!isWord || format === 'docx') {
      const url = await getDownloadUrl(doc.s3_key, 900);
      return NextResponse.json({ success: true, data: { url, fileName: doc.file_name } });
    }

    // DOCX → PDF, cu cache lângă original (aceeași convenție ca în admin).
    const pdfKey = `${doc.s3_key}.preview.pdf`;
    let pdf: Buffer | null = null;

    if (await fileExists(pdfKey)) {
      pdf = await downloadFile(pdfKey);
    } else {
      const docx = await downloadFile(doc.s3_key);
      pdf = await convertDocxToPdf(docx);
      if (pdf) {
        await uploadFile(pdfKey, pdf, 'application/pdf', { 'source-key': doc.s3_key }).catch(() => {});
      }
    }

    if (!pdf) {
      // Fără convertor disponibil — mai bine originalul decât nimic.
      const url = await getDownloadUrl(doc.s3_key, 900);
      return NextResponse.json({ success: true, data: { url, fileName: doc.file_name } });
    }

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${doc.file_name.replace(/\.docx?$/i, '.pdf')}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('[collaborator] document download error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
