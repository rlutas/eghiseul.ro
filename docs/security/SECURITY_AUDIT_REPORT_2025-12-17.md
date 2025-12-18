# Security Audit Report - eGhiseul.ro Platform

**Report Date:** 2025-12-17
**Audit Scope:** Personal Data (PII) Handling, OCR Processing, GDPR Compliance
**Risk Level:** CRITICAL
**Auditor:** Security Team
**Platform Version:** Sprint 2 (Services & Orders API)

---

## Executive Summary

This comprehensive security audit identifies CRITICAL vulnerabilities in the eGhiseul.ro platform's handling of highly sensitive personal data including:
- Romanian CNP (Personal Numeric Code - equivalent to SSN)
- ID card series/numbers
- Full name, birth date, address information
- KYC documents (ID card images, selfies)
- Digital signatures

**Overall Security Posture:** INSUFFICIENT - IMMEDIATE ACTION REQUIRED

**Critical Findings:**
1. No encryption at rest for sensitive PII in database
2. Unencrypted storage of CNP, CI series/numbers in Supabase
3. Google Gemini AI receives raw ID card images with PII
4. No audit logging for PII access
5. No data retention policies implemented
6. No secure deletion procedures
7. Client-side temporary storage of sensitive images
8. Missing GDPR-compliant data processing agreements

**Compliance Status:**
- GDPR Art. 32 (Security of Processing): NON-COMPLIANT
- GDPR Art. 30 (Records of Processing): PARTIAL
- Romanian Law 190/2018: NON-COMPLIANT
- PSD2 (Payment Data): PARTIAL

---

## 1. Current Implementation Analysis

### 1.1 Data Flow Mapping

```
User Upload ID Card Image
        ↓
Personal Data Step Component (Client-side)
        ↓
FileReader → Base64 Encoding (In-Memory)
        ↓
POST /api/ocr/extract
        ↓
Google Gemini AI (External Service)
        ↓
OCR Response (JSON with PII)
        ↓
React State (orderWizardReducer)
        ↓
POST /api/orders (Supabase)
        ↓
orders.customer_data (JSONB) - UNENCRYPTED
orders.kyc_documents (JSONB) - URLs + OCR data
```

### 1.2 Database Schema Review

**File:** `/Users/raullutas/eghiseul.ro/supabase/migrations/002_services.sql`

**orders Table - Lines 247-371:**

```sql
CREATE TABLE IF NOT EXISTS orders (
  -- Personal Identifiable Information (CRITICAL)
  customer_data JSONB NOT NULL DEFAULT '{}',
  -- Structure contains:
  -- {
  --   "personal": {
  --     "cnp": "1850101123456",           ← CRITICAL: No encryption
  --     "first_name": "Ion",               ← Sensitive
  --     "last_name": "Popescu",            ← Sensitive
  --     "birth_date": "1985-01-01",        ← Sensitive
  --     "ci_series": "XV",                 ← CRITICAL: Government ID
  --     "ci_number": "517628",             ← CRITICAL: Government ID
  --     "address": "..."                   ← Sensitive
  --   }
  -- }

  kyc_documents JSONB DEFAULT '{}',
  -- Structure contains:
  -- {
  --   "identity_card_front": "s3://...", ← File URL
  --   "ocr_data": {
  --     "cnp": "1850101123456",           ← DUPLICATE: No encryption
  --     "confidence": 0.98
  --   }
  -- }
)
```

**FINDING:** No column-level encryption, no field-level encryption, data stored in plain JSONB.

### 1.3 OCR API Endpoint Analysis

**File:** `/Users/raullutas/eghiseul.ro/src/app/api/ocr/extract/route.ts`

**Lines 42-203:**

```typescript
export async function POST(request: NextRequest) {
  // ISSUE 1: No authentication check
  // Anyone with the API endpoint can call this

  const body = await request.json();
  const { imageBase64, mimeType } = body;

  // ISSUE 2: No validation of image size limits
  // ISSUE 3: No rate limiting implemented
  // ISSUE 4: Base64 image stored in memory

  // Send to Google Gemini AI
  const result = await extractFromDocument(imageBase64, mimeType);
  // ISSUE 5: Raw PII sent to external AI service
  // ISSUE 6: No DPA (Data Processing Agreement) verified

  return NextResponse.json({
    success: true,
    data: {
      ocr: result,  // Contains CNP, name, address
      timestamp: new Date().toISOString(),
    },
  });
  // ISSUE 7: No audit log of PII extraction
}
```

**CRITICAL FINDINGS:**

1. **No Authentication:** OCR endpoint is public - Line 42
2. **External AI Processing:** Google Gemini receives full ID card images with all PII - Line 82
3. **No Audit Logging:** No record of who accessed/extracted PII
4. **No Rate Limiting:** Vulnerable to abuse
5. **No Input Validation:** Missing file size/type restrictions beyond basic checks

### 1.4 Personal Data Component Analysis

**File:** `/Users/raullutas/eghiseul.ro/src/components/orders/steps/personal-data-step.tsx`

**Lines 344-508:**

```typescript
const handleFileSelect = async (
  type: 'ci_front' | 'ci_back',
  file: File
) => {
  // ISSUE 1: Client-side file processing
  const reader = new FileReader();
  const imageBase64 = await base64Promise;
  // Image stored in browser memory temporarily

  // ISSUE 2: Preview URL stored in component state
  const preview = URL.createObjectURL(file);
  setState({ preview });

  // ISSUE 3: Send full base64 image to API
  const response = await fetch('/api/ocr/extract', {
    method: 'POST',
    body: JSON.stringify({
      imageBase64,  // Full ID card image
      mimeType: file.type,
    }),
  });

  // ISSUE 4: OCR data stored in React state
  const extracted = ocr.extractedData;
  if (extracted.cnp) {
    handleCNPChange(extracted.cnp);  // CNP in component state
  }

  // ISSUE 5: Document stored with extracted PII
  updateKYCDocuments({
    ci_front: {
      file_url: preview,  // Blob URL, not secure storage
      validation_result: {
        extractedData: extracted,  // Full PII in Redux
      }
    }
  });
}
```

**CRITICAL FINDINGS:**

1. **Client-Side Storage:** PII stored in React state/Redux (Lines 409-462)
2. **Browser Memory Exposure:** Base64 images in memory
3. **No Encryption in Transit Beyond HTTPS:** Relies only on TLS
4. **Temporary URLs:** Blob URLs stored in state, not immediately cleared

### 1.5 Order Wizard State Management

**File:** `/Users/raullutas/eghiseul.ro/src/providers/order-wizard-provider.tsx`

**Lines 29-46:**

