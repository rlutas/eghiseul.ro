-- =============================================
-- Migration: 025_admin_workflow
-- Description: Admin workflow system - new statuses, roles, tables for
--              order processing, document generation, and notifications
-- Date: 2026-02-16
-- =============================================

-- =============================================
-- 1. UPDATE ORDER STATUS CONSTRAINT
-- Add new granular processing statuses
-- =============================================
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'draft',
    'pending',
    'paid',                      -- Payment confirmed, contracts auto-generated
    'processing',                -- Employee begins work
    'documents_generated',       -- Cerere eliberare generated
    'submitted_to_institution',  -- Application submitted to IPJ/ANAF/etc.
    'document_received',         -- Document received from institution
    'extras_in_progress',        -- Translation/apostille in progress
    'kyc_pending',
    'kyc_approved',
    'kyc_rejected',
    'in_progress',
    'document_ready',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    'refunded'
  ));

-- =============================================
-- 2. UPDATE PROFILES ROLE CONSTRAINT
-- Add new admin roles: manager, operator, contabil, avocat
-- =============================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'customer',
    'super_admin',
    'manager',
    'operator',
    'contabil',
    'avocat',
    'employee',    -- Keep for backwards compatibility
    'partner'
  ));

-- =============================================
-- 3. ADD processing_config TO SERVICES TABLE
-- Configures per-service workflow behavior
-- =============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS processing_config JSONB DEFAULT '{}';

COMMENT ON COLUMN services.processing_config IS 'Service workflow config: requires_lawyer, document_templates, auto_generate_at_payment, manual_generate, numbering, institution, default_motiv';

-- =============================================
-- 4. CREATE order_documents TABLE
-- Tracks all documents associated with an order
-- =============================================
CREATE TABLE IF NOT EXISTS order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
    -- Types: 'contract_prestari', 'contract_asistenta', 'imputernicire',
    --        'cerere_eliberare', 'document_received', 'document_final', 'invoice'
  s3_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'application/pdf',
  document_number TEXT,
  visible_to_client BOOLEAN DEFAULT FALSE,
  generated_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_documents_order_id ON order_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_order_documents_type ON order_documents(type);
CREATE INDEX IF NOT EXISTS idx_order_documents_visible
  ON order_documents(order_id, visible_to_client)
  WHERE visible_to_client = TRUE;

ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;

-- Admins (super_admin, manager, operator, avocat) can manage documents
CREATE POLICY "Admin roles can manage order documents"
  ON order_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'manager', 'operator', 'avocat', 'employee')
    )
  );

-- Customers can view their own visible documents
CREATE POLICY "Customers can view own visible documents"
  ON order_documents FOR SELECT
  TO authenticated
  USING (
    visible_to_client = TRUE
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_documents.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- =============================================
-- 5. CREATE order_option_status TABLE
-- Tracks completion of extra options (traducere, apostila, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS order_option_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  option_code TEXT NOT NULL,
  option_name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(order_id, option_code)
);

CREATE INDEX IF NOT EXISTS idx_order_option_status_order
  ON order_option_status(order_id);

ALTER TABLE order_option_status ENABLE ROW LEVEL SECURITY;

-- Admin roles can manage option status
CREATE POLICY "Admin roles can manage option status"
  ON order_option_status FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'manager', 'operator', 'employee')
    )
  );

-- Customers can view own order option status
CREATE POLICY "Customers can view own option status"
  ON order_option_status FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_option_status.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- =============================================
-- 6. CREATE notifications TABLE
-- In-app notifications for admin employees
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read)
  WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin roles can insert notifications for any user
CREATE POLICY "Admin roles can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'manager', 'operator', 'employee')
    )
  );

-- Service role can insert (for automated notifications)
-- Note: service_role bypasses RLS anyway, but explicit for clarity

-- =============================================
-- 7. UPDATE order_history EVENT TYPES
-- Add new event types for workflow
-- =============================================
ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;

ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN (
    -- Existing
    'created', 'status_changed', 'status_change',
    'payment_received', 'payment_confirmed', 'payment_created',
    'kyc_submitted', 'kyc_approved', 'kyc_rejected',
    'document_uploaded', 'shipped', 'delivered',
    'cancelled', 'refunded', 'note_added', 'assigned',
    -- Added in migration 022
    'awb_created', 'awb_cancelled',
    'draft_created', 'order_created', 'order_completed',
    'bank_transfer_submitted',
    -- NEW for workflow
    'document_generated',         -- Auto/manual document generation
    'option_completed',           -- Extra option marked complete
    'submitted_to_institution',   -- Cerere submitted to IPJ/ANAF
    'document_received_from_institution', -- Document received
    'extras_started',             -- Extras processing started
    'notification_sent'           -- Notification dispatched
  ));

