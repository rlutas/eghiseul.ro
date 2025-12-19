# Romanian Document Handling System

## Overview

This document describes the comprehensive system for handling Romanian identity documents in eghiseul.ro. The system supports three types of identity documents, each with specific requirements for data extraction and validation.

**Last Updated:** 2025-12-18
**Version:** 1.0

---

## Document Types

### 1. Carte de Identitate Veche (CI Vechi) - Old ID Card

**Characteristics:**
- Single-sided document (front only required)
- **Contains full address** printed on the front
- Series format: 2 uppercase letters (e.g., `XV`, `SM`, `BZ`)
- Number format: 6 digits (e.g., `517628`)
- Has visible expiry date on front

**Sample Data Extracted:**
```json
{
  "document_type": "ci_vechi",
  "series": "XV",
  "number": "517628",
  "last_name": "VLĂGEA",
  "first_name": "ELISABETA",
  "cnp": "2540101301234",
  "birth_date": "01.01.1954",
  "birth_place": "Satu Mare",
  "address": {
    "judet": "Satu Mare",
    "localitate": "Satu Mare",
    "strada": "Str. Principală",
    "numar": "10",
    "bloc": null,
    "scara": null,
    "etaj": null,
    "apartament": null
  },
  "expiry_date": "01.01.2024",
  "issue_date": "01.01.2014",
  "issuing_authority": "SPCLEP Satu Mare"
}
```

**Required Uploads:**
1. CI Front (mandatory)

---

### 2. Carte de Identitate Nouă (CI Nou) - New ID Card

**Characteristics:**
- Two-sided document (front AND back required)
- **NO address on card** - requires Certificat Atestare Domiciliu
- Series + Number combined format: 2 letters + 7 digits (e.g., `SM1004703`)
- Has MRZ (Machine Readable Zone) on back
- Chip-enabled (electronic ID)

**Front Side Contains:**
- Photo
- Last name, First name
- Sex
- Nationality
- Birth date
- CNP
- Series + Number
- Expiry date

**Back Side Contains:**
- MRZ (2 lines of 30 characters each)
- Issue date
- Issuing authority (SPCLEP)
- Parents' names (optional)
- Address reference (pointer to certificate)

**Sample Data Extracted:**
```json
{
  "document_type": "ci_nou",
  "series": "SM",
  "number": "1004703",
  "full_document_number": "SM1004703",
  "last_name": "TARȚA",
  "first_name": "MARK-SILVER",
  "sex": "M",
  "nationality": "ROU",
  "cnp": "1890121301234",
  "birth_date": "21.01.1989",
  "birth_place": null,
  "address": null,
  "expiry_date": "21.01.2029",
  "issue_date": "15.03.2024",
  "issuing_authority": "SPCLEP Satu Mare",
  "mrz": {
    "line1": "IDROU1890121SM1004703<<<<<<",
    "line2": "8901215M2901217ROU<<<<<<<<6"
  },
  "requires_address_certificate": true
}
```

**Required Uploads:**
1. CI Front (mandatory)
2. CI Back (mandatory)
3. Certificat Atestare Domiciliu (mandatory for address)

---

### 3. Pașaport Românesc (Romanian Passport)

**Characteristics:**
- Both pages visible in single photo (data page + photo page)
- **NO address on passport** - requires Certificat Atestare Domiciliu
- Number format: 9 digits (e.g., `057472789`)
- No series (series field is empty)
- Has MRZ at bottom of data page

**Data Page Contains:**
- Photo
- Last name, First name
- Nationality
- Birth date
- Birth place
- Sex
- Issue date
- Expiry date
- Passport number
- Issuing authority
- MRZ (2 lines)

**Sample Data Extracted:**
```json
{
  "document_type": "passport",
  "series": null,
  "number": "057472789",
  "last_name": "BACIU",
  "first_name": "VASILE-VIOREL",
  "sex": "M",
  "nationality": "ROMÂNĂ/ROMANIAN",
  "cnp": "1750815301234",
  "birth_date": "15.08.1975",
  "birth_place": "SATU MARE/ROU",
  "address": null,
  "expiry_date": "14.03.2030",
  "issue_date": "15.03.2020",
  "issuing_authority": "MUNICIPIUL SATU MARE/ROU",
  "mrz": {
    "line1": "P<ROUBACAU<<VASILE<VIOREL<<<<<<<<<<<<",
    "line2": "0574727898ROU7508155M3003141<<<<<<<<00"
  },
  "requires_address_certificate": true
}
```

**Required Uploads:**
1. Passport (both pages visible - mandatory)
2. Certificat Atestare Domiciliu (mandatory for address)

