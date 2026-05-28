import { describe, it, expect } from 'vitest';
import { crossValidateExtractedData } from '@/lib/services/document-ocr';

describe('crossValidateExtractedData', () => {
  describe('no scans / partial scans', () => {
    it('returns no warnings when all scans are missing', () => {
      const result = crossValidateExtractedData({});
      expect(result).toEqual([]);
    });

    it('returns no warnings when only ci_front is present', () => {
      const result = crossValidateExtractedData({
        ci_front: {
          documentType: 'ci_front',
          cnp: '1900101220001',
          number: 'MB1139128',
          lastName: 'POPESCU',
          firstName: 'ION',
          birthDate: '01.01.1990',
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('document number mismatch', () => {
    it('flags mismatch between CI front and eCI back MRZ', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', number: 'MB1139128' },
        ci_nou_back: { mrzDocumentNumber: 'MB1139999' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('documentNumber');
      expect(result[0].severity).toBe('warning');
      expect(result[0].message).toContain('MB1139128');
      expect(result[0].message).toContain('MB1139999');
    });

    it('flags mismatch between CI front and PDF RO CEI Reader', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', number: 'MB1139128' },
        ro_cei_reader_pdf: { documentType: 'passport', number: 'MB1139999' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('documentNumber');
      expect(result[0].values.ci_front).toBe('MB1139128');
      expect(result[0].values.ro_cei_reader_pdf).toBe('MB1139999');
    });

    it('no warning when all three sources agree (case-insensitive)', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', number: 'MB1139128' },
        ci_nou_back: { mrzDocumentNumber: 'mb1139128' },
        ro_cei_reader_pdf: { documentType: 'passport', number: 'MB1139128' },
      });
      expect(result.filter((w) => w.field === 'documentNumber')).toHaveLength(0);
    });
  });

  describe('CNP mismatch', () => {
    it('flags CNP mismatch between front and back MRZ', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', cnp: '1900101220001' },
        ci_nou_back: { mrzCnp: '1900101220002' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('cnp');
    });

    it('flags CNP mismatch between front and PDF (different person uploaded)', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', cnp: '1900101220001' },
        ro_cei_reader_pdf: { documentType: 'passport', cnp: '2900101220001' },
      });
      expect(result.some((w) => w.field === 'cnp')).toBe(true);
    });

    it('no warning when CNPs match across all scans', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', cnp: '1900101220001' },
        ci_nou_back: { mrzCnp: '1900101220001' },
        ro_cei_reader_pdf: { documentType: 'passport', cnp: '1900101220001' },
      });
      expect(result.filter((w) => w.field === 'cnp')).toHaveLength(0);
    });
  });

  describe('name comparison (handles diacritics)', () => {
    it('matches names with diacritic normalization (ș vs s)', () => {
      const result = crossValidateExtractedData({
        ci_front: {
          documentType: 'ci_front',
          lastName: 'IONEȘCU',
          firstName: 'GHEORGHE',
        },
        ro_cei_reader_pdf: {
          documentType: 'passport',
          lastName: 'IONESCU',  // missing diacritics
          firstName: 'GHEORGHE',
        },
      });
      expect(result.filter((w) => w.field === 'name')).toHaveLength(0);
    });

    it('flags real name mismatch', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', lastName: 'POPESCU', firstName: 'ION' },
        ro_cei_reader_pdf: { documentType: 'passport', lastName: 'IONESCU', firstName: 'GHEORGHE' },
      });
      expect(result.some((w) => w.field === 'name')).toBe(true);
    });

    it('case-insensitive name comparison', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', lastName: 'popescu', firstName: 'ion' },
        ro_cei_reader_pdf: { documentType: 'passport', lastName: 'POPESCU', firstName: 'ION' },
      });
      expect(result.filter((w) => w.field === 'name')).toHaveLength(0);
    });
  });

  describe('birth date comparison', () => {
    it('flags birth date mismatch', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', birthDate: '01.01.1990' },
        ro_cei_reader_pdf: { documentType: 'passport', birthDate: '02.01.1990' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('birthDate');
    });

    it('no warning when birth dates match exactly', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', birthDate: '01.01.1990' },
        ro_cei_reader_pdf: { documentType: 'passport', birthDate: '01.01.1990' },
      });
      expect(result.filter((w) => w.field === 'birthDate')).toHaveLength(0);
    });
  });

  describe('multiple simultaneous warnings', () => {
    it('returns multiple warnings when several fields mismatch', () => {
      const result = crossValidateExtractedData({
        ci_front: {
          documentType: 'ci_front',
          cnp: '1900101220001',
          number: 'MB1139128',
          lastName: 'POPESCU',
          firstName: 'ION',
          birthDate: '01.01.1990',
        },
        ro_cei_reader_pdf: {
          documentType: 'passport',
          cnp: '2900101220001',          // mismatch
          number: 'MB9999999',            // mismatch
          lastName: 'IONESCU',            // mismatch
          firstName: 'GHEORGHE',          // mismatch
          birthDate: '05.05.1991',        // mismatch
        },
      });
      expect(result.length).toBeGreaterThanOrEqual(4);
      const fields = result.map((w) => w.field);
      expect(fields).toContain('cnp');
      expect(fields).toContain('documentNumber');
      expect(fields).toContain('name');
      expect(fields).toContain('birthDate');
    });
  });

  describe('severity is always warning (never error)', () => {
    it('all warnings have severity=warning regardless of field', () => {
      const result = crossValidateExtractedData({
        ci_front: { documentType: 'ci_front', cnp: '1', number: '1', lastName: 'A', firstName: 'B', birthDate: '1' },
        ci_nou_back: { mrzCnp: '2', mrzDocumentNumber: '2' },
        ro_cei_reader_pdf: { documentType: 'passport', cnp: '2', number: '2', lastName: 'X', firstName: 'Y', birthDate: '2' },
      });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((w) => {
        expect(w.severity).toBe('warning');
      });
    });
  });
});
