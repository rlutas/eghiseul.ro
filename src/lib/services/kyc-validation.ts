/**
 * KYC Document Validation Service using Google Gemini AI
 *
 * This service validates identity documents (Romanian ID cards) and selfies
 * using Google's Gemini Vision API.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { KYCValidationResult } from '@/types/orders';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Re-export the type for convenience
export type { KYCValidationResult };

export interface KYCValidationRequest {
  documentType: 'ci_front' | 'ci_back' | 'selfie';
  imageBase64: string;
  mimeType: string;
  // For selfie validation, we need the CI front to compare
  referenceImageBase64?: string;
  referenceMimeType?: string;
}

/**
 * Validate a Romanian ID card front side
 */
export async function validateCIFront(
  imageBase64: string,
  mimeType: string
): Promise<KYCValidationResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analizează această imagine a unei cărți de identitate românești (față).

IMPORTANT: Răspunde DOAR în format JSON valid, fără alte explicații.

Verifică:
1. Este o carte de identitate românească validă (față)?
2. Imaginea este clară și citibilă?
3. Toate câmpurile sunt vizibile?
4. Nu sunt semne de falsificare/editare?

Extrage datele vizibile:
- CNP (13 cifre)
- Nume (Last Name)
- Prenume (First Name)
- Data nașterii (Birth Date)
- Data expirării (Expiry Date)
- Seria și numărul

