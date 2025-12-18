-- Migration: 007_pii_encryption.sql
-- Description: Add encryption for sensitive PII fields (CNP, CI series/number)
-- Created: 2025-12-17
-- Security: CRITICAL - Addresses CRIT-001 and CRIT-004 from security audit

-- ============================================================================
-- ENABLE PGCRYPTO EXTENSION
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENCRYPTED PII STORAGE
-- We store encrypted versions of sensitive fields separately from customer_data
-- This allows us to keep the JSONB queryable while protecting PII
-- ============================================================================

-- Add encrypted columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS encrypted_cnp BYTEA;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS encrypted_ci_series BYTEA;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS encrypted_ci_number BYTEA;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pii_encrypted_at TIMESTAMPTZ;

-- ============================================================================
-- ENCRYPTION HELPER FUNCTIONS
-- Using symmetric encryption (AES-256) with key from environment
-- ============================================================================

-- Function to encrypt text using AES-256
-- Key should be stored in Supabase Vault or environment variable
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT, encryption_key TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;

  -- Use AES-256 encryption with CBC mode
  -- The key is hashed to ensure consistent 32-byte length for AES-256
  RETURN pgp_sym_encrypt(
    plaintext,
    encryption_key,
    'cipher-algo=aes256'
  );
END;
$$;

