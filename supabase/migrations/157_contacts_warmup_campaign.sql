-- Campanie de warm-up pentru cei 72k contacte din registrul intern (majoritatea
-- lead-uri WPForms de pe site-ul vechi, niciodată contactate de marketing).
-- Decizie de business 2026-09-14 (Raul): sunt foști clienți/lead-uri de pe
-- eghiseul.ro vechi, consimțământul a fost acordat acolo — se trimite la toți,
-- dar treptat (câțiva pe zi), nu într-un singur val, pentru deliverability.
--
-- Fiecare contact primește UN singur email de reactivare, marcat aici ca să
-- nu se retrimită. Token de dezabonare propriu (independent de
-- newsletter_subscribers, care e lista de opt-in explicit, populație diferită).

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS warmup_email_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_unsubscribe_token ON contacts (unsubscribe_token);

-- Selecția batch-ului zilnic: contacte eligibile (nu dezabonate/suprimate),
-- încă nesunate cu email de warmup, ordonate după vechime.
CREATE INDEX IF NOT EXISTS idx_contacts_warmup_pending
  ON contacts (first_seen_at)
  WHERE warmup_email_sent_at IS NULL
    AND marketing_status NOT IN ('unsubscribed', 'suppressed');

COMMENT ON COLUMN contacts.unsubscribe_token IS 'Token unic pentru linkul de dezabonare din emailul de warm-up.';
COMMENT ON COLUMN contacts.warmup_email_sent_at IS 'Când a primit contactul emailul de reactivare (o singură dată).';

NOTIFY pgrst, 'reload schema';
