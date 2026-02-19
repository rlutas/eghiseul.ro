-- =============================================
-- Migration: 023_rbac_permissions
-- Description: RBAC foundation - update roles, add permissions,
--              create employee_invitations and admin_settings tables
-- Date: 2026-02-16
-- =============================================

-- 1. Drop old role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Migrate existing admin users to super_admin (BEFORE adding new constraint)
UPDATE profiles SET role = 'super_admin' WHERE role = 'admin';

-- 3. Add new role constraint with updated roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'super_admin', 'employee', 'partner'));

-- 4. Add permissions JSONB column for granular permissions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- 4. Ensure role index exists (for faster role-based queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Employee invitations table
CREATE TABLE IF NOT EXISTS employee_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  permissions JSONB NOT NULL DEFAULT '{}',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employee_invitations ENABLE ROW LEVEL SECURITY;

-- Super admins can fully manage invitations
CREATE POLICY "Super admins can manage invitations"
  ON employee_invitations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Employees with users.manage permission can view invitations
CREATE POLICY "Employees with users.manage can view invitations"
  ON employee_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'employee'
      AND (permissions->>'users.manage')::boolean = true
    )
  );

-- 6. Admin settings table for configurable platform settings
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all settings
CREATE POLICY "Super admins can manage settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Employees with settings.manage permission can manage settings
CREATE POLICY "Employees with settings.manage can manage settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'employee'
      AND (permissions->>'settings.manage')::boolean = true
    )
  );

-- =============================================
-- Verification queries (run after migration):
-- SELECT conname FROM pg_constraint WHERE conrelid = 'profiles'::regclass AND conname = 'profiles_role_check';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'permissions';
-- SELECT id, email, role FROM profiles WHERE role = 'super_admin';
-- SELECT tablename FROM pg_tables WHERE tablename IN ('employee_invitations', 'admin_settings');
-- =============================================
