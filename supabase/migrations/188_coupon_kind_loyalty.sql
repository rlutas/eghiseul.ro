-- 188: coupon kind for the loyalty coupon sent by the warm-up campaign.
--
-- Contacts who used us for two or more services get a FIDEL-XXXXXXXX coupon
-- (10%, 30 days, single use) inside the warm-up email. `system_kind =
-- 'loyalty'` keeps these apart from recovery, phone and welcome coupons in
-- /admin/coupons and out of the recovery cron's cleanup.

ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_system_kind_check;
ALTER TABLE public.coupons
  ADD CONSTRAINT coupons_system_kind_check
  CHECK (system_kind IS NULL OR system_kind = ANY (ARRAY['recovery', 'phone_recovery', 'welcome', 'loyalty']));
