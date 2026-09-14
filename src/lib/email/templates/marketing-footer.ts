/**
 * Notă de dezabonare pentru orice email care NU e tranzacțional (lifecycle,
 * campanii, warm-up). Se pune la finalul conținutului, înainte de footerul
 * legal din `brandedEmailHtml`.
 */

import { escHtml } from './branded-layout';

export function unsubscribeNoteHtml(unsubscribeUrl: string, reason = 'ai comandat prin eGhișeul.ro'): string {
  return `<p style="margin:18px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">Primești acest email pentru că ${escHtml(reason)}. Emailurile despre comenzile tale active nu sunt afectate. Nu mai vrei astfel de mesaje? <a href="${escHtml(unsubscribeUrl)}" style="color:#0B1B33;">Dezabonare cu un click</a>.</p>`;
}

export function unsubscribeNoteText(unsubscribeUrl: string): string {
  return `Dezabonare de la emailurile de marketing: ${unsubscribeUrl}`;
}

/** Header-ele RFC 8058 pe care le cer Gmail/Yahoo la expeditorii în volum. */
export function listUnsubscribeHeaders(unsubscribeUrl: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

export function greeting(firstName: string | null | undefined): string {
  const name = firstName?.trim();
  return name ? `Salut ${name},` : 'Salut,';
}
