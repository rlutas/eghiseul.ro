/**
 * Tests for CI-front name recovery from the MRZ.
 *
 * Real bug (order with holder ANDREI EUGEN, old TD2 2-line CI):
 *   Gemini returned lastName="IDROU", firstName="ANDREI EUGEN".
 *   The MRZ line 1 is "IDROUANDREI<<EUGEN<<<..." where "ID" = document type
 *   and "ROU" = issuing country — NOT part of the surname. The real split is
 *   surname=ANDREI, given=EUGEN.
 *
 * `parseRomanianEciMrz` only handles the new eCI TD1 layout (name on line 3),
 * so the old TD2 name (on line 1, after the IDROU prefix) was never recovered.
 * `recoverNamesFromMrz` + `correctCiFrontNames` close that gap.
 */

import { describe, it, expect } from 'vitest';
import {
  recoverNamesFromMrz,
  correctCiFrontNames,
} from '@/lib/services/document-ocr';

describe('recoverNamesFromMrz', () => {
  it('parses the old TD2 name on line 1 after the IDROU prefix (the real bug)', () => {
    const out = recoverNamesFromMrz({
      line1: 'IDROUANDREI<<<<EUGEN<<<<<<<<<<<<<<<<<',
      line2: 'NZ261166<4ROU7206018M31080312747856',
      line3: null,
    });
    expect(out.surname).toBe('ANDREI');
    expect(out.givenNames).toBe('EUGEN');
  });

  it('parses a TD2 name with a single << separator', () => {
    const out = recoverNamesFromMrz({ line1: 'IDROUANDREI<<EUGEN<<<<<<<<<<<', line2: 'X', line3: null });
    expect(out.surname).toBe('ANDREI');
    expect(out.givenNames).toBe('EUGEN');
  });

  it('parses a TD1 name on line 3 (new eCI)', () => {
    const out = recoverNamesFromMrz([
      'IDROUMB113912841710211434518<<<<',
      '7102110M3602151ROU<<<<<<<<<<<<0',
      'SABO<<GHEORGHE<CONSTANTIN<<<<<<',
    ]);
    expect(out.surname).toBe('SABO');
    expect(out.givenNames).toBe('GHEORGHE CONSTANTIN');
  });

  it('never mistakes the doc-number/CNP line (digits) for a name', () => {
    // TD1 line 1 also starts with IDROU and ends with "<<<<" but is all digits
    // after the prefix → must be rejected as a name candidate.
    const out = recoverNamesFromMrz({
      line1: 'IDROUMB113912841710211434518<<<<',
      line2: null,
      line3: null,
    });
    expect(out.surname).toBeUndefined();
  });

  it('does NOT corrupt surnames that legitimately start with I', () => {
    const out = recoverNamesFromMrz(['IONESCU<<MARIA<<<<<<<<<<<', '', '']);
    expect(out.surname).toBe('IONESCU');
    expect(out.givenNames).toBe('MARIA');
  });

  it('returns empty for missing/empty input', () => {
    expect(recoverNamesFromMrz(undefined)).toEqual({});
    expect(recoverNamesFromMrz({ line1: null, line2: null, line3: null })).toEqual({});
  });
});

describe('correctCiFrontNames', () => {
  const baseResult = (overrides: Record<string, unknown>) => ({
    success: true,
    documentType: 'ci_front' as const,
    confidence: 98,
    extractedData: {
      cnp: '1720601274785',
      lastName: 'IDROU',
      firstName: 'ANDREI EUGEN',
      mrz: {
        line1: 'IDROUANDREI<<<<EUGEN<<<<<<<<<<<<<<<<<',
        line2: 'NZ261166<4ROU7206018M31080312747856',
        line3: null,
      },
      ...overrides,
    },
    issues: [],
    suggestions: [],
  });

  it('strips the IDROU prefix and fixes the surname/given split', () => {
    const fixed = correctCiFrontNames(baseResult({}));
    expect(fixed.extractedData.lastName).toBe('ANDREI');
    expect(fixed.extractedData.firstName).toBe('EUGEN');
  });

  it('leaves already-correct names untouched', () => {
    const fixed = correctCiFrontNames(
      baseResult({ lastName: 'ANDREI', firstName: 'EUGEN' }),
    );
    expect(fixed.extractedData.lastName).toBe('ANDREI');
    expect(fixed.extractedData.firstName).toBe('EUGEN');
    expect(fixed.issues).toEqual([]);
  });

  it('preserves visual diacritics when they match the MRZ (deburred)', () => {
    // Visual fields carried diacritics; MRZ is ASCII. When they agree after
    // de-diacritic comparison we must keep the diacritic version.
    const fixed = correctCiFrontNames({
      success: true,
      documentType: 'ci_front',
      confidence: 95,
      extractedData: {
        lastName: 'IDROU',
        firstName: 'ȘTEFĂNESCU MARIA',
        mrz: {
          line1: 'IDROUSTEFANESCU<<MARIA<<<<<<<<<<<<',
          line2: 'X',
          line3: null,
        },
      },
      issues: [],
      suggestions: [],
    });
    expect(fixed.extractedData.lastName).toBe('ȘTEFĂNESCU');
    expect(fixed.extractedData.firstName).toBe('MARIA');
  });

  it('is a no-op when MRZ has no usable name', () => {
    const fixed = correctCiFrontNames({
      success: true,
      documentType: 'ci_front',
      confidence: 90,
      extractedData: {
        lastName: 'POPA',
        firstName: 'ION',
        mrz: { line1: null, line2: null, line3: null },
      },
      issues: [],
      suggestions: [],
    });
    expect(fixed.extractedData.lastName).toBe('POPA');
    expect(fixed.extractedData.firstName).toBe('ION');
  });
});
