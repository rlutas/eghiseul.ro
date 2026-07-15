-- 126_atomic_email_confirm_attempts.sql
-- Finding code-review (commit ea6269e): incrementul email_confirm_attempts
-- era read-modify-write ne-atomic — cereri paralele /verify citeau același
-- contor vechi și se suprascriau (lost update), ocolind lock-ul de 10
-- încercări. Funcție atomică: incrementează DOAR sub prag și întoarce
-- valoarea nouă; NULL = deja blocat (același pattern ca lock-ul de facturi).

CREATE OR REPLACE FUNCTION increment_email_confirm_attempts(
  p_request_id UUID,
  p_max INT DEFAULT 10
) RETURNS INT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE reupload_requests
  SET email_confirm_attempts = email_confirm_attempts + 1,
      updated_at = NOW()
  WHERE id = p_request_id
    AND email_confirm_attempts < p_max
  RETURNING email_confirm_attempts;
$$;

-- service-role only (tabela are RLS fără politici publice; funcția e apelată
-- exclusiv cu clientul admin)
REVOKE ALL ON FUNCTION increment_email_confirm_attempts(UUID, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION increment_email_confirm_attempts(UUID, INT) FROM anon;
REVOKE ALL ON FUNCTION increment_email_confirm_attempts(UUID, INT) FROM authenticated;

NOTIFY pgrst, 'reload schema';
