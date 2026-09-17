-- 163: Close the guest-draft RLS leak on public.orders
--
-- Problem (found 2026-09-17, live on production):
--   The SELECT and UPDATE policies introduced in 008_friendly_order_id.sql carried
--   an escape hatch for guest drafts:
--       (user_id IS NULL AND status = 'draft')
--   The policies are granted to role `public`, which includes `anon`, and `anon`
--   holds SELECT/UPDATE privileges on public.orders. The anon key ships in the
--   public JS bundle, so ANY visitor could list and modify every guest draft
--   through PostgREST without knowing a single UUID.
--   Exposure at the time of the fix: 771 guest drafts, 316 with personal data,
--   163 with a full 13-digit CNP, oldest 2026-07-07.
--
--   The original migration noted "will be validated in API", but PostgREST is
--   reachable directly and never runs our API code.
--
-- Why removing the branch is safe:
--   No browser code queries the orders table through supabase-js. Every draft
--   read/write goes through src/app/api/orders/draft/route.ts using
--   createAdminClient() (service role, bypasses RLS). The public guest status
--   lookup (src/app/api/orders/status/route.ts:52) also uses a service-role
--   client. POST /api/orders requires authentication and sets user_id.
--   Verified with: grep -rn "from('orders')" over src/components, src/providers,
--   src/hooks and the customer route group -> only
--   src/app/(customer)/account/page.tsx:45, a server component on the
--   authenticated branch.
--
-- The INSERT policy is intentionally left untouched: it is a WITH CHECK only,
-- exposes no data, and tightening it has a larger blast radius.

DROP POLICY IF EXISTS "Users can view own orders or their drafts" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own draft orders" ON orders;

CREATE POLICY "Users can update own draft orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

-- Defense in depth: anon must never reach this table directly. RLS already
-- blocks it after the policy change; revoking the grant removes the second
-- half of the bug, so a future permissive policy cannot reopen the hole.
REVOKE SELECT, UPDATE ON public.orders FROM anon;

COMMENT ON TABLE orders IS
  'Customer orders. RLS: authenticated users see only their own rows (user_id = auth.uid()). Guest drafts are NOT readable via PostgREST - they are served exclusively through API routes using the service-role client. See migration 163.';

NOTIFY pgrst, 'reload schema';
