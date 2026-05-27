import { describe, expect, it } from 'vitest';
import {
  buildRecoverySubject,
  buildRecoveryHtml,
  buildRecoveryText,
  type RecoveryEmailInput,
} from '@/lib/email/templates/abandoned-recovery';

// The recovery email is the customer's last touch before the cart goes
// cold. Tests pin the legal-ish copy + the coupon visibility — a regression
// here loses a customer instead of nudging them back.

const sample: RecoveryEmailInput = {
  customerFirstName: 'Ionel',
  serviceName: 'Cazier Judiciar',
  totalRon: 278.0,
  couponCode: 'RECOVERY-AB23CDEF',
  discountPercent: 10,
  resumeUrl: 'https://eghiseul.ro/comanda/checkout/abc-123',
  orderNumber: 'E-260527-A2XJ9',
};

describe('buildRecoverySubject', () => {
  it('greets the customer by first name when present', () => {
    expect(buildRecoverySubject(sample)).toContain('Ionel');
    expect(buildRecoverySubject(sample)).toContain('Cazier Judiciar');
    expect(buildRecoverySubject(sample)).toContain('10%');
    expect(buildRecoverySubject(sample)).toContain('48h');
  });

  it('falls back to anonymous greeting when no first name', () => {
    const subject = buildRecoverySubject({ ...sample, customerFirstName: null });
    expect(subject).not.toContain('null');
    expect(subject).toContain('Cazier Judiciar');
  });
});

describe('buildRecoveryHtml', () => {
  it('renders the coupon code prominently inside the HTML', () => {
    const html = buildRecoveryHtml(sample);
    expect(html).toContain('RECOVERY-AB23CDEF');
    expect(html).toContain('Cazier Judiciar');
    expect(html).toContain('https://eghiseul.ro/comanda/checkout/abc-123');
  });

  it('includes the order number in the header', () => {
    const html = buildRecoveryHtml(sample);
    expect(html).toContain('E-260527-A2XJ9');
  });

  it('formats the total to 2 decimals', () => {
    const html = buildRecoveryHtml(sample);
    expect(html).toContain('278.00 RON');
  });

  it('escapes HTML in customer first name to prevent injection', () => {
    const malicious = {
      ...sample,
      customerFirstName: '<script>alert(1)</script>',
    };
    const html = buildRecoveryHtml(malicious);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes URL attribute properly', () => {
    const dodgy = {
      ...sample,
      resumeUrl: 'https://example.com/?a=1&b="quoted"',
    };
    const html = buildRecoveryHtml(dodgy);
    // The URL appears inside an href, so quotes must be escaped to prevent
    // breaking out of the attribute.
    expect(html).not.toMatch(/href="https:\/\/example\.com\/\?a=1&b=".*"/);
    expect(html).toContain('&amp;');
  });
});

describe('buildRecoveryText', () => {
  it('renders a plain-text version with coupon + resume URL', () => {
    const text = buildRecoveryText(sample);
    expect(text).toContain('Cazier Judiciar');
    expect(text).toContain('RECOVERY-AB23CDEF');
    expect(text).toContain('https://eghiseul.ro/comanda/checkout/abc-123');
    expect(text).toContain('Salut Ionel');
    expect(text).toContain('48h');
  });

  it('omits the name when missing', () => {
    const text = buildRecoveryText({ ...sample, customerFirstName: null });
    expect(text).not.toContain('Salut null');
    expect(text).toContain('Salut,');
  });
});
