-- 153: Onorariu avocat 15 RON pe cazier-auto.
--
-- Cazierul auto (fișa de evidență a conducătorului auto) se ridică de avocată
-- pe baza împuternicirii — e în `LAWYER_SERVICE_SLUGS`, primește contract de
-- asistență + număr de Barou, și e deja în lista decontului lunar
-- (`avocat-decont.ts`, CAZIER_SLUGS, 15 RON/comandă). Singurul loc unde nu
-- apărea era FACTURA: `services.lawyer_fee_ron = 0` înseamnă că
-- `computeLawyerFee` nu decupează linia „Onorariu Avocat" din prețul
-- serviciului, deci facturile de cazier auto ieșeau cu o singură linie, spre
-- deosebire de toate celelalte servicii prin avocat (raport Raul, 09.09.2026).
--
-- Totalul comenzii NU se schimbă: onorariul se decupează din cele 198 RON, nu
-- se adaugă peste. Facturile deja emise rămân cum sunt.

UPDATE services
SET lawyer_fee_ron = 15
WHERE slug = 'cazier-auto';

NOTIFY pgrst, 'reload schema';
