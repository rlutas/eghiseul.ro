import { describe, expect, it } from 'vitest';
import {
  computeModifyDiff,
  computeAddedTermShiftDays,
  describeChanges,
  type OrderForDiff,
  type OrderOptionForDiff,
} from '@/lib/orders/modify-diff';

// The Modify dialog moves real money — the diff math is the single source
// of truth for both the preview banner the admin sees and the Stripe refund
// / extra-payment amounts. A bug here means we refund the wrong amount.

const baseOrder: OrderForDiff = {
  base_price: 198,
  delivery_price: 21.9,
  total_price: 218,            // 198 + 21.9 (rounded) — synthetic for tests
  refunded_amount: 0,
  additional_paid_amount: 0,
  selected_options: [],
};

const URGENTA: OrderOptionForDiff = { code: 'urgenta', priceModifier: 80, quantity: 1 };
const APOSTILA: OrderOptionForDiff = { code: 'apostila_haga', priceModifier: 198, quantity: 1 };
const TRADUCERE: OrderOptionForDiff = { code: 'traducere', priceModifier: 178.5, quantity: 1 };

describe('computeModifyDiff — no money moves', () => {
  it('returns action="none" when new shape matches current', () => {
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 198 + 80 + 21.9, // 299.90
      selected_options: [URGENTA],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [URGENTA],
      deliveryPrice: 21.9,
    });
    expect(result.action).toBe('none');
    expect(result.diff).toBe(0);
    expect(result.newTotal).toBe(299.9);
  });
});

describe('computeModifyDiff — refund path (diff < 0)', () => {
  it('signals refund when admin removes urgenta from a paid order', () => {
    // Original: 198 + 80 (urgenta) + 21.9 = 299.9 RON paid.
    // New: just base + delivery = 219.9 RON.
    // Diff: 219.9 − 299.9 = −80 → refund 80 RON.
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 299.9,
      selected_options: [URGENTA],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [], // strip all add-ons
      deliveryPrice: 21.9,
    });
    expect(result.action).toBe('refund');
    expect(result.diff).toBe(-80);
    expect(result.newTotal).toBe(219.9);
    expect(result.currentNetPaid).toBe(299.9);
  });

  it('signals refund when admin swaps DHL (250) → Poșta (100)', () => {
    // Customer paid 198 + 250 (DHL) = 448 RON.
    // New: 198 + 100 (Poșta) = 298 RON.
    // Diff: −150 → refund.
    const order: OrderForDiff = {
      ...baseOrder,
      delivery_price: 250,
      total_price: 198 + 250,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [],
      deliveryPrice: 100,
    });
    expect(result.action).toBe('refund');
    expect(result.diff).toBe(-150);
  });

  it('subtracts already-refunded amount from currentNetPaid', () => {
    // Original 299.9 paid, 80 already refunded (previous Modify cycle).
    // currentNetPaid = 219.9. New total 219.9 too → no money moves.
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 299.9,
      refunded_amount: 80,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [],
      deliveryPrice: 21.9,
    });
    expect(result.currentNetPaid).toBe(219.9);
    expect(result.action).toBe('none');
  });
});

describe('computeModifyDiff — extra_payment path (diff > 0)', () => {
  it('signals extra_payment when admin adds apostila to a plain order', () => {
    // Customer paid 198 + 21.9 = 219.9. New: + 198 (apostila) = 417.9.
    // Diff: +198 → extra_payment 198 RON.
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 219.9,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [APOSTILA],
      deliveryPrice: 21.9,
    });
    expect(result.action).toBe('extra_payment');
    expect(result.diff).toBe(198);
    expect(result.newTotal).toBe(417.9);
  });

  it('rolls in delivery upgrade + new addon', () => {
    // Original: 198 + 21.9 = 219.9. New: + traducere (178.5) + DHL (250 instead 21.9) = 626.5
    // Diff: +406.6
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 219.9,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [TRADUCERE],
      deliveryPrice: 250,
    });
    expect(result.action).toBe('extra_payment');
    expect(result.diff).toBe(406.6);
  });

  it('credits additional_paid_amount into currentNetPaid', () => {
    // Customer paid 219.9 initial, then 100 extra (from a previous Modify).
    // currentNetPaid = 319.9. New total 219.9 → refund of 100.
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 219.9,
      additional_paid_amount: 100,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [],
      deliveryPrice: 21.9,
    });
    expect(result.currentNetPaid).toBe(319.9);
    expect(result.action).toBe('refund');
    expect(result.diff).toBe(-100);
  });
});

