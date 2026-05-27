// Email confirmation sent when a customer self-cancels within the 30-min
// window. Plain string templates so we don't pull a JSX renderer just for
// transactional emails. HTML escaping is done at the boundary so the body
// stays safe even if name/order_number contain weird characters.

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

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a;">
    <h1 style="font-size: 20px; margin-bottom: 8px;">Cerere de anulare înregistrată</h1>
    <p>Salut ${esc(clientName)},</p>
    <p>Am primit cererea ta de anulare pentru comanda <strong>${esc(orderNumber)}</strong>.</p>
    <div style="background: #fff7ed; border-left: 3px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Rambursare 70%:</strong> ${refundAmountRon.toFixed(2)} RON din ${amountTotalRon.toFixed(2)} RON.
      </p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #78350f;">
        Diferența de 30% acoperă comisioanele Stripe + procesarea deja începută.
      </p>
    </div>
    <p>Rambursarea va apărea în contul tău în <strong>5–10 zile lucrătoare</strong>, automat pe metoda de plată folosită.</p>
    <p>Nu este nevoie să faci nimic — te contactăm pe email când refund-ul este procesat.</p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #64748b;">
      Dacă ai întrebări, răspunde la acest email sau contactează-ne pe WhatsApp.
    </p>
  </body>
</html>`;

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
