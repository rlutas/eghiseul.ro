/**
 * Cross-sell — la 30–60 de zile după o comandă finalizată, un singur email
 * per client (cooldown 180 zile), cu 2 documente care au sens după cel
 * cumpărat (`CROSS_SELL_MAP` în `lib/lifecycle/rules.ts`).
 *
 * Cercetare (docs/marketing/email-marketing-plan-2026-09.md §3): un fost
 * client de cazier nu mai cumpără cazier curând — dar poate avea nevoie de
 * alt document din același catalog. Win-back-ul nostru = cross-sell.
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { greeting, unsubscribeNoteHtml, unsubscribeNoteText } from './marketing-footer';
import { BRANDS, type Brand } from '@/lib/brand/brands';

/** O frază per serviciu: CÂND ai nevoie de el (nu ce e). */
export const CROSS_SELL_BLURBS: Record<string, string> = {
  'certificat-integritate': 'obligatoriu dacă lucrezi cu copii — școli, grădinițe, after-school, cluburi sportive',
  'cazier-fiscal': 'cerut la înființare de firmă, asociere, licitații și unele credite',
  'cazier-auto': 'cerut de angajatori pentru șoferi profesioniști și la unele permise',
  'cazier-judiciar-persoana-fizica': 'cerut la angajare, permis de armă, adopție, cetățenie, licențe',
  'cazier-judiciar-persoana-juridica': 'cerut firmei la licitații, autorizații și parteneriate',
  'certificat-constatator': 'dovada situației firmei — licitații, bănci, contracte cu instituții',
  'rovinieta': 'plătește rovinieta online în 2 minute, fără drum la benzinărie',
  'extras-plan-cadastral': 'arată limitele și vecinătățile imobilului — la vânzare, construcție, litigii',
  'certificat-sarcini': 'istoricul ipotecilor și sarcinilor de pe imobil — cerut de notari la vânzare',
  'copie-carte-funciara': 'copia integrală a cărții funciare, cu tot istoricul',
  'copie-plan-cadastral': 'copia planului cadastral din arhiva OCPI',
  'extras-carte-funciara': 'situația la zi a imobilului — proprietar, sarcini, suprafață',
  'certificat-detineri-imobile': 'lista imobilelor deținute de o persoană, la nivel de județ',
  'extras-multilingv-certificat-nastere': 'certificatul de naștere recunoscut direct în UE, fără traducere și apostilă',
  'extras-multilingv-certificat-casatorie': 'certificatul de căsătorie recunoscut direct în UE, fără traducere și apostilă',
  'certificat-casatorie': 'duplicat după certificatul de căsătorie, obținut de la primăria de stare civilă',
  'certificat-nastere': 'duplicat după certificatul de naștere, obținut de la primăria de stare civilă',
  'certificat-celibat': 'dovada că nu ești căsătorit(ă) în România — cerut la căsătoria în străinătate',
};

export interface CrossSellSuggestion {
  slug: string;
  name: string;
  url: string;
}

export interface CrossSellEmailInput {
  firstName?: string | null;
  /** Ex: „cazier judiciar" — ce a cumpărat. */
  boughtServiceName: string;
  suggestions: CrossSellSuggestion[]; // 1–3
  catalogUrl: string;
  unsubscribeUrl: string;
  /** The ORDER's brand (documentero or eghiseul) — header, colors, site name. */
  brand?: Brand;
}

export function renderCrossSellEmail(input: CrossSellEmailInput): { subject: string; html: string; text: string } {
  const first = input.suggestions[0];
  const subject = first
    ? `După ${input.boughtServiceName.toLowerCase()}: ${first.name.toLowerCase()}, la fel de simplu`
    : 'Ce alte documente îți obținem, fără drumuri';
  const hello = greeting(input.firstName);
  const b = input.brand ?? BRANDS.eghiseul;

  const items = input.suggestions
    .map((s) => {
      const blurb = CROSS_SELL_BLURBS[s.slug];
      return `<tr><td style="padding:10px 0;border-top:1px solid #e2e8f0;">
          <a href="${escHtml(s.url)}" style="color:#0B1B33;font-weight:700;font-size:15px;text-decoration:none;">${escHtml(s.name)} →</a>
          ${blurb ? `<div style="color:#64748b;font-size:13px;line-height:1.5;margin-top:2px;">${escHtml(blurb)}</div>` : ''}
        </td></tr>`;
    })
    .join('');

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: `Ai obținut ${input.boughtServiceName.toLowerCase()} prin noi. Iată ce alte documente îți luăm de pe cap la fel de simplu.`,
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">Acum ceva timp ai obținut <strong>${escHtml(input.boughtServiceName.toLowerCase())}</strong> prin ${escHtml(b.name)}. Mulți dintre clienții noștri au nevoie, mai devreme sau mai târziu, și de:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">${items}</table>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Același flux: comandă online, plată directă, livrare prin curier sau electronic. Datele tale sunt deja în cont.</p>
        ${ctaButton('Vezi toate serviciile', input.catalogUrl)}
        ${unsubscribeNoteHtml(input.unsubscribeUrl, `ai comandat prin ${b.name}`)}`,
  });

  const text = [
    hello,
    '',
    `Acum ceva timp ai obținut ${input.boughtServiceName.toLowerCase()} prin ${b.name}. Mulți clienți au nevoie, mai devreme sau mai târziu, și de:`,
    '',
    ...input.suggestions.map((s) => `• ${s.name}${CROSS_SELL_BLURBS[s.slug] ? ` — ${CROSS_SELL_BLURBS[s.slug]}` : ''}\n  ${s.url}`),
    '',
    `Toate serviciile: ${input.catalogUrl}`,
    '',
    `— Echipa ${b.name}`,
    '',
    unsubscribeNoteText(input.unsubscribeUrl),
  ].join('\n');

  return { subject, html, text };
}
