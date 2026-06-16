-- 069_ancpi_cf_price_89.sql
-- Extras Carte Funciară price → 89 RON (USP: only provider issuing in minutes,
-- 24/7, no urgency fee). Updates base_price (drives wizard + Offer schema + page).

UPDATE services
SET base_price = 89, updated_at = now()
WHERE slug = 'extras-carte-funciara';

NOTIFY pgrst, 'reload schema';
