-- 206: orders.search_text — one short, pre-computed text for the admin search (12.11.2026)
--
-- The admin list searched JSON paths inside customer_data with ILIKE. That
-- JSON is large (OCR results, documents), so every path detoasts it again:
-- ~0.9 s per query on 1.768 orders, and the tab counts run 22 such queries.
--
-- search_text holds everything the team searches by, lowercased and without
-- Romanian diacritics, so „lutas" finds „Luțaș". The application normalizes
-- the typed words the same way (src/lib/admin/order-search.ts) and requires
-- every word to appear in this text.
--
-- Only IMMUTABLE functions (lower, translate, ||, coalesce, jsonb ->>): a
-- generated column refuses anything else (concat_ws and unaccent are STABLE).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS search_text TEXT
  GENERATED ALWAYS AS (
    translate(
      lower(
        coalesce(order_number, '') || ' ' ||
        coalesce(friendly_order_id, '') || ' ' ||
        coalesce(delivery_tracking_number, '') || ' ' ||
        coalesce(customer_data->'contact'->>'email', '') || ' ' ||
        coalesce(customer_data->'contact'->>'phone', '') || ' ' ||
        coalesce(customer_data->'contact'->>'firstName', '') || ' ' ||
        coalesce(customer_data->'contact'->>'lastName', '') || ' ' ||
        coalesce(customer_data->'personal'->>'lastName', '') || ' ' ||
        coalesce(customer_data->'personal'->>'firstName', '') || ' ' ||
        coalesce(customer_data->'personal'->>'cnp', '') || ' ' ||
        coalesce(customer_data->'billing'->>'lastName', '') || ' ' ||
        coalesce(customer_data->'billing'->>'firstName', '') || ' ' ||
        coalesce(customer_data->'billing'->>'name', '') || ' ' ||
        coalesce(customer_data->'billing'->>'companyName', '') || ' ' ||
        coalesce(customer_data->'billing'->>'cui', '') || ' ' ||
        coalesce(customer_data->'company'->>'companyName', '') || ' ' ||
        coalesce(customer_data->'company'->>'cui', '')
      ),
      'ăâîșşțţáéíóöőúüű',
      'aaissttaeiooouuu'
    )
  ) STORED;

COMMENT ON COLUMN public.orders.search_text IS
  'Admin search haystack: order codes, AWB, contact, person/company names, CNP, CUI — lowercase, no diacritics. Generated; never written by the app.';

NOTIFY pgrst, 'reload schema';
