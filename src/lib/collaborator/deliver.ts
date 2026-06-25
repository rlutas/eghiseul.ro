/**
 * Delivers a collaborator-fulfilled order to the customer:
 *  - verifies the collaborator has attached at least one client-visible document,
 *  - marks the order document-ready,
 *  - emails the client that it's available in their account.
 *
 * Called from POST /api/collaborator/orders/[id]/mark-ready. Idempotent:
 * re-running re-checks the document, the status update is a no-op, and the
 * email uses an idempotency key. Mirrors lib/ancpi/deliver.ts.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';

export interface DeliverResult {
  ok: boolean;
  error?: string;
}

export async function deliverCollaboratorResult(orderId: string): Promise<DeliverResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: order } = await supabase
    .from('orders')
    .select('id, friendly_order_id, customer_data, status, services:service_id(name)')
    .eq('id', orderId)
    .single();
  if (!order) return { ok: false, error: 'Order not found' };

  // The collaborator uploads documents as not-yet-visible. Releasing the order
  // flips them visible to the client. Require at least one before delivering.
  const { count } = await supabase
    .from('order_documents')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', orderId)
    .eq('metadata->>source', 'collaborator');
  if (!count || count < 1) {
    return { ok: false, error: 'Atașează documentul înainte de a marca comanda gata.' };
  }

  await supabase
    .from('order_documents')
    .update({ visible_to_client: true })
    .eq('order_id', orderId)
    .eq('metadata->>source', 'collaborator');

  const friendly: string = order.friendly_order_id ?? orderId;
  const serviceName: string = order.services?.name ?? 'documentul';

  // Mark document-ready (valid status in the workflow).
  await supabase
    .from('orders')
    .update({ status: 'document_ready', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  // Email the client.
  const email: string | undefined = order.customer_data?.contact?.email;
  if (email) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://eghiseul.ro';
    try {
      await sendEmail({
        to: email,
        subject: `Documentul pentru comanda ${friendly} este gata`,
        html: `
          <p>Bună,</p>
          <p>${serviceName} pentru comanda <strong>${friendly}</strong> a fost emis și este disponibil în contul tău.</p>
          <p><a href="${appUrl}/account">Vezi comanda și descarcă documentul</a></p>
          <p>Mulțumim,<br/>eGhișeul.ro</p>
        `,
        idempotencyKey: `collaborator-deliver-${orderId}`,
      });
    } catch (err) {
      // Email failure must not block the status update — operator can re-deliver.
      console.error('[collaborator] deliver email error:', err instanceof Error ? err.message : err);
    }
  }

  return { ok: true };
}
