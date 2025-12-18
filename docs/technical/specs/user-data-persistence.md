# Feature Specification: User Data Persistence & Account Creation

**Feature ID:** FEAT-004
**Sprint:** Sprint 3
**Status:** Ready for Implementation
**Created:** 2025-12-17
**Owner:** Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Database Schema](#database-schema)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [API Specifications](#api-specifications)
9. [UI/UX Requirements](#uiux-requirements)
10. [Privacy & Security](#privacy--security)
11. [Acceptance Criteria](#acceptance-criteria)
12. [Technical Implementation](#technical-implementation)
13. [Testing Strategy](#testing-strategy)
14. [Edge Cases & Error Handling](#edge-cases--error-handling)
15. [Dependencies](#dependencies)

---

## Executive Summary

This feature enables intelligent data persistence throughout the order wizard, allowing logged-in users to benefit from pre-filled data and offering guest users the option to create accounts post-purchase. The system will:

- Pre-fill personal data and KYC documents for authenticated users
- Offer post-order account creation for guests with one-click data migration
- Store reusable billing preferences (persoana fizica/juridica)
- Maintain KYC verification status across orders
- Provide GDPR-compliant data management

---

## Problem Statement

### Current State

1. **Guest Users:** Enter personal data, KYC documents, and billing info for every single order
2. **Repeat Customers:** No way to save preferences or reuse verified KYC documents
3. **Data Redundancy:** Same information requested multiple times across orders
4. **Friction:** Long forms deter repeat purchases

### Desired State

1. **Logged-in Users:** One-time data entry, instant checkout thereafter
2. **Guest Users:** Seamless conversion to accounts post-purchase
3. **KYC Reuse:** Verified documents reused across orders (no re-upload)
4. **Smart Forms:** Context-aware pre-filling based on user profile

---

## Objectives

### Primary Goals

1. **Reduce order completion time by 70%** for returning authenticated users
2. **Increase guest-to-customer conversion by 40%** through frictionless post-order signup
3. **Eliminate redundant KYC verifications** - reuse across orders
4. **GDPR Compliance** - transparent data handling with user consent

### Success Metrics

- Average order completion time: < 3 minutes (logged-in users)
- Guest-to-customer conversion rate: > 25%
- KYC document reuse rate: > 80%
- Data pre-fill accuracy: > 95%

---

## User Stories

### US-001: Logged-in User with Saved Data

**As a** logged-in returning customer
**I want** my personal data and KYC documents auto-filled
**So that** I can complete orders in seconds, not minutes

**Acceptance Criteria:**
- Personal data (CNP, name, address, birth date) pre-filled from profile
- Previously verified KYC documents (CI front/back, selfie) marked as "Already Verified"
- Billing preferences (persoana fizica/juridica) remembered from last order
- Option to edit any pre-filled data before submission
- Clear visual indicator showing "Pre-filled from your account"

---

### US-002: Guest User Post-Order Account Creation

**As a** guest user who just completed an order
**I want** to save my data for future orders
**So that** next time I don't have to re-enter everything

**Acceptance Criteria:**
- After payment success, show "Save your data for next time?" modal
- One-click account creation using order email
- All collected data (personal, KYC, billing) migrated to new account
- KYC verification status preserved (no re-upload needed)
- Email verification link sent immediately
- User can skip and continue as guest

**Modal Copy:**
```
✨ Salvează datele pentru comenzi viitoare!

Ai completat deja toate datele. Creează cont pentru:
✓ Completare automată la următoarea comandă
✓ Documentele tale KYC sunt deja verificate
✓ Verifică statusul comenzilor tale oricând

[Creează Cont] [Mai târziu]
```

---

### US-003: First-Time User Account Creation

**As a** first-time user
**I want** to create an account before ordering
**So that** my data is saved from the beginning

**Acceptance Criteria:**
- Sign up form accessible from header/order page
- Fields: email, password, first_name, last_name, phone
- Email verification required before first order
- Profile initialized but empty (no KYC yet)
- After verification, user guided to complete profile

---

### US-004: Billing Preference Management

**As a** user with both personal and company orders
**I want** to save multiple billing profiles
**So that** I can quickly switch between persoana fizica and persoana juridica

**Acceptance Criteria:**
- User can create multiple billing profiles
- Profile types: "Persoana Fizica" (CNP-based) and "Persoana Juridica" (CUI-based)
- For PJ: ANAF API auto-fill company data (nume firma, CUI, adresa, etc.)
- Mark one profile as default
- Select billing profile in Step 2 via dropdown
- Edit/delete billing profiles from account settings

---

### US-005: KYC Document Reuse

**As a** user with verified KYC documents
**I want** to skip KYC upload in future orders
**So that** I don't waste time re-uploading identity documents

**Acceptance Criteria:**
- Step 4 (KYC) detects existing verified documents
- Show "Already Verified" badge with document preview
- Display verification date and confidence score
- Allow user to re-upload if desired (e.g., document expired)
- If CI expires, prompt re-upload before order submission
- Documents marked with expiry alerts 30 days before expiration

---

### US-006: Data Privacy & Deletion

**As a** privacy-conscious user
**I want** to view, export, and delete my saved data
**So that** I maintain control over my personal information

**Acceptance Criteria:**
- Account settings page lists all stored data
- "Export My Data" button generates JSON download
- "Delete My Account" with confirmation flow
- Deletion removes: profile, KYC documents (S3), billing profiles, saved addresses
- Orders are anonymized (personal data replaced with "Deleted User")
- GDPR-compliant 30-day deletion window

---

## Functional Requirements

### FR-001: User Profile Data Structure

**Profiles Table Extensions:**
```sql
profiles (existing table)
├── id (PK, UUID)
├── first_name
├── last_name
├── cnp
├── phone
├── email
├── kyc_verified (BOOLEAN)
├── birth_date (NEW)
├── birth_place (NEW)
├── created_at
└── updated_at
```

---

### FR-002: Saved Personal Data

**New Table: `user_saved_data`**

Stores reusable personal and address data.

```sql
user_saved_data
├── id (PK, UUID)
├── user_id (FK → profiles.id)
├── data_type (VARCHAR: 'personal', 'address', 'contact')
├── label (VARCHAR: e.g., "Home Address", "Work Address")
├── data (JSONB)
├── is_default (BOOLEAN)
├── created_at
└── updated_at
```

**JSONB Structure Examples:**

**Personal Data:**
```json
{
  "cnp": "1850101123456",
  "first_name": "Ion",
  "last_name": "Popescu",
  "birth_date": "1985-01-01",
  "birth_place": "București"
}
```

**Address Data:**
```json
{
  "street": "Strada Exemplu",
  "number": "10",
  "building": "A1",
  "staircase": "B",
  "floor": "3",
  "apartment": "25",
  "city": "București, Sector 1",
  "county": "București",
  "postal_code": "010101"
}
```

**Contact Data:**
```json
{
  "email": "ion.popescu@example.com",
  "phone": "+40712345678",
  "preferred_contact": "email"
}
```

---

### FR-003: KYC Verifications Table

**New Table: `kyc_verifications`**

Tracks verified identity documents with reusability.

```sql
kyc_verifications
├── id (PK, UUID)
├── user_id (FK → profiles.id)
├── document_type (VARCHAR: 'ci_front', 'ci_back', 'selfie', 'passport')
├── file_url (TEXT: S3 URL)
├── file_size (INTEGER)
├── mime_type (VARCHAR)
├── validation_result (JSONB)
├── verified_at (TIMESTAMPTZ)
├── verified_by (FK → profiles.id: admin who verified)
├── expires_at (TIMESTAMPTZ: for CI/passport expiry)
├── is_active (BOOLEAN: false if expired/replaced)
├── created_at
└── updated_at
```

**validation_result JSONB:**
```json
{
  "valid": true,
  "confidence": 0.95,
  "documentType": "ci_front",
  "extractedData": {
    "cnp": "1850101123456",
    "firstName": "Ion",
    "lastName": "Popescu",
    "birthDate": "1985-01-01",
    "expiryDate": "2030-01-01"
  },
  "issues": [],
  "suggestions": []
}
```

**Indexes:**
```sql
CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_document_type ON kyc_verifications(document_type);
CREATE INDEX idx_kyc_verifications_expires_at ON kyc_verifications(expires_at)
  WHERE is_active = TRUE;
```

---

### FR-004: Billing Profiles

**New Table: `billing_profiles`**

Stores billing information for persoana fizica and persoana juridica.

```sql
billing_profiles
├── id (PK, UUID)
├── user_id (FK → profiles.id)
├── type (VARCHAR: 'persoana_fizica', 'persoana_juridica')
├── label (VARCHAR: e.g., "Personal", "Company XYZ")
├── billing_data (JSONB)
├── is_default (BOOLEAN)
├── created_at
└── updated_at
```

**billing_data JSONB - Persoana Fizica:**
```json
{
  "cnp": "1850101123456",
  "first_name": "Ion",
  "last_name": "Popescu",
  "address": {
    "street": "Strada Exemplu 10",
    "city": "București",
    "county": "București",
    "postal_code": "010101"
  }
}
```

**billing_data JSONB - Persoana Juridica:**
```json
{
  "cui": "RO12345678",
  "company_name": "SC Example SRL",
  "registration_number": "J40/1234/2020",
  "address": {
    "street": "Calea Victoriei 100",
    "city": "București",
    "county": "București",
    "postal_code": "010102"
  },
  "vat_registered": true,
  "bank_account": "RO49AAAA1B31007593840000",
  "bank_name": "Banca Transilvania"
}
```

**Constraints:**
```sql
ALTER TABLE billing_profiles
  ADD CONSTRAINT check_billing_type
  CHECK (type IN ('persoana_fizica', 'persoana_juridica'));

-- Only one default per user
CREATE UNIQUE INDEX idx_billing_profiles_default
  ON billing_profiles(user_id)
  WHERE is_default = TRUE;
```

---

### FR-005: Order-to-Profile Data Mapping

When a guest completes an order and creates an account, migrate order data to profile tables.

**Mapping Logic:**

| Order Field | Target Table | Target Field |
|-------------|--------------|--------------|
| `customer_data.personal.cnp` | `profiles` | `cnp` |
| `customer_data.personal.first_name` | `profiles` | `first_name` |
| `customer_data.personal.last_name` | `profiles` | `last_name` |
| `customer_data.personal.birth_date` | `profiles` | `birth_date` |
| `customer_data.personal.birth_place` | `profiles` | `birth_place` |
| `customer_data.personal.address` | `user_saved_data` | `data` (type='address') |
| `customer_data.contact` | `user_saved_data` | `data` (type='contact') |
| `kyc_documents.ci_front` | `kyc_verifications` | New record (type='ci_front') |
| `kyc_documents.ci_back` | `kyc_verifications` | New record (type='ci_back') |
| `kyc_documents.selfie` | `kyc_verifications` | New record (type='selfie') |

**Function: `migrate_order_to_profile(order_id UUID, user_id UUID)`**

```sql
CREATE OR REPLACE FUNCTION migrate_order_to_profile(
  p_order_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_personal JSONB;
  v_contact JSONB;
  v_address JSONB;
  v_kyc JSONB;
BEGIN
  -- Get order data
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  v_personal := v_order.customer_data->'personal';
  v_contact := v_order.customer_data->'contact';
  v_address := v_personal->'address';
  v_kyc := v_order.kyc_documents;

  -- Update profiles
  UPDATE profiles SET
    cnp = v_personal->>'cnp',
    birth_date = (v_personal->>'birth_date')::DATE,
    birth_place = v_personal->>'birth_place',
    kyc_verified = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert saved address
  INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
  VALUES (p_user_id, 'address', 'Home Address', v_address, TRUE);

  -- Insert saved contact
  INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
  VALUES (p_user_id, 'contact', 'Primary Contact', v_contact, TRUE);

  -- Migrate KYC documents
  IF v_kyc ? 'ci_front' THEN
    INSERT INTO kyc_verifications (
      user_id, document_type, file_url, file_size, mime_type,
      validation_result, verified_at, is_active
    )
    SELECT
      p_user_id,
      'ci_front',
      (v_kyc->'ci_front'->>'file_url'),
      (v_kyc->'ci_front'->>'file_size')::INTEGER,
      (v_kyc->'ci_front'->>'mime_type'),
      (v_kyc->'ci_front'->'validation_result'),
      NOW(),
      TRUE;
  END IF;

  -- Repeat for ci_back and selfie...

  -- Link order to user
  UPDATE orders SET user_id = p_user_id WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### FR-006: Pre-fill Logic for Logged-in Users

**API Endpoint:** `GET /api/user/prefill-data`

**Response:**
```json
{
  "success": true,
  "data": {
    "personal": {
      "cnp": "1850101123456",
      "first_name": "Ion",
      "last_name": "Popescu",
      "birth_date": "1985-01-01",
      "birth_place": "București",
      "address": {
        "street": "Strada Exemplu",
        "number": "10",
        "city": "București, Sector 1",
        "county": "București",
        "postal_code": "010101"
      }
    },
    "contact": {
      "email": "ion.popescu@example.com",
      "phone": "+40712345678",
      "preferred_contact": "email"
    },
    "kyc_documents": {
      "ci_front": {
        "file_url": "https://s3.../ci_front.jpg",
        "verified_at": "2025-01-15T10:30:00Z",
        "expires_at": "2030-01-01T00:00:00Z",
        "validation_result": { ... }
      },
      "ci_back": { ... },
      "selfie": { ... }
    },
    "billing_profiles": [
      {
        "id": "uuid-1",
        "type": "persoana_fizica",
        "label": "Personal",
        "is_default": true,
        "billing_data": { ... }
      }
    ]
  }
}
```

**Implementation in Order Wizard:**

```tsx
// In order-wizard-provider.tsx
useEffect(() => {
  const loadUserData = async () => {
    if (!user) return;

    const response = await fetch('/api/user/prefill-data');
    const result = await response.json();

    if (result.success) {
      dispatch({ type: 'PREFILL_PERSONAL', payload: result.data.personal });
      dispatch({ type: 'PREFILL_CONTACT', payload: result.data.contact });
      dispatch({ type: 'PREFILL_KYC', payload: result.data.kyc_documents });
      dispatch({ type: 'PREFILL_BILLING', payload: result.data.billing_profiles });
    }
  };

  loadUserData();
}, [user]);
```

---

### FR-007: Guest-to-Customer Conversion Flow

**Step-by-Step Flow:**

1. **Guest completes order** → Payment succeeds
2. **Redirect to `/order-confirmation?orderId=xxx`**
3. **Show "Save Your Data" Modal** (if not authenticated)
4. **User clicks "Create Account":**
   - Modal shows: email (pre-filled), password, confirm password
   - Terms & Privacy checkboxes
   - Submit
5. **Backend creates account:**
   - `POST /api/auth/register-from-order`
   - Body: `{ orderId, email, password }`
   - Creates user in `auth.users`
   - Creates profile in `profiles`
   - Calls `migrate_order_to_profile(orderId, userId)`
6. **Send verification email**
7. **Show success message:** "Account created! Check your email to verify."
8. **User verifies email** → Redirect to `/dashboard`

**API Endpoint:** `POST /api/auth/register-from-order`

**Request:**
```json
{
  "orderId": "uuid-order-123",
  "email": "ion.popescu@example.com",
  "password": "SecurePassword123!",
  "acceptedTerms": true,
  "acceptedPrivacy": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cont creat cu succes! Verifică email-ul pentru confirmare.",
  "data": {
    "userId": "uuid-user-456",
    "email": "ion.popescu@example.com",
    "verificationSent": true
  }
}
```

**Backend Logic:**
```typescript
// app/api/auth/register-from-order/route.ts
export async function POST(request: Request) {
  const { orderId, email, password, acceptedTerms, acceptedPrivacy } = await request.json();

  // Validate order exists and is unpaid/anonymous
  const order = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .is('user_id', null)
    .single();

  if (!order.data) {
    return Response.json({ error: 'Order not found or already linked' }, { status: 404 });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // Require email verification
    user_metadata: {
      first_name: order.data.customer_data.personal.first_name,
      last_name: order.data.customer_data.personal.last_name,
    },
  });

  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 });
  }

  // Migrate order data to profile
  await supabase.rpc('migrate_order_to_profile', {
    p_order_id: orderId,
    p_user_id: authData.user.id,
  });

  // Send verification email
  await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
  });

  return Response.json({
    success: true,
    message: 'Cont creat cu succes!',
    data: {
      userId: authData.user.id,
      email,
      verificationSent: true,
    },
  });
}
```

---

### FR-008: Billing Profile Selector in Order Wizard

**Step 2 (Personal Data) Enhancement:**

Add billing profile dropdown at the top of the form.

```tsx
// In personal-data-step.tsx
const [selectedBillingProfile, setSelectedBillingProfile] = useState<string | null>(null);

// Fetch billing profiles
useEffect(() => {
  if (user) {
    fetch('/api/user/billing-profiles')
      .then(res => res.json())
      .then(data => setBillingProfiles(data.data));
  }
}, [user]);

// Render dropdown
<Select
  value={selectedBillingProfile || 'new'}
  onValueChange={(value) => {
    if (value === 'new') {
      // Clear form
      form.reset();
    } else {
      // Load profile data
      const profile = billingProfiles.find(p => p.id === value);
      form.setValue('cnp', profile.billing_data.cnp);
      // ... fill other fields
    }
    setSelectedBillingProfile(value);
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Alege profilul de facturare" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="new">📝 Date noi</SelectItem>
    {billingProfiles.map(profile => (
      <SelectItem key={profile.id} value={profile.id}>
        {profile.type === 'persoana_fizica' ? '👤' : '🏢'} {profile.label}
        {profile.is_default && ' (implicit)'}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### FR-009: ANAF API Integration for PJ

**Endpoint:** `POST /api/anaf/lookup-cui`

**Request:**
```json
{
  "cui": "12345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cui": "12345678",
    "company_name": "SC EXAMPLE SRL",
    "registration_number": "J40/1234/2020",
    "address": "Calea Victoriei 100, București",
    "vat_registered": true,
    "status": "ACTIVA"
  }
}
```

**Frontend Usage:**
```tsx
const handleCUILookup = async (cui: string) => {
  const response = await fetch('/api/anaf/lookup-cui', {
    method: 'POST',
    body: JSON.stringify({ cui }),
  });

  const result = await response.json();

  if (result.success) {
    // Auto-fill company fields
    form.setValue('company_name', result.data.company_name);
    form.setValue('registration_number', result.data.registration_number);
    form.setValue('vat_registered', result.data.vat_registered);
    // Parse and fill address...
  }
};
```

---

## Data Flow Diagrams

### Flow 1: Logged-in User Starts Order

```
┌──────────────┐
│ User Lands   │
│ on Service   │
│ Page         │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Check Auth:      │
│ user.id exists?  │
└──────┬───────────┘
       │ YES
       ▼
┌─────────────────────────┐
│ GET /api/user/prefill   │
│ - Personal data         │
│ - KYC documents         │
│ - Billing profiles      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Order Wizard Provider   │
│ dispatch(PREFILL_DATA)  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Step 2: Personal Data   │
│ ✓ CNP pre-filled        │
│ ✓ Name pre-filled       │
│ ✓ Address pre-filled    │
│ ✓ Billing dropdown      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Step 4: KYC             │
│ ✓ CI front: "Verified"  │
│ ✓ CI back: "Verified"   │
│ ✓ Selfie: "Verified"    │
│ ✓ Skip button shown     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Step 6: Payment         │
│ Submit order (< 2 min)  │
└─────────────────────────┘
```

---

### Flow 2: Guest User Post-Order Signup

```
┌──────────────┐
│ Guest User   │
│ Completes    │
│ Order        │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Payment Success  │
└──────┬───────────┘
       │
       ▼
┌─────────────────────────────┐
│ Redirect to                 │
│ /order-confirmation?id=xxx  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Show Modal:                 │
│ "Salvează datele pentru     │
│  comenzi viitoare?"         │
│                             │
│ [Creează Cont] [Mai târziu] │
└──────┬──────────────────────┘
       │ Click "Creează Cont"
       ▼
┌─────────────────────────────┐
│ Account Creation Form       │
│ - Email (pre-filled)        │
│ - Password                  │
│ - Confirm Password          │
│ - Accept Terms ☑            │
└──────┬──────────────────────┘
       │ Submit
       ▼
┌─────────────────────────────┐
│ POST /api/auth/             │
│      register-from-order    │
│ Body: {orderId, email, pwd} │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Backend:                    │
│ 1. Create auth user         │
│ 2. Create profile           │
│ 3. migrate_order_to_profile │
│ 4. Send verification email  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Show Success Message:       │
│ "Cont creat! Verifică email"│
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ User clicks email link      │
│ → Email verified            │
│ → Redirect to /dashboard    │
└─────────────────────────────┘
```

---

### Flow 3: KYC Document Expiry Handling

```
┌──────────────┐
│ User Starts  │
│ New Order    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ GET /api/user/prefill       │
│ → Includes kyc_documents    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Check kyc_verifications:    │
│ expires_at < NOW() + 30d?   │
└──────┬──────────────────────┘
       │ YES (expiring soon)
       ▼
┌─────────────────────────────┐
│ Step 4: Show Warning Banner │
│ "⚠ CI-ul expiră pe DD/MM/YY"│
│ "Te rugăm să încarci un     │
│  document actualizat"       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ User Uploads New Document   │
│ → OCR validates expiry date │
│ → Creates new kyc_verif row │
│ → Sets old row is_active=F  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Continue Order with Valid   │
│ Documents                   │
└─────────────────────────────┘
```

---

## API Specifications

### 1. GET /api/user/prefill-data

**Purpose:** Fetch saved user data for order pre-filling

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "personal": {
      "cnp": "1850101123456",
      "first_name": "Ion",
      "last_name": "Popescu",
      "birth_date": "1985-01-01",
      "birth_place": "București",
      "address": {
        "street": "Strada Exemplu",
        "number": "10",
        "city": "București",
        "county": "București",
        "postal_code": "010101"
      }
    },
    "contact": {
      "email": "ion@example.com",
      "phone": "+40712345678"
    },
    "kyc_documents": {
      "ci_front": {
        "id": "uuid-1",
        "file_url": "https://s3.../ci_front.jpg",
        "verified_at": "2025-01-15T10:30:00Z",
        "expires_at": "2030-01-01T00:00:00Z",
        "is_expiring_soon": false
      }
    },
    "billing_profiles": []
  }
}
```

---

### 2. POST /api/auth/register-from-order

**Purpose:** Create account from completed order

**Authentication:** None (guest user)

**Request:**
```json
{
  "orderId": "uuid-123",
  "email": "ion@example.com",
  "password": "SecurePass123!",
  "acceptedTerms": true,
  "acceptedPrivacy": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cont creat cu succes!",
  "data": {
    "userId": "uuid-456",
    "email": "ion@example.com",
    "verificationSent": true
  }
}
```

**Errors:**
- `400`: Password too weak
- `404`: Order not found
- `409`: Email already exists

---

### 3. GET /api/user/billing-profiles

**Purpose:** List user's saved billing profiles

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "type": "persoana_fizica",
      "label": "Personal",
      "is_default": true,
      "billing_data": {
        "cnp": "1850101123456",
        "first_name": "Ion",
        "last_name": "Popescu"
      }
    }
  ]
}
```

---

### 4. POST /api/user/billing-profiles

**Purpose:** Create new billing profile

**Authentication:** Required

**Request:**
```json
{
  "type": "persoana_juridica",
  "label": "My Company",
  "billing_data": {
    "cui": "12345678",
    "company_name": "SC EXAMPLE SRL"
  },
  "is_default": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-new",
    "created_at": "2025-12-17T10:00:00Z"
  }
}
```

---

### 5. POST /api/anaf/lookup-cui

**Purpose:** Fetch company data from ANAF API

**Authentication:** Required

**Request:**
```json
{
  "cui": "12345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cui": "12345678",
    "company_name": "SC EXAMPLE SRL",
    "registration_number": "J40/1234/2020",
    "address": "Calea Victoriei 100, București",
    "vat_registered": true,
    "status": "ACTIVA"
  }
}
```

---

### 6. DELETE /api/user/account

**Purpose:** Delete user account (GDPR compliance)

**Authentication:** Required

**Request:**
```json
{
  "password": "UserPassword123!",
  "confirmDeletion": "DELETE MY ACCOUNT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contul tău va fi șters în 30 de zile"
}
```

**Side Effects:**
- Marks account for deletion in `profiles.deleted_at`
- Schedules S3 document deletion
- Anonymizes order history
- Sends confirmation email

---

## UI/UX Requirements

### 1. Pre-filled Data Indicator

Show users when data is auto-filled from their profile.

**Visual Design:**
```
┌────────────────────────────────────┐
│ CNP                    [Pre-filled]│
│ ┌─────────────────────────────────┐│
│ │ 1850101123456                   ││
│ └─────────────────────────────────┘│
│ ✓ Completat automat din contul tău│
└────────────────────────────────────┘
```

**Badge Styling:**
- Color: Light blue (`bg-blue-50`, `text-blue-600`)
- Icon: CheckCircle
- Text: "Pre-filled" or "Completat automat"

---

### 2. Post-Order Account Creation Modal

**Trigger:** After payment success page loads (for guests only)

**Modal Content:**
```
┌───────────────────────────────────────┐
│  ✨ Salvează datele pentru comenzi    │
│     viitoare!                         │
│                                       │
│  Ai completat deja toate datele.     │
│  Creează cont pentru:                 │
│                                       │
│  ✓ Completare automată la următoarea │
│    comandă                            │
│  ✓ Documentele tale KYC sunt deja    │
│    verificate                         │
│  ✓ Verifică statusul comenzilor tale │
│    oricând                            │
│                                       │
│  Email: ion@example.com (pre-filled) │
│  Parolă: [_______________]           │
│  Confirmă: [_______________]         │
│                                       │
│  ☑ Sunt de acord cu Termenii         │
│  ☑ Sunt de acord cu Politica Privacy │
│                                       │
│  [Creează Cont]  [Mai târziu]        │
└───────────────────────────────────────┘
```

**Behavior:**
- Auto-dismiss after 60 seconds if no interaction
- Can be dismissed with "Mai târziu" button
- Don't show again if user dismisses twice

---

### 3. KYC Document Status Indicators

**In Step 4 (KYC):**

**Already Verified:**
```
┌────────────────────────────────────┐
│ Carte Identitate - Față            │
│ [✓ Deja Verificat - 15 Ian 2025]  │
│ ┌──────────────────────────────┐  │
│ │ [Document preview image]      │  │
│ └──────────────────────────────┘  │
│ Expiră: 01 Ian 2030                │
│ [Previzualizează] [Înlocuiește]    │
└────────────────────────────────────┘
```

**Expiring Soon (< 30 days):**
```
┌────────────────────────────────────┐
│ ⚠ Carte Identitate - Față          │
│ Expiră în 15 zile!                 │
│ ┌──────────────────────────────┐  │
│ │ [Document preview image]      │  │
│ └──────────────────────────────┘  │
│ [Încarcă Document Nou]             │
└────────────────────────────────────┘
```

---

### 4. Billing Profile Selector

**In Step 2 (Personal Data):**

```
┌────────────────────────────────────┐
│ Profilul de Facturare              │
│ ┌──────────────────────────────┐  │
│ │ 👤 Personal (implicit)    ▼  │  │
│ └──────────────────────────────┘  │
│                                    │
│ Dropdown Options:                  │
│ - 📝 Date noi                      │
│ - 👤 Personal (implicit)           │
│ - 🏢 SC EXAMPLE SRL                │
│ - ➕ Adaugă profil nou             │
└────────────────────────────────────┘
```

---

### 5. Account Settings: Data Management

**Page: `/account/data-privacy`**

```
┌────────────────────────────────────┐
│ Confidențialitatea Datelor         │
│                                    │
│ Datele Tale Salvate                │
│ ✓ Date personale (CNP, nume, etc.)│
│ ✓ 3 documente KYC verificate       │
│ ✓ 1 profil de facturare            │
│ ✓ 2 adrese salvate                 │
│                                    │
│ [Exportă Datele]                   │
│ [Șterge Contul]                    │
└────────────────────────────────────┘
```

---

## Privacy & Security

### GDPR Compliance

#### 1. Data Collection Consent

**Before data collection, show:**
```
☑ Sunt de acord ca datele mele personale să fie procesate
  conform Politicii de Confidențialitate pentru procesarea
  comenzii. [Detalii]
```

**Modal on "Detalii":**
- What data we collect
- Why we collect it
- How long we store it
- Third parties with access
- User rights (access, export, delete)

---

#### 2. Data Storage Duration

| Data Type | Retention Period | Reasoning |
|-----------|------------------|-----------|
| Personal data (CNP, name) | Until account deletion | Account functionality |
| KYC documents (CI, selfie) | 5 years after last order | Legal requirement |
| Order history | 10 years | Financial/tax law |
| Anonymized analytics | Indefinite | No personal data |

**Auto-deletion triggers:**
- Account inactive for 3 years → Email warning → Delete after 30 days
- KYC documents older than 5 years with no active orders → Auto-delete

---

#### 3. Right to Data Portability

**Export My Data:**
- Generates JSON file with all user data
- Includes: profile, orders, KYC metadata, billing profiles
- Excludes: passwords, session tokens

**Example Export:**
```json
{
  "export_date": "2025-12-17T10:00:00Z",
  "user_id": "uuid-123",
  "profile": {
    "email": "ion@example.com",
    "first_name": "Ion",
    "last_name": "Popescu",
    "cnp": "1850101123456"
  },
  "orders": [
    {
      "order_number": "2025-000123",
      "service": "Cazier Fiscal",
      "created_at": "2025-01-15T10:00:00Z",
      "status": "completed"
    }
  ],
  "kyc_documents": [
    {
      "type": "ci_front",
      "verified_at": "2025-01-15T10:30:00Z",
      "expires_at": "2030-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 4. Right to Deletion

**Delete Account Flow:**
1. User clicks "Șterge Contul" in settings
2. Show confirmation modal with password input
3. User types "DELETE MY ACCOUNT" to confirm
4. Backend marks `profiles.deleted_at = NOW()`
5. Schedule background job to:
   - Delete S3 KYC documents
   - Anonymize order history (replace name with "Deleted User")
   - Remove from `profiles`, `user_saved_data`, `kyc_verifications`, `billing_profiles`
6. 30-day grace period before permanent deletion
7. Send confirmation email with "Undo" link

**Anonymization Example:**
```sql
UPDATE orders
SET customer_data = jsonb_set(
  customer_data,
  '{personal,first_name}',
  '"[Deleted User]"'
)
WHERE user_id = 'uuid-to-delete';
```

---

### Security Measures

#### 1. Password Requirements

- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (`!@#$%^&*`)

---

#### 2. KYC Document Encryption

**S3 Bucket Configuration:**
- Server-side encryption: AES-256
- Bucket policy: Private (no public access)
- Signed URLs with 5-minute expiry for viewing

**Example Signed URL Generation:**
```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getKYCDocumentURL(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}
```

---

#### 3. Row-Level Security (RLS)

**kyc_verifications policies:**
```sql
-- Users can only view their own KYC documents
CREATE POLICY "Users can view own KYC"
  ON kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all KYC documents
CREATE POLICY "Admins can view all KYC"
  ON kyc_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

#### 4. Audit Logging

Log all sensitive operations:

**Table: `audit_logs`**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100), -- 'view_kyc', 'export_data', 'delete_account'
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Trigger example:**
```sql
CREATE TRIGGER log_kyc_access
  AFTER SELECT ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION log_audit('view_kyc');
```

---

## Acceptance Criteria

### AC-001: Pre-fill for Logged-in Users

- [ ] Personal data (CNP, name, address) auto-filled from profile
- [ ] Contact data (email, phone) auto-filled
- [ ] KYC documents marked as "Already Verified" if exist
- [ ] "Pre-filled" badge shown on auto-filled fields
- [ ] User can edit any pre-filled field
- [ ] Billing profile dropdown shown with saved profiles
- [ ] Page load time < 2 seconds with pre-fill

---

### AC-002: Guest-to-Customer Conversion

- [ ] Modal shown on order confirmation page (guests only)
- [ ] Modal pre-fills email from order
- [ ] Password validation: min 12 chars, complexity requirements
- [ ] Terms & Privacy checkboxes required
- [ ] "Create Account" button triggers API call
- [ ] Success message shown: "Account created! Check email."
- [ ] All order data migrated to profile tables
- [ ] KYC documents linked to new user account
- [ ] Verification email sent within 10 seconds
- [ ] Modal can be dismissed (don't show again after 2 dismissals)

---

### AC-003: KYC Document Reuse

- [ ] Step 4 detects existing verified documents
- [ ] "Already Verified" badge shown with verification date
- [ ] Document preview image displayed
- [ ] Expiry date shown for CI/passport
- [ ] Warning shown if expiring within 30 days
- [ ] "Replace" button allows re-upload
- [ ] New upload creates new record, marks old as inactive
- [ ] User can skip Step 4 if all docs verified

---

### AC-004: Billing Profile Management

- [ ] Dropdown shows saved billing profiles
- [ ] "Add New Profile" option shown
- [ ] PF profile uses CNP + personal data
- [ ] PJ profile uses CUI + company data
- [ ] ANAF API auto-fills company data from CUI
- [ ] Can mark one profile as default
- [ ] Default profile auto-selected in new orders
- [ ] Can edit/delete profiles from account settings
- [ ] Cannot delete profile if used in pending orders

---

### AC-005: Data Privacy & GDPR

- [ ] "Export My Data" generates complete JSON export
- [ ] "Delete Account" shows confirmation modal
- [ ] Password required for account deletion
- [ ] Must type "DELETE MY ACCOUNT" to confirm
- [ ] 30-day grace period before permanent deletion
- [ ] Confirmation email sent with "Undo" link
- [ ] S3 KYC documents deleted on final deletion
- [ ] Order history anonymized (not deleted)
- [ ] All user data removed from tables after 30 days

---

## Technical Implementation

### Phase 1: Database Setup (Sprint 3, Week 1)

**Tasks:**
1. Create migration `006_user_data_persistence.sql`
2. Add tables: `user_saved_data`, `kyc_verifications`, `billing_profiles`
3. Add RLS policies for new tables
4. Create helper function: `migrate_order_to_profile()`
5. Add indexes for performance
6. Test migration in development

**Files to Create:**
- `supabase/migrations/006_user_data_persistence.sql`
- `docs/technical/database-schema-sprint3-part2.md`

---

### Phase 2: API Endpoints (Sprint 3, Week 2)

**Tasks:**
1. Create `GET /api/user/prefill-data` endpoint
2. Create `POST /api/auth/register-from-order` endpoint
3. Create `GET /api/user/billing-profiles` endpoint
4. Create `POST /api/user/billing-profiles` endpoint
5. Create `POST /api/anaf/lookup-cui` endpoint
6. Create `DELETE /api/user/account` endpoint
7. Add Supabase RLS integration
8. Write API tests

**Files to Create:**
- `app/api/user/prefill-data/route.ts`
- `app/api/auth/register-from-order/route.ts`
- `app/api/user/billing-profiles/route.ts`
- `app/api/anaf/lookup-cui/route.ts`
- `app/api/user/account/route.ts`

---

### Phase 3: Order Wizard Integration (Sprint 3, Week 3)

**Tasks:**
1. Update `order-wizard-provider.tsx` with pre-fill logic
2. Add `PREFILL_PERSONAL`, `PREFILL_KYC` reducer actions
3. Modify `personal-data-step.tsx` to show pre-filled data
4. Add billing profile selector to Step 2
5. Modify `kyc-step.tsx` to show "Already Verified" state
6. Add "Skip KYC" button if all docs verified
7. Test wizard with logged-in users

**Files to Modify:**
- `src/providers/order-wizard-provider.tsx`
- `src/components/orders/steps/personal-data-step.tsx`
- `src/components/orders/steps/kyc-step.tsx`

---

### Phase 4: Post-Order Conversion (Sprint 3, Week 4)

**Tasks:**
1. Create `SaveDataModal` component
2. Add modal trigger to order confirmation page
3. Implement password validation
4. Connect to `POST /api/auth/register-from-order`
5. Show success message with email verification prompt
6. Test guest-to-customer flow end-to-end

**Files to Create:**
- `src/components/orders/save-data-modal.tsx`
- `src/app/order-confirmation/page.tsx` (modify)

---

### Phase 5: Account Settings & Privacy (Sprint 3, Week 5)

**Tasks:**
1. Create `/account/data-privacy` page
2. Add "Export My Data" functionality
3. Add "Delete Account" flow
4. Implement 30-day deletion grace period
5. Create background job for final deletion
6. Test GDPR compliance flows

**Files to Create:**
- `src/app/account/data-privacy/page.tsx`
- `src/components/account/export-data-button.tsx`
- `src/components/account/delete-account-modal.tsx`
- `lib/jobs/delete-account-job.ts`

---

## Testing Strategy

### Unit Tests

**Test: Pre-fill API**
```typescript
describe('GET /api/user/prefill-data', () => {
  it('returns user profile data', async () => {
    const response = await fetch('/api/user/prefill-data', {
      headers: { Authorization: 'Bearer test-token' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.personal.cnp).toBe('1850101123456');
  });

  it('returns 401 for unauthenticated users', async () => {
    const response = await fetch('/api/user/prefill-data');
    expect(response.status).toBe(401);
  });
});
```

---

### Integration Tests

**Test: Guest-to-Customer Conversion**
```typescript
describe('Guest to Customer Conversion', () => {
  it('migrates order data to profile', async () => {
    // Create guest order
    const order = await createGuestOrder({
      customer_data: {
        personal: {
          cnp: '1850101123456',
          first_name: 'Ion',
          last_name: 'Popescu',
        },
      },
    });

    // Register from order
    const response = await fetch('/api/auth/register-from-order', {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.id,
        email: 'ion@example.com',
        password: 'SecurePass123!',
        acceptedTerms: true,
        acceptedPrivacy: true,
      }),
    });

    expect(response.status).toBe(200);

    // Check profile created
    const profile = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'ion@example.com')
      .single();

    expect(profile.data.cnp).toBe('1850101123456');

    // Check KYC documents migrated
    const kycDocs = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', profile.data.id);

    expect(kycDocs.data.length).toBeGreaterThan(0);
  });
});
```

---

### E2E Tests (Playwright)

**Test: Complete Order with Pre-filled Data**
```typescript
test('logged-in user completes order with pre-fill', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'ion@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Go to order page
  await page.goto('/order/cazier-fiscal');

  // Check Step 2 pre-filled
  await page.click('text=Date Personale');
  await expect(page.locator('[name="cnp"]')).toHaveValue('1850101123456');
  await expect(page.locator('[name="first_name"]')).toHaveValue('Ion');

  // Check Step 4 shows verified docs
  await page.click('text=Verificare KYC');
  await expect(page.locator('text=Deja Verificat')).toBeVisible();

  // Complete order
  await page.click('text=Finalizare');
  await page.click('button:has-text("Plătește")');

  // Order completion time should be < 3 minutes
});
```

---

## Edge Cases & Error Handling

### Edge Case 1: User Changes Email After Order

**Scenario:** Guest completes order with `email1@example.com`, tries to register with `email2@example.com`

**Solution:**
- Validate that registration email matches order email
- Show error: "Email-ul trebuie să fie același cu cel folosit la comandă"

---

### Edge Case 2: Order Already Linked to Account

**Scenario:** User tries to create account from order that's already linked

**Solution:**
- Check `orders.user_id IS NOT NULL` before migration
- Return error: "Această comandă este deja asociată unui cont"

---

### Edge Case 3: KYC Document Expired During Order

**Scenario:** User starts order with valid CI, but it expires before payment

**Solution:**
- Check expiry date before payment submission
- Show modal: "CI-ul tău a expirat. Te rugăm să încarci un document actualizat."
- Block payment until re-upload

---

### Edge Case 4: Duplicate CNP in Database

**Scenario:** Two users try to register with same CNP

**Solution:**
- Add unique constraint on `profiles.cnp`
- Return error: "Acest CNP este deja asociat unui cont"
- Suggest password recovery

---

### Edge Case 5: ANAF API Down

**Scenario:** CUI lookup fails due to ANAF API downtime

**Solution:**
- Show error: "Serviciul ANAF este temporar indisponibil. Completează manual datele firmei."
- Allow manual entry of company data
- Retry API call in background, update if successful

---

### Edge Case 6: Partial Data Migration Failure

**Scenario:** `migrate_order_to_profile()` fails midway (e.g., S3 upload fails)

**Solution:**
- Wrap entire migration in database transaction
- If any step fails, rollback all changes
- Log error details for debugging
- Return error to user: "Migrarea datelor a eșuat. Contactează suportul."

---

### Edge Case 7: User Deletes Account During Active Order

**Scenario:** User requests account deletion while having orders in "processing" status

**Solution:**
- Check for active orders before deletion
- Block deletion if orders exist with status: `pending`, `processing`, `kyc_pending`, `in_progress`
- Show error: "Nu poți șterge contul cu comenzi active. Așteaptă finalizarea sau anulează comenzile."

---

## Dependencies

### Internal Dependencies

| Dependency | Required For | Status |
|-----------|--------------|--------|
| Profiles table | User data storage | ✅ Exists |
| Orders table | Order-to-profile linking | ✅ Exists |
| Auth system | User authentication | ✅ Exists |
| S3 file upload | KYC document storage | ✅ Exists |
| OCR/AI validation | KYC document extraction | ✅ Exists |

---

### External Dependencies

| Service | Purpose | Documentation |
|---------|---------|---------------|
| ANAF API | CUI company lookup | https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva |
| Supabase Auth | User authentication | https://supabase.com/docs/guides/auth |
| AWS S3 | KYC document storage | https://aws.amazon.com/s3/ |
| Resend | Email verification | https://resend.com/docs |

---

### Third-Party Libraries

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x", // S3 operations
    "@aws-sdk/s3-request-presigner": "^3.x", // Signed URLs
    "zod": "^3.x", // Validation schemas
    "bcrypt": "^5.x" // Password hashing
  }
}
```

---

## Migration Plan

### Pre-Migration Checklist

- [ ] Backup production database
- [ ] Test migration in staging environment
- [ ] Review all RLS policies
- [ ] Test pre-fill API with sample data
- [ ] Test guest-to-customer flow end-to-end
- [ ] Verify GDPR compliance (export, delete flows)
- [ ] Load test with 1000+ pre-filled orders
- [ ] Security audit of KYC document access

---

### Migration Steps

1. **Week 1:** Database schema changes
   - Run migration `006_user_data_persistence.sql`
   - Seed sample data for testing
   - Verify indexes created

2. **Week 2:** Backend API development
   - Implement all 6 API endpoints
   - Add unit tests
   - Deploy to staging

3. **Week 3:** Frontend integration
   - Update order wizard provider
   - Modify Step 2 and Step 4 components
   - Test with real user flows

4. **Week 4:** Post-order conversion
   - Build SaveDataModal component
   - Test guest-to-customer conversion
   - Verify email verification flow

5. **Week 5:** Privacy features
   - Build data export functionality
   - Build account deletion flow
   - Test GDPR compliance

---

### Rollback Plan

If critical issues arise:

```sql
-- Rollback migration
DROP TABLE IF EXISTS billing_profiles CASCADE;
DROP TABLE IF EXISTS kyc_verifications CASCADE;
DROP TABLE IF EXISTS user_saved_data CASCADE;
DROP FUNCTION IF EXISTS migrate_order_to_profile(UUID, UUID);

-- Restore from backup
-- psql -U postgres -d eghiseul < backup_20251217.sql
```

---

## Success Criteria

### Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Order completion time (logged-in) | < 3 min | Google Analytics event tracking |
| Guest-to-customer conversion | > 25% | `COUNT(*)` from `auth.users` where `created_via = 'order'` |
| KYC reuse rate | > 80% | `COUNT(*)` orders with `reused_kyc = true` |
| Pre-fill accuracy | > 95% | Manual QA testing |
| API response time (pre-fill) | < 500ms | Server logs |

---

### Qualitative Goals

- [ ] Users report faster checkout experience
- [ ] Reduced support tickets for "lost data" issues
- [ ] Positive feedback on guest-to-customer conversion
- [ ] No GDPR compliance complaints
- [ ] Clean audit trail for all sensitive operations

---

## Documentation Deliverables

- [x] This feature specification document
- [ ] Database schema documentation update
- [ ] API endpoint documentation (OpenAPI spec)
- [ ] User guide: "How to Save Your Data"
- [ ] Admin guide: "Managing User Data & KYC"
- [ ] Privacy policy updates for new data collection

---

## Next Steps

1. **Review this spec** with product and engineering teams
2. **Estimate effort** (current estimate: 5 weeks)
3. **Add to Sprint 3 backlog**
4. **Assign tasks** to developers
5. **Create subtasks** in project management tool
6. **Schedule kick-off meeting**

---

## Appendix

### A. Sample SQL Queries

**Get user's pre-fill data:**
```sql
SELECT
  p.cnp,
  p.first_name,
  p.last_name,
  p.birth_date,
  usd.data AS address,
  kv.file_url AS ci_front_url,
  kv.verified_at,
  kv.expires_at
FROM profiles p
LEFT JOIN user_saved_data usd ON usd.user_id = p.id AND usd.data_type = 'address' AND usd.is_default = TRUE
LEFT JOIN kyc_verifications kv ON kv.user_id = p.id AND kv.document_type = 'ci_front' AND kv.is_active = TRUE
WHERE p.id = 'user-uuid';
```

---

### B. Environment Variables

```env
# ANAF API
ANAF_API_URL=https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva

# AWS S3
AWS_S3_BUCKET=eghiseul-kyc-documents
AWS_S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Email
RESEND_API_KEY=xxx
```

---

### C. Related Documents

- [Sprint 3 Master Plan](/docs/sprints/sprint-3-kyc-documents.md)
- [Database Schema - Sprint 2](/docs/technical/database-schema-sprint2.md)
- [API Documentation](/docs/technical/api/services-api.md)
- [GDPR Compliance Guide](/docs/legal/gdpr-compliance.md)

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** 2025-12-17
**Version:** 1.0
**Author:** Development Team
**Reviewers:** Product Manager, Engineering Lead, Legal Advisor
