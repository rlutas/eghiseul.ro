-- =============================================================================
-- 181 — orders.platform: which public brand took the order (2026-09-19)
-- =============================================================================
-- documentero.ro is served by the same deployment, DB and admin as
-- eghiseul.ro (host-based brand, src/lib/brand/). Everything that talks to
-- the customer about an order after the fact — confirmation email, Stripe
-- return URLs, resume/status links, invoice text — must use the brand the
-- order was placed on, never the host of whoever looks at it later. That
-- brand is stamped here once, at draft creation, from the request host.
--
-- Default 'eghiseul' so every existing row and every code path that does not
-- know about brands keeps behaving exactly as before.
-- =============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'eghiseul';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_platform_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_platform_check CHECK (platform IN ('eghiseul', 'documentero'));

-- Admin list filter chip + per-brand reporting.
CREATE INDEX IF NOT EXISTS idx_orders_platform ON public.orders (platform);

-- Real DDL so pgrst_ddl_watch fires even if the column pre-existed
-- (see .claude/rules/database.md, PostgREST schema cache).
COMMENT ON COLUMN public.orders.platform IS
  'Public brand the order was placed on: eghiseul | documentero. Stamped at draft creation from the request host (src/lib/brand/server.ts); read by brandForOrder().';
NOTIFY pgrst, 'reload schema';
