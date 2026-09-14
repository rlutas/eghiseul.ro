import { describe, expect, it } from 'vitest';
import {
  extraInvoiceForRow,
  parseOblioProformaDesc,
  pickInvoiceForProforma,
  type ExtraBillingEntry,
  type OblioDocLite,
} from '@/lib/accounting/extra-invoice-match';

// Regression guards (2026-07-23): decontări never read extra_billing, so
// extra-payment payout rows showed "nefacturat" or the ORIGINAL order
// invoice; Oblio-proforma card payments (no app order) always showed
// "nefacturat" despite the invoice existing (payout po_1Tvo1e..., EGH-0101).

const EGH_ENTRY: ExtraBillingEntry = {
  invoice: { seriesName: 'EGH', number: '0099', link: 'https://oblio.eu/f/99' },
  amount: 178.5, // RON (eghiseul convention)
  paymentIntentId: 'pi_extra_1',
};

const CJO_ENTRY: ExtraBillingEntry = {
  invoice: { seriesName: 'EGI2024', number: '24330', link: 'https://oblio.eu/f/24330' },
  amount_bani: 15000, // bani (CJO convention)
  sessionId: 'cs_123',
};

describe('extraInvoiceForRow', () => {
  it('matches by paymentIntentId (eghiseul shape, RON amount)', () => {
    const m = extraInvoiceForRow([EGH_ENTRY], {
      payment_intent_id: 'pi_extra_1',
      gross_bani: 17850,
    });
    expect(m).toEqual({ invoiceNumber: 'EGH-0099', invoiceUrl: 'https://oblio.eu/f/99' });
  });

  it('falls back to exact amount when entry has no paymentIntentId (CJO legacy)', () => {
    const m = extraInvoiceForRow([CJO_ENTRY], {
      payment_intent_id: 'pi_unrelated',
      gross_bani: 15000,
    });
    expect(m?.invoiceNumber).toBe('EGI2024-24330');
  });

  it('refuses ambiguous amount matches (two entries, same amount)', () => {
    const twin = { ...CJO_ENTRY, invoice: { seriesName: 'EGI2024', number: '24331', link: null } };
    const m = extraInvoiceForRow([CJO_ENTRY, twin], {
      payment_intent_id: 'pi_unrelated',
      gross_bani: 15000,
    });
    expect(m).toBe(null);
  });

  it('ignores entries without an issued invoice (FACTURA NEEMISĂ case)', () => {
    const m = extraInvoiceForRow([{ amount: 100, paymentIntentId: 'pi_x', invoice: null }], {
      payment_intent_id: 'pi_x',
      gross_bani: 10000,
    });
    expect(m).toBe(null);
  });

  it('returns null on empty/missing entries', () => {
    expect(extraInvoiceForRow(null, { payment_intent_id: 'pi', gross_bani: 1 })).toBe(null);
    expect(extraInvoiceForRow([], { payment_intent_id: 'pi', gross_bani: 1 })).toBe(null);
  });
});

describe('parseOblioProformaDesc', () => {
  it('parses the real Oblio card-payment line item', () => {
    expect(parseOblioProformaDesc('Plata cu card-ul pentru Proforma EGIP 0319')).toEqual({
      series: 'EGIP',
      number: '0319',
    });
  });

  it('tolerates casing and extra whitespace', () => {
    expect(parseOblioProformaDesc('plata pentru PROFORMA pcjo  42')).toEqual({
      series: 'PCJO',
      number: '42',
    });
  });

  it('returns null for non-proforma descriptions', () => {
    expect(parseOblioProformaDesc('Extra E-260722-XYZ: adăugat apostilă')).toBe(null);
    expect(parseOblioProformaDesc(null)).toBe(null);
    expect(parseOblioProformaDesc('')).toBe(null);
  });
});

// Regression guards (2026-09-14): Oblio-proforma card payments were matched
// on the STRIPE PAYER email, but the cardholder is often not the invoiced
// client — EGIP 0315 (Abu Hof Fadi, yosef.sa99@) was paid from
// abuhouf01@gmail.com, so payouts po_1Tlel5… / po_1Tjpss… stayed 17/18 and
// 4/5 for three months. Match on the proforma's own client instead.
describe('pickInvoiceForProforma', () => {
  const proforma: OblioDocLite = {
    seriesName: 'EGIP',
    number: '0315',
    issueDate: '2026-06-22',
    total: '250.0000',
    client: { name: 'Abu Hof Fadi', email: 'yosef.sa99@gmail.com' },
  };
  const target: OblioDocLite = {
    seriesName: 'EGI2024',
    number: '24180',
    issueDate: '2026-06-22',
    total: '250.0000',
    canceled: '0',
    link: 'https://oblio.eu/f/24180',
    client: { name: 'Abu Hof Fadi', email: 'yosef.sa99@gmail.com' },
  };
  const sameDaySameTotalOther: OblioDocLite = {
    seriesName: 'EGI2024',
    number: '24177',
    issueDate: '2026-06-22',
    total: '250.0000',
    canceled: '0',
    client: { name: 'Yadira Martinez Padron', email: 'yadivali@yahoo.com' },
  };

  it('matches by the proforma client email, ignoring same-total invoices of other clients', () => {
    expect(pickInvoiceForProforma(proforma, [sameDaySameTotalOther, target])).toBe(target);
  });

  it('falls back to the client name when the proforma has no email', () => {
    const noEmail = { ...proforma, client: { name: 'Abu  Hof Fadi', email: '' } };
    const named = { ...target, client: { name: 'ABU HOF FADI', email: 'other@x.ro' } };
    expect(pickInvoiceForProforma(noEmail, [sameDaySameTotalOther, named])).toBe(named);
  });

  it('ignores canceled invoices, other totals and invoices issued before the proforma', () => {
    const canceled = { ...target, canceled: '1' };
    const wrongTotal = { ...target, total: '200.0000' };
    const earlier = { ...target, issueDate: '2026-06-10' };
    expect(pickInvoiceForProforma(proforma, [canceled, wrongTotal, earlier])).toBeNull();
  });

  it('returns null when more than one invoice fits (never guesses)', () => {
    expect(pickInvoiceForProforma(proforma, [target, { ...target, number: '24181' }])).toBeNull();
  });
});
