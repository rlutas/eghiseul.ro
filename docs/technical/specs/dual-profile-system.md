# Dual Profile System (PF + PJ)

**Version:** 1.0
**Date:** 2026-02-10
**Status:** Implemented
**Sprint:** Sprint 4

---

## Overview

Users can maintain both a PF (Persoana Fizica) and PJ (Persoana Juridica) profile simultaneously. Company data is stored as additional columns on the existing `profiles` table rather than a separate table, keeping the data model flat and queries simple. Personal KYC and company KYC verification are tracked independently.

---

## Database Schema

### New Columns on `profiles`

Migration file: `supabase/migrations/021_company_profile_columns.sql`

```sql
ALTER TABLE profiles
  ADD COLUMN company_cui VARCHAR(10),
  ADD COLUMN company_name VARCHAR(255),
  ADD COLUMN company_type VARCHAR(50),           -- SRL, SA, PFA, II, IF, etc.
  ADD COLUMN company_registration_number VARCHAR(50),  -- J40/1234/2020
  ADD COLUMN company_address TEXT,
  ADD COLUMN company_is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN company_vat_payer BOOLEAN DEFAULT FALSE,
  ADD COLUMN company_verified BOOLEAN DEFAULT FALSE;
```

| Column | Type | Description |
|--------|------|-------------|
| `company_cui` | `VARCHAR(10)` | CUI number (without RO prefix) |
| `company_name` | `VARCHAR(255)` | Official company name from ANAF |
| `company_type` | `VARCHAR(50)` | Legal form: SRL, SA, PFA, II, IF |
| `company_registration_number` | `VARCHAR(50)` | Trade registry number (e.g., J40/1234/2020) |
| `company_address` | `TEXT` | Full registered address |
| `company_is_active` | `BOOLEAN` | ANAF active status |
| `company_vat_payer` | `BOOLEAN` | TVA payer status from ANAF |
| `company_verified` | `BOOLEAN` | Admin-verified via uploaded documents |

### Extended CHECK Constraint on `kyc_verifications`

The `document_type` CHECK constraint is extended to include company document types:

```sql
ALTER TABLE kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_document_type_check,
  ADD CONSTRAINT kyc_verifications_document_type_check
    CHECK (document_type IN (
      'ci_front', 'ci_back', 'selfie', 'passport',
      'certificat_atestare_domiciliu',
      'company_registration_cert',    -- Certificat de Inregistrare
      'company_statement_cert'        -- Certificat Constatator
    ));
```

---

## API Changes

### GET /api/user/profile

Returns the full profile including a `companyProfile` object. Returns `null` when no company data exists.

**Response shape:**

```typescript
{
  // ... existing personal fields ...
  companyProfile: {
    cui: string;
    name: string;
    type: string;
    registrationNumber: string;
    address: string;
    isActive: boolean;
    vatPayer: boolean;
    verified: boolean;
  } | null;
}
```

The mapping from DB columns to response fields:

| DB Column | Response Field |
|-----------|---------------|
| `company_cui` | `companyProfile.cui` |
| `company_name` | `companyProfile.name` |
| `company_type` | `companyProfile.type` |
| `company_registration_number` | `companyProfile.registrationNumber` |
| `company_address` | `companyProfile.address` |
| `company_is_active` | `companyProfile.isActive` |
| `company_vat_payer` | `companyProfile.vatPayer` |
| `company_verified` | `companyProfile.verified` |

`companyProfile` is `null` when `company_cui` is null (no company data saved).

### PATCH /api/user/profile

Accepts company fields in the request body. When company data is saved, a PJ billing profile entry is auto-created or updated.

**Request body (company fields):**

```typescript
{
  companyCui?: string;
  companyName?: string;
  companyType?: string;
  companyRegistrationNumber?: string;
  companyAddress?: string;
  companyIsActive?: boolean;
  companyVatPayer?: boolean;
}
```

**Side effect:** On successful save, upserts a PJ entry in `billing_profiles` with the same company data so that the billing step can auto-fill.

### GET /api/user/prefill-data

Returns aggregated prefill data for the order wizard. Extended with `company` and `billing_profiles`.

**Response shape:**

```typescript
{
  personal: { /* existing personal data */ };
  company: {
    cui: string;
    name: string;
    type: string;
    registrationNumber: string;
    address: string;
    isActive: boolean;
    vatPayer: boolean;
  } | null;
  billing_profiles: Array<{
    id: string;
    type: 'pf' | 'pj';
    /* ... billing fields ... */
  }>;
  kyc: { /* existing KYC status */ };
}
```

