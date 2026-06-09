/**
 * Email sent to a customer when the team needs them to re-upload a KYC photo
 * (currently the selfie) after the order was placed. Triggered from the admin
 * order page via POST /api/admin/orders/[id]/request-reupload.
 *
 * Contains a single-use, expiring link to /reincarca-poza/<token>. Both HTML
 * and plain-text are produced; the body is fully inline (no external assets).
 */

export interface ReuploadEmailInput {
  customerFirstName?: string | null;
  /** Friendly order code shown for reference, e.g. "E-260609-AB12C". */
  orderNumber: string;
  /** Human label of the document to re-upload, e.g. "selfie cu actul de identitate". */
  documentLabel: string;
  /** Optional operator note explaining why. */
  reason?: string | null;
  /** Absolute link to the re-upload page. */
  reuploadUrl: string;
  /** Human-readable expiry, e.g. "16 iunie 2026". */
  expiresLabel: string;
}

export function buildReuploadSubject(input: ReuploadEmailInput): string {
  return `Acțiune necesară: reîncarcă ${input.documentLabel} — comanda ${input.orderNumber}`;
}

export function buildReuploadHtml(input: ReuploadEmailInput): string {
  const greeting = input.customerFirstName
    ? `Salut ${escapeHtml(input.customerFirstName)},`
    : 'Salut,';
  const reasonBlock = input.reason
    ? `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6">
         <strong>Motiv:</strong> ${escapeHtml(input.reason)}
       </p>`
    : '';
  return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(buildReuploadSubject(input))}</title>
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px 28px">
        <p style="margin:0 0 12px 0;font-size:14px;color:#6b7280">Comanda ${escapeHtml(input.orderNumber)}</p>
        <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:#111827">${greeting}</h1>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6">
          Pentru a continua procesarea comenzii tale, avem nevoie să reîncarci
          <strong>${escapeHtml(input.documentLabel)}</strong>. Durează mai puțin de un minut.
        </p>
        ${reasonBlock}
        <div style="text-align:center;margin:28px 0">
          <a href="${escapeAttr(input.reuploadUrl)}"
             style="display:inline-block;background:#ECB95F;color:#1f2937;font-weight:600;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:10px">
            Reîncarcă poza
          </a>
        </div>
        <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#6b7280">
          Sau copiază acest link în browser:
        </p>
        <p style="margin:0 0 16px 0;font-size:13px;line-height:1.5;word-break:break-all">
          <a href="${escapeAttr(input.reuploadUrl)}" style="color:#b8860b">${escapeHtml(input.reuploadUrl)}</a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280">
          Linkul este valabil până la <strong>${escapeHtml(input.expiresLabel)}</strong> și poate fi
          folosit o singură dată. Dacă nu ai solicitat această acțiune, ignoră acest email.
        </p>
      </div>
      <p style="text-align:center;margin:16px 0 0 0;font-size:12px;color:#9ca3af">
        eGhișeul.ro — servicii publice digitalizate
      </p>
    </div>
  </body>
</html>`;
}

export function buildReuploadText(input: ReuploadEmailInput): string {
  const greeting = input.customerFirstName ? `Salut ${input.customerFirstName},` : 'Salut,';
  const reason = input.reason ? `\nMotiv: ${input.reason}\n` : '';
  return [
    `Comanda ${input.orderNumber}`,
    '',
    greeting,
    '',
    `Pentru a continua procesarea comenzii, te rugăm să reîncarci ${input.documentLabel}.`,
    reason,
    `Deschide acest link (valabil până la ${input.expiresLabel}, o singură utilizare):`,
    input.reuploadUrl,
    '',
    'Dacă nu ai solicitat această acțiune, ignoră acest email.',
    '',
    'eGhișeul.ro',
  ].join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;');
}
