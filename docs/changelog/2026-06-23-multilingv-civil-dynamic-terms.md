# 2026-06-23 — Extras multilingv add-on + termen dinamic stare civilă

Două features de paritate WPForms / acuratețe termene.

## Extras multilingv (add-on)
- Migrație 078: `service_option` `extras_multilingv` (399 lei, toggle) pe certificat-naștere + certificat-căsătorie.
- `options-step.tsx`: secțiune generică „Documente suplimentare" care randează orice opțiune activă ne-tratată de secțiunile dedicate (exclude urgența, lanțul apostilă, cross-service, auto-aplicate, ascunse). Previne pasul gol + randează automat opțiuni viitoare.

## Termen dinamic stare civilă pe oficiu

Termenul de eliberare la naștere/căsătorie/celibat variază după oficiul (SPC) de înregistrare. 3 tiers, lista de oficii rapide editabilă din admin.

- **Logică:** `src/lib/civil-status/delivery-terms.ts` — `resolveCivilTermTier(registrationPlace, tiers)`: București (orice sector) → slow (15-30), județ în lista fast → fast (5-7), rest → default (7-15). `CIVIL_REGISTRATION_OPTIONS` = județe (din `romania-counties.ts`) cu București expandat pe 6 sectoare.
- **Config:** `admin_settings.civil_status_term_tiers` (migrație 079). Editabil din admin.
- **Read public:** `GET /api/civil-status-terms` (fallback defaults). Hook `useCivilStatusTerms` cu cache module-level.
- **Wizard:** `CivilStatusStep` — câmpul `registrationPlace` (era text liber) → `<select>` structurat județ/sector + notă dinamică „Termen estimat: {display}".
- **Price-sidebar:** pt serviciile civile, `deliveryTimeText` din tier-ul oficiului ales (override pe calculul numeric).
- **Admin:** `/admin/settings` → tab „Termene stare civilă" — editezi cele 3 string-uri + lista de județe rapide (`PATCH /api/admin/settings`).

Design: `docs/plans/2026-06-23-civil-status-dynamic-terms-design.md`.

## Backlog închis
- ✅ Extras multilingv add-on (era backlog din auditul WPForms).
- ✅ Termen dinamic stare civilă pe oficiu.
