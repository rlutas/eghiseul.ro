-- 074_newsletter_subscribers.sql
--
-- Captarea adreselor de email din pop-up-ul de pe paginile de calculator
-- (lead-gen → alerte legislative + ghiduri). Scris via /api/newsletter cu
-- clientul service-role; fără politici RLS publice.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  source      text,            -- ex. 'calculator:salariu'
  consent     boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Un email o singură dată (upsert/no-op la re-abonare).
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_uniq
  ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- DDL real (fires pgrst_ddl_watch) + reload explicit (vezi .claude/rules/database.md).
COMMENT ON TABLE public.newsletter_subscribers IS 'Abonați newsletter captați din pop-up-ul de calculator (alerte + ghiduri).';
NOTIFY pgrst, 'reload schema';
