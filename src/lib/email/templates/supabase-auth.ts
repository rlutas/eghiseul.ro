/**
 * Email templates served by Supabase Auth (GoTrue), not by Resend directly.
 *
 * These are the only customer-facing emails we do not render ourselves: GoTrue
 * builds them from templates stored in the project's auth config and sends them
 * through our SMTP (Resend). They live here so they are versioned and reviewed
 * like the rest; `scripts/sync-supabase-auth-templates.ts` pushes them.
 *
 * Why they matter beyond looks: until 2026-09-17 these used the GoTrue defaults
 * — English, unbranded, "Confirm your signup / Follow this link to confirm your
 * user" — sent to Romanian customers from an address they do not recognise.
 * That is the shape that collects spam complaints, and spam complaints are what
 * got the project's email sending restricted on 2026-08-09, which killed account
 * creation for 39 days.
 *
 * Constraints, because this is email and not a web page:
 *  - tables for layout, every style inline, no <style> block and no external CSS;
 *  - 560px card, no fixed heights, nothing that breaks under 360px;
 *  - the action must also be reachable as a plain copyable URL, because some
 *    clients strip buttons;
 *  - GoTrue placeholders ({{ .ConfirmationURL }}, {{ .NewEmail }}) pass through
 *    untouched.
 */

const NAVY = '#0B1B33';
const GOLD = '#ECB95F';
const INK = '#0f172a';
const MUTED = '#475569';
const FAINT = '#94a3b8';
const LINE = '#e2e8f0';
const WASH = '#f8fafc';

interface ShellInput {
  /** Hidden inbox-preview line, shown next to the subject in most clients. */
  preheader: string;
  /** Single glyph in the round badge above the heading. */
  glyph: string;
  title: string;
  /** Paragraph under the title. Plain text. */
  lead: string;
  /** Label of the gold button. */
  cta: string;
  /** Slate note under the button — expiry, "wasn't me", etc. Allows <strong>. */
  note: string;
}

/**
 * The action URL is always {{ .ConfirmationURL }}: GoTrue substitutes it, so it
 * must not be escaped or encoded here.
 */
const URL_PLACEHOLDER = '{{ .ConfirmationURL }}';

function shell({ preheader, glyph, title, lead, cta, note }: ShellInput): string {
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${WASH};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WASH};">
<tr><td align="center" style="padding:32px 16px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:18px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);">

    <tr><td style="background:${NAVY};padding:20px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:10px;"><img src="https://eghiseul.ro/icon.png" alt="" width="30" height="30" style="display:block;border:0;border-radius:8px;"></td>
        <td style="vertical-align:middle;"><span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.2px;">eGhișeul<span style="color:${GOLD};">.ro</span></span></td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:34px 28px 0;" align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:64px;height:64px;background:#FDF6E9;border-radius:32px;font-size:28px;line-height:64px;">${glyph}</td></tr></table>
    </td></tr>

    <tr><td style="padding:20px 28px 0;" align="center">
      <h1 style="margin:0;color:${INK};font-size:22px;line-height:1.3;font-weight:800;letter-spacing:-0.3px;">${title}</h1>
      <p style="margin:12px 0 0;color:${MUTED};font-size:15px;line-height:1.65;">${lead}</p>
    </td></tr>

    <tr><td style="padding:26px 28px 0;" align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="border-radius:12px;background:${GOLD};">
        <a href="${URL_PLACEHOLDER}" style="display:inline-block;padding:15px 34px;color:${NAVY};font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">${cta}</a>
      </td></tr></table>
    </td></tr>

    <tr><td style="padding:22px 28px 0;">
      <p style="margin:0 0 8px;color:${FAINT};font-size:12px;line-height:1.5;text-align:center;">Dacă butonul nu funcționează, copiază linkul în browser:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WASH};border:1px solid ${LINE};border-radius:10px;">
        <tr><td style="padding:12px 14px;">
          <a href="${URL_PLACEHOLDER}" style="color:${NAVY};font-size:12px;line-height:1.5;word-break:break-all;text-decoration:none;">${URL_PLACEHOLDER}</a>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:22px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WASH};border-left:3px solid ${GOLD};border-radius:0 10px 10px 0;">
        <tr><td style="padding:12px 16px;">
          <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">${note}</p>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:22px 28px 28px;">
      <p style="margin:0;color:${FAINT};font-size:12px;line-height:1.6;text-align:center;">Ai nevoie de ajutor? Scrie-ne la <a href="mailto:contact@eghiseul.ro" style="color:${NAVY};text-decoration:none;font-weight:600;">contact@eghiseul.ro</a> sau pe <a href="https://eghiseul.ro/contact/" style="color:${NAVY};text-decoration:none;font-weight:600;">pagina de contact</a>.</p>
    </td></tr>

    <tr><td style="background:${WASH};border-top:1px solid ${LINE};padding:18px 28px;">
      <p style="margin:0 0 6px;color:${FAINT};font-size:11px;line-height:1.6;text-align:center;">eDigitalizare SRL &middot; CUI RO49278701 &middot; <a href="https://anpc.ro/" style="color:${FAINT};text-decoration:underline;">ANPC</a> &middot; <a href="https://ec.europa.eu/consumers/odr" style="color:${FAINT};text-decoration:underline;">SOL</a></p>
      <p style="margin:0;color:${FAINT};font-size:11px;line-height:1.6;text-align:center;">eGhișeul.ro este un serviciu privat de asistență la obținerea de documente. Nu suntem instituție publică și nu suntem afiliați cu autoritățile statului; instituțiile eliberează documentele, noi le obținem pentru tine.</p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

