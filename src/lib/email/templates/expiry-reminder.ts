/**
 * Reminder de expirare a documentului — pleacă o dată per comandă, în
 * fereastra [expirare − 14 zile, expirare + 30 zile] (`lib/lifecycle/rules.ts`).
 * Data de expirare e calculată din data finalizării comenzii, deci e
 * aproximativă (cu câteva zile mai devreme decât realitatea, niciodată mai
 * târziu) — copy-ul spune „aproximativ".
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { greeting, unsubscribeNoteHtml, unsubscribeNoteText } from './marketing-footer';
import { formatRoDate } from '@/lib/lifecycle/rules';
import { BRANDS, type Brand } from '@/lib/brand/brands';

export interface ExpiryReminderEmailInput {
  firstName?: string | null;
  /** Ex: „Cazier judiciar". */
  serviceName: string;
  friendlyOrderId: string;
  expiresOn: Date;
  /** True dacă data a trecut deja (fereastra de grație). */
  alreadyExpired: boolean;
  validityLabel: string; // ex: „6 luni", „30 de zile"
  reorderUrl: string;
  unsubscribeUrl: string;
  /** The ORDER's brand (documentero or eghiseul) — header, colors, signature. */
  brand?: Brand;
}

export function renderExpiryReminderEmail(input: ExpiryReminderEmailInput): { subject: string; html: string; text: string } {
  const svc = input.serviceName;
  const svcLower = svc.toLowerCase();
  const date = formatRoDate(input.expiresOn);
  const subject = input.alreadyExpired
    ? `${svc} obținut prin noi a expirat — îl reobținem dacă mai ai nevoie`
    : `${svc} obținut prin noi expiră în jurul datei de ${date}`;
  const hello = greeting(input.firstName);
  const b = input.brand ?? BRANDS.eghiseul;

  const lead = input.alreadyExpired
    ? `Documentul <strong>${escHtml(svcLower)}</strong> obținut prin comanda <strong>${escHtml(input.friendlyOrderId)}</strong> a depășit, după calculul nostru, termenul de valabilitate de ${escHtml(input.validityLabel)} (în jurul datei de ${escHtml(date)}).`
    : `Documentul <strong>${escHtml(svcLower)}</strong> obținut prin comanda <strong>${escHtml(input.friendlyOrderId)}</strong> are valabilitate ${escHtml(input.validityLabel)} de la emitere — după calculul nostru expiră în jurul datei de <strong>${escHtml(date)}</strong>.`;

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: input.alreadyExpired
      ? `${svc} a expirat. Dacă mai ai nevoie de unul, îl obținem la fel de simplu ca prima dată.`
      : `${svc} expiră în jurul datei de ${date}. Dacă mai ai nevoie, îl reobținem fără drumuri.`,
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">${lead}</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Dacă ai nevoie de unul nou — pentru angajare, licitație, bancă, instituții din străinătate — îl obținem la fel ca prima dată: comandă online, fără drumuri, livrat prin curier sau electronic. Datele tale de la ultima comandă sunt deja în cont, deci durează câteva minute.</p>
        ${ctaButton(`Reobține ${svcLower}`, input.reorderUrl)}
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Nu mai ai nevoie? Ignoră mesajul — nu-ți mai trimitem alt reminder pentru documentul ăsta.</p>
        ${unsubscribeNoteHtml(input.unsubscribeUrl, `ai comandat prin ${b.name}`)}`,
  });

  const text = [
    hello,
    '',
    input.alreadyExpired
      ? `Documentul ${svcLower} obținut prin comanda ${input.friendlyOrderId} a depășit, după calculul nostru, termenul de valabilitate de ${input.validityLabel} (în jurul datei de ${date}).`
      : `Documentul ${svcLower} obținut prin comanda ${input.friendlyOrderId} are valabilitate ${input.validityLabel} de la emitere — după calculul nostru expiră în jurul datei de ${date}.`,
    '',
    'Dacă ai nevoie de unul nou, îl obținem la fel ca prima dată, fără drumuri:',
    input.reorderUrl,
    '',
    'Nu mai ai nevoie? Ignoră mesajul — nu-ți mai trimitem alt reminder pentru documentul ăsta.',
    '',
    `— Echipa ${b.name}`,
    '',
    unsubscribeNoteText(input.unsubscribeUrl),
  ].join('\n');

  return { subject, html, text };
}

export function validityLabel(days: number): string {
  if (days % 30 === 0 && days >= 60) return `${days / 30} luni`;
  return `${days} de zile`;
}