Răspunde STRICT în acest format JSON:
{
  "valid": true/false,
  "confidence": 0-100,
  "documentType": "ci_front",
  "extractedData": {
    "cnp": "string sau null",
    "lastName": "string sau null",
    "firstName": "string sau null",
    "birthDate": "DD.MM.YYYY sau null",
    "expiryDate": "DD.MM.YYYY sau null",
    "series": "string sau null",
    "number": "string sau null"
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru utilizator"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        valid: false,
        confidence: 0,
        documentType: 'ci_front',
        issues: ['Nu s-a putut analiza documentul'],
        suggestions: ['Încercați să faceți o nouă fotografie cu iluminare mai bună'],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      valid: parsed.valid ?? false,
      confidence: parsed.confidence ?? 0,
      documentType: 'ci_front',
      extractedData: parsed.extractedData,
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (error) {
    console.error('CI Front validation error:', error);
    return {
      valid: false,
      confidence: 0,
      documentType: 'ci_front',
      issues: ['Eroare la validarea documentului'],
      suggestions: ['Verificați conexiunea la internet și încercați din nou'],
    };
  }
}

/**
 * Validate a Romanian ID card back side
 */
export async function validateCIBack(
  imageBase64: string,
  mimeType: string
): Promise<KYCValidationResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analizează această imagine a unei cărți de identitate românești (verso/spate).

IMPORTANT: Răspunde DOAR în format JSON valid, fără alte explicații.

Verifică:
1. Este spatele unei cărți de identitate românești valide?
2. Imaginea este clară și citibilă?
3. Adresa este vizibilă?
4. Nu sunt semne de falsificare/editare?

Extrage datele vizibile:
- Adresa completă
- Data emiterii
- Emis de (autoritatea)

Răspunde STRICT în acest format JSON:
{
  "valid": true/false,
  "confidence": 0-100,
  "documentType": "ci_back",
  "extractedData": {
    "address": "string sau null",
    "issueDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null"
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru utilizator"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        valid: false,
        confidence: 0,
        documentType: 'ci_back',
        issues: ['Nu s-a putut analiza documentul'],
        suggestions: ['Încercați să faceți o nouă fotografie cu iluminare mai bună'],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      valid: parsed.valid ?? false,
      confidence: parsed.confidence ?? 0,
      documentType: 'ci_back',
      extractedData: parsed.extractedData,
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (error) {
    console.error('CI Back validation error:', error);
    return {
      valid: false,
      confidence: 0,
      documentType: 'ci_back',
      issues: ['Eroare la validarea documentului'],
      suggestions: ['Verificați conexiunea la internet și încercați din nou'],
    };
  }
}

/**
 * Validate a selfie with ID document
 */
export async function validateSelfie(
  selfieBase64: string,
  selfieMimeType: string,
  ciBase64?: string,
  ciMimeType?: string
): Promise<KYCValidationResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const parts: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

  // Build prompt based on whether we have CI reference
  let prompt: string;

  if (ciBase64 && ciMimeType) {
    prompt = `Analizează aceste două imagini pentru verificare KYC:
1. Prima imagine: Selfie cu persoana ținând cartea de identitate
2. A doua imagine: Cartea de identitate (față)

IMPORTANT: Răspunde DOAR în format JSON valid, fără alte explicații.

Verifică:
1. Persoana din selfie ține o carte de identitate lângă față?
2. Fața persoanei este vizibilă clar?
3. Fața din selfie CORESPUNDE cu fotografia de pe cartea de identitate?
4. Documentul din selfie pare să fie același cu documentul din a doua imagine?
5. Nu sunt semne de manipulare/editare?

Răspunde STRICT în acest format JSON:
{
  "valid": true/false,
  "confidence": 0-100,
  "documentType": "selfie",
  "extractedData": {
    "faceMatch": true/false,
    "faceMatchConfidence": 0-100
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru utilizator"]
}`;

    parts.push(prompt);
    parts.push({
      inlineData: {
        mimeType: selfieMimeType,
        data: selfieBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      inlineData: {
        mimeType: ciMimeType,
        data: ciBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
  } else {
    prompt = `Analizează această imagine selfie pentru verificare KYC.

IMPORTANT: Răspunde DOAR în format JSON valid, fără alte explicații.

Verifică:
1. Persoana din selfie ține o carte de identitate lângă față?
2. Fața persoanei este vizibilă clar?
3. Documentul din selfie pare să fie o carte de identitate românească?
4. Imaginea nu este editată/manipulată?

Răspunde STRICT în acest format JSON:
{
  "valid": true/false,
  "confidence": 0-100,
  "documentType": "selfie",
  "extractedData": {
    "faceMatch": null,
    "faceMatchConfidence": null
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru utilizator"]
}`;

    parts.push(prompt);
    parts.push({
      inlineData: {
        mimeType: selfieMimeType,
        data: selfieBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
  }

  try {
    const result = await model.generateContent(parts);

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        valid: false,
        confidence: 0,
        documentType: 'selfie',
        issues: ['Nu s-a putut analiza selfie-ul'],
        suggestions: ['Asigurați-vă că fața și documentul sunt vizibile clar'],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      valid: parsed.valid ?? false,
      confidence: parsed.confidence ?? 0,
      documentType: 'selfie',
      extractedData: parsed.extractedData,
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (error) {
    console.error('Selfie validation error:', error);
    return {
      valid: false,
      confidence: 0,
      documentType: 'selfie',
      issues: ['Eroare la validarea selfie-ului'],
      suggestions: ['Verificați conexiunea la internet și încercați din nou'],
    };
  }
}

/**
 * Validate a KYC document based on type
 */
export async function validateKYCDocument(
  request: KYCValidationRequest
): Promise<KYCValidationResult> {
  switch (request.documentType) {
    case 'ci_front':
      return validateCIFront(request.imageBase64, request.mimeType);
    case 'ci_back':
      return validateCIBack(request.imageBase64, request.mimeType);
    case 'selfie':
      return validateSelfie(
        request.imageBase64,
        request.mimeType,
        request.referenceImageBase64,
        request.referenceMimeType
      );
    default:
      return {
        valid: false,
        confidence: 0,
        documentType: 'unknown',
        issues: ['Tip de document necunoscut'],
        suggestions: ['Selectați un tip de document valid'],
      };
  }
}

/**
 * Comprehensive KYC validation - validates all documents together
 */
export async function validateCompleteKYC(
  ciFrontBase64: string,
  ciFrontMimeType: string,
  ciBackBase64: string,
  ciBackMimeType: string,
  selfieBase64: string,
  selfieMimeType: string
): Promise<{
  overall: boolean;
  ciFront: KYCValidationResult;
  ciBack: KYCValidationResult;
  selfie: KYCValidationResult;
  summary: string[];
}> {
  // Validate all documents in parallel
  const [ciFrontResult, ciBackResult, selfieResult] = await Promise.all([
    validateCIFront(ciFrontBase64, ciFrontMimeType),
    validateCIBack(ciBackBase64, ciBackMimeType),
    validateSelfie(selfieBase64, selfieMimeType, ciFrontBase64, ciFrontMimeType),
  ]);

  const summary: string[] = [];

  // Check overall validity
  const overall =
    ciFrontResult.valid &&
    ciBackResult.valid &&
    selfieResult.valid &&
    ciFrontResult.confidence >= 70 &&
    ciBackResult.confidence >= 70 &&
    selfieResult.confidence >= 70;

  if (!ciFrontResult.valid) {
    summary.push('Cartea de identitate (față) nu a trecut validarea');
  }
  if (!ciBackResult.valid) {
    summary.push('Cartea de identitate (verso) nu a trecut validarea');
  }
  if (!selfieResult.valid) {
    summary.push('Selfie-ul nu a trecut validarea');
  }
  if (selfieResult.extractedData?.faceMatch === false) {
    summary.push('Fața din selfie nu corespunde cu fotografia de pe document');
  }

  if (overall) {
    summary.push('Toate documentele au fost validate cu succes');
  }

  return {
    overall,
    ciFront: ciFrontResult,
    ciBack: ciBackResult,
    selfie: selfieResult,
    summary,
  };
}
