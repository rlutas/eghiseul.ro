-- =============================================
-- Migration: 015_user_data_persistence
-- Description: Tables for user data persistence, KYC reuse, and billing profiles
-- Date: 2026-01-06
-- Feature: FEAT-004 - User Data Persistence & Account Creation
-- =============================================

-- 1. Extend profiles table with birth info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);

-- 2. Create user_saved_data table
-- Stores reusable personal data, addresses, and contact info
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

-- Indexes for user_saved_data
CREATE INDEX IF NOT EXISTS idx_user_saved_data_user ON user_saved_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_data_type ON user_saved_data(user_id, data_type);

-- Only one default per user per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_saved_data_default
  ON user_saved_data(user_id, data_type)
  WHERE is_default = TRUE;

-- 3. Create kyc_verifications table
-- Stores verified KYC documents for reuse across orders
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ci_front', 'ci_back', 'selfie', 'passport', 'address_certificate')),
  file_url TEXT NOT NULL,
  file_key TEXT, -- S3 key for deletion
  file_size INTEGER,
  mime_type VARCHAR(50),
  validation_result JSONB, -- OCR/KYC validation results
  extracted_data JSONB, -- Extracted data from document (CNP, name, etc.)
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- CI/passport expiry date
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for kyc_verifications
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_active ON kyc_verifications(user_id, document_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_kyc_expiry ON kyc_verifications(expires_at) WHERE is_active = TRUE;

-- 4. Create billing_profiles table
-- Stores billing profiles for persoana fizica and persoana juridica
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

-- Indexes for billing_profiles
CREATE INDEX IF NOT EXISTS idx_billing_user ON billing_profiles(user_id);

-- Only one default billing profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_default
  ON billing_profiles(user_id)
  WHERE is_default = TRUE;

-- =============================================
-- RLS POLICIES
-- =============================================

-- 5. RLS for user_saved_data
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

-- 6. RLS for kyc_verifications
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

-- 7. RLS for billing_profiles
ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing profiles"
  ON billing_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing profiles"
  ON billing_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing profiles"
  ON billing_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own billing profiles"
  ON billing_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- 8. Function: migrate_order_to_profile
-- Migrates order data to user profile after guest-to-customer conversion
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

  -- Extract data from customer_data JSONB
  v_personal := v_order.customer_data->'personal';
  v_contact := v_order.customer_data->'contact';
  v_address := COALESCE(v_personal->'address', v_order.customer_data->'personalKyc'->'address');
  v_kyc := v_order.kyc_documents;

  -- Update profiles with personal data
  UPDATE profiles SET
    cnp = COALESCE(
      v_personal->>'cnp',
      v_order.customer_data->'personalKyc'->>'cnp',
      cnp
    ),
    first_name = COALESCE(
      v_personal->>'firstName',
      v_personal->>'first_name',
      v_order.customer_data->'personalKyc'->>'firstName',
      first_name
    ),
    last_name = COALESCE(
      v_personal->>'lastName',
      v_personal->>'last_name',
      v_order.customer_data->'personalKyc'->>'lastName',
      last_name
    ),
    birth_date = CASE
      WHEN v_personal->>'birthDate' IS NOT NULL THEN (v_personal->>'birthDate')::DATE
      WHEN v_order.customer_data->'personalKyc'->>'birthDate' IS NOT NULL
        THEN (v_order.customer_data->'personalKyc'->>'birthDate')::DATE
      ELSE birth_date
    END,
    birth_place = COALESCE(
      v_personal->>'birthPlace',
      v_order.customer_data->'personalKyc'->>'birthPlace',
      birth_place
    ),
    phone = COALESCE(
      v_contact->>'phone',
      v_order.customer_data->'contact'->>'phone',
      phone
    ),
    kyc_verified = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert saved address (if exists and valid)
  IF v_address IS NOT NULL AND v_address != 'null'::JSONB AND v_address != '{}'::JSONB THEN
    INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
    VALUES (p_user_id, 'address', 'Adresa din comandă', v_address, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert saved contact (if exists)
  IF v_contact IS NOT NULL AND v_contact != 'null'::JSONB THEN
    INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
    VALUES (p_user_id, 'contact', 'Contact principal', v_contact, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Link order to user
  UPDATE orders SET user_id = p_user_id WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function: check_kyc_expiry
-- Returns KYC documents that are expiring within N days
CREATE OR REPLACE FUNCTION check_kyc_expiry(
  p_user_id UUID,
  p_days_threshold INTEGER DEFAULT 30
) RETURNS TABLE (
  document_type VARCHAR(50),
  expires_at TIMESTAMPTZ,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kv.document_type,
    kv.expires_at,
    EXTRACT(DAY FROM (kv.expires_at - NOW()))::INTEGER AS days_until_expiry
  FROM kyc_verifications kv
  WHERE kv.user_id = p_user_id
    AND kv.is_active = TRUE
    AND kv.expires_at IS NOT NULL
    AND kv.expires_at <= NOW() + (p_days_threshold || ' days')::INTERVAL
  ORDER BY kv.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUTO-UPDATE TIMESTAMPS
-- =============================================

-- 10. Triggers for updated_at
CREATE TRIGGER user_saved_data_updated_at
  BEFORE UPDATE ON user_saved_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER billing_profiles_updated_at
  BEFORE UPDATE ON billing_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE user_saved_data IS 'Stores reusable personal data, addresses, and contact info for logged-in users';
COMMENT ON TABLE kyc_verifications IS 'Stores verified KYC documents (CI, passport, selfie) for reuse across orders';
COMMENT ON TABLE billing_profiles IS 'Stores billing profiles for persoana fizica and persoana juridica';
COMMENT ON FUNCTION migrate_order_to_profile IS 'Migrates order data to user profile after guest-to-customer conversion';
COMMENT ON FUNCTION check_kyc_expiry IS 'Returns KYC documents expiring within N days (default 30)';

-- =============================================
-- Run this migration in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =============================================
