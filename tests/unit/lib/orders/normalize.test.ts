import { describe, expect, it } from 'vitest';
import {
  normalizeOrderOption,
  normalizeOrderOptions,
} from '@/lib/orders/normalize';

describe('normalizeOrderOption', () => {
  it('parses the wizard-runtime camelCase shape', () => {
    const o = normalizeOrderOption({
      optionId: 'opt-1',
      optionName: 'Apostilă Haga',
      priceModifier: 238,
      quantity: 1,
      code: 'apostila_haga',
    });
    expect(o.name).toBe('Apostilă Haga');
    expect(o.unitPrice).toBe(238);
    expect(o.total).toBe(238);
    expect(o.code).toBe('apostila_haga');
    expect(o.quantity).toBe(1);
  });

  it('parses the persisted snake_case shape (DB)', () => {
    const o = normalizeOrderOption({
      option_id: 'opt-2',
      option_name: 'Traducere',
      price_modifier: 178.5,
      quantity: 1,
      code: 'traducere',
    });
    expect(o.name).toBe('Traducere');
    expect(o.unitPrice).toBe(178.5);
    expect(o.total).toBe(178.5);
  });

  it('parses the legacy admin shape (name + price)', () => {
    const o = normalizeOrderOption({
      name: 'Procesare urgentă',
      price: 100,
    });
    expect(o.name).toBe('Procesare urgentă');
    expect(o.unitPrice).toBe(100);
    expect(o.total).toBe(100);
    expect(o.quantity).toBe(1);
  });

  it('multiplies unitPrice by quantity', () => {
    const o = normalizeOrderOption({
      option_name: 'Copie suplimentară',
      price_modifier: 25,
      quantity: 3,
    });
    expect(o.total).toBe(75);
    expect(o.quantity).toBe(3);
  });

  it('appends metadata (language + country) to the display name', () => {
    const o = normalizeOrderOption({
      optionName: 'Apostilă Haga',
      priceModifier: 238,
      quantity: 1,
      metadata: { country: 'Germania' },
    });
    expect(o.name).toBe('Apostilă Haga — Germania');
  });

  it('joins both language and country with bullet', () => {
    const o = normalizeOrderOption({
      optionName: 'Traducere',
      priceModifier: 178.5,
      quantity: 1,
      metadata: { language: 'Engleză', country: 'SUA' },
    });
    expect(o.name).toBe('Traducere — Engleză · SUA');
  });

  it('reads numeric strings (DB returns DECIMAL as string sometimes)', () => {
    const o = normalizeOrderOption({
      option_name: 'Apostilă',
      price_modifier: '238.00',
      quantity: '1',
    });
    expect(o.unitPrice).toBe(238);
    expect(o.quantity).toBe(1);
  });

  it('preserves bundledFor parent reference', () => {
    const o = normalizeOrderOption({
      option_name: 'Apostila bundled',
      price_modifier: 238,
      bundled_for: { parent_option_id: 'parent-xyz' },
    });
    expect(o.bundledForParentId).toBe('parent-xyz');
  });

  it('preserves isAutoApplied flag (cetatean_strain)', () => {
    const o = normalizeOrderOption({
      option_name: 'Cetățean Străin',
      price_modifier: 100,
      is_auto_applied: true,
    });
    expect(o.isAutoApplied).toBe(true);
  });
});

describe('normalizeOrderOptions', () => {
  it('filters out zero-price options by default', () => {
    const list = normalizeOrderOptions([
      { option_name: 'Real', price_modifier: 100, quantity: 1 },
      { option_name: 'Zero', price_modifier: 0, quantity: 1 },
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Real');
  });

  it('keeps zero-price when includeZero=true', () => {
    const list = normalizeOrderOptions(
      [
        { option_name: 'Real', price_modifier: 100, quantity: 1 },
        { option_name: 'Email', price_modifier: 0, quantity: 1 },
      ],
      { includeZero: true }
    );
    expect(list).toHaveLength(2);
  });

  it('handles null / undefined input gracefully', () => {
    expect(normalizeOrderOptions(null)).toEqual([]);
    expect(normalizeOrderOptions(undefined)).toEqual([]);
  });

  it('handles a mixed snake_case + camelCase array (real-world drift)', () => {
    const list = normalizeOrderOptions([
      { option_name: 'A', price_modifier: 50, quantity: 1, code: 'a' },
      { optionName: 'B', priceModifier: 75, quantity: 1, code: 'b' },
    ]);
    expect(list.map((o) => o.name)).toEqual(['A', 'B']);
    expect(list.map((o) => o.total)).toEqual([50, 75]);
  });
});
