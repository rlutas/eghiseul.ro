/**
 * Email sent to a customer when the team needs them to (re)upload one or more
 * documents after the order was placed ("Solicită documente"). Triggered from
 * the admin order page via POST /api/admin/orders/[id]/request-reupload.
 *
 * Contains a single-use, expiring link to /reincarca-poza/<token>. Uses the
 * shared branded shell so it matches the order confirmation email.
 */

import { brandedEmailHtml, bulletList, ctaButton, escHtml } from './branded-layout';

export interface ReuploadEmailInput {
  customerFirstName?: string | null;
  /** Friendly order code shown for reference, e.g. "E-260609-AB12C". */
  orderNumber: string;
  /** Human labels of the requested documents. */
  documentLabels: string[];
  /** Optional operator note explaining why. */
  reason?: string | null;
  /** Absolute link to the upload page. */
  reuploadUrl: string;
  /** Human-readable expiry, e.g. "16 iunie 2026". */
  expiresLabel: string;
}

export function buildReuploadSubject(input: ReuploadEmailInput): string {
  const what =
    input.documentLabels.length === 1
      ? input.documentLabels[0].toLowerCase()
      : `${input.documentLabels.length} documente`;
  return `Acțiune necesară: încarcă ${what} — comanda ${input.orderNumber}`;
}

export function buildReuploadHtml(input: ReuploadEmailInput): string {
  const hello = input.customerFirstName
    ? `Bună, ${escHtml(input.customerFirstName)}!`
    : 'Bună ziua!';
  const reasonBlock = input.reason
    ? `<p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;"><strong>Motiv:</strong> ${escHtml(input.reason)}</p>`
    : '';

  const content = `        <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Avem nevoie de documente de la tine 📄</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">${hello} Pentru a continua procesarea comenzii <strong style="font-family:monospace;">${escHtml(input.orderNumber)}</strong>, te rugăm să încarci ${input.documentLabels.length === 1 ? 'următorul document' : 'următoarele documente'}:</p>
        ${bulletList(input.documentLabels)}
        ${reasonBlock}
        ${ctaButton(input.documentLabels.length === 1 ? 'Încarcă documentul' : 'Încarcă documentele', input.reuploadUrl)}
        <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Linkul este valabil până la <strong>${escHtml(input.expiresLabel)}</strong>. Comanda ta este în așteptare până primim documentele — durează sub un minut de pe telefon. Dacă butonul nu funcționează, copiază linkul: <a href="${escHtml(input.reuploadUrl)}" style="color:#0B1B33;word-break:break-all;">${escHtml(input.reuploadUrl)}</a></p>`;

  return brandedEmailHtml({
    preheader: `Comanda ${input.orderNumber} este în așteptare — încarcă documentele solicitate.`,
    content,
  });
}

export function buildReuploadText(input: ReuploadEmailInput): string {
  const greeting = input.customerFirstName ? `Bună, ${input.customerFirstName}!` : 'Bună ziua!';
  const reason = input.reason ? `\nMotiv: ${input.reason}\n` : '';
  return [
    `Comanda ${input.orderNumber}`,
    '',
    greeting,
    '',
    `Pentru a continua procesarea comenzii, te rugăm să încarci ${
      input.documentLabels.length === 1 ? 'următorul document' : 'următoarele documente'
    }:`,
    ...input.documentLabels.map((l) => `  - ${l}`),
    reason,
    `Deschide acest link (valabil până la ${input.expiresLabel}):`,
    input.reuploadUrl,
    '',
    'Comanda ta este în așteptare până primim documentele.',
    'Dacă nu ai solicitat această acțiune, ignoră acest email.',
    '',
    'eGhișeul.ro · WhatsApp +40 757 708 181 · contact@eghiseul.ro',
  ].join('\n');
}
