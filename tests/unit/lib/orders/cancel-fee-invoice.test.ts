import { describe, expect, it } from 'vitest';
import {
  CANCEL_FEE_PERCENT,
  buildCancelFeeInvoiceInput,
  cancelFeeLineName,
  computeCancelFeeAmount,
} from '@/lib/orders/cancel-fee-invoice';
import { computeCancelRefundAmount } from '@/lib/orders/self-cancel';

// Documentul fiscal al celor 30% reținuți la anulare: suma trebuie să fie
// exact complementul refundului (total = refund + taxă, la ban), altfel
// contabilul are un leu în plus sau în minus față de Stripe.
describe('computeCancelFeeAmount', () => {
  it('is 30% of the total', () => {
    expect(CANCEL_FEE_PERCENT).toBe(30);
    expect(computeCancelFeeAmount(198)).toBe(59.4);
    expect(computeCancelFeeAmount(100)).toBe(30);
  });

  it('is exactly the complement of the refund, even on awkward totals', () => {
    for (const total of [198, 199.99, 33.33, 1248, 0.01, 1.05]) {
      const refund = computeCancelRefundAmount(total);
      const fee = computeCancelFeeAmount(total);
      expect(Math.round((refund + fee) * 100)).toBe(Math.round(total * 100));
    }
  });
});

describe('buildCancelFeeInvoiceInput', () => {
  const client = { cif: '', name: 'Ion Popescu', address: 'str. X', state: 'Cluj', city: 'Cluj-Napoca', country: 'Romania' };

  it('emits a single VAT-included line and a card collect for the same amount', () => {
    const input = buildCancelFeeInvoiceInput({
      cif: 'RO123',
      seriesName: 'EGH',
      client,
      orderNumber: 'E-260915-M4A4V',
      serviceName: 'Identificare Imobil după Adresă',
      feeRon: 59.4,
      paymentReference: 'pi_123',
      issueDate: '2026-09-15',
    });
    expect(input.products).toHaveLength(1);
    expect(input.products[0].price).toBe(59.4);
    expect(input.products[0].vatIncluded).toBe(true);
    expect(input.products[0].name).toBe(cancelFeeLineName('E-260915-M4A4V'));
    expect(input.products[0].name).toContain('30%');
    expect(input.collect).toEqual({ type: 'Card', documentDate: '2026-09-15', documentNumber: 'pi_123', value: 59.4 });
    expect(input.issueDate).toBe('2026-09-15');
    expect(input.seriesName).toBe('EGH');
  });

  it('refuses a zero or negative fee', () => {
    expect(() =>
      buildCancelFeeInvoiceInput({
        cif: 'RO123', seriesName: 'EGH', client, orderNumber: 'X', serviceName: 'S', feeRon: 0, paymentReference: 'pi',
      })
    ).toThrow();
  });
});
