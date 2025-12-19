# OCR System Improvement Plan

## Overview

This document outlines the implementation plan to improve the OCR system based on the Romanian document handling specification.

**Created:** 2025-12-18
**Status:** Planning
**Priority:** High

---

## Current State Analysis

### What We Have

| Component | Status | Notes |
|-----------|--------|-------|
| `extractFromCIFront()` | ✅ Working | Extracts personal data, detects old vs new format |
| `extractFromCIBack()` | ✅ Working | Extracts address |
| `extractFromPassport()` | ✅ Working | Extracts passport data |
| `extractFromDocument()` | ✅ Working | Auto-detects document type |
| `extractFromCIBothSides()` | ✅ Working | Combines front + back |

### What's Missing

| Feature | Priority | Effort |
|---------|----------|--------|
| Certificat Atestare Domiciliu extraction | **P0** | Medium |
| Document type classification (ci_vechi/ci_nou) | **P0** | Low |
| Expiry validation | **P0** | Low |
| Cross-validation (CNP, name matching) | **P1** | Medium |
| `requires_address_certificate` flag | **P1** | Low |
| Combined series+number handling for CI Nou | **P1** | Low |
| MRZ validation | **P2** | Medium |
| Parents extraction from certificate | **P2** | Low |

---

## Implementation Phases

### Phase 1: Core Improvements (Priority P0)

#### Task 1.1: Add Certificat Atestare Domiciliu Extraction
**File:** `src/lib/services/document-ocr.ts`

```typescript
// New function to add
export async function extractFromCertificatDomiciliu(
  imageBase64: string,
  mimeType: string
): Promise<CertificateOCRResult>
```

**Extracts:**
- Holder name (last name, first name)
- Holder CNP
- Parents (father, mother names)
- Birth date and place
- Full address (parsed into components)
- Issue date
- Issuing authority

**Acceptance Criteria:**
- [ ] Extracts all fields from sample certificate
- [ ] Calculates `valid_until` (issue_date + 6 months)
- [ ] Returns `is_valid` flag based on 6-month expiry
- [ ] Handles PDF input (convert to image first)

---

#### Task 1.2: Update Document Type Classification
**File:** `src/lib/services/document-ocr.ts`

Update `DocumentType` and add document classification:

```typescript
// Update type definition
export type DocumentType =
  | 'ci_vechi'      // Old ID (pre-2009, has address)
  | 'ci_nou_front'  // New ID front
  | 'ci_nou_back'   // New ID back
  | 'passport'      // Passport
  | 'certificat_domiciliu'  // Address certificate
  | 'unknown';

// Add classification result
export interface DocumentClassification {
  type: DocumentType;
  subType?: 'old' | 'new';  // For CI
  hasAddress: boolean;
  hasMRZ: boolean;
  requiresAdditionalDocuments: boolean;
  requiredDocuments?: string[];
}
```

**Acceptance Criteria:**
- [ ] Detects CI vechi vs CI nou based on presence of address
- [ ] Returns `requiresAdditionalDocuments: true` for CI nou and passport
- [ ] Specifies which additional documents are needed

---

#### Task 1.3: Add Expiry Validation
**File:** `src/lib/services/document-validation.ts` (NEW)

```typescript
export interface ExpiryValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresInDays?: number;
  allowedForService: boolean;
  message: string;  // Romanian message
}

export function validateDocumentExpiry(
  expiryDate: string,
  serviceSlug: string
): ExpiryValidationResult
```

**Rules:**
| Service | Expired Allowed? |
|---------|-----------------|
| `certificat-nastere` | Yes |
| All others | No |

**Acceptance Criteria:**
- [ ] Returns `allowedForService: true` for birth certificate with expired ID
- [ ] Returns `allowedForService: false` for other services with expired ID
- [ ] Warns if document expires within 30 days
- [ ] Returns Romanian error messages

---

### Phase 2: Data Quality (Priority P1)

#### Task 2.1: Add Cross-Validation
**File:** `src/lib/services/document-validation.ts`

```typescript
export interface CrossValidationResult {
  valid: boolean;
  cnpMatch: boolean;
  nameMatch: boolean;
  issues: string[];
}

export function crossValidateDocuments(
  identityDoc: ExtractedPersonalData,
  certificate: CertificateExtractedData
): CrossValidationResult
```

**Validates:**
- CNP from ID matches CNP from certificate
- Name from ID matches name from certificate (fuzzy match for diacritics)

**Acceptance Criteria:**
- [ ] Detects CNP mismatch
- [ ] Handles name variations (DRAGOȘ vs DRAGOŞ)
- [ ] Returns specific error messages

---

#### Task 2.2: Update Series/Number Handling
**File:** `src/lib/services/document-ocr.ts`

For CI Nou, handle combined format:

```typescript
// Input: "SM1004703"
// Output: { series: "SM", number: "1004703", fullDocumentNumber: "SM1004703" }
```

**Acceptance Criteria:**
- [ ] Parses combined format correctly
- [ ] Stores both parsed and original values
- [ ] Works with validation in `personal-data-step.tsx`

---

