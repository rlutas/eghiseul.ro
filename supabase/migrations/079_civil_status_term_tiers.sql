-- Migration 079: seed config termen stare civilă pe oficiu (admin_settings)
--
-- Tier-uri de termen pe oficiul de înregistrare (registrationPlace):
--   slow = București + sectoare (15-30), fast = oficii rapide editabile (5-7),
--   default = restul (7-15). Editabil din /admin/settings.
-- Idempotent prin ON CONFLICT (key).

INSERT INTO admin_settings (key, value)
VALUES (
  'civil_status_term_tiers',
  '{
    "slow":    { "display": "15-30 zile lucrătoare", "minDays": 15, "maxDays": 30 },
    "fast":    { "display": "5-7 zile lucrătoare",   "minDays": 5,  "maxDays": 7, "counties": ["Satu Mare"] },
    "default": { "display": "7-15 zile lucrătoare",  "minDays": 7,  "maxDays": 15 }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
