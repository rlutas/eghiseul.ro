import { describe, expect, it } from 'vitest';
import {
  renderOrderMessageToClientEmail,
  renderOrderMessageToStaffEmail,
} from '@/lib/email/templates/order-message';
import { BRANDS } from '@/lib/brand/brands';

describe('order message emails', () => {
  it('quotes the message to the client, escaped, with the thread link', () => {
    const mail = renderOrderMessageToClientEmail({
      friendlyOrderId: 'E-260925-ABCDE',
      serviceName: 'Identificare imobil după proprietar',
      authorLabel: 'Topograful care lucrează comanda',
      body: 'Am găsit 2 imobile:\n1. <teren>\n2. casă',
      viewUrl: 'https://eghiseul.ro/comanda/status/?order=E-260925-ABCDE&email=a%40b.ro#mesaje',
      brand: BRANDS.eghiseul,
    });
    expect(mail.subject).toContain('E-260925-ABCDE');
    expect(mail.html).toContain('&lt;teren&gt;');
    expect(mail.html).not.toContain('<teren>');
    expect(mail.html).toContain('#mesaje');
    expect(mail.text).toContain('Am găsit 2 imobile');
  });

  it('tells the staff who answered and how many files came', () => {
    const mail = renderOrderMessageToStaffEmail({
      friendlyOrderId: 'E-260925-ABCDE',
      serviceName: 'Identificare imobil',
      clientName: 'Popescu Ion',
      body: 'Îl vreau pe primul.',
      attachmentCount: 2,
      orderUrl: 'https://eghiseul.ro/colaborator/orders/x',
    });
    expect(mail.subject).toContain('Răspuns de la client');
    expect(mail.html).toContain('Popescu Ion');
    expect(mail.text).toContain('Atașamente: 2');
  });
});
