import { describe, it, expect } from 'vitest';
import {
  isoDate,
  isoFromRomanianDate,
  birthDateFromCnp,
} from '@/components/account/profile-steps/personal-fields';

/**
 * Both helpers exist because of the same class of bug, caught in the browser:
 * a date that is right in memory and wrong on screen.
 */
describe('isoDate', () => {
  it('keeps the day the customer was actually born', () => {
    // `validateCNP` returns a LOCAL midnight. `toISOString()` on that, from
    // Romania (+02/+03), lands on the previous day — which is how a CNP of
    // 920702 filled in „1 July 1992".
    //
    // The second assertion only shows the slip east of UTC; CI runs in UTC,
    // where `toISOString()` happens to agree with the wall clock. So it is
    // guarded rather than dropped: it documents the bug where it can be seen.
    const localMidnight = new Date(1992, 6, 2, 0, 0, 0);
    expect(isoDate(localMidnight)).toBe('1992-07-02');
    if (localMidnight.getTimezoneOffset() < 0) {
      expect(localMidnight.toISOString().slice(0, 10)).not.toBe('1992-07-02');
    }
  });

  it('pads single-digit months and days', () => {
    expect(isoDate(new Date(2003, 0, 5))).toBe('2003-01-05');
  });
});

describe('birthDateFromCnp', () => {
  it('reads the date out of a valid CNP', () => {
    // 1920702351236: male, born 02.07.1992.
    expect(birthDateFromCnp('1920702351236')).toBe('1992-07-02');
  });

  it('says nothing for a CNP that is not valid', () => {
    expect(birthDateFromCnp('1234567890123')).toBe('');
    expect(birthDateFromCnp('192070235123')).toBe('');
    expect(birthDateFromCnp('')).toBe('');
  });
});

describe('isoFromRomanianDate', () => {
  it('converts what the OCR returns into what a date input accepts', () => {
    // `<input type="date">` takes only YYYY-MM-DD and silently drops the rest,
    // so „02.07.1992" straight from the OCR left the field empty.
    expect(isoFromRomanianDate('02.07.1992')).toBe('1992-07-02');
    expect(isoFromRomanianDate('02/07/1992')).toBe('1992-07-02');
    expect(isoFromRomanianDate('02-07-1992')).toBe('1992-07-02');
    expect(isoFromRomanianDate(' 02.07.1992 ')).toBe('1992-07-02');
  });

  it('returns nothing rather than a wrong date', () => {
    expect(isoFromRomanianDate('1992-07-02')).toBe('');
    expect(isoFromRomanianDate('2 iulie 1992')).toBe('');
    expect(isoFromRomanianDate(null)).toBe('');
    expect(isoFromRomanianDate(undefined)).toBe('');
  });
});
