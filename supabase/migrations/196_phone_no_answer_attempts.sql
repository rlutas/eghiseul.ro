-- 196: „Nu a răspuns" attempts on the phone recovery queue.
--
-- Team request (07.10.2026): two boxes before the client's name in
-- /admin/recuperare-telefonica, ticked when the client does not pick up.
-- After the second no-answer the client leaves „De sunat" for good (orders
-- started after that come back). Stored on the order shown in the queue (the
-- newest order of that email) as an array of { at, caller }; unticking removes
-- the last entry. A no-answer is not a call: phone_contacted_at stays untouched,
-- so it never counts as the call that recovered a paying client.
-- Audit trail: order_history event_type 'phone_contact_logged' (already allowed).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phone_no_answer_attempts jsonb NOT NULL DEFAULT '[]'::jsonb;

-- COMMENT is real DDL: fires pgrst_ddl_watch even when the column already existed.
COMMENT ON COLUMN public.orders.phone_no_answer_attempts IS
  'Phone recovery „Nu a răspuns" ticks: [{ "at": ISO timestamp, "caller": "Maria" | "Carla" }], oldest first, max 2. Two entries = client out of the „De sunat" queue.';

NOTIFY pgrst, 'reload schema';
