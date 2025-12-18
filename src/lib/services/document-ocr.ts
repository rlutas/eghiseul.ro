/**
 * Document OCR Service using Google Gemini 2.0 Flash Exp
 *
 * Extracts data from Romanian ID cards and passports using AI vision.
 * Supports:
 * - Carte de Identitate (CI) - front and back
 * - Passport (Romanian and other EU)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with the 2.0 Flash Experimental model for better OCR
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export type DocumentType = 'ci_front' | 'ci_back' | 'passport' | 'unknown';

export interface ExtractedPersonalData {
  // Personal info
  cnp?: string;
  lastName?: string;
  firstName?: string;
  birthDate?: string; // DD.MM.YYYY
  birthPlace?: string;
  gender?: 'male' | 'female';
  nationality?: string;

  // Document info
  documentType: DocumentType;
  series?: string;
  number?: string;
  issueDate?: string;
  expiryDate?: string;
  issuedBy?: string;

  // Address (from CI back)
  address?: {
    fullAddress?: string;
    county?: string;
    city?: string;
    sector?: string; // For București (1-6)
    street?: string;
    streetType?: string; // Strada/Bulevardul/Aleea/Calea
    number?: string;
    building?: string;
    staircase?: string; // Scara
    floor?: string; // Etaj
    apartment?: string;
    postalCode?: string;
  };
}

export interface OCRResult {
  success: boolean;
  documentType: DocumentType;
  confidence: number;
  extractedData: ExtractedPersonalData;
  rawText?: string;
  issues: string[];
  suggestions: string[];
}

/**
 * Extract data from a Romanian ID card (front side)
 * Supports both old format (pre-2009, address on front) and new format (post-2009)
 */
