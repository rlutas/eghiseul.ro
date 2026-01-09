# User Data Persistence - Implementation Roadmap

**Feature ID:** FEAT-004
**Parent Spec:** `docs/technical/specs/user-data-persistence.md`
**Status:** ✅ Partially Implemented (Account Management Complete)
**Created:** 2026-01-06
**Updated:** 2026-01-08
**Priority:** P0 (Account Management ✅ | Pre-fill ⏳)

---

## Executive Summary

Acest document este ghidul de implementare pentru funcționalitatea "User Data Persistence" care permite:

1. **Pre-fill pentru useri logați** - datele personale și KYC auto-completate
2. **Guest-to-Customer conversion** - creare cont după comandă cu migrare date
3. **KYC reuse** - documentele verificate nu trebuie re-încărcate
4. **Profile de facturare** - salvare PF/PJ pentru comenzi viitoare

---

## Current State Analysis

### Ce EXISTĂ deja:

| Component | Status | Location |
|-----------|--------|----------|
| Auth System | ✅ Complete | `src/app/auth/`, Supabase Auth |
| Profiles Table | ✅ Basic | `supabase/migrations/001_profiles.sql` |
| Orders System | ✅ Complete | `src/app/api/orders/` |
| OCR/KYC Validation | ✅ Complete | `src/app/api/ocr/`, `src/app/api/kyc/` |
| Modular Wizard | ✅ Complete | `src/providers/modular-wizard-provider.tsx` |
| Draft Auto-Save | ✅ Complete | localStorage + `/api/orders/draft` |
| Account Page | ✅ Basic | `src/app/(customer)/account/page.tsx` |

### Ce LIPSEȘTE:

| Component | Status | Priority |
|-----------|--------|----------|
| `user_saved_data` table | ✅ Exists (via migration 015) | P0 |
| `kyc_verifications` table | ✅ Exists (via migration 015) | P0 |
| `billing_profiles` table | ✅ Exists (via migration 015) | P1 |
| `GET /api/user/prefill-data` | ✅ Exists | P0 |
| `POST /api/auth/register-from-order` | ✅ Exists | P0 |
| Pre-fill logic in wizard | ⏳ Pending | P0 |
| SaveDataModal component | ✅ Exists | P0 |
| KYC "Already Verified" UI | ✅ Implemented in Account KYC Tab | P1 |
| Account data management pages | ✅ Complete (Profile, KYC, Addresses, Billing) | P2 |
| GDPR export/delete | ⏳ Pending | P2 |

### Account Management (✅ COMPLETE - 2026-01-08)

| Component | Status | Notes |
|-----------|--------|-------|
| Profile Tab | ✅ Complete | ID scan with OCR, auto-fill, save to KYC |
| KYC Tab | ✅ Complete | Front (required), back (optional), selfie with ID |
| Addresses Tab | ✅ Complete | Multiple addresses, duplicate prevention |
| Billing Tab | ✅ Complete | PF/PJ profiles, CNP-based deduplication |
| IdScanner Component | ✅ Extended | Added `showSelfieWithId` prop |
| Duplicate Prevention | ✅ Complete | Addresses by (street, number, city), billing by CNP |

---

## Implementation Phases

### Phase 1: Database Foundation (Migration 015)

**Priority:** P0 - Must complete first
**Files to Create:**
- `supabase/migrations/015_user_data_persistence.sql`

