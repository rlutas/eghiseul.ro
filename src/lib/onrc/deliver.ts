/**
 * Delivers a completed ONRC document to the customer:
 *  - attaches the worker-uploaded PDF to the order (visible to the client),
 *  - marks the order document-ready,
 *  - emails the client that it's available.
 *
 * Called from POST /api/onrc/result when the worker reports DONE. Idempotent:
 * re-running won't duplicate the attachment, the status update is a no-op, and
 * the email uses an idempotency key.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { renderDocumentReadyEmail } from '@/lib/email/templates/document-ready';
import { appBaseForOrder, brandForOrder } from '@/lib/brand/for-order';

export async function deliverOnrcResult(
  orderId: string,
  documentUrl: string | undefined,
  registrationNumber: string | undefined
): Promise<void> {
  if (!documentUrl) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data: order } = await supabase
      .from('orders')
      .select('id, friendly_order_id, customer_data, platform')
      .eq('id', orderId)
      .single();
    if (!order) return;

    const friendly: string = order.friendly_order_id ?? orderId;
    const fileName = `Certificat-Constatator-${friendly}.pdf`;

    // 1. Attach the document (idempotent on s3_key).
    const { data: existing } = await supabase
      .from('order_documents')
      .select('id')
      .eq('order_id', orderId)
      .eq('s3_key', documentUrl)
      .maybeSingle();

    if (!existing) {
      await supabase.from('order_documents').insert({
        order_id: orderId,
        type: 'constatator',
        s3_key: documentUrl,
        file_name: fileName,
        mime_type: 'application/pdf',
        document_number: registrationNumber ?? null,
        visible_to_client: true,
        metadata: { source: 'onrc-worker', registration_number: registrationNumber ?? null },
      });
    }

    // 2. Mark the order document-ready (valid status in the workflow).
    await supabase
      .from('orders')
      .update({ status: 'document_ready', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    // 3. Email the client.
    const email: string | undefined = order.customer_data?.contact?.email;
    if (email) {
      // The ORDER's brand (orders.platform): status link, header and sender follow it.
      const brand = brandForOrder(order);
      const appUrl = appBaseForOrder(order);
      const mail = renderDocumentReadyEmail({
        brand,
        friendlyOrderId: friendly,
        documentLabel: 'Certificatul Constatator',
        registrationNumber: registrationNumber ?? null,
        viewUrl: `${appUrl}/comanda/status/?order=${encodeURIComponent(friendly)}&email=${encodeURIComponent(email)}`,
      });
      await sendEmail({
        to: email,
        from: brand.emailFrom,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        idempotencyKey: `onrc-deliver-${orderId}`,
      });
    }
  } catch (err) {
    // Delivery problems must not 500 the worker callback — the job is already
    // marked DONE; an operator can re-deliver from /admin/onrc if needed.
    console.error('[onrc] deliverOnrcResult error:', err);
  }
}
