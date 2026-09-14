/**
 * Cerere de recenzie Google — pleacă la 3–10 zile după finalizare, DOAR pentru
 * comenzile care au mers în termen și fără incidente (`wasOnTime` în
 * `lib/lifecycle/rules.ts`). Un client căruia i-a mers prost nu e rugat să
 * scrie o recenzie; îl sunăm.
 *
 * Dovada socială reală e singura permisă după spam update
 * (.claude/rules/content-and-seo.md §3) — de-aia cerem recenzii, nu le inventăm.
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { greeting, unsubscribeNoteHtml, unsubscribeNoteText } from './marketing-footer';

export interface ReviewRequestEmailInput {
  firstName?: string | null;
  /** Ex: „Cazier judiciar". */
  serviceName: string;
  friendlyOrderId: string;
  reviewUrl: string;
  unsubscribeUrl: string;
}

export function renderReviewRequestEmail(input: ReviewRequestEmailInput): { subject: string; html: string; text: string } {
  const subject = `Cum a fost cu ${input.serviceName.toLowerCase()}? 30 de secunde ne ajută enorm`;
  const hello = greeting(input.firstName);

  const html = brandedEmailHtml({
    preheader: `Comanda ${input.friendlyOrderId} a fost livrată în termen. O recenzie scurtă pe Google ne ajută să ajungem la oameni ca tine.`,
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Comanda ta <strong>${escHtml(input.friendlyOrderId)}</strong> (${escHtml(input.serviceName)}) a fost livrată în termenul promis. Sperăm că ți-a scutit un drum.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Suntem o echipă mică și trăim din recomandări. Dacă ai 30 de secunde, o recenzie pe Google — sinceră, cum a fost — ne ajută mai mult decât orice reclamă.</p>
        ${ctaButton('Lasă o recenzie pe Google', input.reviewUrl)}
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Dacă ceva n-a mers cum trebuia, răspunde la acest email — vrem să știm întâi noi, ca să reparăm.</p>
        ${unsubscribeNoteHtml(input.unsubscribeUrl)}`,
  });

  const text = [
    hello,
    '',
    `Comanda ta ${input.friendlyOrderId} (${input.serviceName}) a fost livrată în termenul promis.`,
    '',
    'Suntem o echipă mică și trăim din recomandări. Dacă ai 30 de secunde, o recenzie pe Google ne ajută mai mult decât orice reclamă:',
    input.reviewUrl,
    '',
    'Dacă ceva n-a mers cum trebuia, răspunde la acest email — vrem să știm întâi noi.',
    '',
    '— Echipa eGhișeul.ro',
    '',
    unsubscribeNoteText(input.unsubscribeUrl),
  ].join('\n');

  return { subject, html, text };
}
