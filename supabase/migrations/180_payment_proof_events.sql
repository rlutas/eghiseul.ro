-- 180: payment proofs — one workflow, one event per proof, retry-safe (18.09.2026)
--
-- Feedback point 25 (a bank-transfer order shows its payment instructions and
-- an upload on the status page) reviewed by Codex in five rounds. The shape:
--   * payment_proof_events: one row per proof ever attached to an order, keyed
--     by the object's content digest (S3 ETag). A replayed older proof never
--     reverts the newest one and never notifies twice.
--   * attach_payment_proof(): atomic — the order's proof, the history row and
--     the event row in one transaction; 'unchanged' for a known digest,
--     'not_awaiting' when the order is not waiting for a bank transfer.
--   * mark_payment_proof_notified(): the team heads-up is sent once per proof;
--     a crash between attach and send is healed on the next retry.
--   * count_proof_presign(): the ≤5 presigns/order/hour limit, in the database
--     (the in-memory limiter is per Vercel instance).

CREATE TABLE IF NOT EXISTS public.payment_proof_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  proof_key TEXT NOT NULL,
  proof_digest TEXT NOT NULL,
  history_id UUID NULL REFERENCES public.order_history(id) ON DELETE SET NULL,
  team_notified_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, proof_digest)
);
ALTER TABLE public.payment_proof_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_proof_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payment_proof_events TO service_role;
COMMENT ON TABLE public.payment_proof_events IS
  'O linie per dovadă de plată atașată unei comenzi (cheie = digest-ul conținutului). Scrisă doar de attach_payment_proof().';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS proof_presign_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_presign_window_start TIMESTAMPTZ NULL;

CREATE OR REPLACE FUNCTION public.attach_payment_proof(
  p_order_id UUID,
  p_key TEXT,
  p_digest TEXT,
  p_changed_by TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_event RECORD;
  v_history_id UUID;
  v_event_id UUID;
BEGIN
  IF p_key IS NULL OR p_key = '' OR p_digest IS NULL OR p_digest = '' THEN
    RETURN jsonb_build_object('outcome', 'invalid');
  END IF;

  SELECT id, status, payment_status, payment_method, payment_proof_url INTO v_order
  FROM orders WHERE id = p_order_id FOR UPDATE;
  IF v_order IS NULL THEN RETURN jsonb_build_object('outcome', 'order_not_found'); END IF;

  -- A proof we have already attached (same content): nothing changes, whatever
  -- the order's current proof is — a delayed retry must not revert a newer one.
  SELECT id, history_id INTO v_event
  FROM payment_proof_events WHERE order_id = p_order_id AND proof_digest = p_digest;
  IF v_event IS NOT NULL THEN
    RETURN jsonb_build_object('outcome', 'unchanged', 'event_id', v_event.id, 'history_id', v_event.history_id);
  END IF;

  IF v_order.payment_method IS DISTINCT FROM 'bank_transfer'
     OR v_order.payment_status IS DISTINCT FROM 'awaiting_verification'
     OR v_order.status IS DISTINCT FROM 'awaiting_payment' THEN
    RETURN jsonb_build_object('outcome', 'not_awaiting');
  END IF;

  UPDATE orders SET payment_proof_url = p_key, updated_at = NOW() WHERE id = p_order_id;

  INSERT INTO order_history (order_id, event_type, notes, new_value, changed_by)
  VALUES (
    p_order_id,
    'payment_proof_submitted',
    'Clientul a încărcat dovada de plată',
    jsonb_build_object('payment_proof_url', p_key, 'status', v_order.status, 'payment_status', v_order.payment_status),
    p_changed_by
  )
  RETURNING id INTO v_history_id;

  INSERT INTO payment_proof_events (order_id, proof_key, proof_digest, history_id)
  VALUES (p_order_id, p_key, p_digest, v_history_id)
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object('outcome', 'attached', 'event_id', v_event_id, 'history_id', v_history_id);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.attach_payment_proof(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_payment_proof(UUID, TEXT, TEXT, TEXT) TO service_role, postgres;

CREATE OR REPLACE FUNCTION public.mark_payment_proof_notified(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE payment_proof_events SET team_notified_at = NOW()
  WHERE id = p_event_id AND team_notified_at IS NULL
  RETURNING TRUE;
$$;
REVOKE EXECUTE ON FUNCTION public.mark_payment_proof_notified(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_payment_proof_notified(UUID) TO service_role, postgres;

-- TRUE when this presign is within the order's budget (5 per rolling hour).
CREATE OR REPLACE FUNCTION public.count_proof_presign(p_order_id UUID, p_max INTEGER DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_start TIMESTAMPTZ;
BEGIN
  SELECT proof_presign_count, proof_presign_window_start INTO v_count, v_start
  FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_start IS NULL OR v_start < NOW() - INTERVAL '1 hour' THEN
    UPDATE orders SET proof_presign_count = 1, proof_presign_window_start = NOW() WHERE id = p_order_id;
    RETURN TRUE;
  END IF;
  IF v_count >= p_max THEN RETURN FALSE; END IF;
  UPDATE orders SET proof_presign_count = v_count + 1 WHERE id = p_order_id;
  RETURN TRUE;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.count_proof_presign(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_proof_presign(UUID, INTEGER) TO service_role, postgres;

NOTIFY pgrst, 'reload schema';