#### Task 2.3: Add `requires_address_certificate` Flag
**File:** `src/lib/services/document-ocr.ts`

Add to OCR result:

```typescript
interface OCRResult {
  // ... existing fields
  requiresAddressCertificate: boolean;
  documentClassification: DocumentClassification;
}
```

**Logic:**
- `ci_vechi` → `false`
- `ci_nou` → `true`
- `passport` → `true`

---

### Phase 3: Advanced Features (Priority P2)

#### Task 3.1: MRZ Validation
**File:** `src/lib/services/mrz-validator.ts` (NEW)

```typescript
export function validateMRZ(mrz: { line1: string; line2: string }): MRZValidationResult
export function parseMRZ(mrz: { line1: string; line2: string }): MRZParsedData
```

**Validates:**
- Check digits are correct
- CNP matches extracted CNP
- Name matches extracted name

---

#### Task 3.2: Parents Extraction Enhancement
**File:** `src/lib/services/document-ocr.ts`

Enhance certificate extraction to include:
- Father's full name
- Mother's full name (including maiden name if present)

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/services/document-ocr.ts` | Modify | Add certificate extraction, update types |
| `src/lib/services/document-validation.ts` | Create | Expiry and cross-validation |
| `src/lib/services/mrz-validator.ts` | Create | MRZ parsing and validation |
| `src/types/ocr.ts` | Create | Move/consolidate OCR types |
| `src/app/api/ocr/extract/route.ts` | Modify | Support certificate extraction |
| `src/components/orders/steps/kyc-step.tsx` | Modify | Dynamic upload requirements |

---

## API Changes

### POST `/api/ocr/extract`

**Current Request:**
```json
{
  "image": "base64...",
  "documentType": "ci_front" | "ci_back" | "passport"
}
```

**New Request:**
```json
{
  "image": "base64...",
  "documentType": "ci_front" | "ci_back" | "passport" | "certificat_domiciliu" | "auto",
  "serviceSlug": "cazier-fiscal"  // For expiry validation context
}
```

**New Response Fields:**
```json
{
  "success": true,
  "documentType": "ci_nou_front",
  "documentClassification": {
    "type": "ci_nou_front",
    "subType": "new",
    "hasAddress": false,
    "hasMRZ": true,
    "requiresAdditionalDocuments": true,
    "requiredDocuments": ["ci_back", "certificat_domiciliu"]
  },
  "extractedData": { ... },
  "expiryValidation": {
    "isValid": true,
    "isExpired": false,
    "expiresInDays": 365,
    "allowedForService": true
  },
  "requiresAddressCertificate": true
}
```

---

## UI Flow Changes

### Current Flow:
```
1. Upload ID → OCR extracts data → Auto-fill form
```

### New Flow:
```
1. Upload ID
   ↓
2. OCR extracts + classifies document
   ↓
3. IF ci_nou OR passport:
   ├── Show message: "Acest document nu conține adresa"
   ├── Request: CI Back (if ci_nou)
   └── Request: Certificat Atestare Domiciliu
   ↓
4. Cross-validate documents
   ↓
5. IF expired AND service != certificat-nastere:
   └── Block: "Document expirat"
   ↓
6. Auto-fill form with combined data
```

---

## Database Schema Updates

No schema changes required. The existing `kyc_documents` JSONB field supports the new structure documented in `romanian-document-handling.md`.

---

## Testing Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Certificate OCR | `__tests__/ocr/certificate.test.ts` | Test extraction from sample certificate |
| Document Classification | `__tests__/ocr/classification.test.ts` | Test ci_vechi vs ci_nou detection |
| Expiry Validation | `__tests__/validation/expiry.test.ts` | Test all service combinations |
| Cross-Validation | `__tests__/validation/cross.test.ts` | Test CNP/name matching |

### Integration Tests

| Test | Description |
|------|-------------|
| Full CI Vechi flow | Upload → Extract → No additional docs needed |
| Full CI Nou flow | Upload front → Back → Certificate → Cross-validate |
| Full Passport flow | Upload → Certificate → Cross-validate |
| Expired document | Upload expired → Block (non-birth-cert) |
| Birth cert exception | Upload expired → Allow for birth cert request |

---

## Implementation Order

```
Week 1:
├── Task 1.1: Certificat extraction function
├── Task 1.2: Document classification
└── Task 1.3: Expiry validation

Week 2:
├── Task 2.1: Cross-validation
├── Task 2.2: Series/number handling
├── Task 2.3: requires_address_certificate flag
└── API updates

Week 3:
├── UI flow updates
├── Task 3.1: MRZ validation
├── Task 3.2: Parents extraction
└── Testing & polish
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| OCR accuracy (CI Vechi) | >95% |
| OCR accuracy (CI Nou) | >95% |
| OCR accuracy (Passport) | >95% |
| OCR accuracy (Certificate) | >90% |
| Cross-validation accuracy | >99% |
| Expiry detection accuracy | 100% |

---

## Related Documentation

- [Romanian Document Handling](./romanian-document-handling.md)
- [OCR & KYC API](../api/ocr-kyc-api.md)
- [Order Auto-Save System](./order-autosave-system.md)