### POST /api/user/kyc/save

Extended to accept company document types.

**New document types:**

| `documentType` | Description | Verification |
|----------------|-------------|--------------|
| `company_registration_cert` | Certificat de Inregistrare | Manual admin review |
| `company_statement_cert` | Certificat Constatator | Manual admin review |

When a company document is saved and approved, the profile's `company_verified` column is set to `true`. This is independent of the personal `kyc_verified` flag -- a user can have verified personal KYC but unverified company KYC, or vice versa.

No OCR is performed on company documents. They are uploaded to S3 and flagged for manual admin review.

---

## UI Components

### ProfileTab

**File:** `src/components/account/ProfileTab.tsx`

A PF/PJ sub-tab toggle is rendered at the top of the profile tab using pill-style buttons:

```
[ Persoana Fizica ]  [ Persoana Juridica ]
```

- **PF tab:** Existing personal profile form (name, CNP, address, document info).
- **PJ tab:** Renders `CompanyProfileSection` component.

### CompanyProfileSection

**File:** `src/components/account/CompanyProfileSection.tsx`

Layout and behavior:

1. **CUI input** with "Verifica ANAF" button. Calls `/api/company/validate` on click.
2. **Auto-fill** on successful ANAF response: company name, type, registration number, address. Uses `fetchCompanyData()` from `src/lib/services/infocui.ts`.
3. **Status badges** displayed inline:
   - `Activa` / `Inactiva` (green/red)
   - `Platitor TVA` (blue, shown only if true)
   - `Verificat` (green checkmark, shown only if `company_verified`)
4. **View/Edit modes:** Displays read-only summary by default. Edit button switches to form mode.
5. **Save** calls `PATCH /api/user/profile` with company fields.

### KYCTab

**File:** `src/components/account/KYCTab.tsx`

Extended with a "Documente Firma" section that is conditionally rendered only when the user has company data saved (`companyProfile !== null`).

Upload cards:

| Card | Document Type | S3 Category |
|------|--------------|-------------|
| Certificat de Inregistrare | `company_registration_cert` | `kyc/{user_id}/{verification_id}/` |
| Certificat Constatator | `company_statement_cert` | `kyc/{user_id}/{verification_id}/` |

Upload flow: file selected -> uploaded to S3 via presigned URL -> `POST /api/user/kyc/save` called with S3 key and document type. No OCR extraction; documents are queued for manual admin review.

---

## Wizard Integration

### Prefill Logic

**File:** `src/providers/modular-wizard-provider.tsx`

The `UserPrefillData` type is extended:

```typescript
interface UserPrefillData {
  personal: { /* ... */ };
  company: {
    cui: string;
    name: string;
    type: string;
    registrationNumber: string;
    address: string;
    isActive: boolean;
    vatPayer: boolean;
  } | null;
  billing_profiles: BillingProfile[];
  kyc: { /* ... */ };
}
```

The `PREFILL_FROM_PROFILE` action in the wizard reducer auto-fills `companyKyc` state from the profile's company data when available. This means returning users with a saved PJ profile skip manual company entry in the wizard.

### Billing Step Auto-Fill

**File:** `src/components/orders/steps-modular/billing-step.tsx`

When the user selects PJ billing type:

1. Check if a saved PJ billing profile exists in `billing_profiles`.
2. If found, auto-fill all company billing fields (CUI, name, address, registration number, VAT status).
3. Display a green notice banner: "Date de facturare completate din profilul firmei."
4. User can still edit the auto-filled values before proceeding.

---

## Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   ANAF API       │────>│  /api/company/   │────>│  CompanyProfile  │
│   (CUI lookup)   │     │  validate        │     │  Section (UI)    │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │ Save
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  profiles table  │<────│  PATCH /api/user │<────│  Company form    │
│  (company_*)     │     │  /profile        │     │  data            │
└────────┬─────────┘     └────────┬─────────┘     └──────────────────┘
         │                        │
         │                        │ Side effect: upsert
         │                        ▼
         │               ┌──────────────────┐
         │               │ billing_profiles │
         │               │ (PJ entry)       │
         │               └──────────────────┘
         │
         │ Prefill
         ▼