```typescript
const initialState: OrderWizardState = {
  personalData: {},  // ISSUE: Will contain CNP, CI series/number
  kycDocuments: {},  // ISSUE: Will contain OCR data with PII
  // ...
};

// Lines 336-374: saveDraft function
const saveDraft = useCallback(async () => {
  const response = await fetch('/api/orders', {
    method: state.orderId ? 'PATCH' : 'POST',
    body: JSON.stringify({
      customer_data: {
        personal: state.personalData,  // CNP, CI info
      },
      kyc_documents: state.kycDocuments,  // OCR data
    }),
  });
  // ISSUE: No encryption before sending
  // ISSUE: Auto-saves every 30 seconds (Line 419)
});
```

**CRITICAL FINDINGS:**

1. **Unencrypted State:** PII stored in React Context
2. **Auto-Save to Database:** Saves unencrypted PII every 30 seconds
3. **No Client-Side Encryption:** Data sent as plaintext JSON over HTTPS

### 1.6 Google Gemini AI Integration

**File:** `/Users/raullutas/eghiseul.ro/src/lib/services/document-ocr.ts`

**Lines 66-183:**

```typescript
export async function extractFromCIFront(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analizează această imagine...`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: imageBase64,  // CRITICAL: Full ID card sent to Google
      },
    },
  ]);
  // Google now has access to:
  // - CNP (Romanian SSN)
  // - Full name
  // - Birth date, place
  // - Address
  // - ID card series/number
  // - Document image itself
}
```

**CRITICAL FINDINGS:**

1. **Third-Party AI Processing:** Google receives complete ID card images
2. **No Data Processing Agreement:** Unknown if Google DPA covers this use
3. **Data Retention Unknown:** How long does Google keep the images?
4. **Model Version:** Using experimental model (2.0-flash-exp) - stability/security unknown
5. **No On-Premise Alternative:** Complete dependency on external AI

---

## 2. Identified Security Risks

### 2.1 CRITICAL Risks (Immediate Action Required)

| Risk ID | Description | Impact | Affected Components | CVSS Score |
|---------|-------------|--------|---------------------|------------|
| **CRIT-001** | CNP stored unencrypted in database | Data breach exposes Romanian SSN equivalent | `orders.customer_data`, `orders.kyc_documents` | 9.8 |
| **CRIT-002** | Google Gemini AI receives raw ID card images | Third-party exposure of government documents | `/api/ocr/extract`, `document-ocr.ts` | 9.1 |
| **CRIT-003** | No authentication on OCR endpoint | Public API for PII extraction | `/api/ocr/extract` | 9.3 |
| **CRIT-004** | CI series/number stored in plaintext | Government-issued ID compromise | `orders.customer_data` | 9.5 |
| **CRIT-005** | No audit logging for PII access | Cannot detect/investigate breaches | All API endpoints | 8.7 |

### 2.2 HIGH Risks (Action Required Within 30 Days)

| Risk ID | Description | Impact | Affected Components | CVSS Score |
|---------|-------------|--------|---------------------|------------|
| **HIGH-001** | No data retention policies implemented | GDPR non-compliance | Database, file storage | 7.8 |
| **HIGH-002** | No secure deletion procedures | RTBF (Right to be Forgotten) violations | All data stores | 7.5 |
| **HIGH-003** | Client-side PII in React state | Browser memory dumps can expose data | `personal-data-step.tsx` | 7.2 |
| **HIGH-004** | No rate limiting on OCR API | DoS, abuse, cost escalation | `/api/ocr/extract` | 7.0 |
| **HIGH-005** | Auto-save exposes PII frequently | Increases attack surface | `order-wizard-provider.tsx` | 6.9 |
| **HIGH-006** | No DPA with Google for AI processing | GDPR Art. 28 non-compliance | Google Gemini integration | 8.1 |

### 2.3 MEDIUM Risks (Action Required Within 90 Days)

| Risk ID | Description | Impact | Affected Components |
|---------|-------------|--------|---------------------|
| **MED-001** | No column-level masking for admins | Admin over-access to PII | Supabase RLS policies |
| **MED-002** | KYC documents stored with OCR data | Duplicate PII storage | `orders.kyc_documents` |
| **MED-003** | No encryption key rotation policy | Long-term key compromise risk | Infrastructure |
| **MED-004** | Missing security headers | XSS, clickjacking vulnerabilities | Next.js configuration |
| **MED-005** | No PII anonymization for analytics | Tracking with identifiable data | Future analytics |

---

## 3. GDPR Compliance Assessment

### 3.1 GDPR Article 32 - Security of Processing

**Requirement:**
> "Taking into account the state of the art...implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including...the pseudonymisation and encryption of personal data."

**Current Status:** NON-COMPLIANT

**Gaps:**

1. No encryption at rest for CNP, CI series/number
2. No pseudonymization techniques employed
3. Security measures insufficient for "high risk" processing (ID documents)

**Legal Risk:** Fines up to 10,000,000 EUR or 2% of annual turnover

### 3.2 GDPR Article 30 - Records of Processing Activities

**Requirement:** Maintain records of processing activities including:
- Categories of personal data
- Categories of recipients (third parties)
- Technical and organizational security measures

**Current Status:** PARTIAL COMPLIANCE

**Gaps:**

1. No documented record of Google Gemini AI as data processor
2. No record of security measures for each data category
3. Missing data flow diagrams for compliance documentation

### 3.3 GDPR Article 28 - Processor Requirements

**Requirement:** Data processors must:
- Process data only on documented instructions
- Ensure persons authorized to process have committed to confidentiality
- Implement appropriate security measures
- Provide signed Data Processing Agreement (DPA)

**Current Status:** NON-COMPLIANT for Google Gemini

**Gaps:**

1. No verified DPA with Google for AI processing
2. Unknown data retention by Google AI services
3. Unknown Google employee access to processed images
4. No documented instructions limiting Google's data usage

### 3.4 GDPR Article 5 - Data Minimization

**Current Practice:**
- Storing full OCR results in `kyc_documents.ocr_data`
- Duplicate CNP in both `customer_data` and `kyc_documents`

**Required:**
- Extract only necessary fields
- Delete OCR raw data after validation
- Store CNP in single encrypted location

### 3.5 GDPR Article 17 - Right to Erasure (RTBF)

**Current Status:** NOT IMPLEMENTED

**Required Features (Missing):**

1. Automated deletion workflows
2. Data deletion API endpoints
3. Pseudonymization for legal retention (contracts)
4. Customer self-service deletion requests
5. 30-day response SLA tracking

**Exception Handling (Missing):**
- Cannot distinguish between deletable data and legal obligations (10-year retention)
- No system to preserve invoices while erasing other PII

---

## 4. Specific Vulnerabilities by Component

### 4.1 Database (Supabase PostgreSQL)

**File:** `supabase/migrations/002_services.sql`

**Vulnerabilities:**

```sql
-- Line 295: customer_data JSONB NOT NULL DEFAULT '{}'
-- ISSUE: No encryption, stores:
{
  "personal": {
    "cnp": "1850101123456",        // CRITICAL: Plaintext
    "ci_series": "XV",              // CRITICAL: Plaintext
    "ci_number": "517628",          // CRITICAL: Plaintext
    "first_name": "Ion",
    "last_name": "Popescu",
    "birth_date": "1985-01-01",
    "address": {...}
  }
}

