/**
 * Follow-up după apelul telefonic de recuperare (`/admin/recuperare-telefonica`
 * → „Bifează sunat" cu cupon). Clientul a vorbit cu cineva din echipă și a
 * primit o reducere; emailul repetă în scris ce s-a discutat și dă link-ul de
 * reluare cu cuponul aplicat automat. Idee Raul, 14.09.2026.
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';

export interface PhoneFollowupEmailInput {
  customerFirstName?: string | null;
  /** Cine a sunat — prenumele din profilul adminului (sau „echipa"). */
  agentName: string;
  serviceName: string;
  orderNumber: string;
  totalRon: number;
  couponCode: string;
  /** „10%" sau „50 RON". */
  discountLabel: string;
  couponValidUntil: Date;
  /** Link de reluare cu ?coupon= inclus. */
  resumeUrl: string;
}

export function renderPhoneFollowupEmail(input: PhoneFollowupEmailInput): { subject: string; html: string; text: string } {
  const name = input.customerFirstName?.trim();
  const hello = name ? `Salut ${name},` : 'Salut,';
  const subject = `Cum am stabilit la telefon: ${input.discountLabel} reducere la ${input.serviceName.toLowerCase()}`;
  const until = input.couponValidUntil.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', timeZone: 'Europe/Bucharest' });

  const html = brandedEmailHtml({
    preheader: `Ai vorbit cu ${input.agentName} de la eGhișeul.ro. Cuponul ${input.couponCode} se aplică automat din link.`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Mulțumim pentru discuția de azi cu <strong>${escHtml(input.agentName)}</strong> din echipa eGhișeul.ro. Cum am stabilit, ai <strong>${escHtml(input.discountLabel)} reducere</strong> la <strong>${escHtml(input.serviceName)}</strong>, cu codul:</p>
        <div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:18px;text-align:center;margin:0 0 18px;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#92400e;">Cod cupon — valabil până pe ${escHtml(until)}</p>
          <p style="margin:0;font-size:28px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#78350f;letter-spacing:2px;">${escHtml(input.couponCode)}</p>
        </div>
        <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.6;">Cuponul se aplică automat când apeși butonul. Datele pe care le-ai completat sunt păstrate — reiei exact de unde ai rămas.</p>
        ${ctaButton('Reia comanda cu reducerea', input.resumeUrl)}
        <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#9ca3af;">Total înainte de reducere: ${input.totalRon.toFixed(2)} RON</p>
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Dacă a rămas ceva neclar din discuție, răspunde la acest email sau scrie-ne pe WhatsApp — ${escHtml(input.agentName)} sau un coleg îți răspunde.</p>`,
  });

  const text = [
    `Comanda ${input.orderNumber}`,
    '',
    hello,
    '',
    `Mulțumim pentru discuția de azi cu ${input.agentName} din echipa eGhișeul.ro. Cum am stabilit, ai ${input.discountLabel} reducere la ${input.serviceName}, cu codul: ${input.couponCode} (valabil până pe ${until}).`,
    '',
    `Reia comanda cu reducerea aplicată automat: ${input.resumeUrl}`,
    '',
    `Total înainte de reducere: ${input.totalRon.toFixed(2)} RON`,
    '',
    'Ceva neclar? Răspunde la acest email sau scrie-ne pe WhatsApp.',
    '',
    '— Echipa eGhișeul.ro',
  ].join('\n');

  return { subject, html, text };
}
