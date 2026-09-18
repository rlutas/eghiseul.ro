-- 175: remindere de expirare pentru mașinile salvate în cont (18.09.2026).
--
-- Cronul `/api/cron/vehicle-reminders` trimite un email cu ~14 zile înainte
-- (și până la 30 de zile după) expirarea rovinietei / ITP-ului / RCA-ului.
-- Fiecare coloană `*_reminded_for` ține DATA de expirare pentru care s-a
-- trimis deja reminderul: aceeași dată nu primește două emailuri, iar o dată
-- nouă (după reînnoire) primește din nou.

ALTER TABLE user_saved_vehicles
  ADD COLUMN IF NOT EXISTS rovinieta_reminded_for DATE,
  ADD COLUMN IF NOT EXISTS itp_reminded_for DATE,
  ADD COLUMN IF NOT EXISTS insurance_reminded_for DATE;

COMMENT ON COLUMN user_saved_vehicles.rovinieta_reminded_for IS
  'Data de expirare a rovinietei pentru care s-a trimis deja reminderul (cron vehicle-reminders).';
COMMENT ON COLUMN user_saved_vehicles.itp_reminded_for IS
  'Data de expirare ITP pentru care s-a trimis deja reminderul.';
COMMENT ON COLUMN user_saved_vehicles.insurance_reminded_for IS
  'Data de expirare RCA pentru care s-a trimis deja reminderul.';

NOTIFY pgrst, 'reload schema';
