/**
 * Emails for the bank-transfer (IBAN) payment path.
 *
 * Until 10.09.2026 a customer who picked "transfer bancar" got NOTHING: the
 * order was only flagged when they uploaded a payment proof back on the
 * checkout page, which nobody does after leaving for their banking app. The
 * order stayed `pending`, the auto-abandon cron buried it 30 minutes later,
 * and the money arrived against an order marked "abandoned"
 * (real case: E-260905-DMUZA).
 *
 * Two messages live here:
 *   - customer: order registered, here is the account, amount and reference;
 *   - team: an order is waiting for the money to be matched in the statement.
 */
import { brandedEmailHtml, ctaButton, infoRows, escHtml } from './branded-layout';

export interface BankTransferPendingInput {
  customerFirstName?: string | null;
  orderNumber: string;
  serviceName: string;
  amountRon: number;
  /** Account details from admin_settings.bank_details. */
  accountHolder: string;
  bankName: string;
  ibanRon: string;
  ibanEur?: string | null;
  swift?: string | null;
  /** Public status page for this order. */
  statusUrl: string;
  /** True when the customer already attached a proof of payment in checkout. */
  hasProof: boolean;
}

export function buildBankTransferPendingSubject(input: BankTransferPendingInput): string {
  return `Comanda ${input.orderNumber} — date de plată prin transfer bancar (${input.amountRon.toFixed(2)} RON)`;
}

export function buildBankTransferPendingHtml(input: BankTransferPendingInput): string {
  const greeting = input.customerFirstName
    ? `Salut ${escHtml(input.customerFirstName)},`
    : 'Salut,';
  const proofLine = input.hasProof
    ? 'Am primit și dovada de plată încărcată de tine. Verificăm încasarea și îți confirmăm pe email.'
    : 'De îndată ce banii intră în cont, îți confirmăm pe email și punem comanda în lucru.';

  return brandedEmailHtml({
    preheader: `Transfer bancar ${input.amountRon.toFixed(2)} RON pentru comanda ${input.orderNumber}`,
    content: `
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">Comanda <span style="font-family:monospace;font-weight:700;color:#0f172a;">${escHtml(input.orderNumber)}</span></p>
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${greeting}</h1>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Comanda ta pentru <strong>${escHtml(input.serviceName)}</strong> este înregistrată și așteaptă plata prin transfer bancar. Nu se pierde și nu expiră.</p>
        <div style="background:#fffbeb;border:2px solid #fcd34d;border-radius:10px;padding:18px;margin:0 0 20px;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#92400e;">Sumă de plată</p>
          <p style="margin:0;font-size:32px;font-weight:bold;color:#78350f;">${input.amountRon.toFixed(2)} RON</p>
        </div>
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B1B33;">Datele contului</p>
        ${infoRows([
          { label: 'Beneficiar', value: input.accountHolder },
          { label: 'Bancă', value: input.bankName },
          { label: 'IBAN (RON)', value: input.ibanRon, mono: true },
          ...(input.ibanEur ? [{ label: 'IBAN (EUR)', value: input.ibanEur, mono: true }] : []),
          ...(input.swift ? [{ label: 'SWIFT/BIC', value: input.swift, mono: true }] : []),
          { label: 'Detalii plată', value: input.orderNumber, mono: true },
        ])}
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Treci numărul comenzii <strong>${escHtml(input.orderNumber)}</strong> la „detalii plată" — așa recunoaștem transferul în extras. ${proofLine}</p>
        <p style="margin:12px 0 0;color:#64748b;font-size:13px;line-height:1.6;">Transferurile interbancare ajung de obicei în aceeași zi lucrătoare, uneori a doua zi. Termenul de livrare începe din momentul confirmării încasării.</p>
        ${ctaButton('Vezi starea comenzii', input.statusUrl)}
        <p style="margin:14px 0 0;text-align:center;font-size:12px;color:#9ca3af;">Ai deja ordinul de plată? Răspunde la acest email cu dovada și confirmăm mai repede.</p>`,
  });
}

export function buildBankTransferPendingText(input: BankTransferPendingInput): string {
  return [
    `Comanda ${input.orderNumber}`,
    '',
    `Comanda ta pentru ${input.serviceName} este înregistrată și așteaptă plata prin transfer bancar.`,
    '',
    `Sumă de plată: ${input.amountRon.toFixed(2)} RON`,
    `Beneficiar: ${input.accountHolder}`,
    `Banca: ${input.bankName}`,
    `IBAN (RON): ${input.ibanRon}`,
    ...(input.ibanEur ? [`IBAN (EUR): ${input.ibanEur}`] : []),
    ...(input.swift ? [`SWIFT/BIC: ${input.swift}`] : []),
    `Detalii plată: ${input.orderNumber}`,
    '',
    'Treci numarul comenzii la "detalii plata" ca sa recunoastem transferul in extras.',
    input.hasProof
      ? 'Am primit dovada de plata incarcata de tine. Verificam incasarea si iti confirmam pe email.'
      : 'De indata ce banii intra in cont, iti confirmam pe email si punem comanda in lucru.',
    '',
    `Starea comenzii: ${input.statusUrl}`,
  ].join('\n');
}

export interface BankTransferAdminInput {
  orderNumber: string;
  serviceName: string;
  amountRon: number;
  customerEmail: string;
  customerPhone?: string | null;
  hasProof: boolean;
  adminUrl: string;
}

export function buildBankTransferAdminSubject(input: BankTransferAdminInput): string {
  return `Transfer bancar de confirmat: ${input.orderNumber} (${input.amountRon.toFixed(2)} RON)`;
}

export function buildBankTransferAdminHtml(input: BankTransferAdminInput): string {
  return brandedEmailHtml({
    preheader: `${input.orderNumber} așteaptă confirmarea încasării prin transfer bancar`,
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">Comandă cu plată prin transfer bancar</h1>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Clientul a ales transferul bancar. Comanda stă pe „Așteptare plată" până când cineva confirmă încasarea din extras.</p>
        ${infoRows([
          { label: 'Comandă', value: input.orderNumber, mono: true },
          { label: 'Serviciu', value: input.serviceName },
          { label: 'Sumă', value: `${input.amountRon.toFixed(2)} RON` },
          { label: 'Email client', value: input.customerEmail },
          ...(input.customerPhone ? [{ label: 'Telefon', value: input.customerPhone }] : []),
          { label: 'Dovadă atașată', value: input.hasProof ? 'DA' : 'NU' },
        ])}
        <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">Când banii apar în extras, deschide comanda și apasă „Confirmă plata” cu referința tranzacției. Se emit automat factura, documentele și emailul de confirmare.</p>
        ${ctaButton('Deschide comanda în admin', input.adminUrl)}`,
  });
}

export function buildBankTransferAdminText(input: BankTransferAdminInput): string {
  return [
    `Comanda ${input.orderNumber} asteapta confirmarea platii prin transfer bancar.`,
    '',
    `Serviciu: ${input.serviceName}`,
    `Suma: ${input.amountRon.toFixed(2)} RON`,
    `Email client: ${input.customerEmail}`,
    ...(input.customerPhone ? [`Telefon: ${input.customerPhone}`] : []),
    `Dovada atasata: ${input.hasProof ? 'DA' : 'NU'}`,
    '',
    `Admin: ${input.adminUrl}`,
  ].join('\n');
}
