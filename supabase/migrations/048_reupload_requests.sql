-- 048_reupload_requests.sql
-- Secure, admin-generated links that let a customer re-upload a single KYC
-- photo (currently the selfie) AFTER placing the order. The team triggers a
-- request from the admin order page; the customer opens /reincarca-poza/<token>
-- and uploads a new photo, which replaces the document on the order and
-- re-flags it for manual review.
--
-- Token is an opaque random string (not a JWT) stored here so we get expiry,
-- single-use, and revocation for free. Accessed only via the service-role
-- client (admin endpoints + the public reupload API), so RLS is enabled with
-- no public policies — service role bypasses RLS, everyone else is denied.

CREATE TABLE IF NOT EXISTS reupload_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Which document the customer must re-upload. 'selfie' for now; kept generic
  -- so we can extend to ci_front / passport later without a schema change.
  document_type VARCHAR(50) NOT NULL DEFAULT 'selfie',

  -- Opaque access token (URL segment). Unique + indexed for O(1) lookup.
  token VARCHAR(255) NOT NULL UNIQUE,
  token_expires_at TIMESTAMPTZ NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),

  -- Optional note from the operator (e.g. "poza era neclară").
  reason TEXT,

  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Filled when the customer completes the upload.
  completed_at TIMESTAMPTZ,
  new_s3_key VARCHAR(512),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reupload_requests_token ON reupload_requests(token);
CREATE INDEX IF NOT EXISTS idx_reupload_requests_order ON reupload_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_reupload_requests_status ON reupload_requests(status);

-- Lock down to service role only (no public policies).
ALTER TABLE reupload_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE reupload_requests IS
  'Admin-generated single-use links for customers to re-upload a KYC photo (selfie) after ordering.';
