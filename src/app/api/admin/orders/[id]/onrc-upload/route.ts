import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { uploadFile, generateFinalDocumentKey } from '@/lib/aws/s3';
import { deliverOnrcResult } from '@/lib/onrc/deliver';

/**
 * Manual ONRC document upload by an operator. Used when a job is NEEDS_OPERATOR /
 * FAILED (e.g. PF with no online RC record, an IMM/insolvență routed to backoffice,
 * or any case the bot couldn't finish): the operator obtains the PDF from ONRC and
 * uploads it here. We attach it to the order (visible to the client), email the
 * client, and mark the queue job DONE so it stops being retried.
 *
 * multipart/form-data: file=<pdf>, registrationNumber=<optional RC number>.
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
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const form = await request.formData();
    const file = form.get('file');
    const registrationNumber = (form.get('registrationNumber') as string | null)?.trim() || undefined;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'Fișier lipsă' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    // Validate it's really a PDF (magic bytes) — we never want to deliver junk.
    if (buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return NextResponse.json({ success: false, error: 'Fișierul trebuie să fie un PDF valid' }, { status: 400 });
    }
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Fișier prea mare (max 20MB)' }, { status: 400 });
    }

    const admin = createAdminClient();

    // The order must exist and be an ONRC job (defensive).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job } = await (admin as any)
      .from('onrc_jobs')
      .select('id, status')
      .eq('order_id', orderId)
      .maybeSingle();

    // Upload the operator's PDF to S3.
    const key = generateFinalDocumentKey(orderId, `onrc-${Date.now()}.pdf`);
    await uploadFile(key, buffer, 'application/pdf', { source: 'onrc-manual', uploadedBy: user.id });

    // Attach to the order + email the client (reuses the worker delivery path).
    await deliverOnrcResult(orderId, key, registrationNumber);

    // Mark the queue job DONE so it stops being retried, and log it.
    if (job?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('onrc_jobs')
        .update({
          status: 'DONE',
          document_url: key,
          registration_number: registrationNumber ?? null,
          downloaded_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('onrc_job_events').insert({
        job_id: job.id,
        type: 'done',
        message: `Document încărcat manual de operator${registrationNumber ? ` (nr. ${registrationNumber})` : ''}`,
      });
    }

    return NextResponse.json({ success: true, data: { s3_key: key } });
  } catch (error) {
    console.error('[onrc] manual upload error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea documentului' }, { status: 500 });
  }
}
