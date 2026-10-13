/**
 * „Mai ai nevoie de …?" — plan B10: one email, no coupon, for an eghiseul
 * order left unpaid 7–60 days ago (`/api/cron/reengage-orders`). Not part of
 * the recovery sequence: it is marketing-adjacent, so it carries the
 * unsubscribe note + RFC 8058 headers whenever the client has a `contacts`
 * row (most unpaid clients do not; then the email says „ignoră mesajul" and
 * we never write again about this order anyway).
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { greeting, unsubscribeNoteHtml, unsubscribeNoteText } from './marketing-footer';
import { BRANDS, type Brand } from '@/lib/brand/brands';

export interface ReengageOrderEmailInput {
  customerFirstName?: string | null;
  serviceName: string;
  orderNumber: string;
  startedAt: Date;
  resumeUrl: string;
  unsubscribeUrl?: string | null;
  brand?: Brand;
}

function roDate(d: Date): string {
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', timeZone: 'Europe/Bucharest' });
}

export function renderReengageOrderEmail(input: ReengageOrderEmailInput): { subject: string; html: string; text: string } {
  const b = input.brand ?? BRANDS.eghiseul;
  const svc = input.serviceName.trim() || 'documentul';
  const svcLower = svc.toLowerCase();
  const date = roDate(input.startedAt);
  const hello = greeting(input.customerFirstName);
  const subject = `Mai ai nevoie de ${svcLower}?`;
  const reason = `ai început o comandă pe ${b.name}`;

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: `Comanda începută pe ${date} nu a fost finalizată. Datele tale sunt păstrate.`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Pe ${escHtml(date)} ai început pe ${escHtml(b.name)} o comandă pentru <strong>${escHtml(svc)}</strong>, dar nu ai finalizat-o.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Dacă documentul îți mai trebuie, reiei de unde ai rămas: datele completate sunt păstrate. Dacă te-ai oprit la ceva neclar, răspunde la acest email și te ajutăm.</p>
        ${ctaButton('Reia comanda', input.resumeUrl, input.brand)}
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Dacă ai obținut deja documentul, ignoră mesajul: nu îți mai scriem despre această comandă.</p>
        <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">${escHtml(b.name)} este un serviciu privat, neafiliat instituțiilor statului. Documentele le eliberează instituțiile competente.</p>
        ${input.unsubscribeUrl ? unsubscribeNoteHtml(input.unsubscribeUrl, reason) : ''}`,
  });

  const text = [
    `Comanda ${input.orderNumber}`,
    '',
    hello,
    '',
    `Pe ${date} ai început pe ${b.name} o comandă pentru ${svc}, dar nu ai finalizat-o.`,
    'Dacă documentul îți mai trebuie, reiei de unde ai rămas: datele completate sunt păstrate. Dacă te-ai oprit la ceva neclar, răspunde la acest email și te ajutăm.',
    '',
    `Reia comanda: ${input.resumeUrl}`,
    '',
    'Dacă ai obținut deja documentul, ignoră mesajul: nu îți mai scriem despre această comandă.',
    '',
    `${b.name} este un serviciu privat, neafiliat instituțiilor statului.`,
    ...(input.unsubscribeUrl ? [unsubscribeNoteText(input.unsubscribeUrl)] : []),
  ].join('\n');

  return { subject, html, text };
}
