-- 189: cazier fiscal service description, factual fix (25.09.2026).
--
-- The description said the certificate proves "lipsa datoriilor la bugetul de
-- stat". It does not: OG 39/2015 records sanctioned fiscal/accounting/customs
-- offences, not debts (debts = certificat de atestare fiscală). It also paired
-- "document oficial" (banned wording, see Google Ads policy notes) and quoted
-- "33,000 comenzi ... 4.9/5", a figure with no current source.

UPDATE public.services
SET
  short_description = 'Certificat ANAF care arată dacă ai fapte fiscale sancționate înscrise. Valabil 30 de zile.',
  description = 'Serviciu de obținere a certificatului de cazier fiscal de la ANAF, online, fără cont SPV. '
    || 'Certificatul arată dacă titularul are fapte sancționate contravențional sau penal de legile fiscale, '
    || 'contabile sau vamale înscrise în evidența ANAF (OG 39/2015); datoriile la stat nu apar în el. '
    || 'Completezi formularul online, încarci actul de identitate și un selfie, plătești cu cardul. '
    || 'Primești certificatul pe email, cu opțiune de livrare prin curier. Valabil 30 de zile, numai în scopul '
    || 'pentru care a fost eliberat. Opțional: traducere autorizată și apostilă pentru uz internațional.',
  updated_at = now()
WHERE slug = 'cazier-fiscal';
