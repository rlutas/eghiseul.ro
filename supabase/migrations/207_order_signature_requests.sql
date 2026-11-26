-- 207: order_signature_requests — documents the client signs AFTER the order (26.11.2026)
--
-- The topograph (or the team) sometimes needs the client's signature on a
-- document that the order form never produced: the OCPI archive request
-- (Anexa 1) or a convention written for a specific job. Until now the team
-- filled them by hand and the client printed, signed and scanned them.
--
-- One row = one request: which documents, the data written in them (prefilled
-- from the order, editable by whoever asks), and — once the client signs on the
-- order status page — the audit trail (IP, user agent, consent, SHA-256 of
-- every signed file) and the order_documents rows it produced.
--
-- Service role only: every read/write goes through API routes that check the
-- caller (staff permission, the assigned collaborator, or the order-client
-- token). RLS on, no policies.

CREATE TABLE IF NOT EXISTS public.order_signature_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  -- Document kinds, e.g. {'cerere-arhiva-ocpi','conventie'} (src/lib/signature-requests/documents.ts)
  kinds               TEXT[] NOT NULL CHECK (array_length(kinds, 1) >= 1),
  -- Values written in the documents (one flat map shared by all kinds).
  fields              JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- The client completes / corrects the identity fields before signing.
  ask_identity        BOOLEAN NOT NULL DEFAULT false,
  note                TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'signed', 'cancelled')),
  requested_by        UUID,
  requested_by_type   TEXT NOT NULL CHECK (requested_by_type IN ('team', 'collaborator')),
  requested_by_name   TEXT NOT NULL,
  signed_at           TIMESTAMPTZ,
  signature_s3_key    TEXT,
  signature_metadata  JSONB,
  signed_document_ids UUID[],
  cancelled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_signature_requests_order
  ON public.order_signature_requests(order_id, created_at DESC);

ALTER TABLE public.order_signature_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.order_signature_requests IS
  'Documents the client signs on the order status page after the order (OCPI archive request, topograph convention). Service role only.';

NOTIFY pgrst, 'reload schema';
