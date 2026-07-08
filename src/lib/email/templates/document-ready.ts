/**
 * "Documentul tău este gata" — sent when a final document lands on the order
 * (ONRC worker, ANCPI worker, collaborator upload). Branded like the order
 * confirmation email; the CTA goes to the public status page pre-filled with
 * the order code + email, where the "Vezi documentul" button lives (works
 * without an account).
 */

import { brandedEmailHtml, ctaButton, escHtml, infoRows } from './branded-layout';

export interface DocumentReadyEmailInput {
  friendlyOrderId: string;
  /** e.g. "Certificat Constatator", "Extras de Carte Funciară". */
  documentLabel: string;
  /** Institution registration number, when there is one (shown to the client). */
  registrationNumber?: string | null;
  /** Absolute link to the status page (pre-filled) or account page. */
  viewUrl: string;
}

export function renderDocumentReadyEmail(input: DocumentReadyEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { friendlyOrderId, documentLabel, registrationNumber, viewUrl } = input;
  const subject = `${documentLabel} pentru comanda ${friendlyOrderId} este gata 🎉`;

  const rows = [
    { label: 'Număr comandă', value: friendlyOrderId, mono: true },
    { label: 'Document', value: documentLabel },
    ...(registrationNumber
      ? [{ label: 'Nr. înregistrare', value: registrationNumber }]
      : []),
  ];

  const content = `        <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Documentul tău este gata 🎉</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Bună! <strong>${escHtml(documentLabel)}</strong> pentru comanda ta a fost emis și îl poți descărca chiar acum.</p>
        ${infoRows(rows)}
        ${ctaButton('Vezi și descarcă documentul', viewUrl)}`;

  const html = brandedEmailHtml({
    preheader: `${documentLabel} pentru comanda ${friendlyOrderId} a fost emis — descarcă-l acum.`,
    content,
  });

  const text = [
    `${documentLabel} pentru comanda ${friendlyOrderId} este gata`,
    '',
    `Număr comandă: ${friendlyOrderId}`,
    `Document: ${documentLabel}`,
    registrationNumber ? `Nr. înregistrare: ${registrationNumber}` : '',
    '',
    `Vezi și descarcă documentul: ${viewUrl}`,
    '',
    'Întrebări? WhatsApp +40 757 708 181 · contact@eghiseul.ro',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
