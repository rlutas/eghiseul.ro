import { describe, expect, it } from 'vitest';
import { validateCNP, extractBirthDateFromCNP, isAdult, formatCNP, maskCNP, getCountyFromCNP } from '@/lib/validations/cnp';

// Real, validated CNPs (from production test orders, 2026-04-27):
//   - Female, born 1996-05-07, county 21 (Ialomița):           2960507211209
//   - Male,   born 1982-10-10, county 42 (București Sector 2): 1821010420068
// Both verified against the official Romanian checksum algorithm.

const VALID_FEMALE_1996 = '2960507211209';
const VALID_MALE_1982 = '1821010420068';

describe('validateCNP — happy path', () => {
  it('accepts a valid female CNP and extracts demographic data', () => {
    const r = validateCNP(VALID_FEMALE_1996);

    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.data).toBeDefined();
    expect(r.data!.gender).toBe('female');
    expect(r.data!.birthYear).toBe(1996);
    expect(r.data!.birthMonth).toBe(5);
    expect(r.data!.birthDay).toBe(7);
    expect(r.data!.countyCode).toBe('21');
  });

  it('accepts a valid male CNP', () => {
    const r = validateCNP(VALID_MALE_1982);

    expect(r.valid).toBe(true);
    expect(r.data!.gender).toBe('male');
    expect(r.data!.birthYear).toBe(1982);
  });

  it('strips spaces and dashes before validating', () => {
    expect(validateCNP('2 9605 0721 1209').valid).toBe(true);
    expect(validateCNP('2-9605-0721-1209').valid).toBe(true);
    expect(validateCNP(' 2960507211209 ').valid).toBe(true);
  });

  it('returns an age that matches today', () => {
    const r = validateCNP(VALID_MALE_1982);
    const expectedAge = new Date().getFullYear() - 1982 - (new Date() < new Date(new Date().getFullYear(), 9, 10) ? 1 : 0);

    expect(r.data!.age).toBe(expectedAge);
  });
});

describe('validateCNP — gender + century encoding', () => {
  // First digit encodes BOTH gender AND century for natives. We test each.
  // To make the tests deterministic, we craft CNPs by fixing all other fields
  // and computing the checksum on the fly via the algorithm spec.
  //
  // Format: SAALLZZJJNNNC, weights [2,7,9,1,4,6,3,5,8,2,7,9], check = sum%11 (10→1)
  //
  // We use yyyy=00, month=01, day=01, county=01, seq=001 → "S0001010101 0 0 1" + check
  function craftCNP(genderCenturyDigit: number): string {
    // Format: S(1) + AA(2) + LL(2) + ZZ(2) + JJ(2) + NNN(3) = 12 chars + checksum = 13
    // Use yy=00, month=01, day=01, county=01, seq=001
    const base = `${genderCenturyDigit}00010101001`;
    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(base[i], 10) * weights[i];
    const check = sum % 11 === 10 ? 1 : sum % 11;
    return base + check;
  }

  it.each([
    [1, 'male',   1900],
    [2, 'female', 1900],
    [3, 'male',   1800],
    [4, 'female', 1800],
    [5, 'male',   2000],
    [6, 'female', 2000],
    [7, 'male',   1900], // foreign resident, default century
    [8, 'female', 1900], // foreign resident, default century
  ])('digit %i decodes to gender %s, century %i', (digit, gender, century) => {
    const cnp = craftCNP(digit);
    const r = validateCNP(cnp);

    expect(r.valid).toBe(true);
    expect(r.data!.gender).toBe(gender);
    expect(r.data!.birthYear).toBe(century); // year=00 → just century
  });

  it.each([0, 9])('rejects gender digit %i (out of 1-8 range)', (digit) => {
    const r = validateCNP(`${digit}960507211209`);
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/prima cifră/i);
  });
});

describe('validateCNP — format errors', () => {
  it('rejects empty string', () => {
    const r = validateCNP('');
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/13 cifre/);
  });

  it('rejects too short', () => {
    expect(validateCNP('123').valid).toBe(false);
  });

  it('rejects too long', () => {
    expect(validateCNP('12345678901234').valid).toBe(false);
  });

  it('rejects non-numeric characters', () => {
    const r = validateCNP('29605072112X9');
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/doar cifre/);
  });
});

