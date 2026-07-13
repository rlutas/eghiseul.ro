// Email confirmation sent when a customer self-cancels within the 30-min
// window. Uses the shared branded shell (same look as the order emails).
import { brandedEmailHtml, infoRows } from './branded-layout';

export interface CancellationRequestEmailInput {
  clientName: string;
  orderNumber: string;
  amountTotalRon: number;
  refundAmountRon: number; // 70% of total
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderCancellationRequestEmail(input: CancellationRequestEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { clientName, orderNumber, amountTotalRon, refundAmountRon } = input;
  const subject = `Cerere anulare comandă ${orderNumber} înregistrată`;

  const html = brandedEmailHtml({
    preheader: `Cerere de anulare înregistrată pentru comanda ${orderNumber} — rambursare ${refundAmountRon.toFixed(2)} RON`,
    content: `
        <h1 style="margin:0 0 6px;color:#0B1B33;font-size:20px;">Cerere de anulare înregistrată</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Salut ${esc(clientName)}, am primit cererea ta de anulare pentru comanda de mai jos.</p>
        ${infoRows([
          { label: 'Comandă', value: orderNumber, mono: true },
          { label: 'Total achitat', value: `${amountTotalRon.toFixed(2)} RON` },
          { label: 'Rambursare (70%)', value: `${refundAmountRon.toFixed(2)} RON` },
        ])}
        <div style="background:#fff7ed;border-left:3px solid #f59e0b;padding:12px 16px;margin:18px 0;border-radius:6px;">
          <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">Diferența de 30% acoperă comisioanele de plată + procesarea deja începută.</p>
        </div>
        <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">Rambursarea apare în contul tău în <strong>5–10 zile lucrătoare</strong>, automat pe metoda de plată folosită.</p>
        <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">Nu trebuie să faci nimic — te anunțăm pe email când refund-ul e procesat.</p>`,
  });

  const text = `Cerere de anulare înregistrată

Salut ${clientName},

Am primit cererea ta de anulare pentru comanda ${orderNumber}.

Rambursare 70%: ${refundAmountRon.toFixed(2)} RON din ${amountTotalRon.toFixed(2)} RON.
Diferența de 30% acoperă comisioanele Stripe + procesarea deja începută.

Rambursarea va apărea în contul tău în 5–10 zile lucrătoare, automat pe metoda de plată folosită.

Nu este nevoie să faci nimic — te contactăm pe email când refund-ul este procesat.

Dacă ai întrebări, răspunde la acest email sau contactează-ne pe WhatsApp.`;

  return { subject, html, text };
}
