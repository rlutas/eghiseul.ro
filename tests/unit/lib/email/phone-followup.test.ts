import { describe, it, expect } from 'vitest';
import { renderPhoneFollowupEmail } from '@/lib/email/templates/phone-followup';

describe('phone follow-up email — fără numele colegei (cerere echipă 07.10.2026)', () => {
  const out = renderPhoneFollowupEmail({
    customerFirstName: 'Ana',
    agentName: 'Maria',
    serviceName: 'Cazier Judiciar Persoană Fizică',
    orderNumber: 'E-TEST',
    totalRon: 198,
    couponCode: 'TEL-TEST01',
    discountLabel: '10%',
    couponValidUntil: new Date('2026-11-09T10:00:00Z'),
    resumeUrl: 'https://eghiseul.ro/comanda/reluare?coupon=TEL-TEST01',
  });

  it('nu scrie numele celui care a sunat nicăieri', () => {
    expect(out.html).not.toContain('Maria');
    expect(out.text).not.toContain('Maria');
  });

  it('vorbește de reprezentantul brandului', () => {
    expect(out.text).toContain('discuția de azi cu reprezentantul');
    expect(out.html).toContain('discuția de azi cu reprezentantul');
  });
});
