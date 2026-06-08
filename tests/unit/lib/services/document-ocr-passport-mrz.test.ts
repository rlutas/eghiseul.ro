/**
 * Tests for parsePassportMrz — deterministic CNP recovery from a passport's
 * TD3 (2-line) Machine Readable Zone.
 *
 * Background: a real Romanian passport (MORARAS IULIA, order smoke-test) was
 * scanned upside-down. Gemini extracted name/DOB/passport number but returned
 * `cnp: null`, even though Romanian passports carry the CNP both in field
 * "5. Cod Numeric Personal" AND in the MRZ personal-number field. The customer
 * was then blocked at Step 2 (CNP required for Romanian citizens) with no way
 * to proceed and no message.
 *
 * Fix: when Gemini misses the CNP on a Romanian passport, recover it
 * deterministically from the MRZ. Gemini reads raw MRZ text accurately even
 * when it fails strict position parsing — so we scan the MRZ for the unique
 * 13-digit run that passes full CNP validation (checksum + date + county).
 * No other MRZ field (passport number = 9 digits, dates = 6 digits) can
 * masquerade as a valid CNP.
 */

import { describe, it, expect } from 'vitest';
import { parsePassportMrz } from '@/lib/services/document-ocr';

describe('parsePassportMrz — TD3 2-line passport MRZ', () => {
  // Real passport from the smoke-test (MORARAS IULIA, RO passport 058816373,
  // born 07 MAR 1982, female, Constanța → CNP 2820307134160).
  // Line 2 personal-number field (chars 29-42) carries the CNP.
  const LINE1 = 'P<ROUMORARAS<<IULIA<<<<<<<<<<<<<<<<<<<<<<<<<<';
  const LINE2 = '0588163730ROU8203070F30070222820307134160<08';

  it('recovers the CNP from the MRZ personal-number field', () => {
    const out = parsePassportMrz({ line1: LINE1, line2: LINE2 });
    expect(out.cnp).toBe('2820307134160');
  });

  it('parses structured fields from line 2', () => {
    const out = parsePassportMrz({ line1: LINE1, line2: LINE2 });
    expect(out.passportNumber).toBe('058816373');
    expect(out.nationality).toBe('ROU');
    expect(out.birthDate).toBe('820307');
    expect(out.sex).toBe('F');
    expect(out.expiryDate).toBe('300702');
  });

  it('accepts an array form for the MRZ lines', () => {
    const out = parsePassportMrz([LINE1, LINE2]);
    expect(out.cnp).toBe('2820307134160');
  });

  it('finds the CNP even when expiry digits run straight into the CNP (no separator)', () => {
    // The substring "30070222820307134160" is 20 continuous digits; the only
    // 13-digit window that validates as a CNP is the true CNP at offset 7.
    const out = parsePassportMrz({ line2: LINE2 });
    expect(out.cnp).toBe('2820307134160');
  });

  it('returns no CNP for a foreign passport (no valid 13-digit CNP present)', () => {
    // German passport — nationality D, no Romanian CNP anywhere in the MRZ.
    const out = parsePassportMrz({
      line1: 'P<D<<MUSTERMANN<<ERIKA<<<<<<<<<<<<<<<<<<<<<<<',
      line2: 'C01X00T478D<<6408125F2702283<<<<<<<<<<<<<<<4',
    });
    expect(out.cnp).toBeUndefined();
    expect(out.nationality).toBe('D');
  });

  it('returns empty object for missing / empty input', () => {
    expect(parsePassportMrz(undefined)).toEqual({});
    expect(parsePassportMrz({})).toEqual({});
    expect(parsePassportMrz(['', ''])).toEqual({});
  });

  it('recovers the CNP from line 1 if Gemini swapped the lines', () => {
    // Defensive: if the CNP-bearing line lands in line1, still find it.
    const out = parsePassportMrz({ line1: LINE2, line2: LINE1 });
    expect(out.cnp).toBe('2820307134160');
  });

  it('does NOT misfire on a TD1 eCI line (no spurious CNP from blind scan)', () => {
    // Regression guard: a TD1 eCI line-1 contains the run
    // "113912841710211434518". A blind 13-digit scan would return the
    // spurious "4171021143451" (nonsense "born 1817" code that nonetheless
    // passes the CNP checksum) BEFORE the real "1710211434518". The
    // position-based TD3 parser simply doesn't match a TD1 line, so it returns
    // no CNP here — the eCI parser handles that format instead.
    const out = parsePassportMrz(['IDROUMB113912841710211434518<<<<']);
    expect(out.cnp).toBeUndefined();
  });
});
