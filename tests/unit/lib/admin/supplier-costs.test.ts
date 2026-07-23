import { describe, expect, it } from 'vitest';
import {
  validateSupplierCost,
  totalSupplierCost,
  serviceRevenueForMargin,
  computeMargin,
} from '@/lib/admin/supplier-costs';

describe('validateSupplierCost', () => {
  const ok = { supplier: 'Traducător X', category: 'traducere', amountRon: 45 };
  it('accepts a valid cost', () => {
    expect(validateSupplierCost(ok)).toBe(null);
  });
  it('rejects missing supplier', () => {
    expect(validateSupplierCost({ ...ok, supplier: '' })).toContain('Furnizorul');
  });
  it('rejects invalid category', () => {
    expect(validateSupplierCost({ ...ok, category: 'xyz' })).toContain('Categoria');
  });
  it('rejects negative / absurd amount', () => {
    expect(validateSupplierCost({ ...ok, amountRon: -5 })).toContain('Suma');
    expect(validateSupplierCost({ ...ok, amountRon: 999999 })).toContain('Suma');
  });
});

describe('totalSupplierCost', () => {
  it('sums amounts', () => {
    expect(totalSupplierCost([{ amount_ron: 45 }, { amount_ron: 60.5 }])).toBe(105.5);
  });
  it('empty = 0', () => {
    expect(totalSupplierCost([])).toBe(0);
  });
});

describe('serviceRevenueForMargin', () => {
  it('sums only value-added option codes + additional paid', () => {
    const opts = [
      { code: 'traducere', priceModifier: 178.5, quantity: 1 },
      { code: 'legalizare', priceModifier: 99, quantity: 1 },
      { code: 'copii_suplimentare', priceModifier: 50, quantity: 2 }, // ignored
      { code: 'urgenta', priceModifier: 80, quantity: 1 }, // ignored
    ];
    expect(serviceRevenueForMargin(opts, 0)).toBe(277.5);
  });
  it('includes additional paid (extra flow)', () => {
    expect(serviceRevenueForMargin([], 824.5)).toBe(824.5);
  });
  it('counts custom_extra + apostille', () => {
    const opts = [
      { code: 'apostila_haga', priceModifier: 150, quantity: 1 },
      { code: 'custom_extra', priceModifier: 200, quantity: 1 },
    ];
    expect(serviceRevenueForMargin(opts, 0)).toBe(350);
  });
});

describe('computeMargin', () => {
  it('revenue − cost, with pct', () => {
    const m = computeMargin(277.5, 105.5);
    expect(m.margin).toBe(172);
    expect(m.marginPct).toBeCloseTo(62, 0);
  });
  it('negative margin flagged', () => {
    expect(computeMargin(100, 150).margin).toBe(-50);
  });
  it('zero revenue → null pct', () => {
    expect(computeMargin(0, 45).marginPct).toBe(null);
  });
});