┌──────────────────┐     ┌──────────────────┐
│  GET /api/user/  │────>│  Order Wizard    │
│  prefill-data    │     │  (auto-fill PJ)  │
└──────────────────┘     └──────────────────┘
```

---

## Key Files

| File | Role |
|------|------|
| `supabase/migrations/021_company_profile_columns.sql` | DB migration adding company columns |
| `src/app/api/user/profile/route.ts` | Profile API (GET returns companyProfile, PATCH accepts company fields) |
| `src/app/api/user/prefill-data/route.ts` | Wizard prefill API (returns company + billing_profiles) |
| `src/app/api/user/kyc/save/route.ts` | KYC document save (extended with company doc types) |
| `src/app/api/company/validate/route.ts` | ANAF CUI validation endpoint |
| `src/components/account/ProfileTab.tsx` | Profile UI with PF/PJ sub-tab toggle |
| `src/components/account/CompanyProfileSection.tsx` | Company profile form with ANAF lookup |
| `src/components/account/KYCTab.tsx` | KYC tab with company documents section |
| `src/providers/modular-wizard-provider.tsx` | Wizard state management + PREFILL_FROM_PROFILE action |
| `src/components/orders/steps-modular/billing-step.tsx` | PJ billing auto-fill from saved profile |
| `src/lib/services/infocui.ts` | `fetchCompanyData()` ANAF integration |
| `src/lib/aws/s3.ts` | S3 operations (KycDocumentType extended) |

---

## Design Decisions

1. **Flat schema (columns on `profiles`) vs. separate `companies` table:** Chosen flat schema because each user has at most one company profile. A separate table would add join complexity for no benefit. If multi-company support is needed in the future, a `user_companies` table can be introduced.

2. **Independent verification flags:** `kyc_verified` (personal) and `company_verified` (company) are separate booleans. Services that require company verification check `company_verified` independently.

3. **No OCR for company documents:** Company registration certificates and constatator certificates have inconsistent formats. Manual admin review is more reliable at this stage. OCR can be added later if volume justifies it.

4. **Auto-created billing profile:** When company data is saved to the profile, a PJ billing profile is auto-upserted. This ensures the billing step always has data to auto-fill for PJ orders without requiring the user to manually create a billing profile.

---

## Bug Fixes Applied

Issues discovered and resolved during implementation of the dual profile system.

### 1. KYC File Upload on macOS/Safari

**File:** `src/components/account/KYCTab.tsx`

Hidden file inputs using `className="hidden"` (which applies `display: none`) block programmatic `.click()` calls on Safari/Mac. The browser ignores click events on elements that are not rendered in the layout.

**Fix:** Changed to `className="sr-only"` which keeps the input visually hidden but still present in the layout (using `position: absolute`, `width: 1px`, `height: 1px`, `overflow: hidden`). This allows `.click()` to work across all browsers.

### 2. ANAF API ECONNRESET

**File:** `src/lib/services/infocui.ts`

Node.js `fetch()` uses HTTP keep-alive by default. The ANAF API server resets idle keep-alive connections on GET requests, causing `ECONNRESET` errors on subsequent calls.

**Fix:** Replaced `fetch()` with the native Node.js `https` module and set the `Connection: close` header to force a fresh TCP connection per request. This avoids the keep-alive reset issue entirely.

### 3. BillingProfileForm Wrong Endpoint and Response Mapping

**File:** `src/components/orders/steps-modular/BillingProfileForm.tsx`

Two issues in the CUI validation call within the billing form:

1. **Wrong endpoint:** Was calling `/api/infocui/validate` which does not exist. The correct endpoint is `/api/company/validate`.
2. **Wrong response field:** Was reading `data.company` from the response but the actual shape returns `data.data`.

**Fix:** Updated the endpoint URL and corrected the response field mapping to match the actual API contract.

### 4. Wizard PJ Prefill Timing

**File:** `src/providers/modular-wizard-provider.tsx`

The `PREFILL_FROM_PROFILE` action ran before `SET_CLIENT_TYPE` created the `companyKyc` state object. Because `companyKyc` was `undefined` at the time of prefill, company data from the user's profile was silently discarded and never populated in the wizard.

**Fix:** After the user selects PJ as client type (which triggers `SET_CLIENT_TYPE` and initializes `companyKyc`), the prefill action is re-dispatched so that company data is applied to the now-existing state.

### 5. Redundant Contact Fields in PJ Billing Form

**File:** `src/components/orders/steps-modular/BillingProfileForm.tsx`

The PJ billing form included a "Persoana de contact" section with `contactPerson`, `contactPhone`, and `contactEmail` fields. This data is redundant because the same information already exists in the user's profile (collected in the contact step of the wizard).

**Fix:** Removed the entire contact person section from the PJ billing form to avoid data duplication and simplify the form.
