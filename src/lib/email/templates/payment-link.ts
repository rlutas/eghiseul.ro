/**
 * Payment-link email — comenzi telefonice: adminul creează comanda A→Z și
 * trimite clientului link-ul de plată. Link-ul e pagina noastră de checkout
 * (/comanda/checkout/[id]) care mintează o sesiune Stripe nouă la fiecare
 * vizită — deci NU expiră (spre deosebire de un URL de sesiune Stripe).
 */
import { brandedEmailHtml, ctaButton } from './branded-layout';

export interface PaymentLinkEmailInput {
  customerFirstName?: string | null;
  orderNumber: string;
  serviceName: string;
  amountRon: number;
  paymentUrl: string;
}

export function buildPaymentLinkSubject(input: PaymentLinkEmailInput): string {
  return `Comanda ${input.orderNumber} — finalizează plata (${input.amountRon.toFixed(2)} RON)`;
}

export function buildPaymentLinkHtml(input: PaymentLinkEmailInput): string {
  const greeting = input.customerFirstName
    ? `Salut ${escapeHtml(input.customerFirstName)},`
    : 'Salut,';
  return brandedEmailHtml({
    preheader: `Plată ${input.amountRon.toFixed(2)} RON pentru comanda ${input.orderNumber}`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escapeHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${greeting}</h1>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Am înregistrat comanda ta pentru <strong>${escapeHtml(input.serviceName)}</strong>, conform discuției telefonice. Pentru a o pune în lucru, mai e nevoie doar de plată.</p>
        <div style="background:#eff6ff;border:2px solid #93c5fd;border-radius:10px;padding:18px;margin:0 0 20px;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#1e40af;">Total de plată</p>
          <p style="margin:0;font-size:32px;font-weight:bold;color:#1e3a8a;">${input.amountRon.toFixed(2)} RON</p>
          <p style="margin:8px 0 0;font-size:13px;color:#1e40af;">${escapeHtml(input.serviceName)}</p>
        </div>
        <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.6;">Plata se face în siguranță prin Stripe (card, Apple Pay, Google Pay). Datele cardului sunt criptate end-to-end și nu sunt stocate de noi.</p>
        ${ctaButton(`Plătește ${input.amountRon.toFixed(2)} RON`, input.paymentUrl)}
        <p style="margin:14px 0 0;text-align:center;font-size:12px;color:#9ca3af;">După plată primești confirmarea pe email, iar noi ne ocupăm de tot. Orice întrebare — răspunde la acest email.</p>`,
  });
}

export function buildPaymentLinkText(input: PaymentLinkEmailInput): string {
  return [
    `Comanda ${input.orderNumber}`,
    '',
    `Am înregistrat comanda ta pentru ${input.serviceName}, conform discuției telefonice.`,
    `Pentru a o pune în lucru, finalizează plata de ${input.amountRon.toFixed(2)} RON:`,
    '',
    input.paymentUrl,
    '',
    'Plata se face în siguranță prin Stripe. După plată primești confirmarea pe email.',
  ].join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
