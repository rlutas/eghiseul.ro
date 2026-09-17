-- 164: Leftover from the same finding as migration 163.
--
-- After 163 removed anon's SELECT and UPDATE on public.orders, a grant audit
-- showed `anon` still held DELETE:
--
--   select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema='public' and table_name='orders';
--   -> anon: DELETE, INSERT, REFERENCES, TRIGGER, TRUNCATE
--
-- RLS already denied it (public.orders has zero DELETE/ALL policies, and no
-- policy means deny), so nothing in the app can be relying on it. Removing the
-- grant closes the second half of the hole for DELETE the same way 163 did for
-- SELECT and UPDATE: a permissive DELETE policy added later cannot reopen it.
--
-- INSERT is intentionally left in place - the guest-draft INSERT policy from
-- 008_friendly_order_id.sql is WITH CHECK only and exposes no data.

REVOKE DELETE ON public.orders FROM anon;
