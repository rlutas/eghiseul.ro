# 06.10.2026 — Decontul cu topograful: taxele care urmează și plățile, vizibile în portal
<!-- categorie: clienti -->

## Pentru echipă

- **Comenzile lunii pe servicii:** tabel cu numărul de comenzi, câte sunt finalizate, încasat, taxe OCPI (și câte n-au taxă) și comisionul pe fiecare serviciu, cu total.
- **Factura de comision:** în plata lunii apare clar cât trebuie să factureze topograful (comenzile lunii cu comision × 15 lei, TVA inclus în sumă; ce s-a plătit în plus înainte se scade din transfer, nu din factură); în tabel, fiecare comandă are comisionul lui.
- **Decontul topografului e acum un extras pe luna trecută** (implicit septembrie, în portal și în admin), în trei casete: rezultatul lunii (încasat → TVA → taxe → Stripe → reclamă → profit → impozite → partea fiecăruia), plata pentru lună (partea lunii + corecția din lunile trecute = de plată, separat pe factura de comision și transfer, apoi ce s-a plătit și dacă e achitat), taxele OCPI care urmează. Cifrele cumulate care nu aveau sens pe o singură lună au dispărut.
- Decontul din portalul colaboratorului se deschide acum pe „Toată perioada”, cu tot calculul la vedere.
- **Taxe OCPI care urmează:** orice comandă plătită care n-are încă taxa trecută apare cu sumă estimată (portocaliu) și într-o casetă separată. Instituția nu eliberează gratuit, deci taxa se plătește chiar dacă dosarul se rezolvă luna viitoare.
- **Regula la identificări:** 20 lei dacă imobilul se identifică și se scoate direct extrasul CF, 100 lei dacă trebuie depusă cerere la OCPI.
- La planul de amplasament și la copia de inventar nu există încă nicio taxă trecută, așa că apar „de completat”. Topograful trebuie să le treacă pe comenzi.
- **Plăți către colaborator:** portalul arată fiecare decont plătit (transfer + factura de comision), cât a primit în total și cât mai are de primit, separat pe factură de comision (15 lei/comandă, TVA inclus) și transfer.
- Reclama de test pe imobiliare din septembrie (570 lei) e trecută la cheltuielile perioadei.

---

- `src/lib/collaborator/settlement.ts`: `estimateOrderOcpi` / `averageOcpiBySlug` / `pendingOcpiSummary`. Every paid order without a recorded ANCPI fee counts as pending (completed ones too); identification = `IDENTIFICATION_OCPI` 20/100 by status (`identification_pending_ocpi`, `on_hold_institution` = filed); other services use the average paid fee for the slug, `null` when there is none. Still informative, not deducted (cumulative rule from 07.09).
- `DISTRIBUTIONS[].collaboratorInvoicedRon` (635,25, SM 153 paid 07.09) → `COLLABORATOR_RECEIVED`, `COLLABORATOR_INVOICED`. Breakdown adds `projectedSharePerSide`, `collaboratorReceived`, `collaboratorToReceive`, `commissionToInvoice`, `collaboratorCashToReceive`.
- `GET /api/collaborator/earnings` returns `pendingOcpi`, `identificationOcpi`, `distributions` and `orders[].ocpiEstimate`. Portal `/colaborator/decont`: default month `all`; "Distribuit deja / De reglat" rows moved into the new "Plăți către tine" card (shown only for the whole period, where the cumulative numbers make sense).
- `/admin/colaboratori` breakdown shows the same new fields.
- Data: `collaborator_period_costs` row, 570 lei, Google Ads imobiliare, 2026-09.

Status at 06.10 (paid until 30.09, 199 orders): share per side 4.731,09; distributed 4.316,61; Raul 414,48; Mircea 304,23 (invoice 99,75 + transfer 204,48). 19 orders still without an OCPI fee (16 identifications ≈ 720 lei estimated, 3 with no baseline).

**Paid 06.10.2026** (Raul): recorded as the second `DISTRIBUTIONS` entry (per side 414,48; Mircea transfer 204,48 + commission invoice 99,75). After it the cumulative balance is 0; the ~720 lei of pending OCPI fees will show as an overpayment next month and come off the October settlement.

**Monthly statement (same day):** `src/lib/collaborator/statement.ts` (`buildMonthlyStatement`, Romanian-time months, `DISTRIBUTIONS[].forMonth`) + `src/components/collaborator/settlement-statement.tsx`, used by `/colaborator/decont` and `/admin/colaboratori` (both default to the previous month). Both routes now load all orders and filter the list by month, because the statement needs the earlier months. September: share 859,30, correction −444,82 → 414,48 each; Mircea 304,23 = invoice 99,75 + transfer 204,48; paid 06.10, settled.

**Commission invoice box (same day):** the payment card shows what the collaborator must invoice: the month's commission (orders with commission × 15 lei, VAT included), the correction for earlier invoices, and the amount to invoice. September: 12 × 15 = 180, minus 80,25 over-invoiced on SM 153 = 99,75. The portal order table has a "Comisionul tău" column.

**Correction (Raul, same day):** the invoice is always the month's full commission (September 12 × 15 = 180); excess paid earlier comes off the transfer. The 06.10 payout is recorded as invoice 180 + transfer 124,23 (= 304,23).

**Per-service table (same day):** `MonthlyStatement.byService` (orders, completed, collected, OCPI, orders without OCPI, commission) rendered under the statement in both views.

**Correction 2 (Raul, same day):** the 110,25 VAT on SM 153 is NOT an overpayment (VAT is deducted, the invoice cost 525 — see `docs/operations/decont-mircea-2026-09-07-regularizare.md`). `collaboratorInvoicedRon` for 26.08 = 525. September: both sides 414,48; Mircea = invoice 180 + transfer 234,48. The only deduction is the 444,82 August correction.