---

## Certificat de Atestare a Domiciliului

### Purpose
Required for CI Nou and Passport holders to provide proof of address since these documents don't contain address information.

### Validity
- **Valid for 6 months** from issue date
- System must check `issue_date` and reject if older than 6 months

### Data Extracted
```json
{
  "document_type": "certificat_atestare_domiciliu",
  "holder": {
    "last_name": "TARȚA",
    "first_name": "MARK-SILVER",
    "cnp": "1890121301234"
  },
  "parents": {
    "father": "GAVRIL-VASILE",
    "mother": "ILEANA"
  },
  "birth": {
    "date": "21.01.1989",
    "place": "Mun.Satu Mare"
  },
  "address": {
    "judet": "Satu Mare",
    "localitate": "Mun.Satu Mare",
    "strada": "Pța.Jean Calvin",
    "numar": "1",
    "bloc": null,
    "scara": null,
    "etaj": null,
    "apartament": "28"
  },
  "issue_date": "15.12.2024",
  "issuing_authority": "SPCLEP Satu Mare",
  "valid_until": "15.06.2025"
}
```

### Cross-Validation
The system MUST verify that:
1. CNP on certificate matches CNP on ID/Passport
2. Name on certificate matches name on ID/Passport
3. Certificate is not expired (< 6 months old)

---

## OCR Detection Logic

### Document Type Auto-Detection

The OCR system automatically detects document type based on visual and textual cues:

```typescript
function detectDocumentType(extractedData: OCRResult): DocumentType {
  // Check for passport indicators
  if (hasPassportIndicators(extractedData)) {
    return 'passport';
  }

  // Check for MRZ (indicates CI Nou if not passport)
  if (hasMRZ(extractedData) && !hasPassportIndicators(extractedData)) {
    return 'ci_nou';
  }

  // Check for full address on document (CI Vechi)
  if (hasFullAddress(extractedData)) {
    return 'ci_vechi';
  }

  // Check series/number format
  if (isNewIDFormat(extractedData.documentNumber)) {
    return 'ci_nou';
  }

  return 'ci_vechi'; // Default fallback
}
```

### Detection Indicators

| Indicator | CI Vechi | CI Nou | Passport |
|-----------|----------|--------|----------|
| MRZ present | No | Yes (back) | Yes |
| Address on document | Yes | No | No |
| Series format | 2 letters separate | 2 letters combined | None |
| Number format | 6 digits | 7 digits | 9 digits |
| "PAȘAPORT" text | No | No | Yes |
| "CARTE DE IDENTITATE" | Yes | Yes | No |
| Chip icon | No | Yes | Yes |

### Format Patterns

```typescript
const DOCUMENT_PATTERNS = {
  // CI Vechi: Series and number separate
  ci_vechi_series: /^[A-Z]{2}$/,
  ci_vechi_number: /^\d{6}$/,

  // CI Nou: Combined series + number
  ci_nou_combined: /^[A-Z]{2}\d{7}$/,
  ci_nou_series: /^[A-Z]{2}$/,
  ci_nou_number: /^\d{7}$/,

  // Passport: Number only (no series)
  passport_number: /^\d{9}$/,

  // MRZ patterns
  mrz_passport: /^P<ROU[A-Z<]{39}$/,
  mrz_id: /^IDROU\d{7}[A-Z]{2}\d{7}[<]{6}$/
};
```

---

## Expiry Validation

### Standard Validation Rules

```typescript
function validateDocumentExpiry(
  expiryDate: Date,
  serviceType: ServiceType
): ValidationResult {
  const today = new Date();
  const isExpired = expiryDate < today;

  // Special case: Birth certificate requests accept expired documents
  if (serviceType === 'certificat_nastere') {
    return {
      valid: true,
      warning: isExpired
        ? 'Document expirat - acceptat pentru cerere certificat naștere'
        : null
    };
  }

  // All other services require valid (non-expired) documents
  if (isExpired) {
    return {
      valid: false,
      error: 'Documentul de identitate este expirat. Vă rugăm să folosiți un document valid.'
    };
  }

  // Warn if expiring within 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiryDate < thirtyDaysFromNow) {
    return {
      valid: true,
      warning: 'Documentul expiră în mai puțin de 30 de zile.'
    };
  }

  return { valid: true };
}
```

### Service-Specific Rules