-- Function to decrypt text
CREATE OR REPLACE FUNCTION decrypt_pii(ciphertext BYTEA, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF ciphertext IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN pgp_sym_decrypt(ciphertext, encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    -- Log decryption failure but don't expose details
    RAISE WARNING 'PII decryption failed';
    RETURN NULL;
END;
$$;

-- ============================================================================
-- MASKING FUNCTIONS (for display without full decryption)
-- ============================================================================

-- Mask CNP: show first 1 digit and last 4 (e.g., 1***********3456)
CREATE OR REPLACE FUNCTION mask_cnp(cnp TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF cnp IS NULL OR length(cnp) < 13 THEN
    RETURN '***';
  END IF;
  RETURN substring(cnp, 1, 1) || '***********' || substring(cnp, 10, 4);
END;
$$;

-- Mask CI Number: show last 3 digits (e.g., ***628)
CREATE OR REPLACE FUNCTION mask_ci_number(ci_number TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF ci_number IS NULL OR length(ci_number) < 3 THEN
    RETURN '***';
  END IF;
  RETURN '***' || substring(ci_number, length(ci_number) - 2, 3);
END;
$$;

-- ============================================================================
-- MIGRATION FUNCTION
-- Encrypts existing plaintext PII in customer_data
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_pii_to_encrypted(encryption_key TEXT)
RETURNS TABLE(migrated_count INT, error_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_migrated INT := 0;
  v_errors INT := 0;
  v_order RECORD;
BEGIN
  FOR v_order IN
    SELECT
      id,
      customer_data->'personal'->>'cnp' as cnp,
      customer_data->'personal'->>'ci_series' as ci_series,
      customer_data->'personal'->>'ci_number' as ci_number
    FROM orders
    WHERE pii_encrypted_at IS NULL
    AND customer_data->'personal' IS NOT NULL
  LOOP
    BEGIN
      UPDATE orders
      SET
        encrypted_cnp = CASE
          WHEN v_order.cnp IS NOT NULL AND v_order.cnp != ''
          THEN encrypt_pii(v_order.cnp, encryption_key)
          ELSE NULL
        END,
        encrypted_ci_series = CASE
          WHEN v_order.ci_series IS NOT NULL AND v_order.ci_series != ''
          THEN encrypt_pii(v_order.ci_series, encryption_key)
          ELSE NULL
        END,
        encrypted_ci_number = CASE
          WHEN v_order.ci_number IS NOT NULL AND v_order.ci_number != ''
          THEN encrypt_pii(v_order.ci_number, encryption_key)
          ELSE NULL
        END,
        pii_encrypted_at = NOW(),
        -- Redact PII from customer_data JSONB
        customer_data = customer_data || jsonb_build_object(
          'personal',
          (customer_data->'personal') - 'cnp' - 'ci_series' - 'ci_number' ||
          jsonb_build_object(
            'cnp_masked', mask_cnp(v_order.cnp),
            'ci_series_masked', v_order.ci_series,  -- Series is 2 letters, less sensitive
            'ci_number_masked', mask_ci_number(v_order.ci_number)
          )
        )
      WHERE id = v_order.id;

      v_migrated := v_migrated + 1;
    EXCEPTION
      WHEN OTHERS THEN
        v_errors := v_errors + 1;
        RAISE WARNING 'Failed to migrate order %: %', v_order.id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT v_migrated, v_errors;
END;
$$;

-- ============================================================================
-- INSERT TRIGGER: Auto-encrypt PII on new orders
-- ============================================================================

CREATE OR REPLACE FUNCTION encrypt_order_pii()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
  v_cnp TEXT;
  v_ci_series TEXT;
  v_ci_number TEXT;
BEGIN
  -- Get encryption key from environment
  -- In production, this would come from Supabase Vault
  v_key := current_setting('app.pii_encryption_key', true);

  -- If no key is set, don't encrypt (development mode)
  IF v_key IS NULL OR v_key = '' THEN
    RETURN NEW;
  END IF;

  -- Extract PII from customer_data
  v_cnp := NEW.customer_data->'personal'->>'cnp';
  v_ci_series := NEW.customer_data->'personal'->>'ci_series';
  v_ci_number := NEW.customer_data->'personal'->>'ci_number';

  -- Encrypt and store
  IF v_cnp IS NOT NULL AND v_cnp != '' THEN
    NEW.encrypted_cnp := encrypt_pii(v_cnp, v_key);
  END IF;

  IF v_ci_series IS NOT NULL AND v_ci_series != '' THEN
    NEW.encrypted_ci_series := encrypt_pii(v_ci_series, v_key);
  END IF;

  IF v_ci_number IS NOT NULL AND v_ci_number != '' THEN
    NEW.encrypted_ci_number := encrypt_pii(v_ci_number, v_key);
  END IF;

  -- Mark as encrypted and redact from JSONB
  IF v_cnp IS NOT NULL OR v_ci_series IS NOT NULL OR v_ci_number IS NOT NULL THEN
    NEW.pii_encrypted_at := NOW();

    -- Redact PII from customer_data, keep masked versions
    NEW.customer_data := NEW.customer_data || jsonb_build_object(
      'personal',
      (NEW.customer_data->'personal') - 'cnp' - 'ci_series' - 'ci_number' ||
      jsonb_build_object(
        'cnp_masked', mask_cnp(v_cnp),
        'ci_series_masked', v_ci_series,
        'ci_number_masked', mask_ci_number(v_ci_number)
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new orders (only if encryption key is set)
DROP TRIGGER IF EXISTS trg_encrypt_order_pii ON orders;
CREATE TRIGGER trg_encrypt_order_pii
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.pii_encrypted_at IS NULL AND NEW.customer_data->'personal' IS NOT NULL)
  EXECUTE FUNCTION encrypt_order_pii();

-- ============================================================================
-- DECRYPT FUNCTION FOR API USE
-- Returns decrypted PII for authorized access
-- ============================================================================

CREATE OR REPLACE FUNCTION get_order_decrypted_pii(
  p_order_id UUID,
  p_encryption_key TEXT
)
RETURNS TABLE(
  cnp TEXT,
  ci_series TEXT,
  ci_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    decrypt_pii(o.encrypted_cnp, p_encryption_key) as cnp,
    decrypt_pii(o.encrypted_ci_series, p_encryption_key) as ci_series,
    decrypt_pii(o.encrypted_ci_number, p_encryption_key) as ci_number
  FROM orders o
  WHERE o.id = p_order_id;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN orders.encrypted_cnp IS 'AES-256 encrypted CNP (Romanian Personal Numeric Code)';
COMMENT ON COLUMN orders.encrypted_ci_series IS 'AES-256 encrypted CI series (e.g., XV)';
COMMENT ON COLUMN orders.encrypted_ci_number IS 'AES-256 encrypted CI number (e.g., 517628)';
COMMENT ON COLUMN orders.pii_encrypted_at IS 'Timestamp when PII was encrypted';

COMMENT ON FUNCTION encrypt_pii IS 'Encrypts text using AES-256 with pgcrypto';
COMMENT ON FUNCTION decrypt_pii IS 'Decrypts text encrypted with encrypt_pii';
COMMENT ON FUNCTION mask_cnp IS 'Returns masked CNP showing only first digit and last 4';
COMMENT ON FUNCTION mask_ci_number IS 'Returns masked CI number showing only last 3 digits';
COMMENT ON FUNCTION migrate_pii_to_encrypted IS 'Migrates existing plaintext PII to encrypted columns';
COMMENT ON FUNCTION get_order_decrypted_pii IS 'Returns decrypted PII for authorized API access';

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

/*
SETUP:
1. Set encryption key in Supabase:
   - Go to Database Settings > Configuration > Session Variables
   - Add: app.pii_encryption_key = 'your-32-character-secret-key'

   OR set via SQL:
   ALTER DATABASE postgres SET "app.pii_encryption_key" = 'your-key-here';

2. Migrate existing data:
   SELECT * FROM migrate_pii_to_encrypted('your-encryption-key');

3. Verify:
   SELECT
     id,
     customer_data->'personal'->>'cnp_masked' as cnp_masked,
     encrypted_cnp IS NOT NULL as is_encrypted
   FROM orders;

API USAGE:
- To read decrypted PII in API routes:
  SELECT * FROM get_order_decrypted_pii('order-uuid', 'encryption-key');

- The encryption key should be stored in:
  - Supabase Vault (production)
  - Environment variable PII_ENCRYPTION_KEY

SECURITY:
- Never log decrypted PII
- Always use parameterized queries
- Encryption key must be at least 32 characters
- Rotate key annually (requires re-encryption)
*/
