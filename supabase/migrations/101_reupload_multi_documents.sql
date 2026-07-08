-- Migration 101: "Solicită documente" — multi-document re-upload requests
-- Date: 2026-07-08
--
-- Extends reupload_requests (048, selfie-only) so one request/link can ask the
-- customer for MULTIPLE documents (selfie, CI, pașaport, certificat firmă...).
-- Also adds the plumbing for the automatic standby flow: when the team
-- requests documents the order is parked in status='standby' (SLA paused) and
-- `return_status` remembers where to put it back once the customer uploads
-- everything.
--
--   document_types      JSONB array of doc-type strings for the request
--                       (legacy `document_type` column stays for old rows /
--                       single-doc fallback).
--   completed_documents JSONB array of {type, s3Key, at} appended as the
--                       customer uploads each document; request flips to
--                       'completed' when every requested type is present.
--   return_status       order status to restore on completion (captured at
--                       request time, before the order is moved to standby).

ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS document_types JSONB;
ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS completed_documents JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS return_status VARCHAR(30);

-- PostgREST schema cache: the ADD COLUMNs above are real DDL on first run and
-- fire pgrst_ddl_watch, but on a re-run they are no-ops (IF NOT EXISTS), so we
-- always end with a real DDL + explicit reload nudge (see rule from 052).
COMMENT ON COLUMN reupload_requests.document_types IS
  'JSONB array of requested document types (multi-doc requests, migration 101). NULL for legacy single-doc rows — use document_type.';
COMMENT ON COLUMN reupload_requests.completed_documents IS
  'JSONB array of {type, s3Key, at} for documents the customer already uploaded on this request.';
COMMENT ON COLUMN reupload_requests.return_status IS
  'Order status to restore when the request completes (order parked in standby while waiting).';
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reupload_requests'
  AND column_name IN ('document_types', 'completed_documents', 'return_status');
