// Admin notification email for a message submitted through the public
// /contact form. Plain string template (no JSX renderer). All user-supplied
// values are HTML-escaped at the boundary so the body stays safe.

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

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a;">
    <h1 style="font-size: 20px; margin-bottom: 4px;">Mesaj nou din formularul de contact</h1>
    <p style="color: #64748b; font-size: 13px; margin-top: 0;">Subiect: ${esc(subject)}</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${row('Nume', esc(name))}
      ${row('Email', `<a href="mailto:${esc(email)}" style="color: #b45309;">${esc(email)}</a>`)}
      ${phone ? row('Telefon', esc(phone)) : ''}
      ${orderNumber ? row('Nr. comandă', esc(orderNumber)) : ''}
    </table>
    <div style="background: #f8fafc; border-left: 3px solid #ECB95F; padding: 12px 16px; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${esc(message)}</p>
    </div>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #64748b;">
      Răspunde direct la acest email — Reply-To este setat pe adresa clientului.
    </p>
  </body>
</html>`;

  const text = `Mesaj nou din formularul de contact
Subiect: ${subject}

Nume: ${name}
Email: ${email}${phone ? `\nTelefon: ${phone}` : ''}${orderNumber ? `\nNr. comandă: ${orderNumber}` : ''}

${message}

---
Răspunde direct la acest email — Reply-To este setat pe adresa clientului.`;

  return { subject: emailSubject, html, text };
}
