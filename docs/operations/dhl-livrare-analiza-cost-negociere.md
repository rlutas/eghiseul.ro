# DHL — analiză cost livrare internațională + negociere tarife

**Data:** 2026-07-21. **Status:** cerere de revizuire tarife TRIMISĂ către DHL Vânzări; așteptăm ofertă.

Sursă date: export MyBill DHL (facturi CSV, cont EDIGITALIZARE S.R.L.) analizat local
(`~/Downloads/DocumentDownload/*` → `~/Downloads/dhl-analiza-496-colete.csv`).

## Context
Contul DHL Express **EDIGITALIZARE S.R.L.** (nr. `410588114`, billing `1004682286`) +
**NETHUT DIGITAL S.R.L.** (`410777655`) e folosit de întreaga firmă. Aproape toate
expedierile = **cazier internațional** (documente 0,5 kg, EXPRESS WORLDWIDE doc/eu,
destinatari-persoane din diaspora). Taxăm clientul **250 RON flat** pt livrare DHL
internațională (fix, ambele platforme; `delivery-step.tsx` + CJO `config/addons.ts`).

## Cifre (496 colete, iul 2024 → iun 2026)
- Total plătit DHL: **95.082 RON** incl TVA (79.145 excl TVA, TVA recuperabil).
- Mediu/colet: **191,70 RON** incl (bază ~116 + fuel ~37 + TVA).
- Structura pe colet: **Weight Charge** (bază) + **INDICE COMBUSTIBIL** (fuel) +
  GOGREEN PLUS carbon (~1,35) + TVA 19%.

### Ce adaugă DHL (peste bază)
- **Suprataxă combustibil (INDICE COMBUSTIBIL)** = marele adaos. 18.510 RON în 2 ani,
  **32% peste bază în medie, urcat la ~47% din aprilie 2026**.
- GOGREEN carbon — nesemnificativ.

### S-a scumpit? DA — din fuel, nu din bază
Tariful de bază ~stabil (106→120, +13% în 2 ani). Fuel-ul: 24–31% până în 2026,
apoi **46–47% din aprilie 2026**. Cost/colet: 160 (2024) → **215–235 (2026 Q2)**.

### Marja (250 taxat vs cost real)
- **UE** (Germania 173, UK 180, Italia 184, Franța 170, NL 176): marjă OK ~60–90 RON.
- **PIERDEM** pe distanțe unde costul DHL > 250: Costa Rica −137, Andorra −125,
  Brazilia −116, Israel −87, China/Kazahstan/Argentina −30…−35, Turcia −8 etc.

## Ce am trimis către DHL (formular Vânzări, 2026-07-21)
Canal: `mydhl.express.dhl/ro/en/forms/sales.html` (formular Vânzări).
Cerere: revizuire ofertă pe baza volumului (~25–30 colete/lună, ~500/24 luni,
~95k RON), reclamând saltul fuel 27%→47%. **Cereri concrete:**
1. tarif de bază preferențial pe volum;
2. **plafonare/reducere suprataxă combustibil** (pârghia principală);
3. discount de volum;
4. account manager dedicat.
Menționat că evaluăm alternative (FedEx/UPS) dacă nu primim ofertă competitivă.

## Ce așteptăm de la ei
- Răspuns de la un agent de **Vânzări** DHL Express RO cu o **propunere de tarif**
  (ofertă de cont/contract), ideal cu fuel plafonat.
- Dacă NU vine ofertă bună → cerem alternative (FedEx / UPS / Poșta EMS) și
  comparăm; escaladare la Top Management DHL (formular dedicat) dacă e cazul.

## Canale de contact DHL (găsite)
- **Vânzări (negociere):** formular `/ro/en/forms/sales.html`.
- **Telefon Serviciu Clienți (tarife/servicii):** `021 222 1 777`.
- WhatsApp (bot): `+40 724 328 367`. Chat MyDHL+ = bot, NU negociază (rutează la telefon).
- Facturare (doar admin facturi): `ro_ebilling@dhl.com`. General: `ro_customerservice@dhl.com`.
- Escaladare: „Mesaje către Top Management" (Country Managing Director, Bogdan Constantin Enache).

## Acțiuni interne (deschise)
1. **Pricing pe zone:** tarif livrare 250 pt UE, mai mult (350–400) pt non-UE/worldwide —
   altfel subvenționăm coletele scumpe din marja cazierului.
2. **Tagging curier în DB incomplet:** doar 12 din ~496 colete DHL sunt marcate `dhl`
   (eghiseul `courier_provider`, CJO `awb_courier`). Fără AWB nu se izolează costul
   livrare per comandă în admin — de curățat dacă vrem reconciliere per comandă.
