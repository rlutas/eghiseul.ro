-- 167: Finish what 165 started — revoke the RPCs from PUBLIC, not just anon.
--
-- Migration 165 ran `REVOKE EXECUTE ... FROM anon, authenticated` and reported
-- success, but the privilege was still there:
--
--   has_function_privilege('anon', 'public.anonymize_order(uuid)', 'EXECUTE') -> true
--
-- Postgres grants EXECUTE on every new function to the pseudo-role **PUBLIC**.
-- Revoking from `anon` only removes a grant that was never made directly, so the
-- role keeps the privilege through PUBLIC. The revoke has to name PUBLIC, and
-- then the roles that legitimately need it are granted back explicitly.
--
-- Footgun worth remembering: this is the opposite of table privileges. Tables are
-- NOT granted to PUBLIC by default, so `REVOKE ... ON TABLE ... FROM anon` (see
-- migrations 163 and 164) does work as written. Functions are.
--
-- Always verify a revoke with has_function_privilege / has_table_privilege —
-- "success" from the migration says nothing about the effective privilege.

REVOKE EXECUTE ON FUNCTION public.anonymize_expired_drafts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonymize_order(order_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_kyc_expiry(p_user_id uuid, p_days_threshold integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_audit_logs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrypt_pii(ciphertext bytea, encryption_key text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.encrypt_pii(plaintext text, encryption_key text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_order_decrypted_pii(p_order_id uuid, p_encryption_key text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_entry(p_action character varying, p_status character varying, p_user_id uuid, p_ip_address character varying, p_user_agent text, p_resource_type character varying, p_resource_id character varying, p_metadata jsonb, p_error_message text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.migrate_order_to_profile(p_order_id uuid, p_user_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.migrate_pii_to_encrypted(encryption_key text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.anonymize_expired_drafts() TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.anonymize_order(order_id uuid) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.check_kyc_expiry(p_user_id uuid, p_days_threshold integer) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.cleanup_old_audit_logs() TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.decrypt_pii(ciphertext bytea, encryption_key text) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.encrypt_pii(plaintext text, encryption_key text) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.get_order_decrypted_pii(p_order_id uuid, p_encryption_key text) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.log_audit_entry(p_action character varying, p_status character varying, p_user_id uuid, p_ip_address character varying, p_user_agent text, p_resource_type character varying, p_resource_id character varying, p_metadata jsonb, p_error_message text) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.migrate_order_to_profile(p_order_id uuid, p_user_id uuid) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.migrate_pii_to_encrypted(encryption_key text) TO service_role, postgres;

NOTIFY pgrst, 'reload schema';

-- Verified after applying:
--   anon_exec = false, auth_exec = false, service_exec = true on all ten.
-- Still executable by anon, on purpose: is_admin / is_collaborator / is_partner
-- (evaluated inside RLS policies as the calling role) and the two trigger
-- functions handle_new_user / encrypt_order_pii (not callable over RPC).
