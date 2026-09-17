-- Faza 1: the account created from a paid order.
--
-- `migrate_order_to_profile()` set `kyc_verified = TRUE` for every order that
-- created an account, whatever the order contained. That flag is not cosmetic:
-- `POST /api/orders/[id]/submit` honours it as a server-side bypass of the
-- identity step, and the wizard reads it through `/api/user/prefill-data` to
-- skip the whole KYC step. So an account created from a certificat constatator
-- or an extras CF — services that never ask for an identity document, exactly
-- as ONRC itself does not — could order a cazier judiciar with no document on
-- file at all.
--
-- Same class of hole as the one closed in `has_valid_kyc` (see
-- `tests/unit/lib/kyc/has-valid-kyc.test.ts`), through the other door.
--
-- The flag is now set only when the order actually carries an identity
-- document. The list below mirrors `isIdentityDocumentType()` in
-- `src/lib/kyc/identity-documents.ts`: NOT the selfie (a face with no document
-- behind it identifies nobody), NOT a driving licence, a residence permit or an
-- address certificate (they prove something else).
--
-- 2 of the 6 profiles flagged in production have no identity document behind
-- the flag. They are corrected below.

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
    kyc_verified = kyc_verified OR v_has_identity_doc,
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

-- The function is called only from the server (service role). Postgres grants
-- EXECUTE to PUBLIC by default, and a REVOKE naming `anon, authenticated`
-- changes nothing while PUBLIC still holds it — see migration 167.
REVOKE EXECUTE ON FUNCTION public.migrate_order_to_profile(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.migrate_order_to_profile(UUID, UUID) TO service_role;

-- Correct the profiles the old function flagged without an identity document
-- behind the flag.
UPDATE profiles p
SET kyc_verified = FALSE, updated_at = NOW()
WHERE p.kyc_verified
  AND NOT EXISTS (
    SELECT 1 FROM kyc_verifications k
    WHERE k.user_id = p.id
      AND k.is_active
      AND k.document_type IN (
        'ci_front', 'ci_nou_front', 'ci_nou_back', 'ci_vechi', 'ci_back',
        'act_identitate', 'act_identitate_back', 'passport', 'passport_opened'
      )
  );