-- =============================================
-- 8. CREATE increment_document_counter RPC
-- Atomic counter increment for contract/imputernicire numbers
-- =============================================
CREATE OR REPLACE FUNCTION increment_document_counter(counter_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
BEGIN
  -- Lock the row to prevent concurrent increments
  SELECT (value->>counter_key)::INTEGER INTO current_val
  FROM admin_settings
  WHERE key = 'document_counters'
  FOR UPDATE;

  new_val := COALESCE(current_val, 0) + 1;

  UPDATE admin_settings
  SET value = jsonb_set(value, ARRAY[counter_key], to_jsonb(new_val)),
      updated_at = NOW()
  WHERE key = 'document_counters';

  RETURN new_val;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. SEED INITIAL ADMIN SETTINGS
-- Company data, lawyer data, document counters
-- =============================================

-- Company data (EDIGITALIZARE SRL)
INSERT INTO admin_settings (key, value) VALUES (
  'company_data',
  '{
    "name": "EDIGITALIZARE SRL",
    "cui": "RO49278701",
    "registration_number": "J30/1097/2023",
    "address": "Jud. Satu Mare, com. Odoreu, str. Salcamilor, Nr. 2",
    "iban": "RO82BTRLRONCRT0CP9350501",
    "bank": "Banca Transilvania",
    "email": "contact@eghiseul.ro",
    "phone": ""
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Lawyer data (Cabinet de Avocat Tarta Ana-Gabriela)
INSERT INTO admin_settings (key, value) VALUES (
  'lawyer_data',
  '{
    "cabinet_name": "Cabinet de avocat Tarța Ana-Gabriela",
    "lawyer_name": "Tarța Ana-Gabriela",
    "professional_address": "Satu Mare, str. Aurel Popp, nr. 2",
    "cif": "40198820",
    "imputernicire_series": "SM",
    "fee": 15.00
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Document counters (starting values based on existing documents)
INSERT INTO admin_settings (key, value) VALUES (
  'document_counters',
  '{
    "contract_number": 4256,
    "imputernicire_number": 5738
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 10. UPDATE EXISTING SERVICES with processing_config
-- Set Cazier Judiciar services to require lawyer
-- =============================================
UPDATE services
SET processing_config = '{
  "requires_lawyer": true,
  "document_templates": ["contract-prestari", "contract-asistenta", "imputernicire"],
  "auto_generate_at_payment": ["contract-prestari", "contract-asistenta", "imputernicire"],
  "manual_generate": ["cerere-eliberare"],
  "numbering": {"contract": true, "imputernicire": true},
  "institution": "IPJ",
  "default_motiv": ""
}'::jsonb
WHERE slug LIKE 'cazier-judiciar%';

-- Update Cazier Fiscal (also requires lawyer for representation)
UPDATE services
SET processing_config = '{
  "requires_lawyer": true,
  "document_templates": ["contract-prestari", "contract-asistenta", "imputernicire"],
  "auto_generate_at_payment": ["contract-prestari", "contract-asistenta", "imputernicire"],
  "manual_generate": ["cerere-eliberare"],
  "numbering": {"contract": true, "imputernicire": true},
  "institution": "ANAF",
  "default_motiv": ""
}'::jsonb
WHERE slug = 'cazier-fiscal';

-- =============================================
-- 11. UPDATE RLS POLICIES for employee_invitations
-- Support new roles in existing policies
-- =============================================
DROP POLICY IF EXISTS "Employees with users.manage can view invitations" ON employee_invitations;

CREATE POLICY "Staff with users.manage can view invitations"
  ON employee_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('employee', 'manager', 'operator', 'contabil', 'avocat')
      AND (permissions->>'users.manage')::boolean = true
    )
  );

-- Update admin_settings policy for new roles
DROP POLICY IF EXISTS "Employees with settings.manage can manage settings" ON admin_settings;

CREATE POLICY "Staff with settings.manage can manage settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('employee', 'manager', 'operator', 'contabil', 'avocat')
      AND (permissions->>'settings.manage')::boolean = true
    )
  );

-- =============================================
-- Verification queries:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'orders'::regclass AND conname = 'orders_status_check';
-- SELECT conname FROM pg_constraint WHERE conrelid = 'profiles'::regclass AND conname = 'profiles_role_check';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'processing_config';
-- SELECT tablename FROM pg_tables WHERE tablename IN ('order_documents', 'order_option_status', 'notifications');
-- SELECT * FROM admin_settings WHERE key IN ('company_data', 'lawyer_data', 'document_counters');
-- SELECT proname FROM pg_proc WHERE proname = 'increment_document_counter';
-- =============================================
