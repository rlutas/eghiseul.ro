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
import { brandedEmailHtml, ctaButton, infoRows, escHtml } from '@/lib/email/templates/branded-layout';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any;

/**
 * Heads-up către colaboratorul serviciului (ex. Mircea, topograf) la fiecare
 * comandă PLĂTITĂ pe un serviciu din collaborator_service_assignments.
 * Până acum emailul pleca DOAR la asignarea manuală din admin — comenzile din
 * 04.08 (plan-amplasament, copie-inventar-coordonate) au stat nevăzute deși
 * apăreau în portalul lui (raport echipă 05.08.2026). Best effort: nu blochează
 * și nu eliberează claim-ul confirmării clientului.
 */
async function notifyCollaboratorsOfPaidOrder(
  adminClient: AdminClient,
  order: { id: string; friendly_order_id?: string | null; service_id?: string | null },
  serviceName: string
): Promise<void> {
  if (!order.service_id) return;
  const { data: assignments } = await adminClient
    .from('collaborator_service_assignments')
    .select('collaborator_id')
    .eq('service_id', order.service_id);
  if (!assignments?.length) return;

  const friendly = order.friendly_order_id || order.id;
  const portalUrl = `https://eghiseul.ro/colaborator/orders/${order.id}`;
  for (const a of assignments) {
    try {
      const { data: authUser } = await adminClient.auth.admin.getUserById(a.collaborator_id);
      const email = authUser?.user?.email;
      if (!email) continue;
      const html = brandedEmailHtml({
        preheader: `Comandă nouă plătită: ${friendly} — ${serviceName}`,
        content: `
        <h1 style="margin:0 0 6px;color:#0B1B33;font-size:20px;">Comandă nouă pe serviciul tău</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Salut! A intrat o comandă nouă plătită pe unul din serviciile tale din portalul de colaborator.</p>
        ${infoRows([
          { label: 'Comandă', value: friendly, mono: true },
          { label: 'Serviciu', value: escHtml(serviceName) },
        ])}
        <p style="margin:18px 0 0;color:#475569;font-size:14px;line-height:1.6;">Toate datele pentru lucrare (imobil, adresă, proprietar) sunt în portal:</p>
        ${ctaButton('Deschide comanda', portalUrl)}`,
      });
      await sendEmail({
        to: email,
        subject: `Comandă nouă: ${friendly} — ${serviceName}`,
        html,
        text: `Salut! A intrat comanda plătită ${friendly} (${serviceName}) pe serviciul tău. Datele lucrării sunt în portal: ${portalUrl}`,
        idempotencyKey: `collab-newpaid-${order.id}-${a.collaborator_id}`,
      });
      console.log(`[order-confirmation] collaborator heads-up sent for ${friendly} → ${email}`);
    } catch (e) {
      console.warn(`[order-confirmation] collaborator heads-up failed for ${friendly}:`, e instanceof Error ? e.message : e);
    }
  }
}

export async function sendOrderConfirmationIfNeeded(adminClient: AdminClient, orderId: string): Promise<void> {
  // Atomic claim: only rows still unclaimed AND paid get stamped.
  const { data: claimed, error: claimError } = await adminClient
    .from('orders')
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('confirmation_email_sent_at', null)
    .eq('payment_status', 'paid')
    .select('id, friendly_order_id, service_id, total_price, estimated_completion_date, customer_data, services(name)')
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

    // Heads-up colaborator (după emailul clientului; nu afectează claim-ul).
    await notifyCollaboratorsOfPaidOrder(
      adminClient,
      { id: claimed.id, friendly_order_id: claimed.friendly_order_id, service_id: claimed.service_id },
      service?.name || 'Serviciu eGhișeul.ro'
    );
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
