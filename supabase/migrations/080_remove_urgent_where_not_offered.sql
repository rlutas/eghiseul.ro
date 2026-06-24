-- Migration 080: elimină opțiunea de urgență de la serviciile care NU o oferă
--
-- Pe paginile de serviciu, cardul „Urgent: X zile" + badge-ul „Urgent Disponibil"
-- sunt gated pe `services.urgent_days` / `urgent_available`. Naștere/căsătorie/
-- celibat + extras CF + cazier fiscal NU au taxă de urgență (confirmat 2026-06-24)
-- dar aveau încă urgent_days/urgent_available setate → cardul apărea greșit.

UPDATE services
SET urgent_available = false, urgent_days = NULL
WHERE slug IN (
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'extras-carte-funciara',
  'cazier-fiscal'
);

-- Dezactivează și opțiunea „Procesare Urgentă" din wizard pentru aceste servicii
-- (nu trebuie oferită ca add-on).
UPDATE service_options
SET is_active = false, updated_at = now()
WHERE code = 'urgenta'
  AND service_id IN (
    SELECT id FROM services WHERE slug IN (
      'certificat-nastere',
      'certificat-casatorie',
      'certificat-celibat',
      'extras-carte-funciara',
      'cazier-fiscal'
    )
  );