| Service | Expired Document Allowed? | Notes |
|---------|--------------------------|-------|
| Cazier Fiscal | No | Requires valid ID |
| Cazier Judiciar | No | Requires valid ID |
| Certificat Constatator | No | Requires valid ID |
| Extras Carte Funciară | No | Requires valid ID |
| **Certificat Naștere** | **Yes** | Special case - expired OK |
| Certificat Căsătorie | No | Requires valid ID |
| Certificat Deces | No | Requires valid ID |

### Certificate Expiry (Certificat Atestare Domiciliu)

```typescript
function validateCertificateExpiry(issueDate: Date): ValidationResult {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  if (issueDate < sixMonthsAgo) {
    return {
      valid: false,
      error: 'Certificatul de atestare a domiciliului este expirat (mai vechi de 6 luni).'
    };
  }

  return { valid: true };
}
```

---

## Database Storage Structure

### Orders Table - KYC Documents Field

The `kyc_documents` JSONB field stores all extracted document data:

```typescript
interface KYCDocuments {
  // Primary identity document
  identity_document: {
    type: 'ci_vechi' | 'ci_nou' | 'passport';
    series: string | null;
    number: string;
    full_document_number?: string;  // For CI Nou combined format

    // Personal data
    last_name: string;
    first_name: string;
    cnp: string;
    sex: 'M' | 'F';
    nationality: string;

    // Birth info
    birth_date: string;  // DD.MM.YYYY
    birth_place: string | null;

    // Document validity
    issue_date: string;  // DD.MM.YYYY
    expiry_date: string; // DD.MM.YYYY
    issuing_authority: string;

    // Address (only for CI Vechi)
    address: Address | null;

    // MRZ data (CI Nou and Passport)
    mrz?: {
      line1: string;
      line2: string;
      parsed?: MRZParsed;
    };

    // Upload metadata
    uploads: {
      front: UploadInfo;
      back?: UploadInfo;  // Required for CI Nou
    };

    // Validation results
    validation: {
      is_expired: boolean;
      expiry_allowed: boolean;  // true for birth certificate requests
      confidence_score: number;
      validated_at: string;
    };
  };

  // Address certificate (required for CI Nou and Passport)
  address_certificate?: {
    type: 'certificat_atestare_domiciliu';

    // Holder verification
    holder_cnp: string;
    holder_name: string;
    cnp_matches: boolean;
    name_matches: boolean;

    // Parents info
    parents?: {
      father: string;
      mother: string;
    };

    // Birth info (may differ from ID)
    birth: {
      date: string;
      place: string;
    };

    // Address (primary source for CI Nou/Passport)
    address: Address;

    // Certificate validity
    issue_date: string;
    valid_until: string;
    is_valid: boolean;
    issuing_authority: string;

    // Upload metadata
    upload: UploadInfo;
  };

  // Optional: Face verification results
  face_verification?: {
    selfie_upload: UploadInfo;
    match_score: number;
    verified: boolean;
    verified_at: string;
  };
}

interface Address {
  judet: string;
  localitate: string;
  strada: string;
  numar: string;
  bloc?: string;
  scara?: string;
  etaj?: string;
  apartament?: string;
  cod_postal?: string;
}

interface UploadInfo {
  file_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  uploaded_at: string;
  ocr_processed: boolean;
  ocr_confidence: number;
}

interface MRZParsed {
  document_type: string;
  country_code: string;
  last_name: string;
  first_name: string;
  document_number: string;
  nationality: string;
  birth_date: string;
  sex: string;
  expiry_date: string;
  check_digits_valid: boolean;
}
```

### Example Stored Data

**CI Vechi Order:**
```json
{
  "kyc_documents": {
    "identity_document": {
      "type": "ci_vechi",
      "series": "XV",
      "number": "517628",
      "last_name": "VLĂGEA",
      "first_name": "ELISABETA",
      "cnp": "2540101301234",
      "sex": "F",
      "nationality": "ROU",
      "birth_date": "01.01.1954",
      "birth_place": "Satu Mare",
      "issue_date": "01.01.2014",
      "expiry_date": "01.01.2024",
      "issuing_authority": "SPCLEP Satu Mare",
      "address": {
        "judet": "Satu Mare",
        "localitate": "Satu Mare",
        "strada": "Str. Principală",
        "numar": "10"
      },
      "uploads": {
        "front": {
          "file_id": "abc123",
          "s3_key": "kyc/2024/12/abc123.jpg",
          "ocr_processed": true,
          "ocr_confidence": 0.95
        }
      },
      "validation": {
        "is_expired": true,
        "expiry_allowed": false,
        "confidence_score": 0.95,
        "validated_at": "2024-12-18T10:30:00Z"
      }
    }
  }
}
```

