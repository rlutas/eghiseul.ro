/**
 * Internal notification sent to the team inbox when a customer finishes
 * uploading all documents requested via "Solicită documente". Fired from
 * POST /api/reupload/[token] on the last document.
 */

export interface ReuploadCompletedInput {
  orderNumber: string;
  /** Absolute link to the admin order page. */
  adminOrderUrl: string;
  /** Human labels of the documents that were uploaded. */
  documentLabels: string[];
  /** Status the order was restored to (null = order was not in standby). */
  restoredStatus: string | null;
}

export function buildReuploadCompletedSubject(input: ReuploadCompletedInput): string {
  return `📄 Documente primite de la client — comanda ${input.orderNumber}`;
}

export function buildReuploadCompletedHtml(input: ReuploadCompletedInput): string {
  const docList = input.documentLabels
    .map((l) => `<li style="margin:0 0 4px 0;font-size:14px;line-height:1.5">${escapeHtml(l)}</li>`)
    .join('');
  const statusLine = input.restoredStatus
    ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151">
         Comanda a ieșit din așteptare și a revenit la statusul
         <strong>${escapeHtml(input.restoredStatus)}</strong> (termenul estimat a fost ajustat automat).
       </p>`
    : '';
  return `<!doctype html>
<html lang="ro">
  <head><meta charset="utf-8" /><title>${escapeHtml(buildReuploadCompletedSubject(input))}</title></head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1f2937">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px">
        <h1 style="margin:0 0 12px 0;font-size:18px;color:#111827">
          Clientul a încărcat documentele solicitate
        </h1>
        <p style="margin:0 0 12px 0;font-size:14px;color:#374151">
          Comanda <strong>${escapeHtml(input.orderNumber)}</strong> — documente primite:
        </p>
        <ul style="margin:0 0 16px 0;padding-left:20px">${docList}</ul>
        ${statusLine}
        <div style="margin:20px 0 0 0">
          <a href="${escapeAttr(input.adminOrderUrl)}"
             style="display:inline-block;background:#ECB95F;color:#1f2937;font-weight:600;font-size:14px;text-decoration:none;padding:10px 20px;border-radius:8px">
            Deschide comanda în admin
          </a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function buildReuploadCompletedText(input: ReuploadCompletedInput): string {
  return [
    `Clientul a încărcat documentele solicitate — comanda ${input.orderNumber}`,
    '',
    'Documente primite:',
    ...input.documentLabels.map((l) => `  - ${l}`),
    '',
    input.restoredStatus
      ? `Comanda a revenit automat la statusul: ${input.restoredStatus}`
      : 'Comanda nu era în așteptare (statusul nu s-a schimbat).',
    '',
    `Admin: ${input.adminOrderUrl}`,
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
