# 2026-08-05 — Termene stare civilă realiniate la realitate: 15-30 zile lucrătoare (București 30-45)

## Context

Echipa: comenzile de stare civilă depuse pe 22.06 / 06.07 / 08.07 n-au venit nici după depășirea termenului promis (~8 comenzi expirate în admin). Tier-urile vechi (default 7-15, București 15-30) promiteau termene pe care oficiile nu le țin. Cerere: 15-30 zile lucrătoare, „chiar și mai mult pt București".

## Valori noi (vechi → nou)

| Tier | Vechi | Nou |
|---|---|---|
| default (majoritatea județelor) | 7-15 zile lucrătoare | **15-30 zile lucrătoare** |
| slow (București, orice sector) | 15-30 zile lucrătoare | **30-45 zile lucrătoare** |
| fast (Satu Mare) | 5-7 zile lucrătoare | neschimbat |

## Unde s-a schimbat (toate cele 3 surse)

1. **Config live** `admin_settings.civil_status_term_tiers` (sursa wizardului + calculului de termen) — PATCH prin REST. Editabil în continuare din /admin/settings → tab-ul termene stare civilă.
2. **Fallback cod**: `src/lib/civil-status/delivery-terms.ts` (`DEFAULT_CIVIL_TERM_TIERS`) + copia din `src/app/admin/settings/page.tsx`.
3. **Paginile serviciilor** (5 servicii): `services.processing_config.estimated_days_display` → „15-30 zile lucrătoare" + `estimated_days` flat 10 → 30 (fallback-ul fără registrationPlace).

## Backfill comenzi active (8, aplicat prin REST cu datele calculate de scriptul oficial)

`scripts/backfill-estimates-2026-07-22.ts` (dry-run) a recalculat cu tier-urile noi din `paid_at`; aplicate manual DOAR cele 8 de stare civilă:

4XB2R→09.09, P4W2X→03.09, Z77WC→08.09, GJ54C→19.08, TFVDH→17.09, VTQJQ→24.08, E7ZT4→14.09, M9KCQ→03.09.

**Excluse intenționat:** `WP-199959` (import WP, fără registrationPlace — nu se poate calcula) și `E-260803-4RHJY` (cazier PJ care s-ar fi SCURTAT cu 2 zile din alt motiv — promisiunea făcută nu se atinge).

## Completare (aceeași zi): act transcris din străinătate → tier slow

Cazul semnalat de echipă: naștere în Moldova + transcriere → cererea merge prin București → 30-45, nu 15-30. Wizardul colecta deja `bornAbroad`/`marriageAbroad` (fără transcriere nici nu putem obține actul); acum `resolveCivilTermTier(place, tiers, actFromAbroad)` forțează tier-ul slow când actul original e din străinătate, indiferent de oficiul transcrierii — aplicat în wizard (CivilStatusStep + price-sidebar) și la persistare (`order-estimate.ts`, helper `extractCivilActFromAbroad`). O comandă activă afectată: `E-260720-M9KCQ` (căsătorie transcrisă, Sibiu) → termen extins 03.09→24.09.

## Notă

Clienții comenzilor deja expirate văd acum noul termen pe pagina de status — dar au primit promisiunea veche la checkout; de apreciat un email de informare de la echipă pentru cele 3-4 cele mai vechi (GJ54C plătită 08.07, VTQJQ 13.07).
