/**
 * Șablonul campaniilor manuale (noutăți, articole, servicii noi, schimbări de
 * termene) scrise în /admin/marketing → `email_campaigns`. Corpul e
 * markdown-lite (`lib/email/markdown-lite.ts`); `{{prenume}}` se înlocuiește
 * cu prenumele contactului (sau se elimină curat dacă nu-l avem).
 */

import { brandedEmailHtml, ctaButton } from './branded-layout';
import { markdownLiteToHtml, markdownLiteToText } from '../markdown-lite';
import { unsubscribeNoteHtml, unsubscribeNoteText } from './marketing-footer';

export interface CampaignEmailInput {
  subject: string;
  preheader?: string | null;
  bodyText: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  firstName?: string | null;
  unsubscribeUrl: string;
}

/** `{{prenume}}` → „Ana"; fără prenume → placeholder-ul dispare cu tot cu
 *  spațiul dinaintea lui, deci „Salut {{prenume}}," → „Salut,". */
export function personalize(template: string, firstName: string | null | undefined): string {
  const name = firstName?.trim() ?? '';
  if (name) return template.replace(/\{\{\s*prenume\s*\}\}/gi, name);
  return template.replace(/[ \t]*\{\{\s*prenume\s*\}\}/gi, '');
}

export function renderCampaignEmail(input: CampaignEmailInput): { subject: string; html: string; text: string } {
  const subject = personalize(input.subject, input.firstName);
  const body = personalize(input.bodyText, input.firstName);
  const cta = input.ctaLabel && input.ctaUrl ? ctaButton(input.ctaLabel, input.ctaUrl) : '';

  const html = brandedEmailHtml({
    preheader: personalize(input.preheader || subject, input.firstName),
    content: `
        ${markdownLiteToHtml(body)}
        ${cta}
        ${unsubscribeNoteHtml(input.unsubscribeUrl, 'ai fost în contact cu eGhișeul.ro')}`,
  });

  const text = [
    markdownLiteToText(body),
    '',
    input.ctaLabel && input.ctaUrl ? `${input.ctaLabel}: ${input.ctaUrl}` : '',
    '',
    '— Echipa eGhișeul.ro',
    '',
    unsubscribeNoteText(input.unsubscribeUrl),
  ]
    .filter((l, i, arr) => !(l === '' && arr[i - 1] === ''))
    .join('\n');

  return { subject, html, text };
}