export async function extractFromCIFront(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  // Use gemini-2.0-flash-exp for better OCR capabilities
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analizează această imagine a unei cărți de identitate românești (față) și extrage TOATE datele vizibile.

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

Cărțile de identitate românești pot fi de 2 tipuri:
1. Format vechi (pre-2009): Are adresa de domiciliu pe FAȚĂ
2. Format nou (post-2009): Are adresa pe VERSO (spatele cardului)

Extrage TOATE datele vizibile:
- CNP (Cod Numeric Personal - 13 cifre)
- Nume (Last Name / Surname)
- Prenume (First Name / Given Names)
- Data nașterii (Birth Date în format DD.MM.YYYY)
- Locul nașterii (Birth Place)
- Seria documentului (2 litere, ex: SM, RD, IF)
- Numărul documentului (6 cifre)
- Data expirării (Expiry Date în format DD.MM.YYYY)
- Data emiterii (Issue Date în format DD.MM.YYYY) dacă e vizibilă
- Sex (M sau F)
- Cetățenia / Naționalitatea
- ADRESA de domiciliu (dacă apare pe față - la CI-urile vechi)
- MRZ (Machine Readable Zone) - cele 2-3 linii de text cu caractere speciale de la baza documentului

Pentru ADRESĂ (dacă există pe față), parsează în componente:
- Județul (fără "Jud.")
- Localitatea/Orașul (fără "Mun."/"Com.")
- Strada (fără "Str."/"Bd.")
- Număr, Bloc, Scară, Etaj, Apartament

Pentru MRZ, extrage textul complet din fiecare linie.

Analizează calitatea imaginii și identifică tipul de CI (vechi sau nou).

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "ci_front",
  "confidence": 0-100,
  "ciFormat": "old" sau "new",
  "extractedData": {
    "cnp": "string sau null",
    "lastName": "string sau null",
    "firstName": "string sau null",
    "birthDate": "DD.MM.YYYY sau null",
    "birthPlace": "string sau null",
    "gender": "male" sau "female" sau null,
    "nationality": "string sau null",
    "series": "string sau null (ex: SM)",
    "number": "string sau null (ex: 966197)",
    "issueDate": "DD.MM.YYYY sau null",
    "expiryDate": "DD.MM.YYYY sau null",
    "address": {
      "fullAddress": "adresa completă sau null",
      "county": "județ sau null",
      "city": "localitate sau null",
      "sector": "1-6 pentru București sau null",
      "street": "strada sau null",
      "streetType": "Strada/Bulevardul/Aleea sau null",
      "number": "număr sau null",
      "building": "bloc sau null",
      "staircase": "scară sau null",
      "floor": "etaj sau null",
      "apartment": "apartament sau null"
    },
    "mrz": {
      "line1": "prima linie MRZ sau null",
      "line2": "a doua linie MRZ sau null",
      "line3": "a treia linie MRZ sau null (dacă există)"
    }
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru îmbunătățire"]
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
      return createErrorResult('ci_front', 'Nu s-a putut procesa documentul');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: parsed.success ?? false,
      documentType: 'ci_front',
      confidence: parsed.confidence ?? 0,
      extractedData: {
        ...parsed.extractedData,
        documentType: 'ci_front',
      },
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (error) {
    console.error('CI Front OCR error:', error);
    return createErrorResult('ci_front', 'Eroare la procesarea documentului');
  }
}

/**
 * Extract data from a Romanian ID card (back side)
 */
export async function extractFromCIBack(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analizează această imagine a unei cărți de identitate românești (verso/spate) și extrage adresa de domiciliu.

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

Formatul adresei pe buletinele românești poate fi:
- Urban: "Jud. CLUJ, Mun. CLUJ-NAPOCA, Str. MIHAI EMINESCU, Nr. 10, Bl. A1, Sc. 2, Et. 3, Ap. 15"
- Rural: "Jud. IAȘI, Com. REDIU, Sat BREAZU, Nr. 125"
- Simplificat: "BUCUREȘTI, Sect. 1, Bd. MAGHERU, Nr. 5, Ap. 10"

Abrevieri comune:
- Jud. = Județ
- Mun. = Municipiu
- Com. = Comună
- Sat = Sat
- Str. = Strada
- Bd. / Bld. = Bulevardul
- Ale. = Aleea
- Nr. = Număr
- Bl. = Bloc
- Sc. = Scara
- Et. = Etaj
- Ap. = Apartament
- Sect. = Sector (doar București)

Extrage și parsează adresa în componente separate. Pentru București, județul este "București".

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "ci_back",
  "confidence": 0-100,
  "extractedData": {
    "issueDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null",
    "address": {
      "fullAddress": "adresa completă exact cum apare pe document",
      "county": "numele județului fără 'Jud.' (ex: Cluj, București, Iași)",
      "city": "localitatea/municipiul/comuna fără 'Mun.'/'Com.' (ex: Cluj-Napoca, Rediu)",
      "sector": "1-6 doar pentru București, altfel null",
      "street": "numele străzii fără 'Str.'/'Bd.'/'Ale.' (ex: Mihai Eminescu)",
      "streetType": "Strada/Bulevardul/Aleea/Calea etc.",
      "number": "numărul (ex: 10, 125-A)",
      "building": "blocul fără 'Bl.' (ex: A1, M5)",
      "staircase": "scara fără 'Sc.' (ex: A, 1, 2)",
      "floor": "etajul fără 'Et.' (ex: 3, P, M)",
      "apartment": "apartamentul fără 'Ap.' (ex: 15, 102)",
      "postalCode": "codul poștal 6 cifre dacă este vizibil, altfel null"
    }
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru îmbunătățire"]
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
      return createErrorResult('ci_back', 'Nu s-a putut procesa documentul');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: parsed.success ?? false,
      documentType: 'ci_back',
      confidence: parsed.confidence ?? 0,
      extractedData: {
        ...parsed.extractedData,
        documentType: 'ci_back',
      },
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (error) {
    console.error('CI Back OCR error:', error);
    return createErrorResult('ci_back', 'Eroare la procesarea documentului');
  }
}

/**
 * Extract data from a passport
 */
export async function extractFromPassport(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analizează această imagine a unui pașaport și extrage toate datele vizibile.

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

Extrage următoarele date:
- Nume complet (Surname / Nom)
- Prenume (Given Names / Prénoms)
- Data nașterii (Date of Birth)
- Locul nașterii (Place of Birth)
- Sex (Sex)
- Cetățenia (Nationality)
- Numărul pașaportului
- Data emiterii (Date of Issue)
- Data expirării (Date of Expiry)
- CNP (dacă este pașaport românesc - se găsește în zona MRZ sau separat)

Verifică și zona MRZ (Machine Readable Zone) de la baza paginii dacă este vizibilă.

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "passport",
  "confidence": 0-100,
  "extractedData": {
    "cnp": "string sau null (doar pentru pașaport românesc)",
    "lastName": "string sau null",
    "firstName": "string sau null",
    "birthDate": "DD.MM.YYYY sau null",
    "birthPlace": "string sau null",
    "gender": "male" sau "female" sau null,
    "nationality": "string sau null",
    "number": "numărul pașaportului sau null",
    "issueDate": "DD.MM.YYYY sau null",
    "expiryDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null"
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru îmbunătățire"]
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
      return createErrorResult('passport', 'Nu s-a putut procesa documentul');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: parsed.success ?? false,
      documentType: 'passport',
      confidence: parsed.confidence ?? 0,
      extractedData: {
        ...parsed.extractedData,
        documentType: 'passport',
      },
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (error) {
    console.error('Passport OCR error:', error);
    return createErrorResult('passport', 'Eroare la procesarea documentului');
  }
}

/**
 * Auto-detect document type and extract data
 */
export async function extractFromDocument(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const detectPrompt = `Analizează această imagine și determină ce tip de document este.

IMPORTANT: Răspunde DOAR cu unul din aceste cuvinte:
- "ci_front" - dacă este fața unei cărți de identitate românești
- "ci_back" - dacă este spatele unei cărți de identitate românești
- "passport" - dacă este un pașaport (orice țară)
- "unknown" - dacă nu poți determina tipul

Răspunde cu UN SINGUR CUVÂNT.`;

  try {
    // First, detect document type
    const detectResult = await model.generateContent([
      detectPrompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const detectResponse = await detectResult.response;
    const detectedType = detectResponse.text().toLowerCase().trim() as DocumentType;

    // Extract data based on detected type
    switch (detectedType) {
      case 'ci_front':
        return extractFromCIFront(imageBase64, mimeType);
      case 'ci_back':
        return extractFromCIBack(imageBase64, mimeType);
      case 'passport':
        return extractFromPassport(imageBase64, mimeType);
      default:
        return {
          success: false,
          documentType: 'unknown',
          confidence: 0,
          extractedData: { documentType: 'unknown' },
          issues: ['Nu s-a putut determina tipul documentului'],
          suggestions: [
            'Încărcați o fotografie clară a cărții de identitate (față sau verso) sau a pașaportului',
          ],
        };
    }
  } catch (error) {
    console.error('Document detection error:', error);
    return createErrorResult('unknown', 'Eroare la detectarea tipului de document');
  }
}

/**
 * Combined extraction from both CI front and back
 */
export async function extractFromCIBothSides(
  frontImageBase64: string,
  frontMimeType: string,
  backImageBase64: string,
  backMimeType: string
): Promise<{
  success: boolean;
  confidence: number;
  extractedData: ExtractedPersonalData;
  issues: string[];
  suggestions: string[];
}> {
  // Process both sides in parallel
  const [frontResult, backResult] = await Promise.all([
    extractFromCIFront(frontImageBase64, frontMimeType),
    extractFromCIBack(backImageBase64, backMimeType),
  ]);

  // Merge the results
  const mergedData: ExtractedPersonalData = {
    documentType: 'ci_front',
    // From front
    cnp: frontResult.extractedData.cnp,
    lastName: frontResult.extractedData.lastName,
    firstName: frontResult.extractedData.firstName,
    birthDate: frontResult.extractedData.birthDate,
    birthPlace: frontResult.extractedData.birthPlace,
    gender: frontResult.extractedData.gender,
    nationality: frontResult.extractedData.nationality,
    series: frontResult.extractedData.series,
    number: frontResult.extractedData.number,
    expiryDate: frontResult.extractedData.expiryDate,
    // From back
    issueDate: backResult.extractedData.issueDate,
    issuedBy: backResult.extractedData.issuedBy,
    address: backResult.extractedData.address,
  };

  const allIssues = [...frontResult.issues, ...backResult.issues];
  const allSuggestions = [...frontResult.suggestions, ...backResult.suggestions];

  return {
    success: frontResult.success && backResult.success,
    confidence: Math.min(frontResult.confidence, backResult.confidence),
    extractedData: mergedData,
    issues: [...new Set(allIssues)], // Remove duplicates
    suggestions: [...new Set(allSuggestions)],
  };
}

/**
 * Helper to create error result
 */
function createErrorResult(documentType: DocumentType, message: string): OCRResult {
  return {
    success: false,
    documentType,
    confidence: 0,
    extractedData: { documentType },
    issues: [message],
    suggestions: ['Verificați conexiunea și încercați din nou'],
  };
}

/**
 * Convert extracted date format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
 */
export function convertDateToISO(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;

  // Handle DD.MM.YYYY format
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return undefined;
}
