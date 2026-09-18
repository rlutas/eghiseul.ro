-- 177: Codex inspection, round 2 (18.09.2026).
--
-- 1. „Act de identitate" pentru KYC = FAȚA actului (sau pagina de date a
--    pașaportului). Versoul CI-ului nou poartă doar adresa; cu lista veche,
--    „verso + selfie" trecea drept KYC complet.
-- 2. Cuponul se consumă o singură dată per comandă, atomic, pe ORICE cale de
--    plată (card, transfer bancar confirmat, marcare manuală, sync Stripe).
--    Până acum doar webhook-ul Stripe incrementa `times_used`, cu citire +
--    scriere separate.

CREATE OR REPLACE FUNCTION public.migrate_order_to_profile(
  p_order_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_personal JSONB;
  v_contact JSONB;
  v_address JSONB;
  v_has_identity_doc BOOLEAN;
  v_has_selfie BOOLEAN;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  v_personal := v_order.customer_data->'personal';
  v_contact := v_order.customer_data->'contact';
  v_address := COALESCE(v_personal->'address', v_order.customer_data->'personalKyc'->'address');

  -- The FRONT of an identity document (or a passport's data page): the side
  -- that carries the person. Back sides carry the address and prove nothing.
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      COALESCE(v_personal->'uploadedDocuments', '[]'::JSONB)
    ) AS doc
    WHERE doc->>'type' IN (
      'ci_front', 'ci_nou_front', 'ci_vechi', 'act_identitate',
      'passport', 'passport_opened'
    )
  ) INTO v_has_identity_doc;

  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      COALESCE(v_personal->'uploadedDocuments', '[]'::JSONB)
    ) AS doc
    WHERE doc->>'type' IN ('selfie', 'selfie_with_id')
  ) INTO v_has_selfie;

  UPDATE profiles SET
    cnp = COALESCE(
      v_personal->>'cnp',
      v_order.customer_data->'personalKyc'->>'cnp',
      cnp
    ),
    first_name = COALESCE(
      v_personal->>'firstName',
      v_personal->>'first_name',
      v_order.customer_data->'personalKyc'->>'firstName',
      first_name
    ),
    last_name = COALESCE(
      v_personal->>'lastName',
      v_personal->>'last_name',
      v_order.customer_data->'personalKyc'->>'lastName',
      last_name
    ),
    birth_date = CASE
      WHEN v_personal->>'birthDate' IS NOT NULL THEN (v_personal->>'birthDate')::DATE
      WHEN v_order.customer_data->'personalKyc'->>'birthDate' IS NOT NULL
        THEN (v_order.customer_data->'personalKyc'->>'birthDate')::DATE
      ELSE birth_date
    END,
    birth_place = COALESCE(
      v_personal->>'birthPlace',
      v_order.customer_data->'personalKyc'->>'birthPlace',
      birth_place
    ),
    phone = COALESCE(
      v_contact->>'phone',
      v_order.customer_data->'contact'->>'phone',
      phone
    ),
    kyc_verified = kyc_verified OR (v_has_identity_doc AND v_has_selfie),
    updated_at = NOW()
  WHERE id = p_user_id;

  IF v_address IS NOT NULL AND v_address != 'null'::JSONB AND v_address != '{}'::JSONB THEN
    INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
    VALUES (p_user_id, 'address', 'Adresa din comandă', v_address, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_contact IS NOT NULL AND v_contact != 'null'::JSONB THEN
    INSERT INTO user_saved_data (user_id, data_type, label, data, is_default)
    VALUES (p_user_id, 'contact', 'Contact principal', v_contact, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  UPDATE orders SET user_id = p_user_id WHERE id = p_order_id;
END;
$$;

-- Accounts verified on a back side + selfie only lose the flag.
UPDATE profiles p
SET kyc_verified = FALSE, updated_at = NOW()
WHERE p.kyc_verified = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM kyc_verifications k
    WHERE k.user_id = p.id AND k.is_active = TRUE
      AND k.document_type IN ('ci_front', 'ci_nou_front', 'ci_vechi', 'act_identitate', 'passport', 'passport_opened')
  );

-- 2. One redemption per order, atomic, whatever the payment path.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_redeemed_at TIMESTAMPTZ;
COMMENT ON COLUMN orders.coupon_redeemed_at IS
  'Când s-a consumat cuponul comenzii (redeem_coupon). O singură dată per comandă.';

CREATE OR REPLACE FUNCTION public.redeem_coupon(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_coupon RECORD;
BEGIN
  SELECT id, coupon_code, coupon_redeemed_at INTO v_order
  FROM orders WHERE id = p_order_id FOR UPDATE;
  IF v_order IS NULL THEN RETURN 'order_not_found'; END IF;
  IF v_order.coupon_code IS NULL THEN RETURN 'no_coupon'; END IF;
  IF v_order.coupon_redeemed_at IS NOT NULL THEN RETURN 'already_redeemed'; END IF;

  SELECT id, times_used, max_uses INTO v_coupon
  FROM coupons WHERE lower(code) = lower(v_order.coupon_code) FOR UPDATE;
  IF v_coupon IS NULL THEN RETURN 'coupon_not_found'; END IF;

  -- Recorded even when the cap is already reached: the customer has paid,
  -- the discount was granted; what matters is that it counts exactly once.
  UPDATE coupons SET times_used = times_used + 1, updated_at = NOW() WHERE id = v_coupon.id;
  UPDATE orders SET coupon_redeemed_at = NOW() WHERE id = p_order_id;
  RETURN 'redeemed';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_coupon(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(UUID) TO service_role, postgres;
COMMENT ON FUNCTION public.redeem_coupon(UUID) IS
  'Consumă cuponul unei comenzi o singură dată (times_used + 1, coupon_redeemed_at). Apelat din toate căile de plată.';

NOTIFY pgrst, 'reload schema';
