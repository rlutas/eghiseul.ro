import { describe, expect, it } from 'vitest';
import {
  buildExtraPaymentSubject,
  buildExtraPaymentHtml,
  buildExtraPaymentText,
  type ExtraPaymentEmailInput,
} from '@/lib/email/templates/extra-payment';

const sample: ExtraPaymentEmailInput = {
  customerFirstName: 'Ionel',
  orderNumber: 'E-260527-A2XJ9',
  amountRon: 198,
  changesDescription: 'adăugat: apostilă Haga',
  paymentUrl: 'https://eghiseul.ro/comanda/plata-extra/pi_abc123',
};

describe('buildExtraPaymentSubject', () => {
  it('includes the order number + amount in the subject', () => {
    const subject = buildExtraPaymentSubject(sample);
    expect(subject).toContain('E-260527-A2XJ9');
    expect(subject).toContain('198.00 RON');
    expect(subject).toContain('Modificare comandă');
  });

  it('formats amount with 2 decimals even for round numbers', () => {
    const subject = buildExtraPaymentSubject({ ...sample, amountRon: 100 });
    expect(subject).toContain('100.00 RON');
  });
});

describe('buildExtraPaymentHtml', () => {
  it('renders amount + changes + payment URL prominently', () => {
    const html = buildExtraPaymentHtml(sample);
    expect(html).toContain('198.00 RON');
    expect(html).toContain('adăugat: apostilă Haga');
    expect(html).toContain('https://eghiseul.ro/comanda/plata-extra/pi_abc123');
    expect(html).toContain('Ionel');
  });

  it('uses anonymous greeting when first name missing', () => {
    const html = buildExtraPaymentHtml({ ...sample, customerFirstName: null });
    expect(html).not.toContain('Salut null');
    expect(html).toContain('Salut,');
  });

  it('escapes HTML in first name (XSS guard)', () => {
    const html = buildExtraPaymentHtml({
      ...sample,
      customerFirstName: '<script>alert(1)</script>',
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in changes description', () => {
    const html = buildExtraPaymentHtml({
      ...sample,
      changesDescription: '<img src=x onerror=hack()>',
    });
    expect(html).not.toContain('<img src=x onerror=hack()>');
    expect(html).toContain('&lt;img');
  });

  it('escapes payment URL attribute', () => {
    const html = buildExtraPaymentHtml({
      ...sample,
      paymentUrl: 'https://e.com/?a=1&b="quoted"',
    });
    // URL goes into href — quotes/ampersands must be escaped.
    expect(html).not.toMatch(/href="https:\/\/e\.com\/\?a=1&b=".*"/);
    expect(html).toContain('&amp;');
  });

  it('mentions the 24h validity window so customer feels urgency', () => {
    const html = buildExtraPaymentHtml(sample);
    expect(html).toContain('24h');
  });
});

describe('buildExtraPaymentText', () => {
  it('renders a plain-text fallback with the essentials', () => {
    const text = buildExtraPaymentText(sample);
    expect(text).toContain('E-260527-A2XJ9');
    expect(text).toContain('198.00 RON');
    expect(text).toContain('adăugat: apostilă Haga');
    expect(text).toContain('https://eghiseul.ro/comanda/plata-extra/pi_abc123');
    expect(text).toContain('Salut Ionel');
  });

  it('omits the name when missing', () => {
    const text = buildExtraPaymentText({ ...sample, customerFirstName: null });
    expect(text).toContain('Salut,');
    expect(text).not.toContain('Salut null');
  });
});
