-- =============================================
-- Migration: 024_profiles_blocked_at
-- Description: Add blocked_at column to profiles for customer blocking
-- Date: 2026-02-16
-- =============================================

-- Add blocked_at column (NULL = not blocked, timestamp = when blocked)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;

-- Index for filtering blocked customers
CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON profiles(blocked_at) WHERE blocked_at IS NOT NULL;
