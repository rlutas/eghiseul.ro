-- 094: order_history.changed_by  uuid FK → text
--
-- The whole ecosystem treats changed_by as a human-readable author string:
--   • the admin UI renders it directly (note author, timeline "· {changed_by}")
--     and filters human vs system notes by a `system-*` prefix,
--   • the /notes and /status routes write the admin's EMAIL,
--   • system crons write literal 'system-cron'.
-- But the column was a uuid FK to profiles(id), so adding a note crashed with
-- `invalid input syntax for type uuid: "...@gmail.com"`.
--
-- Align the column with how it's actually used (and with cazierjudiciaronline.com,
-- where changed_by is text): drop the FK and store text. Existing uuid values
-- (7 rows) cast cleanly to their string form.

ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_changed_by_fkey;
ALTER TABLE order_history ALTER COLUMN changed_by TYPE text USING changed_by::text;
