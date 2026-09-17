-- Faza 2: the one question the account asks a new customer.
--
-- „Ce servicii te interesează?" — the answer decides whether the account asks
-- for an identity document at all. 11 of the 31 active services have
-- `personalKyc.enabled`; the other 20 do not, and we do not hand an identity
-- document to ONRC either, so a customer who only wants a certificat
-- constatator or an extras de carte funciară must never be asked for one.
--
-- Two columns, both nullable, because „skipped" is a first-class answer and
-- must stay distinguishable from „not asked yet":
--   service_interests = NULL  → never asked
--   service_interests = '{}'  → asked and skipped
--   onboarding_completed_at   → when the question was answered or skipped
--
-- The ids are the ones in `src/lib/account/service-interests.ts`; unknown values
-- are dropped on read (`parseInterests`), so a stale row can never widen what
-- the account asks for.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_interests TEXT[],
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.service_interests IS
  'Answers to the account onboarding question (ids from src/lib/account/service-interests.ts). NULL = never asked, {} = skipped.';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
  'When the onboarding question was answered or skipped. NULL = still to ask.';

-- Only the four ids the question offers, so a bad write fails loudly instead of
-- producing an answer nothing understands.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_service_interests_known;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_service_interests_known CHECK (
    service_interests IS NULL
    OR service_interests <@ ARRAY['caziere', 'stare-civila', 'imobile', 'firma']::TEXT[]
  );
