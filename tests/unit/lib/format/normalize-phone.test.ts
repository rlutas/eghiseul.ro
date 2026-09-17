import { describe, it, expect } from 'vitest';
import { normalizePhone } from '@/lib/format/normalize-phone';

describe('normalizePhone', () => {
  it('stores one shape, whatever the customer typed', () => {
    // The account's profile field is free text; the order form produces E.164.
    // Both write the same column, which the wizard reads back to prefill.
    for (const written of [
      '0712345678',
      '0712 345 678',
      '0712.345.678',
      '+40712345678',
      '+40 712 345 678',
      '+40-712-345-678',
      ' 0712345678 ',
    ]) {
      expect(normalizePhone(written), written).toBe('+40712345678');
    }
  });

  it('drops the trunk zero typed after the dial code', () => {
    expect(normalizePhone('+400712345678')).toBe('+40712345678');
  });

  it('keeps a foreign number in its own country format', () => {
    expect(normalizePhone('+39 06 1234567')).toBe('+39061234567');
    expect(normalizePhone('+44 7911 123456')).toBe('+447911123456');
  });

  it('keeps what it cannot parse instead of throwing it away', () => {
    // A phone we cannot read is still one the team can call.
    expect(normalizePhone('interior 214')).toBe('interior 214');
    expect(normalizePhone('0712')).toBe('0712');
  });

  it('handles nothing at all', () => {
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone('   ')).toBe('');
    expect(normalizePhone(null)).toBe('');
    expect(normalizePhone(undefined)).toBe('');
    expect(normalizePhone(42)).toBe('');
  });
});
