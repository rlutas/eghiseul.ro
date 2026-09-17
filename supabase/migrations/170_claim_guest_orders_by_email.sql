-- 170: Link orders placed without an account to the account created later.
--
-- `orders.user_id` was the only link between a customer and their orders, and
-- nothing ever set it outside the modal on the success page. Measured on
-- 2026-09-17 over 90 days: 439 paid orders, ZERO with a user_id, 398 distinct
-- paying customers and 3 accounts. So a customer who ordered as a guest and then
-- created an account with the same address saw an empty account, forever.
--
-- The claim runs on the (confirmed) email of the account. Supabase only fills
-- `email_confirmed_at` after the customer follows the link in their inbox, and
-- the caller checks it — so claiming proves control of the mailbox that placed
-- the order, which is the same proof the public order-status page already
-- accepts (`/comanda/status?order=…&email=…`).
--
-- Every order carries the address at `customer_data->'contact'->>'email'`;
-- checked on production, 448 of 448 non-draft orders, none in `billing` or
-- `personal` only. Drafts and abandoned orders are left alone: they are
-- half-finished and would only clutter the list.
--
-- SECURITY DEFINER because it writes rows the caller cannot see, and revoked
-- from PUBLIC so it is not reachable over PostgREST — see migration 167 for why
-- naming PUBLIC matters rather than naming anon.

CREATE OR REPLACE FUNCTION public.claim_guest_orders(p_user_id uuid, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_claimed integer;
BEGIN
  IF p_user_id IS NULL OR p_email IS NULL OR btrim(p_email) = '' THEN
    RETURN 0;
  END IF;

  UPDATE orders
     SET user_id = p_user_id
   WHERE user_id IS NULL
     AND status NOT IN ('draft', 'abandoned')
     AND lower(customer_data->'contact'->>'email') = lower(btrim(p_email));

  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) TO service_role, postgres;

-- Partial index: the lookup only ever asks about unclaimed orders.
CREATE INDEX IF NOT EXISTS idx_orders_guest_contact_email
  ON orders ((lower(customer_data->'contact'->>'email')))
  WHERE user_id IS NULL;

COMMENT ON FUNCTION public.claim_guest_orders IS
  'Links orders placed without an account to the account later created with the same (confirmed) email. Called server-side with the service-role client only; never exposed to anon/authenticated. See migration 170.';

NOTIFY pgrst, 'reload schema';
