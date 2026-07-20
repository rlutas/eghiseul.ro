/**
 * Email trimis când un serviciu extern picat revine — către cei înscriși pe
 * /api/outage-alerts din articolul de outage.
 *
 * Momentul are cea mai mare intenție de cumpărare din tot ciclul: omul a
 * așteptat exact vestea asta. Textul livrează întâi informația promisă, apoi
 * oferă acțiunea — nu invers. Un email care începe cu „comandă acum" ar trăda
 * promisiunea pentru care a lăsat adresa.
 */

import { brandedEmailHtml, ctaButton } from './branded-layout';

export interface OutageRecoveredInput {
  /** Numele afișat al serviciului, ex. „ANCPI". */
  serviceLabel: string;
  /** Ce poate comanda acum, ex. „extras de carte funciară". */
  documentLabel: string;
  /** Link către wizardul de comandă. */
  orderUrl: string;
  /** Cât a durat căderea, ex. „7 zile" — context, nu obligatoriu. */
  outageDuration?: string | null;
}

export function buildOutageRecoveredSubject(input: OutageRecoveredInput): string {
  return `${input.serviceLabel} funcționează din nou — poți comanda ${input.documentLabel}`;
}

export function buildOutageRecoveredHtml(input: OutageRecoveredInput): string {
  const duration = input.outageDuration
    ? `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Căderea a durat ${escapeHtml(input.outageDuration)}.</p>`
    : '';

  return brandedEmailHtml({
    preheader: `${input.serviceLabel} a revenit — sistemele funcționează din nou.`,
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escapeHtml(input.serviceLabel)} funcționează din nou</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Ne-ai cerut să te anunțăm când revin sistemele — <strong>tocmai au revenit</strong>. Monitorizarea noastră automată a confirmat că sunt din nou accesibile.</p>
        ${duration}
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Poți comanda din nou ${escapeHtml(input.documentLabel)}. Documentul se eliberează automat și îl primești pe email.</p>
        ${ctaButton(`Comandă ${input.documentLabel}`, input.orderUrl)}
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;line-height:1.6;">Atenție: după o cădere lungă, sistemele pot fi aglomerate în primele ore. Dacă o comandă întârzie, se procesează automat — nu trebuie s-o reiei.</p>
        <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">Ai primit acest email pentru că ai cerut să fii anunțat când revine ${escapeHtml(input.serviceLabel)}. Este singurul mesaj pe care ți-l trimitem în legătură cu această alertă.</p>`,
  });
}

export function buildOutageRecoveredText(input: OutageRecoveredInput): string {
  return [
    `${input.serviceLabel} funcționează din nou`,
    '',
    'Ne-ai cerut să te anunțăm când revin sistemele — tocmai au revenit.',
    input.outageDuration ? `Căderea a durat ${input.outageDuration}.` : '',
    '',
    `Poți comanda din nou ${input.documentLabel}: ${input.orderUrl}`,
    '',
    'După o cădere lungă, sistemele pot fi aglomerate în primele ore. Dacă o comandă întârzie, se procesează automat.',
    '',
    'Este singurul mesaj pe care ți-l trimitem pentru această alertă.',
    '',
    '— Echipa eGhișeul.ro',
  ]
    .filter(Boolean)
    .join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
