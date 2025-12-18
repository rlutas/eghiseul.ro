# OCR and KYC AI API Documentation

## Overview

The eghiseul.ro platform provides two integrated AI-powered APIs for identity verification:

1. **OCR API** - Optical Character Recognition for extracting data from identity documents
2. **KYC API** - Know Your Customer validation for document authenticity and face matching

Both APIs use Google Gemini AI models for vision-based analysis and are designed to support the complete identity verification workflow in the order wizard.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│            (Order Wizard - Step 4: KYC)                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────────────┐
                 │                                         │
       ┌─────────▼──────────┐              ┌──────────────▼──────┐
       │ OCR API Endpoint   │              │ KYC API Endpoint    │
       │  /api/ocr/extract  │              │ /api/kyc/validate   │
       └─────────┬──────────┘              └──────────────┬──────┘
                 │                                        │
       ┌─────────▼──────────────────────────────────────┬┘
       │                                                │
       │          Google Gemini AI Models              │
       │  ┌──────────────────────────────────────┐   │
       │  │ Gemini 2.0 Flash Exp (OCR)           │   │
       │  │ - Document type detection            │   │
       │  │ - Data extraction                    │   │
       │  │ - Address parsing                    │   │
       │  └──────────────────────────────────────┘   │
       │  ┌──────────────────────────────────────┐   │
       │  │ Gemini 1.5 Flash (KYC Validation)    │   │
       │  │ - Document quality assessment        │   │
       │  │ - Face matching                      │   │
       │  │ - Tampering detection                │   │
       │  └──────────────────────────────────────┘   │
       │                                              │
       └──────────────────────────────────────────────┘
```

## Authentication

Both APIs use **API Key authentication via environment variables**. The server-side implementation validates the presence of `GOOGLE_AI_API_KEY` before processing requests.

### Configuration

```bash
# Required in .env.local
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### Health Check

Both endpoints provide a GET endpoint for health checks:

- `GET /api/ocr/extract`
- `GET /api/kyc/validate`

Returns status and capabilities information.

---

# OCR API

## Endpoint: POST /api/ocr/extract

Extracts data from identity documents using Google Gemini 2.0 Flash Exp AI vision capabilities.

### HTTP Details

- **Method**: `POST`
- **Content-Type**: `application/json`
- **Timeout**: 60 seconds
- **Runtime**: Node.js

### Authentication

No explicit authentication required. Server validates `GOOGLE_AI_API_KEY` environment variable.

### Request Modes

The OCR API supports three extraction modes:

#### 1. Auto-Detect Mode

Automatically detects document type and extracts data accordingly.

**Request Schema**:

```typescript
{
  mode: 'auto',
  imageBase64: string,
  mimeType: string
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Must be `'auto'` |
| `imageBase64` | string | Yes | Base64-encoded image data (without data URI prefix) |
| `mimeType` | string | Yes | MIME type of the image (e.g., `'image/jpeg'`, `'image/png'`) |

**Example Request**:

```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "auto",
    "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
    "mimeType": "image/jpeg"
  }'
```

#### 2. Specific Document Type Mode

Extracts data from a specific document type for optimized results.

**Request Schema**:

```typescript
{
  mode: 'specific',
  documentType: 'ci_front' | 'ci_back' | 'passport',
  imageBase64: string,
  mimeType: string
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Must be `'specific'` |
| `documentType` | string | Yes | Document type: `ci_front` (ID front), `ci_back` (ID back), or `passport` |
| `imageBase64` | string | Yes | Base64-encoded image data |
| `mimeType` | string | Yes | MIME type of the image |

**Supported Document Types**:

- `ci_front` - Romanian ID card (Carte de Identitate) - front side
- `ci_back` - Romanian ID card - back side (address side)
- `passport` - Any EU passport (Romanian or other nationalities)

**Example Request**:

```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "specific",
    "documentType": "ci_front",
    "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
    "mimeType": "image/jpeg"
  }'
```

#### 3. Complete CI (Both Sides) Mode

Extracts data from both sides of a Romanian ID card and merges the results.

**Request Schema**:

```typescript
{
  mode: 'ci_complete',
  front: { imageBase64: string, mimeType: string },
  back: { imageBase64: string, mimeType: string }
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Must be `'ci_complete'` |
| `front.imageBase64` | string | Yes | Base64-encoded front side image |
| `front.mimeType` | string | Yes | MIME type of front image |
| `back.imageBase64` | string | Yes | Base64-encoded back side image |
| `back.mimeType` | string | Yes | MIME type of back image |

**Example Request**:

```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ci_complete",
    "front": {
      "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
      "mimeType": "image/jpeg"
    },
    "back": {
      "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
      "mimeType": "image/jpeg"
    }
  }'
