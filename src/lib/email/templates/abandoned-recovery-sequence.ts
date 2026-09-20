/**
 * Pașii 1 și 2 din secvența de recovery pentru coșuri abandonate
 * (`/api/cron/recovery-emails`). Pasul 3 (cuponul) rămâne în
 * `abandoned-recovery.ts`.
 *
 * Cercetare (docs/marketing/email-marketing-plan-2026-09.md §4.1): reducerea
 * NU e prima armă — antrenează clienții să abandoneze special pentru cupon.
 *   pasul 1  „reia de unde ai rămas" — fără nicio ofertă, doar link-ul
 *   pasul 2  încredere: ce se întâmplă după plată, echipă reală, recenzii,
 *            WhatsApp — pentru cine ezită din neîncredere, nu din preț
 *   pasul 3  abia acum 10% / 48 h (template-ul vechi)
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { SOCIAL_PROOF } from '@/lib/seo/constants';
import { BRANDS, type Brand } from '@/lib/brand/brands';

export interface RecoveryStepInput {
  customerFirstName?: string | null;
  serviceName: string;
  totalRon: number;
  resumeUrl: string;
  orderNumber: string;
  /** Termenul afișat pe pagina serviciului, ex. „3-5 zile lucrătoare". */
  estimatedDaysDisplay?: string | null;
  /** The ORDER's brand (documentero or eghiseul) — header, colors, site name. */
  brand?: Brand;
}

const greeting = (n?: string | null) => (n?.trim() ? `Salut ${n.trim()},` : 'Salut,');

const note = (b: Brand) =>
  `Ai primit acest email pentru că ai început o comandă pe ${escHtml(b.name)}. Dacă nu mai vrei să continui, ignoră mesajul — datele tale nu vor fi păstrate mai mult de 14 zile.`;

// ── Pasul 1 ─────────────────────────────────────────────────────────────────

export function buildRecoveryStep1(input: RecoveryStepInput): { subject: string; html: string; text: string } {
  const name = input.customerFirstName?.trim();
  const svc = input.serviceName;
  const subject = name ? `${name}, comanda ta pentru ${svc} te așteaptă` : `Comanda ta pentru ${svc} te așteaptă`;
  const hello = greeting(input.customerFirstName);
  const b = input.brand ?? BRANDS.eghiseul;

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: `Ai completat deja o parte — o reiei exact de unde ai rămas, în 2 minute.`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Ai început comanda pentru <strong>${escHtml(svc)}</strong> și te-ai oprit înainte de plată. Am păstrat tot ce ai completat — o reiei exact de unde ai rămas.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Dacă te-ai blocat la un pas (poza actului, semnătura, plata), răspunde la acest email sau scrie-ne pe WhatsApp și te ajutăm pe loc.</p>
        ${ctaButton('Reia comanda', input.resumeUrl)}
        <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#9ca3af;">Total: ${input.totalRon.toFixed(2)} RON${input.estimatedDaysDisplay ? ` · termen ${escHtml(input.estimatedDaysDisplay)}` : ''}</p>
        <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">${note(b)}</p>`,
  });

  const text = [
    `Comanda ${input.orderNumber}`,
    '',
    hello,
    '',
    `Ai început comanda pentru ${svc} și te-ai oprit înainte de plată. Am păstrat tot ce ai completat — o reiei de unde ai rămas:`,
    input.resumeUrl,
    '',
    'Te-ai blocat la un pas? Răspunde la acest email sau scrie-ne pe WhatsApp.',
    '',
    `Total: ${input.totalRon.toFixed(2)} RON`,
    '',
    `— Echipa ${b.name}`,
  ].join('\n');

  return { subject, html, text };
}

// ── Pasul 2 ─────────────────────────────────────────────────────────────────

export function buildRecoveryStep2(input: RecoveryStepInput): { subject: string; html: string; text: string } {
  const svc = input.serviceName;
  const b = input.brand ?? BRANDS.eghiseul;
  const subject = `Ce se întâmplă după ce plătești ${svc.toLowerCase()} pe ${b.name}`;
  const hello = greeting(input.customerFirstName);
  const proof = `${SOCIAL_PROOF.ratingValue.toString().replace('.', ',')} din 5 pe Google, din peste ${SOCIAL_PROOF.roundedDown} de recenzii`;

  const steps = [
    ['Plătești online', 'card sau transfer bancar; factura vine automat pe email.'],
    ['Depunem noi cererea', 'cu împuternicirea semnată de tine în comandă — tu nu mergi nicăieri.'],
    ['Primești documentul', input.estimatedDaysDisplay ? `în ${input.estimatedDaysDisplay}, prin curier sau electronic.` : 'prin curier sau electronic, în termenul afișat pe pagina serviciului.'],
  ];

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: `Oameni reali, pași clari, ${proof}. Dacă ai o întrebare înainte să plătești, întreab-o.`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">Mulți ne scriu înainte să plătească: „și după aia ce se întâmplă?". Pe scurt, pentru <strong>${escHtml(svc)}</strong>:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
          ${steps
            .map(
              ([t, d], i) => `<tr><td style="padding:8px 0;border-top:1px solid #e2e8f0;">
            <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#0B1B33;color:#fff;font-size:12px;font-weight:700;margin-right:8px;">${i + 1}</span>
            <strong style="color:#0f172a;font-size:14px;">${escHtml(t)}</strong>
            <div style="color:#64748b;font-size:13px;line-height:1.5;margin:2px 0 0 30px;">${escHtml(d)}</div>
          </td></tr>`
            )
            .join('')}
        </table>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Suntem eDigitalizare SRL, o echipă din Satu Mare — serviciu privat, nu instituție. ${escHtml(proof)}. Dacă ceva nu e clar, răspunde la acest email sau scrie-ne pe WhatsApp înainte să plătești.</p>
        ${ctaButton('Reia comanda', input.resumeUrl)}
        <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#9ca3af;">Total: ${input.totalRon.toFixed(2)} RON</p>
        <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">${note(b)}</p>`,
  });

  const text = [
    `Comanda ${input.orderNumber}`,
    '',
    hello,
    '',
    `Ce se întâmplă după ce plătești ${svc}:`,
    ...steps.map(([t, d], i) => `${i + 1}. ${t} — ${d}`),
    '',
    `Suntem eDigitalizare SRL, o echipă din Satu Mare — serviciu privat, nu instituție. ${proof}.`,
    'Întrebări înainte să plătești? Răspunde la acest email sau scrie-ne pe WhatsApp.',
    '',
    `Reia comanda: ${input.resumeUrl}`,
    '',
    `— Echipa ${b.name}`,
  ].join('\n');

  return { subject, html, text };
}
