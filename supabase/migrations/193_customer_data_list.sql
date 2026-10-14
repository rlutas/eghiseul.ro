-- 193: customer_data without inline files, for admin LISTS (14.10.2026).
--
-- Drafts from before the S3 upload flow keep ID scans as base64 strings in
-- customer_data.personal(.Data).uploadedDocuments[].base64 (~500 KB each).
-- The admin order list only renders names, contact and document types, but
-- selected the whole column: two such drafts made „Abandonuri” move ~1 MB
-- from the database on every load (3+ s). PostgREST exposes this function as
-- a computed field: `select=customer_data:customer_data_list`.

CREATE OR REPLACE FUNCTION public.customer_data_list(o public.orders)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN o.customer_data IS NULL OR jsonb_typeof(o.customer_data) <> 'object' THEN o.customer_data
    ELSE
      (o.customer_data - 'signature_metadata' - 'signature')
      || CASE
           WHEN jsonb_typeof(o.customer_data->'personal'->'uploadedDocuments') = 'array' THEN
             jsonb_build_object(
               'personal',
               (o.customer_data->'personal')
               || jsonb_build_object(
                    'uploadedDocuments',
                    (SELECT coalesce(jsonb_agg(d - 'base64' - 'dataUrl'), '[]'::jsonb)
                       FROM jsonb_array_elements(o.customer_data->'personal'->'uploadedDocuments') d)
                  )
             )
           ELSE '{}'::jsonb
         END
      || CASE
           WHEN jsonb_typeof(o.customer_data->'personalData'->'uploadedDocuments') = 'array' THEN
             jsonb_build_object(
               'personalData',
               (o.customer_data->'personalData')
               || jsonb_build_object(
                    'uploadedDocuments',
                    (SELECT coalesce(jsonb_agg(d - 'base64' - 'dataUrl'), '[]'::jsonb)
                       FROM jsonb_array_elements(o.customer_data->'personalData'->'uploadedDocuments') d)
                  )
             )
           ELSE '{}'::jsonb
         END
  END
$$;

-- Admin-only (service role). PUBLIC, not just anon: revoking from anon alone
-- changes nothing for functions (see memory revoke-execute-public-nu-anon).
REVOKE EXECUTE ON FUNCTION public.customer_data_list(public.orders) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.customer_data_list(public.orders) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.customer_data_list(public.orders) TO service_role;

COMMENT ON FUNCTION public.customer_data_list(public.orders) IS
  'customer_data without inline base64 files, for admin lists (migration 193)';
NOTIFY pgrst, 'reload schema';
