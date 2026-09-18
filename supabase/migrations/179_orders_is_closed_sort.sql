-- 179: orders.is_closed — closed orders sink below the live ones in admin (18.09.2026)
--
-- „Toate" in /admin/comenzi is read by recency; a finished / cancelled /
-- refunded order has nothing left to do and only pushes the live ones down.
-- PostgREST cannot ORDER BY an expression, so the flag is a stored generated
-- column the list route orders on first (false before true), then by
-- paid_at / created_at as before. Kept in sync by Postgres, never written.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_closed BOOLEAN
  GENERATED ALWAYS AS (status IN ('completed', 'cancelled', 'refunded')) STORED;

COMMENT ON COLUMN public.orders.is_closed IS
  'Generated: status ∈ (completed, cancelled, refunded). Admin list sorts open orders first.';

CREATE INDEX IF NOT EXISTS orders_admin_list_idx
  ON public.orders (is_closed, paid_at DESC NULLS FIRST, created_at DESC);

NOTIFY pgrst, 'reload schema';
