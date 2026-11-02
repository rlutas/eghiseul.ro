import { describe, it, expect } from 'vitest';
import { isGeminiUnavailableError } from '@/lib/services/gemini-health';

describe('isGeminiUnavailableError — incident credit epuizat 23.10–02.11.2026', () => {
  it('recognizes the depleted-credit 402 from the Google SDK', () => {
    expect(
      isGeminiUnavailableError(
        new Error('[GoogleGenerativeAI Error]: [402 Payment Required] Your prepayment credits are depleted.')
      )
    ).toBe(true);
  });

  it('recognizes quota / rate limit and revoked keys', () => {
    expect(isGeminiUnavailableError(new Error('[429 Too Many Requests] RESOURCE_EXHAUSTED'))).toBe(true);
    expect(isGeminiUnavailableError(new Error('API key not valid. Please pass a valid API key.'))).toBe(true);
  });

  it('leaves unreadable-image and parse errors alone', () => {
    expect(isGeminiUnavailableError(new Error('Unexpected token in JSON at position 4'))).toBe(false);
    expect(isGeminiUnavailableError(new Error('Image too small'))).toBe(false);
    expect(isGeminiUnavailableError(undefined)).toBe(false);
  });
});
