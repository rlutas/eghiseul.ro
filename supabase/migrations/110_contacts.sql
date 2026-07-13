-- 110: Registrul central de clienți/lead-uri (sursa de adevăr pentru marketing).
--
-- PII trăiește DOAR aici (nu în docs/git). RLS activat fără politici publice —
-- acces exclusiv prin service role (admin API). GDPR:
--   is_customer=true  → a plătit → soft opt-in (Legea 506/2004): comunicări
--                       despre servicii similare, cu dezabonare în fiecare email
--   is_customer=false → lead (formular fără plată confirmată) → NU primește
--                       marketing fără re-permission
--   marketing_status: soft_opt_in | subscribed | unsubscribed | suppressed

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone text,
  -- de unde îl știm: 'wpforms:cazier-judiciar', 'platforma:extras-carte-funciara', ...
  sources text[] NOT NULL DEFAULT '{}',
  -- serviciile cerute/cumpărate (slug-uri sau etichete wpforms)
  services text[] NOT NULL DEFAULT '{}',
  is_customer boolean NOT NULL DEFAULT false,
  marketing_status text NOT NULL DEFAULT 'soft_opt_in'
    CHECK (marketing_status IN ('soft_opt_in','subscribed','unsubscribed','suppressed')),
  orders_count integer NOT NULL DEFAULT 0,
  total_spent_ron numeric NOT NULL DEFAULT 0,
  first_seen_at timestamptz,
  last_activity_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_sources_idx ON contacts USING gin (sources);
CREATE INDEX IF NOT EXISTS contacts_is_customer_idx ON contacts (is_customer);
CREATE INDEX IF NOT EXISTS contacts_last_activity_idx ON contacts (last_activity_at DESC);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- fără politici: doar service_role (bypass RLS) poate citi/scrie.

COMMENT ON TABLE contacts IS 'Registru clienți/lead-uri (import WPForms + sync comenzi plătite). PII — acces doar prin service role.';
NOTIFY pgrst, 'reload schema';
