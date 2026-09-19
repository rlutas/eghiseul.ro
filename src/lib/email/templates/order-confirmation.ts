/**
 * Emailul de confirmare comandă trimis clientului imediat după plată.
 * Paritate cu cazierjudiciaronline.com (sendOrderConfirmationEmail):
 * detaliile comenzii + buton mare „Verifică statusul comenzii" care duce la
 * /comanda/status/ pre-completat cu numărul comenzii + emailul.
 */

import { BRANDS, brandById, type Brand, type BrandId } from '@/lib/brand/brands';

export interface OrderConfirmationEmailInput {
  friendlyOrderId: string;
  serviceName: string;
  totalRon: number;
  customerName?: string | null;
  /** ISO date — estimated completion, shown as a friendly RO date if present. */
  estimatedDate?: string | null;
  statusUrl: string;
  /** The order's brand (`brandForOrder(order)`); default eghiseul. */
  brand?: Brand | BrandId;
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
  const brand: Brand = !input.brand ? BRANDS.eghiseul : typeof input.brand === 'string' ? brandById(input.brand) : input.brand;
  const subject = `Confirmare comandă ${friendlyOrderId} — ${brand.name}`;
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
      <tr><td style="background:${brand.emailHeaderBg};padding:22px 28px;">
        <img src="${esc(brand.emailLogoUrl)}" alt="${esc(brand.name)}" width="165" height="40" style="display:block;border:0;height:40px;width:auto;">
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
          <a href="${esc(statusUrl)}" style="display:inline-block;background:${brand.emailCtaBg};color:${brand.emailCtaFg};font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">Verifică statusul comenzii</a>
        </td></tr></table>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Te ținem la curent pe email la fiecare pas important. Întrebări? Răspundem rapid pe <a href="${brand.baseUrl}/contact" style="color:${brand.emailHeaderBg};">WhatsApp (pagina de contact)</a> sau la <a href="mailto:${brand.contactEmail}" style="color:${brand.emailHeaderBg};">${brand.contactEmail}</a>.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
        <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">${esc(brand.legalTagline)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    `Comanda ta a fost confirmată — ${brand.name}`,
    ``,
    `Număr comandă: ${friendlyOrderId}`,
    `Serviciu: ${serviceName}`,
    estimatedDate ? `Termen estimat: ${new Date(estimatedDate).toLocaleDateString('ro-RO')}` : '',
    `Total achitat: ${totalRon.toFixed(2)} RON`,
    ``,
    `Verifică statusul comenzii: ${statusUrl}`,
    ``,
    `Întrebări? WhatsApp ${brand.phoneDisplay} · ${brand.contactEmail}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
