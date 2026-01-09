# User Data Flow Analysis

**Date:** 2026-01-08
**Status:** Analysis Complete - Implementation Gaps Identified

---

## Overview

This document maps the data flow from order wizard collection to user account storage, identifying gaps and required fixes.

---

## 1. Data Collection Points (Order Wizard)

### A. Contact Step
```typescript
{
  email: string;      // Required
  phone: string;      // Required
  preferredContact: 'email' | 'phone' | 'both';
}
```

### B. Personal Data Step (PersonalKYCState)
```typescript
{
  // Personal Identity
  firstName: string;
  lastName: string;
  cnp: string;           // 13 digits
  birthDate: string;     // YYYY-MM-DD
  birthPlace: string;    // City/Region
  citizenship: string;

  // Document Info (from OCR)
  documentType: 'ci' | 'passport';
  documentSeries: string;
  documentNumber: string;
  documentExpiry: string;
  documentIssueDate: string;
  documentIssuedBy: string;

  // Address (from OCR or manual)
  address: {
    county: string;
    city: string;
    street: string;
    number: string;
    building?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
  };

  // Uploaded Documents
  uploadedDocuments: UploadedDocument[];
  ocrResults: OCRResult[];
}
```

### C. Delivery Step
```typescript
{
  method: 'email' | 'registered_mail' | 'courier';
  methodName: string;
  price: number;
  estimatedDays: number;
  address?: DeliveryAddress;  // If physical delivery
}
```

### D. Options Step
```typescript
selectedOptions: ServiceOption[];  // Array of selected addons
```

---

## 2. Database Tables for User Data

### A. profiles (Core User Data)
```sql
id UUID PRIMARY KEY         -- Links to auth.users
email VARCHAR(255)
phone VARCHAR(50)
first_name VARCHAR(100)
last_name VARCHAR(100)
cnp VARCHAR(13)
birth_date DATE             -- Added in migration 015
birth_place VARCHAR(100)    -- Added in migration 015
kyc_verified BOOLEAN
two_factor_enabled BOOLEAN
role VARCHAR(50)
```

### B. user_saved_data (Reusable Data)
```sql
id UUID PRIMARY KEY
user_id UUID FK -> profiles
data_type VARCHAR(50)       -- 'personal' | 'address' | 'contact'
label VARCHAR(100)          -- User-friendly name
data JSONB                  -- Flexible structure
is_default BOOLEAN
```

**Data Type Structures:**
```typescript
// data_type = 'address'
{
  county: string;
  city: string;
  street: string;
  number: string;
  building?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
}

// data_type = 'contact'
{
  phone: string;
  email: string;
  preferredContact: string;
}
```

### C. kyc_verifications (Verified Documents)
```sql
id UUID PRIMARY KEY
user_id UUID FK -> profiles
document_type VARCHAR(50)   -- 'ci_front' | 'ci_back' | 'selfie' | 'passport'
file_url TEXT               -- S3 URL
file_key TEXT               -- S3 key
file_size INTEGER
mime_type VARCHAR(50)
validation_result JSONB     -- AI validation output
extracted_data JSONB        -- OCR extracted data
verified_at TIMESTAMPTZ
expires_at TIMESTAMPTZ      -- Document expiry date
is_active BOOLEAN
```

### D. billing_profiles (Invoice Data)
```sql
id UUID PRIMARY KEY
user_id UUID FK -> profiles
type VARCHAR(50)            -- 'persoana_fizica' | 'persoana_juridica'
label VARCHAR(100)
billing_data JSONB          -- See structures below
is_default BOOLEAN
```

**Billing Data Structures:**
```typescript
// type = 'persoana_fizica'
{
  firstName: string;
  lastName: string;
  cnp: string;
  address: Address;
}

// type = 'persoana_juridica'
{
  companyName: string;
  cui: string;
  regCom: string;           // J40/1234/2020
  address: Address;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  // From InfoCUI API:
  caen?: string;
  bankAccount?: string;
  bankName?: string;
}
```

---

## 3. Current Data Flow (Gaps Identified)

### Order Creation → Storage

| Data Source | Target Table | Status |
|-------------|--------------|--------|
| Contact email/phone | profiles | ✅ Works (on account creation) |
| Personal data (name, CNP) | profiles | ✅ Works (on account creation) |
| Birth date/place | profiles | ✅ Works (migration 015) |
| Address from ID scan | user_saved_data | ❌ NOT SAVED |
| KYC documents (CI images) | kyc_verifications | ❌ NOT SAVED |
| Delivery preferences | user_saved_data | ❌ NOT SAVED |
| Billing profile | billing_profiles | ❌ NOT ASKED |

### Gap Analysis

#### GAP 1: KYC Documents Not Saved
**Problem:** OCR is run on ID documents during order wizard, but documents are NOT persisted to `kyc_verifications` table.

**Current Flow:**
1. User uploads CI front/back in PersonalDataStep
2. OCR extracts data → stored in `orders.customer_data.personalKyc.ocrResults`
3. Order submitted → documents lost (not saved to S3, not linked to user)

**Required Flow:**
1. User uploads CI front/back
2. OCR extracts data
3. **NEW:** Upload to S3 → create `kyc_verifications` record
4. Link KYC record to order and (later) to user

#### GAP 2: Address Not Saved
**Problem:** Address extracted from ID OCR is stored in order only, not in `user_saved_data`.

**Required Flow:**
1. OCR extracts address from ID
2. **NEW:** Create `user_saved_data` record with `data_type='address'`
3. Set as default address for user

#### GAP 3: No Billing Profile Selection
**Problem:** User is not asked for billing details (PF/PJ) before payment.

