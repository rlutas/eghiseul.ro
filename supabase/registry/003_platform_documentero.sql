-- =============================================================================
-- 003 — documentero.ro joins the central Bar registry (2026-09-19)
-- =============================================================================
-- Fourth consumer platform. Same firm (eDigitalizare SRL), same lawyer, same
-- shared ranges; only the brand differs. The idempotency key of
-- allocate_number stays (platform, order_ref, type, service_type), so
-- documentero orders can never collide with eghiseul ones even when a
-- friendly_order_id looks the same (they do not: both use E-YYMMDD-XXXXX from
-- the same generator, but the platform column keeps them apart anyway).
--
-- Apply on the REGISTRY project (registru-barou-central, ksqkttalapjlgugshuks),
-- NOT on the eghiseul DB.
-- =============================================================================

ALTER TABLE public.number_registry DROP CONSTRAINT IF EXISTS number_registry_platform_check;
ALTER TABLE public.number_registry
  ADD CONSTRAINT number_registry_platform_check
  CHECK (platform IN ('eghiseul', 'cazierjudiciaronline', 'ecazier', 'documentero'));

COMMENT ON COLUMN public.number_registry.platform IS
  'Consumer platform: eghiseul | cazierjudiciaronline | ecazier | documentero (2026-09-19)';
NOTIFY pgrst, 'reload schema';
