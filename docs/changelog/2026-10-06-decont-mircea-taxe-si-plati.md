# 06.10.2026 — Decontul cu topograful: taxele care urmează și plățile, vizibile în portal
<!-- categorie: clienti -->

## Pentru echipă

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