**CI Nou Order:**
```json
{
  "kyc_documents": {
    "identity_document": {
      "type": "ci_nou",
      "series": "SM",
      "number": "1004703",
      "full_document_number": "SM1004703",
      "last_name": "TARȚA",
      "first_name": "MARK-SILVER",
      "cnp": "1890121301234",
      "sex": "M",
      "nationality": "ROU",
      "birth_date": "21.01.1989",
      "birth_place": null,
      "issue_date": "15.03.2024",
      "expiry_date": "21.01.2029",
      "issuing_authority": "SPCLEP Satu Mare",
      "address": null,
      "mrz": {
        "line1": "IDROU1890121SM1004703<<<<<<",
        "line2": "8901215M2901217ROU<<<<<<<<6"
      },
      "uploads": {
        "front": {
          "file_id": "def456",
          "s3_key": "kyc/2024/12/def456.jpg",
          "ocr_processed": true,
          "ocr_confidence": 0.98
        },
        "back": {
          "file_id": "ghi789",
          "s3_key": "kyc/2024/12/ghi789.jpg",
          "ocr_processed": true,
          "ocr_confidence": 0.97
        }
      },
      "validation": {
        "is_expired": false,
        "expiry_allowed": false,
        "confidence_score": 0.97,
        "validated_at": "2024-12-18T10:30:00Z"
      }
    },
    "address_certificate": {
      "type": "certificat_atestare_domiciliu",
      "holder_cnp": "1890121301234",
      "holder_name": "TARȚA MARK-SILVER",
      "cnp_matches": true,
      "name_matches": true,
      "parents": {
        "father": "GAVRIL-VASILE",
        "mother": "ILEANA"
      },
      "birth": {
        "date": "21.01.1989",
        "place": "Mun.Satu Mare"
      },
      "address": {
        "judet": "Satu Mare",
        "localitate": "Mun.Satu Mare",
        "strada": "Pța.Jean Calvin",
        "numar": "1",
        "apartament": "28"
      },
      "issue_date": "15.12.2024",
      "valid_until": "15.06.2025",
      "is_valid": true,
      "issuing_authority": "SPCLEP Satu Mare",
      "upload": {
        "file_id": "jkl012",
        "s3_key": "kyc/2024/12/jkl012.pdf",
        "ocr_processed": true,
        "ocr_confidence": 0.96
      }
    }
  }
}
```

---

## User Flow by Document Type

### Flow 1: CI Vechi (Old ID)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Upload CI Front                                         │
│ ┌─────────────────┐                                             │
│ │ [Upload Zone]   │ ← User uploads front of old ID              │
│ └─────────────────┘                                             │
│           ↓                                                     │
│ OCR extracts: name, CNP, address, expiry, series, number        │
│           ↓                                                     │
│ Step 2: Validate Expiry                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✓ Document valid until 01.01.2029                           │ │
│ │ OR                                                          │ │
│ │ ⚠ Document expirat - Vă rugăm să încărcați un act valid    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│           ↓                                                     │
│ Step 3: Auto-fill form with extracted data                      │
│           ↓                                                     │
│ ✓ Complete - Proceed to next step                               │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: CI Nou (New ID)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Upload CI Front                                         │
│ ┌─────────────────┐                                             │
│ │ [Upload Zone]   │ ← User uploads front of new ID              │
│ └─────────────────┘                                             │
│           ↓                                                     │
│ OCR detects: CI Nou (no address found)                          │
│           ↓                                                     │
│ Step 2: Request CI Back                                         │
│ ┌─────────────────┐                                             │
│ │ [Upload Zone]   │ ← User uploads back of new ID               │
│ └─────────────────┘                                             │
│           ↓                                                     │
│ OCR extracts: MRZ, issue date, issuing authority                │
│           ↓                                                     │
│ Step 3: Request Address Certificate                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⓘ Cartea de identitate nouă nu conține adresa.             │ │
│ │   Vă rugăm să încărcați Certificatul de Atestare a         │ │
│ │   Domiciliului (nu mai vechi de 6 luni).                   │ │
│ │ ┌─────────────────┐                                        │ │
│ │ │ [Upload Zone]   │ ← User uploads certificate              │ │
│ │ └─────────────────┘                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│           ↓                                                     │
│ OCR extracts: address, parents, birth place                     │
│ Validates: CNP matches, name matches, certificate not expired   │
│           ↓                                                     │
│ Step 4: Validate Expiry (both documents)                        │
│           ↓                                                     │
│ Step 5: Auto-fill form with combined extracted data             │
│           ↓                                                     │
│ ✓ Complete - Proceed to next step                               │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Passport

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Upload Passport                                         │
│ ┌─────────────────┐                                             │
│ │ [Upload Zone]   │ ← User uploads passport (both pages)        │
│ └─────────────────┘                                             │
│           ↓                                                     │
│ OCR detects: Passport (no address found)                        │
│           ↓                                                     │
│ Step 2: Request Address Certificate                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⓘ Pașaportul nu conține adresa de domiciliu.               │ │
│ │   Vă rugăm să încărcați Certificatul de Atestare a         │ │
│ │   Domiciliului (nu mai vechi de 6 luni).                   │ │
│ │ ┌─────────────────┐                                        │ │
│ │ │ [Upload Zone]   │ ← User uploads certificate              │ │
│ │ └─────────────────┘                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│           ↓                                                     │
│ OCR extracts: address, parents, birth place                     │
│ Validates: CNP matches, name matches, certificate not expired   │
│           ↓                                                     │
│ Step 3: Validate Expiry (both documents)                        │
│           ↓                                                     │
│ Step 4: Auto-fill form with combined extracted data             │
│           ↓                                                     │
│ ✓ Complete - Proceed to next step                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Messages (Romanian)

