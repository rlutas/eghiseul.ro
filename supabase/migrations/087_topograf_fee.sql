-- 087_topograf_fee.sql
-- Per-order topograph fee (15 RON), mirroring the lawyer fee (services.lawyer_fee_ron,
-- migration 047). Reuses the same column + invoice mechanism (computeLawyerFee); the
-- carved invoice line reads "Onorariu Topograf" for imobiliare services (set in
-- lib/oblio/ensure-invoice.ts based on category). base_price stays > fee on all 14.

UPDATE services SET lawyer_fee_ron = 15, updated_at = now()
WHERE category = 'imobiliare'
  AND slug IN (
    'certificat-sarcini', 'copie-carte-funciara', 'copie-plan-cadastral',
    'copie-inventar-coordonate', 'copie-intabulare', 'copie-releveu',
    'copie-arhiva-ocpi', 'copie-contract-vanzare', 'plan-amplasament-delimitare',
    'copie-plan-incadrare', 'extras-cf-colectiv', 'actualizare-adresa-cf',
    'identificare-imobile-proprietar', 'certificat-detineri-imobile'
  );

NOTIFY pgrst, 'reload schema';