describe('computeModifyDiff — customExtra (free-form service)', () => {
  it('adds the custom price to the new total → extra_payment', () => {
    // Customer paid 198 + 21.9 = 219.9. Admin adds a custom "traducere
    // legalizată maghiară" at 150 RON → new total 369.9, diff +150.
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 219.9,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [],
      deliveryPrice: 21.9,
      customExtra: { name: 'traducere legalizată maghiară', price: 150 },
    });
    expect(result.action).toBe('extra_payment');
    expect(result.diff).toBe(150);
    expect(result.newTotal).toBe(369.9);
  });

  it('stacks customExtra with catalog addons and delivery change', () => {
    // 198 + apostila 198 + custom 99.5 + delivery 100 = 595.5; paid 219.9 → +375.6
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 219.9,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [APOSTILA],
      deliveryPrice: 100,
      customExtra: { name: 'serviciu special', price: 99.5 },
    });
    expect(result.newTotal).toBe(595.5);
    expect(result.diff).toBe(375.6);
    expect(result.action).toBe('extra_payment');
  });

  it('is a no-op when customExtra is absent (undefined)', () => {
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 299.9,
      selected_options: [URGENTA],
    };
    const withOut = computeModifyDiff(order, {
      selectedOptions: [URGENTA],
      deliveryPrice: 21.9,
    });
    const withUndefined = computeModifyDiff(order, {
      selectedOptions: [URGENTA],
      deliveryPrice: 21.9,
      customExtra: undefined,
    });
    expect(withUndefined).toEqual(withOut);
    expect(withUndefined.action).toBe('none');
  });
});

describe('computeModifyDiff — defensive', () => {
  it('caps currentNetPaid at 0 when refunded > paid (data corruption)', () => {
    // Defensive guard: bad data shouldn't make diff math negative.
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 100,
      refunded_amount: 250, // weird, but don't crash
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      selectedOptions: [],
      deliveryPrice: 21.9,
    });
    expect(result.currentNetPaid).toBe(0);
    expect(result.action).toBe('extra_payment');
    expect(result.diff).toBe(219.9);
  });

  it('handles snake_case price_modifier on options', () => {
    const order: OrderForDiff = {
      ...baseOrder,
      total_price: 219.9,
      selected_options: [],
    };
    const result = computeModifyDiff(order, {
      // raw shape from DB JSONB — snake_case
      selectedOptions: [{ code: 'urgenta', price_modifier: 80, quantity: 1 }],
      deliveryPrice: 21.9,
    });
    expect(result.newTotal).toBe(299.9);
    expect(result.action).toBe('extra_payment');
    expect(result.diff).toBe(80);
  });
});

