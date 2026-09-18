-- 176: three fixes from the Codex inspection + the owner's test (18.09.2026).
--
-- 1. „KYC verificat" = act de identitate + selfie. `profiles.kyc_verified` era
--    ridicat de orice act de identitate; wizardul sare pasul de acte pentru un
--    cont verificat → comanda E-260918-SJCQY (cazier) a ajuns la plată fără
--    niciun act și fără selfie. Funcția de migrare din comandă cere de acum și
--    selfie-ul, iar conturile marcate greșit sunt corectate.
-- 2. Un singur cupon de bun-venit per cont, garantat de un index unic parțial
--    (două încărcări simultane ale contului puteau crea două cupoane).
-- 3. Markerul de sincronizare comandă → cont se scrie prin `||` pe
--    `customer_data`, nu prin înlocuirea întregului JSON citit mai devreme
--    (care ștergea ce scriseseră alții între timp).

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

  -- Does this order carry a document that establishes WHO the person is?
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      COALESCE(v_personal->'uploadedDocuments', '[]'::JSONB)
    ) AS doc
    WHERE doc->>'type' IN (
      'ci_front', 'ci_nou_front', 'ci_nou_back', 'ci_vechi', 'ci_back',
      'act_identitate', 'act_identitate_back', 'passport', 'passport_opened'
    )
  ) INTO v_has_identity_doc;

  -- ...and the selfie that proves the document belongs to the person. Without
  -- it the account must not become „verified": the order wizard skips its
  -- identity step for a verified account (18.09.2026, E-260918-SJCQY).
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
    -- Only ever raised, never lowered: an account that already proved its
    -- identity does not lose it by ordering an extras CF.
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


-- 1b. Accounts marked verified without an active selfie lose the flag; the
-- order form asks for the documents again, which is the honest state.
UPDATE profiles p
SET kyc_verified = FALSE, updated_at = NOW()
WHERE p.kyc_verified = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM kyc_verifications k
    WHERE k.user_id = p.id AND k.is_active = TRUE
      AND k.document_type IN ('selfie', 'selfie_with_id')
  );

-- 2. One welcome coupon per account. Two concurrent loads of /account already
-- produced duplicates (the lookup-then-insert race): keep the oldest unused
-- one per owner, drop the rest, then forbid it for good.
DELETE FROM coupons c
USING coupons d
WHERE c.system_kind = 'welcome' AND d.system_kind = 'welcome'
  AND c.owner_user_id IS NOT NULL AND c.owner_user_id = d.owner_user_id
  AND c.times_used = 0
  AND (c.created_at > d.created_at OR (c.created_at = d.created_at AND c.id > d.id));

CREATE UNIQUE INDEX IF NOT EXISTS coupons_one_welcome_per_owner
  ON coupons (owner_user_id)
  WHERE system_kind = 'welcome' AND owner_user_id IS NOT NULL;

-- 3. Marker without clobbering `customer_data`.
CREATE OR REPLACE FUNCTION public.mark_account_sync(p_order_id UUID, p_payload JSONB)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE orders
  SET customer_data = COALESCE(customer_data, '{}'::jsonb) || jsonb_build_object('account_sync', p_payload),
      updated_at = NOW()
  WHERE id = p_order_id;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_account_sync(UUID, JSONB) FROM PUBLIC;
-- Default privileges on this database also grant anon/authenticated: name them.
REVOKE EXECUTE ON FUNCTION public.mark_account_sync(UUID, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_account_sync(UUID, JSONB) TO service_role, postgres;

COMMENT ON FUNCTION public.mark_account_sync(UUID, JSONB) IS
  'Scrie customer_data.account_sync fără să înlocuiască restul JSON-ului (sync-paid-order.ts).';

NOTIFY pgrst, 'reload schema';
