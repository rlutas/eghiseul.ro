/**
 * Internal notification sent to the team inbox when a customer finishes
 * uploading all documents requested via "Solicită documente". Fired from
 * POST /api/reupload/[token] on the last document. Uses the shared branded
 * shell for consistency.
 */

import { brandedEmailHtml, bulletList, ctaButton, escHtml, infoRows } from './branded-layout';

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
  const rows = [
    { label: 'Comandă', value: input.orderNumber, mono: true },
    {
      label: 'Status',
      value: input.restoredStatus
        ? `Revenit din așteptare → ${input.restoredStatus}`
        : 'Nemodificat (nu era în așteptare)',
    },
  ];
  const content = `        <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Clientul a încărcat documentele ✅</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Toate documentele solicitate au sosit${escHtml(input.restoredStatus ? ' — termenul estimat a fost ajustat automat cu zilele pauzate.' : '.')} Verificați-le înainte de procesare (comanda a reapărut la verificare KYC).</p>
        ${infoRows(rows)}
        <p style="margin:0 0 8px;color:#475569;font-size:14px;">Documente primite:</p>
        ${bulletList(input.documentLabels)}
        ${ctaButton('Deschide comanda în admin', input.adminOrderUrl)}`;

  return brandedEmailHtml({
    preheader: `Comanda ${input.orderNumber}: documentele solicitate au sosit.`,
    content,
  });
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
