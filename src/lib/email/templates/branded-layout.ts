/**
 * Shared branded email shell — the same visual language as the order
 * confirmation email (navy header with the eGhișeul.ro wordmark, white card,
 * gold CTA button, legal footer). Templates compose their inner content and
 * wrap it with `brandedEmailHtml` so every customer-facing email looks the
 * same.
 *
 * Two brands since 2026-09-19: pass `brand` (the ORDER's brand) to get the
 * documentero header, colors, contact and legal line. See src/lib/brand/.
 */

import { BRANDS, brandById, type Brand, type BrandId } from '@/lib/brand/brands';

export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface BrandedEmailInput {
  /** Hidden inbox-preview line. */
  preheader: string;
  /** Inner HTML of the white card (already escaped by the caller). */
  content: string;
  /**
   * The brand the email speaks for — for order emails, ALWAYS the order's
   * brand (`brandForOrder(order)`), never the current host. Omitted =
   * eghiseul, so the 49 existing callers are unchanged.
   */
  brand?: Brand | BrandId;
}

function resolveBrand(brand: Brand | BrandId | undefined): Brand {
  if (!brand) return BRANDS.eghiseul;
  return typeof brand === 'string' ? brandById(brand) : brand;
}

export function brandedEmailHtml({ preheader, content, brand: brandIn }: BrandedEmailInput): string {
  const brand = resolveBrand(brandIn);
  return `<!doctype html><html lang="ro"><body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${escHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr><td style="background:${brand.emailHeaderBg};padding:18px 28px;">
        <img src="${escHtml(brand.emailLogoUrl)}" alt="${escHtml(brand.name)}" width="165" height="40" style="display:block;border:0;height:40px;width:auto;">
      </td></tr>
      <tr><td style="padding:28px;">
${content}
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Întrebări? Răspundem rapid pe <a href="${brand.baseUrl}/contact" style="color:${brand.emailHeaderBg};">WhatsApp (pagina de contact)</a> sau la <a href="mailto:${brand.contactEmail}" style="color:${brand.emailHeaderBg};">${brand.contactEmail}</a>.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
        <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">${escHtml(brand.legalTagline)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

/** CTA button, centered — brand colors (gold on navy for eghiseul). */
export function ctaButton(label: string, url: string, brandIn?: Brand | BrandId): string {
  const brand = resolveBrand(brandIn);
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
          <a href="${escHtml(url)}" style="display:inline-block;background:${brand.emailCtaBg};color:${brand.emailCtaFg};font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">${escHtml(label)}</a>
        </td></tr></table>`;
}

/** Slate info box with label/value rows — same as the confirmation email. */
export function infoRows(rows: Array<{ label: string; value: string; mono?: boolean }>): string {
  const inner = rows
    .map(
      ({ label, value, mono }, i) =>
        `<tr><td style="padding:${i === 0 ? '10px 0 6px' : '6px 0'};color:#64748b;font-size:14px;">${escHtml(label)}</td><td style="padding:${i === 0 ? '10px 0 6px' : '6px 0'};text-align:right;font-weight:${mono ? '700' : '600'};color:#0f172a;font-size:14px;${mono ? 'font-family:monospace;' : ''}">${escHtml(value)}</td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:4px 16px;margin-bottom:22px;">${inner}</table>`;
}

/** Bulleted list, matching the card typography. */
export function bulletList(items: string[]): string {
  return `<ul style="margin:0 0 18px;padding-left:20px;color:#0f172a;font-size:14px;line-height:1.8;">${items
    .map((i) => `<li>${escHtml(i)}</li>`)
    .join('')}</ul>`;
}
