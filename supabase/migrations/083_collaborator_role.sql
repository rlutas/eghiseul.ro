-- 083_collaborator_role.sql
-- Introduce a scoped "collaborator" role (e.g. Mircea, the authorized topograph).
-- A collaborator logs in to a dedicated /colaborator portal and can see ONLY the
-- orders that belong to the services explicitly assigned to them, view the
-- customer/property data needed to do the work, upload the resulting (scanned)
-- PDF, and mark the order ready (which auto-delivers it to the customer).
--
-- Scoping is by service_id (each order has exactly one). We mirror the existing
-- is_partner()/is_admin() SECURITY DEFINER pattern for RLS.

-- 1. Allow the new role on profiles (recreate the full check including it).
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'customer', 'super_admin', 'manager', 'operator', 'contabil',
    'avocat', 'employee', 'partner', 'collaborator'
  ));

-- 2. is_collaborator() helper (mirrors is_partner()).
CREATE OR REPLACE FUNCTION public.is_collaborator()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'collaborator'
  );
END;
$function$;

-- 3. Which services each collaborator is allowed to handle.
CREATE TABLE IF NOT EXISTS collaborator_service_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  can_upload_pdf BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (collaborator_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_csa_collaborator ON collaborator_service_assignments(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_csa_service ON collaborator_service_assignments(service_id);

ALTER TABLE collaborator_service_assignments ENABLE ROW LEVEL SECURITY;

-- Collaborators can read their own assignments.
DROP POLICY IF EXISTS "Collaborators read own assignments" ON collaborator_service_assignments;
CREATE POLICY "Collaborators read own assignments"
  ON collaborator_service_assignments FOR SELECT
  USING (collaborator_id = auth.uid());

-- Admins manage all assignments.
DROP POLICY IF EXISTS "Admins manage assignments" ON collaborator_service_assignments;
CREATE POLICY "Admins manage assignments"
  ON collaborator_service_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager')
    )
  );

-- 4. Collaborators can SELECT orders for their assigned services.
--    (Writes happen server-side via the service-role client with explicit scope checks.)
DROP POLICY IF EXISTS "Collaborators view assigned-service orders" ON orders;
CREATE POLICY "Collaborators view assigned-service orders"
  ON orders FOR SELECT
  USING (
    is_collaborator()
    AND EXISTS (
      SELECT 1 FROM collaborator_service_assignments csa
      WHERE csa.collaborator_id = auth.uid()
      AND csa.service_id = orders.service_id
    )
  );

-- 5. Collaborators can SELECT documents of orders for their assigned services.
DROP POLICY IF EXISTS "Collaborators view assigned-service documents" ON order_documents;
CREATE POLICY "Collaborators view assigned-service documents"
  ON order_documents FOR SELECT
  USING (
    is_collaborator()
    AND EXISTS (
      SELECT 1
      FROM orders o
      JOIN collaborator_service_assignments csa
        ON csa.service_id = o.service_id
      WHERE o.id = order_documents.order_id
      AND csa.collaborator_id = auth.uid()
    )
  );

-- 6. Reload PostgREST schema cache (real DDL above already fires the trigger).
COMMENT ON TABLE collaborator_service_assignments IS 'Maps a collaborator (topograph) to the services whose orders they may handle.';
NOTIFY pgrst, 'reload schema';
