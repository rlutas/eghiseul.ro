/**
 * Tests for the new ScanType extractors:
 * - extractFromCINouBack (eCI back — no address required)
 * - extractFromPassportOpened (full spread)
 * - extractFromROCEIReaderPDF (MAI app PDF output)
 *
 * We test at the parser boundary using parseGeminiOCRResponse with realistic
 * Gemini response shapes for each scan type. The actual Gemini API call is
 * mocked elsewhere; here we verify the OCR pipeline handles each scan type
 * correctly (especially the eCI back NOT marking fail on missing address).
 */

import { describe, it, expect } from 'vitest';
import { parseGeminiOCRResponse } from '@/lib/services/document-ocr';

describe('extractFromCINouBack — parser side', () => {
  it('reports success when eCI back has issueDate + MRZ but NO address', () => {
    // This is the realistic happy-path output for eCI back — what the old
    // extractFromCIBack would have marked as fail because address is missing.
    // The new extractFromCINouBack prompt explicitly tells Gemini that
    // address absence is normal and to set success=true.
    const raw = JSON.stringify({
      success: true,
      confidence: 87,
      extractedData: {
        issueDate: '16.02.2026',
        issuedBy: 'SPCEP S5 biroul nr.1',
        mrzRaw: [
          'IDROUMB1139128<1710211434518<<',
          '7102110M3602151ROU<<<<<<<<<<0',
          'SABO<<GHEORGHE<CONSTANTIN<<<<<',
        ],
        mrzDocumentNumber: 'MB1139128',
        mrzCnp: '1710211434518',
      },
      issues: [],
      suggestions: [],
    });

    const result = parseGeminiOCRResponse(raw, 'ci_back');
    expect(result.success).toBe(true);
    expect(result.confidence).toBe(87);
    expect((result.extractedData as unknown as Record<string, unknown>).issueDate).toBe('16.02.2026');
    expect((result.extractedData as unknown as Record<string, unknown>).issuedBy).toBe('SPCEP S5 biroul nr.1');
    expect((result.extractedData as unknown as Record<string, unknown>).mrzDocumentNumber).toBe('MB1139128');
    expect((result.extractedData as unknown as Record<string, unknown>).mrzCnp).toBe('1710211434518');
    // CRITICAL: must not bubble up "no address" as an issue
    expect(result.issues.some((i) => /address/i.test(i))).toBe(false);
  });

  it('still surfaces real legibility issues', () => {
    const raw = JSON.stringify({
      success: false,
      confidence: 20,
      extractedData: {
        issueDate: null,
        issuedBy: null,
        mrzRaw: null,
      },
      issues: ['MRZ-ul este parțial obturat de o reflexie'],
      suggestions: ['Refă poza fără reflexii directe pe spate'],
    });

    const result = parseGeminiOCRResponse(raw, 'ci_back');
    expect(result.success).toBe(false);
    expect(result.confidence).toBe(20);
    expect(result.issues).toContain('MRZ-ul este parțial obturat de o reflexie');
  });
});

describe('extractFromPassportOpened — parser side', () => {
  it('extracts full passport data from opened spread', () => {
    const raw = JSON.stringify({
      success: true,
      confidence: 92,
      extractedData: {
        cnp: '1900101220001',
        lastName: 'POPESCU',
        firstName: 'ION GHEORGHE',
        birthDate: '01.01.1990',
        birthPlace: 'București',
        gender: 'male',
        nationality: 'ROU',
        number: '055123456',
        issueDate: '01.06.2023',
        expiryDate: '01.06.2033',
        issuedBy: 'Direcția Generală de Pașapoarte',
        mrz: {
          line1: 'P<ROUPOPESCU<<ION<GHEORGHE<<<<<<<<<<<<<<<<<<',
          line2: '055123456<3ROU9001016M3306012<<<<<<<<<<<<<<00',
        },
      },
      issues: [],
      suggestions: [],
    });

    const result = parseGeminiOCRResponse(raw, 'passport');
    expect(result.success).toBe(true);
    expect(result.extractedData.cnp).toBe('1900101220001');
    expect(result.extractedData.lastName).toBe('POPESCU');
    expect(result.extractedData.firstName).toBe('ION GHEORGHE');
    expect(result.extractedData.number).toBe('055123456');
    expect(result.extractedData.nationality).toBe('ROU');
    expect((result.extractedData as unknown as Record<string, unknown>).mrz).toMatchObject({
      line1: expect.stringContaining('P<ROU'),
    });
  });

  it('handles foreign passport without CNP', () => {
    const raw = JSON.stringify({
      success: true,
      confidence: 88,
      extractedData: {
        cnp: null,
        lastName: 'SCHMIDT',
        firstName: 'HANS',
        birthDate: '15.06.1985',
        nationality: 'DEU',
        number: 'C01X00T47',
        issueDate: '01.03.2020',
        expiryDate: '01.03.2030',
      },
      issues: [],
      suggestions: [],
    });

    const result = parseGeminiOCRResponse(raw, 'passport');
    expect(result.success).toBe(true);
    expect(result.extractedData.cnp).toBeNull();
    expect(result.extractedData.nationality).toBe('DEU');
  });

  it('does not require address (passport has no address)', () => {
    // Realistic passport extraction — no `address` field at all
    const raw = JSON.stringify({
      success: true,
      confidence: 90,
      extractedData: {
        lastName: 'POPESCU',
        firstName: 'ION',
        number: '055123456',
        // no address key
      },
      issues: [],
      suggestions: [],
    });

    const result = parseGeminiOCRResponse(raw, 'passport');
    expect(result.success).toBe(true);
    expect(result.extractedData.address).toBeUndefined();
    // Must not have "no address" in issues
    expect(result.issues.some((i) => /address/i.test(i))).toBe(false);
  });
});

