# Location SEO Engine — Implementation Plan (multi-serviciu)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construiește un singur engine reutilizabil de pagini pe locație (`/servicii/{serviciu}/{locatie}`) care captează long-tail-ul local organic pe serviciile unde există intenție locală REALĂ + o instituție locală reală — fără a cădea în „doorway / thin content".

**Architecture:** O rută dinamică per serviciu eligibil, condusă de un singur registru de date-locale (`src/lib/seo/locations/`). Datele instituționale reale per locație (IPJ / SPCRPCIV / OCPI — adresă, program, telefon, termene curier) sunt sursa de unicitate care face fiecare pagină non-thin. Reutilizează infrastructura SEO existentă (`buildPageMetadata`, `serviceNode`, `breadcrumbNode`, sitemap cu sloturi). Schema per pagină = `Organization` + `Service` + `FAQPage` (NU `LocalBusiness` — nu avem birou fizic per oraș).

**Tech Stack:** Next.js App Router (`generateStaticParams`, `generateMetadata`), TypeScript strict, `src/lib/seo/*`, sitemap dinamic, schema JSON-LD inline.

---

## 0. Baza de dovezi (de ce facem exact asta)

Două cercetări (2026-06-19), una pe best-practices programmatic SEO post-2024, una pe cererea locală RO reală (pe **GSC-ul nostru** + scan competitori). Concluzii operative:

1. **Programmatic location SEO funcționează în 2025–2026** DOAR dacă fiecare pagină are date locale reale + utilitate. Martie 2024 Google a deindexat în masă paginile „doorway" (837 site-uri, ~20.7M vizite/lună). Trigger-ul de penalizare (cuvintele Google): *„pages targeted at specific regions or cities that funnel users to one page"*.
2. **Testul decisiv (anti-doorway):** dacă schimbi numele localității și pagina sună identic → e doorway. Apărarea = date instituționale reale per locație.
3. **Schema:** ❌ NU `LocalBusiness` per oraș (nu avem adresă fizică → semnal fals prins de clasificator). ✅ `Organization` + `Service` + `FAQPage`.
4. **Cadență:** NU bulk. Batch 10–20 → validezi indexare >60% în GSC → scalezi în clustere. „40 pagini bune bat 150 subțiri."
5. **Cerere locală RO, pe servicii (din GSC-ul nostru + SERP live):**
   - Cazier judiciar/auto → intenție locală reală, competitori care rankează. ✅
   - Carte funciară → instituție locală reală (OCPI/BCPI per județ) + ecosistem de competitori care rankează cu pagini **subțiri** (extrase.ro ~3.500 pagini, cfunciara.ro, funciara.com, efunciara.ro) → whitespace de calitate. ✅
   - Stare civilă (naștere/căsătorie/celibat) → SERP-uri pe „{oraș}" deținute de primării (intenție gratis/navigațională) → **nu matrice pe orașe**. DAR Semrush 2026-06-19 arată cluster topical mare la KD mic (naștere = 27.670 vol, KD 11%) → **da, cluster topical pe sub-intenții** (duplicat/pierdut/acte/schimbare), nu pe locație. ✅ (cluster) / ❌ (matrice orașe)
   - Certificat constatator (ONRC) → fără instituție locală relevantă, intenție națională. ❌ pe orașe; ✅ segmentare pe **caz de utilizare**.
   - Cazier fiscal → ANAF online, fără ghișeu local. ❌

Research brut (transcripts) nu se commit-uie; sinteza e aici. Date primare: `docs/seo/gsc-data/`.

---

## 1. Decizia de scope (livrabilul-cheie)

