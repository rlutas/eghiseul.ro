/**
 * Tests for parseRomanianEciMrz + the cross-validation false-positive
 * regression observed on order E-260528-DZ8MS.
 *
 * Background: Gemini's structured extraction of `mrzDocumentNumber` and
 * `mrzCnp` was unreliable — concatenated multiple MRZ fields into a single
 * string. Cross-validation then flagged a "mismatch" that wasn't real.
 *
 * Fix: extract `mrzRaw[]` (Gemini reads the lines accurately) and parse
 * structured fields in deterministic TypeScript. Cross-validation uses
 * the parsed values, falling back to Gemini's only when raw is missing.
 */

import { describe, it, expect } from 'vitest';
import {
  parseRomanianEciMrz,
  crossValidateExtractedData,
} from '@/lib/services/document-ocr';

describe('parseRomanianEciMrz — TD1-like 3-line MRZ format', () => {
  it('parses the actual eCI from order E-260528-DZ8MS', () => {
    // Real MRZ captured from the order (SABO Gheorghe-Constantin, CUI eCI)
    const out = parseRomanianEciMrz([
      'IDROUMB113912841710211434518<<<<',
      '7102110M3602151ROU<<<<<<<<<<<<0',
      'SABO<<GHEORGHE<CONSTANTIN<<<<<<',
    ]);

    expect(out.documentNumber).toBe('MB1139128');
    expect(out.cnp).toBe('1710211434518');
    expect(out.birthDate).toBe('710211');
    expect(out.sex).toBe('M');
    expect(out.expiryDate).toBe('360215');
    expect(out.nationality).toBe('ROU');
    expect(out.surname).toBe('SABO');
    expect(out.givenNames).toBe('GHEORGHE CONSTANTIN');
  });

  it('handles MRZ with explicit < separators between doc number and CNP', () => {
    const out = parseRomanianEciMrz([
      'IDROUMB1139128<4<1710211434518<<<',
      '7102110M3602151ROU<<<<<<<<<<<<0',
      'SABO<<GHEORGHE<<<<<<<<<<<<<<<<<',
    ]);
    expect(out.documentNumber).toBe('MB1139128');
    expect(out.cnp).toBe('1710211434518');
  });

  it('returns empty object for empty or undefined input', () => {
    expect(parseRomanianEciMrz(undefined)).toEqual({});
    expect(parseRomanianEciMrz([])).toEqual({});
    expect(parseRomanianEciMrz(['', '', ''])).toEqual({});
  });

  it('ignores garbled line 1 but still parses line 2 + line 3', () => {
    const out = parseRomanianEciMrz([
      'GARBAGE LINE',
      '8505250F3306282ROU<<<<<<<<<<<0',
      'POPESCU<<MARIA<<<<<<<<<<<<<<<<<',
    ]);
    expect(out.documentNumber).toBeUndefined();
    expect(out.cnp).toBeUndefined();
    expect(out.birthDate).toBe('850525');
    expect(out.sex).toBe('F');
    expect(out.expiryDate).toBe('330628');
    expect(out.surname).toBe('POPESCU');
    expect(out.givenNames).toBe('MARIA');
  });

  it('falls back to first 13-digit run if line-1 format is unusual', () => {
    const out = parseRomanianEciMrz([
      'IDROUSOMETHING1710211434518<<<<',
      '',
      '',
    ]);
    expect(out.cnp).toBe('1710211434518');
  });
});

describe('crossValidateExtractedData — uses parsed MRZ (no false positives)', () => {
  it('regression test for E-260528-DZ8MS: front matches MRZ when parsed correctly', () => {
    // Reproduce the exact data that caused the false positives on the order:
    // - Gemini returned `mrzDocumentNumber: "MB113912841710211434518"` (concatenated)
    // - Gemini returned `mrzCnp: "3602151"` (expiry slice, wrong)
    // - Front returns series="MB", number="1139128"
    // - Real MRZ raw is correct → our parser must use it and produce no warnings.
    const result = crossValidateExtractedData({
      ci_front: {
        documentType: 'ci_front',
        cnp: '1710211434518',
        series: 'MB',
        number: '1139128',
        lastName: 'SABO',
        firstName: 'GHEORGHE-CONSTANTIN',
        birthDate: '11.02.1971',
      },
      ci_nou_back: {
        // Gemini's bad fields — should be IGNORED in favor of mrzRaw.
        mrzDocumentNumber: 'MB113912841710211434518',
        mrzCnp: '3602151',
        // Raw MRZ Gemini reads accurately → parser extracts correct fields.
        mrzRaw: [
          'IDROUMB113912841710211434518<<<<',
          '7102110M3602151ROU<<<<<<<<<<<<0',
          'SABO<<GHEORGHE<CONSTANTIN<<<<<<',
        ],
        issueDate: '16.02.2026',
        issuedBy: 'SPCEP S5 biroul nr.1',
      },
      ro_cei_reader_pdf: {
        documentType: 'passport',
        cnp: '1710211434518',
        number: 'MB1139128',
        lastName: 'SABO',
        firstName: 'GHEORGHE-CONSTANTIN',
        birthDate: '11.02.1971',
      },
    });

    expect(result).toEqual([]); // ZERO warnings — front/back/PDF all match
  });

  it('still flags real mismatches even with parsed MRZ', () => {
    const result = crossValidateExtractedData({
      ci_front: {
        documentType: 'ci_front',
        cnp: '1710211434518',
        series: 'MB',
        number: '9999999', // intentionally wrong
      },
      ci_nou_back: {
        mrzRaw: [
          'IDROUMB113912841710211434518<<<<',
          '',
          '',
        ],
      },
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((w) => w.field === 'documentNumber')).toBe(true);
    // The message should reference the parsed value (MB1139128), not the
    // garbled Gemini one.
    const docWarning = result.find((w) => w.field === 'documentNumber')!;
    expect(docWarning.message).toContain('MB1139128');
  });

  it('falls back to Gemini-extracted mrzDocumentNumber if mrzRaw absent', () => {
    // Legacy orders pre-parser don't have mrzRaw. Use Gemini's value as-is.
    const result = crossValidateExtractedData({
      ci_front: { documentType: 'ci_front', series: 'MB', number: '1139128' },
      ci_nou_back: {
        mrzDocumentNumber: 'MB1139128', // Gemini got this one right
        // mrzRaw undefined
      },
    });
    expect(result.filter((w) => w.field === 'documentNumber')).toEqual([]);
  });
});
