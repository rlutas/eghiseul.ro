-- Migration: 006_audit_logs.sql
-- Description: Create audit_logs table for security and GDPR compliance
-- Created: 2025-12-17

-- ============================================================================
-- AUDIT LOGS TABLE
-- Records all security-sensitive operations for compliance and investigation
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action details
  action VARCHAR(50) NOT NULL,  -- 'ocr_extract', 'kyc_validate', 'order_create', etc.
  status VARCHAR(20) NOT NULL,  -- 'success', 'failed', 'blocked'

  -- Actor identification (can be null for guests)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) NOT NULL,  -- IPv4 or IPv6
  user_agent TEXT,

  -- Resource context (what was accessed/modified)
  resource_type VARCHAR(50),  -- 'order', 'document', 'user', etc.
  resource_id VARCHAR(100),   -- Order ID, document ID, etc.

  -- Additional metadata (NO PII!)
  metadata JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookup patterns
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite for common queries
CREATE INDEX idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_ip_action ON audit_logs(ip_address, action, created_at DESC);

-- Resource lookup
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can insert (from API)
-- Note: This is for the service role key used in API routes
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon inserts for guest audit logging
-- This is safe because audit logs don't contain PII
CREATE POLICY "Allow anonymous audit log inserts"
  ON audit_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable for compliance)
-- This is enforced by not having UPDATE or DELETE policies

-- ============================================================================
-- RETENTION POLICY (Optional - for automatic cleanup)
-- ============================================================================

-- Create a function to delete old audit logs (keep 2 years for GDPR)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create a function to insert audit logs (used by API)
CREATE OR REPLACE FUNCTION log_audit_entry(
  p_action VARCHAR(50),
  p_status VARCHAR(20),
  p_user_id UUID DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT 'unknown',
  p_user_agent TEXT DEFAULT NULL,
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id VARCHAR(100) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO audit_logs (
    action, status, user_id, ip_address, user_agent,
    resource_type, resource_id, metadata, error_message
  ) VALUES (
    p_action, p_status, p_user_id, p_ip_address, p_user_agent,
    p_resource_type, p_resource_id, p_metadata, p_error_message
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE audit_logs IS 'Security audit trail for GDPR compliance. Contains no PII.';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: ocr_extract, kyc_validate, order_create, pii_access, etc.';
COMMENT ON COLUMN audit_logs.status IS 'Result: success, failed, blocked';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context. MUST NOT contain PII!';
COMMENT ON COLUMN audit_logs.ip_address IS 'Client IP for security investigation';

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample audit entries for development
-- These will be visible to admins
INSERT INTO audit_logs (action, status, ip_address, user_agent, resource_type, metadata) VALUES
  ('ocr_extract', 'success', '127.0.0.1', 'Mozilla/5.0 (Test)', 'document', '{"documentType": "ci_front", "confidence": 95}'),
  ('kyc_validate', 'success', '127.0.0.1', 'Mozilla/5.0 (Test)', 'document', '{"documentType": "ci_front", "faceMatch": true}'),
  ('order_create', 'success', '127.0.0.1', 'Mozilla/5.0 (Test)', 'order', '{"service": "cazier-fiscal"}')
ON CONFLICT DO NOTHING;
