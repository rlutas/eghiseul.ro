/**
 * Completion-request email — comenzi telefonice: după plată, clientul
 * primește link-ul personalizat unde încarcă actele și semnează contractul.
 * Link-ul cere confirmarea emailului comenzii la deschidere.
 */
import { brandedEmailHtml, ctaButton } from './branded-layout';

export interface CompletionRequestEmailInput {
  customerFirstName?: string | null;
  orderNumber: string;
  serviceName: string;
  documentLabels: string[];
  signatureRequired: boolean;
  completionUrl: string;
  expiresLabel: string;
}

export function buildCompletionRequestSubject(input: CompletionRequestEmailInput): string {
  return `Comanda ${input.orderNumber} — un ultim pas: actele și semnătura`;
}

export function buildCompletionRequestHtml(input: CompletionRequestEmailInput): string {
  const greeting = input.customerFirstName
    ? `Salut ${escapeHtml(input.customerFirstName)},`
    : 'Salut,';
  const items = [
    ...input.documentLabels.map((l) => `<li style="margin:0 0 6px;">${escapeHtml(l)}</li>`),
    ...(input.signatureRequired ? ['<li style="margin:0 0 6px;">Semnătura ta (direct pe ecran, cu degetul sau mouse-ul)</li>'] : []),
  ].join('');
  return brandedEmailHtml({
    preheader: `Un ultim pas pentru comanda ${input.orderNumber}: actele și semnătura`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escapeHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${greeting}</h1>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Plata pentru <strong>${escapeHtml(input.serviceName)}</strong> a fost înregistrată — mulțumim! Ca să putem depune cererea, mai avem nevoie de:</p>
        <ul style="margin:0 0 16px;padding-left:20px;color:#334155;font-size:14px;line-height:1.6;">${items}</ul>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Durează 2-3 minute, direct de pe telefon. Din motive de siguranță, la deschidere ți se va cere <strong>adresa de email a comenzii</strong> (cea la care ai primit acest mesaj).</p>
        ${ctaButton('Completează comanda', input.completionUrl)}
        <p style="margin:14px 0 0;text-align:center;font-size:12px;color:#9ca3af;">Link-ul este valabil până pe ${escapeHtml(input.expiresLabel)}. Orice problemă — răspunde la acest email.</p>`,
  });
}

export function buildCompletionRequestText(input: CompletionRequestEmailInput): string {
  return [
    `Comanda ${input.orderNumber}`,
    '',
    `Plata pentru ${input.serviceName} a fost înregistrată — mulțumim!`,
    'Ca să putem depune cererea, mai avem nevoie de:',
    ...input.documentLabels.map((l) => `- ${l}`),
    ...(input.signatureRequired ? ['- Semnătura ta (direct pe ecran)'] : []),
    '',
    `Completează aici (2-3 minute, de pe telefon): ${input.completionUrl}`,
    '',
    `Din motive de siguranță ți se va cere adresa de email a comenzii. Link-ul e valabil până pe ${input.expiresLabel}.`,
  ].join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
