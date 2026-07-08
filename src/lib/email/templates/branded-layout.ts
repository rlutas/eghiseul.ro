/**
 * Shared branded email shell — the same visual language as the order
 * confirmation email (navy header with the eGhișeul.ro wordmark, white card,
 * gold CTA button, legal footer). Templates compose their inner content and
 * wrap it with `brandedEmailHtml` so every customer-facing email looks the
 * same.
 */

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
}

export function brandedEmailHtml({ preheader, content }: BrandedEmailInput): string {
  return `<!doctype html><html lang="ro"><body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${escHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#0B1B33;padding:22px 28px;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;">eGhișeul<span style="color:#ECB95F;">.ro</span></span>
      </td></tr>
      <tr><td style="padding:28px;">
${content}
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Întrebări? Răspundem rapid pe <a href="https://wa.me/40757708181" style="color:#0B1B33;">WhatsApp</a> sau la <a href="mailto:contact@eghiseul.ro" style="color:#0B1B33;">contact@eghiseul.ro</a>.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
        <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">eDigitalizare SRL · CUI RO49278701 · eGhișeul.ro este un serviciu privat de asistență la obținerea de documente; nu suntem instituție de stat.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

/** Gold CTA button, centered — same as the confirmation email. */
export function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
          <a href="${escHtml(url)}" style="display:inline-block;background:#ECB95F;color:#0B1B33;font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">${escHtml(label)}</a>
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
