# 2026-07-02 — Termen standard cazier/integritate 2-4 → 3-5 zile (upsell urgență)

## Context
Colegii au observat că foarte puțini clienți aleg opțiunea **urgentă**. Cauza: termenul standard „2-4 zile" se suprapunea cu urgentul „1-2 zile" — gap prea mic, urgența nu părea utilă. Lărgim standardul la **3-5 zile** ca urgentul (1-2) să aibă o valoare clară.

## Scope (decizie user)
Doar cele **5 servicii cu urgență vizibilă**:
- `cazier-judiciar`, `cazier-judiciar-persoana-fizica`, `cazier-judiciar-persoana-juridica`
- `cazier-auto`
- `certificat-integritate`

**Neatinse:** `cazier-fiscal` (fără urgență) și `identificare-imobil` rămân „2-4 zile". Urgentul (1-2) nemodificat.

## Livrat

### DB — migrație 091
`091_cazier_standard_term_3_5.sql`: pe cele 5 servicii →
- `processing_config.estimated_days_display`: „2-4 zile lucrătoare" → „**3-5 zile lucrătoare**"
- `estimated_days` numeric: 3 → **5** (calc dată livrare în sidebar wizard; sub-promitem)

Editabil ulterior din /admin/settings → Servicii → Edit.

### Cod — conținut hardcodat (SEO)
`cazier-auto` și `integritate` sunt DB-driven (folosesc `formatEstimatedDays(service)`), deci acoperite de migrație. Dar **clusterul cazier-judiciar avea „2-4 zile" hardcodat** în meta/schema/FAQ/tabele/benefit-uri — actualizat manual:
- `src/app/servicii/cazier-judiciar-online/page.tsx` (14, incl. TITLE „în 3-5 Zile")
- `.../persoana-fizica/page.tsx` (6, incl. card urgent „1-2 în loc de 3-5")
- `.../persoana-juridica/page.tsx` (6)
- `.../[oras]/page.tsx` (1, meta description)
- `src/components/services/cazier-location-page.tsx` (5)
- `src/lib/seo/locations/cities.ts` (14 FAQ pe orașe)

**Păstrat intenționat:** adresele fizice „Str. Alexei Tolstoi nr. 2-4" (IPJ Bacău, cities.ts) — nu sunt termene de livrare.

Tabele comparative: `us: 3-5 vs them: 3-7/5-10`, `usWin` rămâne valid.

## Verificat
- DB: cele 5 → std „3-5", est_days=5, urgent „1-2".
- Pagini live (dev): cazier-judiciar/auto/integritate + `/bacau/` randează „3-5 zile", **0×** „2-4 zile"; adresa Bacău „nr. 2-4" păstrată.
- `tsc` + `eslint` clean.
