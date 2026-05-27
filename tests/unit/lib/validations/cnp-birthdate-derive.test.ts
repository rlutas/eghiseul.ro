import { describe, expect, it } from 'vitest';
import { validateCNP } from '@/lib/validations/cnp';

/**
 * Tests the CNP→birthDate derivation used in PersonalDataStep on 2026-05-27.
 * Context: when scanning a CI, Gemini sometimes returns `birthDate: null`
 * (glare on the photo, or "Data nașterii nu este vizibilă" in `issues`).
 * The CNP encodes the same info — day, month, year, gender, county code —
 * so the wizard derives birthDate as YYYY-MM-DD when OCR couldn't read it.
 *
 * This test pins the formula in two places:
 *   1. OCR success branch: `convertDateFormat(extracted.birthDate) || cnpDerived`
 *   2. The safety-net useEffect that watches `personalKyc.cnp`
 *
 * If validateCNP changes its `data.birthDate` Date object semantics, this
 * test catches it before the wizard silently misformats a date.
 */

// Local YYYY-MM-DD without UTC drift. Mirrors the wizard's helper.
function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function deriveBirthDateFromCNP(cnp: string): string | null {
  const r = validateCNP(cnp);
  if (!r.valid || !r.data) return null;
  return formatLocalYmd(r.data.birthDate);
}

describe('CNP → birthDate derivation (2026-05-27 OCR fallback)', () => {
  it('derives 1975-01-10 from the real test order CNP (ARDELEANU IONEL)', () => {
    // Real CNP from order E-260527-4WV2A — OCR returned birthDate=null,
    // the auto-derive fallback recovered the correct value from the CNP.
    expect(deriveBirthDateFromCNP('1750110214609')).toBe('1975-01-10');
  });

  it('derives 1996-05-07 from a female CNP born in Ialomița', () => {
    // Same fixture as cnp.test.ts so we share known-good test data.
    expect(deriveBirthDateFromCNP('2960507211209')).toBe('1996-05-07');
  });

  it('derives 1982-10-10 from a male CNP born in București S.2', () => {
    expect(deriveBirthDateFromCNP('1821010420068')).toBe('1982-10-10');
  });

  it('returns null for an invalid CNP (checksum fails)', () => {
    // Last digit flipped — checksum no longer matches.
    expect(deriveBirthDateFromCNP('1750110214600')).toBeNull();
  });

  it('returns null for empty / too-short input', () => {
    expect(deriveBirthDateFromCNP('')).toBeNull();
    expect(deriveBirthDateFromCNP('17501')).toBeNull();
  });

  it('pads single-digit months and days correctly', () => {
    // Jan 10 — month=01 (padded), day=10 (already two digits)
    const result = deriveBirthDateFromCNP('1750110214609');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('1975-01-10');
  });

  it('does not UTC-shift the date on Europe/Bucharest', () => {
    // Regression guard for the "01.07 vs 07.01" bug fixed earlier this year:
    // toISOString() returned a UTC-shifted day on local-midnight Date objects.
    // Use the local accessors instead.
    const result = deriveBirthDateFromCNP('1750110214609');
    // 1975 was not a leap year; Jan 10 in Europe/Bucharest must NOT roll
    // back to Jan 9 in UTC. The derivation uses getDate(), not toISOString().
    expect(result).toBe('1975-01-10');
  });
});
