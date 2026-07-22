# Fix termene estimate: off-by-one + tier stare civilă (2026-07-22)

## Problema raportată

Termenele la documente nu se calculau corect pe toate cele 3 platforme
(eghiseul.ro, cazierjudiciaronline.com, ecazier.ro — ultimele două partajează
codebase-ul CJO).

## Bug 1 — off-by-one la proiectarea datelor (toate 3 platformele)

`calculateEstimatedCompletion` (eghiseul) / `calculateDeliveryEstimate` (CJO)
calculau corect ziua de start a procesării (`getProcessingStartISO`, cu cutoff
12:00 RO + skip weekend/sărbători), dar apoi adăugau N zile lucrătoare **după**
ziua de start — ziua de start nu era numărată ca prima zi. Rezultat: fiecare
dată promisă = N+1 zile lucrătoare în loc de N.

Cel mai urât caz (comandă reală `CJO-20260722-15508`): urgent „1-2 zile
lucrătoare" plătit miercuri 13:14 → termen afișat **luni** (3 zile lucrătoare):
cutoff-ul împinge startul pe joi, iar off-by-one-ul mai adaugă o zi.

**Fix**: `projectFromStart(n) = n <= 0 ? startIso : addBusinessDaysISO(startIso, n-1)`
în ambele calculatoare. Semantica `addBusinessDaysISO` (shift cu N zile DUPĂ o
dată) rămâne neschimbată — e corectă pentru shift-urile de standby.

- eghiseul: `src/lib/delivery-calculator.ts` (`calculateEstimatedCompletion`)
- CJO/ecazier: `src/lib/delivery-calculator.ts` (`calculateDeliveryEstimate`)

## Bug 2 — tier-ul stare civilă ignorat la persistare (doar eghiseul)

Serviciile de stare civilă (naștere / căsătorie / celibat / extras multilingv
naștere+căsătorie) au `services.estimated_days = 10` flat, dar wizard-ul
promite termen pe tier după oficiul de înregistrare
(`admin_settings.civil_status_term_tiers`): Satu Mare 5-7, default 7-15,
București 15-30 zile lucrătoare. `estimated_completion_date` se calcula din
flat 10 → pentru București data era cu săptămâni prea devreme (client vedea o
dată imposibilă; alertele de deadline din admin se declanșau fals).

**Fix**: nou `src/lib/orders/order-estimate.ts` —
`computeEstimatedCompletionISOForOrder()` detectează comenzile civil-status
prin `customer_data.civil_status.registrationPlace`, rezolvă tier-ul cu
`resolveCivilTermTier` (config live din `admin_settings`, fallback defaults) și
trece range-ul `{minDays, maxDays}` prin noul parametru `baseRange` al
calculatorului (câștigă peste `baseDays`). Add-on-urile de documente
(traducere/apostilă) se adaugă în continuare peste.

Call site-uri actualizate (toate locurile care scriu
`estimated_completion_date`): Stripe webhook, `/api/orders/[id]/submit`,
`/api/orders/[id]/confirm-payment`, `fulfil-paid.ts` (plăți manuale).

## Bug 3 — fallback legacy cu calcul propriu (doar eghiseul)

`/api/orders/[id]/route.ts` avea o funcție locală `addBusinessDays` (sărea
întâi pe ziua următoare, ignora sărbătorile) folosită ca fallback pentru
comenzile fără dată persistată. Înlocuită cu calculatorul partajat.

## Teste

- eghiseul: `tests/unit/lib/delivery-calculator.test.ts` — aserțiile de date
  corectate la semantica „ziua de start = ziua 1" + 3 teste de regresie
  (urgent după cutoff, serviciu 1 zi dimineața, total 0 zile);
  `tests/unit/lib/order-estimate.test.ts` nou (extractCivilRegistrationPlace,
  baseRange, rezolvare tier cu mock admin_settings). 1219 teste verzi.
- CJO: bloc nou de regresie pe date proiectate în
  `tests/unit/lib/delivery-calculator.test.ts`. 324 teste verzi.

## Backfill comenzi active

Scripturi one-off (rulate cu codul real prin tsx, dry-run apoi apply):

- eghiseul: `scripts/backfill-estimates-2026-07-22.ts` — **34/35 comenzi
  active actualizate** (simple −1 zi lucrătoare; stare civilă mutate mai
  târziu conform tier-ului, ex. naștere 23.07→29.07, celibat București
  31.07→27.08).
- CJO/ecazier: `scripts/backfill-estimates-2026-07-22.ts` — 10 comenzi active
  (inclusiv `CJO-20260722-15508` 27.07→24.07).

## Ce NU s-a schimbat

- Numărul de zile afișat („N-M zile lucrătoare") — doar datele calendaristice.
- Cutoff-ul 12:00 + skip weekend/sărbători.
- Semantica `addBusinessDaysISO` (shift) — folosită de standby.
- Comenzile terminale (completed/cancelled/refunded) — nu au fost backfill-uite.