**Required Flow:**
1. Before Review step, show Billing Selection step
2. Options:
   - "Facturează pe mine (PF)" - use data from ID
   - "Facturează pe altcineva (PF)" - manual entry
   - "Facturează pe firmă (PJ)" - CUI lookup via InfoCUI API
3. **NEW:** Create `billing_profiles` record

#### GAP 4: Data Not Migrated on Account Creation
**Problem:** `migrate_order_to_profile()` database function exists but may not be called, or may be failing silently.

**Current Code (register-from-order/route.ts):**
```typescript
const { error: migrateError } = await adminClient.rpc('migrate_order_to_profile', {
  p_order_id: orderId,
  p_user_id: authData.user.id,
  p_save_kyc: saveKycData,
});

if (migrateError) {
  console.error('Migration error (non-critical):', migrateError);
  // Falls back to just linking order - doesn't save KYC/address
}
```

**Issue:** Migration function likely fails because:
1. It expects KYC data in a specific format
2. KYC documents weren't uploaded to S3 yet
3. Error is logged but swallowed silently

---

## 4. Required Changes

### Phase 1: Fix Data Collection

1. **PersonalDataStep Enhancement**
   - On successful OCR, immediately upload document to S3
   - Create pending `kyc_verifications` record (verified when order completes)
   - Create `user_saved_data` address record on order completion

2. **Add Billing Step**
   - New step between Delivery and Review
   - Three options: "Sunt eu (PF)", "Altcineva (PF)", "Firmă (PJ)"
   - For PJ: CUI input + InfoCUI API call
   - Create `billing_profiles` record on order completion

### Phase 2: Fix Data Migration

1. **Update migrate_order_to_profile()**
   - Handle case when KYC not yet saved
   - Create address from order data
   - Create billing profile from order data

2. **Update register-from-order**
   - Don't swallow migration errors
   - Manually create missing records if migration fails

### Phase 3: Account Display

1. **KYCTab**
   - Fetch from `kyc_verifications`
   - Show document preview if file_url exists
   - Show expiry warnings

2. **AddressesTab**
   - Fetch from `user_saved_data` where `data_type='address'`
   - Allow add/edit/delete
   - Set default

3. **BillingTab**
   - Fetch from `billing_profiles`
   - Show PF vs PJ distinction
   - Allow add/edit/delete

---

## 5. API Endpoints Required

### Existing (verify working):
- `GET /api/user/prefill-data` - Fetch all saved data
- `GET /api/user/profile` - Fetch profile
- `PATCH /api/user/profile` - Update profile

### To Verify/Create:
- `GET /api/user/addresses` - List addresses
- `POST /api/user/addresses` - Create address
- `PATCH /api/user/addresses/[id]` - Update address
- `DELETE /api/user/addresses/[id]` - Delete address
- `GET /api/user/billing-profiles` - List billing profiles
- `POST /api/user/billing-profiles` - Create billing profile
- `PATCH /api/user/billing-profiles/[id]` - Update billing profile
- `DELETE /api/user/billing-profiles/[id]` - Delete billing profile
- `GET /api/user/kyc` - List KYC documents
- `POST /api/user/kyc/save` - Save KYC document

---

## 6. Implementation Order

1. **Security Fixes** (Critical)
   - Fix IDOR in draft GET
   - Fix email bypass in register

2. **Billing Step** (Required for payment)
   - Create billing step component
   - Add to wizard flow
   - InfoCUI integration for PJ

3. **KYC Persistence** (Required for account)
   - S3 upload on document scan
   - kyc_verifications record creation
   - Link to user on account creation

4. **Address Persistence**
   - Create user_saved_data on order completion
   - Link to user on account creation

5. **Account Display**
   - Verify KYCTab shows documents
   - Verify AddressesTab shows addresses
   - Verify BillingTab shows profiles

---

## 7. Fixes Applied (2026-01-08)

### Security Fixes
1. **IDOR in draft GET** - Fixed ownership verification to prevent unauthorized access
2. **Email bypass in register-from-order** - Now requires order to have email before registration
3. **Ownership in draft PATCH** - Added email verification for guest order updates

### Data Persistence Fixes
1. **Fixed migrate_order_to_profile call** - Removed wrong `p_save_kyc` parameter
2. **Added KYC document persistence** - Now saves documents to `kyc_verifications` table
3. **Added billing profile creation** - Creates PF billing profile from order data
4. **Address persistence** - Already handled by `migrate_order_to_profile()` function

### Still Pending
1. ~~**Billing step (PF/PJ)** - Need to add step before payment for invoice selection~~ **DONE** (2026-01-08)
2. **S3 upload** - Currently using base64 data URLs, should migrate to S3

### Billing Step Implementation (2026-01-08)

Added billing step before payment with three options:
- **"Facturează pe mine"** - Auto-fills data from scanned ID
- **"Altă persoană fizică"** - Manual entry for another person
- **"Persoană juridică"** - Company billing with CUI validation via InfoCUI API

**Files Created:**
- `src/components/orders/steps-modular/billing-step.tsx` - Billing step UI component

**Files Modified:**
- `src/types/verification-modules.ts` - Added BillingState, BillingType, BillingSource types
- `src/lib/verification-modules/step-builder.ts` - Added 'billing' step definition
- `src/lib/verification-modules/registry.ts` - Added billing to MODULE_REGISTRY and MODULE_LOADERS
- `src/providers/modular-wizard-provider.tsx` - Added billing state and UPDATE_BILLING action
- `src/components/orders/modular-order-wizard.tsx` - Added billing step rendering
- `src/components/orders/steps-modular/review-step.tsx` - Added billing info display

---

**Last Updated:** 2026-01-08
