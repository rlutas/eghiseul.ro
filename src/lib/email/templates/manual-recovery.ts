/**
 * Email de recuperare trimis MANUAL de cineva din echipă, din
 * `/admin/recuperare-telefonica` (cerere echipă 07.10.2026: sunt prea mulți
 * clienți ca să-i sune pe toți). Fără cupon: echipa vede că oamenii nu se
 * opresc din cauza prețului, ci pentru că se blochează la un pas sau nu au
 * încredere. Emailul vine de la o persoană, spune unde s-a oprit clientul și
 * îl invită să răspundă.
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { BRANDS, type Brand } from '@/lib/brand/brands';

export interface ManualRecoveryEmailInput {
  customerFirstName?: string | null;
  /** Prenumele colegei care trimite (sau „echipa"). */
  agentName: string;
  serviceName: string;
  orderNumber: string;
  totalRon: number;
  /** `orders.current_step` pe draft — unde s-a oprit clientul. */
  currentStep?: string | null;
  /** Mesaj scris de colegă, opțional. Text simplu. */
  message?: string | null;
  resumeUrl: string;
  brand?: Brand;
}

/** Pasul din wizard, spus clientului pe limba lui. */
const STEP_PHRASES: Record<string, string> = {
  'contact': 'la datele de contact',
  'client-type': 'la alegerea tipului de client',
  'personal-data': 'la datele personale',
  'company-kyc': 'la datele firmei',
  'civil-status': 'la datele actului de stare civilă',
  'constatator': 'la datele firmei pentru certificat',
  'property': 'la datele imobilului',
  'property-data': 'la datele imobilului',
  'vehicle': 'la datele vehiculului',
  'vehicle-data': 'la datele vehiculului',
  'kyc-documents': 'la poza actului de identitate',
  'options': 'la opțiuni',
  'delivery': 'la livrare',
  'billing': 'la datele de facturare',
  'signature': 'la semnătură',
  'review': 'chiar înainte de plată',
};

export function stepPhrase(step: string | null | undefined): string | null {
  return step ? STEP_PHRASES[step] ?? null : null;
}

export function renderManualRecoveryEmail(input: ManualRecoveryEmailInput): { subject: string; html: string; text: string } {
  const b = input.brand ?? BRANDS.eghiseul;
  const name = input.customerFirstName?.trim();
  const hello = name ? `Salut ${name},` : 'Salut,';
  const agent = input.agentName.trim() || 'echipa';
  const svc = input.serviceName;
  const where = stepPhrase(input.currentStep);
  const message = input.message?.trim() || null;
  const subject = name
    ? `${name}, te pot ajuta să termini comanda pentru ${svc.toLowerCase()}?`
    : `Te pot ajuta să termini comanda pentru ${svc.toLowerCase()}?`;
  const stopped = where
    ? `Am văzut că ai început comanda pentru <strong>${escHtml(svc)}</strong> și te-ai oprit ${escHtml(where)}.`
    : `Am văzut că ai început comanda pentru <strong>${escHtml(svc)}</strong> și nu ai ajuns până la capăt.`;
  const stoppedText = where
    ? `Am văzut că ai început comanda pentru ${svc} și te-ai oprit ${where}.`
    : `Am văzut că ai început comanda pentru ${svc} și nu ai ajuns până la capăt.`;

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: `Sunt ${agent} de la ${b.name}. Dacă te-ai blocat la ceva, răspunde-mi aici și te ajut.`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Sunt ${escHtml(agent)}, din echipa ${escHtml(b.name)}. ${stopped}</p>
        ${message ? `<p style="margin:0 0 12px;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-line;">${escHtml(message)}</p>` : ''}
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Dacă ceva nu a mers sau nu e clar ce trebuie completat, răspunde-mi direct la acest email sau scrie-ne pe WhatsApp. Te ajut eu să termini. Datele pe care le-ai completat sunt păstrate, deci reiei de unde ai rămas.</p>
        ${ctaButton('Reia comanda', input.resumeUrl)}
        <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#9ca3af;">Total: ${input.totalRon.toFixed(2)} RON</p>
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Mulțumesc,<br>${escHtml(agent)} · ${escHtml(b.name)}</p>
        <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">Ai primit acest email pentru că ai început o comandă pe ${escHtml(b.name)}. Dacă nu mai vrei să continui, ignoră mesajul.</p>`,
  });

  const text = [
    `Comanda ${input.orderNumber}`,
    '',
    hello,
    '',
    `Sunt ${agent}, din echipa ${b.name}. ${stoppedText}`,
    ...(message ? ['', message] : []),
    '',
    'Dacă ceva nu a mers sau nu e clar ce trebuie completat, răspunde-mi direct la acest email sau scrie-ne pe WhatsApp. Datele completate sunt păstrate:',
    input.resumeUrl,
    '',
    `Total: ${input.totalRon.toFixed(2)} RON`,
    '',
    `Mulțumesc,`,
    `${agent} · ${b.name}`,
  ].join('\n');

  return { subject, html, text };
}