describe('validateCNP — date errors', () => {
  // We craft these so length + first digit are valid, but date components are not.
  // All examples below use base "2YYMMDD11001" + computed checksum.

  function craft(yy: string, mm: string, dd: string, county = '11', seq = '001'): string {
    const base = `2${yy}${mm}${dd}${county}${seq}`;
    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(base[i], 10) * weights[i];
    return base + (sum % 11 === 10 ? 1 : sum % 11);
  }

  it('rejects month 00', () => {
    const r = validateCNP(craft('96', '00', '15'));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.match(/luna/i))).toBe(true);
  });

  it('rejects month 13', () => {
    const r = validateCNP(craft('96', '13', '15'));
    expect(r.valid).toBe(false);
  });

  it('rejects day 00', () => {
    const r = validateCNP(craft('96', '05', '00'));
    expect(r.valid).toBe(false);
  });

  it('rejects day 32', () => {
    const r = validateCNP(craft('96', '05', '32'));
    expect(r.valid).toBe(false);
  });

  it('rejects Feb 30 (impossible date)', () => {
    const r = validateCNP(craft('96', '02', '30'));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.match(/invalidă/i))).toBe(true);
  });

  it('rejects April 31 (impossible date)', () => {
    const r = validateCNP(craft('96', '04', '31'));
    expect(r.valid).toBe(false);
  });

  it('rejects future birth date (uses gender 6 = 2000s for forward dates)', () => {
    // Year 99 + century 2000 = 2099, way in the future
    const futureYY = String(new Date().getFullYear() + 5).slice(-2).padStart(2, '0');
    const base = `6${futureYY}060115001`;
    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(base[i], 10) * weights[i];
    const cnp = base + (sum % 11 === 10 ? 1 : sum % 11);

    const r = validateCNP(cnp);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.match(/viitor/i))).toBe(true);
  });
});

describe('validateCNP — county code errors', () => {
  function craftWithCounty(county: string): string {
    const base = `2960507${county}001`;
    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(base[i], 10) * weights[i];
    return base + (sum % 11 === 10 ? 1 : sum % 11);
  }

  it.each(['47', '48', '49', '50', '53', '99'])('rejects unknown county code "%s"', (code) => {
    const r = validateCNP(craftWithCounty(code));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.match(/jude/i))).toBe(true);
  });

  it.each([
    ['01', 'Alba'],
    ['12', 'Cluj'],
    ['40', 'București'],
    ['41', 'București Sector 1'],
    ['46', 'București Sector 6'],
    ['51', 'Călărași'],
    ['52', 'Giurgiu'],
  ])('accepts county code "%s" (%s)', (code, _name) => {
    const r = validateCNP(craftWithCounty(code));
    expect(r.valid).toBe(true);
  });
});

describe('validateCNP — checksum errors', () => {
  it('rejects when last digit is wrong', () => {
    // Mutate a valid CNP's last digit
    const broken = VALID_FEMALE_1996.slice(0, 12) + '0';
    const r = validateCNP(broken);
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/control/i);
  });

  it('rejects all variations of wrong checksum (digits 0..9 except correct one)', () => {
    const correct = parseInt(VALID_FEMALE_1996[12], 10);
    for (let d = 0; d <= 9; d++) {
      if (d === correct) continue;
      const broken = VALID_FEMALE_1996.slice(0, 12) + d;
      expect(validateCNP(broken).valid).toBe(false);
    }
  });
});

describe('extractBirthDateFromCNP', () => {
  it('returns Date for valid CNP', () => {
    const date = extractBirthDateFromCNP(VALID_MALE_1982);
    expect(date).toBeInstanceOf(Date);
    expect(date!.getFullYear()).toBe(1982);
    expect(date!.getMonth()).toBe(9); // October (0-indexed)
    expect(date!.getDate()).toBe(10);
  });

  it('returns null for invalid CNP', () => {
    expect(extractBirthDateFromCNP('1234567890123')).toBeNull();
    expect(extractBirthDateFromCNP('')).toBeNull();
  });
});

describe('isAdult', () => {
  it('returns true for someone born >18 years ago', () => {
    expect(isAdult(VALID_MALE_1982)).toBe(true); // 1982 → ~44yo
  });

  it('returns false for invalid CNP', () => {
    expect(isAdult('1234567890123')).toBe(false);
  });
});

describe('formatCNP', () => {
  it('inserts visual dashes in canonical positions', () => {
    expect(formatCNP(VALID_FEMALE_1996)).toBe('2-960507-21-120-9');
  });

  it('returns original string when length is wrong', () => {
    expect(formatCNP('123')).toBe('123');
  });
});

describe('maskCNP', () => {
  it('masks middle 8 digits', () => {
    expect(maskCNP(VALID_FEMALE_1996)).toBe('2********1209');
    expect(maskCNP(VALID_FEMALE_1996)).toHaveLength(13);
  });

  it('returns original when length is wrong', () => {
    expect(maskCNP('123')).toBe('123');
  });
});

describe('getCountyFromCNP', () => {
  it('returns county name for valid county code', () => {
    expect(getCountyFromCNP(VALID_FEMALE_1996)).toBe('Ialomița'); // code 21
    expect(getCountyFromCNP(VALID_MALE_1982)).toBe('București Sector 2'); // code 42
  });

  it('returns null when length is wrong', () => {
    expect(getCountyFromCNP('123')).toBeNull();
  });
});
