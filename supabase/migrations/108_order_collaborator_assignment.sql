-- 108: Per-ORDER collaborator assignment.
--
-- The identificare-imobil services are fulfilled by the internal team by
-- default; only when they can't solve one, an admin sends THAT order to the
-- topograph. Service-level assignments (083) can't express this — they expose
-- ALL orders of a service. New column: orders.assigned_collaborator_id.
-- A collaborator sees an order when its service is assigned to them (083) OR
-- the order itself is (this migration).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS assigned_collaborator_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_assigned_collaborator
  ON orders (assigned_collaborator_id)
  WHERE assigned_collaborator_id IS NOT NULL;

-- Extend the RLS SELECT policies from 083 with the per-order path.
DROP POLICY IF EXISTS "Collaborators view assigned-service orders" ON orders;
CREATE POLICY "Collaborators view assigned-service orders"
  ON orders FOR SELECT
  USING (
    is_collaborator()
    AND (
      orders.assigned_collaborator_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM collaborator_service_assignments csa
        WHERE csa.collaborator_id = auth.uid()
        AND csa.service_id = orders.service_id
      )
    )
  );

DROP POLICY IF EXISTS "Collaborators view assigned-service documents" ON order_documents;
CREATE POLICY "Collaborators view assigned-service documents"
  ON order_documents FOR SELECT
  USING (
    is_collaborator()
    AND EXISTS (
      SELECT 1
      FROM orders o
      LEFT JOIN collaborator_service_assignments csa
        ON csa.service_id = o.service_id AND csa.collaborator_id = auth.uid()
      WHERE o.id = order_documents.order_id
      AND (o.assigned_collaborator_id = auth.uid() OR csa.collaborator_id IS NOT NULL)
    )
  );

COMMENT ON COLUMN orders.assigned_collaborator_id IS
  'Per-order collaborator (topograph) assignment, set from admin. Complements service-level collaborator_service_assignments: the collaborator sees the order if EITHER matches.';

NOTIFY pgrst, 'reload schema';
