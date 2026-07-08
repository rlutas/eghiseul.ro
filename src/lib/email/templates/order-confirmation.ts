/**
 * Emailul de confirmare comandă trimis clientului imediat după plată.
 * Paritate cu cazierjudiciaronline.com (sendOrderConfirmationEmail):
 * detaliile comenzii + buton mare „Verifică statusul comenzii" care duce la
 * /comanda/status/ pre-completat cu numărul comenzii + emailul.
 */

export interface OrderConfirmationEmailInput {
  friendlyOrderId: string;
  serviceName: string;
  totalRon: number;
  customerName?: string | null;
  /** ISO date — estimated completion, shown as a friendly RO date if present. */
  estimatedDate?: string | null;
  statusUrl: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderOrderConfirmationEmail(input: OrderConfirmationEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { friendlyOrderId, serviceName, totalRon, customerName, estimatedDate, statusUrl } = input;
  const subject = `Confirmare comandă ${friendlyOrderId} — eGhișeul.ro`;
  const hello = customerName ? `Bună, ${esc(customerName)}!` : 'Bună ziua!';
  const estimatedRow = estimatedDate
    ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Termen estimat</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a;font-size:14px;">${esc(
        new Date(estimatedDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
      )}</td></tr>`
    : '';

  const html = `<!doctype html><html lang="ro"><body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Comanda ${esc(friendlyOrderId)} a fost confirmată. Mulțumim pentru încredere!</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#0B1B33;padding:22px 28px;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;">eGhișeul<span style="color:#ECB95F;">.ro</span></span>
      </td></tr>
      <tr><td style="padding:28px;">
        <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Comanda ta a fost confirmată ✅</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">${hello} Am primit plata și am început procesarea comenzii tale. Mulțumim pentru încredere!</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:4px 16px;margin-bottom:22px;">
          <tr><td style="padding:10px 0 6px;color:#64748b;font-size:14px;">Număr comandă</td><td style="padding:10px 0 6px;text-align:right;font-weight:700;color:#0f172a;font-size:14px;font-family:monospace;">${esc(friendlyOrderId)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Serviciu</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a;font-size:14px;">${esc(serviceName)}</td></tr>
          ${estimatedRow}
          <tr><td style="padding:6px 0 12px;color:#64748b;font-size:14px;">Total achitat</td><td style="padding:6px 0 12px;text-align:right;font-weight:800;color:#0f172a;font-size:15px;">${totalRon.toFixed(2)} RON</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
          <a href="${esc(statusUrl)}" style="display:inline-block;background:#ECB95F;color:#0B1B33;font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">Verifică statusul comenzii</a>
        </td></tr></table>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Te ținem la curent pe email la fiecare pas important. Întrebări? Răspundem rapid pe <a href="https://wa.me/40757708181" style="color:#0B1B33;">WhatsApp</a> sau la <a href="mailto:contact@eghiseul.ro" style="color:#0B1B33;">contact@eghiseul.ro</a>.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
        <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">eDigitalizare SRL · CUI RO49278701 · eGhișeul.ro este un serviciu privat de asistență la obținerea de documente; nu suntem instituție de stat.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    `Comanda ta a fost confirmată — eGhișeul.ro`,
    ``,
    `Număr comandă: ${friendlyOrderId}`,
    `Serviciu: ${serviceName}`,
    estimatedDate ? `Termen estimat: ${new Date(estimatedDate).toLocaleDateString('ro-RO')}` : '',
    `Total achitat: ${totalRon.toFixed(2)} RON`,
    ``,
    `Verifică statusul comenzii: ${statusUrl}`,
    ``,
    `Întrebări? WhatsApp +40 757 708 181 · contact@eghiseul.ro`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
