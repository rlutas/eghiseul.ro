/**
 * Emails for the order message thread (`order_messages`).
 *
 * - `renderOrderMessageToClientEmail`: the team or the topograph wrote to the
 *   client. The message is quoted in full, so a client who only reads email
 *   still gets the question; the button opens the status page on the thread,
 *   where they can reply (and attach a photo of an act).
 * - `renderOrderMessageToStaffEmail`: the client replied. Goes to the brand's
 *   inbox and to the topograph when the order is his, with a link to the
 *   order in admin / in the collaborator portal.
 */

import { brandedEmailHtml, ctaButton, escHtml, infoRows } from './branded-layout';
import { BRANDS, type Brand } from '@/lib/brand/brands';

function quoteHtml(body: string): string {
  const paragraphs = escHtml(body)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, '<br>'))
    .map((p) => `<p style="margin:0 0 10px;">${p}</p>`)
    .join('');
  return `<div style="background:#f8fafc;border-left:4px solid #cbd5e1;border-radius:8px;padding:14px 16px 4px;margin:0 0 20px;color:#0f172a;font-size:14px;line-height:1.6;">${paragraphs}</div>`;
}

export interface OrderMessageToClientInput {
  friendlyOrderId: string;
  serviceName: string;
  /** „Echipa eGhișeul" / „Topograful" — who wrote, as the client sees it. */
  authorLabel: string;
  body: string;
  /** Status page, pre-filled, anchored on the thread. */
  viewUrl: string;
  brand?: Brand;
}

export function renderOrderMessageToClientEmail(input: OrderMessageToClientInput): {
  subject: string;
  html: string;
  text: string;
} {
  const b = input.brand ?? BRANDS.eghiseul;
  const subject = `Comanda ${input.friendlyOrderId}: ai un mesaj nou`;
  const content = `        <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Ai un mesaj nou despre comanda ta</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">${escHtml(input.authorLabel)} ți-a scris despre comanda ${escHtml(input.friendlyOrderId)} (${escHtml(input.serviceName)}):</p>
        ${quoteHtml(input.body)}
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Poți răspunde direct din pagina comenzii. Dacă ți se cere un act, îl poți atașa acolo ca poză sau PDF.</p>
        ${ctaButton('Vezi mesajul și răspunde', input.viewUrl, b)}`;
  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: input.body.slice(0, 140),
    content,
  });
  const text = [
    `${input.authorLabel} ți-a scris despre comanda ${input.friendlyOrderId} (${input.serviceName}):`,
    '',
    input.body,
    '',
    `Răspunde din pagina comenzii: ${input.viewUrl}`,
    '',
    `Întrebări? WhatsApp ${b.phoneDisplay} · ${b.contactEmail}`,
  ].join('\n');
  return { subject, html, text };
}

export interface OrderMessageToStaffInput {
  friendlyOrderId: string;
  serviceName: string;
  clientName: string;
  body: string;
  attachmentCount: number;
  orderUrl: string;
}

export function renderOrderMessageToStaffEmail(input: OrderMessageToStaffInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Răspuns de la client: ${input.friendlyOrderId} — ${input.serviceName}`;
  const rows = [
    { label: 'Comandă', value: input.friendlyOrderId, mono: true },
    { label: 'Serviciu', value: input.serviceName },
    { label: 'Client', value: input.clientName || '—' },
    ...(input.attachmentCount > 0
      ? [{ label: 'Atașamente', value: String(input.attachmentCount) }]
      : []),
  ];
  const content = `        <h1 style="margin:0 0 6px;color:#0B1B33;font-size:20px;">Clientul a răspuns</h1>
        ${infoRows(rows)}
        ${quoteHtml(input.body)}
        ${ctaButton('Deschide comanda', input.orderUrl)}`;
  const html = brandedEmailHtml({
    preheader: `${input.friendlyOrderId}: ${input.body.slice(0, 120)}`,
    content,
  });
  const text = [
    `Clientul a răspuns pe comanda ${input.friendlyOrderId} (${input.serviceName}):`,
    '',
    input.body,
    input.attachmentCount > 0 ? `\nAtașamente: ${input.attachmentCount}` : '',
    '',
    `Deschide comanda: ${input.orderUrl}`,
  ].join('\n');
  return { subject, html, text };
}
