# Design — Termen dinamic eliberare pe oficiul de stare civilă

**Data:** 2026-06-23
**Status:** în implementare

## Problemă

Termenul de eliberare la naștere/căsătorie/celibat depinde de oficiul de stare civilă (SPC) unde a fost înregistrat actul: București + sectoarele sunt lente (~15-30 zile), unele oficii sunt rapide (ex. Satu Mare, ~5-7 zile), restul ~7-15 zile. Acum afișăm un baseline static „7-15 zile". Câmpul `registrationPlace` din modulul civil-status e text liber → nu putem detecta fiabil oficiul.

`registrationPlace` e activat pe toate 3 serviciile civile (verificat în `verification_config.civilStatus.fields`) și e folosit DOAR în `CivilStatusStep` + type (sigur de convertit).

## Soluție

### 1. Date — `admin_settings` key `civil_status_term_tiers` (migrație 079)
```json
{
  "slow":    { "display": "15-30 zile lucrătoare", "minDays": 15, "maxDays": 30 },
  "fast":    { "display": "5-7 zile lucrătoare",   "minDays": 5,  "maxDays": 7, "counties": ["Satu Mare"] },
  "default": { "display": "7-15 zile lucrătoare",  "minDays": 7,  "maxDays": 15 }
}
```
- București + sectoare → **slow** (recunoscut structural: value începe cu „București"; NU e în lista editabilă).
- `fast.counties` → listă de județe rapide, **editabilă din admin**.
- restul → **default**.

### 2. Logică — `src/lib/civil-status/delivery-terms.ts`
- `DEFAULT_CIVIL_TERM_TIERS` (fallback dacă admin_settings lipsește).
- `resolveCivilTermTier(registrationPlace, tiers)` → `{ tier, display, minDays, maxDays }`.

### 3. Read public — `GET /api/civil-status-terms`
Server citește `admin_settings` via admin client (config ne-sensibil), fallback la defaults. Fără auth. `useCivilStatusTerms()` hook cu cache module-level (1 fetch/page-load).

### 4. Wizard — `CivilStatusStep`
`registrationPlace` text input → `<select>` cu județele (`COUNTIES` din `romania-counties.ts`), București expandat în 6 sectoare („București (Sectorul 1)" … „(Sectorul 6)"). Sub select, notă dinamică: „Termen estimat eliberare: {display}".

### 5. Price-sidebar — `price-sidebar-modular.tsx`
Pt serviciile civile (state.civilStatus prezent), `deliveryTimeText` din tier-ul oficiului selectat (override pe calculul numeric).

### 6. Admin — `/admin/settings`
Secțiune nouă „Termen stare civilă pe oficiu": editezi listă județe rapide + cele 3 string-uri display, salvate prin `PATCH /api/admin/settings` (key `civil_status_term_tiers`).

## Out of scope (v1)
- Per-sector București (toate sectoarele = slow, suficient pt termen).
- Localitatea exactă a oficiului (county-level e suficient operațional).
