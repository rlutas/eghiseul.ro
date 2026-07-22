# Termen „pe pauză" pentru serviciile instant (ANCPI/ONRC) — 2026-07-22

## Problema (raportată de Raul)

Comanda de constatator `E-260722-L6E4R` afișa în admin „24.07 · în 2z" deși
documentul a fost eliberat automat în 13 minute. Serviciile instant
(auto-emise de workeri) primeau o dată calendaristică fără sens; mai grav, în
timpul outage-ului ANCPI toate extrasele CF plătite apăreau „expirat de Xz"
roșu în admin (zgomot fals), iar clientul vedea pe pagina de status o dată
care nu se putea respecta.

## Soluția

**Sursă unică**: `src/lib/services/platform-services.ts`

```
INSTANT_PLATFORM_SERVICES = {
  'extras-carte-funciara':  'ancpi',
  'extras-plan-cadastral':  'ancpi',
  'certificat-constatator': 'onrc',
}
```

Doar ANCPI + ONRC sunt urmărite (platformele pe care le automatizăm); restul
serviciilor își păstrează estimarea normală în zile lucrătoare. Semnalul de
outage = fereastra deschisă din `platform_outages` (aceeași sursă autoritară
ca badge-ul public „Stare sistem" — `getOpenOutages()`).

### Comportament nou

1. **Nu se mai stampează `estimated_completion_date`** la plată pentru cele 3
   servicii (`computeEstimatedCompletionISOForOrder` returnează null; toate
   cele 4 call site-uri trec slug-ul serviciului).
2. **Admin, lista comenzi** (`DeadlineCell`): în loc de dată —
   - outage deschis + comandă activă → badge chihlimbar „⏸ ANCPI din 14.07"
   - fără outage, comandă activă → „auto · min"
   - document livrat / comandă moartă → „—"
   API-ul de listă (`/api/admin/orders/list`) livrează `openOutages` în răspuns.
3. **Pagina client `/comanda/status`**: în loc de „Estimat: joi 24 iulie" —
   - outage → banner „Termen în așteptare: sistemele ANCPI sunt temporar
     indisponibile (din X). Comanda se eliberează automat, cu prioritate, la
     revenire." (`platformHold` în răspunsul API)
   - normal, pre-livrare → „Eliberare automată — de regulă în câteva minute"
   - datele legacy persistate pe comenzile instant sunt suprimate din răspuns.
4. **Sidebar wizard**: `isInstantDigital` folosește acum lib-ul partajat —
   extras-plan-cadastral a fost adăugat (arată „câteva minute (24/7)" + badge
   SystemStatus pe ANCPI, ca extrasul CF).

### Ce NU s-a schimbat

- Serviciile ne-instant NU au tratare de outage (decizie Raul: doar
  ANCPI/ONRC).
- Clientul vede outage-ul în continuare și pe formular la plasare
  (SystemStatus badge) — banner-ul de pe status page e complementar.
- Mecanismul standby (shift pe zile de pauză) — neatins.

## Backfill

`scripts/backfill-instant-null-2026-07-22.mjs` — setează null pe
`estimated_completion_date` la comenzile ACTIVE ale celor 3 servicii (curăță
„expirat"-urile false din admin). ⚠️ De rulat manual (clasificatorul a blocat
rularea automată).

## Teste

`tests/unit/lib/order-estimate.test.ts` — cele 3 slug-uri instant → estimare
null. Suite: 1222 teste verzi, tsc + lint curate.
