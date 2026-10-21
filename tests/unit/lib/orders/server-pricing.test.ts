import { describe, it, expect } from 'vitest';
import { computeServerPricing, type OptionRow, type PricingInput } from '@/lib/orders/server-pricing';

const traducere: OptionRow = { id: 'opt-trad', code: 'traducere', price: 129, max_quantity: null };
const legalizare: OptionRow = { id: 'opt-leg', code: 'legalizare', price: 99, max_quantity: null };
const haga: OptionRow = { id: 'opt-haga', code: 'apostila_haga', price: 150, max_quantity: null };
const extraCopy: OptionRow = { id: 'opt-copy', code: 'copie', price: 20, max_quantity: 3 };
const rows = [traducere, legalizare, haga, extraCopy];

function input(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    serviceBasePrice: 198,
    verificationConfig: {},
    customerData: {},
    selectedOptions: [],
    optionsById: new Map(rows.map((r) => [r.id, r])),
    ownOptionsByCode: new Map(rows.map((r) => [r.code as string, r])),
    translationPrices: new Map([['Germană', 178.5]]),
    translationApostilaExtras: new Map([['Germană', 40]]),
    deliveryMethod: { type: 'courier', provider: 'fancourier' },
    deliveryPrice: 25,
    coupon: null,
    orderUserId: null,
    now: new Date('2026-10-21T12:00:00Z'),
    ...overrides,
  };
}

describe('computeServerPricing', () => {
  it('reproduces E-261021-2446F (traducere Germană + legalizare + Fan 25)', () => {
    const r = computeServerPricing(
      input({
        selectedOptions: [
          { option_id: 'opt-trad', code: 'traducere', quantity: 1, price_modifier: 178.5, metadata: { language: 'Germană' } },
          { option_id: 'opt-leg', code: 'legalizare', quantity: 1, price_modifier: 99 },
        ],
      })
    );
    expect(r).toMatchObject({ basePrice: 198, optionsPrice: 277.5, deliveryPrice: 25, discountAmount: 0, totalPrice: 500.5 });
  });

  it('ignores prices written into the draft', () => {
    const r = computeServerPricing(
      input({
        selectedOptions: [{ option_id: 'opt-leg', code: 'legalizare', quantity: 1, price_modifier: 0 }],
        deliveryPrice: 1,
      })
    );
    expect(r.optionsPrice).toBe(99);
    expect(r.deliveryPrice).toBe(25);
    expect(r.discountAmount).toBe(0);
    expect(r.totalPrice).toBe(322);
  });

  it('prices an option by code when its id is missing', () => {
    const r = computeServerPricing(input({ selectedOptions: [{ code: 'legalizare', quantity: 1, price_modifier: 0 }] }));
    expect(r.optionsPrice).toBe(99);
  });

  it('adds the apostila supplement to the translation when Haga is selected', () => {
    const r = computeServerPricing(
      input({
        selectedOptions: [
          { option_id: 'opt-trad', code: 'traducere', quantity: 1, metadata: { language: 'Germană' } },
          { option_id: 'opt-haga', code: 'apostila_haga', quantity: 1 },
        ],
      })
    );
    expect(r.selectedOptions[0].price_modifier).toBe(218.5);
    expect(r.optionsPrice).toBe(368.5);
  });

  it('falls back to the option row for a language without a list price', () => {
    const r = computeServerPricing(
      input({ selectedOptions: [{ option_id: 'opt-trad', code: 'traducere', quantity: 1, metadata: { language: 'Klingon' } }] })
    );
    expect(r.optionsPrice).toBe(129);
  });

  it('caps quantity at max_quantity and floors it at 1', () => {
    const r = computeServerPricing(
      input({
        selectedOptions: [
          { option_id: 'opt-copy', code: 'copie', quantity: 50 },
          { option_id: 'opt-leg', code: 'legalizare', quantity: 0 },
        ],
      })
    );
    expect(r.selectedOptions.map((o) => o.quantity)).toEqual([3, 1]);
    expect(r.optionsPrice).toBe(60 + 99);
  });

  it('prices unknown options at zero', () => {
    const r = computeServerPricing(input({ selectedOptions: [{ option_id: 'nope', code: 'nope', quantity: 1, price_modifier: 500 }] }));
    expect(r.optionsPrice).toBe(0);
  });

  it('uses the foreign licence tariff and the constatator document type', () => {
    const foreign = computeServerPricing(
      input({
        verificationConfig: { vehicleVerification: { foreignLicense: { enabled: true, price: 350 } } },
        customerData: { vehicle: { licenseIssuedAbroad: true } },
      })
    );
    expect(foreign.basePrice).toBe(350);

    const constatator = computeServerPricing(
      input({
        serviceBasePrice: 119.99,
        verificationConfig: { constatator: { documentTypes: [{ value: 'istoric', price: 499.99 }] } },
        customerData: { constatator: { documentType: 'istoric' } },
        deliveryMethod: { type: 'email', provider: null },
        deliveryPrice: 0,
      })
    );
    expect(constatator.basePrice).toBe(499.99);
    expect(constatator.totalPrice).toBe(499.99);
  });

  it('computes the coupon discount from the coupon row', () => {
    const pct = computeServerPricing(input({ coupon: { discount_type: 'percentage', discount_value: 10 } }));
    expect(pct.discountAmount).toBe(22.3);
    expect(pct.totalPrice).toBe(200.7);
    const fixed = computeServerPricing(input({ coupon: { discount_type: 'fixed', discount_value: 10000 } }));
    expect(fixed.discountAmount).toBe(223);
    expect(fixed.totalPrice).toBe(0);
  });

  it('gives no discount for an expired, exhausted or foreign personal coupon', () => {
    const base = { discount_type: 'fixed', discount_value: 50 };
    expect(computeServerPricing(input({ coupon: { ...base, valid_until: '2026-10-01T00:00:00Z' } })).discountAmount).toBe(0);
    expect(computeServerPricing(input({ coupon: { ...base, max_uses: 5, times_used: 5 } })).discountAmount).toBe(0);
    expect(computeServerPricing(input({ coupon: { ...base, owner_user_id: 'u1' }, orderUserId: 'u2' })).discountAmount).toBe(0);
    expect(computeServerPricing(input({ coupon: { ...base, min_amount: 1000 } })).discountAmount).toBe(0);
  });
});