-- Line 329: kyc_documents JSONB DEFAULT '{}'
-- ISSUE: Duplicate PII in OCR data
{
  "ocr_data": {
    "cnp": "1850101123456",       // CRITICAL: Duplicate
    "name": "ION POPESCU",
    "confidence": 0.98
  }
}
```

**RLS Policies Review:**

```sql
-- Lines 426-430: Users can view own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
-- ✓ ADEQUATE: User isolation working

-- Lines 432-436: Users can insert own orders
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- ✓ ADEQUATE: Prevents inserting orders for other users

-- Lines 451-461: Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
-- ⚠️ CONCERN: Admins see ALL PII without masking
-- RECOMMENDATION: Implement column-level masking for CNP
```

**Recommendations:**

1. **Implement pgcrypto for column-level encryption:**

```sql
-- Add encrypted columns
ALTER TABLE orders
ADD COLUMN customer_data_encrypted BYTEA;

-- Create encryption/decryption functions
CREATE FUNCTION encrypt_customer_data(data JSONB, key TEXT)
RETURNS BYTEA AS $$
  SELECT pgp_sym_encrypt(data::TEXT, key);
$$ LANGUAGE SQL;

CREATE FUNCTION decrypt_customer_data(encrypted BYTEA, key TEXT)
RETURNS JSONB AS $$
  SELECT pgp_sym_decrypt(encrypted, key)::JSONB;
$$ LANGUAGE SQL;
```

2. **Implement selective column masking for admins:**

```sql
CREATE FUNCTION mask_cnp(cnp TEXT) RETURNS TEXT AS $$
  SELECT SUBSTRING(cnp, 1, 1) || '***********' || SUBSTRING(cnp, 13, 1);
$$ LANGUAGE SQL;

-- Create masked view for non-super-admins
CREATE VIEW orders_masked AS
SELECT
  id, order_number, status,
  jsonb_set(
    customer_data,
    '{personal,cnp}',
    to_jsonb(mask_cnp(customer_data->'personal'->>'cnp'))
  ) AS customer_data,
  total_price, currency, created_at
FROM orders;
```

### 4.2 OCR API Endpoint

**File:** `/Users/raullutas/eghiseul.ro/src/app/api/ocr/extract/route.ts`

**Vulnerabilities:**

```typescript
// Line 42: No authentication
export async function POST(request: NextRequest) {
  // MISSING: Authentication check
  // MISSING: Rate limiting
  // MISSING: Input validation (file size)

  // Line 55: Anyone can call this
  const body = await request.json();

  // Line 82: Sends to external AI
  const result = await extractFromDocument(imageBase64, mimeType);

  // Line 84: Returns PII in response
  return NextResponse.json({
    data: { ocr: result }  // Contains CNP, name, etc.
  });
}
```

**Recommended Secure Implementation:**

```typescript
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // 1. AUTHENTICATION
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. RATE LIMITING
  const rateLimitResult = await rateLimit({
    identifier: user.id,
    limit: 5,
    window: 60000, // 1 minute
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // 3. INPUT VALIDATION
  const body = await request.json();

  // Validate base64 size (max 10MB)
  const sizeInBytes = (body.imageBase64.length * 3) / 4;
  if (sizeInBytes > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'File too large. Max 10MB.' },
      { status: 413 }
    );
  }

  // 4. AUDIT LOGGING
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'ocr_extract',
    resource_type: 'kyc_document',
    ip_address: request.ip,
    user_agent: request.headers.get('user-agent'),
    metadata: {
      document_type: body.documentType,
      mime_type: body.mimeType,
    }
  });

  // 5. OCR PROCESSING
  const result = await extractFromDocument(body.imageBase64, body.mimeType);

  // 6. SENSITIVE DATA REDACTION IN LOGS
  console.log('OCR Success', {
    user_id: user.id,
    confidence: result.confidence,
    // DO NOT LOG: CNP, names, addresses
  });

  return NextResponse.json({
    success: true,
    data: { ocr: result }
  });
}
```

### 4.3 Google Gemini AI Integration

**File:** `/Users/raullutas/eghiseul.ro/src/lib/services/document-ocr.ts`

**Critical Issues:**

1. **No Data Processing Agreement Verification**
   - Using Google AI without documented DPA
   - GDPR Art. 28 requires written contract

2. **Unknown Data Retention**
   - Google may store images for model training
   - No documented data deletion timeline

3. **Model Experimental Status**
   - Using `gemini-2.0-flash-exp` (experimental)
   - Production systems should use stable models

**Recommendations:**

1. **Immediate: Verify Google Cloud AI DPA**

```typescript
// Add DPA verification check
const GOOGLE_DPA_VERIFIED = process.env.GOOGLE_DPA_VERIFIED === 'true';

export async function extractFromCIFront(...) {
  if (!GOOGLE_DPA_VERIFIED) {
    throw new Error(
      'Google AI Data Processing Agreement not verified. ' +
      'OCR processing disabled for GDPR compliance.'
    );
  }

  // Use stable model, not experimental
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro'  // Stable model
  });

  // Add explicit data deletion request
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: imageBase64 } }
  ], {
    // Google AI supports deletion request in config
    safetySettings: { /* ... */ },
    generationConfig: {
      candidateCount: 1,
    }
  });

  // Document in audit log
  await logAIProcessing({
    provider: 'google_gemini',
    model: 'gemini-1.5-pro',
    data_type: 'identity_document',
    purpose: 'kyc_verification',
    dpa_version: 'v2024-01',
  });

  return result;
}
```

2. **Medium-Term: Implement On-Premise OCR Alternative**

```typescript
// Use Tesseract.js for on-premise OCR
import Tesseract from 'tesseract.js';

export async function extractFromCIFrontLocal(
  imageBase64: string
): Promise<OCRResult> {
  // Process locally, no external service
  const result = await Tesseract.recognize(
    imageBase64,
    'ron+eng',  // Romanian + English
    {
      logger: m => console.log(m),
    }
  );

  // Parse extracted text locally
  const parsedData = parseRomanianIDCard(result.data.text);

  return {
    success: true,
    confidence: result.data.confidence,
    extractedData: parsedData,
    issues: [],
  };
}

