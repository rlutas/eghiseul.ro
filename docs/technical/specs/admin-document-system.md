# Admin Document Generation System

**Version:** 2.3
**Date:** 18 Februarie 2026
**Status:** Implemented and Working
**Scope:** Document generation, multi-signature embedding, S3 storage (organized by order), mammoth DOCX-to-HTML preview with download/print, contract preview in wizard, regeneration support, client document downloads, contract legal validity, robust error handling

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Document Generation Flow](#3-document-generation-flow)
4. [Template Types](#4-template-types)
5. [Multi-Signature System](#5-multi-signature-system)
6. [Contract Preview API](#6-contract-preview-api)
7. [S3 Storage Patterns](#7-s3-storage-patterns)
8. [Document Numbering System](#8-document-numbering-system)
9. [Admin UI Features](#9-admin-ui-features)
10. [Server-Side Document Preview (mammoth)](#10-server-side-document-preview-mammoth)
11. [Client Documents in Admin](#11-client-documents-in-admin)
12. [Key Files Reference](#12-key-files-reference)
13. [Client Document Downloads](#13-client-document-downloads)
14. [Contract Legal Validity](#14-contract-legal-validity)

---

## 1. Overview

The admin document generation system handles automated creation of legal documents (contracts, powers of attorney, application forms) for orders processed through the eGhiseul.ro platform. Documents are generated from DOCX templates using `docxtemplater`, post-processed to embed signature images via DrawingML, uploaded to AWS S3, and previewed via mammoth server-side conversion directly in the admin panel.

### Key Capabilities

- Generate DOCX documents from templates with placeholder substitution
- Insert up to 3 distinct signature images (client, company, lawyer) into generated documents
- Upload generated documents to S3 with structured key patterns (`orders/{friendly_id}/{type}/`)
- Robust error handling: S3/DB failures return HTTP 500, orphan cleanup, safe insert-before-delete ordering
- Preview DOCX files in-browser via mammoth server-side conversion (with download and auto-print support)
- Preview contracts in the order wizard before submission (contract preview API)
- Regenerate documents (useful after data corrections)
- View client-uploaded documents (KYC, company docs) in admin order detail
- Atomic document numbering via PostgreSQL RPC with row-level locking
- Track all generated and uploaded documents per order in `order_documents` table
- Admin signature management (upload company/lawyer signatures and lawyer stamp via Settings page)
- Client document downloads via presigned S3 URLs (order ownership verification)
- Contract legal validity with signature metadata (IP, user agent, timestamp, SHA-256 hash, consent)

---

## 2. Architecture

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  DOCX Template   │────>│  docxtemplater  │────>│  Rendered     │
│  (src/templates/ │     │  + PizZip        │     │  DOCX (with   │
│   or shared/)    │     └─────────────────┘     │  SIG markers) │
└──────────────────┘                              └──────┬───────┘
                                                         │
                        ┌───────────────────┐            │
                        │  S3: Download      │            │
                        │  company/lawyer    │───────┐    │
                        │  signatures        │       │    │
                        └───────────────────┘       │    │
                                                    v    v
                                            ┌──────────────────┐
                                            │ signature-       │
                                            │ inserter.ts      │
                                            │ (DrawingML)      │
                                            │                  │
                                            │ SIG_CLIENT  x3   │
                                            │ SIG_COMPANY x1   │
                                            │ SIG_LAWYER  x1   │
                                            └──────┬───────────┘
                                                   │
                                                   v
                                            ┌──────────────┐
                                            │  Final DOCX  │
                                            │  (embedded   │
                                            │  signatures) │
                                            └──────┬───────┘
                                                   │
                                                   ├── Upload to S3
                                                   │   orders/{friendly_order_id}/{subfolder}/{filename}
                                                   │   (legacy: contracts/{year}/{month}/{ref}/{filename})
                                                   │
                                                   ├── Insert into order_documents (error → cleanup S3 orphan)
                                                   │   (s3_key, type, document_number, etc.)
                                                   │
                                                   ├── Log to order_history
                                                   │   (event_type: document_generated or document_generation_failed)
                                                   │
                                                   └── Return DOCX as response
                                                       (UI preview via mammoth)
```

### Technology Stack

| Component | Library | Purpose |
|-----------|---------|---------|
| Template filling | `docxtemplater` (npm) | Replace `{{placeholders}}` in DOCX files |
| ZIP handling | `pizzip` (npm) | Read/write DOCX (which is a ZIP archive) |
| Signature embedding | `signature-inserter.ts` (custom) | Replace marker text with DrawingML inline images |
| File storage | AWS S3 (`@aws-sdk/client-s3`) | Store generated documents and predefined signatures |
| Preview (admin) | `mammoth` (npm) | Server-side DOCX-to-HTML conversion for admin preview |
| Preview (wizard) | `mammoth` (npm) | Contract preview in order wizard signature step |
| Database | Supabase (PostgreSQL) | Document metadata, counters, history |

---

## 3. Document Generation Flow

### Step-by-step flow when admin clicks "Genereaza" button:

```
 1. Admin clicks "Genereaza" or "Regenereaza" button in ProcessingSection
          |
          v
 2. POST /api/admin/orders/[id]/generate-document
    Body: { "template": "contract-prestari" }
          |
          v
 3. API authenticates user, checks `orders.manage` permission
          |
          v
 4. Fetch order data (with service join) from database
          |
          v
 5. Fetch admin_settings: company_data, lawyer_data, document_counters
          |
          v
 6. Extract client data from order.customer_data
    (contact, personalData, companyData, billing)
          |
          v
 7. Allocate Barou number if needed
    (via allocate_number RPC for contract-asistenta/imputernicire)
    See: docs/technical/specs/number-registry-system.md
    NOTE: contract-prestari does NOT consume a Barou number
          |
          v
 8. Collect signature data:
    a. Client signature: getClientSignatureBase64(cd) - tries S3 (signature_s3_key) first, falls back to inline signature_base64
    b. Company signature: downloadFile(company_data.signature_s3_key) from S3
    c. Lawyer signature: downloadFile(lawyer_data.signature_s3_key) from S3
          |
          v
 9. Load DOCX template from filesystem
    Priority: src/templates/{service-slug}/{template}.docx
    Fallback: src/templates/shared/{template}.docx
          |
          v
10. docxtemplater fills {{placeholders}} with actual data
    (nullGetter: () => '' prevents errors on undefined placeholders)
    Signature placeholders set to text markers:
    - {{SEMNATURA_CLIENT}}    -> "SIG_CLIENT"
    - {{SEMNATURA_PRESTATOR}} -> "SIG_COMPANY"
    - {{SEMNATURA_AVOCAT}}    -> "SIG_LAWYER"
          |
          v
11. insertSignatureImages() post-processes the DOCX ZIP:
    - Adds each signature PNG to word/media/
    - Adds image relationships to word/_rels/document.xml.rels
    - Replaces marker text runs with DrawingML inline images
    - Ensures [Content_Types].xml has PNG content type
          |
          v
12. Upload final DOCX to S3
    Key: orders/{friendly_order_id}/{subfolder}/{filename}
    (subfolder: contracte/, imputerniciri/, cereri/, or documente/)
    If S3 upload fails → return HTTP 500 (no silent fallthrough)
          |
          v
13. Insert record into order_documents table
    (s3_key, type, file_name, document_number, visible_to_client)
    If DB insert fails → delete orphan S3 object, return HTTP 500
    Order: INSERT new row FIRST, then DELETE old rows of same type
    (prevents data loss if deletion succeeds but insert fails)
          |
          v
14. Insert event into order_history
    ("Document generat: {fileName}")
          |
          v
15. Return DOCX buffer as HTTP response
    (UI refreshes document list to show new entry)
```

---

## 4. Template Types

### Available Templates

| Template Name | File | Purpose | Auto-Generated |
|--------------|------|---------|----------------|
| `contract-complet` | `contract-complet.docx` | Combined document: Contract Prestari + Contract Asistenta + Nota GDPR (used for wizard preview and final generation) | Used for preview + admin generation |
| `contract-prestari` | `contract-prestari.docx` | Contract de prestari servicii (between EDIGITALIZARE SRL and client) | At payment (planned) |
| `contract-asistenta` | `contract-asistenta.docx` | Contract de asistenta juridica + Nota GDPR (between Cabinet Avocat and client) | At payment (planned) |
| `imputernicire` | `imputernicire.docx` | Imputernicire avocatiala (power of attorney) | At payment (planned) |
| `cerere-eliberare-pf` | `cerere-eliberare-pf.docx` | Cerere eliberare cazier judiciar - Persoana Fizica | Manual by operator |
| `cerere-eliberare-pj` | `cerere-eliberare-pj.docx` | Cerere eliberare cazier judiciar - Persoana Juridica | Manual by operator |

### Template File Structure

```
src/templates/
├── cazier-judiciar/              # Service-specific templates (priority)
│   ├── contract-complet.docx
│   ├── contract-prestari.docx
│   ├── contract-asistenta.docx
│   ├── imputernicire.docx
│   ├── cerere-eliberare-pf.docx
│   └── cerere-eliberare-pj.docx
└── shared/                       # Fallback templates (shared across services)
    ├── contract-complet.docx
    ├── contract-prestari.docx
    ├── contract-asistenta.docx
    ├── imputernicire.docx
    ├── cerere-eliberare-pf.docx
    └── cerere-eliberare-pj.docx
```

**Template resolution order:**
1. Try `src/templates/{service-slug}/{template-name}.docx` first
2. Fall back to `src/templates/shared/{template-name}.docx`
3. Throw error if neither exists

**Important:** Because templates load from `{service-slug}/` first and fall back to `shared/`, both copies must be kept in sync when making changes. Always update both the service-specific and shared template files.

### Placeholder Reference

Templates use `{{PLACEHOLDER}}` syntax. The full mapping is built by `buildPlaceholderData()` in `generator.ts`:

**Client data:**
| Placeholder | Source |
|-------------|--------|
| `{{NUMECLIENT}}` | Client full name (PF: personal name, PJ: company name) |
| `{{CNP/CUI}}` | CNP (PF) or CUI (PJ) |
| `{{CLIENT_CNP}}` | Client CNP |
| `{{CLIENT_CUI}}` | Client CUI |
| `{{EMAIL}}` | Client email |
| `{{CLIENT_PHONE}}` | Client phone |
| `{{CLIENT_ADDRESS}}` | Client address |
| `{{CLIENT_CI_SERIES}}` | ID card series |
| `{{CLIENT_CI_NUMBER}}` | ID card number |
| `{{CLIENT_COMPANY_NAME}}` | Company name (PJ) |
| `{{CLIENT_COMPANY_REG}}` | Company registration (PJ) |
| `{{CLIENT_COMPANY_ADDRESS}}` | Company address (PJ) |

**Company data (EDIGITALIZARE SRL):**
| Placeholder | Source |
|-------------|--------|
| `{{NUMEFIRMAN}}` | Company name |
| `{{CUIFIRMAN}}` | Company CUI |
| `{{NRORDINEFIRMAN}}` | Registration number |
| `{{IBANFIRMAN}}` | IBAN |
| `{{JUDETFIRMAN}}` | County (extracted from address) |
| `{{JUDETFIRMA}}` | County (alias) |
| `{{COMUNAFIRMA}}` | Locality (extracted from address) |
| `{{STRADASINRFIRMA}}` | Street (extracted from address) |

**Lawyer data:**
| Placeholder | Source |
|-------------|--------|
| `{{LAWYER_NAME}}` | Lawyer full name |
| `{{LAWYER_LASTNAME}}` | Lawyer last name (derived: first word of `lawyer_name`) |
| `{{LAWYER_FIRSTNAME}}` | Lawyer first name (derived: remaining words of `lawyer_name` after first space) |
| `{{LAWYER_CABINET}}` | Cabinet name |
| `{{LAWYER_ADDRESS}}` | Professional address |
| `{{LAWYER_CIF}}` | Lawyer CIF |
| `{{LAWYER_FEE}}` | Fee amount |
| `{{LAWYER_JUDET}}` | County (extracted from professional address) |
| `{{LAWYER_CI_SERIES}}` | Lawyer ID card series (from admin settings) |
| `{{LAWYER_CI_NUMBER}}` | Lawyer ID card number (from admin settings) |
| `{{LAWYER_CNP}}` | Lawyer CNP (from admin settings) |

**Signature placeholders (replaced with images in post-processing):**
| Placeholder | Occurrences in contract-complet | Source |
|-------------|--------------------------------|--------|
| `{{SEMNATURA_CLIENT}}` | 3x (Contract Prestari beneficiar cell, Contract Asistenta client cell, Nota de Informare) | Client drawn signature via `getClientSignatureBase64(cd)` - S3 (`signature_s3_key`) first, falls back to inline `signature_base64` |
| `{{SEMNATURA_PRESTATOR}}` | 1x (Contract Prestari prestator cell) | Company predefined signature (PNG from S3, configured in admin settings) |
| `{{SEMNATURA_AVOCAT}}` | 1x (Contract Asistenta lawyer cell) | Lawyer predefined signature (PNG from S3, configured in admin settings) |

**Document metadata:**
| Placeholder | Source |
|-------------|--------|
| `{{NRCONTRACT}}` | Contract number (zero-padded 6 digits) |
| `{{IMPUTERNICIRE_NR}}` | Imputernicire number (zero-padded 6 digits) |
| `{{IMPUTERNICIRE_SERIA}}` | Series (default: SM) |
| `{{NRCOMANDA}}` | Order number (friendly_order_id) |
| `{{TOTALPLATA}}` | Total price (2 decimals) |
| `{{NUMESERVICIU}}` | Service name |
| `{{SERVICE_PRICE}}` | Service base price (2 decimals) |
| `{{DATA}}` | Current date (DD.MM.YYYY) |
| `{{DATACOMANDA}}` | Order creation date |
| `{{DATASIORA}}` | Current date+time |
| `{{GENERATED_AT}}` | Generation timestamp |
| `{{DATE_LONG}}` | Long date format (e.g., "16 februarie 2026") |
| `{{ESTIMATED_DAYS}}` | Standard delivery days (from services table) |
| `{{URGENT_DAYS}}` | Urgent delivery days (from services table, if urgent available) |

**Dynamic block placeholders (built by helper functions in generator.ts):**
| Placeholder | Source |
|-------------|--------|
| `{{CLIENT_DETAILS_BLOCK}}` | Full formatted client details, built by `buildClientDetailsBlock()`. PJ: company name, CUI, Nr. Reg. Com., cu sediul in (address), email, phone. PF: full name, CNP, CI seria/nr, domiciliat in (address), email, phone. Used in `contract-prestari` (Section 1.2) and `contract-asistenta` (Party 2). |
| `{{TERMEN_LIVRARE}}` | Dynamic delivery terms per service, built by `buildDeliveryTerms()`. Reads `estimated_days` and `urgent_days` from services table. Generates formatted text with standard and urgent (if available) delivery timeframes. Used in `contract-prestari` (Section VII). |

**Request data (for cerere templates):**
| Placeholder | Source |
|-------------|--------|
| `{{MOTIV_SOLICITARE}}` | Reason for request (default: "Interes personal") |

**Conditional flags (for PF/PJ logic in templates):**
| Placeholder | Value |
|-------------|-------|
| `{{isPJ}}` | `true` if client is legal entity |
| `{{isPF}}` | `true` if client is natural person |

---

## 5. Multi-Signature System

The document generation system supports three distinct signature types plus a lawyer stamp. Each signature is sourced differently and inserted into DOCX documents as inline PNG images using a two-phase approach.

### 5.1 Signature Types

| Signature | Source | Storage | Data Path |
|-----------|--------|---------|-----------|
| **Client** | Drawn by customer in the wizard's signature step (HTML canvas) | S3: `orders/{year}/{month}/{order_id}/signature/signature.png` (new) or `customer_data.signature_base64` (legacy) | `getClientSignatureBase64(cd)` from `s3.ts` |
| **Company (prestator)** | PNG uploaded by admin in Settings > "Date firma & Avocat" | S3: `signatures/company_signature/{timestamp}.png` | `admin_settings.company_data.signature_s3_key` |
| **Lawyer (avocat)** | PNG uploaded by admin in Settings > "Date firma & Avocat" | S3: `signatures/lawyer_signature/{timestamp}.png` | `admin_settings.lawyer_data.signature_s3_key` |
| **Lawyer stamp** | PNG uploaded by admin in Settings > "Date firma & Avocat" | S3: `signatures/lawyer_stamp/{timestamp}.png` | `admin_settings.lawyer_data.stamp_s3_key` |

### 5.2 Signature Insertion Architecture

The system uses a two-phase approach because `docxtemplater` does not natively support image insertion.

**Phase 1 -- Template Rendering (docxtemplater)**

During placeholder substitution, signature placeholders are set to short uppercase text markers instead of image data:

```typescript
// In buildPlaceholderData() - defaults
SEMNATURA_CLIENT: '',
SEMNATURA_PRESTATOR: '',
SEMNATURA_AVOCAT: '',

// In generateDocument() - markers set when signature data is available
if (options?.clientSignatureBase64)  data.SEMNATURA_CLIENT = 'SIG_CLIENT';
if (options?.companySignatureBase64) data.SEMNATURA_PRESTATOR = 'SIG_COMPANY';
if (options?.lawyerSignatureBase64)  data.SEMNATURA_AVOCAT = 'SIG_LAWYER';
```

**Phase 2 -- Image Post-Processing (signature-inserter.ts)**

After `docxtemplater` renders the DOCX, the `insertSignatureImages()` function post-processes the DOCX ZIP archive to replace text markers with inline DrawingML images. For each signature the function:

1. Adds PNG binary to `word/media/{name}.png`
2. Adds a `<Relationship>` entry in `word/_rels/document.xml.rels`
3. Replaces the marker text run (`<w:t>SIG_CLIENT</w:t>`) with a DrawingML `<w:drawing>` block
4. Ensures `[Content_Types].xml` has the PNG content type declaration

Each signature gets its own:
- Image file in `word/media/` (e.g., `signature_client.png`, `signature_company.png`, `signature_lawyer.png`)
- Unique relationship ID (`rId` auto-incremented from the highest existing ID)
- DrawingML inline image block with configurable dimensions

### 5.3 DrawingML Image Specification

| Property | Default Value | Notes |
|----------|--------------|-------|
| Width | 240 points (3,048,000 EMU) | Configurable via `widthPt` |
| Height | 80 points (1,016,000 EMU) | Configurable via `heightPt` |
| Format | PNG | All signatures stored as PNG |
| Positioning | Inline (`<wp:inline>`) | Flows with text, not floating |

The conversion factor is 1 point = 12,700 EMU (English Metric Units).

### 5.4 Signature Data Flow During Generation

```
POST /api/admin/orders/[id]/generate-document
         |
         v
  getClientSignatureBase64(cd)  --- Client signature (S3 first, then legacy base64)
         |
         v
  Read admin_settings.company_data.signature_s3_key
         |
         v
  downloadFile(signature_s3_key) from S3  ----- Company signature (Buffer -> base64)
         |
         v
  Read admin_settings.lawyer_data.signature_s3_key
         |
         v
  downloadFile(signature_s3_key) from S3  ----- Lawyer signature (Buffer -> base64)
         |
         v
  generateDocument(serviceSlug, template, context, {
    clientSignatureBase64,     // from order record
    companySignatureBase64,    // downloaded from S3
    lawyerSignatureBase64,     // downloaded from S3
  })
         |
         v
  Phase 1: docxtemplater sets text markers (SIG_CLIENT, SIG_COMPANY, SIG_LAWYER)
         |
         v
  Phase 2: insertSignatureImages() replaces markers with DrawingML images
         |
         v
  Final DOCX buffer with embedded signature images
```

### 5.5 Signature Marker-to-Image Mapping

| Marker Text | Image File | Relationship Target | Template Location |
|-------------|-----------|---------------------|-------------------|
| `SIG_CLIENT` | `word/media/signature_client.png` | `media/signature_client.png` | Beneficiar cells in contracts, Nota de Informare |
| `SIG_COMPANY` | `word/media/signature_company.png` | `media/signature_company.png` | Prestator cell in Contract Prestari |
| `SIG_LAWYER` | `word/media/signature_lawyer.png` | `media/signature_lawyer.png` | Lawyer cell in Contract Asistenta |

### 5.6 Graceful Degradation

If a signature is not available, the corresponding placeholder is set to an empty string, leaving the signature cell blank in the output document. This means:

- Orders placed before client signature was implemented: no client signature in documents
- Company/lawyer signatures not uploaded in admin settings: those cells remain empty
- S3 download failures are caught and logged; generation continues without the failed signature

### 5.7 Admin Signature Upload

Signatures are managed in the admin panel under **Settings > "Date firma & Avocat"** tab.

**Upload flow:**

```
1. Admin clicks "Incarca semnatura" / "Incarca stampila" button
         |
         v
2. File picker opens (accepts image/jpeg, image/png, image/webp)
         |
         v
3. POST /api/upload
   Body: {
     category: "signatures",
     signatureType: "company_signature" | "lawyer_signature" | "lawyer_stamp"
   }
   Returns: { key: "signatures/company_signature/1708123456789.png", url: presigned_upload_url }
         |
         v
4. Client uploads file directly to S3 via presigned PUT URL
         |
         v
5. PATCH /api/admin/settings
   Body: { key: "company_data", value: { ...companyData, signature_s3_key: "signatures/..." } }
   Saves S3 key reference in admin_settings
         |
         v
6. Preview loaded via GET /api/upload/download?key=signatures/...
   Returns presigned download URL for image display
```

**Delete flow:**

```
1. Admin clicks "Sterge" button next to signature preview
         |
         v
2. PATCH /api/admin/settings
   Removes signature_s3_key / stamp_s3_key from the settings value
   (S3 object is NOT deleted -- orphaned but harmless)
         |
         v
3. Preview cleared from UI
```

**S3 key patterns for signatures:**

| Type | S3 Key Pattern | Settings Path |
|------|---------------|---------------|
| Company signature | `signatures/company_signature/{timestamp}.png` | `admin_settings['company_data'].signature_s3_key` |
| Lawyer signature | `signatures/lawyer_signature/{timestamp}.png` | `admin_settings['lawyer_data'].signature_s3_key` |
| Lawyer stamp | `signatures/lawyer_stamp/{timestamp}.png` | `admin_settings['lawyer_data'].stamp_s3_key` |

---

## 6. Contract Preview API

The contract preview API allows the order wizard to display a rendered preview of the combined contract document before the customer signs and submits.

### Endpoint

`POST /api/contracts/preview`

**Authentication:** None required (guests use this during the order flow).

### Request Body

```typescript
{
  serviceSlug: string;       // e.g. "cazier-judiciar"
  serviceName: string;       // e.g. "Cazier Judiciar Persoana Fizica"
  contact: {
    email: string;
    phone: string;
  };
  personalData?: {           // PF client data
    firstName?: string;
    lastName?: string;
    cnp?: string;
    documentSeries?: string;
    documentNumber?: string;
    address?: Record<string, string>;
  };
  companyData?: {            // PJ client data
    companyName?: string;
    cui?: string;
    registrationNumber?: string;
    address?: Record<string, string>;
  };
  billing?: {
    type?: string;           // "persoana_fizica" | "persoana_juridica"
    companyName?: string;
    cui?: string;
    companyAddress?: string;
  };
  totalPrice: number;
  servicePrice: number;
  orderId?: string;
  friendlyOrderId?: string;
}
```

### Response

```json
{
  "success": true,
  "html": "<p>Contract de Prestari Servicii nr. 000000 ...</p>"
}
```

### Generation Flow

```
1. Receive wizard form data (POST body)
         |
         v
2. Fetch company_data and lawyer_data from admin_settings
         |
         v
3. Build DocumentContext with DRAFT document numbers (contract: 0, imputernicire: 0)
         |
         v
4. generateDocument() with "contract-complet" template (no signatures for preview)
         |
         v
5. mammoth.convertToHtml() converts DOCX buffer to HTML
         |
         v
6. Post-process HTML:
   a. Remove empty/placeholder base64 images from template
   b. Clean up empty <strong> and <p> tags
   c. Smart signature placement in table cells (see below)
         |
         v
7. Return HTML for display in wizard's signature step
```

### Smart Signature Placement Logic

The preview HTML post-processor identifies signature tables by their content and applies appropriate CSS classes:

| Table | Identified By | Left Cell | Right Cell |
|-------|--------------|-----------|------------|
| Contract Prestari | Contains "PRESTATOR" | `sig-other` (prestator signature label) | `sig-placeholder` (client signature area) |
| Contract Asistenta | Contains "FORMA DE EXERCITARE" | `sig-other` (lawyer signature label) | `sig-placeholder` (client signature area) |
| Nota de Informare | Neither of the above | N/A (single column) | `sig-placeholder` (client signature area) |

The CSS classes (`sig-placeholder`, `sig-other`) are used by the wizard's signature step component to style the preview:
- `sig-placeholder` indicates where the client's drawn signature will appear
- `sig-other` shows a label for the prestator or lawyer signature that will be inserted server-side during document generation

---

## 7. S3 Storage Patterns

### Key Format (Current)

Generated documents are stored in S3 using the `generateDocumentKey()` function:

```
orders/{friendly_order_id}/{subfolder}/{filename}
```

**Subfolder mapping by document type:**

| Document Type Prefix | Subfolder |
|---------------------|-----------|
| `contract-` | `contracte/` |
| `imputernicire` | `imputerniciri/` |
| `cerere-` | `cereri/` |
| Other | `documente/` |

**Examples:**
```
orders/E-260216-12345/contracte/contract-prestari-E-260216-12345.docx
orders/E-260216-12345/contracte/contract-asistenta-E-260216-12345.docx
orders/E-260216-12345/imputerniciri/imputernicire-E-260216-12345.docx
orders/E-260216-12345/cereri/cerere-eliberare-pf-E-260216-12345.docx
```

### Key Format (Legacy -- @deprecated)

The old `generateContractKey()` function is still available but marked `@deprecated`:

```
contracts/{year}/{month}/{reference}/{filename}
```

**Reference value logic (legacy):**
- If a contract number was generated: the zero-padded number (e.g., `004257`)
- Otherwise: the friendly_order_id or UUID

**Note:** The download access control (`/api/upload/download`) supports both the new `orders/` prefix and the legacy `contracts/` prefix for backwards compatibility.

### Signature Storage

Signatures are stored in a separate S3 prefix:

```
signatures/
├── company_signature/
│   └── 1708123456789.png
├── lawyer_signature/
│   └── 1708234567890.png
└── lawyer_stamp/
    └── 1708345678901.png
```

Key generation uses `generateSignatureKey()` from `s3.ts`:

```typescript
function generateSignatureKey(signatureType: string, extension: string = 'png'): string {
  const timestamp = Date.now();
  return `signatures/${signatureType}/${timestamp}.${extension}`;
}
```

### Upload Metadata

Each S3 upload includes custom metadata:
- `order-id`: The order UUID
- `template`: Template name used
- `generated-by`: User ID of the admin who generated the document
- `generated-at`: ISO timestamp of generation

### MIME Types

Generated documents:
```
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Signatures:
```
image/png (or image/jpeg, image/webp)
```

---

## 8. Document Numbering System

### Atomic Counter via PostgreSQL RPC

Document counters are stored in `admin_settings` with key `document_counters`:

```json
{
  "contract_number": 4256,
  "imputernicire_number": 5738
}
```

### Number Allocation (replaced legacy `increment_document_counter`)

> **DEPRECATED:** The `increment_document_counter` RPC function has been replaced by the Number Registry System.
> See [`number-registry-system.md`](number-registry-system.md) for the full specification.
>
> New functions: `allocate_number()`, `find_existing_number()`, `void_number()`
> New tables: `number_ranges`, `number_registry`

```sql
-- DEPRECATED - kept for reference only
CREATE OR REPLACE FUNCTION increment_document_counter(counter_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
BEGIN
  SELECT (value->>counter_key)::INTEGER INTO current_val
  FROM admin_settings
  WHERE key = 'document_counters'
  FOR UPDATE;

  new_val := COALESCE(current_val, 0) + 1;

  UPDATE admin_settings
  SET value = jsonb_set(value, ARRAY[counter_key], to_jsonb(new_val)),
      updated_at = NOW()
  WHERE key = 'document_counters';

  RETURN new_val;
END;
$$ LANGUAGE plpgsql;
```

### Which templates trigger counter increments

| Template | Counter Key | Format |
|----------|------------|--------|
| `contract-prestari` | `contract_number` | `004257` (6-digit zero-padded) |
| `contract-asistenta` | `contract_number` | `004257` (same as prestari) |
| `imputernicire` | `imputernicire_number` | `SM005738` (series + 6-digit) |
| `cerere-eliberare-pf` | None | No sequential number |
| `cerere-eliberare-pj` | None | No sequential number |
| `contract-complet` | None | Preview only, uses `000000` |

**Important:** Counter increments are not rolled back if subsequent steps fail (S3 upload, DB insert). Gaps in numbering are acceptable for legal documents.

---

## 9. Admin UI Features

### ProcessingSection Component

Located in `src/app/admin/orders/[id]/page.tsx`, the ProcessingSection renders:

1. **Contextual Action Button** -- Changes based on current order status:
   - `paid` -> "Incepe procesarea"
   - `processing` -> "Marcheaza documente generate"
   - `documents_generated` -> "Marcheaza depusa la IPJ"
   - etc.

2. **Generated Documents List** -- Shows all generable document types:
   - Green check icon if document exists, gray circle if pending
   - Document number badge (if applicable)
   - "Previzualizare" button (opens mammoth server-side preview)
   - "Genereaza" / "Regenereaza" button (generates or re-generates document)

3. **Client Uploaded Documents** -- Shows uploaded documents:
   - `document_received` (from institution)
   - `document_final` (processed final document)

4. **Extra Options Checklist** -- Shows order extras (traducere, apostila) with completion toggles

### Document Actions

| Action | Button Label | Behavior |
|--------|-------------|----------|
| Generate | "Genereaza" | Creates new document from template with signatures embedded, uploads to S3, inserts into order_documents |
| Regenerate | "Regenereaza" | Same as generate; inserts new version first, then deletes old S3 objects and DB rows of same type (safe ordering) |
| Preview | "Previzualizare" | Opens mammoth server-side preview with presigned S3 URL |
| Download | "Descarca" | Fetches presigned S3 URL and triggers browser download of the original DOCX file |

---

## 10. Server-Side Document Preview (mammoth)

### How It Works

DOCX files cannot be natively rendered in the browser. The system uses a server-side API endpoint that fetches the DOCX from S3, converts it to HTML using the `mammoth` npm library, and returns a styled HTML page:

```typescript
const handlePreviewDocument = async (doc: OrderDocument) => {
  // Opens the server-side preview endpoint which converts DOCX to HTML
  const previewUrl = `/api/admin/orders/${order.id}/preview-document?key=${encodeURIComponent(doc.s3_key)}`;
  window.open(previewUrl, '_blank');
};
```

### Preview API Endpoint

`GET /api/admin/orders/[id]/preview-document?key=S3_KEY`

1. Authenticates admin user (`documents.view` permission - allows avocat role to preview)
2. Fetches DOCX from S3 via presigned URL
3. Converts DOCX to HTML using `mammoth.convertToHtml()`
4. Returns a styled HTML page with:
   - Dark toolbar with filename, order ID, "Descarca DOCX", "Printeaza" and "Inchide" buttons
   - Info note: "Aceasta este o previzualizare HTML. Pentru formatarea completa, folositi butonul Descarca DOCX."
   - White paper-like layout with the converted document content
   - Print-friendly CSS (`@media print` hides toolbar)
   - `?print=1` query parameter support for auto-print on page load

### Considerations

- No external service dependency (everything runs server-side)
- Works offline (no Google Docs Viewer or similar)
- Complex DOCX formatting (tables, images) is converted to HTML equivalents
- Embedded signature images are rendered as `<img>` tags in the HTML preview
- Conversion warnings are shown in a yellow banner if any
- For non-DOCX files (images, PDFs), the S3 presigned URL is opened directly
- "Descarca DOCX" button allows downloading the original file with full formatting directly from the preview page

---

## 11. Client Documents in Admin

### Visibility in Order Detail

The admin order detail page shows two categories of client-uploaded documents:

1. **KYC Documents** (from `order.documents` or `order.kyc_documents`):
   - CI front (Carte de identitate - fata)
   - CI back (Carte de identitate - verso)
   - Selfie with ID
   - Signature

2. **Company Documents** (PJ orders, from `order.customer_data.companyDocs`):
   - Certificat de Inregistrare
   - Certificat Constatator

### Admin Preview

Client documents stored in S3 are previewed the same way as generated documents -- via presigned URL. For images and PDFs, the URL is opened directly. For DOCX files, mammoth server-side preview is used.

---

## 12. Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/documents/generator.ts` | Core document generation (docxtemplater with nullGetter + pizzip + multi-signature marker setup) |
| `src/lib/documents/auto-generate.ts` | Auto-generates contracts at order submission time, logs failures to order_history |
| `src/lib/documents/signature-inserter.ts` | Post-processing: replace marker text with DrawingML inline images in DOCX ZIP |
| `src/app/api/admin/orders/[id]/generate-document/route.ts` | API endpoint for document generation (cleans up old versions, fetches signatures, passes to generator) |
| `src/app/api/admin/orders/[id]/preview-document/route.ts` | Server-side DOCX-to-HTML preview endpoint (mammoth) |
| `src/app/api/contracts/preview/route.ts` | Customer-facing contract preview (wizard signature step, no auth, uses contract-complet template) |
| `src/components/orders/modules/signature/ContractPreview.tsx` | Client-side contract preview with live signature replacement |
| `src/components/orders/modules/signature/SignatureStep.tsx` | Signature canvas + terms acceptance |
| `src/app/admin/orders/[id]/page.tsx` | Admin order detail page (ProcessingSection component) |
| `src/app/admin/settings/page.tsx` | Admin settings (includes signature upload in "Date firma & Avocat" tab) |
| `src/lib/aws/s3.ts` | S3 operations (uploadFile, downloadFile, deleteFile, generateDocumentKey, generateContractKey (deprecated), getClientSignatureBase64, getDownloadUrl) |
| `src/app/api/upload/route.ts` | Presigned upload URL generation (supports `signatures` category) |
| `src/app/api/upload/download/route.ts` | Presigned download URL generation (also allows contract access for order owners) |
| `src/app/api/orders/[id]/documents/[docId]/download/route.ts` | Client document download endpoint (presigned S3 URL, auth + ownership check) |
| `src/app/api/orders/[id]/submit/route.ts` | Order submission with audit context capture (IP, UA, timestamp, document hash, consent) |
| `src/templates/cazier-judiciar/*.docx` | Service-specific DOCX templates |
| `src/templates/shared/*.docx` | Shared DOCX templates (fallback, includes contract-complet.docx) |
| `src/templates/create-templates.mjs` | Script to create template files |
| `src/lib/admin/permissions.ts` | RBAC permission checking (orders.manage required) |

### Database Tables

| Table | Purpose |
|-------|---------|
| `order_documents` | Tracks all documents per order (s3_key, type, document_number, visible_to_client) |
| `order_option_status` | Tracks completion of extra options (traducere, apostila) |
| `order_history` | Audit log of all order events including document generation |
| `admin_settings` | Company data (incl. `signature_s3_key`), lawyer data (incl. `signature_s3_key`, `stamp_s3_key`), document counters |

### Type Definitions

```typescript
// src/lib/documents/generator.ts

interface GenerateDocumentOptions {
  clientSignatureBase64?: string;   // Client's drawn signature (base64 PNG)
  companySignatureBase64?: string;  // Company/prestator predefined signature (base64 PNG)
  lawyerSignatureBase64?: string;   // Lawyer/avocat predefined signature (base64 PNG)
}

interface CompanyData {
  name: string;
  cui: string;
  registration_number: string;
  address: string;
  iban: string;
  bank: string;
  email: string;
  phone: string;
  signature_s3_key?: string;  // S3 key for company signature PNG
}

interface LawyerData {
  cabinet_name: string;
  lawyer_name: string;
  professional_address: string;
  cif: string;
  cnp?: string;               // Lawyer CNP (used in cerere-eliberare-pj template)
  ci_series?: string;         // Lawyer ID card series
  ci_number?: string;         // Lawyer ID card number
  imputernicire_series: string;
  fee: number;
  signature_s3_key?: string;  // S3 key for lawyer signature PNG
  stamp_s3_key?: string;      // S3 key for lawyer stamp PNG
}

// src/lib/documents/signature-inserter.ts

interface SignatureEntry {
  marker: string;      // Text marker to find (e.g. 'SIG_CLIENT')
  base64: string;      // Base64-encoded PNG image data
  name: string;        // Unique name for image file (e.g. 'signature_client')
  widthPt?: number;    // Width in points (default: 240)
  heightPt?: number;   // Height in points (default: 80)
}
```

### Related Documentation

| Document | Location |
|----------|----------|
| Workflow Design | `docs/admin/workflow-design.md` |
| Admin Architecture | `docs/admin/architecture.md` |
| RBAC Permissions | `docs/admin/rbac-permissions.md` |
| AWB Generation | `docs/technical/specs/awb-generation-tracking.md` |
| S3 Setup | `docs/deployment/AWS_S3_SETUP.md` |

---

## 13. Client Document Downloads

### Overview

Clients can download documents that have been generated and marked as `visible_to_client = true` in the `order_documents` table. This enables customers to access their contracts, powers of attorney, and other generated documents directly from their account or the public order status page.

### API Endpoint

`GET /api/orders/[id]/documents/[docId]/download`

**Authentication:** Required. User must be authenticated and own the order.

**Response:**
```json
{
  "success": true,
  "url": "https://eghiseul-documents.s3.eu-central-1.amazonaws.com/...",
  "fileName": "contract-prestari-E-260216-12345.docx"
}
```

The URL is a presigned S3 URL valid for 15 minutes.

### Updated Endpoints

| Endpoint | Change |
|----------|--------|
| `GET /api/orders/[id]` | Now includes `documents` array in response (from `order_documents` where `visible_to_client = true`) |
| `GET /api/orders/status` | Now includes `documents` array in public status response |
| `GET /api/upload/download` | Now allows contract file access if user owns the order (checked via `order_documents` table) |

### Client Pages

| Page | URL | Behavior |
|------|-----|----------|
| Account order detail | `/account/orders/[id]` | Shows documents section with download buttons (presigned URL download via API) |
| Public order status | `/comanda/status` | Shows document list with note to login for downloads |

### Access Control

1. User must be authenticated (Supabase session)
2. User must own the order (`order.user_id = session.user.id`)
3. Document must exist in `order_documents` for the given order
4. Document must have `visible_to_client = true`

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/orders/[id]/documents/[docId]/download/route.ts` | Download endpoint with auth + ownership check |
| `src/app/api/orders/[id]/route.ts` | Order detail API (includes documents array) |
| `src/app/api/orders/status/route.ts` | Public status API (includes documents array) |
| `src/app/api/upload/download/route.ts` | Presigned download URL (contract access for order owners) |
| `src/app/(customer)/account/orders/[id]/page.tsx` | Account order detail with download buttons |
| `src/app/comanda/status/page.tsx` | Public status page with document list |

---

## 14. Contract Legal Validity

### Overview

To ensure the legal validity of electronically signed contracts under Romanian law (Law 214/2024) and EU regulation (eIDAS Art. 25), the system captures comprehensive signature metadata at the time of order submission.

### Audit Context Capture

When the order is submitted via `POST /api/orders/[id]/submit`, the server captures:

| Field | Source | Purpose |
|-------|--------|---------|
| `ip_address` | `x-forwarded-for` / `x-real-ip` headers | Identify signing location |
| `user_agent` | `user-agent` header | Identify signing device |
| `signed_at` | `new Date().toISOString()` (server-side) | Authoritative signing timestamp |
| `document_hash` | SHA-256 of contract content | Prove document integrity (not tampered after signing) |

The audit context is extracted via `getAuditContext(request)` in the submit route.

### Consent State

The wizard collects explicit consent from the client at two steps:

**Signature Step (SignatureStep.tsx):**
- `signature_consent`: Consent to use drawn signature as electronic signature (references Law 214/2024 and eIDAS Art. 25)

**Review Step (review-step.tsx):**
- `terms_accepted`: Terms of service acceptance
- `privacy_accepted`: Privacy policy acceptance
- `withdrawal_waiver`: Waiver of right of withdrawal per OUG 34/2014, art. 16 lit. (a) -- mandatory because service delivery begins immediately

All consent flags include a `consent_timestamp` (ISO string).

### Data Persistence

Signature metadata is stored in the order's `customer_data.signature_metadata` JSONB field:

```json
{
  "signature_metadata": {
    "ip_address": "86.124.xxx.xxx",
    "user_agent": "Mozilla/5.0 ...",
    "signed_at": "2026-02-17T14:30:00.000Z",
    "document_hash": "a3f2b8c1d4e5...",
    "consent": {
      "terms_accepted": true,
      "privacy_accepted": true,
      "signature_consent": true,
      "withdrawal_waiver": true,
      "consent_timestamp": "2026-02-17T14:29:55.000Z"
    }
  }
}
```

### Order History & Audit

- An `order_history` entry is created with `event_type: order_submitted`, including the `document_hash` and consent data in the event details
- `logAudit()` is called for compliance-grade audit logging

### Legal References

| Law | Article | Purpose |
|-----|---------|---------|
| Law 214/2024 | - | Romanian Electronic Signature Law -- establishes legal validity of electronic signatures |
| eIDAS Regulation | Art. 25 | EU-wide recognition of electronic signatures -- an electronic signature shall not be denied legal effect solely on the grounds that it is in electronic form |
| OUG 34/2014 | Art. 16 lit. (a) | Consumer rights -- exception to 14-day withdrawal right when service performance begins with consumer's explicit consent and acknowledgment of withdrawal waiver |

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/orders/[id]/submit/route.ts` | Server-side audit context capture, signature metadata persistence, document hash generation |
| `src/components/orders/modules/signature/SignatureStep.tsx` | Consent UI with Law 214/2024 and eIDAS Art. 25 references |
| `src/components/orders/steps-modular/review-step.tsx` | Withdrawal waiver checkbox (OUG 34/2014) |
| `src/components/orders/modular-order-wizard.tsx` | Sends consent data in submission body |
| `src/providers/modular-wizard-provider.tsx` | ConsentState management, updateConsent action |
| `src/types/verification-modules.ts` | ConsentState type definition |

---

## Known Issues

No open issues at this time.

### Resolved Issues

| Issue | Template | Resolved | Notes |
|-------|----------|----------|-------|
| `cerere-eliberare-pj.docx` overflows to 2 pages | `cerere-eliberare-pj.docx` | 2026-02-18 | Fixed by reducing bottom margin from ~5cm to ~1.8cm and compacting spacing. Same fix applied preventively to `cerere-eliberare-pf.docx`. |
| `imputernicire.docx` missing `{{NUMECLIENT}}` | `imputernicire.docx` | 2026-02-18 | Added the placeholder (bold) to the template. |
| `cerere-eliberare-pj.docx` lawyer section uses hardcoded data | `cerere-eliberare-pj.docx` | 2026-02-18 | Replaced `{{LAWYER_NAME}}` with `{{LAWYER_LASTNAME}}` + `{{LAWYER_FIRSTNAME}}` for proper name splitting. Changed "actul de identitate seria" to "CI seria". Replaced hardcoded CNP digits with `{{LAWYER_CNP}}` placeholder. Both `cazier-judiciar/` and `shared/` templates updated. |

---

**Last Updated:** 2026-02-18
