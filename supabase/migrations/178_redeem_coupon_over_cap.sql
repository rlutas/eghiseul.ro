-- 178: redeem_coupon reports a use past max_uses (REV3-COUPON-001, 18.09.2026)
--
-- Eligibility is checked before payment without reserving a use, so two
-- checkouts can both be granted the last use of a coupon. The discount is
-- already taken by the time redeem_coupon runs (the customer has paid), so the
-- use is still counted — truthfully, times_used may exceed max_uses — but the
-- caller now learns it happened ('redeemed_over_cap') and logs it. A
-- reservation model (hold a use at checkout, release on abandon) is the real
-- fix and is deliberately deferred.

CREATE OR REPLACE FUNCTION public.redeem_coupon(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_coupon RECORD;
  v_over_cap BOOLEAN := FALSE;
BEGIN
  SELECT id, coupon_code, coupon_redeemed_at INTO v_order
  FROM orders WHERE id = p_order_id FOR UPDATE;
  IF v_order IS NULL THEN RETURN 'order_not_found'; END IF;
  IF v_order.coupon_code IS NULL THEN RETURN 'no_coupon'; END IF;
  IF v_order.coupon_redeemed_at IS NOT NULL THEN RETURN 'already_redeemed'; END IF;

  SELECT id, times_used, max_uses INTO v_coupon
  FROM coupons WHERE lower(code) = lower(v_order.coupon_code) FOR UPDATE;
  IF v_coupon IS NULL THEN RETURN 'coupon_not_found'; END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.times_used >= v_coupon.max_uses THEN
    v_over_cap := TRUE;
  END IF;

  -- Recorded even past the cap: the customer has paid, the discount was
  -- granted; what matters is that it counts exactly once and is visible.
  UPDATE coupons SET times_used = times_used + 1, updated_at = NOW() WHERE id = v_coupon.id;
  UPDATE orders SET coupon_redeemed_at = NOW() WHERE id = p_order_id;
  RETURN CASE WHEN v_over_cap THEN 'redeemed_over_cap' ELSE 'redeemed' END;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_coupon(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(UUID) TO service_role, postgres;

NOTIFY pgrst, 'reload schema';
