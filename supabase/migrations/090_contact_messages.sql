-- 090_contact_messages.sql
-- Stores messages submitted through the public /contact form.
-- Insert happens server-side via the service-role admin client (see
-- src/app/api/contact/route.ts), so no public INSERT policy is needed.
-- Only admins read these rows in the panel.

CREATE TABLE IF NOT EXISTS contact_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  order_number text,
  subject      text NOT NULL DEFAULT 'intrebare',
  message      text NOT NULL,
  status       text NOT NULL DEFAULT 'new',   -- new | read | replied | spam
  ip           text,
  user_agent   text,
  handled_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  handled_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status     ON contact_messages (status);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Admins/employees can read + update (triage). No public policy → anon/auth
-- clients cannot select. Inserts use the service-role key which bypasses RLS.
DROP POLICY IF EXISTS "admins read contact messages" ON contact_messages;
CREATE POLICY "admins read contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin', 'employee', 'manager', 'operator')
    )
  );

DROP POLICY IF EXISTS "admins update contact messages" ON contact_messages;
CREATE POLICY "admins update contact messages" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin', 'employee', 'manager', 'operator')
    )
  );

NOTIFY pgrst, 'reload schema';
