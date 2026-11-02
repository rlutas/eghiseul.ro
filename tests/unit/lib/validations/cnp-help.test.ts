import { describe, it, expect } from 'vitest';
import { describeInvalidCnp, cnpErrorCode } from '@/lib/validations/cnp-help';
import { validateCNP } from '@/lib/validations/cnp';

// Synthetic CNPs built from parts; the control digit is computed here so the
// tests never depend on a real person's number.
const W = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
function withControl(first12: string): string {
  const sum = first12.split('').reduce((s, d, i) => s + Number(d) * W[i], 0);
  const c = sum % 11 === 10 ? 1 : sum % 11;
  return first12 + String(c);
}
function wrongControl(first12: string): string {
  const good = withControl(first12);
  return first12 + String((Number(good[12]) + 1) % 10);
}

describe('cnpErrorCode', () => {
  it('classifies each failure', () => {
    expect(cnpErrorCode('')).toBe('EMPTY');
    expect(cnpErrorCode('123')).toBe('LENGTH');
    expect(cnpErrorCode('12345678901a3')).toBe('NON_NUMERIC');
    expect(cnpErrorCode(withControl('074050111999'))).toBe('FIRST_DIGIT');
    expect(cnpErrorCode(withControl('174130111999'))).toBe('DATE');
    expect(cnpErrorCode(withControl('174050100999'))).toBe('COUNTY');
    expect(cnpErrorCode(wrongControl('174050111999'))).toBe('CHECKSUM');
    expect(cnpErrorCode(withControl('174050111999'))).toBeNull();
  });
});

describe('describeInvalidCnp', () => {
  it('decodes sex, date and county for a checksum typo (example from the brief)', () => {
    const cnp = wrongControl('174050111999');
    expect(validateCNP(cnp).valid).toBe(false);
    const help = describeInvalidCnp(cnp)!;
    expect(help.summary).toBe('Din CNP reiese: bărbat, născut pe 01.05.1974, județul Caraș-Severin.');
    expect(help.checkHint).toBe('Dacă acestea sunt corecte, verifică ultimele 4 cifre.');
    expect(help.sexHint).toBeNull();
  });

  it('uses the feminine form and 2000s century', () => {
    const help = describeInvalidCnp(wrongControl('605123140999'))!;
    expect(help.summary).toBe('Din CNP reiese: femeie, născută pe 31.12.2005, județul București.');
  });

  it('flags a first digit that contradicts the sex read from the ID', () => {
    const help = describeInvalidCnp(wrongControl('274050111999'), 'male')!;
    expect(help.sexHint).toBe('Prima cifră 2 înseamnă femeie — pentru bărbat e 1 (născut 1900–1999) sau 5 (după 2000).');
    const help2 = describeInvalidCnp(wrongControl('174050111999'), 'female')!;
    expect(help2.sexHint).toMatch(/^Prima cifră 1 înseamnă bărbat — pentru femeie e 2/);
  });

  it('points at the date when the date does not exist', () => {
    const help = describeInvalidCnp(withControl('174023011999'))!; // 30.02.1974
    expect(help.birthDate).toBeNull();
    expect(help.summary).toContain('data de naștere 30.02.74 nu există');
    expect(help.checkHint).toMatch(/cifrele 2–7/);
  });

  it('describes residents/foreigners without inventing a century', () => {
    const help = describeInvalidCnp(wrongControl('774050180999'))!;
    expect(help.summary).toBe('Din CNP reiese: bărbat, rezident străin, născut pe 01.05.74.');
    const nine = describeInvalidCnp(withControl('974050111999'))!;
    expect(nine.summary).toMatch(/^Din CNP reiese: persoană străină/);
  });

  it('does not treat an unknown county code as an error (no county shown)', () => {
    const help = describeInvalidCnp(wrongControl('174050147999'))!;
    expect(help.county).toBeNull();
    expect(help.summary).not.toMatch(/județul/);
  });

  it('never proposes a corrected CNP or control digit', () => {
    const cnp = wrongControl('174050111999');
    const help = describeInvalidCnp(cnp)!;
    const text = `${help.summary} ${help.checkHint} ${help.sexHint ?? ''}`;
    expect(text).not.toContain(withControl('174050111999'));
    expect(text).not.toMatch(/cifra de control (corectă|ar trebui)/i);
  });

  it('returns null for valid or incomplete CNPs', () => {
    expect(describeInvalidCnp(withControl('174050111999'))).toBeNull();
    expect(describeInvalidCnp('17405')).toBeNull();
  });
});