describe('describeChanges — humanization', () => {
  it('lists added options with friendly labels', () => {
    expect(
      describeChanges({
        oldOptions: [],
        newOptions: [URGENTA, APOSTILA],
        oldDeliveryPrice: 21.9,
        newDeliveryPrice: 21.9,
      })
    ).toBe('adăugat: urgență, apostilă Haga');
  });

  it('lists removed options', () => {
    expect(
      describeChanges({
        oldOptions: [URGENTA, APOSTILA],
        newOptions: [URGENTA],
        oldDeliveryPrice: 21.9,
        newDeliveryPrice: 21.9,
      })
    ).toBe('scos: apostilă Haga');
  });

  it('combines add + remove + delivery change', () => {
    const text = describeChanges({
      oldOptions: [URGENTA],
      newOptions: [APOSTILA],
      oldDeliveryPrice: 21.9,
      newDeliveryPrice: 100,
    });
    expect(text).toContain('adăugat: apostilă Haga');
    expect(text).toContain('scos: urgență');
    expect(text).toContain('livrare 21.90 → 100.00 RON');
  });

  it('falls back when nothing changed', () => {
    expect(
      describeChanges({
        oldOptions: [URGENTA],
        newOptions: [URGENTA],
        oldDeliveryPrice: 21.9,
        newDeliveryPrice: 21.9,
      })
    ).toBe('modificare comandă');
  });

  it('uses raw code when no friendly label is registered', () => {
    expect(
      describeChanges({
        oldOptions: [],
        newOptions: [{ code: 'mystery_addon', priceModifier: 10, quantity: 1 }],
        oldDeliveryPrice: 0,
        newDeliveryPrice: 0,
      })
    ).toBe('adăugat: mystery_addon');
  });

  it('mentions the custom extra service with name + price', () => {
    const text = describeChanges({
      oldOptions: [],
      newOptions: [],
      oldDeliveryPrice: 21.9,
      newDeliveryPrice: 21.9,
      customExtra: { name: 'traducere legalizată maghiară', price: 150 },
    });
    expect(text).toBe('serviciu extra: traducere legalizată maghiară (+150.00 RON)');
  });

  it('combines custom extra with added options', () => {
    const text = describeChanges({
      oldOptions: [],
      newOptions: [URGENTA],
      oldDeliveryPrice: 21.9,
      newDeliveryPrice: 21.9,
      customExtra: { name: 'serviciu special', price: 99.5 },
    });
    expect(text).toContain('adăugat: urgență');
    expect(text).toContain('serviciu extra: serviciu special (+99.50 RON)');
  });

  it('truncates ridiculously long change lists to ~200 chars', () => {
    const many: OrderOptionForDiff[] = Array.from({ length: 40 }, (_, i) => ({
      code: `addon_${i}_${'x'.repeat(20)}`,
      priceModifier: 1,
      quantity: 1,
    }));
    const text = describeChanges({
      oldOptions: [],
      newOptions: many,
      oldDeliveryPrice: 0,
      newDeliveryPrice: 0,
    });
    expect(text.length).toBeLessThanOrEqual(200);
    expect(text.endsWith('...')).toBe(true);
  });

  it('includes language/country details on added options (team must know WHICH translation)', () => {
    const text = describeChanges({
      oldOptions: [],
      newOptions: [
        { code: 'traducere', priceModifier: 178.5, quantity: 1, metadata: { language: 'Germană' } },
        { code: 'apostila_haga', priceModifier: 150, quantity: 1, metadata: { country: 'Italia' } },
      ],
      oldDeliveryPrice: 0,
      newDeliveryPrice: 0,
    });
    expect(text).toContain('traducere (Germană)');
    expect(text).toContain('apostilă Haga (Italia)');
  });
});

describe('computeAddedTermShiftDays', () => {
  const TRAD: OrderOptionForDiff = { code: 'traducere', priceModifier: 178.5, quantity: 1 };
  const LEG: OrderOptionForDiff = { code: 'legalizare', priceModifier: 100, quantity: 1 };
  const HAGA: OrderOptionForDiff = { code: 'apostila_haga', priceModifier: 150, quantity: 1 };

  it('added traducere extends the term by 2 business days', () => {
    expect(computeAddedTermShiftDays([], [TRAD])).toBe(2);
  });

  it('sums the impact of multiple added codes (traducere + legalizare + haga = 4)', () => {
    expect(computeAddedTermShiftDays([], [TRAD, LEG, HAGA])).toBe(4);
  });

  it('options already on the order add nothing', () => {
    expect(computeAddedTermShiftDays([TRAD], [TRAD, LEG])).toBe(1);
  });

  it('removals never shorten (returns 0, not negative)', () => {
    expect(computeAddedTermShiftDays([TRAD, LEG], [])).toBe(0);
  });

  it('non-time-impacting codes (urgenta, copii, custom) add nothing', () => {
    expect(
      computeAddedTermShiftDays([], [
        { code: 'urgenta', priceModifier: 80, quantity: 1 },
        { code: 'copii_suplimentare', priceModifier: 50, quantity: 2 },
        { code: 'custom_extra', priceModifier: 99, quantity: 1 },
      ])
    ).toBe(0);
  });
});
