-- Migration: Add company profile columns to profiles table
-- Enables dual PF (Persoana Fizica) + PJ (Persoana Juridica) profiles per user

-- Add company columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_cui VARCHAR(10),
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS company_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS company_registration_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS company_address TEXT,
  ADD COLUMN IF NOT EXISTS company_is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS company_vat_payer BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS company_verified BOOLEAN DEFAULT FALSE;

-- Extend kyc_verifications document_type CHECK constraint
-- Drop old constraint and add new one with company document types
ALTER TABLE kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_document_type_check;

ALTER TABLE kyc_verifications
  ADD CONSTRAINT kyc_verifications_document_type_check
  CHECK (document_type IN (
    'ci_front', 'ci_back', 'ci_nou_front', 'ci_nou_back',
    'selfie', 'passport', 'address_certificate',
    'company_registration_cert', 'company_statement_cert'
  ));
