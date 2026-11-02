-- „Extras Carte Funciară" → „Extras de Carte Funciară Individuală".
--
-- Cerere echipă din Ghid (08.10.2026). Alături de „Extras de Carte Funciară
-- Colectivă" numele scurt nu spunea care e care — exact confuzia din disputa
-- bancară de la CF colectivă (client care a primit alt document decât voia).
-- Schimbă ce vede clientul în wizard, emailuri și factură; slug-ul, URL-urile
-- și textele SEO rămân neschimbate.

UPDATE services
SET name = 'Extras de Carte Funciară Individuală',
    updated_at = now()
WHERE slug = 'extras-carte-funciara'
  AND name = 'Extras Carte Funciară';