export const CONFIRMATION_SUBJECT = 'Confirmă-ți adresa de email · eGhișeul.ro';

export const CONFIRMATION_HTML = shell({
  preheader: 'Un singur click și contul tău eGhișeul.ro este activ.',
  glyph: '&#9993;&#65039;',
  title: 'Confirmă-ți adresa de email',
  lead: 'Ai creat un cont pe eGhișeul.ro. Mai ai un singur pas: confirmă că adresa aceasta îți aparține.',
  cta: 'Confirmă adresa',
  note:
    'Linkul este valabil <strong>o oră</strong>. Dacă nu tu ai cerut contul, ignoră mesajul — nu se întâmplă nimic. ' +
    'Nu ai nevoie de cont ca să comanzi sau să urmărești o comandă.',
});

export const RECOVERY_SUBJECT = 'Resetare parolă · eGhișeul.ro';

export const RECOVERY_HTML = shell({
  preheader: 'Alege o parolă nouă pentru contul tău eGhișeul.ro.',
  glyph: '&#128273;',
  title: 'Alege o parolă nouă',
  lead: 'Ai cerut resetarea parolei pentru contul tău eGhișeul.ro. Apasă butonul de mai jos ca să setezi una nouă.',
  cta: 'Setează parola nouă',
  note:
    'Linkul este valabil <strong>o oră</strong> și poate fi folosit o singură dată. ' +
    'Dacă nu tu ai cerut resetarea, ignoră mesajul — parola rămâne neschimbată.',
});

export const EMAIL_CHANGE_SUBJECT = 'Confirmă noua adresă de email · eGhișeul.ro';

export const EMAIL_CHANGE_HTML = shell({
  preheader: 'Confirmă noua adresă de email a contului tău.',
  glyph: '&#128257;',
  title: 'Confirmă noua adresă',
  lead: 'Ai cerut schimbarea adresei de email a contului în <strong>{{ .NewEmail }}</strong>. Confirmă din butonul de mai jos.',
  cta: 'Confirmă adresa nouă',
  note:
    'Linkul este valabil <strong>o oră</strong>. Dacă nu tu ai cerut schimbarea, ignoră mesajul și scrie-ne imediat la contact@eghiseul.ro.',
});

export const MAGIC_LINK_SUBJECT = 'Linkul tău de autentificare · eGhișeul.ro';

export const MAGIC_LINK_HTML = shell({
  preheader: 'Autentifică-te în contul tău eGhișeul.ro.',
  glyph: '&#128274;',
  title: 'Autentifică-te în cont',
  lead: 'Apasă butonul de mai jos ca să intri în contul tău eGhișeul.ro, fără parolă.',
  cta: 'Intră în cont',
  note:
    'Linkul este valabil <strong>o oră</strong> și poate fi folosit o singură dată. ' +
    'Dacă nu tu ai cerut autentificarea, ignoră mesajul.',
});

export const INVITE_SUBJECT = 'Ai fost invitat pe eGhișeul.ro';

export const INVITE_HTML = shell({
  preheader: 'Ai fost invitat să îți creezi cont pe eGhișeul.ro.',
  glyph: '&#127881;',
  title: 'Ai fost invitat',
  lead: 'Cineva te-a invitat să îți creezi un cont pe eGhișeul.ro. Acceptă invitația din butonul de mai jos.',
  cta: 'Acceptă invitația',
  note: 'Dacă nu te așteptai la această invitație, ignoră mesajul.',
});

/** Everything the sync script pushes, keyed by the GoTrue config field names. */
export const SUPABASE_AUTH_TEMPLATES: Record<string, string> = {
  mailer_subjects_confirmation: CONFIRMATION_SUBJECT,
  mailer_templates_confirmation_content: CONFIRMATION_HTML,
  mailer_subjects_recovery: RECOVERY_SUBJECT,
  mailer_templates_recovery_content: RECOVERY_HTML,
  mailer_subjects_email_change: EMAIL_CHANGE_SUBJECT,
  mailer_templates_email_change_content: EMAIL_CHANGE_HTML,
  mailer_subjects_magic_link: MAGIC_LINK_SUBJECT,
  mailer_templates_magic_link_content: MAGIC_LINK_HTML,
  mailer_subjects_invite: INVITE_SUBJECT,
  mailer_templates_invite_content: INVITE_HTML,
};
