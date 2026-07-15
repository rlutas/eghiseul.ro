-- 118_cookie_consent_log.sql
-- GDPR art. 7(1) accountability: registru de consimțăminte pentru cookie-uri.
-- Fiecare salvare din banner scrie un "consent receipt": consent_id-ul trăiește
-- și în cookie-ul vizitatorului (eg_cookie_consent), deci o alegere poate fi
-- dovedită punctual la o plângere, fără să identificăm altfel vizitatorul.
-- Servit exclusiv prin service-role (POST /api/consent-log) — fără acces anon.

CREATE TABLE IF NOT EXISTS cookie_consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id uuid NOT NULL,            -- mirrored in the visitor's consent cookie
  analytics boolean NOT NULL,
  marketing boolean NOT NULL,
  banner_version text NOT NULL,        -- ce text/versiune de banner a văzut
  ip text,                             -- accountability (aceeași practică ca newsletter_subscribers)
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cookie_consent_log_consent_idx ON cookie_consent_log(consent_id, created_at DESC);

ALTER TABLE cookie_consent_log ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only.

COMMENT ON TABLE cookie_consent_log IS 'Consent receipts pentru bannerul de cookie-uri (GDPR art. 7 — dovada consimțământului)';
NOTIFY pgrst, 'reload schema';
