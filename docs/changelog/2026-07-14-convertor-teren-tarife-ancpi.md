# 2026-07-14 — Convertor unități vechi de teren + Tarife oficiale ANCPI + căutare calculatoare

Pachet „CF veche": oamenii care găsesc jugări/stânjeni în cărți funciare vechi sau acte de moștenire = exact publicul serviciilor CF (extras, identificare, copie CF veche).

## 1. Calculator: Convertor jugăr & stânjen în mp (`/calculator/jugar-stanjen-in-mp/`)

- **Widget bidirecțional**: unitate veche → mp/ari/ha ȘI mp → toate unitățile vechi.
- **Valori** (sursă unică `src/components/calculators/unitati-teren-data.ts`): jugăr cadastral 5.754,64 mp (1.600 stânjeni² vienezi), jugăr unguresc 4.316, jugăr mic secuiesc 3.596, stânjen² vienez 3,5957 / Șerban Vodă 3,867 / moldovenesc 4,9729, falce 14.321,9, prăjină fălcească 179,02, pogon 5.011,79, ar, hectar.
- Conținut SEO: de ce diferă unitățile pe regiuni (Transilvania/Moldova/Muntenia), clarificare **NU există „jugăr moldovenesc"** (echivalentul = falcea), tabel complet, 10 FAQ-uri, secțiune „unde mai întâlnești azi aceste unități" (CF vechi Decret-lege 115/1938, moșteniri).
- **Upsell**: box + „Documente utile" (RELATED_BY_SLUG în calculator-layout) → extras CF, identificare imobil, copie CF.
- Înregistrat în: nav calculatoare (grupa Fiscal), DESC index, sitemap (HARDCODED_CALCULATOR_SLUGS).
- Construit de agent AI, verificat: tsc/eslint clean, matematică spot-check, pagina 200.

## 2. Căutare live pe /calculator

- 38 de calculatoare — indexul are acum **search bar** ca pe `/servicii`: căutare fără diacritice (normalizeText din service-search), match pe nume + descriere + categorie, sticky pe mobil.
- Fără căutare: gruparea SEO pe categorii rămâne. Cu căutare: grilă plată + număr rezultate + empty state cu reset.
- Refactor: listarea + DESC mutate din `calculator/page.tsx` în `src/components/calculators/calculators-directory.tsx` ('use client'); pagina rămâne server shell subțire (53 linii).

## 3. Tarife oficiale ANCPI în platformă (admin + colaborator)

Sursa: **Ordin ANCPI 16/2019** consolidat 26.07.2024 (citit din PDF integral). Date în `src/lib/ancpi/tarife-oficiale.ts` (sursă unică), tabel partajat `TarifeAncpiTable`.

- **`/admin/tarife-ancpi`** (nav „Tarife ANCPI", permisiune orders.view) — pentru echipă.
- **`/colaborator/tarife`** (nav portal colaborator) — pentru Mircea: taxele de stat exacte pe fiecare lucrare.
- Grupe: informare (extras 20/25, copie CF 25, copii arhivă 25/dosar, certificat sarcini 100, identificare după proprietar 10 etc.), **actualizare** (2.6.3 = 75 lei — include schimbarea adresei; gratuit din inițiativa primăriei), primă înregistrare, dezlipire/alipire, intabulare (0,5% PJ / 0,15% PF), rectificare (gratuite), regiunile Decret 115/1938.
- **Regula urgenței (Art. 4)** afișată explicit: supliment 4× tariful normal (total = 5×), plafon supliment 5.000 lei/serviciu, termen 1/3; excepții Nota 21/22 — extras CF electronic + extras plan cadastral cu geometrie = instant, FĂRĂ urgență (urgența contează fix la CF-urile vechi nedigitalizate).

## Fișiere

Noi: `src/app/calculator/jugar-stanjen-in-mp/page.tsx`, `src/components/calculators/{unitati-teren-calculator,unitati-teren-data,calculators-directory}.tsx`, `src/lib/ancpi/tarife-oficiale.ts`, `src/components/admin/tarife-ancpi-table.tsx`, `src/app/admin/tarife-ancpi/page.tsx`, `src/app/colaborator/tarife/page.tsx`.
Modificate: `calculator/page.tsx` (refactor thin shell), `calculators-nav.ts`, `calculator-layout.tsx` (related services), `seo/constants.ts` (sitemap), `admin/layout.tsx` + `colaborator/layout.tsx` (nav).

## 4. Serviciu nou: Certificat de Urbanism pentru Informare (completare aceeași zi)

- **Migrarea 116** (rulată): slug `certificat-urbanism-informare`, 780 lei, imobiliare, 30 zile (termen legal primărie), fără KYC, PropertyDataStep cu `identificationService.enabled` (comandă validă doar cu adresa; CF opțional). Paritate cu cfunciara.ro.
- Pagină prin ruta dinamică `/servicii/certificat-urbanism-informare/` + wizard `/comanda/...` — ambele verificate 200; sitemap îl preia automat din DB.
- Link-ul „Documente utile" de la calculatorul credit ipotecar mutat de pe cfunciara.ro pe pagina noastră internă.
- De făcut: pagină SEO dedicată (design CF template), preț de confirmat cu echipa, cine îl procesează (echipă vs colaborator).

## Next (backlog discutat)

- Articol „Cartea funciară veche: jugări, stânjeni, nr. topografic — ce faci cu ea" + interlinking convertor ↔ articol ↔ servicii.
- Confirmare prețuri proprii pe serviciile de copie (migrarea 084 = placeholder) înainte de push pe upsell.
