/**
 * Delivers a completed ANCPI extras de carte funciară to the customer:
 *  - attaches the worker-uploaded PDF to the order (visible to the client),
 *  - optionally attaches the ANCPI receipt (chitanță) for the client's records,
 *  - marks the order document-ready,
 *  - emails the client that it's available.
 *
 * Called from POST /api/ancpi/result when the worker reports DONE. Idempotent:
 * re-running won't duplicate the attachment, the status update is a no-op, and
 * the email uses an idempotency key. Mirrors lib/onrc/deliver.ts.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { renderDocumentReadyEmail } from '@/lib/email/templates/document-ready';

export async function deliverAncpiResult(
  orderId: string,
  documentUrl: string | string[] | undefined,
  registrationNumber: string | undefined,
  chitantaUrl?: string | undefined
): Promise<void> {
  const documentUrls = (Array.isArray(documentUrl) ? documentUrl : [documentUrl]).filter(
    (k): k is string => !!k
  );
  if (documentUrls.length === 0) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data: order } = await supabase
      .from('orders')
      .select('id, friendly_order_id, customer_data')
      .eq('id', orderId)
      .single();
    if (!order) return;

    const friendly: string = order.friendly_order_id ?? orderId;
    const multi = documentUrls.length > 1;

    // 1. Attach each extras document (idempotent on s3_key).
    for (let i = 0; i < documentUrls.length; i++) {
      const key = documentUrls[i]!;
      const fileName = multi
        ? `Extras-Carte-Funciara-${friendly}-${i + 1}.pdf`
        : `Extras-Carte-Funciara-${friendly}.pdf`;
      const { data: existing } = await supabase
        .from('order_documents')
        .select('id')
        .eq('order_id', orderId)
        .eq('s3_key', key)
        .maybeSingle();
      if (!existing) {
        await supabase.from('order_documents').insert({
          order_id: orderId,
          type: 'extras-carte-funciara',
          s3_key: key,
          file_name: fileName,
          mime_type: 'application/pdf',
          document_number: i === 0 ? registrationNumber ?? null : null,
          visible_to_client: true,
          metadata: { source: 'ancpi-worker', registration_number: registrationNumber ?? null },
        });
      }
    }

    // 1b. Attach the ANCPI receipt (chitanță) — for the client's records.
    if (chitantaUrl) {
      const { data: existingReceipt } = await supabase
        .from('order_documents')
        .select('id')
        .eq('order_id', orderId)
        .eq('s3_key', chitantaUrl)
        .maybeSingle();
      if (!existingReceipt) {
        await supabase.from('order_documents').insert({
          order_id: orderId,
          type: 'ancpi-chitanta',
          s3_key: chitantaUrl,
          file_name: `Chitanta-ANCPI-${friendly}.pdf`,
          mime_type: 'application/pdf',
          visible_to_client: true,
          metadata: { source: 'ancpi-worker' },
        });
      }
    }

    // 2. Mark the order document-ready (valid status in the workflow).
    await supabase
      .from('orders')
      .update({ status: 'document_ready', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    // 3. Email the client.
    const email: string | undefined = order.customer_data?.contact?.email;
    if (email) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://eghiseul.ro';
      const mail = renderDocumentReadyEmail({
        friendlyOrderId: friendly,
        documentLabel: 'Extrasul de Carte Funciară',
        registrationNumber: registrationNumber ?? null,
        viewUrl: `${appUrl}/comanda/status/?order=${encodeURIComponent(friendly)}&email=${encodeURIComponent(email)}`,
      });
      await sendEmail({
        to: email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        idempotencyKey: `ancpi-deliver-${orderId}`,
      });
    }
  } catch (err) {
    // Delivery problems must not 500 the worker callback — the job is already
    // marked DONE; an operator can re-deliver from /admin/ancpi if needed.
    console.error('[ancpi] deliverAncpiResult error:', err);
  }
}