```

### Response Schema

**Success Response (HTTP 200)**:

```typescript
{
  success: true,
  data: {
    ocr: {
      success: boolean,
      documentType: 'ci_front' | 'ci_back' | 'passport' | 'unknown',
      confidence: number,                    // 0-100
      extractedData: {
        // Personal info (from ci_front / passport)
        cnp?: string,                        // 13-digit Romanian ID number
        lastName?: string,
        firstName?: string,
        birthDate?: string,                  // Format: DD.MM.YYYY
        birthPlace?: string,
        gender?: 'male' | 'female',
        nationality?: string,

        // Document info
        documentType: 'ci_front' | 'ci_back' | 'passport' | 'unknown',
        series?: string,                     // e.g., "RD"
        number?: string,                     // e.g., "123456"
        issueDate?: string,                  // Format: DD.MM.YYYY
        expiryDate?: string,                 // Format: DD.MM.YYYY
        issuedBy?: string,

        // Address (from ci_back)
        address?: {
          fullAddress?: string,
          county?: string,                   // e.g., "Cluj" (without "Jud.")
          city?: string,                     // e.g., "Cluj-Napoca"
          sector?: string,                   // 1-6 for București only
          street?: string,                   // e.g., "Mihai Eminescu"
          streetType?: string,               // "Strada", "Bulevardul", "Aleea", "Calea"
          number?: string,                   // e.g., "10", "125-A"
          building?: string,                 // e.g., "A1", "M5"
          staircase?: string,                // "Scara" - e.g., "A", "1"
          floor?: string,                    // "Etaj" - e.g., "3", "P", "M"
          apartment?: string,                // "Ap." - e.g., "15"
          postalCode?: string                // 6-digit postal code
        }
      },
      rawText?: string,
      issues: string[],                      // Problems detected
      suggestions: string[]                  // Improvement suggestions
    },
    timestamp: string                        // ISO 8601 timestamp
  }
}
```

**Example Success Response**:

```json
{
  "success": true,
  "data": {
    "ocr": {
      "success": true,
      "documentType": "ci_front",
      "confidence": 95,
      "extractedData": {
        "cnp": "1850623123456",
        "lastName": "POPESCU",
        "firstName": "ION",
        "birthDate": "23.06.1985",
        "birthPlace": "BUCUREȘTI",
        "gender": "male",
        "nationality": "ROMÂNĂ",
        "series": "RD",
        "number": "123456",
        "expiryDate": "15.03.2030",
        "documentType": "ci_front"
      },
      "issues": [],
      "suggestions": []
    },
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Error Responses

**Invalid Request (HTTP 400)**:

```json
{
  "error": "Invalid request",
  "message": "Mode is required (auto, specific, or ci_complete)"
}
```

**Service Not Configured (HTTP 503)**:

```json
{
  "error": "OCR service not configured",
  "message": "Google AI API key is missing"
}
```

**Server Error (HTTP 500)**:

```json
{
  "error": "Internal server error",
  "message": "Error details from the AI service"
}
```

### Romanian Address Format Parsing

The OCR API includes sophisticated parsing for Romanian address formats. Common abbreviations:

| Abbreviation | Full Form | Example |
|--------------|-----------|---------|
| Jud. | Județ (County) | Jud. Cluj |
| Mun. | Municipiu (Municipality) | Mun. Cluj-Napoca |
| Com. | Comună (Commune) | Com. Rediu |
| Sat | Village | Sat Breazu |
| Str. | Strada (Street) | Str. Mihai Eminescu |
| Bd./Bld. | Bulevardul (Boulevard) | Bd. Magheru |
| Ale. | Aleea (Alley) | Ale. Movilei |
| Calea | Way | Calea Victoriei |
| Nr. | Număr (Number) | Nr. 10 |
| Bl. | Bloc (Building) | Bl. A1 |
| Sc. | Scara (Staircase) | Sc. 2 |
| Et. | Etaj (Floor) | Et. 3 |
| Ap. | Apartament (Apartment) | Ap. 15 |
| Sect. | Sector (District, București only) | Sect. 1 |

**Address Format Examples**:

- **Urban (Bucharest)**: "BUCUREȘTI, Sect. 1, Bd. MAGHERU, Nr. 5, Ap. 10"
- **Urban (City)**: "Jud. CLUJ, Mun. CLUJ-NAPOCA, Str. MIHAI EMINESCU, Nr. 10, Bl. A1, Sc. 2, Et. 3, Ap. 15"
- **Rural**: "Jud. IAȘI, Com. REDIU, Sat BREAZU, Nr. 125"

### Health Check

**Request**:

```bash
GET /api/ocr/extract
```

**Response (HTTP 200)**:

```json
{
  "status": "ready",
  "service": "Document OCR",
  "provider": "Google Gemini 2.0 Flash Exp",
  "supportedDocuments": ["ci_front", "ci_back", "passport"],
  "features": [
    "Auto-detect document type",
    "Extract personal data (CNP, name, birth date, etc.)",
    "Extract address from CI back",
    "Support for Romanian ID cards and passports"
  ],
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

# KYC API

## Endpoint: POST /api/kyc/validate

Validates identity documents and performs Know Your Customer checks including face matching and tampering detection using Google Gemini 1.5 Flash.

### HTTP Details

- **Method**: `POST`
- **Content-Type**: `application/json`
- **Timeout**: 60 seconds
- **Runtime**: Node.js

### Authentication

No explicit authentication required. Server validates `GOOGLE_AI_API_KEY` environment variable.

### Request Modes

The KYC API supports two validation modes:

#### 1. Single Document Validation

Validates a single document (ID front, ID back, or selfie) with optional face matching.

**Request Schema**:

```typescript
{
  mode: 'single',
  documentType: 'ci_front' | 'ci_back' | 'selfie',
  imageBase64: string,
  mimeType: string,
  referenceImageBase64?: string,    // For face matching with selfie
  referenceMimeType?: string
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Must be `'single'` |
| `documentType` | string | Yes | Document type: `ci_front`, `ci_back`, or `selfie` |
| `imageBase64` | string | Yes | Base64-encoded image data |
| `mimeType` | string | Yes | MIME type of the image |
| `referenceImageBase64` | string | No | Reference image for face matching (use CI front when validating selfie) |
| `referenceMimeType` | string | No | MIME type of reference image |

**Supported Document Types**:

- `ci_front` - Romanian ID card front side (quality check only)
- `ci_back` - Romanian ID card back side (address visibility check)
- `selfie` - Selfie with ID document (face matching if reference provided)

**Example: Validate CI Front**:

```bash
curl -X POST http://localhost:3000/api/kyc/validate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "documentType": "ci_front",
    "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
    "mimeType": "image/jpeg"
  }'
```

**Example: Validate Selfie with Face Matching**:

```bash
curl -X POST http://localhost:3000/api/kyc/validate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "documentType": "selfie",
    "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
    "mimeType": "image/jpeg",
    "referenceImageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
    "referenceMimeType": "image/jpeg"
  }'
```

#### 2. Complete KYC Validation

Validates all three documents together (CI front, CI back, and selfie) and performs comprehensive KYC checks.

**Request Schema**:

```typescript
{
  mode: 'complete',
  ciFront: { imageBase64: string, mimeType: string },
  ciBack: { imageBase64: string, mimeType: string },
  selfie: { imageBase64: string, mimeType: string }
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Must be `'complete'` |
| `ciFront.imageBase64` | string | Yes | Base64-encoded CI front image |
| `ciFront.mimeType` | string | Yes | MIME type of CI front image |
| `ciBack.imageBase64` | string | Yes | Base64-encoded CI back image |
| `ciBack.mimeType` | string | Yes | MIME type of CI back image |
| `selfie.imageBase64` | string | Yes | Base64-encoded selfie image |
| `selfie.mimeType` | string | Yes | MIME type of selfie image |

**Example Request**:

```bash
curl -X POST http://localhost:3000/api/kyc/validate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "complete",
    "ciFront": {
      "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
      "mimeType": "image/jpeg"
    },
    "ciBack": {
      "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
      "mimeType": "image/jpeg"
    },
    "selfie": {
      "imageBase64": "/9j/4AAQSkZJRgABAQEAYABg...",
      "mimeType": "image/jpeg"
    }
  }'
```

### Response Schema

**Success Response (HTTP 200)**:

```typescript
{
  success: true,
  data: {
    validation: {
      // For single document mode:
      valid: boolean,
      confidence: number,                    // 0-100
      documentType: 'ci_front' | 'ci_back' | 'selfie' | 'passport' | 'unknown',
      extractedData?: {
        // CI Front / Passport data
        cnp?: string,
        lastName?: string,
        firstName?: string,
        birthDate?: string,                  // DD.MM.YYYY
        expiryDate?: string,                 // DD.MM.YYYY
        series?: string,
        number?: string,

        // CI Back data
        address?: string,
        issueDate?: string,                  // DD.MM.YYYY
        issuedBy?: string,

        // Selfie data
        faceMatch?: boolean,                 // true if face matches reference
        faceMatchConfidence?: number         // 0-100
      },
      issues: string[],
      suggestions: string[],

      // For complete mode (also includes):
      overall?: boolean,
      ciFront?: KYCValidationResult,
      ciBack?: KYCValidationResult,
      selfie?: KYCValidationResult,
      summary?: string[]
    },
    timestamp: string                        // ISO 8601 timestamp
  }
}
```

**Example: Single Document Response**:

```json
{
  "success": true,
  "data": {
    "validation": {
      "valid": true,
      "confidence": 92,
      "documentType": "ci_front",
      "extractedData": {
        "cnp": "1850623123456",
        "lastName": "POPESCU",
        "firstName": "ION",
        "birthDate": "23.06.1985",
        "expiryDate": "15.03.2030",
        "series": "RD",
        "number": "123456"
      },
      "issues": [],
      "suggestions": ["Document is clear and readable"]
    },
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

**Example: Complete KYC Response**:

```json
{
  "success": true,
  "data": {
    "validation": {
      "overall": true,
      "ciFront": {
        "valid": true,
        "confidence": 94,
        "documentType": "ci_front",
        "issues": [],
        "suggestions": []
      },
      "ciBack": {
        "valid": true,
        "confidence": 90,
        "documentType": "ci_back",
        "issues": [],
        "suggestions": []
      },
      "selfie": {
        "valid": true,
        "confidence": 88,
        "documentType": "selfie",
        "extractedData": {
          "faceMatch": true,
          "faceMatchConfidence": 96
        },
        "issues": [],
        "suggestions": []
      },
      "summary": [
        "Toate documentele au fost validate cu succes"
      ]
    },
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Validation Checks

The KYC API performs the following checks:

**CI Front Validation**:
- Is a valid Romanian ID card (front side)?
- Image quality and clarity
- All fields are visible and readable
- No signs of forgery or tampering
- Expiry date is in the future

**CI Back Validation**:
- Is a valid Romanian ID card (back side)?
- Address is clearly visible
- All security features intact
- No signs of tampering

**Selfie Validation**:
- Person is holding a valid ID document
- Face is clearly visible
- Face matches the ID document photo (if reference provided)
- No signs of manipulation or deepfake

### Confidence Scores

The API returns confidence scores (0-100) indicating the certainty level of validations:

- **90-100**: Excellent, clear, and definitive
- **70-89**: Good, readable with minor issues
- **50-69**: Fair, readable but with clarity concerns
- **Below 50**: Poor, difficult to process

Recommendations:
- Accept documents with confidence >= 70
- Request resubmission for documents with confidence < 70

### Error Responses

**Invalid Request (HTTP 400)**:

```json
{
  "error": "Invalid request",
  "message": "Mode is required (single or complete)"
}
```

**Missing Required Images (HTTP 400)**:

```json
{
  "error": "Invalid request",
  "message": "CI front image is required"
}
```

**Service Not Configured (HTTP 503)**:

```json
{
  "error": "KYC validation service not configured",
  "message": "Google AI API key is missing"
}
```

**Server Error (HTTP 500)**:

```json
{
  "error": "Internal server error",
  "message": "Error details from the AI service"
}
```

### Health Check

**Request**:

```bash
GET /api/kyc/validate
```

**Response (HTTP 200)**:

```json
{
  "status": "ready",
  "service": "KYC Document Validation",
  "provider": "Google Gemini AI",
  "supportedDocuments": ["ci_front", "ci_back", "selfie"],
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

# AI Models Used

## Gemini 2.0 Flash Exp (OCR)

**Model ID**: `gemini-2.0-flash-exp`

**Purpose**: Document OCR and data extraction

**Capabilities**:
- Document type detection
- Text recognition from ID documents
- Address component parsing
- Data validation and confidence scoring
- Multi-document correlation (CI front + back)

**Strengths**:
- Fast inference (optimized for speed)
- Excellent at handling Romanian-specific formats
- Handles multiple document types
- Good at parsing structured address data

**Cost**: Lower cost per token due to Flash model

## Gemini 1.5 Flash (KYC Validation)

**Model ID**: `gemini-1.5-flash`

**Purpose**: Document quality validation and face matching

**Capabilities**:
- Document authenticity assessment
- Tampering detection
- Face recognition and matching
- Multi-image analysis
- Quality and clarity assessment

**Strengths**:
- Better at visual quality assessment
- Accurate face matching across images
- Robust against manipulated images
- Handles edge cases well

**Cost**: Moderate cost for comprehensive validation

---

# Integration Examples

## Frontend Integration

### React Hook for Image Capture

```typescript
import { useRef, useState } from 'react';

interface OCRResult {
  success: boolean;
  extractedData: {
    cnp?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    address?: {
      county?: string;
      city?: string;
      street?: string;
      number?: string;
    };
  };
}

function DocumentCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);

  const captureAndExtract = async (documentType: string) => {
    if (!canvasRef.current || !videoRef.current) return;

    setLoading(true);

    // Capture frame from camera
    const context = canvasRef.current.getContext('2d');
    context?.drawImage(videoRef.current, 0, 0);

    // Convert to base64
    const imageBase64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    try {
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'specific',
          documentType,
          imageBase64,
          mimeType: 'image/jpeg',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExtractedData(result.data.ocr);
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={() => captureAndExtract('ci_front')}>
        Capture Front
      </button>
      {loading && <p>Processing...</p>}
      {extractedData && <pre>{JSON.stringify(extractedData, null, 2)}</pre>}
    </div>
  );
}
```

### React Hook for KYC Validation

```typescript
import { useState } from 'react';

interface KYCResult {
  valid: boolean;
  confidence: number;
  documentType: string;
  extractedData?: {
    faceMatch?: boolean;
    faceMatchConfidence?: number;
  };
  issues: string[];
  suggestions: string[];
}

function KYCValidator() {
  const [kycResult, setKycResult] = useState<KYCResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validateCompleteKYC = async (
    ciFrontBase64: string,
    ciBackBase64: string,
    selfieBase64: string
  ) => {
    setLoading(true);

    try {
      const response = await fetch('/api/kyc/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'complete',
          ciFront: { imageBase64: ciFrontBase64, mimeType: 'image/jpeg' },
          ciBack: { imageBase64: ciBackBase64, mimeType: 'image/jpeg' },
          selfie: { imageBase64: selfieBase64, mimeType: 'image/jpeg' },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setKycResult(result.data.validation);

        if (result.data.validation.overall) {
          console.log('KYC validation passed');
        } else {
          console.error('KYC validation failed:', result.data.validation.summary);
        }
      }
    } catch (error) {
      console.error('KYC validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Validating documents...</p>}
      {kycResult && (
        <div>
          <h3>KYC Result: {kycResult.valid ? 'PASSED' : 'FAILED'}</h3>
          <p>Overall Confidence: {kycResult.confidence}%</p>
          {kycResult.issues.length > 0 && (
            <div>
              <h4>Issues:</h4>
              <ul>
                {kycResult.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### File Upload to Base64

```typescript
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

// Usage
const file = event.target.files?.[0];
if (file) {
  const base64 = await fileToBase64(file);
  // Use base64 in API request
}
```

## Complete Order Wizard Flow

```typescript
// Step 4: KYC Document Upload
async function processKYCStep(documents: {
  ciFront: File;
  ciBack: File;
  selfie: File;
}) {
  // Step 1: Extract data from CI front for auto-fill
  const ciFrontBase64 = await fileToBase64(documents.ciFront);
  const ocrResponse = await fetch('/api/ocr/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'specific',
      documentType: 'ci_front',
      imageBase64: ciFrontBase64,
      mimeType: documents.ciFront.type,
    }),
  });

  const ocrData = await ocrResponse.json();

  // Auto-fill personal data from OCR
  if (ocrData.success) {
    updatePersonalData({
      cnp: ocrData.data.ocr.extractedData.cnp,
      first_name: ocrData.data.ocr.extractedData.firstName,
      last_name: ocrData.data.ocr.extractedData.lastName,
      birth_date: ocrData.data.ocr.extractedData.birthDate,
    });
  }

  // Step 2: Validate all documents
  const ciBackBase64 = await fileToBase64(documents.ciBack);
  const selfieBase64 = await fileToBase64(documents.selfie);

  const kycResponse = await fetch('/api/kyc/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'complete',
      ciFront: { imageBase64: ciFrontBase64, mimeType: documents.ciFront.type },
      ciBack: { imageBase64: ciBackBase64, mimeType: documents.ciBack.type },
      selfie: { imageBase64: selfieBase64, mimeType: documents.selfie.type },
    }),
  });

  const kycResult = await kycResponse.json();

  // Check if validation passed
  if (kycResult.success && kycResult.data.validation.overall) {
    // Proceed to next step
    moveToNextStep();
  } else {
    // Show errors and request resubmission
    showErrors(kycResult.data.validation.summary);
  }
}
```

## Error Handling Best Practices

```typescript
async function robustOCRExtraction(
  imageBase64: string,
  documentType: string,
  maxRetries: number = 2
): Promise<OCRResult | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'specific',
          documentType,
          imageBase64,
          mimeType: 'image/jpeg',
        }),
      });

      // Check if service is configured
      if (response.status === 503) {
        console.error('OCR service not configured');
        return null;
      }

      // Check for bad request
      if (response.status === 400) {
        console.error('Invalid request to OCR service');
        return null;
      }

      const result = await response.json();

      if (result.success && result.data.ocr.confidence >= 70) {
        return result.data.ocr;
      }

      if (attempt < maxRetries) {
        console.warn(
          `Attempt ${attempt} failed (confidence: ${result.data.ocr.confidence}). Retrying...`
        );
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Low confidence after all retries
      if (result.data.ocr.confidence < 70) {
        console.warn(
          'Low confidence extraction. User should re-capture document.'
        );
        return null;
      }
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn('Network error, retrying...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      console.error('OCR extraction failed after retries:', error);
      return null;
    }
  }

  return null;
}
```

---

# Base64 Image Format Requirements

## Encoding Standards

- **Format**: Base64-encoded image without data URI prefix
- **Accepted MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Recommended**: `image/jpeg` for file size optimization

## Size Recommendations

| Specification | Value |
|---------------|-------|
| Maximum file size | 20 MB |
| Minimum resolution | 480x320 pixels |
| Recommended resolution | 1920x1080 or higher |
| Quality for JPEGs | 75-85% |

## Optimal Image Characteristics

**For Document Photos**:
- Well-lit, minimal glare and shadows
- Document fills 70-80% of frame
- Straight-on angle (not tilted)
- All four corners visible
- No fingers or objects covering text
- Color accuracy (not too filtered)

**For Selfies**:
- Good lighting on face
- Face fills 40-50% of frame
- Document clearly visible next to face
- No glasses or sunglasses
- Natural expression
- No filters or heavy makeup

---

# Typical Integration Flow Diagram

```
User in Order Wizard
    │
    ├─► Step 1: Contact Information
    │
    ├─► Step 2: Personal Data
    │
    ├─► Step 3: Service Options
    │
    ├─► Step 4: KYC Documents ◄─── THIS USES OCR & KYC APIs
    │   │
    │   ├─► Capture/Upload CI Front
    │   │   └─► POST /api/ocr/extract (auto-detect)
    │   │       └─► Extract: CNP, Name, Birth Date
    │   │       └─► Auto-fill Step 2 if not already filled
    │   │
    │   ├─► Capture/Upload CI Back
    │   │   └─► POST /api/ocr/extract (specific: ci_back)
    │   │       └─► Extract: Address components
    │   │
    │   ├─► Capture/Upload Selfie with ID
    │   │   └─► POST /api/ocr/extract (auto-detect)
    │   │       └─► Confirm document type
    │   │
    │   └─► Validate All Documents
    │       └─► POST /api/kyc/validate (mode: complete)
    │           ├─► Check CI Front validity
    │           ├─► Check CI Back validity
    │           ├─► Match Selfie face to CI photo
    │           └─► Return overall KYC result
    │
    ├─► Step 5: Delivery & Signature
    │
    └─► Step 6: Review & Submit Order
        └─► Order status becomes: pending → paid → processing → kyc_approved → in_progress → completed
