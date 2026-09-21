-- 185: „Verificare de expert” (49 lei) nu mai există ca serviciu (Raul,
-- 21.09.2026). Wizardul o ascundea deja (HIDDEN_CODES), 0 comenzi plătite cu
-- ea în 180 de zile; rămânea vizibilă pe paginile de servicii și în „Modifică
-- comanda”. Dezactivăm rândurile, nu le ștergem (istoric).
UPDATE service_options
   SET is_active = false, updated_at = now()
 WHERE code = 'verificare_expert' AND is_active = true;
