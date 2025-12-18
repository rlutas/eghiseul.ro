-- =============================================
-- Migration: 005_seo_meta_tags
-- Description: Update SEO meta tags for cazier fiscal
-- Date: 2025-12-17
-- =============================================

-- Update Cazier Fiscal with SEO-optimized content
UPDATE services
SET
  meta_title = 'Cazier Fiscal Online - Obținere Rapid și Ușor | eGhiseul.ro',
  meta_description = 'Obțineți Cazier Fiscal Online în 5 zile, fără deplasări. Completezi formular, noi ne ocupăm de ANAF. 250 RON. Plată sigură prin Stripe. 4.9/5 rating.',
  description = 'Serviciu de obținere Cazier Fiscal Online de la ANAF - document oficial care atestă situația fiscală și lipsa datoriilor la bugetul de stat. Completezi formularul online cu datele personale, încarci act identitate + selfie KYC, plătești securizat prin Stripe. Primești Cazierul Fiscal pe email + curier în 5 zile lucrătoare. Valid 30 zile. Include opțiuni de traducere autorizată în 8 limbi și apostilă pentru uz internațional. Peste 33,000 comenzi procesate cu rating 4.9/5 pe Google.',
  updated_at = NOW()
WHERE slug = 'cazier-fiscal';

-- Update Extras Carte Funciara with SEO content
UPDATE services
SET
  meta_title = 'Extras Carte Funciară Online - Obținere Rapidă | eGhiseul.ro',
  meta_description = 'Extras Carte Funciară Online în 5 zile de la OCPI. Document complet cu proprietar, suprafață, sarcini. 79.99 RON. Fără deplasări la ghișeu.',
  description = 'Serviciu de obținere Extras Carte Funciară (CF) online de la OCPI. Documentul conține toate informațiile despre un imobil: proprietar actual, suprafață, sarcini și ipoteci. Completezi formularul cu numărul cadastral, încarci documentele necesare, plătești online. Primești extrasul CF pe email în 5 zile lucrătoare. Necesar pentru tranzacții imobiliare, credite ipotecare, verificare proprietăți.',
  updated_at = NOW()
WHERE slug = 'extras-carte-funciara';

-- Update Certificat Constatator with SEO content
UPDATE services
SET
  meta_title = 'Certificat Constatator ONRC Online - Obținere Rapidă | eGhiseul.ro',
  meta_description = 'Certificat Constatator Online în 5 zile de la ONRC. Date actuale firmă din Registrul Comerțului. 119.99 RON. 100% online, fără deplasări.',
  description = 'Serviciu de obținere Certificat Constatator online de la ONRC (Oficiul Național al Registrului Comerțului). Documentul confirmă datele actuale ale unei societăți comerciale: denumire, sediu, asociați, administratori, capital social, obiect de activitate. Necesar pentru licitații, parteneriate, verificări due diligence. Livrare pe email în 5 zile lucrătoare.',
  updated_at = NOW()
WHERE slug = 'certificat-constatator';
