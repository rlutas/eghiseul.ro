-- Migration: 009_draft_auto_cleanup.sql
-- Description: Auto-cleanup of expired draft orders (GDPR compliance)
-- Date: 2025-12-18
--
-- Purpose:
-- - Anonymize draft orders older than 7 days
-- - Remove PII (personal identifiable information) from expired drafts
-- - Keep order metadata for analytics (without personal data)
-- - Support manual cleanup via function call

-- Add column to track when order was anonymized
ALTER TABLE orders ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- Add column to track original status before anonymization
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_status VARCHAR(50);

-- Create function to anonymize a single order
CREATE OR REPLACE FUNCTION anonymize_order(order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  order_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO order_status
  FROM orders
  WHERE id = order_id;

  -- Only anonymize draft orders
  IF order_status NOT IN ('draft', 'expired') THEN
    RETURN FALSE;
  END IF;

  -- Anonymize the order
  UPDATE orders
  SET
    customer_data = jsonb_build_object(
      'anonymized', true,
      'anonymized_reason', 'draft_expired_7_days',
      'original_email_domain', COALESCE(
        substring((customer_data->'contact'->>'email') from '@(.+)$'),
        'unknown'
      )
    ),
    kyc_documents = '{}'::jsonb,
    delivery_address = NULL,
    signature = NULL,
    original_status = status,
    status = 'expired_anonymized',
    anonymized_at = NOW(),
    updated_at = NOW()
  WHERE id = order_id
    AND status IN ('draft', 'expired');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to anonymize all expired drafts (older than 7 days)
CREATE OR REPLACE FUNCTION anonymize_expired_drafts()
RETURNS TABLE(anonymized_count INT, order_ids UUID[]) AS $$
DECLARE
  affected_ids UUID[];
  count_affected INT;
BEGIN
  -- Find all draft orders older than 7 days
  WITH expired_drafts AS (
    SELECT id
    FROM orders
    WHERE status = 'draft'
      AND created_at < NOW() - INTERVAL '7 days'
      AND anonymized_at IS NULL
  ),
  anonymized AS (
    UPDATE orders o
    SET
      customer_data = jsonb_build_object(
        'anonymized', true,
        'anonymized_reason', 'draft_expired_7_days',
        'anonymized_at', NOW(),
        'original_email_domain', COALESCE(
          substring((o.customer_data->'contact'->>'email') from '@(.+)$'),
          'unknown'
        ),
        'original_county', o.customer_data->'personal'->'address'->>'county'
      ),
      kyc_documents = '{}'::jsonb,
      delivery_address = NULL,
      signature = NULL,
      original_status = o.status,
      status = 'expired_anonymized',
      anonymized_at = NOW(),
      updated_at = NOW()
    FROM expired_drafts ed
    WHERE o.id = ed.id
    RETURNING o.id
  )
  SELECT array_agg(id), count(*)::int
  INTO affected_ids, count_affected
  FROM anonymized;

  RETURN QUERY SELECT COALESCE(count_affected, 0), COALESCE(affected_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for efficient expired draft queries
CREATE INDEX IF NOT EXISTS idx_orders_draft_expired
ON orders (created_at)
WHERE status = 'draft' AND anonymized_at IS NULL;

-- Create index for anonymized orders
CREATE INDEX IF NOT EXISTS idx_orders_anonymized
ON orders (anonymized_at)
WHERE anonymized_at IS NOT NULL;

-- Grant execute permissions to authenticated users (for admin use)
GRANT EXECUTE ON FUNCTION anonymize_expired_drafts() TO authenticated;
GRANT EXECUTE ON FUNCTION anonymize_order(UUID) TO authenticated;

-- Add comment to document the cleanup policy
COMMENT ON FUNCTION anonymize_expired_drafts() IS
'Anonymizes all draft orders older than 7 days for GDPR compliance.
Removes PII but keeps order metadata for analytics.
Should be run daily via cron job or scheduled task.';

COMMENT ON FUNCTION anonymize_order(UUID) IS
'Anonymizes a single draft order. Used for manual cleanup or user-requested deletion.';

-- Log the migration
DO $$
BEGIN
  INSERT INTO audit_logs (action, status, ip_address, resource_type, metadata)
  VALUES (
    'migration_applied',
    'success',
    'system',
    'database',
    jsonb_build_object(
      'migration', '009_draft_auto_cleanup',
      'description', 'Auto-cleanup of expired draft orders for GDPR compliance',
      'retention_days', 7
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- audit_logs table might not exist yet, ignore error
  NULL;
END $$;