// Allow users to choose
const USE_LOCAL_OCR = process.env.OCR_MODE === 'local';
```

### 4.4 Order API Endpoints

**File:** `/Users/raullutas/eghiseul.ro/src/app/api/orders/route.ts`

**Issues:**

```typescript
// Lines 119-134: Order creation
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    customer_data: customerData,  // ISSUE: No encryption
    kyc_documents: kycDocuments,  // ISSUE: PII in OCR data
    // ...
  });

// MISSING: Audit logging
// MISSING: PII validation
// MISSING: Duplicate CNP check
```

**Recommendations:**

```typescript
export async function POST(request: NextRequest) {
  // ... authentication ...

  // 1. VALIDATE PII BEFORE STORAGE
  const validatedData = await validateCustomerData(customerData);

  if (!validatedData.valid) {
    return NextResponse.json(
      { error: 'Invalid customer data', details: validatedData.errors },
      { status: 400 }
    );
  }

  // 2. CHECK FOR DUPLICATE ORDERS (CNP-based)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .eq('service_id', serviceId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .single();

  if (existingOrder) {
    return NextResponse.json(
      { error: 'Duplicate order detected within 24 hours' },
      { status: 409 }
    );
  }

  // 3. ENCRYPT SENSITIVE FIELDS
  const encryptedData = await encryptCustomerData({
    cnp: customerData.personal.cnp,
    ci_series: customerData.personal.ci_series,
    ci_number: customerData.personal.ci_number,
  });

  // 4. REDACT OCR DATA (keep only validation result)
  const sanitizedKYC = {
    ci_front: {
      file_url: kycDocuments.ci_front.file_url,
      uploaded_at: kycDocuments.ci_front.uploaded_at,
      validation_result: {
        valid: kycDocuments.ci_front.validation_result.valid,
        confidence: kycDocuments.ci_front.validation_result.confidence,
        // REMOVE: extractedData with PII
      }
    }
  };

  // 5. CREATE ORDER WITH ENCRYPTED DATA
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      customer_data_encrypted: encryptedData,  // New encrypted column
      kyc_documents: sanitizedKYC,  // Redacted
      // ...
    });

  // 6. AUDIT LOG
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'order_created',
    resource_type: 'order',
    resource_id: order.id,
    ip_address: request.ip,
    metadata: {
      service_id: serviceId,
      total_price: totalPrice,
    }
  });

  return NextResponse.json({ success: true, data: { order } });
}
```

---

## 5. Data Retention & Deletion

### 5.1 Current State: NOT IMPLEMENTED

**GDPR Requirement:** Art. 5(1)(e) - Storage Limitation
> "Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary."

**Legal Requirements per docs/legal/compliance-research.md:**

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| Contracts | 10 years | Romanian Fiscal Code (Law 82/1991, Art. 22) |
| Invoices | 10 years | ANAF requirements |
| KYC Documents | Service duration + 5 years | Anti-fraud, legal claims |
| ID Card Copies | Service duration + 3 years | Contract performance, Civil Code Art. 2517 |
| Transaction Logs | 5 years | PSD2 (Payment Services Directive 2) |
| Marketing Consents | Until withdrawal or 2 years inactivity | Consent (Art. 6(1)(a)) |

### 5.2 Missing Implementation

**Required Features:**

1. **Automated Deletion Workflows**
   - Scheduled jobs to identify expired data
   - Soft delete → hard delete pipeline
   - Pseudonymization for legal retention

2. **Data Lifecycle Management**
   - Retention metadata on each record
   - Deletion eligibility checks
   - Cascading deletion for related records

3. **Right to Erasure (RTBF) Handler**
   - Customer-facing deletion request form
   - Admin review queue
   - 30-day SLA tracking

### 5.3 Recommended Implementation

**Database Schema Changes:**

```sql
-- Add retention metadata to orders table
ALTER TABLE orders
ADD COLUMN retention_expires_at TIMESTAMPTZ,
ADD COLUMN deletion_requested_at TIMESTAMPTZ,
ADD COLUMN deletion_approved_at TIMESTAMPTZ,
ADD COLUMN deletion_completed_at TIMESTAMPTZ,
ADD COLUMN pseudonymized BOOLEAN DEFAULT FALSE;

-- Create deletion requests table
CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  request_type VARCHAR(50) CHECK (request_type IN ('full_account', 'specific_order', 'marketing_only')),
  reason TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,

  -- What was deleted
  deleted_records JSONB DEFAULT '{}',
  -- What was retained (with reason)
  retained_records JSONB DEFAULT '{}',

  CONSTRAINT deletion_sla CHECK (completed_at IS NULL OR completed_at <= requested_at + INTERVAL '30 days')
);

