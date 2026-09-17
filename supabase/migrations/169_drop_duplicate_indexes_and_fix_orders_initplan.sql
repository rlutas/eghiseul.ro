-- 169: Two cheap wins from the Supabase performance advisor (2026-09-17).
--
-- 1. duplicate_index (WARN x2) — two pairs of byte-identical indexes, each pair
--    created twice by two different migrations. Every INSERT/UPDATE maintained
--    both. Verified with pg_get_indexdef that the definitions match exactly and
--    that neither index backs a constraint, and grepped src/ for the names in
--    case an ON CONFLICT referenced one — they appear only in the migrations
--    that created them. The original of each pair is kept:
--      newsletter_subscribers_email_uniq  (074) kept, idx_newsletter_email_unique (095) dropped
--      idx_orders_awaiting_verification   (016) kept, idx_orders_payment_status_awaiting (161) dropped
--
-- 2. auth_rls_initplan on the two `orders` policies written earlier today in
--    migration 163. A bare `auth.uid()` in USING is re-evaluated for every row
--    scanned; wrapping it in a scalar subquery makes Postgres compute it once
--    per statement (InitPlan). Same semantics, one call instead of N.
--    The other 47 findings of this kind are pre-existing policies, left alone.

DROP INDEX IF EXISTS public.idx_newsletter_email_unique;
DROP INDEX IF EXISTS public.idx_orders_payment_status_awaiting;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own draft orders" ON orders;
CREATE POLICY "Users can update own draft orders"
  ON orders FOR UPDATE
  USING ((select auth.uid()) = user_id AND status = 'draft');

NOTIFY pgrst, 'reload schema';
