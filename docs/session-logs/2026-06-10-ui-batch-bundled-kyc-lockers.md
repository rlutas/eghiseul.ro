# Sesiune 2026-06-10 (8) — Batch UI: opțiuni bundled, KYC card, semnătură, lockere

**Status:** ✅ Aplicat (tsc/lint/build OK pe fiecare commit)

Răspuns la lista de feedback mobil. Punctele și ce s-a făcut:

## 1. Card serviciu secundar (Certificat Integritate) — aranjare mobil
`options-step.tsx` (`CrossServiceAddonCard`): titlu + badge „Secundar" pe un rând; „Vezi opțiuni pachet / Ascunde opțiuni" mutat pe **rândul lui jos**, separat cu o linie. (commit 7954831)

## 2. Dropdown țară/limbă pentru opțiunile bundled
Dacă clientul vrea apostilă + traducere DOAR pe serviciul secundar (nu pe cel principal), acum apar dropdown-urile de **țară (apostilă)** și **limbă (traducere)** sub fiecare opțiune bundled selectată. `toggleBundled` inițializează `metadata`; `patchBundledMetadata` o persistă. (commit 7954831)

## 3. Pas 4 KYC — card selfie + notă criptare (skill ui-ux-pro-max)
`KYCDocumentsStep.tsx`: iconița selfie `User` → `Camera` (mai potrivită); nota de securitate rescrisă ca un card verde calm cu `ShieldCheck` + „Datele tale sunt în siguranță…". (commit 34d5210)

## 4. Contract pas 5 — semnătură / consimțământ
Scos textul „✓ Bifat automat la semnare…" de sub checkbox-ul de termeni. (commit 7954831)
> Contractul fusese deja făcut compact pe mobil (sesiunea 2026-06-10 mobile-wizard-polish: `max-h-[300px]` + padding redus + reset indentare Word). Dacă tot pare lent, e render-ul DOCX→HTML pe server — optimizare separată (cache pe contract).

## 5. Zoom iOS la „Localitate" (livrare)
**Deja rezolvat** în commit b9a39c1 (`SearchableSelect` → `text-base sm:text-sm`). Localitatea folosește `SearchableSelect`, deci e acoperit — se vede după deploy. Dropdown-urile native țară/limbă din opțiuni au primit și ele fix-ul (commit 7954831).

## 6. Lockere se încarcă greu
`api/courier/pickup-points/route.ts`: adăugat `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`. Locker-ele se schimbă rar → doar PRIMA cerere per județ lovește API-ul lent al curierului; restul (orice user) vin instant din edge cache. (commit pending)
> Cold-start-ul rămâne (API curier aduce toate lockerele din județ) — server are deja cache 24h în memorie; acum și CDN-ul cachează cross-user.

## Verificare
Fiecare commit: `tsc --noEmit` 0, `eslint` 0 erori, `npm run build` OK.
