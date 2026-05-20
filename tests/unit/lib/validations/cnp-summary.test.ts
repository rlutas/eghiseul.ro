import { describe, expect, it } from 'vitest';
import { summarizeCNP } from '@/lib/validations/cnp';

// Same fixtures as cnp.test.ts
const VALID_FEMALE_1996 = '2960507211209'; // 1996-05-07, Ialomița (21)
const VALID_MALE_1982 = '1821010420068';   // 1982-10-10, București S2 (42)

describe('summarizeCNP', () => {
  it('returns a formatted preview for a valid female CNP', () => {
    const s = summarizeCNP(VALID_FEMALE_1996);
    expect(s).not.toBeNull();
    expect(s!.birthDate).toBe('07.05.1996');
    expect(s!.gender).toBe('Femeie');
    expect(s!.county).toBe('Ialomița');
    expect(s!.countyCode).toBe('21');
  });

  it('returns a formatted preview for a valid male CNP', () => {
    const s = summarizeCNP(VALID_MALE_1982);
    expect(s).not.toBeNull();
    expect(s!.birthDate).toBe('10.10.1982');
    expect(s!.gender).toBe('Bărbat');
    expect(s!.countyCode).toBe('42');
  });

  it('formats date as DD.MM.YYYY without UTC drift', () => {
    // Regression for the 02.07 → 01.07 bug: Date(1992, 6, 2) in
    // Europe/Bucharest serialized as ISO would shift back one day.
    // summarizeCNP must use local getters, not toISOString().
    const cnp = '1920702303911'; // M, 1992-07-02, county 30 (Satu Mare)
    const s = summarizeCNP(cnp);
    expect(s).not.toBeNull();
    expect(s!.birthDate).toBe('02.07.1992');
    expect(s!.county).toBe('Satu Mare');
  });

  it('returns null for invalid CNP', () => {
    expect(summarizeCNP('1234567890123')).toBeNull();
    expect(summarizeCNP('not a cnp')).toBeNull();
    expect(summarizeCNP('')).toBeNull();
  });
});
