-- 052_reload_invoice_lock_schema_cache.sql
--
-- Migration 049 added orders.invoice_generating_at with `ADD COLUMN IF NOT
-- EXISTS`. On the live DB the column already existed when 049 ran, so the ALTER
-- was a no-op and never fired Supabase's `pgrst_ddl_watch` event trigger. As a
-- result PostgREST's schema cache never learned about the column and rejected
-- every write to it with "column orders.invoice_generating_at does not exist".
-- That silently broke the invoice-lock claim in the Stripe webhook → paid card
-- orders were left WITHOUT an invoice (e.g. E-260610-NMU25).
--
-- A COMMENT is a real DDL command, so it fires `ddl_command_end` →
-- `pgrst_ddl_watch` → NOTIFY pgrst 'reload schema'. We also NOTIFY explicitly.
-- Idempotent and safe to re-run.

COMMENT ON COLUMN orders.invoice_generating_at IS
  'Atomic lock against duplicate Oblio invoices from concurrent payment webhooks. Set just before invoice creation; self-expires (~2 min). See lib/oblio/ensure-invoice.ts.';

NOTIFY pgrst, 'reload schema';
