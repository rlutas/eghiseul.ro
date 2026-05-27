import { describe, expect, it } from 'vitest';
import {
  buildStripeLineItems,
  buildPaymentIntentDescription,
  __testing,
} from '@/lib/stripe-line-items';

describe('buildStripeLineItems', () => {
  it('puts the base service as the first line', () => {
    const items = buildStripeLineItems({
      serviceName: 'Cazier Judiciar',
      basePrice: 198,
      options: [],
      delivery: null,
    });
    expect(items).toHaveLength(1);
    expect(items[0].price_data.product_data.name).toBe('Cazier Judiciar');
    expect(items[0].price_data.unit_amount).toBe(19800);
    expect(items[0].price_data.currency).toBe('ron');
  });

  it('adds each option as its own line item with code metadata', () => {
    const items = buildStripeLineItems({
      serviceName: 'Cazier Judiciar',
      basePrice: 198,
      options: [
        { name: 'Procesare Urgentă', code: 'urgenta', total: 80 },
        { name: 'Traducere Autorizată', code: 'traducere', total: 178.5 },
      ],
      delivery: null,
    });
    expect(items).toHaveLength(3);
    expect(items[1].price_data.product_data.name).toBe('Procesare Urgentă');
    expect(items[1].price_data.unit_amount).toBe(8000);
    expect(items[1].price_data.product_data.metadata).toEqual({ code: 'urgenta' });
    expect(items[2].price_data.unit_amount).toBe(17850);
  });

  it('skips options with zero total to avoid noise', () => {
    const items = buildStripeLineItems({
      serviceName: 'Test',
      basePrice: 100,
      options: [
        { name: 'Free addon', total: 0 },
        { name: 'Paid addon', total: 50 },
      ],
      delivery: null,
    });
    expect(items.map((i) => i.price_data.product_data.name)).toEqual(['Test', 'Paid addon']);
  });

  it('appends a delivery line when delivery is paid', () => {
    const items = buildStripeLineItems({
      serviceName: 'Test',
      basePrice: 100,
      options: [],
      delivery: { label: 'Fan Courier - Standard', priceRon: 21.9 },
    });
    expect(items).toHaveLength(2);
    expect(items[1].price_data.product_data.name).toBe('Livrare: Fan Courier - Standard');
    expect(items[1].price_data.unit_amount).toBe(2190);
  });

  it('omits delivery line when free (email/PDF)', () => {
    const items = buildStripeLineItems({
      serviceName: 'Test',
      basePrice: 100,
      options: [],
      delivery: { label: 'Email (PDF)', priceRon: 0 },
    });
    expect(items).toHaveLength(1);
    expect(items[0].price_data.product_data.name).toBe('Test');
  });

  it('truncates very long names to 250 chars', () => {
    const longName = 'X'.repeat(300);
    const items = buildStripeLineItems({
      serviceName: longName,
      basePrice: 1,
      options: [],
      delivery: null,
    });
    expect(items[0].price_data.product_data.name.length).toBe(250);
  });

  it('rounds bani correctly for fractional RON amounts', () => {
    const items = buildStripeLineItems({
      serviceName: 'X',
      basePrice: 178.5,
      options: [{ name: 'Apostila', total: 83.3 }],
      delivery: null,
    });
    expect(items[0].price_data.unit_amount).toBe(17850);
    expect(items[1].price_data.unit_amount).toBe(8330);
  });

  it('caps line items at MAX_LINE_ITEMS to stay well under Stripe limits', () => {
    const manyOptions = Array.from({ length: 30 }, (_, i) => ({
      name: `Option ${i}`,
      total: 1,
    }));
    const items = buildStripeLineItems({
      serviceName: 'Base',
      basePrice: 10,
      options: manyOptions,
      delivery: null,
    });
    expect(items.length).toBeLessThanOrEqual(__testing.MAX_LINE_ITEMS);
  });
});

describe('buildPaymentIntentDescription', () => {
  it('joins service + options + delivery with pipes', () => {
    const desc = buildPaymentIntentDescription({
      serviceName: 'Cazier Judiciar',
      orderNumber: 'E-260527-ABC',
      options: [
        { name: 'Urgent', total: 80 },
        { name: 'Apostila', total: 198 },
      ],
      deliveryLabel: 'Fan',
      deliveryPriceRon: 21.9,
    });
    expect(desc).toContain('Cazier Judiciar (E-260527-ABC)');
    expect(desc).toContain('+ Urgent: 80.00 RON');
    expect(desc).toContain('+ Apostila: 198.00 RON');
    expect(desc).toContain('+ Livrare Fan: 21.90 RON');
  });

  it('includes coupon line when discount applied', () => {
    const desc = buildPaymentIntentDescription({
      serviceName: 'X',
      orderNumber: 'E-1',
      options: [],
      couponCode: 'RECUPEREAZA-93B0',
      discountAmount: 116.82,
    });
    expect(desc).toContain('Cupon RECUPEREAZA-93B0: −116.82 RON');
  });

  it('truncates to 999 chars (under Stripe 1000 cap)', () => {
    const desc = buildPaymentIntentDescription({
      serviceName: 'Long ' + 'X'.repeat(2000),
      orderNumber: 'X',
      options: [],
    });
    expect(desc.length).toBeLessThanOrEqual(999);
  });

  it('skips zero-amount options', () => {
    const desc = buildPaymentIntentDescription({
      serviceName: 'Test',
      orderNumber: 'E-1',
      options: [
        { name: 'Free', total: 0 },
        { name: 'Paid', total: 50 },
      ],
    });
    expect(desc).not.toContain('Free');
    expect(desc).toContain('Paid');
  });
});
