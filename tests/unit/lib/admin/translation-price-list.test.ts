import { describe, expect, it } from 'vitest';
import { validateTranslationPriceList } from '@/lib/admin/translation-price-list';
import { DEFAULT_TRANSLATION_PRICE_LIST } from '@/config/translation-languages';

// Guards for the admin-editable translation price list (settings → Traduceri):
// a malformed save would poison the public wizard language dropdown.

const VALID_ROW = {
  language: 'Arabă',
  group: 'IV',
  active: true,
  ourCostDoc: 80,
  ourCostPage: 75,
  clientPriceDoc: 249,
  notes: '',
};

describe('validateTranslationPriceList', () => {
  it('accepts the seeded defaults', () => {
    expect(validateTranslationPriceList(DEFAULT_TRANSLATION_PRICE_LIST)).toBe(null);
  });

  it('accepts a valid row with null costs (not yet negotiated)', () => {
    expect(
      validateTranslationPriceList([{ ...VALID_ROW, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null }])
    ).toBe(null);
  });

  it('rejects non-array payloads', () => {
    expect(validateTranslationPriceList({})).toContain('array');
    expect(validateTranslationPriceList('x')).toContain('array');
  });

  it('rejects a row without language', () => {
    expect(validateTranslationPriceList([{ ...VALID_ROW, language: '' }])).toContain('limba');
  });

  it('rejects duplicate languages (case-insensitive)', () => {
    expect(
      validateTranslationPriceList([VALID_ROW, { ...VALID_ROW, language: 'arabă' }])
    ).toContain('de două ori');
  });

  it('rejects an invalid group', () => {
    expect(validateTranslationPriceList([{ ...VALID_ROW, group: 'VII' }])).toContain('I-VI');
  });

  it('rejects non-boolean active', () => {
    expect(validateTranslationPriceList([{ ...VALID_ROW, active: 'da' }])).toContain('activ');
  });

  it('rejects negative or absurd prices', () => {
    expect(validateTranslationPriceList([{ ...VALID_ROW, ourCostDoc: -5 }])).toContain('ourCostDoc');
    expect(validateTranslationPriceList([{ ...VALID_ROW, clientPriceDoc: 99999 }])).toContain('clientPriceDoc');
  });
});
