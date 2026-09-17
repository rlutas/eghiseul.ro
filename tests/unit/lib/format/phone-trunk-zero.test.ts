import { describe, it, expect } from 'vitest';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { stripTrunkZero } from '@/lib/format/phone-trunk-zero';

describe('stripTrunkZero', () => {
  it('fixes the number a Romanian actually types into a field showing +40', () => {
    // Verified in the browser on production (17.09.2026): the field keeps
    // „+40 " and the customer types 0712345678, so the stored value becomes
    // +400712345678 — one digit too many.
    expect(stripTrunkZero('+400712345678')).toBe('+40712345678');
    expect(isValidPhoneNumber(stripTrunkZero('+400712345678'))).toBe(true);
  });

  it('matters even though the validator lets the extra zero through', () => {
    // libphonenumber is lenient here: it recognises the 0 as Romania's national
    // trunk prefix and calls +400712345678 valid. So the order is NOT blocked —
    // the damage is downstream: that string is what we store, put on the AWB and
    // hand to Oblio, and a carrier dialling it as written reaches nobody.
    expect(isValidPhoneNumber('+400712345678')).toBe(true);
    expect(stripTrunkZero('+400712345678')).toBe('+40712345678');
  });

  it('leaves a correct number alone', () => {
    expect(stripTrunkZero('+40712345678')).toBe('+40712345678');
    expect(stripTrunkZero('+40 712 345 678')).toBe('+40 712 345 678');
  });

  it('does NOT touch Italy — Italian landlines keep their leading zero', () => {
    // +39 06 … is Rome. Stripping the zero would turn a valid number invalid,
    // and Italy is one of the preferred countries in this field.
    expect(stripTrunkZero('+39061234567')).toBe('+39061234567');
    expect(isValidPhoneNumber('+39061234567')).toBe(true);
  });

  it('handles the other preferred countries whose trunk prefix is 0', () => {
    expect(stripTrunkZero('+340612345678')).toBe('+34612345678');
    expect(stripTrunkZero('+4901701234567')).toBe('+491701234567');
    expect(stripTrunkZero('+4407911123456')).toBe('+447911123456');
  });

  it('leaves a half-typed number alone', () => {
    expect(stripTrunkZero('+40')).toBe('+40');
    expect(stripTrunkZero('+400')).toBe('+400');
    expect(stripTrunkZero('')).toBe('');
  });

  it('ignores countries it does not know about', () => {
    expect(stripTrunkZero('+10123456789')).toBe('+10123456789');
  });

  it('ignores a value that is not E.164 yet', () => {
    expect(stripTrunkZero('0712345678')).toBe('0712345678');
  });
});
