/**
 * Temporary script to run migration 021 via Supabase Management API
 * Run: npx tsx scripts/run-migration-021.ts
 * Delete after migration is applied.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://llbwmitdrppomeptqlue.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsYndtaXRkcnBwb21lcHRxbHVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg0NjYwMywiZXhwIjoyMDgxNDIyNjAzfQ.7mOPV2BJZ7AVPHQmV3b4jMN2nIpUzkU9RtQ5PQDk0k4';

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Check if migration already applied
  const { error: checkError } = await supabase
    .from('profiles')
    .select('id, company_cui')
    .limit(1);

  if (!checkError) {
    console.log('Migration 021 already applied - company columns exist.');
    return;
  }

  console.log('Migration 021 needs to be applied.');
  console.log('');
  console.log('Please run the following SQL in the Supabase Dashboard SQL Editor:');
  console.log('Go to: https://supabase.com/dashboard/project/llbwmitdrppomeptqlue/sql/new');
  console.log('');
  console.log('--- SQL START ---');
  console.log(`
-- Migration 021: Add company profile columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_cui VARCHAR(10),
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS company_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS company_registration_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS company_address TEXT,
  ADD COLUMN IF NOT EXISTS company_is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS company_vat_payer BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS company_verified BOOLEAN DEFAULT FALSE;

-- Extend kyc_verifications document_type to include company doc types
ALTER TABLE kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_document_type_check;

ALTER TABLE kyc_verifications
  ADD CONSTRAINT kyc_verifications_document_type_check
  CHECK (document_type IN (
    'ci_front', 'ci_back', 'ci_nou_front', 'ci_nou_back',
    'selfie', 'passport', 'address_certificate',
    'company_registration_cert', 'company_statement_cert'
  ));
  `);
  console.log('--- SQL END ---');
}

main().catch(console.error);
