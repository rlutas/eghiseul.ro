-- 113: Stripe payout reconciliation (Decontări) + extra-charge proforma/invoice tracking.
--
-- Context: eghiseul.ro + cazierjudiciaronline.com share ONE Stripe account and
-- ONE Oblio company (EDIGITALIZARE SRL). Payouts arrive mixed; accounting was
-- done by hand (print payout + write Oblio invoice numbers). These tables are
-- the local mirror of Stripe payouts + their balance transactions, enriched
-- with platform attribution and Oblio invoice refs. Synced by
-- src/lib/accounting/payout-sync.ts (admin button + daily cron).

CREATE TABLE IF NOT EXISTS stripe_payouts (
  id text PRIMARY KEY,                     -- po_...
  amount_bani bigint NOT NULL,
  currency text NOT NULL DEFAULT 'ron',
  status text NOT NULL,                    -- paid | in_transit | pending | failed | canceled
  arrival_date date,
  created_at_stripe timestamptz,
  tx_count int NOT NULL DEFAULT 0,
  matched_count int NOT NULL DEFAULT 0,    -- tx with an Oblio invoice attached
  bank_matched_at timestamptz,             -- phase 2: BT statement CSV matching
  raw jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_payout_transactions (
  id text PRIMARY KEY,                     -- txn_...
  payout_id text NOT NULL REFERENCES stripe_payouts(id) ON DELETE CASCADE,
  type text NOT NULL,                      -- charge | refund | adjustment | ...
  gross_bani bigint NOT NULL DEFAULT 0,
  fee_bani bigint NOT NULL DEFAULT 0,
  net_bani bigint NOT NULL DEFAULT 0,
  charge_id text,
  payment_intent_id text,
  description text,
  available_on date,
  platform text NOT NULL DEFAULT 'necunoscut',  -- eghiseul | cjo | necunoscut
  order_number text,
  service_name text,
  client_name text,
  client_email text,
  invoice_number text,                     -- Oblio (e.g. EGH-24097 / seria CJO)
  invoice_url text,
  raw jsonb
);

CREATE INDEX IF NOT EXISTS idx_spt_payout ON stripe_payout_transactions(payout_id);
CREATE INDEX IF NOT EXISTS idx_spt_order ON stripe_payout_transactions(order_number);
CREATE INDEX IF NOT EXISTS idx_payouts_arrival ON stripe_payouts(arrival_date DESC);

-- RLS: service-role only (admin APIs use the admin client). Block anon/authenticated.
ALTER TABLE stripe_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payout_transactions ENABLE ROW LEVEL SECURITY;

-- Extra-charge billing chain (proforma at link creation -> invoice after payment)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pending_extra_proforma jsonb,
  ADD COLUMN IF NOT EXISTS extra_billing jsonb;

COMMENT ON COLUMN orders.pending_extra_proforma IS 'Oblio proforma for the outstanding extra charge: {seriesName, number, link, amount}';
COMMENT ON COLUMN orders.extra_billing IS 'Array of settled extra charges: [{proforma:{seriesName,number,link}, invoice:{seriesName,number,link}, amount, paidAt}]';
