import { describe, it, expect } from 'vitest';
import {
  validatePhone,
  hasTypedPhone,
  PHONE_EMPTY_MESSAGE,
  PHONE_INVALID_MESSAGE,
} from '@/lib/format/validate-phone';

describe('validatePhone', () => {
  it('accepts a number the team can dial, however it was written', () => {
    for (const written of [
      '+40712345678',
      '+40 712 345 678',
      '0712345678',
      '0712 345 678',
      // The trunk zero typed after the dial code the field already shows.
      '+400712345678',
      '+39 06 1234567',
      '+44 7911 123456',
    ]) {
      expect(validatePhone(written), written).toBeNull();
    }
  });

  it('refuses a number with the wrong number of digits for its country', () => {
    // The loose account check used to let these through: digits, a leading 0
    // or +, 9 to 15 of them.
    expect(validatePhone('071234567')).toBe(PHONE_INVALID_MESSAGE);
    expect(validatePhone('07123456789')).toBe(PHONE_INVALID_MESSAGE);
    expect(validatePhone('0000000000')).toBe(PHONE_INVALID_MESSAGE);
    expect(validatePhone('+40 12')).toBe(PHONE_INVALID_MESSAGE);
  });

  it('treats a bare dial code as nothing typed', () => {
    // `react-international-phone` reports „+40" while the field is empty.
    expect(validatePhone('')).toBe(PHONE_EMPTY_MESSAGE);
    expect(validatePhone('+40')).toBe(PHONE_EMPTY_MESSAGE);
    expect(validatePhone('+1')).toBe(PHONE_EMPTY_MESSAGE);
  });
});

describe('hasTypedPhone', () => {
  it('is false until there is more than a dial code', () => {
    expect(hasTypedPhone('')).toBe(false);
    expect(hasTypedPhone('+40')).toBe(false);
    expect(hasTypedPhone('+40 7')).toBe(false);
    expect(hasTypedPhone('+40 71')).toBe(true);
    expect(hasTypedPhone('07')).toBe(false);
    expect(hasTypedPhone('0712')).toBe(true);
  });
});
