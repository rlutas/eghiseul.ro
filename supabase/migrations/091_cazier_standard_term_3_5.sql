-- 091_cazier_standard_term_3_5.sql
-- Widen the standard delivery term from "2-4 zile" to "3-5 zile" on the 5
-- services that offer the paid urgency add-on. With standard at 2-4 and urgent
-- at 1-2 the windows overlapped, so few customers bought urgency. 3-5 vs 1-2
-- creates a clear gap and makes the upsell worthwhile.
--
-- Only the urgency-bearing services change. cazier-fiscal and identificare-imobil
-- keep "2-4" (they have no urgency add-on). Urgent term (1-2) is unchanged.
--
-- Two fields per service stay in sync:
--   processing_config.estimated_days_display  → term text on the service page
--   estimated_days (numeric)                  → delivery-date calc in wizard sidebar
-- Editable afterwards from /admin/settings → Servicii → Edit.

UPDATE services
SET processing_config = jsonb_set(
      processing_config,
      '{estimated_days_display}',
      '"3-5 zile lucrătoare"'::jsonb,
      true
    ),
    estimated_days = 5,
    updated_at = now()
WHERE slug IN (
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'certificat-integritate'
);

NOTIFY pgrst, 'reload schema';
