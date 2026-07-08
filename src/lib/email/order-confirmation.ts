/**
 * sendOrderConfirmationIfNeeded — trimite clientului emailul de confirmare
 * comandă EXACT O DATĂ per comandă (claim atomic pe
 * orders.confirmation_email_sent_at, migrarea 097).
 *
 * Chemat din ambele căi de plată (webhook Stripe + confirm-payment) — doar
 * primul apel care revendică rândul trimite. La eșec de trimitere, claim-ul
 * se eliberează ca un retry ulterior să poată reîncerca.
 */
import { sendEmail } from '@/lib/email/resend';
import { renderOrderConfirmationEmail } from '@/lib/email/templates/order-confirmation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any;

export async function sendOrderConfirmationIfNeeded(adminClient: AdminClient, orderId: string): Promise<void> {
  // Atomic claim: only rows still unclaimed AND paid get stamped.
  const { data: claimed, error: claimError } = await adminClient
    .from('orders')
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('confirmation_email_sent_at', null)
    .eq('payment_status', 'paid')
    .select('id, friendly_order_id, total_price, estimated_completion_date, customer_data, services(name)')
    .maybeSingle();

  if (claimError) {
    console.error(`[order-confirmation] claim failed for ${orderId}:`, claimError.message);
    return;
  }
  if (!claimed) return; // already sent (or not paid) — nothing to do

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = claimed.customer_data as any;
    const email: string | undefined = cd?.contact?.email;
    if (!email) {
      console.error(`[order-confirmation] no contact email on order ${orderId} — skipping`);
      return; // keep the claim: without an address a retry won't help either
    }
    const friendly = claimed.friendly_order_id || orderId;
    const firstName = cd?.contact?.firstName || cd?.personal?.firstName || cd?.billing?.firstName || null;
    const service = Array.isArray(claimed.services) ? claimed.services[0] : claimed.services;
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const statusUrl = `${base}/comanda/status/?order=${encodeURIComponent(friendly)}&email=${encodeURIComponent(email)}`;

    const mail = renderOrderConfirmationEmail({
      friendlyOrderId: friendly,
      serviceName: service?.name || 'Serviciu eGhișeul.ro',
      totalRon: Number(claimed.total_price) || 0,
      customerName: firstName,
      estimatedDate: claimed.estimated_completion_date || null,
      statusUrl,
    });

    await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
    console.log(`[order-confirmation] sent for ${friendly} → ${email}`);
  } catch (err) {
    console.error(`[order-confirmation] send failed for ${orderId}, releasing claim:`, err instanceof Error ? err.message : err);
    // Release the claim so a later trigger (webhook retry / confirm-payment)
    // can attempt again.
    await adminClient
      .from('orders')
      .update({ confirmation_email_sent_at: null })
      .eq('id', orderId);
  }
}
