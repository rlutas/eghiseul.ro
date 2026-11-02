-- 199: AI usage log (Gemini tokens + estimated cost) and client-side error log.
--
-- Context (02.11.2026): the AI Studio prepaid credit ran out on 23.10 and the
-- OCR was dead for 10 days before anyone noticed. There is no API that reads
-- the prepaid balance, so we estimate it: top-ups (admin_settings
-- `gemini_credit`) minus the cost of every logged call. CJO has an identical
-- `ai_usage_log` in its own database; the admin page sums both.
--
-- `client_error_log` records errors shown to customers in the browser (image
-- decode, CNP checksum, OCR, upload) so we can count the affected people.
-- It NEVER stores CNP, names, emails or file contents — the API route strips
-- everything outside an allowlist.
--
-- Same shapes on CJO (parallel migration there) — keep columns in sync.
--
-- RLS: enabled with NO policies → anon/authenticated can neither read nor
-- write. Writes come from API routes with the service role; reads from admin
-- routes with the service role. (A policy on {public} would include anon.)

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  platform text NOT NULL,
  feature text NOT NULL,
  model text,
  prompt_tokens int,
  output_tokens int,
  total_tokens int,
  est_cost_usd numeric(12,6),
  ok boolean NOT NULL,
  http_status int,
  error_code text
);

CREATE INDEX IF NOT EXISTS ai_usage_log_created_at_idx ON public.ai_usage_log (created_at);

CREATE TABLE IF NOT EXISTS public.client_error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  platform text NOT NULL,
  kind text NOT NULL,
  code text,
  message text,
  page text,
  step text,
  service_slug text,
  order_ref text,
  user_agent text,
  meta jsonb
);

CREATE INDEX IF NOT EXISTS client_error_log_created_at_idx ON public.client_error_log (created_at);
CREATE INDEX IF NOT EXISTS client_error_log_kind_idx ON public.client_error_log (kind);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_error_log ENABLE ROW LEVEL SECURITY;

-- Belt and braces: no table privileges for the API roles either.
REVOKE ALL ON public.ai_usage_log FROM anon, authenticated;
REVOKE ALL ON public.client_error_log FROM anon, authenticated;

COMMENT ON TABLE public.ai_usage_log IS
  'One row per Gemini call: tokens from usageMetadata + estimated USD cost (pricing table in src/lib/ai/usage-log.ts). Service role only.';
COMMENT ON TABLE public.client_error_log IS
  'Errors shown to customers in the browser (no personal data). Written by POST /api/client-errors with the service role.';

NOTIFY pgrst, 'reload schema';