-- Function to calculate retention expiry
CREATE FUNCTION calculate_retention_expiry(order_created TIMESTAMPTZ, order_status VARCHAR)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE
    WHEN order_status = 'completed' THEN
      -- Contracts: 10 years from completion
      RETURN order_created + INTERVAL '10 years';
    WHEN order_status IN ('cancelled', 'refunded') THEN
      -- Cancelled orders: 3 years (legal claims period)
      RETURN order_created + INTERVAL '3 years';
    ELSE
      -- Active orders: indefinite
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention expiry on status change
CREATE OR REPLACE FUNCTION set_retention_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND
     NEW.status IN ('completed', 'cancelled', 'refunded') THEN
    NEW.retention_expires_at := calculate_retention_expiry(NEW.created_at, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_set_retention_expiry
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_retention_expiry();
```

**Automated Deletion Job:**

```typescript
// src/lib/cron/data-retention.ts
import { createClient } from '@/lib/supabase/server';

export async function runDataRetentionJob() {
  const supabase = createClient();

  // 1. Find orders eligible for deletion
  const { data: expiredOrders } = await supabase
    .from('orders')
    .select('id, order_number, user_id, customer_data')
    .lte('retention_expires_at', new Date().toISOString())
    .is('deletion_completed_at', null)
    .limit(100);

  for (const order of expiredOrders || []) {
    try {
      // 2. Pseudonymize instead of delete (for financial records)
      const pseudonymized = {
        personal: {
          first_name: `User_${order.id.substring(0, 8)}`,
          last_name: 'DELETED',
          cnp: 'XXXXXXXXXXXXX',
          ci_series: 'XX',
          ci_number: 'XXXXXX',
          // Keep only: birth_date (for statistics)
          birth_date: order.customer_data.personal.birth_date,
        },
        contact: {
          email: `deleted_${order.id}@eghiseul.ro`,
          phone: '+40XXXXXXXXX',
        }
      };

      // 3. Update with pseudonymized data
      await supabase
        .from('orders')
        .update({
          customer_data: pseudonymized,
          pseudonymized: true,
          deletion_completed_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // 4. Delete KYC documents from S3
      if (order.kyc_documents) {
        await deleteS3Objects([
          order.kyc_documents.ci_front?.file_url,
          order.kyc_documents.ci_back?.file_url,
          order.kyc_documents.selfie?.file_url,
        ]);
      }

      // 5. Clear KYC JSONB
      await supabase
        .from('orders')
        .update({ kyc_documents: {} })
        .eq('id', order.id);

      // 6. Audit log
      await supabase.from('audit_logs').insert({
        action: 'data_pseudonymized',
        resource_type: 'order',
        resource_id: order.id,
        metadata: {
          reason: 'retention_period_expired',
          original_retention_expiry: order.retention_expires_at,
        }
      });

      console.log(`Pseudonymized order ${order.order_number}`);
    } catch (error) {
      console.error(`Failed to pseudonymize order ${order.id}:`, error);
    }
  }
}

// Run daily at 2 AM
// Vercel Cron: 0 2 * * *
```

**RTBF Request Handler:**

```typescript
// src/app/api/data-deletion/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { request_type, reason } = await request.json();

  // Create deletion request
  const { data: deletionRequest } = await supabase
    .from('data_deletion_requests')
    .insert({
      user_id: user.id,
      request_type,
      reason,
      status: 'pending',
    })
    .select()
    .single();

  // Check for legal obligations
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString());

  const cannotDelete = activeOrders?.filter(order => {
    const age = Date.now() - new Date(order.created_at).getTime();
    const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;
    return age < tenYears && order.status === 'completed';
  });

  if (cannotDelete && cannotDelete.length > 0) {
    // Inform user about legal retention
    return NextResponse.json({
      success: true,
      message: 'Deletion request received. Some data must be retained for legal obligations.',
      details: {
        request_id: deletionRequest.id,
        can_delete_immediately: [],
        must_retain: cannotDelete.map(o => ({
          order_number: o.order_number,
          reason: 'Legal obligation: 10-year fiscal retention (Romanian Law 82/1991, Art. 22)',
          retention_expires: new Date(new Date(o.created_at).getTime() + 10 * 365 * 24 * 60 * 60 * 1000),
        })),
        actions_taken: [
          'Marketing data deleted immediately',
          'Account access disabled',
          'Personal data pseudonymized where legally permitted',
        ]
      }
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Deletion request will be processed within 30 days.',
    request_id: deletionRequest.id,
  });
}
```

---

## 6. Audit Logging Requirements

### 6.1 Current State: NOT IMPLEMENTED

**MISSING:** Comprehensive audit trail for PII access and modifications.

### 6.2 Required Audit Events

| Event Type | When to Log | Required Fields |
|------------|-------------|-----------------|
| `pii_access` | Any PII read | user_id, order_id, fields_accessed, reason |
| `pii_modified` | Any PII update | user_id, order_id, old_value_hash, new_value_hash |
| `ocr_processed` | OCR extraction | user_id, document_type, confidence, ip_address |
| `kyc_uploaded` | Document upload | user_id, file_type, file_size, validation_result |
| `order_created` | New order | user_id, service_id, total_price |
| `export_requested` | Data export (GDPR) | user_id, export_type, ip_address |
| `deletion_requested` | RTBF request | user_id, request_type, reason |
| `admin_access` | Admin views PII | admin_id, target_user_id, reason_code |

### 6.3 Implementation

**Database Schema:**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  user_id UUID REFERENCES profiles(id),
  admin_id UUID REFERENCES profiles(id),  -- If admin action

  -- What
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,

  -- When
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Where
  ip_address INET,
  user_agent TEXT,

  -- How
  method VARCHAR(10),  -- GET, POST, etc.
  endpoint TEXT,

  -- Details
  metadata JSONB DEFAULT '{}',

  -- Results
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  -- Retention: 5 years for audit purposes
  retention_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 years')
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_retention ON audit_logs(retention_expires_at)
  WHERE retention_expires_at IS NOT NULL;

-- GIN index for metadata queries
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Users can view their own logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);
```

**Logging Helper:**

```typescript
// src/lib/audit/logger.ts
import { createClient } from '@/lib/supabase/server';

export async function auditLog({
  userId,
  adminId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  success = true,
  errorMessage,
  request,
}: {
  userId?: string;
  adminId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  request?: NextRequest;
}) {
  const supabase = createClient();

  // Sanitize metadata - NO PII in logs
  const sanitizedMetadata = {
    ...metadata,
    // Remove sensitive fields
    cnp: metadata.cnp ? 'REDACTED' : undefined,
    ci_series: metadata.ci_series ? 'REDACTED' : undefined,
    ci_number: metadata.ci_number ? 'REDACTED' : undefined,
    password: undefined,
    token: undefined,
  };

  await supabase.from('audit_logs').insert({
    user_id: userId,
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: request?.ip,
    user_agent: request?.headers.get('user-agent'),
    method: request?.method,
    endpoint: request?.url,
    metadata: sanitizedMetadata,
    success,
    error_message: errorMessage,
  });
}

// Usage examples:
await auditLog({
  userId: user.id,
  action: 'ocr_processed',
  resourceType: 'kyc_document',
  metadata: {
    document_type: 'ci_front',
    confidence: 0.98,
  },
  request,
});

await auditLog({
  adminId: admin.id,
  userId: targetUser.id,
  action: 'pii_access',
  resourceType: 'order',
  resourceId: order.id,
  metadata: {
    fields_accessed: ['cnp', 'ci_series', 'ci_number'],
    reason_code: 'kyc_verification',
  },
  request,
});
```

---

## 7. Encryption Implementation Plan

### 7.1 Encryption Strategy

**Approach:** Hybrid encryption (field-level + column-level)

**Why not full-disk encryption?**
- Supabase manages infrastructure
- Need application-level encryption for GDPR "encryption at rest"
- Full-disk encryption doesn't protect against database compromise

### 7.2 Field-Level Encryption for Critical PII

**Fields Requiring Encryption:**

1. CNP (Romanian SSN)
2. CI Series
3. CI Number
4. Full Name (optional, but recommended)
5. Address (optional)

**Implementation Options:**

#### Option A: PostgreSQL pgcrypto (Recommended)

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted columns
ALTER TABLE orders
ADD COLUMN cnp_encrypted BYTEA,
ADD COLUMN ci_series_encrypted BYTEA,
ADD COLUMN ci_number_encrypted BYTEA;

-- Encryption key management
-- CRITICAL: Key must be stored in environment variable, NOT in database
-- Use AWS Secrets Manager or Vault for production

-- Encrypt function
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT)
RETURNS BYTEA AS $$
  SELECT pgp_sym_encrypt(
    plaintext,
    current_setting('app.encryption_key')  -- Set per-session
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Decrypt function
CREATE OR REPLACE FUNCTION decrypt_pii(ciphertext BYTEA)
RETURNS TEXT AS $$
  SELECT pgp_sym_decrypt(
    ciphertext,
    current_setting('app.encryption_key')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Usage in queries:
-- INSERT
INSERT INTO orders (cnp_encrypted, ci_series_encrypted)
VALUES (
  encrypt_pii('1850101123456'),
  encrypt_pii('XV')
);

-- SELECT (requires encryption key in session)
SELECT
  id,
  decrypt_pii(cnp_encrypted) AS cnp,
  decrypt_pii(ci_series_encrypted) AS ci_series
FROM orders
WHERE user_id = auth.uid();
```

**Supabase Configuration:**

```typescript
// Set encryption key per session
const supabase = createClient();

// Before queries, set encryption key from environment
await supabase.rpc('set_encryption_key', {
  key: process.env.DATABASE_ENCRYPTION_KEY
});

// Now queries can use encrypt_pii/decrypt_pii
```

#### Option B: Application-Level Encryption (Alternative)

```typescript
// src/lib/encryption/pii.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY_HEX!, 'hex'); // 32 bytes

export function encryptPII(plaintext: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptPII(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage:
const encrypted = encryptPII(cnp);
await supabase.from('orders').insert({
  cnp_encrypted: encrypted.encrypted,
  cnp_iv: encrypted.iv,
  cnp_auth_tag: encrypted.authTag,
});

// Retrieve:
const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
const cnp = decryptPII(data.cnp_encrypted, data.cnp_iv, data.cnp_auth_tag);
```

**Recommendation:** Use **Option A (pgcrypto)** for better performance and security.

### 7.3 Encryption Key Management

**CRITICAL: Key Storage**

```bash
# .env.local
DATABASE_ENCRYPTION_KEY=<64-character-hex-string>

# Generate key:
# openssl rand -hex 32
# Example: a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678
```

**Production Key Management:**

1. **AWS Secrets Manager** (Recommended)

```typescript
// src/lib/encryption/keys.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let cachedKey: string | null = null;

export async function getEncryptionKey(): Promise<string> {
  if (cachedKey) return cachedKey;

  const client = new SecretsManagerClient({ region: 'eu-central-1' });

  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: 'eghiseul-db-encryption-key',
    })
  );

  cachedKey = response.SecretString!;
  return cachedKey;
}
```

2. **Key Rotation Policy**

```typescript
// Rotate every 90 days
// Strategy: Dual-key system during rotation

interface EncryptionKeyVersion {
  version: number;
  key: string;
  active_from: Date;
  active_until: Date | null;
}

async function rotateEncryptionKey() {
  const oldKey = await getEncryptionKey();
  const newKey = crypto.randomBytes(32).toString('hex');

  // Store new key in Secrets Manager
  await storeKey(newKey, {
    version: currentVersion + 1,
    active_from: new Date(),
  });

  // Re-encrypt all data (background job)
  await reencryptAllPII(oldKey, newKey);

  // Deprecate old key after 30 days
  setTimeout(() => {
    deprecateKey(oldKey);
  }, 30 * 24 * 60 * 60 * 1000);
}
```

### 7.4 Migration Plan

**Phase 1: Add Encrypted Columns (Week 1)**

```sql
-- Add encrypted columns alongside existing
ALTER TABLE orders
ADD COLUMN cnp_encrypted BYTEA,
ADD COLUMN cnp_iv TEXT,
ADD COLUMN cnp_auth_tag TEXT,
ADD COLUMN ci_series_encrypted BYTEA,
ADD COLUMN ci_number_encrypted BYTEA;

-- Create indexes
CREATE INDEX idx_orders_cnp_encrypted ON orders(cnp_encrypted)
  WHERE cnp_encrypted IS NOT NULL;
```

**Phase 2: Dual-Write (Week 2-3)**

```typescript
// Write to both old and new columns
await supabase.from('orders').insert({
  // Old (plaintext) - for backwards compatibility
  customer_data: {
    personal: { cnp: '1850101123456' }
  },
  // New (encrypted)
  cnp_encrypted: encrypt('1850101123456'),
});
```

**Phase 3: Backfill Existing Data (Week 4)**

```sql
-- Encrypt existing records (run in batches)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, customer_data FROM orders WHERE cnp_encrypted IS NULL LIMIT 1000
  LOOP
    UPDATE orders
    SET cnp_encrypted = encrypt_pii(r.customer_data->'personal'->>'cnp')
    WHERE id = r.id;
  END LOOP;
END $$;
```

**Phase 4: Switch Reads to Encrypted (Week 5)**

```typescript
// Read from encrypted column
const { data } = await supabase
  .rpc('get_order_with_decrypted_pii', { order_id: orderId });
```

**Phase 5: Remove Plaintext Columns (Week 6)**

```sql
-- After validating encrypted data works
ALTER TABLE orders
DROP COLUMN customer_data;  -- Remove plaintext JSONB
```

---

## 8. Recommendations by Priority

### 8.1 CRITICAL (Immediate - Within 7 Days)

| Priority | Action | Effort | Impact | Files to Modify |
|----------|--------|--------|--------|-----------------|
| **P0** | Add authentication to OCR endpoint | 2 hours | Prevents unauthorized PII extraction | `src/app/api/ocr/extract/route.ts` |
| **P0** | Implement audit logging for PII access | 1 day | GDPR compliance, breach detection | All API routes |
| **P0** | Verify/sign Google AI DPA | 1 day | GDPR Art. 28 compliance | Legal/Admin |
| **P0** | Add rate limiting to OCR endpoint | 4 hours | Prevents abuse, cost control | `src/app/api/ocr/extract/route.ts` |

**Implementation Code:**

```typescript
// CRITICAL P0: Add authentication to OCR endpoint
// File: src/app/api/ocr/extract/route.ts

import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit/logger';

export async function POST(request: NextRequest) {
  // 1. AUTHENTICATION (CRITICAL)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    await auditLog({
      action: 'ocr_extract_unauthorized',
      resourceType: 'kyc_document',
      success: false,
      errorMessage: 'Unauthorized access attempt',
      request,
    });

    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. RATE LIMITING (CRITICAL)
  const rateLimitResult = await rateLimit({
    identifier: user.id,
    limit: 5,
    window: 60000, // 5 requests per minute
  });

  if (!rateLimitResult.success) {
    await auditLog({
      userId: user.id,
      action: 'ocr_extract_rate_limited',
      resourceType: 'kyc_document',
      success: false,
      request,
    });

    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again in 1 minute.' },
      { status: 429 }
    );
  }

  // 3. INPUT VALIDATION
  const body = await request.json();

  if (!body.imageBase64 || !body.mimeType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Validate file size (max 10MB)
  const sizeInBytes = (body.imageBase64.length * 3) / 4;
  if (sizeInBytes > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'File too large. Maximum 10MB allowed.' },
      { status: 413 }
    );
  }

  // 4. OCR PROCESSING
  try {
    const result = await extractFromDocument(body.imageBase64, body.mimeType);

    // 5. AUDIT LOG SUCCESS (CRITICAL)
    await auditLog({
      userId: user.id,
      action: 'ocr_extract_success',
      resourceType: 'kyc_document',
      metadata: {
        document_type: result.documentType,
        confidence: result.confidence,
        success: result.success,
        // DO NOT LOG: CNP, names, addresses
      },
      request,
    });

    return NextResponse.json({
      success: true,
      data: { ocr: result, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    // 6. AUDIT LOG FAILURE
    await auditLog({
      userId: user.id,
      action: 'ocr_extract_failed',
      resourceType: 'kyc_document',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      request,
    });

    console.error('OCR extraction error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
```

### 8.2 HIGH (Within 30 Days)

| Priority | Action | Effort | Impact | Files to Modify |
|----------|--------|--------|--------|-----------------|
| **P1** | Implement encryption at rest for CNP | 1 week | GDPR Art. 32 compliance | Database schema, all API endpoints |
| **P1** | Remove PII from OCR data after validation | 2 days | Data minimization | `src/app/api/orders/route.ts` |
| **P1** | Implement data retention policies | 1 week | GDPR Art. 5(1)(e) compliance | Database, cron jobs |
| **P1** | Create RTBF request handler | 3 days | GDPR Art. 17 compliance | New API endpoint |
| **P1** | Migrate to stable Gemini model | 1 day | Production stability | `src/lib/services/document-ocr.ts` |

### 8.3 MEDIUM (Within 90 Days)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| **P2** | Implement column-level masking for admins | 1 week | Least privilege access |
| **P2** | Add encryption key rotation | 1 week | Long-term key security |
| **P2** | Evaluate on-premise OCR alternative | 2 weeks | Reduce third-party exposure |
| **P2** | Implement data export (GDPR Art. 20) | 1 week | GDPR compliance |
| **P2** | Add security headers (CSP, HSTS) | 2 days | Web security |

---

## 9. GDPR Compliance Checklist

### 9.1 Technical Measures (Art. 32)

- [ ] **Encryption at rest** for CNP, CI series/number
- [ ] **Encryption in transit** (HTTPS) - Already implemented
- [ ] **Pseudonymization** for expired retention periods
- [ ] **Access controls** (RLS) - Partially implemented
- [ ] **Audit logging** for all PII access - NOT IMPLEMENTED
- [ ] **Regular backups** with encryption
- [ ] **Incident response plan** - NOT IMPLEMENTED
- [ ] **Regular security testing** - NOT IMPLEMENTED

### 9.2 Organizational Measures

- [ ] **Data Processing Agreement** with Google AI
- [ ] **Data Processing Agreement** with Stripe
- [ ] **Data Processing Agreement** with AWS
- [ ] **Staff training** on data protection
- [ ] **Data Protection Impact Assessment** (DPIA)
- [ ] **Data Protection Officer** appointment
- [ ] **Data retention policy** documented
- [ ] **Breach notification procedures** (72 hours)

### 9.3 Documentation Required

- [ ] **Records of Processing Activities** (Art. 30)
- [ ] **Data flow diagrams**
- [ ] **Privacy Policy** (customer-facing)
- [ ] **Cookie Policy**
- [ ] **DPA templates** for processors
- [ ] **Retention schedule** by data type
- [ ] **RTBF procedures** documentation
- [ ] **Breach response plan**

### 9.4 User Rights Implementation

- [ ] **Right of access** (Art. 15) - Data export
- [ ] **Right to rectification** (Art. 16) - Edit profile
- [ ] **Right to erasure** (Art. 17) - RTBF handler
- [ ] **Right to data portability** (Art. 20) - Export JSON
- [ ] **Right to object** (Art. 21) - Opt-out mechanisms
- [ ] **Consent management** - Cookie banner
- [ ] **Consent withdrawal** - Easy unsubscribe

---

## 10. Implementation Roadmap

### Week 1: CRITICAL Fixes

**Days 1-2:**
- [ ] Add authentication to OCR endpoint
- [ ] Implement basic audit logging
- [ ] Add rate limiting

**Days 3-5:**
- [ ] Verify Google AI DPA
- [ ] Document data flows
- [ ] Create audit logs table

**Days 6-7:**
- [ ] Test authentication
- [ ] Review audit logs
- [ ] Deploy to production

### Week 2-3: Encryption Implementation

**Week 2:**
- [ ] Add pgcrypto extension
- [ ] Create encrypted columns
- [ ] Implement encrypt/decrypt functions
- [ ] Test encryption locally

**Week 3:**
- [ ] Deploy encrypted columns to production
- [ ] Start dual-write mode
- [ ] Monitor for errors
- [ ] Backfill 10% of data

### Week 4: Data Retention & Deletion

- [ ] Create data_deletion_requests table
- [ ] Implement retention expiry calculations
- [ ] Create automated deletion job
- [ ] Build RTBF request handler
- [ ] Test deletion workflows

### Month 2: Remaining HIGH Priority

- [ ] Remove PII from OCR data post-validation
- [ ] Implement column masking for admins
- [ ] Complete data backfill
- [ ] Switch reads to encrypted columns
- [ ] Migrate to stable Gemini model

### Month 3: MEDIUM Priority & Documentation

- [ ] Evaluate on-premise OCR
- [ ] Implement data export (GDPR Art. 20)
- [ ] Add security headers
- [ ] Complete GDPR documentation
- [ ] Staff training
- [ ] DPIA completion

---

## 11. Testing & Validation

### 11.1 Security Testing Plan

**Encryption Testing:**

```typescript
// Test encryption roundtrip
test('CNP encryption/decryption', async () => {
  const cnp = '1850101123456';
  const encrypted = await encryptPII(cnp);
  const decrypted = await decryptPII(encrypted);

  expect(decrypted).toBe(cnp);
  expect(encrypted.encrypted).not.toContain(cnp);
});

// Test encryption key rotation
test('Key rotation maintains data access', async () => {
  const cnp = '1850101123456';
  const encryptedOldKey = await encryptPII(cnp, oldKey);

  await rotateEncryptionKey();

  const decryptedNewKey = await decryptPII(encryptedOldKey, newKey);
  expect(decryptedNewKey).toBe(cnp);
});
```

**Audit Logging Testing:**

```typescript
test('PII access is logged', async () => {
  await request('/api/orders/123')
    .set('Authorization', `Bearer ${token}`);

  const logs = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action', 'pii_access')
    .eq('resource_id', '123');

  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].metadata).toHaveProperty('fields_accessed');
});
```

**RTBF Testing:**

```typescript
test('Data deletion respects legal retention', async () => {
  // Order completed 5 years ago
  const oldOrder = await createOrder({
    status: 'completed',
    created_at: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
  });

  // Request deletion
  await request('/api/data-deletion')
    .post({ request_type: 'full_account' })
    .set('Authorization', `Bearer ${token}`);

  // Check response
  const response = await processDeletionRequest(oldOrder.user_id);

  // Contract data retained (10-year rule)
  expect(response.must_retain.length).toBeGreaterThan(0);

  // Marketing data deleted
  expect(response.deleted.marketing_consents).toBe(true);
});
```

### 11.2 Penetration Testing Scenarios

1. **Unauthorized OCR Access**
   - Attempt OCR without authentication
   - Attempt OCR with revoked token

2. **SQL Injection**
   - Test all user inputs for SQL injection
   - Verify parameterized queries

3. **Rate Limit Bypass**
   - Attempt >5 OCR requests per minute
   - Test rate limit with multiple IPs

4. **Privilege Escalation**
   - Regular user tries to access admin endpoints
   - Partner tries to access other partner's data

---

## 12. Cost Impact Analysis

### 12.1 Implementation Costs

| Item | Effort | Cost (if outsourced) |
|------|--------|---------------------|
| Encryption implementation | 2 weeks | 8,000 EUR |
| Audit logging system | 1 week | 4,000 EUR |
| Data retention automation | 1 week | 4,000 EUR |
| RTBF handler | 3 days | 1,500 EUR |
| Security testing | 1 week | 5,000 EUR |
| Legal review (DPA, policies) | 1 week | 3,000 EUR |
| **Total** | **~6 weeks** | **~25,500 EUR** |

### 12.2 Operational Costs

| Item | Monthly Cost |
|------|-------------|
| AWS Secrets Manager (key storage) | 5 EUR |
| Additional database storage (encrypted data ~1.2x size) | 20 EUR |
| Audit log storage (5 years retention) | 30 EUR |
| Security monitoring tools | 50 EUR |
| DPO services (external consultant) | 500 EUR |
| **Total Monthly** | **~605 EUR** |

### 12.3 Risk of Non-Compliance

| Risk | Probability | Impact (EUR) |
|------|------------|-------------|
| GDPR fine (Art. 32 violation) | Medium | 10,000 - 10,000,000 |
| Data breach notification costs | Low | 50,000 - 200,000 |
| Customer lawsuits | Low | 10,000 - 100,000 |
| Reputation damage | Medium | Incalculable |

**ROI:** Implementation costs (25,500 EUR) are negligible compared to potential fine (up to 10M EUR).

---

## 13. Conclusion

### 13.1 Summary of Findings

The eGhiseul.ro platform currently processes highly sensitive personal data (Romanian CNP, government-issued ID cards, biometric selfies) with **INSUFFICIENT security controls** and **NON-COMPLIANT GDPR practices**.

**Most Critical Issues:**

1. CNP stored unencrypted in database (CRIT-001)
2. Google AI receives raw ID card images (CRIT-002)
3. No authentication on OCR endpoint (CRIT-003)
4. No audit logging for PII access (CRIT-005)
5. No data retention/deletion policies (HIGH-001)

### 13.2 Legal Risk Assessment

**RISK LEVEL: CRITICAL**

- **GDPR Article 32** (Security): NON-COMPLIANT
- **GDPR Article 30** (Records): PARTIAL COMPLIANCE
- **GDPR Article 28** (Processors): NON-COMPLIANT
- **GDPR Article 17** (RTBF): NOT IMPLEMENTED

**Potential Consequences:**

1. GDPR fines: Up to 10M EUR or 2% of turnover
2. Romanian ANSPDCP investigation
3. Service suspension order
4. Criminal liability for data breach (Romanian Law 190/2018)
5. Customer lawsuits (GDPR Art. 82 - right to compensation)

### 13.3 Recommendations Summary

**IMMEDIATE (7 days):**
- Add authentication to OCR endpoint
- Implement audit logging
- Verify Google AI DPA
- Add rate limiting

**SHORT-TERM (30 days):**
- Implement encryption at rest for CNP
- Create data retention policies
- Build RTBF handler
- Remove PII from OCR data post-validation

**MEDIUM-TERM (90 days):**
- Column-level masking for admins
- Encryption key rotation
- Evaluate on-premise OCR
- Complete GDPR documentation

### 13.4 Next Steps

1. **Present this report** to stakeholders
2. **Prioritize P0 fixes** for immediate implementation
3. **Assign resources** for encryption implementation
4. **Engage legal counsel** for DPA review
5. **Schedule penetration testing** after fixes
6. **Plan customer communication** about security improvements
7. **Appoint DPO** or engage external consultant

---

## Appendices

### Appendix A: Affected Files Summary

| File | Risk Level | Changes Required |
|------|-----------|------------------|
| `src/app/api/ocr/extract/route.ts` | CRITICAL | Add authentication, rate limiting, audit logging |
| `src/lib/services/document-ocr.ts` | CRITICAL | Verify DPA, use stable model, add data deletion |
| `src/components/orders/steps/personal-data-step.tsx` | HIGH | Reduce client-side PII storage, clear blobs |
| `src/providers/order-wizard-provider.tsx` | HIGH | Encrypt before auto-save, reduce frequency |
| `src/app/api/orders/route.ts` | HIGH | Redact OCR data, encrypt PII, audit log |
| `supabase/migrations/002_services.sql` | CRITICAL | Add encrypted columns, retention metadata |

### Appendix B: Environment Variables Required

```bash
# Encryption
DATABASE_ENCRYPTION_KEY=<64-char-hex>  # Generate with: openssl rand -hex 32

# Google AI
GOOGLE_AI_API_KEY=<existing>
GOOGLE_DPA_VERIFIED=true  # Set after legal verification

# AWS Secrets Manager (production)
AWS_SECRETS_MANAGER_ENABLED=true
AWS_REGION=eu-central-1

# Rate Limiting (Redis)
REDIS_URL=redis://localhost:6379
```

### Appendix C: Glossary

| Term | Definition |
|------|------------|
| **CNP** | Cod Numeric Personal - Romanian personal identification number (SSN equivalent) |
| **CI** | Carte de Identitate - Romanian identity card |
| **GDPR** | General Data Protection Regulation (EU 2016/679) |
| **RTBF** | Right to be Forgotten (GDPR Art. 17) |
| **DPA** | Data Processing Agreement |
| **PII** | Personally Identifiable Information |
| **RLS** | Row Level Security (Supabase/PostgreSQL) |
| **DPIA** | Data Protection Impact Assessment |
| **DPO** | Data Protection Officer |

### Appendix D: Contact Information

**Report Author:** Security Audit Team
**Date:** 2025-12-17
**Version:** 1.0
**Next Review:** 2025-01-17 (30 days)

---

**END OF REPORT**
