-- 127: Listă de notificare la revenirea unui serviciu extern picat.
--
-- Contextul: articolul /ancpi-nu-functioneaza/ rankează #4 pe un subiect
-- fierbinte și aduce trafic real, dar singura conversie oferită e „comandă
-- acum". Cine nu e gata să plătească imediat — majoritatea — pleacă fără urmă.
-- Ăsta e exact publicul cu cea mai mare intenție: vrea documentul, dar
-- așteaptă să revină sistemul.
--
-- Capturăm emailul cu o promisiune îngustă și verificabilă („te anunțăm când
-- revine"), iar la revenire trimitem un singur email — momentul cu cea mai
-- mare intenție de cumpărare din tot ciclul.
--
-- Tabelă separată de `contacts` pentru că are ciclu de viață propriu (se
-- notifică o dată, apoi e istoric) și pentru că un abonat la alertă NU e
-- automat contact de marketing — consimțământul e pentru o notificare punctuală.
-- Sincronizarea către `contacts` se face explicit, doar cu bifă separată.

CREATE TABLE IF NOT EXISTS outage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ce serviciu așteaptă. Text liber intenționat: următorul outage poate fi
  -- ONRC, ANAF sau altceva, fără migrare.
  service TEXT NOT NULL,

  email TEXT NOT NULL,

  -- Pagina de pe care s-a înscris + atribuire, ca să știm ce aduce lead-uri.
  source_page TEXT,
  referrer TEXT,
  utm JSONB,

  -- Consimțământ pentru marketing ulterior — separat de alerta punctuală.
  -- FALSE = îl anunțăm o dată și atât.
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,

  -- Audit minimal (GDPR: dovada momentului și contextului înscrierii).
  ip TEXT,
  user_agent TEXT,

  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un email se poate înscrie o singură dată per serviciu.
  CONSTRAINT outage_alerts_unique_email_service UNIQUE (service, email)
);

-- Interogarea de trimitere: „cine așteaptă serviciul X și n-a fost notificat".
CREATE INDEX IF NOT EXISTS idx_outage_alerts_pending
  ON outage_alerts (service, created_at)
  WHERE notified_at IS NULL;

COMMENT ON TABLE outage_alerts IS
  'Abonați la notificarea de revenire a unui serviciu extern picat (ANCPI, ONRC etc.). Un email per serviciu; notified_at se setează la trimiterea alertei.';
COMMENT ON COLUMN outage_alerts.marketing_consent IS
  'FALSE = doar alerta punctuală. TRUE = acceptă și comunicări ulterioare, caz în care se propagă în contacts.';
