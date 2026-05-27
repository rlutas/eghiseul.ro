/**
 * Recovery email for abandoned cart — sent by /api/cron/recovery-emails to
 * customers who left at checkout 30 min - 7 days ago. Contains:
 *   - a friendly nudge mentioning the service
 *   - an auto-generated single-use coupon (10% off, 48h validity)
 *   - a deep link back to the customer's checkout page
 *
 * Both HTML and plain-text are produced; emails clients that block images
 * fall back to plain text. No external assets — the email body is fully
 * inline so it renders even without network access.
 */

export interface RecoveryEmailInput {
  customerFirstName?: string | null;
  serviceName: string;
  totalRon: number;
  /** Coupon code we generated for this order. */
  couponCode: string;
  /** Discount the coupon applies (RON if `discount_type='fixed'`, percent if
   *  'percentage'). For the UI we just say "10% reducere". */
  discountPercent: number;
  /** Resume-checkout link — e.g. `https://eghiseul.ro/comanda/checkout/<id>`. */
  resumeUrl: string;
  /** Order number, surfaced in the subject for tracking. */
  orderNumber: string;
}

export function buildRecoverySubject(input: RecoveryEmailInput): string {
  const name = input.customerFirstName?.trim();
  return name
    ? `${name}, ai uitat ${input.serviceName} — reducere ${input.discountPercent}% pe 48h`
    : `Ai uitat ${input.serviceName} — reducere ${input.discountPercent}% pe 48h`;
}

export function buildRecoveryHtml(input: RecoveryEmailInput): string {
  const greeting = input.customerFirstName
    ? `Salut ${escapeHtml(input.customerFirstName)},`
    : 'Salut,';
  return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(buildRecoverySubject(input))}</title>
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px 28px">
        <p style="margin:0 0 12px 0;font-size:14px;color:#6b7280">Comanda ${escapeHtml(input.orderNumber)}</p>
        <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:#111827">${greeting}</h1>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6">
          Am observat că ai început comanda pentru <strong>${escapeHtml(input.serviceName)}</strong> dar nu ai apucat să finalizezi plata. Documentul te așteaptă să-l ridicăm pentru tine.
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6">
          Ca să-ți fie mai ușor să continui, îți oferim <strong>${input.discountPercent}% reducere</strong> pe această comandă cu codul:
        </p>
        <div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:18px;text-align:center;margin:0 0 20px 0">
          <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#92400e">Cod cupon — valabil 48h</p>
          <p style="margin:0;font-size:28px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#78350f;letter-spacing:2px">${escapeHtml(input.couponCode)}</p>
        </div>
        <p style="margin:0 0 24px 0;font-size:14px;color:#6b7280;line-height:1.6">
          Cuponul se aplică automat când dai click pe butonul de mai jos. Dacă închizi mailul, îl poți introduce și manual pe pagina de plată.
        </p>
        <p style="margin:0 0 8px 0;text-align:center">
          <a href="${escapeAttr(input.resumeUrl)}" style="display:inline-block;padding:14px 32px;background:#ecb95f;color:#1f2937;font-weight:600;text-decoration:none;border-radius:10px;font-size:15px">
            Continuă comanda →
          </a>
        </p>
        <p style="margin:0;text-align:center;font-size:12px;color:#9ca3af">
          Total estimat: ${input.totalRon.toFixed(2)} RON (înainte de reducere)
        </p>
      </div>
      <p style="margin:18px 0 0 0;text-align:center;font-size:12px;color:#9ca3af;line-height:1.5">
        Ai primit acest email pentru că ai început o comandă pe eGhișeul.ro. Dacă nu mai vrei să continui, ignoră mesajul — datele tale nu vor fi păstrate mai mult de 14 zile.
      </p>
    </div>
  </body>
</html>`;
}

export function buildRecoveryText(input: RecoveryEmailInput): string {
  const greeting = input.customerFirstName
    ? `Salut ${input.customerFirstName},`
    : 'Salut,';
  return [
    `Comanda ${input.orderNumber}`,
    '',
    greeting,
    '',
    `Am observat că ai început comanda pentru ${input.serviceName} dar nu ai finalizat plata.`,
    '',
    `Ai ${input.discountPercent}% reducere cu codul: ${input.couponCode}`,
    `Cuponul este valabil 48h și este de unică folosință.`,
    '',
    `Continuă comanda aici: ${input.resumeUrl}`,
    '',
    `Total estimat: ${input.totalRon.toFixed(2)} RON (înainte de reducere)`,
    '',
    '— Echipa eGhișeul.ro',
  ].join('\n');
}

// ─── small html escape, no template engine needed ────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  // URLs are typically safe but we still escape quotes/ampersands.
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