```sql
-- =============================================
-- Migration: 015_user_data_persistence
-- Description: Tables for user data persistence & KYC reuse
-- Date: 2026-01-06
-- =============================================

-- 1. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);

-- 2. Create user_saved_data table
CREATE TABLE IF NOT EXISTS user_saved_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('personal', 'address', 'contact')),
  label VARCHAR(100) NOT NULL DEFAULT 'Default',
  data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_saved_data_user ON user_saved_data(user_id);
CREATE INDEX idx_user_saved_data_type ON user_saved_data(user_id, data_type);

-- Only one default per user per type
CREATE UNIQUE INDEX idx_user_saved_data_default
  ON user_saved_data(user_id, data_type)
  WHERE is_default = TRUE;

-- 3. Create kyc_verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ci_front', 'ci_back', 'selfie', 'passport')),
  file_url TEXT NOT NULL,
  file_key TEXT, -- S3 key for deletion
  file_size INTEGER,
  mime_type VARCHAR(50),
  validation_result JSONB,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- CI/passport expiry date
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_active ON kyc_verifications(user_id, document_type) WHERE is_active = TRUE;
CREATE INDEX idx_kyc_expiry ON kyc_verifications(expires_at) WHERE is_active = TRUE;

-- 4. Create billing_profiles table
CREATE TABLE IF NOT EXISTS billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('persoana_fizica', 'persoana_juridica')),
  label VARCHAR(100) NOT NULL,
  billing_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_user ON billing_profiles(user_id);
CREATE UNIQUE INDEX idx_billing_default ON billing_profiles(user_id) WHERE is_default = TRUE;

-- 5. RLS Policies for user_saved_data
ALTER TABLE user_saved_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved data"
  ON user_saved_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved data"
  ON user_saved_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved data"
  ON user_saved_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved data"
  ON user_saved_data FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RLS Policies for kyc_verifications
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC"
  ON kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC"
  ON kyc_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC"
  ON kyc_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all KYC
CREATE POLICY "Admins can view all KYC"
  ON kyc_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. RLS Policies for billing_profiles
ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own billing profiles"
  ON billing_profiles FOR ALL
  USING (auth.uid() = user_id);

-- 8. Function: migrate_order_to_profile
CREATE OR REPLACE FUNCTION migrate_order_to_profile(
  p_order_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_order RECORD;
  v_personal JSONB;
  v_contact JSONB;
  v_address JSONB;
  v_kyc JSONB;
BEGIN
  -- Get order data
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  v_personal := v_order.customer_data->'personal';
  v_contact := v_order.customer_data->'contact';
  v_address := v_personal->'address';
  v_kyc := v_order.kyc_documents;

  -- Update profiles with personal data
  UPDATE profiles SET
    cnp = COALESCE(v_personal->>'cnp', cnp),
    first_name = COALESCE(v_personal->>'firstName', v_personal->>'first_name', first_name),
    last_name = COALESCE(v_personal->>'lastName', v_personal->>'last_name', last_name),
    birth_date = CASE
      WHEN v_personal->>'birthDate' IS NOT NULL
      THEN (v_personal->>'birthDate')::DATE
      ELSE birth_date
    END,
    birth_place = COALESCE(v_personal->>'birthPlace', birth_place),
    phone = COALESCE(v_contact->>'phone', phone),
    kyc_verified = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert saved address (if exists)
  IF v_address IS NOT NULL AND v_address != 'null'::JSONB THEN
    INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
    VALUES (p_user_id, 'address', 'Adresa din comandă', v_address, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert saved contact (if exists)
  IF v_contact IS NOT NULL THEN
    INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
    VALUES (p_user_id, 'contact', 'Contact principal', v_contact, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Link order to user
  UPDATE orders SET user_id = p_user_id WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Auto-update timestamps
CREATE TRIGGER user_saved_data_updated_at
  BEFORE UPDATE ON user_saved_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER billing_profiles_updated_at
  BEFORE UPDATE ON billing_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### Phase 2: Pre-fill API

**Priority:** P0
**Files to Create:**
- `src/app/api/user/prefill-data/route.ts`

**Implementation:**

```typescript
// src/app/api/user/prefill-data/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch saved addresses
  const { data: savedData } = await supabase
    .from('user_saved_data')
    .select('*')
    .eq('user_id', user.id);

  // Fetch active KYC documents
  const { data: kycDocs } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Fetch billing profiles
  const { data: billingProfiles } = await supabase
    .from('billing_profiles')
    .select('*')
    .eq('user_id', user.id);

  // Check for expiring documents (within 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const kycDocuments = kycDocs?.reduce((acc, doc) => {
    const isExpiringSoon = doc.expires_at && new Date(doc.expires_at) <= thirtyDaysFromNow;
    acc[doc.document_type] = {
      id: doc.id,
      file_url: doc.file_url,
      verified_at: doc.verified_at,
      expires_at: doc.expires_at,
      is_expiring_soon: isExpiringSoon,
      validation_result: doc.validation_result,
    };
    return acc;
  }, {} as Record<string, any>) || {};

  // Build personal data from profile + saved data
  const addressData = savedData?.find(d => d.data_type === 'address' && d.is_default);
  const contactData = savedData?.find(d => d.data_type === 'contact' && d.is_default);

  return NextResponse.json({
    success: true,
    data: {
      personal: {
        cnp: profile?.cnp || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        birthDate: profile?.birth_date || '',
        birthPlace: profile?.birth_place || '',
        address: addressData?.data || null,
      },
      contact: {
        email: profile?.email || user.email || '',
        phone: profile?.phone || '',
        ...(contactData?.data || {}),
      },
      kyc_documents: kycDocuments,
      kyc_verified: profile?.kyc_verified || false,
      billing_profiles: billingProfiles || [],
    },
  });
}
```

---

### Phase 3: Guest-to-Customer API

**Priority:** P0
**Files to Create:**
- `src/app/api/auth/register-from-order/route.ts`

**Implementation:**

```typescript
// src/app/api/auth/register-from-order/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RegisterRequest {
  orderId: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { orderId, email, password, acceptedTerms, acceptedPrivacy } = body;

    // Validate required fields
    if (!orderId || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      return NextResponse.json(
        { error: 'Must accept terms and privacy policy' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Validate order exists and is not linked to a user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .is('user_id', null)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found or already linked to an account' },
        { status: 404 }
      );
    }

    // Validate email matches order
    const orderEmail = order.customer_data?.contact?.email;
    if (orderEmail && orderEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email must match the order email' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: order.customer_data?.personal?.firstName || order.customer_data?.personal?.first_name,
          last_name: order.customer_data?.personal?.lastName || order.customer_data?.personal?.last_name,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Migrate order data to profile
    const { error: migrateError } = await supabase.rpc('migrate_order_to_profile', {
      p_order_id: orderId,
      p_user_id: authData.user.id,
    });

    if (migrateError) {
      console.error('Migration error:', migrateError);
      // Don't fail the registration, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Cont creat cu succes! Verifică email-ul pentru confirmare.',
      data: {
        userId: authData.user.id,
        email,
        verificationSent: !authData.session, // If no session, email confirmation is required
      },
    });
  } catch (error) {
    console.error('Register from order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Phase 4: Wizard Pre-fill Integration

**Priority:** P0
**Files to Modify:**
- `src/providers/modular-wizard-provider.tsx`

**Changes Required:**

1. Add new action types:
```typescript
| { type: 'PREFILL_FROM_PROFILE'; payload: PrefillData }
| { type: 'SET_KYC_VERIFIED'; payload: { documentType: string; verified: boolean } }
```

2. Add useEffect to load pre-fill data on mount (when user is logged in):
```typescript
useEffect(() => {
  const loadPrefillData = async () => {
    try {
      const response = await fetch('/api/user/prefill-data');
      if (!response.ok) return;

      const result = await response.json();
      if (result.success && result.data) {
        dispatch({ type: 'PREFILL_FROM_PROFILE', payload: result.data });
      }
    } catch (error) {
      console.error('Failed to load prefill data:', error);
    }
  };

  // Only load if we have a user (check via cookie or context)
  loadPrefillData();
}, []);
```

3. Update PersonalDataStep to show "Pre-filled" badges on auto-filled fields

---

### Phase 5: SaveDataModal Component

**Priority:** P0
**Files to Create:**
- `src/components/orders/save-data-modal.tsx`

**Implementation:**

```typescript
// src/components/orders/save-data-modal.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Sparkles } from 'lucide-react';

interface SaveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  email: string;
}

export function SaveDataModal({ isOpen, onClose, orderId, email }: SaveDataModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    if (password.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Trebuie să accepți termenii și politica de confidențialitate');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register-from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email,
          password,
          acceptedTerms,
          acceptedPrivacy,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'A apărut o eroare');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('A apărut o eroare de rețea');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Cont creat cu succes!
            </DialogTitle>
            <DialogDescription>
              Am trimis un email de verificare la {email}.
              Te rugăm să confirmi adresa de email pentru a-ți activa contul.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} className="w-full">
            Am înțeles
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Salvează datele pentru comenzi viitoare!
          </DialogTitle>
          <DialogDescription>
            Ai completat deja toate datele. Creează cont pentru:
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Completare automată la următoarea comandă
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Documentele tale KYC sunt deja verificate
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Verifică statusul comenzilor tale oricând
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minim 8 caractere"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmă parola</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm">
                Sunt de acord cu{' '}
                <a href="/terms" className="text-primary underline" target="_blank">
                  Termenii și Condițiile
                </a>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
              />
              <label htmlFor="privacy" className="text-sm">
                Sunt de acord cu{' '}
                <a href="/privacy" className="text-primary underline" target="_blank">
                  Politica de Confidențialitate
                </a>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Se creează...' : 'Creează Cont'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Mai târziu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Phase 6: KYC Reuse UI

**Priority:** P1
**Files to Modify:**
- `src/components/orders/modules/personal-kyc/DocumentUploadStep.tsx` (or equivalent)

**Changes Required:**

1. Check if user has verified KYC documents from pre-fill data
2. Show "Already Verified" state with document preview
3. Add "Replace" button to upload new document if needed
4. Show expiry warning if document expires within 30 days

---

## Implementation Priority Order

```
Week 1:
├── Phase 1: Database Migration (015_user_data_persistence.sql)
├── Phase 2: Pre-fill API (/api/user/prefill-data)
└── Phase 3: Register from Order API (/api/auth/register-from-order)

Week 2:
├── Phase 4: Wizard Pre-fill Integration
└── Phase 5: SaveDataModal Component

Week 3:
├── Phase 6: KYC Reuse UI
├── Order Confirmation Page Integration
└── Testing & Bug Fixes
```

---

## Testing Checklist

### Pre-fill Flow
- [ ] Logged-in user sees pre-filled personal data
- [ ] Logged-in user sees pre-filled contact info
- [ ] Logged-in user sees "Already Verified" for KYC docs
- [ ] Pre-filled fields show visual indicator
- [ ] User can edit pre-filled fields

### Guest-to-Customer Flow
- [ ] Modal appears on order confirmation (guests only)
- [ ] Email is pre-filled from order
- [ ] Password validation works (min 8 chars)
- [ ] Terms/Privacy checkboxes required
- [ ] Account created successfully
- [ ] Order linked to new user
- [ ] Data migrated to profile tables
- [ ] Verification email sent

### KYC Reuse Flow
- [ ] Verified documents show "Already Verified"
- [ ] Expiring documents show warning
- [ ] User can replace documents
- [ ] New uploads create new records
- [ ] Old uploads marked inactive

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/user/prefill-data` | GET | Fetch saved user data | To Build |
| `/api/auth/register-from-order` | POST | Guest-to-customer | To Build |
| `/api/user/billing-profiles` | GET/POST | Billing profiles | Phase 2 |
| `/api/user/account` | DELETE | GDPR deletion | Phase 2 |
| `/api/user/export` | GET | GDPR data export | Phase 2 |

---

## Related Documents

- [Full Feature Spec](/docs/technical/specs/user-data-persistence.md)
- [Order Autosave System](/docs/technical/specs/order-autosave-system.md)
- [Modular Verification Architecture](/docs/technical/specs/modular-verification-architecture.md)
- [Database Schema](/docs/technical/database/)

---

**Document Version:** 1.1
**Last Updated:** 2026-01-08
**Completed Features:** Account Management (Profile, KYC, Addresses, Billing tabs)
