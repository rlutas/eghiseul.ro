-- 171: Faza 0 — two reasons the account could never be filled in.
--
-- 1. THE PHONE WE ASK FOR AT REGISTRATION WAS THROWN AWAY.
--    `/auth/register` makes the phone a required field and passes it in
--    `options.data`, so it lands in `auth.users.raw_user_meta_data`. But
--    handle_new_user() copied only id, email, first_name and last_name, and
--    nothing else ever reads it back. Result on production before this
--    migration: 5 of 71 customer profiles had a phone, and those five got it
--    from an order or from OCR, never from the registration form.
--
-- 2. THE ACCOUNT COULD NOT STORE MOST OF THE DOCUMENTS THE ORDER ASKS FOR.
--    The CHECK accepted 9 document types. The wizard produces, among others,
--    `act_identitate`, `act_identitate_back`, `passport_opened`,
--    `ro_cei_reader_pdf`, `certificat_domiciliu`, `residence_permit` and
--    `permis_fata` — none of which were allowed. So a customer with a new
--    electronic CI or a passport could not prepare their account at all, and
--    `register-from-order` silently dropped those rows (its insert error is
--    never read).
--
--    The list is now a superset of what KYCDocumentsStep and PersonalDataStep
--    can produce. `ci_back` and `address_certificate` are kept for the rows that
--    already exist under those names.
--
-- Backfill is deliberately NOT done here: `raw_user_meta_data->>'phone'` for the
-- existing 66 profiles without one is from a registration that may predate the
-- current form, and overwriting a profile from stale metadata is worse than an
-- empty field. New registrations are correct from now on.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$function$;

ALTER TABLE kyc_verifications DROP CONSTRAINT IF EXISTS kyc_verifications_document_type_check;

ALTER TABLE kyc_verifications ADD CONSTRAINT kyc_verifications_document_type_check
  CHECK (document_type IN (
    'ci_front', 'ci_back', 'ci_nou_front', 'ci_nou_back', 'ci_vechi',
    'act_identitate', 'act_identitate_back',
    'passport', 'passport_opened',
    'ro_cei_reader_pdf',
    'selfie',
    'address_certificate', 'certificat_domiciliu',
    'residence_permit',
    'permis_fata', 'permis_verso',
    'company_registration_cert', 'company_statement_cert'
  ));

COMMENT ON CONSTRAINT kyc_verifications_document_type_check ON kyc_verifications IS
  'Must stay a superset of every document type the order wizard can produce (KYCDocumentsStep + PersonalDataStep). See migration 171.';

NOTIFY pgrst, 'reload schema';
