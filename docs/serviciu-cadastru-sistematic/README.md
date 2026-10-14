# Cadastrul sistematic și numerotarea cărților funciare: ce am aflat și ce putem face

**Stare:** serviciul de rectificare e **respins** (14.10.2026, răspunsul lui Mircea): rectificările din afișarea publică le face doar firma sau topograful care are contractul de cadastru sistematic pentru acea comună, nu un topograf din afară. Rămân ideile 2 și 3, ambele mici.

## De ce contează satul la extrasul CF

Pornit de la o comandă greșită: clientul a ales comuna Drajna (PH), imobilul era în satul Podurile. Rezolvarea din formular e în [changelog 14.10.2026](../changelog/2026-10-14-extras-cf-sat-separat.md).

- **Cartea funciară electronică se numerotează pe UAT** (comună / oraș), nu pe sat: „Cărțile funciare se numerotează pe fiecare unitate administrativ-teritorială” (Regulamentul aprobat prin Ordinul ANCPI 700/2014, art. 8 alin. 3; regula e păstrată de Ordinul 600/2023). Un număr electronic nu se repetă în aceeași comună.
- **La imobilele înregistrate nou, numărul cadastral e același cu numărul CF.** Clientul care le încurcă nu greșește la ele.
- **Cărțile vechi, pe hârtie, erau numerotate pe sate** în zona Decretului-lege 115/1938 (Ardeal, Banat, Bucovina): „Dacă o comună este alcătuită din mai multe sate, cărțile funciare se vor numerota pe sate” (art. 2). Deci „CF vechi 123” poate exista și în Odoreu, și în Mărtinești, ambele în comuna Odoreu.
- La conversia în format electronic, imobilul primește un **număr nou**. Pe extras, numărul vechi apare la „Nr. CF vechi”, iar antetul „Carte Funciară Nr.” e numărul nou.
- **Portalul ANCPI (ePay) cere doar județ, UAT și un număr.** Nu are câmp de sat. Când numărul e vechi, întoarce mai multe imobile; satul, strada și numele proprietarului îl ajută pe topograf să-l aleagă pe cel corect.

Surse: Regulamentul 700/2014 (text consolidat: https://ocpitimis.ro/docs/legislatie/regulament_2014.pdf); Decretul-lege 115/1938, art. 2 (https://notari.pro/decret-115-1938-unificarea-dispozitiilor-cartilor-funciare/art-2-dispozitiuni-generale).

## Lista de sate din formular

Sugestiile din câmpul „Sat” vin din nomenclatorul SIRUTA al INS (ediția 2026, data.gov.ro, licență CC BY 4.0): https://data.gov.ro/dataset/siruta_s1-2026. Acoperă 3.177 din 3.185 de UAT-uri ANCPI (lipsesc sectoarele Bucureștiului, unde câmpul se completează singur cu „București”, și două comune cu nume scrise diferit). Lista se reface cu `scripts/build-sate-per-uat.py`.

## Ce e pnccf.site

Portalul ANCPI pentru **afișarea publică din cadastrul sistematic** (art. 11 din Legea 7/1996), lansat după avaria din august 2026: https://pnccf.site/ro/

- pe județ și comună: anunțul de afișare, planul cadastral, **opisul alfabetic al proprietarilor**, registrul cadastral, extrasele Anexa 18;
- perioada de afișare pe fiecare sector (exemplu: Aluniș, PH, sectoarele 6–7, 07.10–05.12.2026);
- hartă pe sectoare, peste imaginea din satelit;
- căutare după nume, număr cadastral sau ID de imobil.

În perioada de afișare (60 de zile), proprietarul poate cere **rectificarea** dacă apare greșit sau lipsește. După aceea se deschide CF nou cu datele afișate, iar corectura devine mult mai grea.

**Ce NU putem face:** termenii site-ului interzic extragerea, indexarea și republicarea datelor (https://pnccf.site/ro/termeni/), iar API public nu există. Deci fără tool care copiază datele lor și fără pagini generate pe fiecare comună.

## Ce putem face

1. ~~**Serviciu plătit „Verificare cadastru sistematic + cerere de rectificare”**, cu Mircea.~~ **Respins 14.10.2026.** Rectificarea o face executantul contractului de cadastru sistematic al comunei, în cadrul contractului; un topograf din afară nu are acces la lucrare. Ce poate face clientul singur: caută în opis pe pnccf.site și depune cererea la primărie sau la executant, în cele 60 de zile.
2. **„Ia-ți CF-ul nou după cadastrul sistematic”**: extras CF pe numărul nou, cu serviciile existente.
3. **Un singur ghid pe site** (acum ideea principală), cu link spre pnccf.site: „Comuna ta e în cadastru sistematic? Ce se schimbă cu numărul CF”. Fără pagini pe comune (vezi `.claude/rules/content-and-seo.md`).

Analiza tehnică a CF-urilor vechi pe partea de robot: `worker-ancpi/docs/cf-vechi-dezambiguizare.md` (repo separat).