```

---

# Troubleshooting Guide

## Common Issues and Solutions

### OCR Extraction Fails

**Problem**: Low confidence or empty extraction results

**Solutions**:
1. Improve image quality:
   - Better lighting (use natural light when possible)
   - Increase resolution or zoom in closer
   - Remove glare and shadows
   - Ensure document is straight

2. Retry with specific document type mode instead of auto-detect

3. Check if image includes all document elements:
   - Full document visible
   - No parts cut off
   - All security features visible

### Face Matching Fails

**Problem**: "faceMatch: false" or low faceMatchConfidence

**Solutions**:
1. Ensure selfie shows:
   - Clear frontal face view
   - Document held next to face
   - Good lighting on face
   - Natural expression

2. Verify CI photo:
   - Good quality photo on document
   - Photo not damaged

3. For elderly or changed appearance:
   - Ensure recent photo on document
   - Multiple attempts may be needed

### Low Confidence Scores

**Problem**: Confidence < 70%

**Solutions**:
1. Document is worn, damaged, or expired
2. Poor image quality or lighting
3. Document partially visible
4. Request user to re-capture with better conditions
5. If document is legitimately hard to read, may need manual verification

### Service Not Configured

**Problem**: "KYC validation service not configured"

**Solutions**:
1. Verify `GOOGLE_AI_API_KEY` is set in environment
2. Check that the key is valid for Google Gemini API
3. Ensure API is enabled in Google Cloud Console

### Timeout Errors

**Problem**: Request times out after 60 seconds

**Solutions**:
1. Network connectivity issue - check internet connection
2. Large image file - compress before sending
3. AI service is slow - retry with smaller or higher quality image
4. Check server logs for detailed error messages

---

# Performance Optimization

## Request Optimization

1. **Image Compression**:
   - Compress images to 50-100 KB for faster upload
   - Maintain minimum 480x320 resolution
   - Use JPEG format for better compression

2. **Batch Processing**:
   - For complete KYC, all three documents are processed in parallel
   - Use `mode: complete` instead of three separate single requests

3. **Caching Strategy**:
   - Cache extracted data on client until user confirms
   - Avoid re-submitting same images

## Monitoring and Logging

```typescript
// Log extraction metrics
const logExtractionMetrics = (result: OCRResult) => {
  console.log({
    documentType: result.documentType,
    confidence: result.confidence,
    processingTime: Date.now() - startTime,
    fieldsExtracted: Object.keys(result.extractedData).length,
    issues: result.issues.length,
  });
};
```

---

# API Rate Limiting

Currently, no rate limiting is implemented on the server side. Consider implementing the following in production:

- **Per user**: 100 requests per hour
- **Per IP**: 1000 requests per hour
- **Burst limit**: 10 requests per minute

---

# Security Considerations

1. **Data Handling**:
   - All image data is sent to Google Gemini API for processing
   - Images are not stored on eghiseul.ro servers (they're processed in-memory)
   - Use HTTPS for all API calls

2. **API Keys**:
   - Keep `GOOGLE_AI_API_KEY` confidential
   - Use environment variables, never hardcode
   - Rotate keys periodically

3. **Input Validation**:
   - Validate MIME types on client and server
   - Validate image size before upload
   - Validate Base64 encoding format

4. **Response Security**:
   - Don't expose raw extracted data in sensitive contexts
   - Validate extracted data before using in business logic
   - Log validation results for audit trails

---

# Additional Resources

## Related Documentation
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Order Wizard Documentation](../services-api.md)
- [KYC Compliance Guide](../../legal/compliance-research.md)

## API Response Types (TypeScript)

See `/src/types/orders.ts` for complete type definitions:
- `KYCValidationResult`
- `ExtractedAddressData`
- `KYCDocuments`
- `DocumentUpload`

## Implementation Files
- Endpoint: `/src/app/api/ocr/extract/route.ts`
- Endpoint: `/src/app/api/kyc/validate/route.ts`
- Service: `/src/lib/services/document-ocr.ts`
- Service: `/src/lib/services/kyc-validation.ts`
- Types: `/src/types/orders.ts`