describe('extractFromROCEIReaderPDF — parser side', () => {
  it('extracts full data INCLUDING address from RO CEI Reader PDF output', () => {
    // Based on the actual sample PDF used in design discussion (SABO Gheorghe).
    const raw = JSON.stringify({
      success: true,
      confidence: 98,
      isAuthenticated: true,
      extractedData: {
        cnp: '1710211434518',
        lastName: 'SABO',
        firstName: 'GHEORGHE-CONSTANTIN',
        birthDate: '11.02.1971',
        birthPlace: 'Mun.București Sec.4',
        gender: 'male',
        nationality: 'ROU',
        number: 'MB1139128',
        issueDate: '16.02.2026',
        expiryDate: '15.02.2036',
        issuedBy: 'SPCEP S5 biroul nr.1',
        address: {
          fullAddress: 'Mun.București Sec.5 Bd.Schitu Măgureanu nr.3 sc.A et.3 ap.21',
          county: 'București',
          city: 'București',
          sector: '5',
          streetType: 'Bulevardul',
          street: 'Schitu Măgureanu',
          number: '3',
          building: null,
          staircase: 'A',
          floor: '3',
          apartment: '21',
          postalCode: null,
        },
      },
      issues: [],
      suggestions: [],
    });

    const result = parseGeminiOCRResponse(raw, 'passport');
    expect(result.success).toBe(true);
    expect(result.confidence).toBe(98);
    expect(result.extractedData.cnp).toBe('1710211434518');
    expect(result.extractedData.address?.county).toBe('București');
    expect(result.extractedData.address?.sector).toBe('5');
    expect(result.extractedData.address?.street).toBe('Schitu Măgureanu');
    expect(result.extractedData.address?.apartment).toBe('21');
  });

  it('flags PDF when isAuthenticated=false (forged PDF without MAI footer)', () => {
    const raw = JSON.stringify({
      success: true,
      confidence: 85,
      isAuthenticated: false,
      extractedData: {
        cnp: '1710211434518',
        lastName: 'SABO',
        firstName: 'GHEORGHE-CONSTANTIN',
        address: { fullAddress: 'București' },
      },
      issues: ['PDF-ul nu conține footer-ul oficial "RO CEI Reader a MAI"'],
      suggestions: ['Folosește aplicația oficială MAI pentru a genera PDF-ul'],
    });

    const result = parseGeminiOCRResponse(raw, 'passport');
    expect(result.success).toBe(true);
    // isAuthenticated is in raw response but isn't part of OCRResult type
    // — frontend reads it from the raw parsed payload separately
    expect(result.issues.some((i) => /RO CEI Reader/i.test(i))).toBe(true);
  });

  it('parses rural address with sat + comună format', () => {
    const raw = JSON.stringify({
      success: true,
      confidence: 95,
      isAuthenticated: true,
      extractedData: {
        cnp: '1900101220001',
        lastName: 'IONESCU',
        firstName: 'MARIA',
        address: {
          fullAddress: 'Com.Bărbătești Sat Bărbătești nr.125',
          county: 'Vâlcea',
          city: 'Bărbătești',
          sector: null,
          streetType: null,
          street: null,
          number: '125',
          building: null,
          staircase: null,
          floor: null,
          apartment: null,
        },
      },
      issues: [],
      suggestions: [],
    });

    const result = parseGeminiOCRResponse(raw, 'passport');
    expect(result.extractedData.address?.county).toBe('Vâlcea');
    expect(result.extractedData.address?.city).toBe('Bărbătești');
    expect(result.extractedData.address?.number).toBe('125');
    expect(result.extractedData.address?.sector).toBeNull();
  });
});
