// Admin notification email for a message submitted through the public
// /contact form — branded shell, user-supplied values HTML-escaped.
import { brandedEmailHtml } from './branded-layout';

export interface ContactMessageEmailInput {
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  subject: string;      // human label, already resolved from the select value
  message: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderContactMessageEmail(input: ContactMessageEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, email, phone, orderNumber, subject, message } = input;
  const emailSubject = `[Contact] ${subject} — ${name}`;

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; white-space: nowrap; vertical-align: top;">${label}</td>
      <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${value}</td>
    </tr>`;

  const html = brandedEmailHtml({
    preheader: `Mesaj de la ${name}: ${subject}`,
    content: `
        <h1 style="margin:0 0 4px;color:#0B1B33;font-size:20px;">Mesaj nou din formularul de contact</h1>
        <p style="margin:0 0 16px;color:#64748b;font-size:13px;">Subiect: ${esc(subject)}</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
          ${row('Nume', esc(name))}
          ${row('Email', `<a href="mailto:${esc(email)}" style="color:#b45309;">${esc(email)}</a>`)}
          ${phone ? row('Telefon', esc(phone)) : ''}
          ${orderNumber ? row('Nr. comandă', esc(orderNumber)) : ''}
        </table>
        <div style="background:#f8fafc;border-left:3px solid #ECB95F;padding:12px 16px;border-radius:6px;">
          <p style="margin:0;font-size:14px;white-space:pre-wrap;color:#0f172a;">${esc(message)}</p>
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Răspunde direct la acest email — Reply-To este setat pe adresa clientului.</p>`,
  });

  const text = `Mesaj nou din formularul de contact
Subiect: ${subject}

Nume: ${name}
Email: ${email}${phone ? `\nTelefon: ${phone}` : ''}${orderNumber ? `\nNr. comandă: ${orderNumber}` : ''}

${message}

---
Răspunde direct la acest email — Reply-To este setat pe adresa clientului.`;

  return { subject: emailSubject, html, text };
}
