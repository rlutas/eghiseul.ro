/**
 * Warm-up re-engagement email — sent by /api/cron/warmup-campaign, o singură
 * dată per contact, la un contact din registrul intern (majoritatea lead-uri
 * WPForms de pe eghiseul.ro vechi, niciodată contactate de marketing).
 *
 * Scop: reactivare, nu vânzare directă — un email scurt, onest, cu link de
 * dezabonare vizibil (obligatoriu — asta E emailul de marketing, nu unul
 * tranzacțional). Fără presiune, fără discount forțat în primul contact
 * (cercetare: reducerea nu e prima armă la o listă rece).
 */

import { brandedEmailHtml, ctaButton } from './branded-layout';

export interface WarmupEmailInput {
  firstName?: string | null;
  /** Serviciul din care a venit lead-ul (ex: "cazier judiciar"), pentru context. */
  serviceHint?: string | null;
  unsubscribeUrl: string;
}

export function buildWarmupSubject(input: WarmupEmailInput): string {
  const name = input.firstName?.trim();
  return name ? `${name}, eGhișeul.ro s-a schimbat de când ne-ai scris` : 'eGhișeul.ro s-a schimbat de când ne-ai scris';
}

export function buildWarmupHtml(input: WarmupEmailInput): string {
  const greeting = input.firstName ? `Salut ${escapeHtml(input.firstName)},` : 'Salut,';
  const context = input.serviceHint
    ? `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Ne-ai contactat cândva pentru <strong>${escapeHtml(input.serviceHint)}</strong>. De atunci am rescris toată platforma.</p>`
    : `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Ne-ai contactat cândva. De atunci am rescris toată platforma.</p>`;
  return brandedEmailHtml({
    preheader: 'Am rescris platforma — comenzi online, plată directă, curier până la ușă.',
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${greeting}</h1>
        ${context}
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Acum poți comanda online, plăti direct în platformă și primești actul prin curier, fără drumuri la ghișeu. Obținem documentul pentru tine — cazier judiciar, extras carte funciară, certificate de stare civilă și altele.</p>
        ${ctaButton('Vezi serviciile disponibile', 'https://eghiseul.ro/servicii')}
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">Primești acest email pentru că ai fost în contact cu eGhișeul.ro. Dacă nu te mai interesează, te poți dezabona oricând — <a href="${escapeAttr(input.unsubscribeUrl)}" style="color:#0B1B33;">un singur click</a>.</p>`,
  });
}

export function buildWarmupText(input: WarmupEmailInput): string {
  const greeting = input.firstName ? `Salut ${input.firstName},` : 'Salut,';
  return [
    greeting,
    '',
    input.serviceHint
      ? `Ne-ai contactat cândva pentru ${input.serviceHint}. De atunci am rescris toată platforma.`
      : 'Ne-ai contactat cândva. De atunci am rescris toată platforma.',
    '',
    'Acum poți comanda online, plăti direct și primești actul prin curier, fără drumuri la ghișeu.',
    '',
    'Vezi serviciile: https://eghiseul.ro/servicii',
    '',
    `Dezabonare: ${input.unsubscribeUrl}`,
    '',
    '— Echipa eGhișeul.ro',
  ].join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
