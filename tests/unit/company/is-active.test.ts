import { describe, it, expect } from 'vitest';
import { isCompanyActive } from '@/lib/services/infocui';

describe('isCompanyActive (ANAF stare firmă)', () => {
  it('TRANSFER(SOSIRE) = activă (bug-ul SOLTERA PLAST — sediu mutat)', () => {
    expect(isCompanyActive('TRANSFER(SOSIRE) din data 06.10.2025', false)).toBe(true);
  });

  it('TRANSFER(PLECARE) = activă', () => {
    expect(isCompanyActive('TRANSFER(PLECARE) din data 01.01.2025', false)).toBe(true);
  });

  it('INREGISTRAT = activă', () => {
    expect(isCompanyActive('INREGISTRAT din data 12.03.2024', false)).toBe(true);
  });

  it('în registrul de inactivi ANAF = inactivă', () => {
    expect(isCompanyActive('INREGISTRAT din data 12.03.2024', true)).toBe(false);
  });

  it('RADIAT = inactivă', () => {
    expect(isCompanyActive('RADIAT din data 01.01.2020', false)).toBe(false);
  });

  it('DIZOLVAT / LICHIDARE = inactivă', () => {
    expect(isCompanyActive('DIZOLVAT', false)).toBe(false);
    expect(isCompanyActive('IN LICHIDARE', false)).toBe(false);
  });

  it('string gol = activă (lipsă info ≠ radiată)', () => {
    expect(isCompanyActive('', false)).toBe(true);
  });
});
