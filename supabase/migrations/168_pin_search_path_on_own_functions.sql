-- 168: Pin search_path on our own SECURITY INVOKER functions.
--
-- Closes the remaining 16 `function_search_path_mutable` warnings from the
-- Supabase advisor. These all run as the caller, not as the owner, so the
-- hijack risk is small — but a fixed search_path costs nothing and gets the
-- advisor down to the findings that are actually intentional, so a real one
-- stands out next time.
--
-- Deliberately NOT touched: every gtrgm_*/similarity/word_similarity function.
-- They belong to the pg_trgm extension (installed in `public`), and altering
-- extension-owned functions risks the operator class behind the trigram
-- indexes. The advisor does not flag them either.
--
-- `extensions` is on the path because pgcrypto and uuid-ossp live there on this
-- project (pg_extension: pgcrypto, uuid-ossp, pg_stat_statements -> extensions).
--
-- Verified on production right after applying, because four of these are in the
-- order-creation hot path (generate_friendly_order_id,
-- trigger_generate_friendly_order_id, generate_order_number, update_updated_at,
-- log_order_status_change, orders_stamp_completed_at):
--   POST /api/orders/draft   -> 201, friendly_order_id + order_number generated
--   PATCH /api/orders/draft  -> 200, updated_at advanced
--   GET  /api/orders/draft   -> 200
--   status draft -> pending  -> order_history got its row
-- (test order E-260917-YTBGM, deleted afterwards)

ALTER FUNCTION public.allocate_number(p_type text, p_year integer, p_order_id uuid, p_order_doc_id uuid, p_client_name text, p_client_email text, p_client_cnp text, p_client_cui text, p_service_type text, p_description text, p_amount numeric, p_source text, p_date date, p_created_by uuid) SET search_path = public, extensions;
ALTER FUNCTION public.calculate_order_total(p_order_id uuid) SET search_path = public, extensions;
ALTER FUNCTION public.find_existing_number(p_order_id uuid, p_type text, p_service_type text) SET search_path = public, extensions;
ALTER FUNCTION public.generate_friendly_order_id() SET search_path = public, extensions;
ALTER FUNCTION public.generate_order_number() SET search_path = public, extensions;
ALTER FUNCTION public.get_order_statistics(p_start_date date, p_end_date date) SET search_path = public, extensions;
ALTER FUNCTION public.get_service_required_modules(p_service_slug character varying) SET search_path = public, extensions;
ALTER FUNCTION public.increment_document_counter(counter_key text) SET search_path = public, extensions;
ALTER FUNCTION public.log_order_status_change() SET search_path = public, extensions;
ALTER FUNCTION public.mask_ci_number(ci_number text) SET search_path = public, extensions;
ALTER FUNCTION public.mask_cnp(cnp text) SET search_path = public, extensions;
ALTER FUNCTION public.orders_stamp_completed_at() SET search_path = public, extensions;
ALTER FUNCTION public.set_order_submitted_at() SET search_path = public, extensions;
ALTER FUNCTION public.trigger_generate_friendly_order_id() SET search_path = public, extensions;
ALTER FUNCTION public.update_updated_at() SET search_path = public, extensions;
ALTER FUNCTION public.void_number(p_registry_id uuid, p_voided_by uuid, p_void_reason text) SET search_path = public, extensions;

NOTIFY pgrst, 'reload schema';
