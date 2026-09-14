-- Emailuri de lifecycle (recenzie / expirare document / cross-sell) + campanii
-- manuale (noutăți, articole, servicii noi) — docs/technical/specs/lifecycle-emails.md
--
-- 1. `orders.completed_at` — nu exista (actual_completion_date e NULL pe toate
--    cele 389 de comenzi finalizate). Singura sursă era order_history. Coloană
--    nouă, backfill din istoric, trigger ca să se stampeze singură indiferent
--    de calea de finalizare (proces manual, auto-finalize-delivered, viitoare).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
COMMENT ON COLUMN orders.completed_at IS 'Când a intrat comanda în status completed (trigger); backfill din order_history la migrarea 159.';

UPDATE orders o
SET completed_at = h.done_at
FROM (
  SELECT order_id, MIN(created_at) AS done_at
  FROM order_history
  WHERE event_type = 'status_changed' AND new_value->>'status' = 'completed'
  GROUP BY order_id
) h
WHERE h.order_id = o.id AND o.completed_at IS NULL;

CREATE OR REPLACE FUNCTION orders_stamp_completed_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_orders_stamp_completed_at ON orders;
CREATE TRIGGER trg_orders_stamp_completed_at
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION orders_stamp_completed_at();

CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders (completed_at) WHERE completed_at IS NOT NULL;

-- 2. Jurnalul de emailuri de lifecycle: un rând per (comandă, tip). Inserarea
--    se face ÎNAINTE de trimitere (claim atomic prin unicitate) — două rulări
--    suprapuse nu pot trimite de două ori același email.

CREATE TABLE IF NOT EXISTS lifecycle_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('review_request', 'expiry_reminder', 'cross_sell')),
  recipient_email text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  resend_id text,
  sent_at timestamptz,
  failed_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_lifecycle_emails_recipient_kind ON lifecycle_emails (recipient_email, kind, created_at DESC);
ALTER TABLE lifecycle_emails ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE lifecycle_emails IS 'Emailuri automate post-comandă (recenzie, expirare document, cross-sell). Rând inserat înainte de trimitere = claim; sent_at NULL + failed_reason = eșec.';

-- 3. Campanii manuale (newsletter: articole noi, servicii noi, schimbări de
--    termene). Trimise treptat de cron, cu jurnal per destinatar.

CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  preheader text,
  body_text text NOT NULL,
  cta_label text,
  cta_url text,
  segment text NOT NULL DEFAULT 'customers' CHECK (segment IN ('customers', 'subscribed', 'all_contacts')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'paused', 'done')),
  daily_batch_size integer NOT NULL DEFAULT 100 CHECK (daily_batch_size BETWEEN 1 AND 2000),
  sent_count integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE email_campaigns IS 'Campanii de email scrise în /admin/marketing; body_text e markdown-lite (paragrafe, - liste, **bold**, linkuri).';

CREATE TABLE IF NOT EXISTS email_campaign_sends (
  campaign_id uuid NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sent_at timestamptz,
  failed_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, contact_id)
);
ALTER TABLE email_campaign_sends ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';

-- Cursor de parcurgere a registrului (contacts ordonat după created_at, id):
-- cronul nu recitește niciodată contactele deja parcurse, indiferent dacă
-- le-a trimis sau le-a sărit — altfel cele sărite ar sta la capul cozii.
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS cursor_created_at TIMESTAMPTZ;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS cursor_id UUID;
COMMENT ON COLUMN email_campaigns.cursor_created_at IS 'Ultimul contact parcurs (created_at) — paginare keyset cu cursor_id.';
CREATE INDEX IF NOT EXISTS idx_contacts_created_id ON contacts (created_at, id);

NOTIFY pgrst, 'reload schema';
