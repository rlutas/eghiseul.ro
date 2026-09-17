-- 165: Close the RPC surface the Supabase security advisor flagged (2026-09-17).
--
-- Every SECURITY DEFINER function in `public` is reachable through PostgREST at
-- /rest/v1/rpc/<name> by whoever holds the anon key — which ships in the public
-- JS bundle. SECURITY DEFINER means the body runs as the owner, so RLS does not
-- protect anything these functions touch.
--
-- The dangerous ones, and what an anonymous caller could do before this:
--   anonymize_order(uuid)        wipe the PII of ANY order, by uuid
--   anonymize_expired_drafts()   mass-anonymise drafts on demand
--   cleanup_old_audit_logs()     destroy the audit trail
--   migrate_order_to_profile()   attach ANY order to ANY user id, which then
--                                makes it readable from that user's /account
--   migrate_pii_to_encrypted()   mass re-encrypt PII with a caller-supplied key
--   log_audit_entry(...)         forge audit entries
--   encrypt_pii / decrypt_pii    encryption oracle
--   get_order_decrypted_pii()    decrypt order PII (needs the key, but there is
--                                no reason for it to be callable from the web)
--   check_kyc_expiry(...)        read another user's KYC state
--
-- None of them is called from the browser. Verified callers:
--   migrate_order_to_profile  -> api/auth/register-from-order/route.ts:215, via
--                                createAdminClient() (service role, unaffected)
--   get_order_decrypted_pii   -> lib/security/pii-encryption.ts:60, which has no
--                                callers at all today
--   the rest                  -> no rpc() call anywhere in src/ or scripts/
-- service_role and postgres keep EXECUTE, so every server path keeps working.
--
-- NOT revoked, on purpose:
--   is_admin() / is_collaborator() / is_partner() — used inside RLS policies,
--     which evaluate them as the calling role; revoking would break the policies.
--     They only return a boolean about the caller.
--   handle_new_user() / encrypt_order_pii() — trigger functions. Postgres checks
--     EXECUTE on a trigger function at CREATE TRIGGER time, and calling one over
--     RPC fails with "trigger functions can only be called as triggers", so they
--     are not an exploitable surface. Revoking risks the profile-creation trigger
--     for no gain.

REVOKE EXECUTE ON FUNCTION public.anonymize_expired_drafts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.anonymize_order(order_id uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_kyc_expiry(p_user_id uuid, p_days_threshold integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_audit_logs() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_pii(ciphertext bytea, encryption_key text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.encrypt_pii(plaintext text, encryption_key text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_order_decrypted_pii(p_order_id uuid, p_encryption_key text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit_entry(p_action character varying, p_status character varying, p_user_id uuid, p_ip_address character varying, p_user_agent text, p_resource_type character varying, p_resource_id character varying, p_metadata jsonb, p_error_message text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.migrate_order_to_profile(p_order_id uuid, p_user_id uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.migrate_pii_to_encrypted(encryption_key text) FROM anon, authenticated;

-- A SECURITY DEFINER function without a fixed search_path can be hijacked: the
-- caller sets search_path, the body then resolves an unqualified name to the
-- caller's own object and it runs as the owner. `increment_email_confirm_attempts`
-- already does this correctly; align the rest.
ALTER FUNCTION public.anonymize_expired_drafts() SET search_path = public, extensions;
ALTER FUNCTION public.anonymize_order(order_id uuid) SET search_path = public, extensions;
ALTER FUNCTION public.check_kyc_expiry(p_user_id uuid, p_days_threshold integer) SET search_path = public, extensions;
ALTER FUNCTION public.cleanup_old_audit_logs() SET search_path = public, extensions;
ALTER FUNCTION public.decrypt_pii(ciphertext bytea, encryption_key text) SET search_path = public, extensions;
ALTER FUNCTION public.encrypt_pii(plaintext text, encryption_key text) SET search_path = public, extensions;
ALTER FUNCTION public.encrypt_order_pii() SET search_path = public, extensions;
ALTER FUNCTION public.get_order_decrypted_pii(p_order_id uuid, p_encryption_key text) SET search_path = public, extensions;
ALTER FUNCTION public.handle_new_user() SET search_path = public, extensions;
ALTER FUNCTION public.log_audit_entry(p_action character varying, p_status character varying, p_user_id uuid, p_ip_address character varying, p_user_agent text, p_resource_type character varying, p_resource_id character varying, p_metadata jsonb, p_error_message text) SET search_path = public, extensions;
ALTER FUNCTION public.migrate_order_to_profile(p_order_id uuid, p_user_id uuid) SET search_path = public, extensions;
ALTER FUNCTION public.migrate_pii_to_encrypted(encryption_key text) SET search_path = public, extensions;

NOTIFY pgrst, 'reload schema';
