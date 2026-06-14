-- 058_system_heartbeats.sql
-- Lightweight liveness signal for the "Stare sistem" page. The ONRC worker hits
-- /api/onrc/pending every poll → we upsert a 'worker' heartbeat. The public
-- status endpoint reports the worker as up when last_seen is recent.
CREATE TABLE IF NOT EXISTS system_heartbeats (
  name text PRIMARY KEY,
  last_seen timestamptz NOT NULL DEFAULT now(),
  meta jsonb
);
COMMENT ON TABLE system_heartbeats IS 'Liveness heartbeats (e.g. ONRC worker) for the system-status page';
NOTIFY pgrst, 'reload schema';
