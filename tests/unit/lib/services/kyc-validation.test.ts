import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Gemini SDK BEFORE importing the module under test. We need
// `vi.hoisted` so the mock factory can reference `generateContent` even
// after vi.mock is hoisted to the top of the file.
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock('@google/generative-ai', () => {
  // Vitest 4 requires a real class for `new GoogleGenerativeAI()` to work.
  class FakeGoogleGenerativeAI {
    getGenerativeModel() {
      return { generateContent };
    }
  }
  return { GoogleGenerativeAI: FakeGoogleGenerativeAI };
});

import { validateCIFront, validateCIBack, validateSelfie } from '@/lib/services/kyc-validation';

function geminiResponse(jsonStr: string) {
  return {
    response: { text: () => jsonStr },
  };
}

beforeEach(() => {
  generateContent.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('validateCIFront', () => {
  it('parses a successful JSON response and returns the validation', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true,
      confidence: 95,
      documentType: 'ci_front',
      extractedData: { cnp: '2960507211209', firstName: 'Stefania' },
      issues: [],
      suggestions: [],
    })));

    const result = await validateCIFront('AAAA', 'image/jpeg');

    expect(result.valid).toBe(true);
    expect(result.confidence).toBe(95);
    expect(result.documentType).toBe('ci_front');
    expect(result.extractedData?.cnp).toBe('2960507211209');
  });

  it('extracts JSON from response that has surrounding markdown/text', async () => {
    // Gemini sometimes wraps the JSON in markdown despite the prompt
    generateContent.mockResolvedValueOnce(geminiResponse(
      'Here is the JSON:\n```json\n{"valid":true,"confidence":80,"documentType":"ci_front","extractedData":{},"issues":[],"suggestions":[]}\n```\n'
    ));

    const result = await validateCIFront('AAAA', 'image/jpeg');

    expect(result.valid).toBe(true);
    expect(result.confidence).toBe(80);
  });

  it('returns invalid result with helpful message when no JSON in response', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse('No JSON here at all'));

    const result = await validateCIFront('AAAA', 'image/jpeg');

    expect(result.valid).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('returns invalid result when Gemini SDK throws (network error, bad key)', async () => {
    generateContent.mockRejectedValueOnce(new Error('Gemini API unreachable'));

    const result = await validateCIFront('AAAA', 'image/jpeg');

    expect(result.valid).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.documentType).toBe('ci_front');
    // Should not propagate the error — KYC must degrade gracefully
  });

  it('strips data: URL prefix from base64 before sending to Gemini', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true, confidence: 90, documentType: 'ci_front', extractedData: {}, issues: [], suggestions: [],
    })));

    await validateCIFront('data:image/jpeg;base64,RAW_BASE64_DATA', 'image/jpeg');

    const callArgs = generateContent.mock.calls[0][0];
    // The image part must contain the stripped base64 (no data: prefix)
    const imagePart = callArgs.find((p: unknown) => typeof p === 'object' && p !== null && 'inlineData' in p);
    expect(imagePart.inlineData.data).toBe('RAW_BASE64_DATA');
    expect(imagePart.inlineData.data).not.toContain('data:image');
  });
});

describe('validateCIBack', () => {
  it('parses a successful response with CI back data', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true,
      confidence: 88,
      extractedData: { address: 'Str. Test 1', issuedBy: 'SPCLEP' },
      issues: [],
      suggestions: [],
    })));

    const result = await validateCIBack('BBBB', 'image/jpeg');

    expect(result.valid).toBe(true);
    expect(result.documentType).toBe('ci_back');
    expect(result.extractedData?.address).toBe('Str. Test 1');
  });

  it('returns invalid documentType=ci_back when JSON missing', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(''));

    const result = await validateCIBack('BBBB', 'image/jpeg');

    expect(result.valid).toBe(false);
    expect(result.documentType).toBe('ci_back');
  });
});

describe('validateSelfie — WITHOUT CI reference (single image)', () => {
  it('sends only one image to Gemini', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true, confidence: 75, extractedData: { faceMatch: null, faceMatchConfidence: null }, issues: [], suggestions: [],
    })));

    await validateSelfie('SELFIE', 'image/jpeg');

    const callArgs = generateContent.mock.calls[0][0];
    const imageParts = callArgs.filter((p: unknown) => typeof p === 'object' && p !== null && 'inlineData' in p);
    expect(imageParts).toHaveLength(1);
    expect(imageParts[0].inlineData.data).toBe('SELFIE');
  });

  it('returns valid=true when Gemini approves the selfie quality alone', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true, confidence: 80, extractedData: { faceMatch: null }, issues: [], suggestions: [],
    })));

    const result = await validateSelfie('SELFIE', 'image/jpeg');

    expect(result.valid).toBe(true);
    expect(result.documentType).toBe('selfie');
  });
});

describe('validateSelfie — WITH CI reference (two images, face match)', () => {
  it('sends BOTH images to Gemini in correct order (selfie first, CI second)', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true, confidence: 92,
      extractedData: { faceMatch: true, faceMatchConfidence: 90 },
      issues: [], suggestions: [],
    })));

    await validateSelfie('SELFIE_DATA', 'image/jpeg', 'CI_DATA', 'image/jpeg');

    const callArgs = generateContent.mock.calls[0][0];
    const imageParts = callArgs.filter((p: unknown) => typeof p === 'object' && p !== null && 'inlineData' in p);
    expect(imageParts).toHaveLength(2);
    expect(imageParts[0].inlineData.data).toBe('SELFIE_DATA');
    expect(imageParts[1].inlineData.data).toBe('CI_DATA');
  });

  it('returns faceMatch=true with confidence when Gemini identifies same person', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true, confidence: 92,
      extractedData: { faceMatch: true, faceMatchConfidence: 90 },
      issues: [], suggestions: [],
    })));

    const result = await validateSelfie('S', 'image/jpeg', 'C', 'image/jpeg');

    expect(result.valid).toBe(true);
    expect(result.extractedData?.faceMatch).toBe(true);
    expect(result.extractedData?.faceMatchConfidence).toBe(90);
  });

  it('returns faceMatch=false when persons differ', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: false, confidence: 95,
      extractedData: { faceMatch: false, faceMatchConfidence: 5 },
      issues: ['Persoana din selfie nu corespunde cu CI'],
      suggestions: ['Folosește CI propriu'],
    })));

    const result = await validateSelfie('S', 'image/jpeg', 'C', 'image/jpeg');

    expect(result.valid).toBe(false);
    expect(result.extractedData?.faceMatch).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('strips data: prefix from BOTH selfie and CI base64', async () => {
    generateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify({
      valid: true, confidence: 90, extractedData: { faceMatch: true, faceMatchConfidence: 88 }, issues: [], suggestions: [],
    })));

    await validateSelfie(
      'data:image/jpeg;base64,SELFIE_RAW',
      'image/jpeg',
      'data:image/jpeg;base64,CI_RAW',
      'image/jpeg',
    );

    const callArgs = generateContent.mock.calls[0][0];
    const imageParts = callArgs.filter((p: unknown) => typeof p === 'object' && p !== null && 'inlineData' in p);
    expect(imageParts[0].inlineData.data).toBe('SELFIE_RAW');
    expect(imageParts[1].inlineData.data).toBe('CI_RAW');
  });
});
