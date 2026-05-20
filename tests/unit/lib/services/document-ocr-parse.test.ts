import { describe, it, expect } from 'vitest';
import { parseGeminiOCRResponse } from '@/lib/services/document-ocr';

describe('parseGeminiOCRResponse', () => {
  describe('happy path — valid JSON', () => {
    it('parses a complete CI front response', () => {
      const raw = JSON.stringify({
        success: true,
        confidence: 95,
        extractedData: {
          cnp: '1900101220001',
          lastName: 'POPESCU',
          firstName: 'ION',
          birthDate: '01.01.1990',
          gender: 'male',
          series: 'SM',
          number: '966197',
          expiryDate: '01.01.2030',
        },
        issues: [],
        suggestions: [],
      });

      const result = parseGeminiOCRResponse(raw, 'ci_front');

      expect(result.success).toBe(true);
      expect(result.confidence).toBe(95);
      expect(result.documentType).toBe('ci_front');
      expect(result.extractedData.cnp).toBe('1900101220001');
      expect(result.extractedData.documentType).toBe('ci_front');
      expect(result.issues).toEqual([]);
    });

    it('strips markdown fences around JSON', () => {
      const raw = '```json\n{"success": true, "confidence": 87, "extractedData": {"cnp": "1900101220001"}}\n```';
      const result = parseGeminiOCRResponse(raw, 'ci_front');
      expect(result.success).toBe(true);
      expect(result.confidence).toBe(87);
    });

    it('handles preamble before JSON', () => {
      const raw = `Iată datele extrase:
{
  "success": true,
  "confidence": 92,
  "extractedData": { "cnp": "1900101220001" }
}`;
      const result = parseGeminiOCRResponse(raw, 'ci_back');
      expect(result.success).toBe(true);
      expect(result.confidence).toBe(92);
      expect(result.documentType).toBe('ci_back');
    });
  });

  describe('failure paths — bubble raw text in issues[]', () => {
    it('returns 0 confidence + raw text when no JSON braces found', () => {
      const raw = 'Nu pot citi documentul, imaginea este prea neclară.';
      const result = parseGeminiOCRResponse(raw, 'ci_front');

      expect(result.success).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.documentType).toBe('ci_front');
      expect(result.issues.some((i) => i.includes('[gemini-raw]'))).toBe(true);
      expect(result.issues.some((i) => i.includes('imaginea este prea neclară'))).toBe(true);
    });

    it('returns 0 confidence + raw text on malformed JSON', () => {
      const raw = '{ "success": true, "confidence": 90, broken json without quotes }';
      const result = parseGeminiOCRResponse(raw, 'ci_front');

      expect(result.success).toBe(false);
      expect(result.confidence).toBe(0);
      // Issue must contain hint about malformed JSON
      expect(result.issues.some((i) => /JSON malformat/i.test(i))).toBe(true);
      expect(result.issues.some((i) => i.includes('[gemini-raw]'))).toBe(true);
    });

    it('respects `success: false` returned by Gemini', () => {
      const raw = JSON.stringify({
        success: false,
        confidence: 12,
        extractedData: {},
        issues: ['CNP nu este lizibil', 'Marginea documentului este tăiată'],
        suggestions: ['Refă fotografia cu lumină mai bună'],
      });

      const result = parseGeminiOCRResponse(raw, 'passport');

      expect(result.success).toBe(false);
      expect(result.confidence).toBe(12);
      expect(result.issues).toContain('CNP nu este lizibil');
      expect(result.suggestions).toContain('Refă fotografia cu lumină mai bună');
    });

    it('truncates very long raw text to 500 chars', () => {
      const longBlob = 'x'.repeat(2000);
      const result = parseGeminiOCRResponse(longBlob, 'ci_front');
      const rawIssue = result.issues.find((i) => i.includes('[gemini-raw]'))!;
      // Issue prefix `[gemini-raw]: ` ≈ 14 chars + 500 max payload ≤ 520
      expect(rawIssue.length).toBeLessThanOrEqual(520);
    });
  });

  describe('field defaults when Gemini omits them', () => {
    it('defaults missing success to false', () => {
      const raw = JSON.stringify({ confidence: 50, extractedData: { cnp: 'X' } });
      expect(parseGeminiOCRResponse(raw, 'ci_front').success).toBe(false);
    });

    it('defaults missing confidence to 0', () => {
      const raw = JSON.stringify({ success: true, extractedData: { cnp: 'X' } });
      expect(parseGeminiOCRResponse(raw, 'ci_front').confidence).toBe(0);
    });

    it('defaults missing issues/suggestions to empty arrays', () => {
      const raw = JSON.stringify({ success: true, confidence: 90, extractedData: {} });
      const result = parseGeminiOCRResponse(raw, 'ci_front');
      expect(result.issues).toEqual([]);
      expect(result.suggestions).toEqual([]);
    });
  });

  describe('document type stamping', () => {
    it.each(['ci_front', 'ci_back', 'passport', 'unknown'] as const)(
      'stamps documentType=%s on extractedData even when Gemini omits it',
      (docType) => {
        const raw = JSON.stringify({
          success: true,
          confidence: 80,
          extractedData: { cnp: '1900101220001' },
        });
        const result = parseGeminiOCRResponse(raw, docType);
        expect(result.documentType).toBe(docType);
        expect(result.extractedData.documentType).toBe(docType);
      },
    );
  });
});
