-- 184: chatbot intern (Ghid & noutăți) + raportare probleme din Ghid
-- (cerință Raul, 21.09.2026): echipa și colaboratorii întreabă chatbotul și
-- raportează probleme; Raul le vede grupate și le rezolvă. Ambele tabele se
-- scriu DOAR prin service role (RLS activ, fără politici → anon/authenticated
-- nu văd nimic prin PostgREST).

CREATE TABLE IF NOT EXISTS knowledge_chat_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role text,
  audience text NOT NULL CHECK (audience IN ('team', 'collaborator')),
  question text NOT NULL,
  answer text,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  documented boolean,
  model text,
  input_tokens integer,
  output_tokens integer,
  cache_read_tokens integer,
  error text
);
CREATE INDEX IF NOT EXISTS knowledge_chat_log_created_idx ON knowledge_chat_log (created_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_chat_log_undocumented_idx ON knowledge_chat_log (created_at DESC) WHERE documented = false;
ALTER TABLE knowledge_chat_log ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE knowledge_chat_log IS 'Întrebările puse chatbotului din Ghid (echipă + colaborator) și răspunsurile; documented=false = gol în documentație.';

CREATE TABLE IF NOT EXISTS knowledge_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_role text,
  reporter_email text,
  audience text NOT NULL CHECK (audience IN ('team', 'collaborator')),
  kind text NOT NULL CHECK (kind IN ('problema', 'intrebare-fara-raspuns', 'sugestie')),
  message text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'nou' CHECK (status IN ('nou', 'in_lucru', 'rezolvat')),
  resolution_note text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS knowledge_reports_status_idx ON knowledge_reports (status, created_at DESC);
ALTER TABLE knowledge_reports ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE knowledge_reports IS 'Probleme / sugestii / întrebări fără răspuns raportate din Ghid (admin + portal colaborator); status nou → in_lucru → rezolvat.';

NOTIFY pgrst, 'reload schema';