### Document Expiry Errors

```typescript
const EXPIRY_ERRORS = {
  id_expired: 'Documentul de identitate este expirat. Vă rugăm să folosiți un document valid.',
  id_expiring_soon: 'Documentul de identitate expiră în mai puțin de 30 de zile.',
  certificate_expired: 'Certificatul de atestare a domiciliului este expirat (mai vechi de 6 luni). Vă rugăm să obțineți unul nou.',
  id_expired_allowed: 'Document expirat - acceptat pentru cerere certificat naștere.'
};
```

### Validation Errors

```typescript
const VALIDATION_ERRORS = {
  cnp_mismatch: 'CNP-ul din certificat nu corespunde cu cel din actul de identitate.',
  name_mismatch: 'Numele din certificat nu corespunde cu cel din actul de identitate.',
  missing_back: 'Vă rugăm să încărcați și spatele cărții de identitate.',
  missing_certificate: 'Pentru cartea de identitate nouă/pașaport este necesar Certificatul de Atestare a Domiciliului.',
  invalid_format: 'Formatul documentului nu este recunoscut. Vă rugăm să încărcați o imagine clară.',
  low_quality: 'Calitatea imaginii este prea scăzută. Vă rugăm să încărcați o imagine mai clară.'
};
```

### Info Messages

```typescript
const INFO_MESSAGES = {
  ci_nou_detected: 'Am detectat o carte de identitate nouă. Aceasta nu conține adresa de domiciliu.',
  passport_detected: 'Am detectat un pașaport. Acesta nu conține adresa de domiciliu.',
  certificate_required: 'Vă rugăm să încărcați Certificatul de Atestare a Domiciliului (eliberat în ultimele 6 luni).',
  processing: 'Se procesează documentul...',
  extraction_complete: 'Datele au fost extrase cu succes.',
  verification_complete: 'Verificarea documentelor a fost finalizată.'
};
```

---

## Implementation Checklist

### OCR Service Updates

- [ ] Update `document-ocr.ts` to detect document type automatically
- [ ] Add MRZ parsing for CI Nou and Passport
- [ ] Add Certificat Atestare Domiciliu extraction
- [ ] Implement cross-validation between documents

### UI Updates

- [ ] Dynamic upload requirements based on document type
- [ ] Add "Upload Back" prompt for CI Nou
- [ ] Add "Upload Certificate" prompt for CI Nou/Passport
- [ ] Display extracted data preview
- [ ] Show validation errors inline

### API Updates

- [ ] Add document type to OCR response
- [ ] Add expiry validation endpoint
- [ ] Add certificate validation endpoint
- [ ] Update order schema for new KYC structure

### Database Updates

- [ ] Update `kyc_documents` JSONB schema
- [ ] Add indexes for document validation queries
- [ ] Add audit logging for KYC operations

---

## Security Considerations

1. **PII Encryption**: All identity document data is encrypted at rest
2. **S3 Security**: Document uploads stored in encrypted S3 bucket with restricted access
3. **Data Retention**: Documents retained per GDPR requirements (see `009_draft_auto_cleanup.sql`)
4. **Access Control**: Only order owner and admin can access KYC documents
5. **Audit Trail**: All document access and modifications logged

---

## Related Documentation

- [OCR & KYC API Documentation](../api/ocr-kyc-api.md)
- [Order Auto-Save System](./order-autosave-system.md)
- [Security Architecture](../../security/security-architecture.md)
- [GDPR Compliance](../../legal/compliance-research.md)
