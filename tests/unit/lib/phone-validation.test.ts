import { describe, it, expect } from 'vitest';
import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Documentează validarea numărului de telefon din wizard (contact-step).
 * Folosim `isValidPhoneNumber` (libphonenumber-js) pe E.164 (+CC...) — respinge
 * un număr cu o cifră în plus/minus pentru țara aleasă. react-international-phone
 * întoarce mereu format E.164 (`+40712345678`).
 */
describe('phone validation (libphonenumber-js, E.164)', () => {
  it('acceptă mobil RO corect (+40 7XX XXX XXX = 9 cifre după 40)', () => {
    expect(isValidPhoneNumber('+40712345678')).toBe(true);
    expect(isValidPhoneNumber('+40755123456')).toBe(true);
  });

  it('respinge mobil RO cu o cifră în MINUS', () => {
    expect(isValidPhoneNumber('+4071234567')).toBe(false);
  });

  it('respinge mobil RO cu o cifră în PLUS', () => {
    expect(isValidPhoneNumber('+407123456789')).toBe(false);
  });

  it('acceptă fix RO (București +4021...)', () => {
    expect(isValidPhoneNumber('+40213145900')).toBe(true);
  });

  it('validează corect și alte țări (lungime per-țară)', () => {
    expect(isValidPhoneNumber('+393331234567')).toBe(true); // Italia mobil
    expect(isValidPhoneNumber('+4915123456789')).toBe(true); // Germania mobil
    expect(isValidPhoneNumber('+44')).toBe(false); // doar prefix
    expect(isValidPhoneNumber('+40')).toBe(false); // doar prefix RO
  });

  it('respinge gunoi / prea scurt', () => {
    expect(isValidPhoneNumber('+401')).toBe(false);
    expect(isValidPhoneNumber('123')).toBe(false);
  });
});
