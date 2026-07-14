import { describe, it, expect } from 'vitest';
import { suggestEmailCorrection } from '@/lib/email-typo';

describe('suggestEmailCorrection', () => {
  it('corrects known hard typos', () => {
    expect(suggestEmailCorrection('ion@gmail.ro')).toBe('ion@gmail.com');
    expect(suggestEmailCorrection('ion@gmali.com')).toBe('ion@gmail.com');
    expect(suggestEmailCorrection('ana@yaho.com')).toBe('ana@yahoo.com');
    expect(suggestEmailCorrection('ana@hotmial.com')).toBe('ana@hotmail.com');
  });

  it('corrects distance-1 fuzzy typos', () => {
    expect(suggestEmailCorrection('x@gmaill.com')).toBe('x@gmail.com');
    expect(suggestEmailCorrection('x@outlool.com')).toBe('x@outlook.com');
  });

  it('leaves valid popular domains alone', () => {
    expect(suggestEmailCorrection('ion@gmail.com')).toBeNull();
    expect(suggestEmailCorrection('ion@yahoo.ro')).toBeNull();
    expect(suggestEmailCorrection('ion@icloud.com')).toBeNull();
  });

  it('leaves niche/corporate domains alone', () => {
    expect(suggestEmailCorrection('office@eghiseul.ro')).toBeNull();
    expect(suggestEmailCorrection('a@primaria-cluj.ro')).toBeNull();
    expect(suggestEmailCorrection('x@rhumat.ca')).toBeNull();
  });

  it('handles junk input without throwing', () => {
    expect(suggestEmailCorrection('')).toBeNull();
    expect(suggestEmailCorrection('no-at-sign')).toBeNull();
    expect(suggestEmailCorrection('a@')).toBeNull();
    expect(suggestEmailCorrection('a@nodot')).toBeNull();
  });
});
