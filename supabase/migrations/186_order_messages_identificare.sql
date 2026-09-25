-- 186: Mesaje pe comandă (echipă / topograf ↔ client) + termenele de la
-- identificarea imobilului confirmate cu topograful (25.09.2026).
--
-- 1. order_messages: firul de mesaje al unei comenzi. Scriu echipa (admin),
--    colaboratorul (topograful) și clientul (din pagina de status). Doar prin
--    service role: RLS pornit, fără politici — toate rutele trec prin API.
-- 2. Identificarea imobilului: 1–3 zile lucrătoare pe ambele servicii când
--    topograful găsește imobilul online; livrabilul „după proprietar” = un
--    singur extras CF, pentru imobilul ales de client.

CREATE TABLE IF NOT EXISTS public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('client', 'team', 'collaborator')),
  author_id UUID NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  -- [{ key, name, mimeType, size }] — chei S3 sub orders/<order_id>/acte-client/
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_by_client_at TIMESTAMPTZ NULL,
  read_by_staff_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS order_messages_order_idx
  ON public.order_messages (order_id, created_at);
CREATE INDEX IF NOT EXISTS order_messages_unread_staff_idx
  ON public.order_messages (order_id)
  WHERE author_type = 'client' AND read_by_staff_at IS NULL;

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_messages FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.order_messages TO service_role;

-- Identificare după adresă: 1–3 zile lucrătoare (confirmat cu topograful).
UPDATE public.services
SET estimated_days = 3,
    processing_config = COALESCE(processing_config, '{}'::jsonb)
      || jsonb_build_object('estimated_days_display', '1-3 zile lucrătoare')
WHERE slug = 'identificare-imobil';

-- Identificare după proprietar: același termen; un extras inclus, pentru
-- imobilul ales de client când găsim mai multe.
UPDATE public.services
SET estimated_days = 3,
    processing_config = COALESCE(processing_config, '{}'::jsonb)
      || jsonb_build_object(
        'estimated_days_display', '1-3 zile lucrătoare',
        'deliverable', 'Extras de carte funciară pentru imobilul identificat (la mai multe imobile: cel ales de client)'
      )
WHERE slug = 'identificare-imobile-proprietar';

NOTIFY pgrst, 'reload schema';