| Serviciu | Pagini pe locație? | Granularitate | Ancora reală per locație | Prioritate |
|---|---|---|---|---|
| **Cazier judiciar** | ✅ DA | oraș (+ sectoare Buc.) | IPJ județean: adresă, program, tel | **P1** (dovedit) |
| **Cazier auto** | ✅ DA | oraș/județ | SPCRPCIV/Permise județean | **P2** |
| **Extras carte funciară** | ✅ DA | **județ** (42) întâi | OCPI/BCPI: adresă, program, BCPI-uri teritoriale | **P2** (cel mai bun whitespace) |
| **Naștere / căsătorie / celibat** | ✅ DA — **cluster topical**, NU matrice orașe | sub-intenții + sectoare consolidat | sub-intenția, nu locația | **P2** (KD ~11%, vol mare) |
| Certificat constatator (ONRC) | ❌ NU pe orașe | — | inexistentă | ✅ segmentare pe **caz** (`-pentru-banca/-credit/-licitatie/-srl`) |
| Cazier fiscal | ❌ NU | — | inexistentă | hub + ghiduri |
| Integritate | ❌ NU | — | volum mic | hub + 1 ghid |

**Răspuns explicit la întrebarea „facem și la naștere/căsătorie/celibat?":** DA — dar **NU matrice pe orașe** (SERP-urile pe „{certificat} {oraș}" sunt ale primăriilor). În schimb, **cluster topical** pe sub-intenții, justificat de Semrush 2026-06-19: cluster naștere = **27.670 vol/lună la KD mediu 11%** (foarte ușor de rankat). Vezi `docs/seo/keywords/certificat-nastere/keywords.md`. Pagini țintă:
- **Hub** întărit (`certificat de nastere` 1.900, `eliberare...` 480).
- **Duplicat online** (sub-cluster 4.080 vol, KD 10) — pagină dedicată + model cerere.
- **Certificat pierdut** (2.130 vol, KD 10) — pagină dedicată (acte, termen, „pierdut + buletin").
- **Acte necesare** (incl. nou-născut, 710 vol) + **schimbare certificat vechi** (480, KD 10).
- **Sectoare București + orașe cu volum** (Iași/Galați/Constanța) — tratate **consolidat** (tabel program/sector), NU o pagină per locație.
- Replicăm tiparul pe **căsătorie** și **celibat** după ce primim export-urile lor (folder `docs/seo/keywords/`).
Acest cluster aduce exact câștigul de **organic + internal linking** dorit, fără risc de doorway. (Diaspora-country pages rămân o extensie ulterioară opțională.)

**Non-goals (YAGNI):** fără embed costisitor de hărți pe toate paginile, fără sectoare/comune în prima fază, fără `LocalBusiness`, fără generare AI de body „la scară".

---

## 2. Arhitectura engine-ului

### 2.1 Structură URL
- Cazier judiciar: `/servicii/cazier-judiciar-online/{oras}` (ex. `/servicii/cazier-judiciar-online/cluj-napoca`)
- Cazier auto: `/servicii/cazier-auto-online/{oras}`
- Carte funciară: `/servicii/extras-de-carte-funciara/{judet}` (ex. `/servicii/extras-de-carte-funciara/cluj`)

Nested sub hub-ul existent → breadcrumb natural (`Acasă › Servicii › {Hub} › {Locație}`), moștenește autoritatea hub-ului, fără orfani.

### 2.2 Model de date (sursa de unicitate)
Un singur registru, tipat, reutilizat de toate rutele:

```
src/lib/seo/locations/
  types.ts            # CityData, CountyData, InstitutionOffice
  cities.ts           # orașe cazier judiciar/auto (IPJ + SPCRPCIV)
  counties.ts         # 42 județe pentru carte funciară (OCPI/BCPI)
  index.ts            # getCity(slug), getCounty(slug), allCitySlugs(), ...
```

`InstitutionOffice`: `{ name, address, postalCode, phone, schedule: Record<zi,ore>, website }`.
`CityData`: `{ slug, name, judet, judetAbbr, population?, ipj?: InstitutionOffice, spcrpciv?: InstitutionOffice, localFaq: FAQ[], nearbyCitySlugs: string[], localContext: string }`.
`CountyData`: `{ slug, name, ocpi: InstitutionOffice, bcpiOffices: InstitutionOffice[], localFaq, localContext }`.

Datele instituționale sunt **publice** (politiaromana.ro, ancpi.ro/ocpi) → de colectat manual/scrape, verificate. Acestea sunt apărarea anti-thin.

### 2.3 Schema JSON-LD (CORECȚIE vs site-ul soră)
Per pagină de locație: `Organization` (site-wide) + `Service` (oferta paginii, cu `areaServed: {@type: City|AdministrativeArea, name}`) + `FAQPage` (din `localFaq` reale) + `BreadcrumbList`. **Fără `LocalBusiness`.** Reutilizează `serviceNode()` / `breadcrumbNode()` din `src/lib/seo/schema.ts` (extinde `serviceNode` cu `areaServed` opțional).

### 2.4 Infra reutilizată (nu reconstrui)
- Metadata: `buildPageMetadata({ title, description, path })` din `src/lib/seo/metadata.ts`.
- Sitemap: adaugă o secțiune dedicată în `src/app/sitemap.ts`, sursă din registru (segmentată ca să diagnostichezi indexarea per-tip în GSC).
- Linking hub→spoke→hub: adaugă pe fiecare hub o secțiune „Orașe deservite" (nav reală, nu doar sitemap) + pe fiecare spoke linkuri către `nearbyCitySlugs` + înapoi la hub.

---

## 3. Contractul anti-thin-content (gate de build, obligatoriu)

O pagină de locație se publică DOAR dacă trece toate:
- [ ] **Test swap:** schimbi numele localității → pagina NU mai e validă (conține adresă/program/instituție reală specifică).
- [ ] ≥ 3–5 puncte de date reale specifice locației (birou + adresă + program + tel + context).
- [ ] ≥ ~300 cuvinte de conținut cu sens (țintă 2.500–3.500 ca în `CITY-PAGES-PLAN.md`, ~40% unic).
- [ ] FAQ local real (3–5 întrebări care chiar diferă de la oraș la oraș).
- [ ] Declară clar că serviciul e online/prin curier — **fără** a sugera birou fizic local.
- [ ] Dacă nu putem obține date locale reale pentru o locație → **NU o construim** (sau `noindex`).

Mecanic: o funcție `assertLocationPageQuality(data)` rulată în test care eșuează build-ul dacă o intrare din registru nu are câmpurile minime.

---

## 4. Rollout pe faze (cu porți de validare)

- **Faza 0 — Engine + cazier judiciar pilot.** ✅ LIVE (2026-06-20): engine (`src/lib/seo/locations/`) + 5 orașe cu date IPJ verificate — Cluj-Napoca, Timișoara, Iași, Constanța, Brașov. București exclus (n-are ghișeu unic → model dedicat ulterior). Build verificat, quality gate trece. URL: `/servicii/cazier-judiciar-online/{oras}`.
- **Poartă 1:** după 3–4 săptămâni în GSC — indexare >60%, impresii reale, „Crawled - not indexed" mic. Dacă pică → template prea subțire, repară înainte de scalare.
- **Faza 1 — scalare cazier judiciar** în clustere regionale (~10–15/săpt) până la ~40 orașe.
- **Faza 2 — cazier auto** (reutilizează engine, date SPCRPCIV), pilot 10 → scalare.
- **Faza 3 — carte funciară per-județ** (42), date OCPI/BCPI reale (bate extrase.ro/cfunciara.ro pe calitate). Pilot 8 județe mari → scalare.
- **Paralel (nu blochează engine-ul):** ONRC use-case pages + stare civilă diaspora — tracked în plan separat.

---

## 5. Taskuri de implementare (bite-sized, TDD unde are sens)

### Task 1: Tipuri + registru locații (schelet)
**Files:** Create `src/lib/seo/locations/types.ts`, `src/lib/seo/locations/index.ts`, `src/lib/seo/locations/cities.ts`; Test `src/lib/seo/locations/__tests__/locations.test.ts`.
- Step 1: Test care cere `getCity('cluj-napoca')` să întoarcă un obiect cu `ipj.address` ne-gol și `localFaq.length >= 3`.
- Step 2: Rulează testul → FAIL.
- Step 3: Definește tipurile + `index.ts` (getters) + 1 oraș real (Cluj) în `cities.ts`.
- Step 4: Testul trece.
- Step 5: Commit `feat(seo): location registry types + first city`.

### Task 2: Quality gate
**Files:** Create `src/lib/seo/locations/quality.ts`; Test alături.
- `assertLocationPageQuality(data)` → aruncă dacă lipsesc câmpuri minime (adresă, program, ≥3 FAQ, swap-test heuristic: `localContext` conține `data.name`).
- Test: o intrare validă trece, una fără adresă aruncă. Commit.

### Task 3: Extinde `serviceNode` cu `areaServed`
**Files:** Modify `src/lib/seo/schema.ts`.
- Step 1: Test că `serviceNode({..., areaServed:{type:'City',name:'Cluj-Napoca'}})` produce `areaServed` în JSON-LD și NU produce `LocalBusiness`.
- Step 2–4: implementează minimal, testul trece. Commit.

### Task 4: Componentă șablon de pagină locație
**Files:** Create `src/components/services/location-page.tsx` (primește `CityData` + config serviciu, randează hero + secțiuni shared + bloc instituție locală + FAQ local + cross-links + CTA + JSON-LD).
- Reutilizează componentele existente din paginile de serviciu (`ServiceFAQ`, `MobileStickyCTA`, `ReviewsSection`).
- Snapshot/test minimal că randează adresa IPJ și numele orașului în H1. Commit.

### Task 5: Ruta dinamică cazier judiciar
**Files:** Create `src/app/servicii/cazier-judiciar-online/[oras]/page.tsx`.
- `generateStaticParams` din `allCitySlugs()`; `generateMetadata` cu `buildPageMetadata` + title `Cazier Judiciar Online {Oraș} — …`; body din `LocationPage`. `notFound()` dacă slug necunoscut.
- Verifică `npm run build` generează paginile. Commit.

### Task 6: Sitemap + linking
**Files:** Modify `src/app/sitemap.ts` (secțiune `locationPages` din registru), `src/lib/seo/constants.ts` (slug-uri locație), hub `cazier-judiciar-online/page.tsx` (secțiune „Orașe deservite").
- Test că sitemap include `/servicii/cazier-judiciar-online/cluj-napoca/`. Commit.

### Task 7: Populează pilotul (10 orașe, date reale)
**Files:** Modify `cities.ts`.
- Adaugă cele 10 orașe cu date IPJ reale (manual, verificate). Rulează `assertLocationPageQuality` pe toate. `npm run build` + `tsc` + `lint` verzi. Commit.

### Task 8 (Faza 2): generalizează engine-ul pe servicii
- Parametru `serviceConfig` (slug hub, titlu, schema service name, ce câmp de birou folosește: `ipj`/`spcrpciv`/`ocpi`). Adaugă ruta `[oras]` la cazier-auto și `[judet]` la carte funciară reutilizând `LocationPage`. (Detaliat la momentul fazei.)

---

## 6. Riscuri & mitigări
- **Doorway/thin penalty** → contractul §3 + cadența §4 (validare înainte de scalare).
- **Date instituționale greșite** (adrese/program) → afectează încrederea; verifică la colectare, pune `dateModified`, marchează sursă.
- **Indexare parțială** → normal; maximizează prin linking intern (fără orfani), sitemap segmentat, doar pagini de calitate.
- **Carte funciară — rute gratuite oficiale** (MyEterra/ROeID) comprimă willingness-to-pay → poziționează ca „rapid, fără cont/birou", nu concura pe preț cu „gratis".

## 7. Relația cu docs existente
- Înlocuiește/ridică `docs/seo/CITY-PAGES-PLAN.md` (cazier-only, 2026-05-20) la engine multi-serviciu. Conținutul per-city de acolo (tabelul de elemente diferențiate) rămâne sursa pentru body-ul cazier.
- `docs/seo/competitor-analysis-extras-carte-funciara.md` = input pentru Faza 3.
- La final de fiecare fază: update `docs/DEVELOPMENT_MASTER_PLAN.md` + `docs/seo/INDEX.md`.
